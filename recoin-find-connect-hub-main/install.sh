#!/bin/bash

# CampusConnect AI - Quick Installation Script
# This script sets up the entire project in one command

set -e

echo "🚀 CampusConnect AI - Installation Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js installation
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Node.js version 18+ required. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd server
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Set up environment file
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating environment file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Environment file created (server/.env)${NC}"
    echo -e "${YELLOW}  You can edit this file to configure MongoDB and other settings${NC}"
else
    echo -e "${YELLOW}Environment file already exists${NC}"
fi
echo ""

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd ..
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Success message
echo -e "${GREEN}=========================================="
echo "✅ Installation Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Start the backend server:"
echo -e "   ${YELLOW}cd server && npm start${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. Open your browser at:"
echo -e "   ${YELLOW}http://localhost:8080${NC}"
echo ""
echo -e "${BLUE}Optional: Configure MongoDB${NC}"
echo "   Edit server/.env and set:"
echo -e "   ${YELLOW}USE_MONGODB=true${NC}"
echo -e "   ${YELLOW}MONGODB_URI=mongodb://localhost:27017/campusconnect${NC}"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   - Quick Start: SETUP_GUIDE.md"
echo "   - Full Docs: CAMPUSCONNECT_AI_IMPLEMENTATION.md"
echo "   - Summary: IMPLEMENTATION_SUMMARY.md"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
