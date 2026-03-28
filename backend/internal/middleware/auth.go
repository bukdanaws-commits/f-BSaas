package middleware

import (
	"strings"

	"github.com/eventify/backend/internal/config"
	"github.com/eventify/backend/internal/database"
	"github.com/eventify/backend/internal/models"
	"github.com/eventify/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// ErrorHandler is a custom error handler for Fiber
func ErrorHandler(c *fiber.Ctx, err error) error {
	// Default 500 status code
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	// Check if it's a Fiber error
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": message,
	})
}

// AuthRequired middleware checks for valid JWT token
func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.UnauthorizedResponse(c, "Authorization header required")
		}

		// Check Bearer prefix
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return utils.UnauthorizedResponse(c, "Invalid authorization format")
		}

		tokenString := parts[1]

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(config.AppConfig.JWTSecret), nil
		})

		if err != nil {
			return utils.UnauthorizedResponse(c, "Invalid or expired token")
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			return utils.UnauthorizedResponse(c, "Invalid token claims")
		}

		// Get user ID
		userID, ok := claims["user_id"].(string)
		if !ok {
			return utils.UnauthorizedResponse(c, "Invalid user ID in token")
		}

		// Verify user exists
		var user models.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			return utils.UnauthorizedResponse(c, "User not found")
		}

		// Store user info in context
		c.Locals("user_id", userID)
		c.Locals("user", &user)
		c.Locals("is_super_admin", claims["is_super_admin"] == true)

		// Get tenant ID from claims
		if tenantID, ok := claims["tenant_id"].(string); ok && tenantID != "" {
			c.Locals("tenant_id", tenantID)
		}

		// Get role from claims
		if role, ok := claims["role"].(string); ok {
			c.Locals("role", role)
		}

		return c.Next()
	}
}

// SuperAdminOnly middleware checks if user is super admin
func SuperAdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		isSuperAdmin := c.Locals("is_super_admin").(bool)
		if !isSuperAdmin {
			return utils.ForbiddenResponse(c, "Super admin access required")
		}
		return c.Next()
	}
}

// RoleRequired middleware checks if user has required role
func RoleRequired(requiredRole string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Check if super admin (has all access)
		isSuperAdmin := c.Locals("is_super_admin").(bool)
		if isSuperAdmin {
			return c.Next()
		}

		role := c.Locals("role").(string)
		if role == "" {
			return utils.ForbiddenResponse(c, "No role assigned")
		}

		// Role hierarchy: owner > admin > crew
		roleLevel := map[string]int{
			"owner":  3,
			"admin":  2,
			"crew":   1,
		}

		userLevel := roleLevel[role]
		requiredLevel := roleLevel[requiredRole]

		if userLevel < requiredLevel {
			return utils.ForbiddenResponse(c, "Insufficient permissions")
		}

		return c.Next()
	}
}

// GetUserID extracts user ID from context
func GetUserID(c *fiber.Ctx) string {
	if userID, ok := c.Locals("user_id").(string); ok {
		return userID
	}
	return ""
}

// GetTenantID extracts tenant ID from context
func GetTenantID(c *fiber.Ctx) string {
	if tenantID, ok := c.Locals("tenant_id").(string); ok {
		return tenantID
	}
	return ""
}

// GetRole extracts role from context
func GetRole(c *fiber.Ctx) string {
	if role, ok := c.Locals("role").(string); ok {
		return role
	}
	return ""
}

// IsSuperAdmin checks if user is super admin
func IsSuperAdmin(c *fiber.Ctx) bool {
	if isSuperAdmin, ok := c.Locals("is_super_admin").(bool); ok {
		return isSuperAdmin
	}
	return false
}

// GetUser extracts user from context
func GetUser(c *fiber.Ctx) *models.User {
	if user, ok := c.Locals("user").(*models.User); ok {
		return user
	}
	return nil
}
