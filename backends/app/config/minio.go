package config

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/gorm"
)

// MinioURL holds connection settings parsed from a minio:// or minios:// URL.
type MinioClientConfig struct {
	Endpoint  string `json:"endpoint"`
	AccessKey string `json:"access_key"`
	SecretKey string `json:"secret_key"`
	Bucket    string `json:"bucket"`
	Region    string `json:"region"`
	Secure    bool   `json:"secure"`
}

func (app *AppClients) Minio(ctx context.Context, id int64) (*minio.Client, error) {
	return app.getMinioClient(ctx, id)
}

func (m *AppClients) UploadFileFromBytes(ctx context.Context, id int64, bucketName, objectName string, data []byte, contentType string) error {
	minioClient, err := m.getMinioClient(ctx, id)
	if err != nil {
		return err
	}
	// Check if bucket exists, create if it doesn't
	exists, err := minioClient.BucketExists(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("error checking bucket existence: %w", err)
	}
	if !exists {
		err = minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("error creating bucket: %w", err)
		}
	}

	// Create folder structure if it doesn't exist
	err = m.createFolderStructure(ctx, id, bucketName, objectName)
	if err != nil {
		return fmt.Errorf("error creating folder structure: %w", err)
	}

	// Upload the byte data
	_, err = minioClient.PutObject(ctx, bucketName, objectName, bytes.NewReader(data), int64(len(data)), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("error uploading file from bytes: %w", err)
	}

	return nil
}

// createFolderStructure creates the folder structure for the given object path.
//
// This is a helper function used internally by UploadFile to ensure that
// the necessary folder structure exists before uploading a file. In MinIO,
// folders are represented as empty objects with trailing slashes and
// the content type "application/x-directory".
//
// Parameters:
//   - ctx: Context for the operation
//   - bucketName: The name of the MinIO bucket
//   - objectName: The full path/name of the object (e.g., "documents/images/photo.jpg")
//
// The function extracts the folder path from the object name and creates
// the necessary folder structure. For example, if objectName is
// "documents/images/photo.jpg", it will create the folder "documents/images/"
// if it doesn't already exist.
//
// Returns an error if the folder creation fails.
func (m *AppClients) createFolderStructure(ctx context.Context, id int64, bucketName, objectName string) error {
	minioClient, err := m.getMinioClient(ctx, id)
	if err != nil {
		return err
	}
	// Extract folder path from object name
	lastSlash := strings.LastIndex(objectName, "/")
	if lastSlash == -1 {
		// No folders needed, file is in root
		return nil
	}

	folderPath := objectName[:lastSlash+1] // Include the trailing slash

	// Check if folder already exists
	_, err = minioClient.StatObject(ctx, bucketName, folderPath, minio.StatObjectOptions{})
	if err == nil {
		// Folder already exists
		return nil
	}

	// Create folder by uploading an empty object with trailing slash
	_, err = minioClient.PutObject(ctx, bucketName, folderPath, strings.NewReader(""), 0, minio.PutObjectOptions{
		ContentType: "application/x-directory",
	})
	if err != nil {
		return fmt.Errorf("error creating folder %s: %w", folderPath, err)
	}

	return nil
}

func ParseMinioURL(raw string) (*MinioClientConfig, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return nil, err
	}
	if u.Scheme != "minio" && u.Scheme != "minios" {
		return nil, fmt.Errorf("unsupported minio URL scheme %q", u.Scheme)
	}
	if u.Host == "" {
		return nil, fmt.Errorf("minio URL host is required")
	}
	accessKey := u.User.Username()
	secretKey, _ := u.User.Password()
	if accessKey == "" || secretKey == "" {
		return nil, fmt.Errorf("minio URL must include access key and secret key")
	}
	bucket := strings.TrimPrefix(u.Path, "/")
	if bucket == "" {
		return nil, fmt.Errorf("minio URL bucket path is required")
	}
	return &MinioClientConfig{
		Endpoint:  u.Host,
		AccessKey: accessKey,
		SecretKey: secretKey,
		Bucket:    bucket,
		Region:    u.Query().Get("region"),
		Secure:    u.Scheme == "minios",
	}, nil
}

func InitializeMinio(minioURL string) (*minio.Client, error) {
	parsed, err := ParseMinioURL(minioURL)
	if err != nil {
		return nil, err
	}
	client, err := minio.New(parsed.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(parsed.AccessKey, parsed.SecretKey, ""),
		Secure: parsed.Secure,
		Region: parsed.Region,
	})
	if err != nil {
		return nil, err
	}
	return client, nil
}

func InitializeMinioFromConfig(config *MinioClientConfig) (*minio.Client, error) {
	client, err := minio.New(config.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(config.AccessKey, config.SecretKey, ""),
		Secure: config.Secure,
		Region: config.Region,
	})
	if err != nil {
		return nil, err
	}
	return client, nil
}

func (app *AppClients) getMinioClient(ctx context.Context, id int64) (*minio.Client, error) {
	if app.minio == nil {
		app.minio = map[int64]*minio.Client{}
	}
	if client, ok := app.minio[id]; ok {
		return client, nil
	}
	resource, err := gorm.G[models.Resource](app.postgres).
		Where("id = ?", id).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("resource with id %d not found", id)
		}
		return nil, err
	}
	if resource.Driver != models.ResourceDriverMinio {
		return nil, fmt.Errorf("resource with id %d is not a minio resource", id)
	}
	cfg, err := parseMinioClientConfig(resource.Config)
	if err != nil {
		return nil, err
	}
	fmt.Println("cfg", cfg)
	minioClient, err := InitializeMinioFromConfig(cfg)
	if err != nil {
		return nil, err
	}
	app.minio[id] = minioClient
	return minioClient, nil
}

func parseMinioClientConfig(config map[string]any) (*MinioClientConfig, error) {
	if config == nil {
		return nil, fmt.Errorf("minio config is required")
	}
	if urlStr, err := minioConfigStringOptional(config, "url"); err != nil {
		return nil, err
	} else if urlStr != "" {
		return ParseMinioURL(urlStr)
	}

	endpoint, err := minioConfigString(config, "endpoint")
	if err != nil {
		return nil, err
	}
	accessKey, err := minioConfigString(config, "access_key")
	if err != nil {
		return nil, err
	}
	secretKey, err := minioConfigString(config, "secret_key")
	if err != nil {
		return nil, err
	}
	bucket, err := minioConfigString(config, "bucket")
	if err != nil {
		return nil, err
	}
	region, err := minioConfigStringOptional(config, "region")
	if err != nil {
		return nil, err
	}
	secure, err := minioConfigBool(config, "secure")
	if err != nil {
		return nil, err
	}

	cfg := MinioClientConfig{
		Endpoint:  endpoint,
		AccessKey: accessKey,
		SecretKey: secretKey,
		Bucket:    bucket,
		Region:    region,
		Secure:    secure,
	}
	switch {
	case strings.HasPrefix(cfg.Endpoint, "https://"):
		cfg.Secure = true
		cfg.Endpoint = strings.TrimPrefix(cfg.Endpoint, "https://")
	case strings.HasPrefix(cfg.Endpoint, "http://"):
		cfg.Secure = false
		cfg.Endpoint = strings.TrimPrefix(cfg.Endpoint, "http://")
	}
	return &cfg, nil
}

func minioConfigString(m map[string]any, key string) (string, error) {
	v, ok := m[key]
	if !ok || v == nil {
		return "", fmt.Errorf("%s is required", key)
	}
	switch s := v.(type) {
	case string:
		if strings.TrimSpace(s) == "" {
			return "", fmt.Errorf("%s is required", key)
		}
		return s, nil
	default:
		return fmt.Sprint(v), nil
	}
}

func minioConfigStringOptional(m map[string]any, key string) (string, error) {
	v, ok := m[key]
	if !ok || v == nil {
		return "", nil
	}
	switch s := v.(type) {
	case string:
		return s, nil
	default:
		return fmt.Sprint(v), nil
	}
}

func minioConfigBool(m map[string]any, key string) (bool, error) {
	v, ok := m[key]
	if !ok || v == nil {
		return false, nil
	}
	switch b := v.(type) {
	case bool:
		return b, nil
	case string:
		switch strings.ToLower(strings.TrimSpace(b)) {
		case "true", "1", "yes":
			return true, nil
		case "false", "0", "no", "":
			return false, nil
		default:
			return false, fmt.Errorf("%s must be a boolean", key)
		}
	default:
		return false, fmt.Errorf("%s must be a boolean", key)
	}
}
