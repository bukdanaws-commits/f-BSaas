package database

import (
        "fmt"
        "log"
        "time"

        "github.com/eventify/backend/internal/config"
        "github.com/eventify/backend/internal/models"
        "gorm.io/driver/postgres"
        "gorm.io/gorm"
        "gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect establishes connection to Supabase PostgreSQL
func Connect() {
        cfg := config.AppConfig

        dsn := cfg.DatabaseURL
        if dsn == "" {
                log.Fatal("DATABASE_URL environment variable is required")
        }

        var err error
        
        // Configure GORM logger based on environment
        gormLogger := logger.Default
        if cfg.AppEnv == "development" {
                gormLogger = logger.Default.LogMode(logger.Info)
        } else {
                gormLogger = logger.Default.LogMode(logger.Silent)
        }

        DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
                Logger: gormLogger,
        })
        if err != nil {
                log.Fatalf("Failed to connect to database: %v", err)
        }

        // Get underlying SQL DB for connection pool settings
        sqlDB, err := DB.DB()
        if err != nil {
                log.Fatalf("Failed to get underlying SQL DB: %v", err)
        }

        // Configure connection pool
        sqlDB.SetMaxIdleConns(10)
        sqlDB.SetMaxOpenConns(100)
        sqlDB.SetConnMaxLifetime(time.Hour)

        log.Println("Connected to Supabase PostgreSQL database")
}

// Ping tests the database connection
func Ping() error {
        sqlDB, err := DB.DB()
        if err != nil {
                return err
        }
        return sqlDB.Ping()
}

// AutoMigrate runs auto migration for all models (optional - tables created via SQL)
func AutoMigrate() error {
        return DB.AutoMigrate(
                &models.User{},
                &models.PricingPackage{},
                &models.CreditSettings{},
                &models.Tenant{},
                &models.Membership{},
                &models.CreditWallet{},
                &models.CreditTransaction{},
                &models.Event{},
                &models.TicketType{},
                &models.Participant{},
                &models.Checkin{},
                &models.Booth{},
                &models.MenuCategory{},
                &models.MenuItem{},
                &models.Claim{},
                &models.DisplayQueue{},
                &models.ScanLog{},
        )
}
