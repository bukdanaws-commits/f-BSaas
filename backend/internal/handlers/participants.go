package handlers

import (
        "encoding/csv"
        "encoding/json"
        "fmt"
        "io"
        "strings"
        "time"

        "github.com/eventify/backend/internal/database"
        "github.com/eventify/backend/internal/middleware"
        "github.com/eventify/backend/internal/models"
        "github.com/eventify/backend/internal/utils"
        "github.com/gofiber/fiber/v2"
        "github.com/google/uuid"
)

// CreateParticipantRequest represents participant creation request
type CreateParticipantRequest struct {
        Name           string `json:"name"`
        Email          string `json:"email"`
        Phone          string `json:"phone"`
        TicketTypeID   string `json:"ticket_type_id"`
        QRCode         string `json:"qr_code"`
        MaxFoodClaims  int    `json:"max_food_claims"`
        MaxDrinkClaims int    `json:"max_drink_claims"`
        Meta           string `json:"meta"` // JSON string
}

// GetParticipants returns all participants for an event
func GetParticipants(c *fiber.Ctx) error {
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

        var participants []models.Participant
        var total int64

        query := database.DB.Model(&models.Participant{}).Where("event_id = ?", eventID)

        // Search filter
        if search := c.Query("search"); search != "" {
                query = query.Where("name ILIKE ? OR email ILIKE ? OR qr_code ILIKE ?", 
                        "%"+search+"%", "%"+search+"%", "%"+search+"%")
        }

        // Check-in filter
        if checkedIn := c.Query("checked_in"); checkedIn != "" {
                if checkedIn == "true" {
                        query = query.Where("is_checked_in = ?", true)
                } else if checkedIn == "false" {
                        query = query.Where("is_checked_in = ?", false)
                }
        }

        // Count total
        query.Count(&total)

        // Get paginated results
        if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&participants).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to fetch participants")
        }

        return utils.PaginatedResponse(c, participants, total, page, limit)
}

// GetParticipant returns a single participant by ID
func GetParticipant(c *fiber.Ctx) error {
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

        return utils.SuccessResponse(c, participant)
}

// CreateParticipant creates a new participant
func CreateParticipant(c *fiber.Ctx) error {
        eventID := c.Params("event_id")
        tenantID := middleware.GetTenantID(c)
        userID := middleware.GetUserID(c)

        // Verify event belongs to tenant
        var event models.Event
        eventQuery := database.DB.Where("id = ?", eventID)
        if tenantID != "" {
                eventQuery = eventQuery.Where("tenant_id = ?", tenantID)
        }
        if err := eventQuery.First(&event).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        var req CreateParticipantRequest
        if err := c.BodyParser(&req); err != nil {
                return utils.BadRequestResponse(c, "Invalid request body")
        }

        // Validate required fields
        if req.Name == "" {
                return utils.BadRequestResponse(c, "Name is required")
        }
        if req.Email == "" {
                return utils.BadRequestResponse(c, "Email is required")
        }

        // Check for duplicate email in event
        var existingParticipant models.Participant
        if err := database.DB.Where("event_id = ? AND email = ?", eventID, req.Email).First(&existingParticipant).Error; err == nil {
                return utils.BadRequestResponse(c, "Participant with this email already exists")
        }

        // Generate QR code if not provided
        qrCode := req.QRCode
        if qrCode == "" {
                qrCode = generateQRCode()
        }

        // Check for duplicate QR code
        if err := database.DB.Where("qr_code = ?", qrCode).First(&existingParticipant).Error; err == nil {
                // Generate new QR code
                qrCode = generateQRCode()
        }

        // Set defaults
        if req.MaxFoodClaims == 0 {
                req.MaxFoodClaims = event.DefaultMaxFoodClaims
        }
        if req.MaxDrinkClaims == 0 {
                req.MaxDrinkClaims = event.DefaultMaxDrinkClaims
        }

        tenantUUID, _ := uuid.Parse(tenantID)
        eventUUID, _ := uuid.Parse(eventID)
        userUUID, _ := uuid.Parse(userID)

        var ticketTypeID *uuid.UUID
        if req.TicketTypeID != "" {
                tid, err := uuid.Parse(req.TicketTypeID)
                if err == nil {
                        ticketTypeID = &tid
                }
        }

        // Parse meta JSON
        var meta models.JSONB
        if req.Meta != "" {
                json.Unmarshal([]byte(req.Meta), &meta)
        }

        participant := models.Participant{
                ID:             uuid.New(),
                TenantID:       tenantUUID,
                EventID:        eventUUID,
                Name:           req.Name,
                Email:          req.Email,
                Phone:          req.Phone,
                TicketTypeID:   ticketTypeID,
                QRCode:         qrCode,
                MaxFoodClaims:  req.MaxFoodClaims,
                MaxDrinkClaims: req.MaxDrinkClaims,
                Meta:           meta,
                IsActive:       true,
                CreatedAt:      time.Now(),
                UpdatedAt:      time.Now(),
        }

        if err := database.DB.Create(&participant).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to create participant")
        }

        // Log creation
        logScanLog(tenantUUID, &eventUUID, &participant.ID, "create", "success", userID)

        return utils.SuccessWithMessage(c, "Participant created successfully", fiber.Map{
                "participant": participant,
                "qr_code":     qrCode,
        })
}

// ImportParticipants imports participants from CSV
func ImportParticipants(c *fiber.Ctx) error {
        eventID := c.Params("event_id")
        tenantID := middleware.GetTenantID(c)
        userID := middleware.GetUserID(c)

        // Verify event belongs to tenant
        var event models.Event
        eventQuery := database.DB.Where("id = ?", eventID)
        if tenantID != "" {
                eventQuery = eventQuery.Where("tenant_id = ?", tenantID)
        }
        if err := eventQuery.First(&event).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        // Get uploaded file
        file, err := c.FormFile("file")
        if err != nil {
                return utils.BadRequestResponse(c, "CSV file is required")
        }

        // Open file
        fileHandle, err := file.Open()
        if err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to open file")
        }
        defer fileHandle.Close()

        // Parse CSV
        reader := csv.NewReader(fileHandle)
        
        // Read header
        header, err := reader.Read()
        if err != nil {
                return utils.BadRequestResponse(c, "Invalid CSV file")
        }

        // Map header columns
        headerMap := make(map[string]int)
        for i, col := range header {
                headerMap[strings.ToLower(strings.TrimSpace(col))] = i
        }

        // Check required columns
        if _, ok := headerMap["name"]; !ok {
                return utils.BadRequestResponse(c, "CSV must have 'name' column")
        }
        if _, ok := headerMap["email"]; !ok {
                return utils.BadRequestResponse(c, "CSV must have 'email' column")
        }

        // Process rows
        var imported []models.Participant
        var errors []string
        rowNum := 1

        tenantUUID, _ := uuid.Parse(tenantID)
        eventUUID, _ := uuid.Parse(eventID)

        for {
                row, err := reader.Read()
                if err == io.EOF {
                        break
                }
                if err != nil {
                        errors = append(errors, fmt.Sprintf("Row %d: %s", rowNum, err.Error()))
                        continue
                }
                rowNum++

                // Get values
                name := ""
                email := ""
                phone := ""
                
                if idx, ok := headerMap["name"]; ok && idx < len(row) {
                        name = strings.TrimSpace(row[idx])
                }
                if idx, ok := headerMap["email"]; ok && idx < len(row) {
                        email = strings.TrimSpace(row[idx])
                }
                if idx, ok := headerMap["phone"]; ok && idx < len(row) {
                        phone = strings.TrimSpace(row[idx])
                }

                // Validate
                if name == "" || email == "" {
                        errors = append(errors, fmt.Sprintf("Row %d: name and email are required", rowNum))
                        continue
                }

                // Check for duplicate
                var existing models.Participant
                if err := database.DB.Where("event_id = ? AND email = ?", eventID, email).First(&existing).Error; err == nil {
                        errors = append(errors, fmt.Sprintf("Row %d: email %s already exists", rowNum, email))
                        continue
                }

                // Create participant
                participant := models.Participant{
                        ID:             uuid.New(),
                        TenantID:       tenantUUID,
                        EventID:        eventUUID,
                        Name:           name,
                        Email:          email,
                        Phone:          phone,
                        QRCode:         generateQRCode(),
                        MaxFoodClaims:  event.DefaultMaxFoodClaims,
                        MaxDrinkClaims: event.DefaultMaxDrinkClaims,
                        IsActive:       true,
                        CreatedAt:      time.Now(),
                        UpdatedAt:      time.Now(),
                }

                if err := database.DB.Create(&participant).Error; err != nil {
                        errors = append(errors, fmt.Sprintf("Row %d: failed to create participant", rowNum))
                        continue
                }

                imported = append(imported, participant)
        }

        // Log import
        logScanLog(tenantUUID, &eventUUID, nil, "import", "success", fmt.Sprintf("Imported %d participants", len(imported)))

        return utils.SuccessResponse(c, fiber.Map{
                "imported_count": len(imported),
                "error_count":    len(errors),
                "errors":         errors,
                "participants":   imported,
        })
}

// UpdateParticipant updates a participant
func UpdateParticipant(c *fiber.Ctx) error {
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

        var req map[string]interface{}
        if err := c.BodyParser(&req); err != nil {
                return utils.BadRequestResponse(c, "Invalid request body")
        }

        // Update allowed fields
        allowedFields := []string{"name", "phone", "max_food_claims", "max_drink_claims", "is_active", "is_blacklisted"}
        for _, field := range allowedFields {
                if val, ok := req[field]; ok {
                        switch field {
                        case "name":
                                participant.Name = val.(string)
                        case "phone":
                                participant.Phone = val.(string)
                        case "max_food_claims":
                                participant.MaxFoodClaims = int(val.(float64))
                        case "max_drink_claims":
                                participant.MaxDrinkClaims = int(val.(float64))
                        case "is_active":
                                participant.IsActive = val.(bool)
                        case "is_blacklisted":
                                participant.IsBlacklisted = val.(bool)
                        }
                }
        }

        participant.UpdatedAt = time.Now()

        if err := database.DB.Save(&participant).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to update participant")
        }

        return utils.SuccessWithMessage(c, "Participant updated successfully", participant)
}

// DeleteParticipant deletes a participant
func DeleteParticipant(c *fiber.Ctx) error {
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

        // Delete related records
        database.DB.Where("participant_id = ?", participant.ID).Delete(&models.Checkin{})
        database.DB.Where("participant_id = ?", participant.ID).Delete(&models.Claim{})

        // Delete participant
        if err := database.DB.Delete(&participant).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to delete participant")
        }

        return utils.SuccessWithMessage(c, "Participant deleted successfully", nil)
}

// GetParticipantByQR finds a participant by QR code
func GetParticipantByQR(c *fiber.Ctx) error {
        qrCode := c.Params("qr_code")
        tenantID := middleware.GetTenantID(c)

        var participant models.Participant
        if err := database.DB.Where("qr_code = ?", qrCode).First(&participant).Error; err != nil {
                return utils.NotFoundResponse(c, "Participant not found")
        }

        // Verify tenant access
        if tenantID != "" && participant.TenantID.String() != tenantID {
                return utils.NotFoundResponse(c, "Participant not found")
        }

        // Load event
        var event models.Event
        database.DB.First(&event, "id = ?", participant.EventID)

        return utils.SuccessResponse(c, fiber.Map{
                "participant": participant,
                "event":       event,
        })
}

// generateQRCode generates a unique QR code
func generateQRCode() string {
        return "EVT-" + strings.ToUpper(uuid.New().String()[:12])
}

// logScanLog creates a scan log entry
func logScanLog(tenantID, eventID, participantID *uuid.UUID, scanType, result, device string) {
        log := models.ScanLog{
                ID:            uuid.New(),
                TenantID:      *tenantID,
                EventID:       eventID,
                ParticipantID: participantID,
                Type:          scanType,
                Result:        result,
                Device:        device,
                CreatedAt:     time.Now(),
        }
        database.DB.Create(&log)
}
