# ✦ ZIINLY ✦

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
