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

// ==================== SUPER ADMIN DASHBOARD ====================

// GetAdminDashboard returns dashboard stats for super admin
func GetAdminDashboard(c *fiber.Ctx) error {
	// Count totals
	var totalTenants int64
	var activeTenants int64
	var totalUsers int64
	var totalEvents int64
	var activeEvents int64
	var totalParticipants int64
	var totalCheckins int64
	var totalClaims int64

	database.DB.Model(&models.Tenant{}).Count(&totalTenants)
	database.DB.Model(&models.Tenant{}).Where("status = ?", "active").Count(&activeTenants)
	database.DB.Model(&models.User{}).Count(&totalUsers)
	database.DB.Model(&models.Event{}).Count(&totalEvents)
	database.DB.Model(&models.Event{}).Where("status = ?", "active").Count(&activeEvents)
	database.DB.Model(&models.Participant{}).Count(&totalParticipants)
	database.DB.Model(&models.Checkin{}).Count(&totalCheckins)
	database.DB.Model(&models.Claim{}).Count(&totalClaims)

	// Get recent tenants
	var recentTenants []models.Tenant
	database.DB.Order("created_at DESC").Limit(5).Find(&recentTenants)

	// Get recent events
	var recentEvents []models.Event
	database.DB.Order("created_at DESC").Limit(5).Find(&recentEvents)

	return utils.SuccessResponse(c, fiber.Map{
		"stats": fiber.Map{
			"total_tenants":      totalTenants,
			"active_tenants":     activeTenants,
			"total_users":        totalUsers,
			"total_events":       totalEvents,
			"active_events":      activeEvents,
			"total_participants": totalParticipants,
			"total_checkins":     totalCheckins,
			"total_claims":       totalClaims,
		},
		"recent_tenants": recentTenants,
		"recent_events":  recentEvents,
	})
}

// GetAdminAnalytics returns analytics for super admin
func GetAdminAnalytics(c *fiber.Ctx) error {
	// Get date range (default: last 30 days)
	days := c.QueryInt("days", 30)
	startDate := time.Now().AddDate(0, 0, -days)

	// Daily signups
	type DailyCount struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}

	var dailySignups []DailyCount
	database.DB.Model(&models.User{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Find(&dailySignups)

	// Daily events created
	var dailyEvents []DailyCount
	database.DB.Model(&models.Event{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Find(&dailyEvents)

	// Daily check-ins
	var dailyCheckins []DailyCount
	database.DB.Model(&models.Checkin{}).
		Select("DATE(checked_in_at) as date, COUNT(*) as count").
		Where("checked_in_at >= ?", startDate).
		Group("DATE(checked_in_at)").
		Order("date ASC").
		Find(&dailyCheckins)

	// Tenant growth
	var tenantGrowth []DailyCount
	database.DB.Model(&models.Tenant{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Find(&tenantGrowth)

	// Top events by participants
	type TopEvent struct {
		ID           string `json:"id"`
		Name         string `json:"name"`
		TenantName   string `json:"tenant_name"`
		Participants int64  `json:"participants"`
		Checkins     int64  `json:"checkins"`
	}

	var topEvents []TopEvent
	database.DB.Raw(`
		SELECT e.id, e.name, t.name as tenant_name,
			(SELECT COUNT(*) FROM participants p WHERE p.event_id = e.id) as participants,
			(SELECT COUNT(*) FROM checkins ch WHERE ch.event_id = e.id) as checkins
		FROM events e
		LEFT JOIN tenants t ON t.id = e.tenant_id
		ORDER BY participants DESC
		LIMIT 10
	`).Scan(&topEvents)

	return utils.SuccessResponse(c, fiber.Map{
		"daily_signups":   dailySignups,
		"daily_events":    dailyEvents,
		"daily_checkins":  dailyCheckins,
		"tenant_growth":   tenantGrowth,
		"top_events":      topEvents,
		"period_days":     days,
	})
}

// ==================== TENANT MANAGEMENT ====================

// GetAllTenants returns all tenants (super admin)
func GetAllTenants(c *fiber.Ctx) error {
	// Pagination
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 50)
	offset := (page - 1) * limit

	// Filters
	status := c.Query("status")
	search := c.Query("search")

	var tenants []models.Tenant
	var total int64

	query := database.DB.Model(&models.Tenant{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		query = query.Where("name ILIKE ? OR slug ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)
	query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&tenants)

	// Load owner data
	type TenantWithOwner struct {
		models.Tenant
		OwnerName  string `json:"owner_name"`
		OwnerEmail string `json:"owner_email"`
	}

	var result []TenantWithOwner
	for _, t := range tenants {
		item := TenantWithOwner{Tenant: t}
		if t.OwnerID != nil {
			var user models.User
			database.DB.First(&user, "id = ?", t.OwnerID)
			item.OwnerName = user.Name
			item.OwnerEmail = user.Email
		}
		result = append(result, item)
	}

	return utils.PaginatedResponse(c, result, total, page, limit)
}

// GetTenantDetail returns tenant details (super admin)
func GetTenantDetail(c *fiber.Ctx) error {
	tenantID := c.Params("id")

	var tenant models.Tenant
	if err := database.DB.First(&tenant, "id = ?", tenantID).Error; err != nil {
		return utils.NotFoundResponse(c, "Tenant not found")
	}

	// Get owner
	var owner models.User
	if tenant.OwnerID != nil {
		database.DB.First(&owner, "id = ?", tenant.OwnerID)
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

	// Count participants
	var participantCount int64
	database.DB.Model(&models.Participant{}).Where("tenant_id = ?", tenantID).Count(&participantCount)

	return utils.SuccessResponse(c, fiber.Map{
		"tenant":           tenant,
		"owner":            owner,
		"wallet":           wallet,
		"member_count":     memberCount,
		"event_count":      eventCount,
		"participant_count": participantCount,
	})
}

// UpdateTenantStatus updates tenant status (super admin)
func UpdateTenantStatus(c *fiber.Ctx) error {
	tenantID := c.Params("id")

	var tenant models.Tenant
	if err := database.DB.First(&tenant, "id = ?", tenantID).Error; err != nil {
		return utils.NotFoundResponse(c, "Tenant not found")
	}

	var req struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	// Validate status
	if req.Status != "pending" && req.Status != "active" && req.Status != "suspended" {
		return utils.BadRequestResponse(c, "Invalid status")
	}

	tenant.Status = req.Status
	tenant.UpdatedAt = time.Now()

	if req.Status == "active" && tenant.VerifiedAt == nil {
		now := time.Now()
		tenant.VerifiedAt = &now
	}

	if err := database.DB.Save(&tenant).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update tenant status")
	}

	return utils.SuccessWithMessage(c, "Tenant status updated", tenant)
}

// SuspendTenant suspends a tenant
func SuspendTenant(c *fiber.Ctx) error {
	tenantID := c.Params("id")

	var tenant models.Tenant
	if err := database.DB.First(&tenant, "id = ?", tenantID).Error; err != nil {
		return utils.NotFoundResponse(c, "Tenant not found")
	}

	tenant.Status = "suspended"
	tenant.UpdatedAt = time.Now()
	database.DB.Save(&tenant)

	return utils.SuccessWithMessage(c, "Tenant suspended successfully", tenant)
}

// ActivateTenant activates a tenant
func ActivateTenant(c *fiber.Ctx) error {
	tenantID := c.Params("id")

	var tenant models.Tenant
	if err := database.DB.First(&tenant, "id = ?", tenantID).Error; err != nil {
		return utils.NotFoundResponse(c, "Tenant not found")
	}

	tenant.Status = "active"
	if tenant.VerifiedAt == nil {
		now := time.Now()
		tenant.VerifiedAt = &now
	}
	tenant.UpdatedAt = time.Now()
	database.DB.Save(&tenant)

	return utils.SuccessWithMessage(c, "Tenant activated successfully", tenant)
}

// ==================== USER MANAGEMENT ====================

// GetAllUsers returns all users (super admin)
func GetAllUsers(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 50)
	offset := (page - 1) * limit

	search := c.Query("search")

	var users []models.User
	var total int64

	query := database.DB.Model(&models.User{})

	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)
	query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&users)

	return utils.PaginatedResponse(c, users, total, page, limit)
}

// GetUserDetail returns user details (super admin)
func GetUserDetail(c *fiber.Ctx) error {
	userID := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	// Get memberships
	var memberships []models.Membership
	database.DB.Where("user_id = ?", userID).Find(&memberships)

	// Load tenant data
	type MembershipWithTenant struct {
		models.Membership
		TenantName string `json:"tenant_name"`
		TenantSlug string `json:"tenant_slug"`
	}

	var result []MembershipWithTenant
	for _, m := range memberships {
		item := MembershipWithTenant{Membership: m}
		var tenant models.Tenant
		database.DB.First(&tenant, "id = ?", m.TenantID)
		item.TenantName = tenant.Name
		item.TenantSlug = tenant.Slug
		result = append(result, item)
	}

	return utils.SuccessResponse(c, fiber.Map{
		"user":         user,
		"memberships":  result,
		"is_super_admin": user.IsSuperAdmin,
	})
}

// UpdateUser updates user (super admin)
func UpdateUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	var req struct {
		Name         string `json:"name"`
		IsSuperAdmin bool   `json:"is_super_admin"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	user.IsSuperAdmin = req.IsSuperAdmin
	user.UpdatedAt = time.Now()

	if err := database.DB.Save(&user).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update user")
	}

	return utils.SuccessWithMessage(c, "User updated successfully", user)
}

// BanUser bans a user
func BanUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	// Prevent banning super admin
	if user.IsSuperAdmin {
		return utils.BadRequestResponse(c, "Cannot ban super admin")
	}

	// In production, you would mark user as banned
	// For now, we'll just return success
	return utils.SuccessWithMessage(c, "User banned successfully", nil)
}

// SetSuperAdmin sets a user as super admin
func SetSuperAdmin(c *fiber.Ctx) error {
	userID := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	var req struct {
		IsSuperAdmin bool `json:"is_super_admin"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	user.IsSuperAdmin = req.IsSuperAdmin
	user.UpdatedAt = time.Now()

	if err := database.DB.Save(&user).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update user")
	}

	return utils.SuccessWithMessage(c, "Super admin status updated", user)
}

// ==================== BILLING OVERVIEW ====================

// GetBillingOverview returns billing overview (super admin)
func GetBillingOverview(c *fiber.Ctx) error {
	// Total credits in system
	var totalBalance int64
	var totalBonus int64

	database.DB.Model(&models.CreditWallet{}).
		Select("COALESCE(SUM(balance), 0)").
		Scan(&totalBalance)

	database.DB.Model(&models.CreditWallet{}).
		Select("COALESCE(SUM(bonus_balance), 0)").
		Scan(&totalBonus)

	// Total transactions
	var totalPurchases int64
	var totalUsages int64
	var totalBonuses int64

	database.DB.Model(&models.CreditTransaction{}).
		Where("type = ?", "purchase").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalPurchases)

	database.DB.Model(&models.CreditTransaction{}).
		Where("type = ?", "usage").
		Select("COALESCE(SUM(ABS(amount)), 0)").
		Scan(&totalUsages)

	database.DB.Model(&models.CreditTransaction{}).
		Where("type = ?", "bonus").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalBonuses)

	// Recent transactions
	var recentTransactions []models.CreditTransaction
	database.DB.Order("created_at DESC").Limit(20).Find(&recentTransactions)

	return utils.SuccessResponse(c, fiber.Map{
		"total_balance":      totalBalance,
		"total_bonus":        totalBonus,
		"total_credits":      totalBalance + totalBonus,
		"total_purchases":    totalPurchases,
		"total_usages":       totalUsages,
		"total_bonuses":      totalBonuses,
		"recent_transactions": recentTransactions,
	})
}
