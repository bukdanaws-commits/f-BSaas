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

// ClaimRequest represents F&B claim request
type ClaimRequest struct {
	QRCode     string `json:"qr_code"`
	EventID    string `json:"event_id"`
	MenuItemID string `json:"menu_item_id"`
	BoothID    string `json:"booth_id"`
	ClaimType  string `json:"claim_type"` // food or drink
}

// ClaimResponse represents claim response
type ClaimResponse struct {
	Success     bool                `json:"success"`
	Message     string              `json:"message"`
	Participant *models.Participant `json:"participant,omitempty"`
	MenuItem    *models.MenuItem    `json:"menu_item,omitempty"`
	Remaining   int                 `json:"remaining"`
}

// Claim handles F&B claim
func Claim(c *fiber.Ctx) error {
	var req ClaimRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.QRCode == "" {
		return utils.BadRequestResponse(c, "QR code is required")
	}
	if req.MenuItemID == "" {
		return utils.BadRequestResponse(c, "Menu item is required")
	}

	tenantID := middleware.GetTenantID(c)

	// Find participant by QR code
	var participant models.Participant
	if err := database.DB.Where("qr_code = ?", req.QRCode).First(&participant).Error; err != nil {
		return utils.NotFoundResponse(c, "Participant not found")
	}

	// Verify tenant access
	if tenantID != "" && participant.TenantID.String() != tenantID {
		return utils.NotFoundResponse(c, "Participant not found")
	}

	// Check if checked in
	if !participant.IsCheckedIn {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Participant must check-in first")
	}

	// Check if blacklisted
	if participant.IsBlacklisted {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Participant is blacklisted")
	}

	// Get menu item
	var menuItem models.MenuItem
	if err := database.DB.First(&menuItem, "id = ?", req.MenuItemID).Error; err != nil {
		return utils.NotFoundResponse(c, "Menu item not found")
	}

	// Check stock
	if menuItem.Stock <= 0 {
		return utils.BadRequestResponse(c, "Menu item out of stock")
	}

	// Check claim limits based on type
	remaining := 0
	if req.ClaimType == "food" || menuItem.Name != "" {
		// Check food claim limit
		if participant.FoodClaims >= participant.MaxFoodClaims {
			return utils.SuccessResponse(c, fiber.Map{
				"success":    false,
				"message":    "Food claim limit reached",
				"remaining":  0,
				"max_claims": participant.MaxFoodClaims,
				"used":       participant.FoodClaims,
			})
		}
		remaining = participant.MaxFoodClaims - participant.FoodClaims - 1
	} else if req.ClaimType == "drink" {
		// Check drink claim limit
		if participant.DrinkClaims >= participant.MaxDrinkClaims {
			return utils.SuccessResponse(c, fiber.Map{
				"success":    false,
				"message":    "Drink claim limit reached",
				"remaining":  0,
				"max_claims": participant.MaxDrinkClaims,
				"used":       participant.DrinkClaims,
			})
		}
		remaining = participant.MaxDrinkClaims - participant.DrinkClaims - 1
	}

	// Get booth if specified
	var boothID *uuid.UUID
	if req.BoothID != "" {
		bid, _ := uuid.Parse(req.BoothID)
		boothID = &bid
	}

	// Create claim
	now := time.Now()
	claim := models.Claim{
		ID:            uuid.New(),
		EventID:       participant.EventID,
		ParticipantID: participant.ID,
		MenuItemID:    menuItem.ID,
		BoothID:       boothID,
		ClaimedAt:     now,
	}

	// Start transaction
	tx := database.DB.Begin()

	// Create claim record
	if err := tx.Create(&claim).Error; err != nil {
		tx.Rollback()
		return utils.InternalServerErrorResponse(c, "Failed to create claim")
	}

	// Update participant claim counts
	if req.ClaimType == "food" {
		participant.FoodClaims++
	} else if req.ClaimType == "drink" {
		participant.DrinkClaims++
	}
	participant.UpdatedAt = now
	tx.Save(&participant)

	// Update menu item stock
	menuItem.Stock--
	tx.Save(&menuItem)

	// Deduct credit
	deductCredits(tx, participant.TenantID, 1, "claim", participant.ID, "F&B Claim: "+menuItem.Name)

	// Log scan
	tenantUUID := participant.TenantID
	logScanLog(&tenantUUID, &participant.EventID, &participant.ID, "claim", "success", c.Get("User-Agent"))

	tx.Commit()

	return utils.SuccessResponse(c, fiber.Map{
		"success":     true,
		"message":     "Claim successful",
		"participant": participant,
		"menu_item":   menuItem,
		"remaining":   remaining,
	})
}

// QuickClaim handles quick F&B claim by type (food/drink)
func QuickClaim(c *fiber.Ctx) error {
	var req struct {
		QRCode    string `json:"qr_code"`
		EventID   string `json:"event_id"`
		ClaimType string `json:"claim_type"` // food or drink
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.QRCode == "" {
		return utils.BadRequestResponse(c, "QR code is required")
	}

	tenantID := middleware.GetTenantID(c)

	// Find participant
	var participant models.Participant
	if err := database.DB.Where("qr_code = ?", req.QRCode).First(&participant).Error; err != nil {
		return utils.NotFoundResponse(c, "Participant not found")
	}

	// Verify tenant access
	if tenantID != "" && participant.TenantID.String() != tenantID {
		return utils.NotFoundResponse(c, "Participant not found")
	}

	// Check if checked in
	if !participant.IsCheckedIn {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Participant must check-in first")
	}

	// Check claim limits
	remaining := 0
	if req.ClaimType == "food" {
		if participant.FoodClaims >= participant.MaxFoodClaims {
			return utils.SuccessResponse(c, fiber.Map{
				"success":    false,
				"message":    "Food claim limit reached",
				"food_remaining":  0,
				"drink_remaining": participant.MaxDrinkClaims - participant.DrinkClaims,
			})
		}
		participant.FoodClaims++
		remaining = participant.MaxFoodClaims - participant.FoodClaims
	} else if req.ClaimType == "drink" {
		if participant.DrinkClaims >= participant.MaxDrinkClaims {
			return utils.SuccessResponse(c, fiber.Map{
				"success":    false,
				"message":    "Drink claim limit reached",
				"food_remaining": participant.MaxFoodClaims - participant.FoodClaims,
				"drink_remaining":  0,
			})
		}
		participant.DrinkClaims++
		remaining = participant.MaxDrinkClaims - participant.DrinkClaims
	} else {
		return utils.BadRequestResponse(c, "Invalid claim type")
	}

	participant.UpdatedAt = time.Now()
	database.DB.Save(&participant)

	// Log scan
	tenantUUID := participant.TenantID
	logScanLog(&tenantUUID, &participant.EventID, &participant.ID, "claim", "success", req.ClaimType)

	return utils.SuccessResponse(c, fiber.Map{
		"success":         true,
		"message":         "Claim successful",
		"participant":     participant,
		"food_remaining":  participant.MaxFoodClaims - participant.FoodClaims,
		"drink_remaining": participant.MaxDrinkClaims - participant.DrinkClaims,
	})
}

// GetClaimHistory returns claim history for an event
func GetClaimHistory(c *fiber.Ctx) error {
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

	var claims []models.Claim
	var total int64

	database.DB.Model(&models.Claim{}).Where("event_id = ?", eventID).Count(&total)
	database.DB.Where("event_id = ?", eventID).Offset(offset).Limit(limit).Order("claimed_at DESC").Find(&claims)

	// Load related data
	for i := range claims {
		var participant models.Participant
		var menuItem models.MenuItem
		database.DB.First(&participant, "id = ?", claims[i].ParticipantID)
		database.DB.First(&menuItem, "id = ?", claims[i].MenuItemID)
	}

	return utils.PaginatedResponse(c, claims, total, page, limit)
}

// GetMenuItems returns menu items for an event
func GetMenuItems(c *fiber.Ctx) error {
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

	var menuItems []models.MenuItem
	database.DB.Where("event_id = ?", eventID).Find(&menuItems)

	return utils.SuccessResponse(c, menuItems)
}

// CreateMenuItem creates a new menu item
func CreateMenuItem(c *fiber.Ctx) error {
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
		Name       string `json:"name"`
		CategoryID string `json:"category_id"`
		Stock      int    `json:"stock"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name == "" {
		return utils.BadRequestResponse(c, "Name is required")
	}

	eventUUID, _ := uuid.Parse(eventID)
	var categoryID *uuid.UUID
	if req.CategoryID != "" {
		cid, _ := uuid.Parse(req.CategoryID)
		categoryID = &cid
	}

	menuItem := models.MenuItem{
		ID:         uuid.New(),
		EventID:    eventUUID,
		CategoryID: categoryID,
		Name:       req.Name,
		Stock:      req.Stock,
		IsActive:   true,
		CreatedAt:  time.Now(),
	}

	if err := database.DB.Create(&menuItem).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create menu item")
	}

	return utils.SuccessWithMessage(c, "Menu item created successfully", menuItem)
}
