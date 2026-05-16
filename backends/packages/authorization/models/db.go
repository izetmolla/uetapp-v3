package models

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

var (
	// tableNameRegistry stores custom table names for User, Session, and ConfirmedSession models
	tableNameRegistry = struct {
		sync.RWMutex
		usersTable             string
		sessionsTable          string
		confirmedSessionsTable string
		userModel              any
		sessionModel           any
	}{
		usersTable:             "users",
		sessionsTable:          "sessions",
		confirmedSessionsTable: "confirmed_sessions",
		userModel:              &User{},
		sessionModel:           &Session{},
	}
)

type DBManager struct {
	db               *gorm.DB
	redis            *redis.Client
	migration        bool
	AutoMigration    bool
	redisPrefix      string
	redisTTL         time.Duration
	UserTableName    string
	SessionTableName string
	UserModel        any
	SessionModel     any
	RedisPrefix      string
}

type SessionData struct {
	ID      string          `json:"id"`
	UserID  string          `json:"user_id"`
	Content json.RawMessage `json:"content"`
	Roles   json.RawMessage `json:"roles"`
}

type DBManagerOptionsFunc func(*DBManager)

func defaultDBManagerOptions() DBManager {
	return DBManager{
		redisTTL:         30 * time.Minute,
		redisPrefix:      "ft_auth",
		AutoMigration:    false,
		UserTableName:    "users",
		SessionTableName: "sessions",
		UserModel:        &User{},
		SessionModel:     &Session{},
	}
}
func NewDBConstructor(opts ...DBManagerOptionsFunc) *DBManager {
	o := defaultDBManagerOptions()
	for _, fn := range opts {
		fn(&o)
	}
	return &o
}

func New() *DBManager {
	c := NewDBConstructor()
	if c.AutoMigration {
		c.db.AutoMigrate(c.GetUserModel(), c.GetSessionModel())
	}

	return &DBManager{
		db:          c.db,
		redis:       c.redis,
		redisTTL:    c.redisTTL,
		redisPrefix: c.redisPrefix,
	}
}

func (d *DBManager) WithDb(db *gorm.DB) *DBManager {
	d.db = db
	return d
}

func (d *DBManager) WithRedis(redis *redis.Client) *DBManager {
	d.redis = redis
	return d
}

func (d *DBManager) WithUsersTableName(name string) *DBManager {
	if name == "" {
		name = "users"
	}
	tableNameRegistry.Lock()
	defer tableNameRegistry.Unlock()
	tableNameRegistry.usersTable = name
	d.UserTableName = name
	return d
}

func (d *DBManager) WithSessionsTableName(name string) *DBManager {
	if name == "" {
		name = "sessions"
	}
	tableNameRegistry.Lock()
	defer tableNameRegistry.Unlock()
	tableNameRegistry.sessionsTable = name
	d.SessionTableName = name
	return d
}

func (d *DBManager) WithAutoMigration() *DBManager {
	d.AutoMigration = true
	return d
}

func (d *DBManager) WithUserModel(model any) *DBManager {
	if model == nil {
		return d
	}
	tableNameRegistry.Lock()
	defer tableNameRegistry.Unlock()
	tableNameRegistry.userModel = model
	d.UserModel = model
	return d
}

func (d *DBManager) WithSessionModel(model any) *DBManager {
	if model == nil {
		return d
	}
	tableNameRegistry.Lock()
	defer tableNameRegistry.Unlock()
	tableNameRegistry.sessionModel = model
	d.SessionModel = model
	return d
}

func (d *DBManager) GetUserModel() any {
	tableNameRegistry.RLock()
	defer tableNameRegistry.RUnlock()
	return tableNameRegistry.userModel
}

func (d *DBManager) GetSessionModel() any {
	tableNameRegistry.RLock()
	defer tableNameRegistry.RUnlock()
	return tableNameRegistry.sessionModel
}

func (d *DBManager) DB() *gorm.DB {
	return d.db
}

func (d *DBManager) Redis() *redis.Client {
	return d.redis
}

func (d *DBManager) GetSessionFromDB(ctx context.Context, sessionID string) (*Session, error) {
	if d == nil || d.db == nil {
		return nil, errors.New("db manager is not initialized")
	}
	if sessionID == "" {
		return nil, errors.New("session ID cannot be empty")
	}
	if d.redis != nil {
		session, err := d.GetSessionFromRedis(ctx, sessionID)
		if err == nil {
			return &Session{
				ID:     session.ID,
				UserID: session.UserID,
				User: User{
					ID:      session.UserID,
					Roles:   session.Roles,
					Content: session.Content,
				},
			}, nil
		}

	}
	var session Session
	if err := d.db.
		WithContext(ctx).
		Where("id = ?", sessionID).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "roles")
		}).
		First(&session).Error; err != nil {
		return &session, err
	}
	if d.redis != nil {
		err := d.SetSessionToRedis(ctx, &SessionData{
			ID:      session.ID,
			UserID:  session.UserID,
			Content: session.User.Content,
			Roles:   session.User.Roles,
		})
		if err != nil {
			return nil, err
		}
	}
	return &session, nil
}

// GetSessionFromRedis retrieves session data from Redis cache.
//
// Parameters:
//   - sessionID: The unique session identifier
//
// Returns:
//   - *SessionData: Session data if found
//   - error: Error if session not found or Redis error occurs
func (a *DBManager) GetSessionFromRedis(ctx context.Context, sessionID string) (*SessionData, error) {
	if a.redis == nil {
		return nil, fmt.Errorf("Redis is not configured")
	}
	if sessionID == "" {
		return nil, fmt.Errorf("session ID cannot be empty")
	}

	redisKey := buildRedisKey(a.redisPrefix, sessionID)
	data, err := a.redis.Get(ctx, redisKey).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, redis.Nil
		}
		return nil, err
	}

	return deserializeSessionData([]byte(data))
}

// SetSession stores session data in Redis cache.
//
// Parameters:
//   - ctx: The context
//   - session: The session data to store
//
// Returns:
//   - error: Error if storage fails
func (a *DBManager) SetSessionToRedis(ctx context.Context, session *SessionData) error {
	if a.redis == nil {
		return fmt.Errorf("Redis is not configured")
	}
	if err := validateSessionData(session); err != nil {
		return err
	}

	redisKey := buildRedisKey(a.redisPrefix, session.ID)
	data, err := serializeSessionData(session)
	if err != nil {
		return err
	}

	if err := a.redis.Set(ctx, redisKey, data, a.redisTTL).Err(); err != nil {
		return err
	}

	return nil
}

// DeleteSession removes session data from Redis cache.
//
// Parameters:
//   - ctx: The context
//   - sessionID: The unique session identifier
//
// Returns:
//   - error: Error if deletion fails
func (a *DBManager) DeleteSessionFromRedis(ctx context.Context, sessionID string) error {
	if a.redis == nil {
		return fmt.Errorf("Redis is not configured")
	}
	if sessionID == "" {
		return fmt.Errorf("session ID cannot be empty")
	}

	redisKey := buildRedisKey(a.redisPrefix, sessionID)
	return a.redis.Del(ctx, redisKey).Err()
}
