package models

import (
	"time"

	"github.com/google/uuid"
)

// =====================================
// USER
// =====================================
type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Email        string    `json:"email" gorm:"unique;not null"`
	Name         string    `json:"name"`
	AvatarURL    string    `json:"avatar_url"`
	GoogleID     string    `json:"google_id" gorm:"unique"`
	IsSuperAdmin bool      `json:"is_super_admin" gorm:"default:false"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

// =====================================
// PRICING PACKAGE
// =====================================
type PricingPackage struct {
	ID              uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name            string    `json:"name" gorm:"not null"`
	Slug            string    `json:"slug" gorm:"unique;not null"`
	CreditsIncluded int       `json:"credits_included" gorm:"not null"`
	Price           int       `json:"price" gorm:"not null;default:0"`
	BonusCredits    int       `json:"bonus_credits" gorm:"default:0"`
	Features        JSONB     `json:"features" gorm:"type:jsonb;default:'{}'"`
	IsPopular       bool      `json:"is_popular" gorm:"default:false"`
	IsActive        bool      `json:"is_active" gorm:"default:true"`
	SortOrder       int       `json:"sort_order" gorm:"default:0"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (PricingPackage) TableName() string {
	return "pricing_packages"
}

// =====================================
// CREDIT SETTINGS
// =====================================
type CreditSettings struct {
	ID                  uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	DefaultFreeCredits  int       `json:"default_free_credits" gorm:"default:500"`
	DefaultBonusCredits int       `json:"default_bonus_credits" gorm:"default:50"`
	PricePerCredit      int       `json:"price_per_credit" gorm:"default:80"`
	MinCreditPurchase   int       `json:"min_credit_purchase" gorm:"default:100"`
	CreditPerCheckin    int       `json:"credit_per_checkin" gorm:"default:1"`
	CreditPerClaim      int       `json:"credit_per_claim" gorm:"default:1"`
	CreditPerAIPhoto    int       `json:"credit_per_ai_photo" gorm:"default:3"`
	UpdatedBy           uuid.UUID `json:"updated_by"`
	UpdatedAt           time.Time `json:"updated_at"`
}

func (CreditSettings) TableName() string {
	return "credit_settings"
}

// =====================================
// TENANT
// =====================================
type Tenant struct {
	ID                    uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name                  string     `json:"name" gorm:"not null"`
	Slug                  string     `json:"slug" gorm:"unique"`
	OwnerID               *uuid.UUID `json:"owner_id"`
	PackageID             *uuid.UUID `json:"package_id"`
	Status                string     `json:"status" gorm:"default:pending"`
	VerifiedAt            *time.Time `json:"verified_at"`
	SubscriptionExpiresAt *time.Time `json:"subscription_expires_at"`
	Phone                 string     `json:"phone"`
	Address               string     `json:"address"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

func (Tenant) TableName() string {
	return "tenants"
}

// =====================================
// MEMBERSHIP
// =====================================
type Membership struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"not null"`
	TenantID  uuid.UUID `json:"tenant_id" gorm:"not null"`
	Role      string    `json:"role" gorm:"default:crew"` // owner, admin, crew
	CreatedAt time.Time `json:"created_at"`
}

func (Membership) TableName() string {
	return "memberships"
}

// =====================================
// CREDIT WALLET
// =====================================
type CreditWallet struct {
	ID                 uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TenantID           uuid.UUID `json:"tenant_id" gorm:"unique;not null"`
	Balance            int       `json:"balance" gorm:"default:0"`
	BonusBalance       int       `json:"bonus_balance" gorm:"default:0"`
	TotalPurchased     int       `json:"total_purchased" gorm:"default:0"`
	TotalUsed          int       `json:"total_used" gorm:"default:0"`
	TotalBonusReceived int       `json:"total_bonus_received" gorm:"default:0"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (CreditWallet) TableName() string {
	return "credit_wallets"
}

// =====================================
// CREDIT TRANSACTION
// =====================================
type CreditTransaction struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TenantID      uuid.UUID  `json:"tenant_id" gorm:"not null"`
	Type          string     `json:"type" gorm:"not null"` // purchase, usage, bonus, refund
	Amount        int        `json:"amount" gorm:"not null"`
	ReferenceType string     `json:"reference_type"`
	ReferenceID   *uuid.UUID `json:"reference_id"`
	Description   string     `json:"description"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (CreditTransaction) TableName() string {
	return "credit_transactions"
}

// =====================================
// EVENT
// =====================================
type Event struct {
	ID                    uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TenantID              uuid.UUID  `json:"tenant_id" gorm:"not null"`
	Name                  string     `json:"name" gorm:"not null"`
	Title                 string     `json:"title"`
	Description           string     `json:"description"`
	BannerURL             string     `json:"banner_url"`
	StartDate             *time.Time `json:"start_date"`
	EndDate               *time.Time `json:"end_date"`
	Location              string     `json:"location"`
	Category              string     `json:"category"`
	Capacity              int        `json:"capacity" gorm:"default:0"`
	WelcomeMessage        string     `json:"welcome_message" gorm:"default:'Selamat Datang!'"`
	DisplayDuration       int        `json:"display_duration" gorm:"default:5"`
	EnableSound           bool       `json:"enable_sound" gorm:"default:false"`
	CheckInDesks          int        `json:"check_in_desks" gorm:"default:4"`
	EnableFood            bool       `json:"enable_food" gorm:"default:true"`
	EnableDrink           bool       `json:"enable_drink" gorm:"default:true"`
	MultiBoothMode        bool       `json:"multi_booth_mode" gorm:"default:true"`
	DefaultMaxFoodClaims  int        `json:"default_max_food_claims" gorm:"default:4"`
	DefaultMaxDrinkClaims int        `json:"default_max_drink_claims" gorm:"default:2"`
	StorageDays           int        `json:"storage_days" gorm:"default:15"`
	Status                string     `json:"status" gorm:"default:draft"` // draft, active, completed
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

func (Event) TableName() string {
	return "events"
}

// =====================================
// EVENT STAFF
// =====================================
type EventStaff struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID   uuid.UUID `json:"event_id" gorm:"not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"not null"`
	Role      string    `json:"role" gorm:"default:crew"`
	CreatedAt time.Time `json:"created_at"`
}

func (EventStaff) TableName() string {
	return "event_staff"
}

// =====================================
// TICKET TYPE
// =====================================
type TicketType struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID   uuid.UUID `json:"event_id" gorm:"not null"`
	Name      string    `json:"name" gorm:"not null"`
	Price     int       `json:"price" gorm:"default:0"`
	Quota     int       `json:"quota" gorm:"default:0"`
	Features  JSONB     `json:"features" gorm:"type:jsonb"`
	CreatedAt time.Time `json:"created_at"`
}

func (TicketType) TableName() string {
	return "ticket_types"
}

// =====================================
// PARTICIPANT
// =====================================
type Participant struct {
	ID                 uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TenantID           uuid.UUID  `json:"tenant_id" gorm:"not null"`
	EventID            uuid.UUID  `json:"event_id" gorm:"not null"`
	Name               string     `json:"name" gorm:"not null"`
	Email              string     `json:"email" gorm:"not null"`
	Phone              string     `json:"phone"`
	Company            string     `json:"company"`
	JobTitle           string     `json:"job_title"`
	DietaryRestrictions string    `json:"dietary_restrictions"`
	TicketTypeID       *uuid.UUID `json:"ticket_type_id"`
	QRCode             string     `json:"qr_code" gorm:"unique;not null"`
	OriginalPhotoURL   string     `json:"original_photo_url"`
	AIPhotoURL         string     `json:"ai_photo_url"`
	Bio                string     `json:"bio"`
	AIGenerationStatus string     `json:"ai_generation_status" gorm:"default:pending"`
	AIGeneratedAt      *time.Time `json:"ai_generated_at"`
	IsCheckedIn        bool       `json:"is_checked_in" gorm:"default:false"`
	CheckedInAt        *time.Time `json:"checked_in_at"`
	CheckinCount       int        `json:"checkin_count" gorm:"default:0"`
	FoodClaims         int        `json:"food_claims" gorm:"default:0"`
	DrinkClaims        int        `json:"drink_claims" gorm:"default:0"`
	MaxFoodClaims      int        `json:"max_food_claims" gorm:"default:4"`
	MaxDrinkClaims     int        `json:"max_drink_claims" gorm:"default:2"`
	IsActive           bool       `json:"is_active" gorm:"default:true"`
	IsBlacklisted      bool       `json:"is_blacklisted" gorm:"default:false"`
	Meta               JSONB      `json:"meta" gorm:"type:jsonb"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	ExpiresAt          *time.Time `json:"expires_at"`
}

func (Participant) TableName() string {
	return "participants"
}

// =====================================
// CHECKIN
// =====================================
type Checkin struct {
	ID            uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID       uuid.UUID `json:"event_id" gorm:"not null"`
	ParticipantID uuid.UUID `json:"participant_id" gorm:"unique;not null"`
	OperatorID    *uuid.UUID `json:"operator_id"`
	DeskNumber    int       `json:"desk_number" gorm:"default:1"`
	CheckedInAt   time.Time `json:"checked_in_at"`
}

func (Checkin) TableName() string {
	return "checkins"
}

// =====================================
// F&B - BOOTH
// =====================================
type Booth struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID     uuid.UUID `json:"event_id" gorm:"not null"`
	Name        string    `json:"name" gorm:"not null"`
	BoothType   string    `json:"booth_type" gorm:"column:booth_type;default:food"` // food, drink, both
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Booth) TableName() string {
	return "booths"
}

// =====================================
// F&B - MENU CATEGORY
// =====================================
type MenuCategory struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID   uuid.UUID `json:"event_id" gorm:"not null"`
	Name      string    `json:"name" gorm:"not null"`
	Type      string    `json:"type" gorm:"not null"` // food, drink
	CreatedAt time.Time `json:"created_at"`
}

func (MenuCategory) TableName() string {
	return "menu_categories"
}

// =====================================
// F&B - MENU ITEM
// =====================================
type MenuItem struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID      uuid.UUID  `json:"event_id" gorm:"not null"`
	BoothID      *uuid.UUID `json:"booth_id"`
	Name         string     `json:"name" gorm:"not null"`
	Description  string     `json:"description"`
	MenuType     string     `json:"menu_type" gorm:"column:menu_type;default:food"` // food, drink
	Stock        int        `json:"stock" gorm:"default:0"`
	InitialStock int        `json:"initial_stock" gorm:"default:0"`
	Claimed      int        `json:"claimed" gorm:"default:0"`
	Price        int        `json:"price" gorm:"default:0"`
	ImageURL     string     `json:"image_url"`
	IsActive     bool       `json:"is_active" gorm:"default:true"`
	SortOrder    int        `json:"sort_order" gorm:"default:0"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (MenuItem) TableName() string {
	return "menu_items"
}

// =====================================
// F&B - STOCK LOG
// =====================================
type StockLog struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TenantID      *uuid.UUID `json:"tenant_id"`
	EventID       uuid.UUID  `json:"event_id" gorm:"not null"`
	MenuItemID    uuid.UUID  `json:"menu_item_id" gorm:"not null"`
	BoothID       *uuid.UUID `json:"booth_id"`
	ChangeType    string     `json:"change_type" gorm:"not null"` // add, reduce, claim, adjustment, reset
	Quantity      int        `json:"quantity" gorm:"not null"`
	PreviousStock int        `json:"previous_stock" gorm:"not null"`
	NewStock      int        `json:"new_stock" gorm:"not null"`
	OperatorID    *uuid.UUID `json:"operator_id"`
	OperatorName  string     `json:"operator_name"`
	Notes         string     `json:"notes"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (StockLog) TableName() string {
	return "stock_logs"
}

// =====================================
// F&B - CLAIM
// =====================================
type Claim struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID       uuid.UUID  `json:"event_id" gorm:"not null"`
	ParticipantID uuid.UUID  `json:"participant_id" gorm:"not null"`
	MenuItemID    uuid.UUID  `json:"menu_item_id" gorm:"not null"`
	BoothID       *uuid.UUID `json:"booth_id"`
	OperatorID    *uuid.UUID `json:"operator_id"`
	ClaimedAt     time.Time  `json:"claimed_at"`
	Notes         string     `json:"notes"`
}

func (Claim) TableName() string {
	return "claims"
}

// =====================================
// DISPLAY QUEUE
// =====================================
type DisplayQueue struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EventID       uuid.UUID  `json:"event_id" gorm:"not null"`
	ParticipantID *uuid.UUID `json:"participant_id"`
	Name          string     `json:"name" gorm:"not null"`
	PhotoURL      string     `json:"photo_url"`
	IsDisplayed   bool       `json:"is_displayed" gorm:"default:false"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (DisplayQueue) TableName() string {
	return "display_queue"
}

// =====================================
// SCAN LOG
// =====================================
type ScanLog struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TenantID      *uuid.UUID `json:"tenant_id"`
	EventID       *uuid.UUID `json:"event_id"`
	ParticipantID *uuid.UUID `json:"participant_id"`
	Type          string     `json:"type"`   // checkin, claim
	Result        string     `json:"result"` // success, failed, duplicate
	Device        string     `json:"device"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (ScanLog) TableName() string {
	return "scan_logs"
}

// =====================================
// JSONB Type
// =====================================
type JSONB map[string]interface{}

// =====================================
// USER CONTEXT (for middleware)
// =====================================
type UserContext struct {
	UserID       string
	Email        string
	Name         string
	IsSuperAdmin bool
	Role         string
	TenantID     string
}

// =====================================
// API RESPONSE TYPES
// =====================================
type ApiResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type PaginatedResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Total   int64       `json:"total"`
	Page    int         `json:"page"`
	Limit   int         `json:"limit"`
}

type AuthResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Token   string `json:"token,omitempty"`
	User    *User  `json:"user,omitempty"`
}
