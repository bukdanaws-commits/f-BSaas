package handlers

import (
	"time"

	"github.com/eventify/backend/internal/database"
	"github.com/eventify/backend/internal/middleware"
	"github.com/eventify/backend/internal/models"
	"github.com/eventify/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ==================== DISPLAY QUEUE ====================

// GetDisplayQueue returns display queue for an event
func GetDisplayQueue(c *fiber.Ctx) error {
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

	// Get pending items (not displayed yet)
	limit := c.QueryInt("limit", 10)

	var queue []models.DisplayQueue
	database.DB.Where("event_id = ? AND is_displayed = ?", eventID, false).
		Order("created_at ASC").
		Limit(limit).
		Find(&queue)

	return utils.SuccessResponse(c, queue)
}

// AddToDisplayQueue adds a participant to display queue
func AddToDisplayQueue(c *fiber.Ctx) error {
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

	var req struct {
		ParticipantID string `json:"participant_id"`
		Name          string `json:"name"`
		PhotoURL      string `json:"photo_url"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	eventUUID, _ := uuid.Parse(eventID)
	var participantID *uuid.UUID
	if req.ParticipantID != "" {
		pid, _ := uuid.Parse(req.ParticipantID)
		participantID = &pid
	}

	item := models.DisplayQueue{
		ID:            uuid.New(),
		EventID:       eventUUID,
		ParticipantID: participantID,
		Name:          req.Name,
		PhotoURL:      req.PhotoURL,
		IsDisplayed:   false,
		CreatedAt:     time.Now(),
	}

	if err := database.DB.Create(&item).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to add to queue")
	}

	return utils.SuccessWithMessage(c, "Added to display queue", item)
}

// MarkDisplayed marks a display item as displayed
func MarkDisplayed(c *fiber.Ctx) error {
	itemID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var item models.DisplayQueue
	if err := database.DB.First(&item, "id = ?", itemID).Error; err != nil {
		return utils.NotFoundResponse(c, "Queue item not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", item.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	item.IsDisplayed = true
	database.DB.Save(&item)

	return utils.SuccessWithMessage(c, "Marked as displayed", item)
}

// RemoveFromDisplayQueue removes an item from queue
func RemoveFromDisplayQueue(c *fiber.Ctx) error {
	itemID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var item models.DisplayQueue
	if err := database.DB.First(&item, "id = ?", itemID).Error; err != nil {
		return utils.NotFoundResponse(c, "Queue item not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", item.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	database.DB.Delete(&item)

	return utils.SuccessWithMessage(c, "Removed from queue", nil)
}

// GetDisplaySettings returns display settings for an event
func GetDisplaySettings(c *fiber.Ctx) error {
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

	return utils.SuccessResponse(c, fiber.Map{
		"welcome_message":  event.WelcomeMessage,
		"display_duration": event.DisplayDuration,
		"enable_sound":     event.EnableSound,
	})
}

// ==================== SCAN LOGS ====================

// GetScanLogs returns scan logs for an event
func GetScanLogs(c *fiber.Ctx) error {
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

	// Filters
	scanType := c.Query("type")
	result := c.Query("result")

	var logs []models.ScanLog
	var total int64

	query := database.DB.Model(&models.ScanLog{}).Where("event_id = ?", eventID)
	if scanType != "" {
		query = query.Where("type = ?", scanType)
	}
	if result != "" {
		query = query.Where("result = ?", result)
	}

	query.Count(&total)
	query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&logs)

	return utils.PaginatedResponse(c, logs, total, page, limit)
}

// GetScanLogStats returns scan log statistics
func GetScanLogStats(c *fiber.Ctx) error {
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

	// Count by type
	var checkinSuccess int64
	var checkinFailed int64
	var claimSuccess int64
	var claimFailed int64

	database.DB.Model(&models.ScanLog{}).
		Where("event_id = ? AND type = ? AND result = ?", eventID, "checkin", "success").Count(&checkinSuccess)
	database.DB.Model(&models.ScanLog{}).
		Where("event_id = ? AND type = ? AND result = ?", eventID, "checkin", "failed").Count(&checkinFailed)
	database.DB.Model(&models.ScanLog{}).
		Where("event_id = ? AND type = ? AND result = ?", eventID, "claim", "success").Count(&claimSuccess)
	database.DB.Model(&models.ScanLog{}).
		Where("event_id = ? AND type = ? AND result = ?", eventID, "claim", "failed").Count(&claimFailed)

	return utils.SuccessResponse(c, fiber.Map{
		"checkin": fiber.Map{
			"success": checkinSuccess,
			"failed":  checkinFailed,
			"total":   checkinSuccess + checkinFailed,
		},
		"claim": fiber.Map{
			"success": claimSuccess,
			"failed":  claimFailed,
			"total":   claimSuccess + claimFailed,
		},
		"total": checkinSuccess + checkinFailed + claimSuccess + claimFailed,
	})
}

// ==================== TENANT / CREW MANAGEMENT ====================

// GetTenantInfo returns tenant info
func GetTenantInfo(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	var tenant models.Tenant
	if err := database.DB.First(&tenant, "id = ?", tenantID).Error; err != nil {
		return utils.NotFoundResponse(c, "Tenant not found")
	}

	// Get wallet
	var wallet models.CreditWallet
	database.DB.Where("tenant_id = ?", tenantID).First(&wallet)

	// Count members
	var memberCount int64
	database.DB.Model(&models.Membership{}).Where("tenant_id = ?", tenantID).Count(&memberCount)

	// Count events
	var eventCount int64
	database.DB.Model(&models.Event{}).Where("tenant_id = ?", tenantID).Count(&eventCount)

	return utils.SuccessResponse(c, fiber.Map{
		"tenant":       tenant,
		"wallet":       wallet,
		"member_count": memberCount,
		"event_count":  eventCount,
	})
}

// UpdateTenant updates tenant info
func UpdateTenant(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	var tenant models.Tenant
	if err := database.DB.First(&tenant, "id = ?", tenantID).Error; err != nil {
		return utils.NotFoundResponse(c, "Tenant not found")
	}

	var req struct {
		Name    string `json:"name"`
		Phone   string `json:"phone"`
		Address string `json:"address"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name != "" {
		tenant.Name = req.Name
	}
	tenant.Phone = req.Phone
	tenant.Address = req.Address
	tenant.UpdatedAt = time.Now()

	if err := database.DB.Save(&tenant).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update tenant")
	}

	return utils.SuccessWithMessage(c, "Tenant updated successfully", tenant)
}

// GetCrewMembers returns crew members for tenant
func GetCrewMembers(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	var memberships []models.Membership
	database.DB.Where("tenant_id = ?", tenantID).Find(&memberships)

	// Load user data
	type CrewMember struct {
		ID        string `json:"id"`
		UserID    string `json:"user_id"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		AvatarURL string `json:"avatar_url"`
		Role      string `json:"role"`
		CreatedAt string `json:"created_at"`
	}

	var crew []CrewMember
	for _, m := range memberships {
		var user models.User
		database.DB.First(&user, "id = ?", m.UserID)

		crew = append(crew, CrewMember{
			ID:        m.ID.String(),
			UserID:    user.ID.String(),
			Name:      user.Name,
			Email:     user.Email,
			AvatarURL: user.AvatarURL,
			Role:      m.Role,
			CreatedAt: m.CreatedAt.Format(time.RFC3339),
		})
	}

	return utils.SuccessResponse(c, crew)
}

// InviteCrew invites a crew member
func InviteCrew(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"` // admin, crew
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Email == "" {
		return utils.BadRequestResponse(c, "Email is required")
	}
	if req.Password == "" {
		return utils.BadRequestResponse(c, "Password is required")
	}
	if req.Role == "" {
		req.Role = "crew"
	}

	// Check if user already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		// User exists, check if already member
		var existingMembership models.Membership
		if err := database.DB.Where("user_id = ? AND tenant_id = ?", existingUser.ID, tenantID).First(&existingMembership).Error; err == nil {
			return utils.BadRequestResponse(c, "User is already a member")
		}

		// Add membership
		tenantUUID, _ := uuid.Parse(tenantID)
		membership := models.Membership{
			ID:        uuid.New(),
			UserID:    existingUser.ID,
			TenantID:  tenantUUID,
			Role:      req.Role,
			CreatedAt: time.Now(),
		}
		database.DB.Create(&membership)

		return utils.SuccessWithMessage(c, "Existing user added to crew", fiber.Map{
			"id":    existingUser.ID,
			"name":  existingUser.Name,
			"email": existingUser.Email,
			"role":  req.Role,
		})
	}

	// Create new user
	tenantUUID, _ := uuid.Parse(tenantID)

	newUser := models.User{
		ID:           uuid.New(),
		Email:        req.Email,
		Name:         req.Name,
		IsSuperAdmin: false,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// In production, hash the password!
	// For now, we'll store it as-is (NOT RECOMMENDED)
	// _ = req.Password // TODO: Hash password with bcrypt

	if err := database.DB.Create(&newUser).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create user")
	}

	// Create membership
	membership := models.Membership{
		ID:        uuid.New(),
		UserID:    newUser.ID,
		TenantID:  tenantUUID,
		Role:      req.Role,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&membership)

	// Log action
	_ = userID

	return utils.SuccessWithMessage(c, "Crew member invited successfully", fiber.Map{
		"id":    newUser.ID,
		"name":  newUser.Name,
		"email": newUser.Email,
		"role":  req.Role,
	})
}

// RemoveCrew removes a crew member
func RemoveCrew(c *fiber.Ctx) error {
	membershipID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var membership models.Membership
	if err := database.DB.First(&membership, "id = ?", membershipID).Error; err != nil {
		return utils.NotFoundResponse(c, "Membership not found")
	}

	// Verify tenant access
	if membership.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	// Prevent removing owner
	if membership.Role == "owner" {
		return utils.BadRequestResponse(c, "Cannot remove owner")
	}

	if err := database.DB.Delete(&membership).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to remove crew member")
	}

	return utils.SuccessWithMessage(c, "Crew member removed successfully", nil)
}

// UpdateCrewRole updates a crew member's role
func UpdateCrewRole(c *fiber.Ctx) error {
	membershipID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var membership models.Membership
	if err := database.DB.First(&membership, "id = ?", membershipID).Error; err != nil {
		return utils.NotFoundResponse(c, "Membership not found")
	}

	// Verify tenant access
	if membership.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	// Prevent changing owner role
	if membership.Role == "owner" {
		return utils.BadRequestResponse(c, "Cannot change owner role")
	}

	var req struct {
		Role string `json:"role"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Role == "" || (req.Role != "admin" && req.Role != "crew") {
		return utils.BadRequestResponse(c, "Invalid role")
	}

	membership.Role = req.Role
	database.DB.Save(&membership)

	return utils.SuccessWithMessage(c, "Role updated successfully", membership)
}
