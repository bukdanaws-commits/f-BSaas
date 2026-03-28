package storage

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"google.golang.org/api/option"
)

// GCSStorage handles Google Cloud Storage operations
type GCSStorage struct {
	client     *storage.Client
	bucketName string
	projectID  string
}

// UploadResult contains upload result information
type UploadResult struct {
	URL       string `json:"url"`
	PublicURL string `json:"public_url"`
	Filename  string `json:"filename"`
	Size      int64  `json:"size"`
	MimeType  string `json:"mime_type"`
}

// NewGCSStorage creates a new GCS storage client
func NewGCSStorage(bucketName, projectID string) (*GCSStorage, error) {
	ctx := context.Background()

	var client *storage.Client
	var err error

	// Check if running in GCP (use default credentials)
	// Or use credentials file from env
	credentialsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if credentialsFile != "" {
		client, err = storage.NewClient(ctx, option.WithCredentialsFile(credentialsFile))
	} else {
		// Use default credentials (ADC) when running in GCP
		client, err = storage.NewClient(ctx)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create GCS client: %w", err)
	}

	return &GCSStorage{
		client:     client,
		bucketName: bucketName,
		projectID:  projectID,
	}, nil
}

// UploadFile uploads a file to GCS
func (s *GCSStorage) UploadFile(file multipart.File, header *multipart.FileHeader, folder string) (*UploadResult, error) {
	ctx := context.Background()

	// Detect content type
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
		// Try to detect from file extension
		ext := filepath.Ext(header.Filename)
		switch ext {
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".png":
			contentType = "image/png"
		case ".gif":
			contentType = "image/gif"
		case ".webp":
			contentType = "image/webp"
		case ".pdf":
			contentType = "application/pdf"
		case ".svg":
			contentType = "image/svg+xml"
		}
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s/%s%s", folder, uuid.New().String(), ext)

	// Upload to GCS
	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)

	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType
	writer.CacheControl = "public, max-age=31536000" // 1 year cache

	// Set ACL to public read (if bucket allows)
	writer.PredefinedACL = "publicRead"

	// Copy file content
	written, err := io.Copy(writer, file)
	if err != nil {
		return nil, fmt.Errorf("failed to write file to GCS: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close GCS writer: %w", err)
	}

	// Generate public URL
	publicURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, filename)

	return &UploadResult{
		URL:       filename,
		PublicURL: publicURL,
		Filename:  header.Filename,
		Size:      written,
		MimeType:  contentType,
	}, nil
}

// UploadFromBytes uploads bytes to GCS
func (s *GCSStorage) UploadFromBytes(data []byte, filename, contentType string) (*UploadResult, error) {
	ctx := context.Background()

	// Generate unique filename if not provided
	if filename == "" {
		ext := ""
		switch contentType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/webp":
			ext = ".webp"
		default:
			ext = ".bin"
		}
		filename = fmt.Sprintf("uploads/%s%s", uuid.New().String(), ext)
	}

	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)

	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType
	writer.CacheControl = "public, max-age=31536000"
	writer.PredefinedACL = "publicRead"

	written, err := writer.Write(data)
	if err != nil {
		return nil, fmt.Errorf("failed to write to GCS: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close GCS writer: %w", err)
	}

	publicURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, filename)

	return &UploadResult{
		URL:       filename,
		PublicURL: publicURL,
		Filename:  filename,
		Size:      int64(written),
		MimeType:  contentType,
	}, nil
}

// GetSignedURL generates a signed URL for private access
func (s *GCSStorage) GetSignedURL(filename string, expiry time.Duration) (string, error) {
	ctx := context.Background()

	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)

	opts := &storage.SignedURLOptions{
		Scheme:  storage.SigningSchemeV4,
		Method:  "GET",
		Expires: time.Now().Add(expiry),
	}

	url, err := obj.SignedURL(opts)
	if err != nil {
		return "", fmt.Errorf("failed to generate signed URL: %w", err)
	}

	return url, nil
}

// DeleteFile deletes a file from GCS
func (s *GCSStorage) DeleteFile(filename string) error {
	ctx := context.Background()

	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)

	if err := obj.Delete(ctx); err != nil {
		return fmt.Errorf("failed to delete file from GCS: %w", err)
	}

	return nil
}

// FileExists checks if a file exists in GCS
func (s *GCSStorage) FileExists(filename string) (bool, error) {
	ctx := context.Background()

	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)

	_, err := obj.Attrs(ctx)
	if err != nil {
		if err == storage.ErrObjectNotExist {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

// GetFileMetadata returns file metadata
func (s *GCSStorage) GetFileMetadata(filename string) (*FileMetadata, error) {
	ctx := context.Background()

	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)

	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get file attributes: %w", err)
	}

	return &FileMetadata{
		Name:         attrs.Name,
		Size:         attrs.Size,
		ContentType:  attrs.ContentType,
		Created:      attrs.Created,
		Updated:      attrs.Updated,
		CacheControl: attrs.CacheControl,
		PublicURL:    fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, filename),
	}, nil
}

// FileMetadata contains file metadata
type FileMetadata struct {
	Name         string    `json:"name"`
	Size         int64     `json:"size"`
	ContentType  string    `json:"content_type"`
	Created      time.Time `json:"created"`
	Updated      time.Time `json:"updated"`
	CacheControl string    `json:"cache_control"`
	PublicURL    string    `json:"public_url"`
}

// ListFiles lists files in a folder
func (s *GCSStorage) ListFiles(folder string, limit int) ([]*FileMetadata, error) {
	ctx := context.Background()

	bucket := s.client.Bucket(s.bucketName)
	query := &storage.Query{
		Prefix: folder,
	}

	if limit > 0 {
		// Note: GCS doesn't support limit directly, we need to handle it
	}

	iterator := bucket.Objects(ctx, query)

	var files []*FileMetadata
	count := 0

	for {
		attrs, err := iterator.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to list files: %w", err)
		}

		files = append(files, &FileMetadata{
			Name:         attrs.Name,
			Size:         attrs.Size,
			ContentType:  attrs.ContentType,
			Created:      attrs.Created,
			Updated:      attrs.Updated,
			CacheControl: attrs.CacheControl,
			PublicURL:    fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, attrs.Name),
		})

		count++
		if limit > 0 && count >= limit {
			break
		}
	}

	return files, nil
}

// Close closes the GCS client
func (s *GCSStorage) Close() error {
	return s.client.Close()
}

// LocalStorage fallback for development
type LocalStorage struct {
	uploadDir string
	baseURL   string
}

// NewLocalStorage creates a new local storage handler
func NewLocalStorage(uploadDir, baseURL string) (*LocalStorage, error) {
	// Create upload directory if not exists
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	return &LocalStorage{
		uploadDir: uploadDir,
		baseURL:   baseURL,
	}, nil
}

// UploadFile uploads a file to local storage
func (s *LocalStorage) UploadFile(file multipart.File, header *multipart.FileHeader, folder string) (*UploadResult, error) {
	// Detect content type
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s/%s%s", folder, uuid.New().String(), ext)

	// Create folder
	fullPath := filepath.Join(s.uploadDir, folder)
	if err := os.MkdirAll(fullPath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create folder: %w", err)
	}

	// Create file
	filePath := filepath.Join(s.uploadDir, filename)
	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy content
	written, err := io.Copy(dst, file)
	if err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	publicURL := fmt.Sprintf("%s/uploads/%s", s.baseURL, filename)

	return &UploadResult{
		URL:       filename,
		PublicURL: publicURL,
		Filename:  header.Filename,
		Size:      written,
		MimeType:  contentType,
	}, nil
}

// DeleteFile deletes a file from local storage
func (s *LocalStorage) DeleteFile(filename string) error {
	filePath := filepath.Join(s.uploadDir, filename)
	return os.Remove(filePath)
}
