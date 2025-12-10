package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string

	// Connection pool settings
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

func NewPostgresConnection(cfg Config) (*sql.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	// Connection pool settings (CRÍTICO para performance)
	maxOpenConns := cfg.MaxOpenConns
	if maxOpenConns == 0 {
		maxOpenConns = 50
	}
	db.SetMaxOpenConns(maxOpenConns) // Máximo de conexões abertas

	maxIdleConns := cfg.MaxIdleConns
	if maxIdleConns == 0 {
		maxIdleConns = 10
	}
	db.SetMaxIdleConns(maxIdleConns) // Conexões idle no pool

	connMaxLifetime := cfg.ConnMaxLifetime
	if connMaxLifetime == 0 {
		connMaxLifetime = time.Hour
	}
	db.SetConnMaxLifetime(connMaxLifetime) // Tempo de vida máximo de uma conexão

	connMaxIdleTime := cfg.ConnMaxIdleTime
	if connMaxIdleTime == 0 {
		connMaxIdleTime = 10 * time.Minute
	}
	db.SetConnMaxIdleTime(connMaxIdleTime) // Tempo máximo idle

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
