package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/eventify/backend/internal/config"
	"github.com/eventify/backend/internal/database"
	"github.com/eventify/backend/internal/middleware"
	"github.com/eventify/backend/internal/models"
	"github.com/eventify/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

var googleOAuthConfig *oauth2.Config

// InitGoogleOAuth initializes Google OAuth config
func InitGoogleOAuth() {
	cfg := config.AppConfig
	googleOAuthConfig = &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.FrontendURL + "/auth/callback",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}

// GoogleUserInfo represents Google user info response
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

// GetGoogleAuthURL returns Google OAuth URL
func GetGoogleAuthURL(c *fiber.Ctx) error {
	state := uuid.New().String()
	// In production, store state in Redis or session
	url := googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	
	return utils.SuccessResponse(c, fiber.Map{
		"auth_url": url,
		"state":    state,
	})
}

// GoogleCallback handles Google OAuth callback
func GoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return utils.BadRequestResponse(c, "Authorization code required")
	}

	// Exchange code for token
	token, err := googleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Failed to exchange token: "+err.Error())
	}

	// Get user info from Google
	userInfo, err := getGoogleUserInfo(token.AccessToken)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Failed to get user info: "+err.Error())
	}

	// Find or create user
	user, err := findOrCreateUser(userInfo)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to process user: "+err.Error())
	}

	// Get membership and tenant
	var membership *models.Membership
	var tenant *models.Tenant

	if !user.IsSuperAdmin {
		// Find membership
		database.DB.Where("user_id = ?", user.ID).First(&membership)
		if membership != nil {
			database.DB.First(&tenant, "id = ?", membership.TenantID)
		}
	}

	// Generate JWT token
	jwtToken, err := utils.GenerateToken(user, membership, tenant)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to generate token")
	}

	return utils.SuccessResponse(c, fiber.Map{
		"token": jwtToken,
		"user": fiber.Map{
			"id":             user.ID,
			"email":          user.Email,
			"name":           user.Name,
			"avatar_url":     user.AvatarURL,
			"is_super_admin": user.IsSuperAdmin,
			"role":           getRole(user, membership),
			"tenant":         tenant,
		},
	})
}

// LoginWithGoogle handles direct Google login (for frontend that handles OAuth)
func LoginWithGoogle(c *fiber.Ctx) error {
	var req struct {
		GoogleToken string `json:"google_token"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.GoogleToken == "" {
		return utils.BadRequestResponse(c, "Google token required")
	}

	// Verify Google token and get user info
	userInfo, err := getGoogleUserInfo(req.GoogleToken)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Invalid Google token")
	}

	// Find or create user
	user, err := findOrCreateUser(userInfo)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to process user: "+err.Error())
	}

	// Get membership and tenant
	var membership *models.Membership
	var tenant *models.Tenant

	if !user.IsSuperAdmin {
		database.DB.Where("user_id = ?", user.ID).First(&membership)
		if membership != nil {
			database.DB.First(&tenant, "id = ?", membership.TenantID)
		}
	}

	// Generate JWT token
	jwtToken, err := utils.GenerateToken(user, membership, tenant)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to generate token")
	}

	return utils.SuccessResponse(c, fiber.Map{
		"token": jwtToken,
		"user": fiber.Map{
			"id":             user.ID,
			"email":          user.Email,
			"name":           user.Name,
			"avatar_url":     user.AvatarURL,
			"is_super_admin": user.IsSuperAdmin,
			"role":           getRole(user, membership),
			"tenant":         tenant,
		},
	})
}

// GetCurrentUser returns current authenticated user
func GetCurrentUser(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	
	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	// Get membership and tenant
	var membership *models.Membership
	var tenant *models.Tenant

	if !user.IsSuperAdmin {
		database.DB.Where("user_id = ?", user.ID).First(&membership)
		if membership != nil {
			database.DB.First(&tenant, "id = ?", membership.TenantID)
		}
	}

	// Get wallet if tenant exists
	var wallet *models.CreditWallet
	if tenant != nil {
		database.DB.First(&wallet, "tenant_id = ?", tenant.ID)
	}

	return utils.SuccessResponse(c, fiber.Map{
		"id":             user.ID,
		"email":          user.Email,
		"name":           user.Name,
		"avatar_url":     user.AvatarURL,
		"is_super_admin": user.IsSuperAdmin,
		"role":           getRole(&user, membership),
		"tenant":         tenant,
		"wallet":         wallet,
	})
}

// getGoogleUserInfo fetches user info from Google API
func getGoogleUserInfo(accessToken string) (*GoogleUserInfo, error) {
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user info: status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var userInfo GoogleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

// findOrCreateUser finds existing user or creates new one
func findOrCreateUser(userInfo *GoogleUserInfo) (*models.User, error) {
	var user models.User

	// Try to find by Google ID first
	err := database.DB.Where("google_id = ?", userInfo.ID).First(&user).Error
	if err == nil {
		// Update user info
		user.Email = userInfo.Email
		user.Name = userInfo.Name
		user.AvatarURL = userInfo.Picture
		database.DB.Save(&user)
		return &user, nil
	}

	// Try to find by email
	err = database.DB.Where("email = ?", userInfo.Email).First(&user).Error
	if err == nil {
		// Update Google ID
		user.GoogleID = userInfo.ID
		user.AvatarURL = userInfo.Picture
		database.DB.Save(&user)
		return &user, nil
	}

	// Create new user
	if err == gorm.ErrRecordNotFound {
		user = models.User{
			ID:           uuid.New(),
			Email:        userInfo.Email,
			Name:         userInfo.Name,
			AvatarURL:    userInfo.Picture,
			GoogleID:     userInfo.ID,
			IsSuperAdmin: false,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := database.DB.Create(&user).Error; err != nil {
			return nil, err
		}

		// Create tenant for new user (EO registration flow)
		tenant, err := createTenantForNewUser(&user)
		if err != nil {
			return nil, err
		}

		// Update user reference
		user.Memberships = []models.Membership{{
			UserID:   user.ID,
			TenantID: tenant.ID,
			Role:     "owner",
		}}

		return &user, nil
	}

	return nil, err
}

// createTenantForNewUser creates a new tenant with free credits
func createTenantForNewUser(user *models.User) (*models.Tenant, error) {
	// Get default package (Basic - free)
	var defaultPackage models.PricingPackage
	if err := database.DB.Where("slug = ?", "basic").First(&defaultPackage).Error; err != nil {
		// If not found, continue without package
		defaultPackage = models.PricingPackage{}
	}

	// Get credit settings
	var creditSettings models.CreditSettings
	database.DB.First(&creditSettings)

	// Create tenant
	tenant := models.Tenant{
		ID:         uuid.New(),
		Name:       user.Name + "'s Organization",
		Slug:       generateSlug(user.Name),
		OwnerID:    &user.ID,
		PackageID:  &defaultPackage.ID,
		Status:     "active",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := database.DB.Create(&tenant).Error; err != nil {
		return nil, err
	}

	// Create membership
	membership := models.Membership{
		ID:        uuid.New(),
		UserID:    user.ID,
		TenantID:  tenant.ID,
		Role:      "owner",
		CreatedAt: time.Now(),
	}
	database.DB.Create(&membership)

	// Create credit wallet with free credits
	wallet := models.CreditWallet{
		ID:                 uuid.New(),
		TenantID:           tenant.ID,
		Balance:            creditSettings.DefaultFreeCredits,
		BonusBalance:       creditSettings.DefaultBonusCredits,
		TotalPurchased:     0,
		TotalUsed:          0,
		TotalBonusReceived: creditSettings.DefaultFreeCredits + creditSettings.DefaultBonusCredits,
		UpdatedAt:          time.Now(),
	}
	database.DB.Create(&wallet)

	// Create credit transaction for bonus
	transaction := models.CreditTransaction{
		ID:          uuid.New(),
		TenantID:    tenant.ID,
		Type:        "bonus",
		Amount:      creditSettings.DefaultFreeCredits + creditSettings.DefaultBonusCredits,
		Description: "Free credits for new EO registration",
		CreatedAt:   time.Now(),
	}
	database.DB.Create(&transaction)

	return &tenant, nil
}

// generateSlug generates a URL-friendly slug from name
func generateSlug(name string) string {
	// Simple slug generation - in production, use a proper slug library
	slug := ""
	for _, c := range name {
		if (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') {
			slug += string(c)
		} else if c == ' ' || c == '-' || c == '_' {
			slug += "-"
		}
	}
	return slug + "-" + uuid.New().String()[:8]
}

// getRole returns user role
func getRole(user *models.User, membership *models.Membership) string {
	if user.IsSuperAdmin {
		return "super_admin"
	}
	if membership != nil {
		return membership.Role
	}
	return "owner"
}
