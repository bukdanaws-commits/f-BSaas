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

	// Database - Supabase
	DatabaseURL string

	// JWT
	JWTSecret string

	// Google OAuth
	GoogleClientID     string
	GoogleClientSecret string

	// Supabase
	SupabaseURL        string
	SupabaseAnonKey    string
	SupabaseServiceKey string

	// Midtrans
	MidtransMerchantID string
	MidtransServerKey  string
	MidtransClientKey  string
	MidtransIsSandbox  bool

	// Frontend
	FrontendURL string
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
		DatabaseURL: getEnv("DATABASE_URL", ""),

		// JWT
		JWTSecret: getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),

		// Google OAuth
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),

		// Supabase
		SupabaseURL:        getEnv("SUPABASE_URL", ""),
		SupabaseAnonKey:    getEnv("SUPABASE_ANON_KEY", ""),
		SupabaseServiceKey: getEnv("SUPABASE_SERVICE_KEY", ""),

		// Midtrans
		MidtransMerchantID: getEnv("MIDTRANS_MERCHANT_ID", ""),
		MidtransServerKey:  getEnv("MIDTRANS_SERVER_KEY", ""),
		MidtransClientKey:  getEnv("MIDTRANS_CLIENT_KEY", ""),
		MidtransIsSandbox:  getEnvBool("MIDTRANS_IS_SANDBOX", true),

		// Frontend
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
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
