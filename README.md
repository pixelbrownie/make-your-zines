# ✦ ZINLy ✦

> Design, fold, and share 8-page mini zines digitally.

A full-stack Angular + Django application that lets users create zines from a 4×2 grid, watch them "fold" into a 3D book via animation, and share them with a community feed.

---

## 🗂 Project Structure

```
pixelbrownie-zines/
├── backend/
│   ├── requirements.txt
│   └── pixelbrownie/          ← Django project root
│       ├── manage.py
│       ├── core/              ← settings, urls, wsgi
│       ├── users/             ← Custom User model + JWT auth
│       └── zines/             ← Zine + ZineCell models + API
└── frontend/
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.css         ← Global design system
        └── app/
            ├── app.component.ts
            ├── app.config.ts
            ├── app.routes.ts
            ├── core/
            │   ├── guards/    ← auth.guard, guest.guard
            │   ├── interceptors/  ← auth.interceptor (JWT)
            │   └── services/  ← auth.service, zine.service, toast.service
            ├── shared/
            │   ├── navbar/    ← Navbar + profile dropdown
            │   └── toast/     ← Toast notification system
            └── features/
                ├── landing/   ← Home page (start button, zine art)
                ├── auth/      ← Login + Signup
                ├── dashboard/ ← My Zine Collection (3D shelf)
                ├── editor/    ← 4×2 grid editor + fold animation
                ├── profile/   ← User profile + all zines
                ├── explore/   ← Public discovery feed
                └── zine-viewer/ ← 3D flipbook viewer
```

---

## 🚀 Setup

### 1. Backend (Django)

```bash
cd backend

# Create & activate venv
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Navigate into Django project
cd pixelbrownie

# Create .env file (optional, or export vars directly):
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Run migrations
python manage.py makemigrations users
python manage.py makemigrations zines
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server on port 8000
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

---

### 2. Frontend (Angular)

```bash
cd frontend

# Install Node dependencies
npm install

# Copy your uploaded assets into src/assets/
mkdir -p src/assets
cp path/to/start-btn.png src/assets/
cp path/to/heart-zine.png src/assets/

# Start dev server
npm start
```

Frontend runs at: **http://localhost:4200**

---

## ⚙️ Configuration

### Cloudinary (Required for image upload)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is fine)
2. Get your **Cloud Name**, **API Key**, **API Secret**
3. Set them in `backend/pixelbrownie/core/settings.py` or as env vars:

```bash
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret
```

4. Update `frontend/src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  cloudinaryCloudName: 'your_cloud_name',  // ← set this
};
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#FFF9E5` (Cream) |
| Accent Pink | `#F3B0C3` |
| Dark | `#1a1a2e` |
| Heading Font | Outfit (Google Fonts) |
| Body Font | Inter (Google Fonts) |
| Border Radius | 24px |

---

## 📐 The 4×2 Grid — Rotation Rule

```
┌─────────┬─────────┬─────────┬─────────┐
│  pg 4   │  pg 3   │  pg 2   │  pg 1   │  ← TOP ROW (180° rotated)
│ (rot)   │ (rot)   │ (rot)   │ (rot)   │
├─────────┼─────────┼─────────┼─────────┤
│ - - - - - - - ✂ - - - - - - - - - - - │  ← Cut line (dashed)
├─────────┼─────────┼─────────┼─────────┤
│  pg 5   │  pg 6   │  back   │  cover  │  ← BOTTOM ROW (0° — normal)
└─────────┴─────────┴─────────┴─────────┘
```

This mirrors the physical folding logic of a one-sheet 8-page zine.

---

## 🔗 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Login → returns JWT |
| GET/PATCH | `/api/auth/me/` | Get/update current user |
| POST | `/api/token/refresh/` | Refresh JWT |

### Zines
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/zines/` | Public feed |
| POST | `/api/zines/` | Create zine |
| GET | `/api/zines/mine/` | My zines |
| GET | `/api/zines/:slug/` | Get one zine |
| PATCH | `/api/zines/:slug/` | Update zine |
| DELETE | `/api/zines/:slug/` | Delete zine |
| PATCH | `/api/zines/:slug/toggle-privacy/` | Toggle public/private |
| POST | `/api/zines/upload/image/` | Upload image to Cloudinary |
| PATCH | `/api/zines/:id/cell/:key/` | Update a single cell |

---

## ✨ Key Features

### 8-Page Smart Grid Editor
- 4×2 CSS grid with correct rotation rule (top row 180°)
- Dashed cut line with scissors icon between rows
- Click any cell to open the slide-in cell editor panel
- Image upload via Cloudinary with AI SmartCrop (`g_auto`)
- Text overlay with custom color and font size
- Background color per cell

### Fold Animation
1. Click **✂️ Fold!** in the editor header
2. Columns animate with `rotateY` (staggered timing)
3. Grid transitions out, 3D book appears with spring animation
4. Flip through pages with arrow buttons

### PDF Export
Click **📄 PDF** in the editor — uses `html2canvas` + `jsPDF` to capture the grid at 3× resolution.

### Privacy Toggle
Per-zine public/private toggle in the dashboard with toast feedback.

### Auth Flow
- JWT tokens stored in `localStorage`
- Angular interceptor auto-attaches `Authorization: Bearer` header
- Auth guard protects `/dashboard`, `/editor`, `/profile`
- Guest guard redirects logged-in users away from login/signup

---

## 📦 Adding Assets

Place your custom PNG assets in `frontend/src/assets/`:

```bash
frontend/src/assets/
├── heart-zine.png    ← Two zine books illustration (landing page)
├── start-btn.png     ← Pink "Start♡" button image (landing page)
└── favicon.ico
```

---

## 🐛 Common Issues

**"Failed to load zines"** → Make sure Django is running on port 8000 and `environment.ts` points to `http://localhost:8000/api`

**CORS errors** → Verify `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:4200`

**Cloudinary upload fails** → Check your env vars are set; for local testing you can skip Cloudinary and just store a placeholder URL

**JWT expired** → Call `/api/token/refresh/` with the refresh token; implement a response interceptor to auto-refresh

---

## 🗺 Roadmap

- [ ] Auto JWT refresh interceptor
- [ ] Settings page (update username/password)
- [ ] Zine templates / themes
- [ ] Comments on public zines
- [ ] Mobile swipe gestures for book flip
- [ ] WebSocket live preview
