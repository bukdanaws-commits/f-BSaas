package middleware

import (
	"github.com/eventify/backend/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// SetupCORS configures CORS middleware
func SetupCORS() fiber.Handler {
	cfg := config.AppConfig

	return cors.New(cors.Config{
		AllowOrigins:     cfg.FrontendURL + ", http://localhost:3000, https://eventku.co.id",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With",
		AllowCredentials: true,
		ExposeHeaders:    "Content-Length,Access-Control-Allow-Origin",
		MaxAge:           86400, // 24 hours
	})
}
