# Fashion Intelligence Aggregator

A monorepo for a fashion intelligence app: **Next.js** frontend (App Router, TypeScript, Tailwind) and **Express** backend (TypeScript). Includes a modular studio UI, concierge chat, product/size/try-on flows, personalization, and recommendations.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+

---

## Quick start

From the **repo root** (`fashion-intelligence-aggregator/`):

```bash
# Install all dependencies (root + frontend + server)
npm install

# Run frontend and server together
npm run dev
```

- **Frontend:** http://localhost:3000  
- **Backend:** http://localhost:8000  

---

## Commands

### From repo root

| Command | Description |
|--------|-------------|
| `npm install` | Install root + workspace dependencies |
| `npm run dev` | Run **server** and **frontend** together (concurrently) |
| `npm run dev:frontend` | Run frontend only |
| `npm run dev:server` | Run server only |
| `npm run install:all` | Install deps in root and all workspaces |

### From `frontend/`

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server (run after `build`) |
| `npm run lint` | Run Next.js lint |

### From `server/`

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Express with hot reload (http://localhost:8000) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled server (run after `build`) |

---

## Project structure

```
fashion-intelligence-aggregator/
├── frontend/          # Next.js 15 app (App Router, TypeScript, Tailwind)
│   ├── src/
│   │   ├── app/       # Routes and layout
│   │   ├── components/
│   │   ├── lib/
│   │   ├── state/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── vercel.json
├── server/            # Express API (TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── routes/
│   │   └── services/
│   ├── index.ts
│   └── package.json
├── package.json       # Root workspaces config
├── .gitignore
└── README.md
```

---

## API (server)

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check → `{ "ok": true }` |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Single product by id |
| POST | `/api/profile` | Save profile (JSON body) |
| POST | `/api/chat` | Send message; body: `{ "message": string, "topic"?: string }` → mock AI response + topic + citations |

---

## Frontend routes

| Route | Description |
|-------|-------------|
| `/` | Studio bento grid (Try-On, Product, Size, Comparison, Recommendations) |
| `/chat` | Concierge chat (bottom sheet open by default) |
| `/product` | Product details (schema, fabric, size chart, tags) |
| `/size` | Body measurements and fit check (Good Fit → haptic) |
| `/try-on` | Slide-to-Try panel |
| `/personalize` | Style preferences and profile |
| `/recommendations` | Ranked products by preferences |
| `/settings` | Dark mode, reduce motion, clear profile/chat |

---

## Stack

- **Frontend:** Next.js 15.5.9, React 18, TypeScript, Tailwind CSS, Zustand  
- **Backend:** Express, TypeScript, tsx (dev), CORS enabled for localhost:3000  

---

## Deploy (Vercel)

The app is a **monorepo**; the Next.js app lives in `frontend/`.

1. Connect the repo to Vercel.
2. In **Settings → Build and Deployment → Root Directory**, set:
   - **`frontend`** if the repo root is this monorepo, or  
   - **`fashion-intelligence-aggregator/frontend`** if the repo root is a parent folder.
3. Save and redeploy.

See **VERCEL.md** in this repo for more detail.

---

## License

Private / unlicensed unless otherwise stated.
