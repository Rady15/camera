#!/bin/bash

# SecureCam - Complete Setup & Run Script
# This script sets up and runs both server and client

set -e

echo "🚀 SecureCam Setup & Run"
echo "========================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check bun
if ! command_exists bun; then
    echo "❌ Bun is not installed. Please install it first."
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Setting up Server...${NC}"
cd "$SCRIPT_DIR/server"

# Install server dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    bun install
fi

# Generate Prisma client
echo "Generating Prisma client..."
bun run db:generate

# Push database schema
echo "Creating database schema..."
bun run db:push

# Seed database
echo "Seeding database with initial data..."
bun run src/seed.ts || echo "Database already seeded or seed completed"

echo -e "${GREEN}✅ Server setup complete!${NC}"

echo -e "${BLUE}📦 Step 2: Setting up Client...${NC}"
cd "$SCRIPT_DIR/client"

# Install client dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    bun install
fi

echo -e "${GREEN}✅ Client setup complete!${NC}"

echo -e "${YELLOW}🚀 Step 3: Starting services...${NC}"

# Start server in background
echo "Starting API Server on port 3001..."
cd "$SCRIPT_DIR/server"
bun run dev &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait a bit for server to start
sleep 3

# Start client
echo "Starting Client on port 3000..."
cd "$SCRIPT_DIR/client"
bun run dev &
CLIENT_PID=$!
echo "Client PID: $CLIENT_PID"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 SecureCam is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📡 API Server:  ${BLUE}http://localhost:3001${NC}"
echo -e "🌐 Web Client:  ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Admin Credentials:${NC}"
echo -e "   Email:    ${BLUE}admin@securecam.com${NC}"
echo -e "   Password: ${BLUE}admin123${NC}"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for either process to exit
wait $SERVER_PID $CLIENT_PID
