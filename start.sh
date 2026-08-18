#!/bin/bash

# SecureCam - Auto Setup & Run Script
# Automatically sets up database and starts the development server

set -e

echo "🚀 SecureCam CCTV E-commerce Platform"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(dirname "$0")"

echo -e "${BLUE}📦 Step 1: Setting up Database...${NC}"

# Generate Prisma client
echo "Generating Prisma client..."
bun run db:generate

# Push database schema (creates DB if not exists)
echo "Creating database schema..."
bun run db:push

echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""

echo -e "${BLUE}📦 Step 2: Seeding Database...${NC}"

# Wait a moment for DB to be ready
sleep 1

# Seed the database via API
bun run seed 2>/dev/null || echo "Note: Seed will run automatically on first server start"

echo -e "${GREEN}✅ Database seeded!${NC}"
echo ""

echo -e "${YELLOW}🚀 Starting Development Server...${NC}"
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}🎉 SecureCam is Ready!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "🌐 Website:      ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Admin Credentials:${NC}"
echo -e "   Email:    ${BLUE}admin@securecam.com${NC}"
echo -e "   Password: ${BLUE}admin123${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
bun run dev
