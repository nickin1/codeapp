#!/bin/bash

# Function to check if a command exists
command_exists () {
    command -v "$1" >/dev/null 2>&1
}

# Install required packages
echo "Installing required packages..."
npm install

# Create a .env file with generated keys
cat <<EOL > .env
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="file:./dev.db"
ACCESS_TOKEN_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
EOL

echo ".env file created with generated secrets."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if required compilers/interpreters are installed
REQUIRED_COMMANDS=("node")
for COMMAND in "${REQUIRED_COMMANDS[@]}"; do
    if command_exists "$COMMAND"; then
        echo "$COMMAND is installed."
    else
        echo "Error: $COMMAND is not installed. Please install it to continue."
        exit 1
    fi
done

# Build Docker images
echo "Building Docker images..."
docker build -t scriptorium-base -f docker/base.Dockerfile .
for lang in docker/languages/*.Dockerfile; do
    name=$(basename "$lang" .Dockerfile)
    docker build -t "scriptorium-$name" -f "$lang" .
done

# Create an admin user
echo "Creating admin user..."
npx prisma db seed 

echo "admin email: admin@example.com, password: adminPassword123"

echo "Startup script completed successfully."
