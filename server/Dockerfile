# Base Node.js image for web server and core functionality
FROM node:18

# Install system-wide dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    gcc \
    g++ \
    curl \
    wget \
    ghc \
    unzip \
    git \
    php \
    ruby \
    r-base \
    && rm -rf /var/lib/apt/lists/*

# Install Go using the official Go installation script
# RUN curl -sSL https://go.dev/dl/go1.21.5.linux-amd64.tar.gz | tar -C /usr/local -xz
# ENV PATH="/usr/local/go/bin:${PATH}"
# ENV GOPATH="/go"
# ENV PATH="${GOPATH}/bin:${PATH}"
# RUN mkdir -p /go/src /go/bin /go/pkg && chmod -R 777 /go

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Haskell via GHCup
RUN curl --proto '=https' -- tlsv1.2 -sSf https://get-ghcup.haskell.org | BOOTSTRAP_HASKELL_NONINTERACTIVE=1 sh

# Create temporary execution directory
RUN mkdir -p /usr/src/server/temp && chmod 777 /usr/src/server/temp

# Set working directory
WORKDIR /usr/src/server

# Copy package management files
COPY package*.json ./

# Install Node.js dependencies
# RUN npm ci --only=production
RUN npm install

# Copy application files
COPY . .

# Expose application port
EXPOSE 5000

# Default command to start the server
CMD ["npm", "start"]