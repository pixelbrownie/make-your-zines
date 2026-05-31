#!/usr/bin/env bash
# pixelbrownie Zines — Quick Start Script
# Run from project root: bash start.sh

set -e
BOLD='\033[1m'
PINK='\033[35m'
GREEN='\033[32m'
RESET='\033[0m'

echo ""
echo -e "${PINK}${BOLD}✦ ZIINLY — Starting up...${RESET}"
echo ""

# ── Backend ──────────────────────────────────────────────
echo -e "${BOLD}[1/4] Setting up Django backend...${RESET}"

cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "  ✓ Created virtual environment"
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo "  ✓ Dependencies installed"

cd pixelbrownie

python manage.py makemigrations users --no-input 2>/dev/null || true
python manage.py makemigrations zines --no-input 2>/dev/null || true
python manage.py migrate --no-input
echo "  ✓ Database migrated"

echo ""
echo -e "${BOLD}[2/4] Starting Django on http://localhost:8000 ...${RESET}"
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!
cd ../../

# ── Frontend ─────────────────────────────────────────────
echo ""
echo -e "${BOLD}[3/4] Installing Angular dependencies...${RESET}"
cd frontend
npm install -q
echo "  ✓ npm packages installed"

# Copy assets if not present
mkdir -p src/assets
if [ -f "../heart-zine.png" ]; then
  cp "../heart-zine.png" src/assets/heart-zine.png
fi
if [ -f "../start-btn.png" ]; then
  cp "../start-btn.png" src/assets/start-btn.png
fi

echo ""
echo -e "${BOLD}[4/4] Starting Angular on http://localhost:4200 ...${RESET}"
npm start &
ANGULAR_PID=$!

echo ""
echo -e "${GREEN}${BOLD}✦ Both servers are running!${RESET}"
echo ""
echo "  🌐 Frontend → http://localhost:4200"
echo "  🔧 Backend  → http://localhost:8000"
echo "  📚 Admin    → http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait and clean up on exit
trap "kill $DJANGO_PID $ANGULAR_PID 2>/dev/null; echo ''; echo 'Servers stopped.'" EXIT
wait
