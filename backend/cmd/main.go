package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/eventify/backend/internal/config"
	"github.com/eventify/backend/internal/database"
	"github.com/eventify/backend/internal/handlers"
	"github.com/eventify/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Initialize Google OAuth
	handlers.InitGoogleOAuth()

	// Connect to database
	database.Connect()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Eventify API v1.0.0",
		ServerHeader: "Eventify",
		ErrorHandler: middleware.ErrorHandler,
		BodyLimit:    10 * 1024 * 1024, // 10MB
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(helmet.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))
	app.Use(middleware.SetupCORS())
	
	// Rate limiter for API routes
	app.Use("/api", limiter.New(limiter.Config{
		Max:   100,
		Expiry: 60000, // 1 minute
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Eventify API is running",
			"version": "1.0.0",
		})
	})

	// API Routes
	api := app.Group("/api")

	// ==================== AUTH ROUTES ====================
	auth := api.Group("/auth")
	auth.Get("/google", handlers.GetGoogleAuthURL)
	auth.Post("/google/callback", handlers.GoogleCallback)
	auth.Post("/google/login", handlers.LoginWithGoogle)
	auth.Get("/me", middleware.AuthRequired(), handlers.GetCurrentUser)

	// ==================== USER & TENANT ROUTES ====================
	users := api.Group("/users", middleware.AuthRequired())
	users.Get("/me", handlers.GetCurrentUser)
	users.Put("/me", handlers.UpdateUser)

	tenants := api.Group("/tenants", middleware.AuthRequired())
	tenants.Get("/me", handlers.GetTenantInfo)
	tenants.Put("/me", handlers.UpdateTenant)
	tenants.Get("/crew", handlers.GetCrewMembers)
	tenants.Post("/crew/invite", handlers.InviteCrew)
	tenants.Delete("/crew/:id", handlers.RemoveCrew)
	tenants.Put("/crew/:id", handlers.UpdateCrewRole)

	// ==================== EVENT ROUTES ====================
	events := api.Group("/events", middleware.AuthRequired())
	events.Get("/", handlers.GetEvents)
	events.Post("/", handlers.CreateEvent)
	events.Get("/:id", handlers.GetEvent)
	events.Put("/:id", handlers.UpdateEvent)
	events.Delete("/:id", handlers.DeleteEvent)
	events.Post("/:id/duplicate", handlers.DuplicateEvent)
	events.Get("/:id/stats", handlers.GetEventStats)

	// Event Ticket Types
	events.Get("/:event_id/tickets", handlers.GetTicketTypes)
	events.Post("/:event_id/tickets", handlers.CreateTicketType)

	// Event Participants
	events.Get("/:event_id/participants", handlers.GetParticipants)
	events.Post("/:event_id/participants", handlers.CreateParticipant)
	events.Post("/:event_id/participants/import", handlers.ImportParticipants)

	// Event F&B Booths
	events.Get("/:event_id/booths", handlers.GetBooths)
	events.Post("/:event_id/booths", handlers.CreateBooth)

	// Event F&B Menu Categories
	events.Get("/:event_id/menu-categories", handlers.GetMenuCategories)
	events.Post("/:event_id/menu-categories", handlers.CreateMenuCategory)

	// Event F&B Menu Items
	events.Get("/:event_id/menu", handlers.GetMenuItems)
	events.Post("/:event_id/menu", handlers.CreateMenuItem)

	// Event Display Queue
	events.Get("/:event_id/display", handlers.GetDisplayQueue)
	events.Post("/:event_id/display", handlers.AddToDisplayQueue)
	events.Get("/:event_id/display/settings", handlers.GetDisplaySettings)

	// Event Scan Logs
	events.Get("/:event_id/scan-logs", handlers.GetScanLogs)
	events.Get("/:event_id/scan-logs/stats", handlers.GetScanLogStats)

	// ==================== PARTICIPANT ROUTES ====================
	participants := api.Group("/participants", middleware.AuthRequired())
	participants.Get("/qr/:qr_code", handlers.GetParticipantByQR)
	participants.Get("/:id", handlers.GetParticipant)
	participants.Put("/:id", handlers.UpdateParticipant)
	participants.Delete("/:id", handlers.DeleteParticipant)

	// ==================== TICKET TYPE ROUTES ====================
	tickets := api.Group("/tickets", middleware.AuthRequired())
	tickets.Put("/:id", handlers.UpdateTicketType)
	tickets.Delete("/:id", handlers.DeleteTicketType)

	// ==================== CHECK-IN ROUTES ====================
	checkin := api.Group("/checkin", middleware.AuthRequired())
	checkin.Post("/", handlers.Checkin)
	checkin.Post("/manual", handlers.ManualCheckin)
	checkin.Post("/undo/:id", handlers.UndoCheckin)
	checkin.Get("/history/:event_id", handlers.GetCheckinHistory)

	// ==================== CLAIMS ROUTES ====================
	claims := api.Group("/claims", middleware.AuthRequired())
	claims.Post("/", handlers.Claim)
	claims.Post("/quick", handlers.QuickClaim)
	claims.Get("/history/:event_id", handlers.GetClaimHistory)

	// ==================== F&B ROUTES ====================
	booths := api.Group("/booths", middleware.AuthRequired())
	booths.Put("/:id", handlers.UpdateBooth)
	booths.Delete("/:id", handlers.DeleteBooth)

	menuCategories := api.Group("/menu-categories", middleware.AuthRequired())
	menuCategories.Put("/:id", handlers.UpdateMenuCategory)
	menuCategories.Delete("/:id", handlers.DeleteMenuCategory)

	menuItems := api.Group("/menu-items", middleware.AuthRequired())
	menuItems.Put("/:id", handlers.UpdateMenuItem)
	menuItems.Delete("/:id", handlers.DeleteMenuItem)

	// ==================== DISPLAY ROUTES ====================
	display := api.Group("/display", middleware.AuthRequired())
	display.Put("/:id", handlers.MarkDisplayed)
	display.Delete("/:id", handlers.RemoveFromDisplayQueue)

	// ==================== CREDITS ROUTES ====================
	credits := api.Group("/credits", middleware.AuthRequired())
	credits.Get("/wallet", handlers.GetWallet)
	credits.Get("/transactions", handlers.GetCreditTransactions)
	credits.Post("/purchase", handlers.PurchaseCredits)

	// ==================== PRICING ROUTES ====================
	pricing := api.Group("/pricing")
	pricing.Get("/packages", handlers.GetPricingPackages)
	pricing.Post("/packages/:id/purchase", middleware.AuthRequired(), handlers.PurchasePackage)

	// ==================== SUPER ADMIN ROUTES ====================
	admin := api.Group("/admin", middleware.AuthRequired(), middleware.SuperAdminOnly())
	
	// Dashboard & Analytics
	admin.Get("/dashboard", handlers.GetAdminDashboard)
	admin.Get("/analytics", handlers.GetAdminAnalytics)
	
	// Tenant Management
	admin.Get("/tenants", handlers.GetAllTenants)
	admin.Get("/tenants/:id", handlers.GetTenantDetail)
	admin.Put("/tenants/:id", handlers.UpdateTenantStatus)
	admin.Put("/tenants/:id/suspend", handlers.SuspendTenant)
	admin.Put("/tenants/:id/activate", handlers.ActivateTenant)
	admin.Post("/tenants/:tenant_id/credits", handlers.AddCreditsToTenant)
	
	// User Management
	admin.Get("/users", handlers.GetAllUsers)
	admin.Get("/users/:id", handlers.GetUserDetail)
	admin.Put("/users/:id", handlers.UpdateUser)
	admin.Put("/users/:id/ban", handlers.BanUser)
	admin.Put("/users/:id/super-admin", handlers.SetSuperAdmin)
	
	// Billing
	admin.Get("/billing", handlers.GetBillingOverview)
	
	// Credit Settings
	admin.Get("/credit-settings", handlers.GetCreditSettings)
	admin.Put("/credit-settings", handlers.UpdateCreditSettings)

	// 404 handler
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Route not found",
		})
	})

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("Shutting down server...")
		if err := app.Shutdown(); err != nil {
			log.Fatal("Server forced to shutdown:", err)
		}
	}()

	// Start server
	log.Printf("🚀 Server starting on port %s", config.AppConfig.ServerPort)
	log.Printf("📡 API available at http://localhost:%s/api", config.AppConfig.ServerPort)
	log.Printf("❤️  Health check at http://localhost:%s/health", config.AppConfig.ServerPort)

	if err := app.Listen(":" + config.AppConfig.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
