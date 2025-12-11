package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// DB encapsula a conexão com PostgreSQL
type DB struct {
	*sql.DB
}

// Config representa a configuração de conexão do banco
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// NewDB cria uma nova conexão com o banco de dados
func NewDB(cfg Config) (*DB, error) {
	// Monta a connection string
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host,
		cfg.Port,
		cfg.User,
		cfg.Password,
		cfg.DBName,
		cfg.SSLMode,
	)

	// Abre a conexão
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	// Configura pool de conexões
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Testa a conexão
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	log.Println("✅ Database connection established")

	return &DB{db}, nil
}

// NewDBFromEnv cria uma conexão a partir de variáveis de ambiente
func NewDBFromEnv() (*DB, error) {
	cfg := Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "postgres"),
		DBName:   getEnv("DB_NAME", "supercore"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}

	return NewDB(cfg)
}

// Close fecha a conexão com o banco
func (db *DB) Close() error {
	log.Println("Closing database connection")
	return db.DB.Close()
}

// RunMigration executa um arquivo de migração SQL
func (db *DB) RunMigration(filePath string) error {
	log.Printf("Running migration: %s", filePath)

	// Lê o arquivo SQL
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("error reading migration file: %w", err)
	}

	// Executa o SQL
	if _, err := db.Exec(string(content)); err != nil {
		return fmt.Errorf("error executing migration: %w", err)
	}

	log.Printf("✅ Migration completed: %s", filePath)
	return nil
}

// Helper para obter variável de ambiente com valor padrão
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
