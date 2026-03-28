package utils

import (
	"time"

	"github.com/eventify/backend/internal/config"
	"github.com/eventify/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken generates a JWT token for a user
func GenerateToken(user *models.User, membership *models.Membership, tenant *models.Tenant) (string, error) {
	// Create claims
	claims := jwt.MapClaims{
		"user_id":       user.ID.String(),
		"email":         user.Email,
		"is_super_admin": user.IsSuperAdmin,
		"exp":           time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":           time.Now().Unix(),
	}

	// Add tenant info if available
	if membership != nil {
		claims["role"] = membership.Role
	}
	if tenant != nil {
		claims["tenant_id"] = tenant.ID.String()
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token
	tokenString, err := token.SignedString([]byte(config.AppConfig.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ParseToken parses and validates a JWT token
func ParseToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}
