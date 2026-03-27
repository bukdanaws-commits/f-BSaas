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

// CreateEventRequest represents event creation request
type CreateEventRequest struct {
        Name                  string     `json:"name"`
        Title                 string     `json:"title"`
        Description           string     `json:"description"`
        BannerURL             string     `json:"banner_url"`
        StartDate             *time.Time `json:"start_date"`
        EndDate               *time.Time `json:"end_date"`
        Location              string     `json:"location"`
        Category              string     `json:"category"`
        Capacity              int        `json:"capacity"`
        WelcomeMessage        string     `json:"welcome_message"`
        DisplayDuration       int        `json:"display_duration"`
        EnableSound           bool       `json:"enable_sound"`
        CheckInDesks          int        `json:"check_in_desks"`
        DefaultMaxFoodClaims  int        `json:"default_max_food_claims"`
        DefaultMaxDrinkClaims int        `json:"default_max_drink_claims"`
        StorageDays           int        `json:"storage_days"`
}

// UpdateEventRequest represents event update request
type UpdateEventRequest struct {
        Name                  string     `json:"name"`
        Title                 string     `json:"title"`
        Description           string     `json:"description"`
        BannerURL             string     `json:"banner_url"`
        StartDate             *time.Time `json:"start_date"`
        EndDate               *time.Time `json:"end_date"`
        Location              string     `json:"location"`
        Category              string     `json:"category"`
        Capacity              int        `json:"capacity"`
        WelcomeMessage        string     `json:"welcome_message"`
        DisplayDuration       int        `json:"display_duration"`
        EnableSound           bool       `json:"enable_sound"`
        CheckInDesks          int        `json:"check_in_desks"`
        DefaultMaxFoodClaims  int        `json:"default_max_food_claims"`
        DefaultMaxDrinkClaims int        `json:"default_max_drink_claims"`
        StorageDays           int        `json:"storage_days"`
        Status                string     `json:"status"`
}

// GetEvents returns all events for current tenant
func GetEvents(c *fiber.Ctx) error {
        tenantID := middleware.GetTenantID(c)
        if tenantID == "" {
                return utils.BadRequestResponse(c, "No tenant associated with user")
        }

        var events []models.Event
        query := database.DB.Where("tenant_id = ?", tenantID)

        // Filter by status if provided
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        // Search by name
        if search := c.Query("search"); search != "" {
                query = query.Where("name ILIKE ?", "%"+search+"%")
        }

        // Order by created_at desc
        query = query.Order("created_at DESC")

        if err := query.Find(&events).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to fetch events")
        }

        return utils.SuccessResponse(c, events)
}

// GetEvent returns a single event by ID
func GetEvent(c *fiber.Ctx) error {
        eventID := c.Params("id")
        tenantID := middleware.GetTenantID(c)

        var event models.Event
        query := database.DB.Where("id = ?", eventID)

        // Non-super admin can only see their own tenant's events
        if tenantID != "" {
                query = query.Where("tenant_id = ?", tenantID)
        }

        if err := query.First(&event).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        // Load ticket types
        var ticketTypes []models.TicketType
        database.DB.Where("event_id = ?", event.ID).Find(&ticketTypes)
        
        // Count participants
        var participantCount int64
        database.DB.Model(&models.Participant{}).Where("event_id = ?", event.ID).Count(&participantCount)

        return utils.SuccessResponse(c, fiber.Map{
                "event":            event,
                "ticket_types":     ticketTypes,
                "participant_count": participantCount,
        })
}

// CreateEvent creates a new event
func CreateEvent(c *fiber.Ctx) error {
        tenantID := middleware.GetTenantID(c)
        if tenantID == "" {
                return utils.BadRequestResponse(c, "No tenant associated with user")
        }

        var req CreateEventRequest
        if err := c.BodyParser(&req); err != nil {
                return utils.BadRequestResponse(c, "Invalid request body")
        }

        // Validate required fields
        if req.Name == "" {
                return utils.BadRequestResponse(c, "Event name is required")
        }

        // Set defaults
        if req.Capacity == 0 {
                req.Capacity = 500
        }
        if req.DisplayDuration == 0 {
                req.DisplayDuration = 5
        }
        if req.CheckInDesks == 0 {
                req.CheckInDesks = 4
        }
        if req.DefaultMaxFoodClaims == 0 {
                req.DefaultMaxFoodClaims = 4
        }
        if req.DefaultMaxDrinkClaims == 0 {
                req.DefaultMaxDrinkClaims = 2
        }
        if req.StorageDays == 0 {
                req.StorageDays = 15
        }
        if req.WelcomeMessage == "" {
                req.WelcomeMessage = "Selamat Datang!"
        }

        tenantUUID, _ := uuid.Parse(tenantID)

        event := models.Event{
                ID:                    uuid.New(),
                TenantID:              tenantUUID,
                Name:                  req.Name,
                Title:                 req.Title,
                Description:           req.Description,
                BannerURL:             req.BannerURL,
                StartDate:             req.StartDate,
                EndDate:               req.EndDate,
                Location:              req.Location,
                Category:              req.Category,
                Capacity:              req.Capacity,
                WelcomeMessage:        req.WelcomeMessage,
                DisplayDuration:       req.DisplayDuration,
                EnableSound:           req.EnableSound,
                CheckInDesks:          req.CheckInDesks,
                DefaultMaxFoodClaims:  req.DefaultMaxFoodClaims,
                DefaultMaxDrinkClaims: req.DefaultMaxDrinkClaims,
                StorageDays:           req.StorageDays,
                Status:                "draft",
                CreatedAt:             time.Now(),
                UpdatedAt:             time.Now(),
        }

        if err := database.DB.Create(&event).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to create event")
        }

        return utils.SuccessWithMessage(c, "Event created successfully", event)
}

// UpdateEvent updates an existing event
func UpdateEvent(c *fiber.Ctx) error {
        eventID := c.Params("id")
        tenantID := middleware.GetTenantID(c)

        var event models.Event
        query := database.DB.Where("id = ?", eventID)

        // Non-super admin can only update their own tenant's events
        if tenantID != "" {
                query = query.Where("tenant_id = ?", tenantID)
        }

        if err := query.First(&event).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        var req UpdateEventRequest
        if err := c.BodyParser(&req); err != nil {
                return utils.BadRequestResponse(c, "Invalid request body")
        }

        // Update fields
        if req.Name != "" {
                event.Name = req.Name
        }
        if req.Title != "" {
                event.Title = req.Title
        }
        if req.Description != "" {
                event.Description = req.Description
        }
        if req.BannerURL != "" {
                event.BannerURL = req.BannerURL
        }
        if req.StartDate != nil {
                event.StartDate = req.StartDate
        }
        if req.EndDate != nil {
                event.EndDate = req.EndDate
        }
        if req.Location != "" {
                event.Location = req.Location
        }
        if req.Category != "" {
                event.Category = req.Category
        }
        if req.Capacity > 0 {
                event.Capacity = req.Capacity
        }
        if req.WelcomeMessage != "" {
                event.WelcomeMessage = req.WelcomeMessage
        }
        if req.DisplayDuration > 0 {
                event.DisplayDuration = req.DisplayDuration
        }
        event.EnableSound = req.EnableSound
        if req.CheckInDesks > 0 {
                event.CheckInDesks = req.CheckInDesks
        }
        if req.DefaultMaxFoodClaims > 0 {
                event.DefaultMaxFoodClaims = req.DefaultMaxFoodClaims
        }
        if req.DefaultMaxDrinkClaims > 0 {
                event.DefaultMaxDrinkClaims = req.DefaultMaxDrinkClaims
        }
        if req.StorageDays > 0 {
                event.StorageDays = req.StorageDays
        }
        if req.Status != "" {
                event.Status = req.Status
        }

        event.UpdatedAt = time.Now()

        if err := database.DB.Save(&event).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to update event")
        }

        return utils.SuccessWithMessage(c, "Event updated successfully", event)
}

// DeleteEvent deletes an event
func DeleteEvent(c *fiber.Ctx) error {
        eventID := c.Params("id")
        tenantID := middleware.GetTenantID(c)

        var event models.Event
        query := database.DB.Where("id = ?", eventID)

        // Non-super admin can only delete their own tenant's events
        if tenantID != "" {
                query = query.Where("tenant_id = ?", tenantID)
        }

        if err := query.First(&event).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        // Delete related records first (cascade)
        database.DB.Where("event_id = ?", event.ID).Delete(&models.TicketType{})
        database.DB.Where("event_id = ?", event.ID).Delete(&models.Participant{})
        database.DB.Where("event_id = ?", event.ID).Delete(&models.Checkin{})
        database.DB.Where("event_id = ?", event.ID).Delete(&models.Booth{})
        database.DB.Where("event_id = ?", event.ID).Delete(&models.MenuCategory{})
        database.DB.Where("event_id = ?", event.ID).Delete(&models.MenuItem{})
        database.DB.Where("event_id = ?", event.ID).Delete(&models.Claim{})
        database.DB.Where("event_id = ?", event.ID).Delete(&models.DisplayQueue{})

        // Delete event
        if err := database.DB.Delete(&event).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to delete event")
        }

        return utils.SuccessWithMessage(c, "Event deleted successfully", nil)
}

// DuplicateEvent duplicates an event
func DuplicateEvent(c *fiber.Ctx) error {
        eventID := c.Params("id")
        tenantID := middleware.GetTenantID(c)

        var originalEvent models.Event
        query := database.DB.Where("id = ?", eventID)

        if tenantID != "" {
                query = query.Where("tenant_id = ?", tenantID)
        }

        if err := query.First(&originalEvent).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        // Create new event
        tenantUUID, _ := uuid.Parse(tenantID)
        newEvent := models.Event{
                ID:                    uuid.New(),
                TenantID:              tenantUUID,
                Name:                  originalEvent.Name + " (Copy)",
                Title:                 originalEvent.Title,
                Description:           originalEvent.Description,
                BannerURL:             originalEvent.BannerURL,
                Location:              originalEvent.Location,
                Category:              originalEvent.Category,
                Capacity:              originalEvent.Capacity,
                WelcomeMessage:        originalEvent.WelcomeMessage,
                DisplayDuration:       originalEvent.DisplayDuration,
                EnableSound:           originalEvent.EnableSound,
                CheckInDesks:          originalEvent.CheckInDesks,
                DefaultMaxFoodClaims:  originalEvent.DefaultMaxFoodClaims,
                DefaultMaxDrinkClaims: originalEvent.DefaultMaxDrinkClaims,
                StorageDays:           originalEvent.StorageDays,
                Status:                "draft",
                CreatedAt:             time.Now(),
                UpdatedAt:             time.Now(),
        }

        if err := database.DB.Create(&newEvent).Error; err != nil {
                return utils.InternalServerErrorResponse(c, "Failed to duplicate event")
        }

        // Duplicate ticket types
        var ticketTypes []models.TicketType
        database.DB.Where("event_id = ?", originalEvent.ID).Find(&ticketTypes)

        for _, tt := range ticketTypes {
                newTT := models.TicketType{
                        ID:        uuid.New(),
                        EventID:   newEvent.ID,
                        Name:      tt.Name,
                        Price:     tt.Price,
                        Quota:     tt.Quota,
                        Features:  tt.Features,
                        CreatedAt: time.Now(),
                }
                database.DB.Create(&newTT)
        }

        return utils.SuccessWithMessage(c, "Event duplicated successfully", newEvent)
}

// GetEventStats returns statistics for an event
func GetEventStats(c *fiber.Ctx) error {
        eventID := c.Params("id")
        tenantID := middleware.GetTenantID(c)

        var event models.Event
        query := database.DB.Where("id = ?", eventID)

        if tenantID != "" {
                query = query.Where("tenant_id = ?", tenantID)
        }

        if err := query.First(&event).Error; err != nil {
                return utils.NotFoundResponse(c, "Event not found")
        }

        // Count participants
        var totalParticipants int64
        var checkedIn int64
        var notCheckedIn int64

        database.DB.Model(&models.Participant{}).Where("event_id = ?", event.ID).Count(&totalParticipants)
        database.DB.Model(&models.Participant{}).Where("event_id = ? AND is_checked_in = ?", event.ID, true).Count(&checkedIn)
        notCheckedIn = totalParticipants - checkedIn

        // Count claims
        var totalClaims int64
        var foodClaims int64
        var drinkClaims int64

        database.DB.Model(&models.Claim{}).Where("event_id = ?", event.ID).Count(&totalClaims)
        database.DB.Model(&models.Participant{}).Where("event_id = ?", event.ID).Select("COALESCE(SUM(food_claims), 0)").Scan(&foodClaims)
        database.DB.Model(&models.Participant{}).Where("event_id = ?", event.ID).Select("COALESCE(SUM(drink_claims), 0)").Scan(&drinkClaims)

        // Calculate check-in rate
        checkInRate := float64(0)
        if totalParticipants > 0 {
                checkInRate = float64(checkedIn) / float64(totalParticipants) * 100
        }

        return utils.SuccessResponse(c, fiber.Map{
                "total_participants": totalParticipants,
                "checked_in":         checkedIn,
                "not_checked_in":     notCheckedIn,
                "check_in_rate":      checkInRate,
                "total_claims":       totalClaims,
                "food_claims":        foodClaims,
                "drink_claims":       drinkClaims,
        })
}
