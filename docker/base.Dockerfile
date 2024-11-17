FROM ubuntu:22.04

# Install basic utilities
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -d /home/coderunner coderunner
USER coderunner
WORKDIR /home/coderunner 