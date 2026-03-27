package handlers

import (
	"fmt"
	"time"

	"github.com/eventify/backend/internal/database"
	"github.com/eventify/backend/internal/middleware"
	"github.com/eventify/backend/internal/models"
	"github.com/eventify/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetWallet returns credit wallet for current tenant
func GetWallet(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	var wallet models.CreditWallet
	if err := database.DB.Where("tenant_id = ?", tenantID).First(&wallet).Error; err != nil {
		return utils.NotFoundResponse(c, "Wallet not found")
	}

	return utils.SuccessResponse(c, wallet)
}

// GetCreditTransactions returns transaction history for current tenant
func GetCreditTransactions(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	// Pagination
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 50)
	offset := (page - 1) * limit

	var transactions []models.CreditTransaction
	var total int64

	database.DB.Model(&models.CreditTransaction{}).Where("tenant_id = ?", tenantID).Count(&total)
	database.DB.Where("tenant_id = ?", tenantID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&transactions)

	return utils.PaginatedResponse(c, transactions, total, page, limit)
}

// PurchaseCreditsRequest represents credit purchase request
type PurchaseCreditsRequest struct {
	Amount int `json:"amount"`
}

// PurchaseCredits initiates a credit purchase (creates Midtrans transaction)
func PurchaseCredits(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	var req PurchaseCreditsRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	// Get credit settings
	var creditSettings models.CreditSettings
	database.DB.First(&creditSettings)

	// Validate minimum purchase
	if req.Amount < creditSettings.MinCreditPurchase {
		return utils.BadRequestResponse(c, fmt.Sprintf("Minimum purchase is %d credits", creditSettings.MinCreditPurchase))
	}

	// Calculate price
	price := req.Amount * creditSettings.PricePerCredit

	// Create Midtrans transaction
	orderID := "CRED-" + uuid.New().String()[:8]
	
	// For now, return the transaction details
	// In production, this would call Midtrans API
	return utils.SuccessResponse(c, fiber.Map{
		"order_id":      orderID,
		"credits":       req.Amount,
		"price":         price,
		"price_per_credit": creditSettings.PricePerCredit,
		"payment_url":   "", // Will be filled by Midtrans
		"snap_token":    "", // Will be filled by Midtrans
	})
}

// GetPricingPackages returns available pricing packages
func GetPricingPackages(c *fiber.Ctx) error {
	var packages []models.PricingPackage
	database.DB.Where("is_active = ?", true).Order("sort_order").Find(&packages)

	return utils.SuccessResponse(c, packages)
}

// PurchasePackage initiates a package purchase
func PurchasePackage(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		return utils.BadRequestResponse(c, "No tenant associated with user")
	}

	packageID := c.Params("id")

	var pkg models.PricingPackage
	if err := database.DB.Where("id = ? AND is_active = ?", packageID, true).First(&pkg).Error; err != nil {
		return utils.NotFoundResponse(c, "Package not found")
	}

	// Create order
	orderID := "PKG-" + uuid.New().String()[:8]

	// For free package (Basic), just add credits
	if pkg.Price == 0 {
		// Add credits to wallet
		var wallet models.CreditWallet
		if err := database.DB.Where("tenant_id = ?", tenantID).First(&wallet).Error; err != nil {
			return utils.NotFoundResponse(c, "Wallet not found")
		}

		wallet.Balance += pkg.CreditsIncluded
		wallet.TotalPurchased += pkg.CreditsIncluded
		wallet.UpdatedAt = time.Now()
		database.DB.Save(&wallet)

		// Create transaction
		tenantUUID, _ := uuid.Parse(tenantID)
		transaction := models.CreditTransaction{
			ID:          uuid.New(),
			TenantID:    tenantUUID,
			Type:        "purchase",
			Amount:      pkg.CreditsIncluded,
			Description: fmt.Sprintf("Package: %s", pkg.Name),
			CreatedAt:   time.Now(),
		}
		database.DB.Create(&transaction)

		return utils.SuccessResponse(c, fiber.Map{
			"success":  true,
			"message":  "Package activated successfully",
			"credits":  pkg.CreditsIncluded,
			"wallet":   wallet,
		})
	}

	// For paid packages, return Midtrans payment details
	return utils.SuccessResponse(c, fiber.Map{
		"order_id":    orderID,
		"package":     pkg,
		"price":       pkg.Price,
		"payment_url": "", // Will be filled by Midtrans
		"snap_token":  "", // Will be filled by Midtrans
	})
}

// GetCreditSettings returns credit settings (super admin only)
func GetCreditSettings(c *fiber.Ctx) error {
	var settings models.CreditSettings
	if err := database.DB.First(&settings).Error; err != nil {
		return utils.NotFoundResponse(c, "Settings not found")
	}

	return utils.SuccessResponse(c, settings)
}

// UpdateCreditSettings updates credit settings (super admin only)
func UpdateCreditSettings(c *fiber.Ctx) error {
	var settings models.CreditSettings
	if err := database.DB.First(&settings).Error; err != nil {
		// Create default settings if not exists
		settings = models.CreditSettings{
			ID:                 uuid.New(),
			DefaultFreeCredits: 500,
			DefaultBonusCredits: 50,
			PricePerCredit:     80,
			MinCreditPurchase:  100,
			CreditPerCheckin:   1,
			CreditPerClaim:     1,
			CreditPerAIPhoto:   3,
			UpdatedAt:          time.Now(),
		}
	}

	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	// Update fields
	if val, ok := req["default_free_credits"]; ok {
		settings.DefaultFreeCredits = int(val.(float64))
	}
	if val, ok := req["default_bonus_credits"]; ok {
		settings.DefaultBonusCredits = int(val.(float64))
	}
	if val, ok := req["price_per_credit"]; ok {
		settings.PricePerCredit = int(val.(float64))
	}
	if val, ok := req["min_credit_purchase"]; ok {
		settings.MinCreditPurchase = int(val.(float64))
	}
	if val, ok := req["credit_per_checkin"]; ok {
		settings.CreditPerCheckin = int(val.(float64))
	}
	if val, ok := req["credit_per_claim"]; ok {
		settings.CreditPerClaim = int(val.(float64))
	}
	if val, ok := req["credit_per_ai_photo"]; ok {
		settings.CreditPerAIPhoto = int(val.(float64))
	}

	settings.UpdatedAt = time.Now()

	if err := database.DB.Save(&settings).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update settings")
	}

	return utils.SuccessWithMessage(c, "Settings updated successfully", settings)
}

// AddCreditsToTenant adds credits to a tenant (super admin only)
func AddCreditsToTenant(c *fiber.Ctx) error {
	tenantID := c.Params("tenant_id")

	var req struct {
		Amount      int    `json:"amount"`
		Type        string `json:"type"`        // bonus, purchase
		Description string `json:"description"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Amount <= 0 {
		return utils.BadRequestResponse(c, "Amount must be positive")
	}

	// Get wallet
	var wallet models.CreditWallet
	if err := database.DB.Where("tenant_id = ?", tenantID).First(&wallet).Error; err != nil {
		return utils.NotFoundResponse(c, "Wallet not found")
	}

	// Update wallet
	if req.Type == "bonus" {
		wallet.BonusBalance += req.Amount
		wallet.TotalBonusReceived += req.Amount
	} else {
		wallet.Balance += req.Amount
		wallet.TotalPurchased += req.Amount
	}
	wallet.UpdatedAt = time.Now()
	database.DB.Save(&wallet)

	// Create transaction
	tenantUUID, _ := uuid.Parse(tenantID)
	transaction := models.CreditTransaction{
		ID:          uuid.New(),
		TenantID:    tenantUUID,
		Type:        req.Type,
		Amount:      req.Amount,
		Description: req.Description,
		CreatedAt:   time.Now(),
	}
	database.DB.Create(&transaction)

	return utils.SuccessWithMessage(c, "Credits added successfully", wallet)
}
