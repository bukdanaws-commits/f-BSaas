package handlers

import (
	"time"

	"github.com/eventify/backend/internal/database"
	"github.com/eventify/backend/internal/middleware"
	"github.com/eventify/backend/internal/models"
	"github.com/eventify/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
)

// UpdateUser updates current user profile
func UpdateUser(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	var req struct {
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}
	user.UpdatedAt = time.Now()

	if err := database.DB.Save(&user).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update user")
	}

	return utils.SuccessWithMessage(c, "User updated successfully", user)
}
