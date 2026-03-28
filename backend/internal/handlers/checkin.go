package handlers

import (
        "time"

        "github.com/eventify/backend/internal/database"
        "github.com/eventify/backend/internal/middleware"
        "github.com/eventify/backend/internal/models"
        "github.com/eventify/backend/internal/utils"
        "github.com/gofiber/fiber/v2"
        "github.com/google/uuid"
        "gorm.io/gorm"
)

// CheckinRequest represents check-in request
type CheckinRequest struct {
        QRCode    string `json:"qr_code"`
        EventID   string `json:"event_id"`
        DeskNumber int    `json:"desk_number"`
}

// CheckinResponse represents check-in response
type CheckinResponse struct {
        Success    bool               `json:"success"`
        Message    string             `json:"message"`
        Participant *models.Participant `json:"participant,omitempty"`
        IsNew      bool               `json:"is_new"`
}

// Checkin handles participant check-in
func Checkin(c *fiber.Ctx) error {
        var req CheckinRequest
        if err := c.BodyParser(&req); err != nil {
                return utils.BadRequestResponse(c, "Invalid request body")
        }

        if req.QRCode == "" {
                return utils.BadRequestResponse(c, "QR code is required")
        }

        tenantID := middleware.GetTenantID(c)
        userID := middleware.GetUserID(c)

        // Find participant by QR code
        var participant models.Participant
        if err := database.DB.Where("qr_code = ?", req.QRCode).First(&participant).Error; err != nil {
                // Log failed scan
                if tenantID != "" {
                        tid, _ := uuid.Parse(tenantID)
                        var eventID *uuid.UUID
                        if req.EventID != "" {
                                eid, _ := uuid.Parse(req.EventID)
                                eventID = &eid
                        }
                        logScanLog(&tid, eventID, nil, "checkin", "failed", "QR not found")
                }
                return utils.NotFoundResponse(c, "Participant not found")
        }

        // Verify tenant access
        if tenantID != "" && participant.TenantID.String() != tenantID {
                return utils.NotFoundResponse(c, "Participant not found")
        }

        // Check if blacklisted
        if participant.IsBlacklisted {
                return utils.ErrorResponse(c, fiber.StatusForbidden, "Participant is blacklisted")
        }

        // Check if active
        if !participant.IsActive {
                return utils.ErrorResponse(c, fiber.StatusForbidden, "Participant is not active")
        }

        // Check if already checked in
        if participant.IsCheckedIn {
                // Get last check-in time
                var lastCheckin models.Checkin
                database.DB.Where("participant_id = ?", participant.ID).Order("checked_in_at DESC").First(&lastCheckin)

                return utils.SuccessResponse(c, fiber.Map{
                        "success":     false,
                        "message":     "Already checked in",
                        "participant": participant,
                        "is_new":      false,
                        "last_checkin": lastCheckin.CheckedInAt,
                })
        }

        // Verify event if specified
        if req.EventID != "" && participant.EventID.String() != req.EventID {
                return utils.BadRequestResponse(c, "Participant is not registered for this event")
        }

        // Get event for display queue
        var event models.Event
        database.DB.First(&event, "id = ?", participant.EventID)

        // Perform check-in
        now := time.Now()
        participant.IsCheckedIn = true
        participant.CheckedInAt = &now
        participant.CheckinCount++

        operatorID, _ := uuid.Parse(userID)
        deskNumber := req.DeskNumber
        if deskNumber == 0 {
                deskNumber = 1
        }

        checkin := models.Checkin{
                ID:           uuid.New(),
                EventID:      participant.EventID,
                ParticipantID: participant.ID,
                OperatorID:   &operatorID,
                DeskNumber:   deskNumber,
                CheckedInAt:  now,
        }

        // Start transaction
        tx := database.DB.Begin()

        // Update participant
        if err := tx.Save(&participant).Error; err != nil {
                tx.Rollback()
                return utils.InternalServerErrorResponse(c, "Failed to update participant")
        }

        // Create check-in record
        if err := tx.Create(&checkin).Error; err != nil {
                tx.Rollback()
                return utils.InternalServerErrorResponse(c, "Failed to create check-in record")
        }

        // Add to display queue
        displayQueue := models.DisplayQueue{
                ID:            uuid.New(),
                EventID:       participant.EventID,
                ParticipantID: &participant.ID,
                Name:          participant.Name,
                PhotoURL:      participant.AIPhotoURL,
                IsDisplayed:   false,
                CreatedAt:     now,
        }
        tx.Create(&displayQueue)

        // Deduct credit
        tenantUUID := participant.TenantID
        deductCredits(tx, tenantUUID, 1, "checkin", participant.ID, "Check-in: "+participant.Name)

        // Log scan
        logScanLog(&tenantUUID, &participant.EventID, &participant.ID, "checkin", "success", c.Get("User-Agent"))

        tx.Commit()

        return utils.SuccessResponse(c, fiber.Map{
                "success":     true,
                "message":     "Check-in successful",
                "participant": participant,
                "is_new":      true,
                "event":       event,
        })
}

// ManualCheckin handles manual check-in (by participant ID or email)
func ManualCheckin(c *fiber.Ctx) error {
        var req struct {
                EventID      string `json:"event_id"`
                ParticipantID string `json:"participant_id"`
                Email        string `json:"email"`
        }

        if err := c.BodyParser(&req); err != nil {
                return utils.BadRequestResponse(c, "Invalid request body")
        }

        if req.ParticipantID == "" && req.Email == "" {
                return utils.BadRequestResponse(c, "Participant ID or email is required")
        }

        tenantID := middleware.GetTenantID(c)
        userID := middleware.GetUserID(c)

        // Find participant
        var participant models.Participant
        query := database.DB.Where("event_id = ?", req.EventID)

        if req.ParticipantID != "" {
                query = query.Where("id = ?", req.ParticipantID)
        } else {
                query = query.Where("email = ?", req.Email)
        }

        if err := query.First(&participant).Error; err != nil {
                return utils.NotFoundResponse(c, "Participant not found")
        }

        // Verify tenant access
        if tenantID != "" && participant.TenantID.String() != tenantID {
                return utils.NotFoundResponse(c, "Participant not found")
        }

        // Check if already checked in
        if participant.IsCheckedIn {
                return utils.SuccessResponse(c, fiber.Map{
                        "success":     false,
                        "message":     "Already checked in",
                        "participant": participant,
                })
        }

        // Perform check-in
        now := time.Now()
        participant.IsCheckedIn = true
        participant.CheckedInAt = &now
        participant.CheckinCount++

        operatorID, _ := uuid.Parse(userID)

        checkin := models.Checkin{
                ID:           uuid.New(),
                EventID:      participant.EventID,
                ParticipantID: participant.ID,
                OperatorID:   &operatorID,
                DeskNumber:   1,
                CheckedInAt:  now,
        }

        tx := database.DB.Begin()
        tx.Save(&participant)
        tx.Create(&checkin)

        // Add to display queue
        displayQueue := models.DisplayQueue{
                ID:            uuid.New(),
                EventID:       participant.EventID,
                ParticipantID: &participant.ID,
                Name:          participant.Name,
                PhotoURL:      participant.AIPhotoURL,
                IsDisplayed:   false,
                CreatedAt:     now,
        }
        tx.Create(&displayQueue)

        // Deduct credit
        deductCredits(tx, participant.TenantID, 1, "checkin", participant.ID, "Check-in: "+participant.Name)

        // Log scan
        tenantUUID := participant.TenantID
        logScanLog(&tenantUUID, &participant.EventID, &participant.ID, "checkin", "success", "manual")

        tx.Commit()

        return utils.SuccessResponse(c, fiber.Map{
                "success":     true,
                "message":     "Check-in successful",
                "participant": participant,
        })
}

// UndoCheckin undoes a check-in
func UndoCheckin(c *fiber.Ctx) error {
        participantID := c.Params("id")
        tenantID := middleware.GetTenantID(c)

        var participant models.Participant
        if err := database.DB.First(&participant, "id = ?", participantID).Error; err != nil {
                return utils.NotFoundResponse(c, "Participant not found")
        }

        // Verify tenant access
        if tenantID != "" && participant.TenantID.String() != tenantID {
                return utils.ForbiddenResponse(c, "Access denied")
        }

        if !participant.IsCheckedIn {
                return utils.BadRequestResponse(c, "Participant is not checked in")
        }

        // Undo check-in
        participant.IsCheckedIn = false
        participant.CheckedInAt = nil

        tx := database.DB.Begin()
        tx.Save(&participant)

        // Delete check-in record
        tx.Where("participant_id = ?", participant.ID).Delete(&models.Checkin{})

        // Remove from display queue
        tx.Where("participant_id = ?", participant.ID).Delete(&models.DisplayQueue{})

        // Refund credit
        addCredits(tx, participant.TenantID, 1, "refund", participant.ID, "Undo check-in: "+participant.Name)

        tx.Commit()

        return utils.SuccessWithMessage(c, "Check-in undone successfully", participant)
}

// GetCheckinHistory returns check-in history for an event
func GetCheckinHistory(c *fiber.Ctx) error {
        eventID := c.Params("event_id")
        tenantID := middleware.GetTenantID(c)

        // Verify event belongs to tenant
        var event models.Event
        eventQuery := database.DB.Where("id = ?", eventID)
        if tenantID != "" {
                eventQuery = eventQuery.Where("tenant_id = ?", tenantID)
        }
        if err := eventQuery.First(&event).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        // Pagination
        page := c.QueryInt("page", 1)
        limit := c.QueryInt("limit", 50)
        offset := (page - 1) * limit

        var checkins []models.Checkin
        var total int64

        database.DB.Model(&models.Checkin{}).Where("event_id = ?", eventID).Count(&total)
        database.DB.Where("event_id = ?", eventID).Offset(offset).Limit(limit).Order("checked_in_at DESC").Find(&checkins)

        return utils.PaginatedResponse(c, checkins, total, page, limit)
}

// deductCredits deducts credits from tenant wallet
func deductCredits(tx *gorm.DB, tenantID uuid.UUID, amount int, referenceType string, referenceID uuid.UUID, description string) {
        var wallet models.CreditWallet
        if err := tx.Where("tenant_id = ?", tenantID).First(&wallet).Error; err != nil {
                return
        }

        // Deduct from bonus first, then main balance
        if wallet.BonusBalance >= amount {
                wallet.BonusBalance -= amount
        } else {
                remaining := amount - wallet.BonusBalance
                wallet.BonusBalance = 0
                wallet.Balance -= remaining
        }
        wallet.TotalUsed += amount
        wallet.UpdatedAt = time.Now()
        tx.Save(&wallet)

        // Create transaction record
        transaction := models.CreditTransaction{
                ID:            uuid.New(),
                TenantID:      tenantID,
                Type:          "usage",
                Amount:        -amount,
                ReferenceType: referenceType,
                ReferenceID:   referenceID.String(),
                Description:   description,
                CreatedAt:     time.Now(),
        }
        tx.Create(&transaction)
}

// addCredits adds credits to tenant wallet
func addCredits(tx *gorm.DB, tenantID uuid.UUID, amount int, referenceType string, referenceID uuid.UUID, description string) {
        var wallet models.CreditWallet
        if err := tx.Where("tenant_id = ?", tenantID).First(&wallet).Error; err != nil {
                return
        }

        wallet.Balance += amount
        wallet.TotalUsed -= amount
        wallet.UpdatedAt = time.Now()
        tx.Save(&wallet)

        // Create transaction record
        transaction := models.CreditTransaction{
                ID:            uuid.New(),
                TenantID:      tenantID,
                Type:          "refund",
                Amount:        amount,
                ReferenceType: referenceType,
                ReferenceID:   referenceID.String(),
                Description:   description,
                CreatedAt:     time.Now(),
        }
        tx.Create(&transaction)
}
