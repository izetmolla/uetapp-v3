package minio

type MinioDriver struct{}

// MinioURL holds connection settings parsed from a minio:// or minios:// URL.
type MinioClientConfig struct {
	Endpoint  string `json:"endpoint"`
	AccessKey string `json:"access_key"`
	SecretKey string `json:"secret_key"`
	Bucket    string `json:"bucket"`
	Region    string `json:"region"`
	Secure    bool   `json:"secure"`
}
