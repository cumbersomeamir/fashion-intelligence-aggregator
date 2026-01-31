# Fashion Intelligence Aggregator

Monorepo: Next.js frontend + Express backend.

## Quick start

From root:

```bash
npm install
npm run dev
```

- **Frontend**: http://localhost:3000  
- **Backend**: http://localhost:8000  

## Scripts (root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Runs server + frontend concurrently |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:server` | Server only |
| `npm run install:all` | Install deps in all packages |

## Run independently

- **Frontend**: `cd frontend && npm run dev`  
- **Server**: `cd server && npm run dev`  

## API (server)

- `GET /health` → `{ ok: true }`
- `GET /api/products` → product list
- `GET /api/products/:id` → single product
- `POST /api/profile` → save profile (JSON body)
- `POST /api/chat` → `{ message, topic? }` → mock AI response + topic + citations

## Routes (frontend)

1. `/` – Studio bento grid  
2. `/chat` – Concierge chat (sheet open by default)  
3. `/product` – Product schema details  
4. `/size` – Body measurements, fit check, haptic on “Good Fit”  
5. `/try-on` – Slide-to-Try, skeleton ~1200ms  
6. `/personalize` – Style prefs + profile  
7. `/recommendations` – Ranked products  
8. `/settings` – Dark mode, reduce motion, clear profile/chat  

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind, Zustand  
- **Backend**: Express, TypeScript, tsx watch  
