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

// ==================== TICKET TYPES ====================

// GetTicketTypes returns ticket types for an event
func GetTicketTypes(c *fiber.Ctx) error {
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

	var ticketTypes []models.TicketType
	database.DB.Where("event_id = ?", eventID).Find(&ticketTypes)

	return utils.SuccessResponse(c, ticketTypes)
}

// CreateTicketType creates a new ticket type
func CreateTicketType(c *fiber.Ctx) error {
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
		Name     string                 `json:"name"`
		Price    int                    `json:"price"`
		Quota    int                    `json:"quota"`
		Features map[string]interface{} `json:"features"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name == "" {
		return utils.BadRequestResponse(c, "Name is required")
	}

	eventUUID, _ := uuid.Parse(eventID)

	ticketType := models.TicketType{
		ID:        uuid.New(),
		EventID:   eventUUID,
		Name:      req.Name,
		Price:     req.Price,
		Quota:     req.Quota,
		Features:  req.Features,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&ticketType).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create ticket type")
	}

	return utils.SuccessWithMessage(c, "Ticket type created successfully", ticketType)
}

// UpdateTicketType updates a ticket type
func UpdateTicketType(c *fiber.Ctx) error {
	ticketTypeID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var ticketType models.TicketType
	if err := database.DB.First(&ticketType, "id = ?", ticketTypeID).Error; err != nil {
		return utils.NotFoundResponse(c, "Ticket type not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", ticketType.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	var req struct {
		Name     string                 `json:"name"`
		Price    int                    `json:"price"`
		Quota    int                    `json:"quota"`
		Features map[string]interface{} `json:"features"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name != "" {
		ticketType.Name = req.Name
	}
	ticketType.Price = req.Price
	ticketType.Quota = req.Quota
	if req.Features != nil {
		ticketType.Features = req.Features
	}

	if err := database.DB.Save(&ticketType).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update ticket type")
	}

	return utils.SuccessWithMessage(c, "Ticket type updated successfully", ticketType)
}

// DeleteTicketType deletes a ticket type
func DeleteTicketType(c *fiber.Ctx) error {
	ticketTypeID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var ticketType models.TicketType
	if err := database.DB.First(&ticketType, "id = ?", ticketTypeID).Error; err != nil {
		return utils.NotFoundResponse(c, "Ticket type not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", ticketType.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	// Check if any participants are using this ticket type
	var count int64
	database.DB.Model(&models.Participant{}).Where("ticket_type_id = ?", ticketTypeID).Count(&count)
	if count > 0 {
		return utils.BadRequestResponse(c, "Cannot delete ticket type with participants")
	}

	if err := database.DB.Delete(&ticketType).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete ticket type")
	}

	return utils.SuccessWithMessage(c, "Ticket type deleted successfully", nil)
}

// ==================== BOOTHS ====================

// GetBooths returns booths for an event
func GetBooths(c *fiber.Ctx) error {
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

	var booths []models.Booth
	database.DB.Where("event_id = ?", eventID).Find(&booths)

	return utils.SuccessResponse(c, booths)
}

// CreateBooth creates a new booth
func CreateBooth(c *fiber.Ctx) error {
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
		Name string `json:"name"`
		Type string `json:"type"` // food, drink, both
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name == "" {
		return utils.BadRequestResponse(c, "Name is required")
	}
	if req.Type == "" {
		req.Type = "both"
	}

	eventUUID, _ := uuid.Parse(eventID)

	booth := models.Booth{
		ID:        uuid.New(),
		EventID:   eventUUID,
		Name:      req.Name,
		Type:      req.Type,
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&booth).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create booth")
	}

	return utils.SuccessWithMessage(c, "Booth created successfully", booth)
}

// UpdateBooth updates a booth
func UpdateBooth(c *fiber.Ctx) error {
	boothID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var booth models.Booth
	if err := database.DB.First(&booth, "id = ?", boothID).Error; err != nil {
		return utils.NotFoundResponse(c, "Booth not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", booth.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	var req struct {
		Name     string `json:"name"`
		Type     string `json:"type"`
		IsActive bool   `json:"is_active"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name != "" {
		booth.Name = req.Name
	}
	if req.Type != "" {
		booth.Type = req.Type
	}
	booth.IsActive = req.IsActive

	if err := database.DB.Save(&booth).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update booth")
	}

	return utils.SuccessWithMessage(c, "Booth updated successfully", booth)
}

// DeleteBooth deletes a booth
func DeleteBooth(c *fiber.Ctx) error {
	boothID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var booth models.Booth
	if err := database.DB.First(&booth, "id = ?", boothID).Error; err != nil {
		return utils.NotFoundResponse(c, "Booth not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", booth.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	if err := database.DB.Delete(&booth).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete booth")
	}

	return utils.SuccessWithMessage(c, "Booth deleted successfully", nil)
}

// ==================== MENU CATEGORIES ====================

// GetMenuCategories returns menu categories for an event
func GetMenuCategories(c *fiber.Ctx) error {
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

	var categories []models.MenuCategory
	database.DB.Where("event_id = ?", eventID).Find(&categories)

	return utils.SuccessResponse(c, categories)
}

// CreateMenuCategory creates a new menu category
func CreateMenuCategory(c *fiber.Ctx) error {
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
		Name string `json:"name"`
		Type string `json:"type"` // food, drink
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name == "" {
		return utils.BadRequestResponse(c, "Name is required")
	}
	if req.Type == "" {
		return utils.BadRequestResponse(c, "Type is required")
	}

	eventUUID, _ := uuid.Parse(eventID)

	category := models.MenuCategory{
		ID:        uuid.New(),
		EventID:   eventUUID,
		Name:      req.Name,
		Type:      req.Type,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&category).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create category")
	}

	return utils.SuccessWithMessage(c, "Category created successfully", category)
}

// UpdateMenuCategory updates a menu category
func UpdateMenuCategory(c *fiber.Ctx) error {
	categoryID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var category models.MenuCategory
	if err := database.DB.First(&category, "id = ?", categoryID).Error; err != nil {
		return utils.NotFoundResponse(c, "Category not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", category.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	var req struct {
		Name string `json:"name"`
		Type string `json:"type"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Type != "" {
		category.Type = req.Type
	}

	if err := database.DB.Save(&category).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update category")
	}

	return utils.SuccessWithMessage(c, "Category updated successfully", category)
}

// DeleteMenuCategory deletes a menu category
func DeleteMenuCategory(c *fiber.Ctx) error {
	categoryID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var category models.MenuCategory
	if err := database.DB.First(&category, "id = ?", categoryID).Error; err != nil {
		return utils.NotFoundResponse(c, "Category not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", category.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	// Set category_id to null for menu items in this category
	database.DB.Model(&models.MenuItem{}).Where("category_id = ?", category.ID).Update("category_id", nil)

	if err := database.DB.Delete(&category).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete category")
	}

	return utils.SuccessWithMessage(c, "Category deleted successfully", nil)
}

// ==================== MENU ITEMS ====================

// UpdateMenuItem updates a menu item
func UpdateMenuItem(c *fiber.Ctx) error {
	itemID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var item models.MenuItem
	if err := database.DB.First(&item, "id = ?", itemID).Error; err != nil {
		return utils.NotFoundResponse(c, "Menu item not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", item.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	var req struct {
		Name       string `json:"name"`
		CategoryID string `json:"category_id"`
		Stock      int    `json:"stock"`
		IsActive   bool   `json:"is_active"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name != "" {
		item.Name = req.Name
	}
	if req.CategoryID != "" {
		cid, _ := uuid.Parse(req.CategoryID)
		item.CategoryID = &cid
	}
	item.Stock = req.Stock
	item.IsActive = req.IsActive

	if err := database.DB.Save(&item).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update menu item")
	}

	return utils.SuccessWithMessage(c, "Menu item updated successfully", item)
}

// DeleteMenuItem deletes a menu item
func DeleteMenuItem(c *fiber.Ctx) error {
	itemID := c.Params("id")
	tenantID := middleware.GetTenantID(c)

	var item models.MenuItem
	if err := database.DB.First(&item, "id = ?", itemID).Error; err != nil {
		return utils.NotFoundResponse(c, "Menu item not found")
	}

	// Verify tenant access
	var event models.Event
	if err := database.DB.First(&event, "id = ?", item.EventID).Error; err != nil {
		return utils.NotFoundResponse(c, "Event not found")
	}
	if tenantID != "" && event.TenantID.String() != tenantID {
		return utils.ForbiddenResponse(c, "Access denied")
	}

	if err := database.DB.Delete(&item).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete menu item")
	}

	return utils.SuccessWithMessage(c, "Menu item deleted successfully", nil)
}
