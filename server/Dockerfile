# Base Node.js image for web server and core functionality
FROM node:18

# Install system-wide dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip \
    build-essential gcc g++ \
    curl wget unzip git \
    php ruby r-base \
    ghc \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Haskell via GHCup
RUN curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | BOOTSTRAP_HASKELL_NONINTERACTIVE=1 sh

# Create temporary execution directory
RUN mkdir -p /usr/src/server/temp && chmod 777 /usr/src/server/temp

# Set working directory
WORKDIR /usr/src/server

# Copy package management files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose application port
EXPOSE 5000

# Default command to start the server
CMD ["npm", "start"]