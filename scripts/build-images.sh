#!/bin/bash

# Exit on any error
set -e

echo "Building Docker images for code execution..."

# Build base image
echo "Building base image..."
docker build -t scriptorium-base -f docker/base.Dockerfile .

# Build language-specific images
echo "Building language images..."
for dockerfile in docker/languages/*.Dockerfile; do
    lang=$(basename "$dockerfile" .Dockerfile)
    echo "Building $lang image..."
    docker build -t "scriptorium-$lang" -f "$dockerfile" .
done

echo "All images built successfully!" 