#!/bin/bash

# Function to check if a command exists
command_exists () {
    command -v "$1" >/dev/null 2>&1
}

# Install required packages
echo "Installing required packages..."
npm install

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if required compilers/interpreters are installed
REQUIRED_COMMANDS=("node" "gcc" "g++" "python3" "java")
for COMMAND in "${REQUIRED_COMMANDS[@]}"; do
    if command_exists "$COMMAND"; then
        echo "$COMMAND is installed."
    else
        echo "Error: $COMMAND is not installed. Please install it to continue."
        exit 1
    fi
done

# Create an admin user
echo "Creating admin user..."
npx prisma db seed 

echo "admin email: admin@example.com, password: adminPassword123"

# Generate API documentation (optional)
# Uncomment if you are using a package for automatic API documentation generation
# echo "Generating API documentation..."
# npm run generate-docs  # Adjust based on your setup

echo "Startup script completed successfully."
