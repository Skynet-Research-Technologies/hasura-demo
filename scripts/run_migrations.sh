#!/bin/bash
# Migration runner script for Hasura Demo project
# Usage: ./run_migrations.sh [apply|rollback] [migration_version]
# Examples: 
#   ./run_migrations.sh apply           # Applies all pending migrations
#   ./run_migrations.sh apply V20250527_001  # Applies specific migration
#   ./run_migrations.sh rollback V20250527_001  # Rolls back specific migration

set -e

MIGRATIONS_DIR="$(dirname "$0")/migrations"
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"postgres"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}

# ANSI color codes for output formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run a SQL file
run_sql_file() {
  local file=$1
  local description=$(grep -m 1 "Description:" "$file" | sed 's/-- Description: //')
  
  echo -e "${YELLOW}Running migration: ${file}${NC}"
  echo -e "${YELLOW}${description}${NC}"
  
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration applied successfully${NC}"
  else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
  fi
}

# Ensure the migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo -e "${RED}Error: Migrations directory not found: $MIGRATIONS_DIR${NC}"
  exit 1
fi

# Create migrations table if it doesn't exist
echo "Creating migrations tracking table if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) NOT NULL PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);
EOF

# Handle apply command
if [ "$1" = "apply" ]; then
  if [ -z "$2" ]; then
    echo -e "${YELLOW}Applying all pending migrations...${NC}"
    
    # Get list of migration files sorted by version
    migration_files=$(find "$MIGRATIONS_DIR" -name "V*__*.sql" | grep -v "_rollback" | sort)
    
    for file in $migration_files; do
      # Extract version from filename
      version=$(basename "$file" | grep -oE '^V[0-9]+_[0-9]+')
      
      # Check if migration has been applied
      applied=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version = '$version';")
      applied=$(echo "$applied" | tr -d '[:space:]')
      
      if [ "$applied" = "0" ]; then
        run_sql_file "$file"
      else
        echo -e "${GREEN}✓ Migration $version already applied, skipping${NC}"
      fi
    done
  else
    # Apply specific migration
    migration_file=$(find "$MIGRATIONS_DIR" -name "V${2}__*.sql" | grep -v "_rollback")
    
    if [ -z "$migration_file" ]; then
      echo -e "${RED}Error: Migration V${2} not found${NC}"
      exit 1
    fi
    
    run_sql_file "$migration_file"
  fi

# Handle rollback command
elif [ "$1" = "rollback" ]; then
  if [ -z "$2" ]; then
    echo -e "${RED}Error: You must specify a migration version to rollback${NC}"
    exit 1
  else
    # Find rollback file
    rollback_file=$(find "$MIGRATIONS_DIR" -name "V${2}__*_rollback.sql")
    
    if [ -z "$rollback_file" ]; then
      echo -e "${RED}Error: Rollback script for migration V${2} not found${NC}"
      exit 1
    fi
    
    run_sql_file "$rollback_file"
  fi

else
  echo -e "${YELLOW}Usage: $0 [apply|rollback] [migration_version]${NC}"
  echo -e "${YELLOW}Examples:${NC}"
  echo -e "${YELLOW}  $0 apply           # Applies all pending migrations${NC}"
  echo -e "${YELLOW}  $0 apply V20250527_001  # Applies specific migration${NC}"
  echo -e "${YELLOW}  $0 rollback V20250527_001  # Rolls back specific migration${NC}"
  exit 1
fi

echo -e "${GREEN}Migration process completed.${NC}"
