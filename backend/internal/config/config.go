package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	ServerPort string
	AppEnv     string

	// Database - PostgreSQL (Cloud SQL or Supabase)
	DatabaseURL string

	// Cloud SQL specific
	CloudSQLInstance string // Format: project:region:instance
	UseCloudSQL      bool

	// JWT
	JWTSecret string

	// Google OAuth (Direct)
	GoogleClientID     string
	GoogleClientSecret string

	// GCP Storage
	GCSBucketName string
	GCPProjectID  string
	StorageType   string // "gcs" or "local"

	// Midtrans
	MidtransMerchantID string
	MidtransServerKey  string
	MidtransClientKey  string
	MidtransIsSandbox  bool

	// Frontend
	FrontendURL string

	// Upload
	UploadDir string
}

var AppConfig *Config

func LoadConfig() {
	// Load .env file
	godotenv.Load()

	port := getEnv("SERVER_PORT", "8080")

	AppConfig = &Config{
		// Server
		ServerPort: port,
		AppEnv:     getEnv("APP_ENV", "development"),

		// Database
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		CloudSQLInstance:  getEnv("CLOUD_SQL_INSTANCE", ""),
		UseCloudSQL:       getEnvBool("USE_CLOUD_SQL", false),

		// JWT
		JWTSecret: getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),

		// Google OAuth
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),

		// GCP Storage
		GCSBucketName: getEnv("GCS_BUCKET_NAME", ""),
		GCPProjectID:  getEnv("GCP_PROJECT_ID", ""),
		StorageType:   getEnv("STORAGE_TYPE", "local"),

		// Midtrans
		MidtransMerchantID: getEnv("MIDTRANS_MERCHANT_ID", ""),
		MidtransServerKey:  getEnv("MIDTRANS_SERVER_KEY", ""),
		MidtransClientKey:  getEnv("MIDTRANS_CLIENT_KEY", ""),
		MidtransIsSandbox:  getEnvBool("MIDTRANS_IS_SANDBOX", true),

		// Frontend
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),

		// Upload
		UploadDir: getEnv("UPLOAD_DIR", "./uploads"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		boolValue, err := strconv.ParseBool(value)
		if err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		intValue, err := strconv.Atoi(value)
		if err == nil {
			return intValue
		}
	}
	return defaultValue
}
