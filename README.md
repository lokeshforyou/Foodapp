Simple Food Order App (React + Express + SQLite)

Setup

1) Server
cd server
npm install
npm run dev
- Server runs on http://localhost:4000
- API:
  - GET /api/menu
  - GET /api/menu/:id
  - POST /api/orders
  - GET /api/orders/:id

2) Client
cd client
npm install
npm run dev
- Frontend runs on http://localhost:3000
- Calls backend at http://localhost:4000/api

Notes
- SQLite DB file is server/data.db (created automatically).
- To reset DB: stop server, delete server/data.db, restart server to re-seed menu.
- No authentication or payments in this MVP.
