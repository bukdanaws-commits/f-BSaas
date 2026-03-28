package handlers

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/eventify/backend/internal/config"
	"github.com/eventify/backend/internal/middleware"
	"github.com/eventify/backend/internal/storage"
	"github.com/eventify/backend/internal/utils"
	"github.com/gofiber/fiber/v2"
)

var fileStorage storage.StorageInterface

// StorageInterface defines the storage interface
type StorageInterface interface {
	UploadFile(file interface{}, header interface{}, folder string) (*storage.UploadResult, error)
	DeleteFile(filename string) error
}

// InitStorage initializes file storage
func InitStorage() error {
	storageType := os.Getenv("STORAGE_TYPE")
	if storageType == "" {
		storageType = "local" // Default to local storage
	}

	switch storageType {
	case "gcs":
		bucketName := os.Getenv("GCS_BUCKET_NAME")
		projectID := os.Getenv("GCP_PROJECT_ID")
		if bucketName == "" || projectID == "" {
			return utils.LogError("GCS_BUCKET_NAME and GCP_PROJECT_ID required for GCS storage")
		}

		gcsStorage, err := storage.NewGCSStorage(bucketName, projectID)
		if err != nil {
			return err
		}
		fileStorage = gcsStorage
		utils.LogInfo("GCS storage initialized: " + bucketName)

	default:
		uploadDir := os.Getenv("UPLOAD_DIR")
		if uploadDir == "" {
			uploadDir = "./uploads"
		}
		baseURL := config.AppConfig.FrontendURL

		localStorage, err := storage.NewLocalStorage(uploadDir, baseURL)
		if err != nil {
			return err
		}
		fileStorage = localStorage
		utils.LogInfo("Local storage initialized: " + uploadDir)
	}

	return nil
}

// UploadFile handles file upload
func UploadFile(c *fiber.Ctx) error {
	// Get authenticated user
	userID := middleware.GetUserID(c)
	if userID == "" {
		return utils.UnauthorizedResponse(c, "Authentication required")
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		return utils.BadRequestResponse(c, "File is required")
	}

	// Validate file size (max 10MB)
	maxSize := int64(10 * 1024 * 1024)
	if file.Size > maxSize {
		return utils.BadRequestResponse(c, "File size exceeds 10MB limit")
	}

	// Validate file type
	allowedTypes := []string{
		"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
		"application/pdf",
	}
	contentType := file.Header.Get("Content-Type")
	valid := false
	for _, t := range allowedTypes {
		if contentType == t {
			valid = true
			break
		}
	}
	if !valid {
		return utils.BadRequestResponse(c, "File type not allowed. Allowed: JPG, PNG, GIF, WEBP, PDF")
	}

	// Determine folder based on type
	folder := c.FormValue("folder", "uploads")
	folder = filepath.Join(folder, userID.String())

	// Open file
	fileHandle, err := file.Open()
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to open file")
	}
	defer fileHandle.Close()

	// Upload to storage
	result, err := fileStorage.UploadFile(fileHandle, file, folder)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to upload file: "+err.Error())
	}

	return utils.SuccessResponse(c, fiber.Map{
		"url":        result.PublicURL,
		"filename":   result.Filename,
		"size":       result.Size,
		"mime_type":  result.MimeType,
		"path":       result.URL,
	})
}

// UploadImage handles image upload (restricted to images only)
func UploadImage(c *fiber.Ctx) error {
	// Get authenticated user
	userID := middleware.GetUserID(c)
	if userID == "" {
		return utils.UnauthorizedResponse(c, "Authentication required")
	}

	// Get file from form
	file, err := c.FormFile("image")
	if err != nil {
		return utils.BadRequestResponse(c, "Image is required")
	}

	// Validate file size (max 5MB for images)
	maxSize := int64(5 * 1024 * 1024)
	if file.Size > maxSize {
		return utils.BadRequestResponse(c, "Image size exceeds 5MB limit")
	}

	// Validate file type (images only)
	allowedTypes := []string{
		"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
	}
	contentType := file.Header.Get("Content-Type")
	valid := false
	for _, t := range allowedTypes {
		if contentType == t {
			valid = true
			break
		}
	}
	if !valid {
		return utils.BadRequestResponse(c, "Only image files are allowed (JPG, PNG, GIF, WEBP)")
	}

	// Determine folder based on purpose
	purpose := c.FormValue("purpose", "general")
	folder := filepath.Join("images", purpose, userID.String())

	// Open file
	fileHandle, err := file.Open()
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to open file")
	}
	defer fileHandle.Close()

	// Upload to storage
	result, err := fileStorage.UploadFile(fileHandle, file, folder)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to upload image: "+err.Error())
	}

	return utils.SuccessResponse(c, fiber.Map{
		"url":       result.PublicURL,
		"filename":  result.Filename,
		"size":      result.Size,
		"mime_type": result.MimeType,
		"path":      result.URL,
	})
}

// DeleteFile handles file deletion
func DeleteFile(c *fiber.Ctx) error {
	// Get authenticated user
	userID := middleware.GetUserID(c)
	if userID == "" {
		return utils.UnauthorizedResponse(c, "Authentication required")
	}

	// Get filename from query
	filename := c.Query("filename")
	if filename == "" {
		return utils.BadRequestResponse(c, "Filename is required")
	}

	// Security check: ensure user owns the file
	if !strings.Contains(filename, userID.String()) {
		return utils.ForbiddenResponse(c, "You don't have permission to delete this file")
	}

	// Delete from storage
	if err := fileStorage.DeleteFile(filename); err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete file: "+err.Error())
	}

	return utils.SuccessResponse(c, fiber.Map{
		"message": "File deleted successfully",
	})
}

// UploadQRCode handles QR code image upload (for event QR codes)
func UploadQRCode(c *fiber.Ctx) error {
	// Get authenticated user
	userID := middleware.GetUserID(c)
	if userID == "" {
		return utils.UnauthorizedResponse(c, "Authentication required")
	}

	// Get event ID from form
	eventID := c.FormValue("event_id")
	if eventID == "" {
		return utils.BadRequestResponse(c, "Event ID is required")
	}

	// Get file from form
	file, err := c.FormFile("qr_code")
	if err != nil {
		return utils.BadRequestResponse(c, "QR code image is required")
	}

	// Validate file type (images only)
	allowedTypes := []string{"image/png", "image/svg+xml"}
	contentType := file.Header.Get("Content-Type")
	valid := false
	for _, t := range allowedTypes {
		if contentType == t {
			valid = true
			break
		}
	}
	if !valid {
		return utils.BadRequestResponse(c, "QR code must be PNG or SVG")
	}

	// Open file
	fileHandle, err := file.Open()
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to open file")
	}
	defer fileHandle.Close()

	// Upload to QR codes folder
	folder := filepath.Join("qrcodes", eventID)

	// Upload to storage
	result, err := fileStorage.UploadFile(fileHandle, file, folder)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to upload QR code: "+err.Error())
	}

	return utils.SuccessResponse(c, fiber.Map{
		"url":       result.PublicURL,
		"event_id":  eventID,
		"mime_type": result.MimeType,
	})
}
