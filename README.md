## StockTrading Monorepo

Modern full‑stack stock trading simulation platform with three apps:
- `backend`: Node.js/Express API with MongoDB, JWT auth, Google OAuth, Razorpay integration, and Socket.IO for live prices.
- `dashboard`: React (CRA) trading dashboard for authenticated users (watchlist, buy/sell, holdings, analytics, funds).
- `frontend`: React (Vite) marketing/landing site (public pages, signup flow) that routes users to the dashboard.

### Features
- **Live market data via Socket.IO**: real‑time price updates streamed to the dashboard watchlist and analytics.
- **Historical charts (last 15 days)**: view recent price history for any stock in `StockAnalytics` (Chart.js).
- **Paper trading (Buy/Sell)**: place simulated orders; updates `Holdings` and `History` with average price and realized P&L.
- **Wallet with Razorpay top‑ups**: add funds using Razorpay Checkout; server verifies payment and credits wallet.
- **Withdraw to wallet balance**: decrease wallet points with validation and history entries.
- **Funds history export (CSV)**: download recent transactions as CSV from the dashboard.
- **Auth with JWT + Google OAuth**: secure endpoints with `verifyToken`, login via Google or local strategy.
- **Responsive dashboard UI**: watchlist management, holdings view, summary KPIs, and profile section.

### Architecture
- **API (`backend`)**
  - Express routes under `backend/routes/`:
    - `auth.js`: local + Google OAuth, JWT issuance, session setup.
    - `user.js`: user profile, account details, secure with `verifyToken`.
    - `funds.js`: wallet queries, add/withdraw, CSV export; uses Razorpay endpoints for order create and verification.
    - `trading.js`: buy/sell execution, persists to `HoldingsModel` and `HistoryModel`, emits updates.
    - `stocks.js`: market data endpoints; integrates with `services/stockService.js` for price fetching/streaming.
    - `RazorPayPayment.js`: payment webhook/callback handling (server‑side verification).
  - Middlewares: `Middlewares/verifyToken.js` validates JWT, attaches `req.user`.
  - Data: `models/UsersModel.js`, `HoldingsModel.js`, `HistoryModel.js` using Mongoose.
  - Realtime: `socket.io` broadcasts price ticks and trade/funds updates to subscribed clients.
  - Config: `.env` controls DB, JWT, session, and Razorpay keys.

- **Dashboard (`dashboard`)**
  - React 18 app (CRA). Entry: `src/index.js` renders `Home` and nested routes.
  - Global state via `contexts/StockContext.js` for live company data and prices.
  - Key features/components:
    - `WatchList/*`: list, search, and modal flows for Buy; uses API + realtime price updates.
    - `Holdings/*`: portfolio view, Sell modal, realized P&L, quantity updates.
    - `Summary/*`: account snapshots and performance.
    - `StockAnalytics/*`: charts (`chart.js`/`react-chartjs-2`) for price trends.
    - `funds/*`: add/withdraw funds via Razorpay checkout, transaction history, CSV export.
    - `Profile/*`: user details.
    - `Error/*`: error boundary and fallback UI.

- **Frontend (`frontend`)**
  - React (Vite) marketing site (Navbar, landing home, products, pricing, support, signup).
  - Routes under `src/landing_page/**` and `src/pages/**` for auth success/error and dashboard redirection.

### Technical Flows
- **Authentication**
  - Local or Google OAuth (via `passport`). On success, API signs a JWT (`JWT_SECRET`, `JWT_EXPIRES_IN`).
  - Clients persist token (e.g., `localStorage`) and send `Authorization: Bearer <token>`; server enforces via `verifyToken` middleware.

- **Funds and Payments (Razorpay)**
  - Client requests order creation → `backend` creates order with Razorpay key, returns `order_id`.
  - Client opens Razorpay Checkout, completes payment; handler sends `razorpay_order_id`, `payment_id`, `signature` to API.
  - API verifies signature, credits wallet, persists history, and emits updates.

- **Trading**
  - Buy/Sell endpoints validate balance/holdings, compute average price/realized P&L, persist `HoldingsModel` + `HistoryModel`.
  - Dashboard updates holdings and history, and may receive realtime updates over `socket.io`.

- **Market Data**
  - `stockService.js` abstracts fetching/streaming of price data; API exposes current and historical data. Dashboard subscribes for live ticks.

- **Exports**
  - Funds history CSV export streams a CSV Blob from API; dashboard triggers a download via a temporary anchor element.

### Project Structure
```
backend/
  index.js
  Middlewares/verifyToken.js
  models/{UsersModel,HoldingsModel,HistoryModel}.js
  routes/{auth,funds,index,RazorPayPayment,stocks,trading,user}.js
  services/stockService.js
  env.example

dashboard/
  public/index.html
  src/index.js
  src/contexts/StockContext.js
  src/components/{Home,WatchList,Holdings,Summary,StockAnalytics,funds,Profile,Error}/...

frontend/
  index.html
  src/main.jsx
  src/pages/{AuthSuccess,AuthError,Dashboard}.jsx
  src/landing_page/** (Navbar, home, products, pricing, signup, support, about)
```

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB 6+ running locally or a MongoDB Atlas connection string
- Razorpay account (test keys) for funds flows (optional for local dev without payments)

### Environment Variables (.env)
Create `backend/.env` using the example below (see `backend/env.example`).

```
# Database
MONGO_URL=mongodb://localhost:27017/stocktrading
PORT=8000

# JWT
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=replace-with-a-strong-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay Payment Gateway
KEY_ID=rzp_test_xxxxxxxxxxxx
KEY_SECRET=your_razorpay_key_secret

FINNHUB_API_KEY=your-finnhub-api
ALPHA_VANTAGE_API_KEY=your-alpha-vintage-api
```

No `.env` is required for `dashboard` (CRA) or `frontend` (Vite) for a basic run, but you may add a `.env` to configure API base URLs if you customize.

### Installation
Run these from the repository root after cloning.

1) Backend
```
cd backend
npm install
```

2) Dashboard (CRA)
```
cd dashboard
npm install
```

3) Frontend (Vite)
```
cd frontend
npm install
```

### Running Locally
Open three terminals or run sequentially while keeping servers running.

1) Start API (backend)
```
cd backend
npm run start
# Runs nodemon index.js → http://localhost:8000 (configure with PORT)
```

2) Start Dashboard (React CRA)
```
cd dashboard
npm start
# CRA dev server → http://localhost:3000
```

3) Start Frontend (Vite)
```
cd frontend
npm run dev
# Vite dev server → http://localhost:5173
```

### Default Local URLs
- Backend API: `http://localhost:8000`
- Dashboard App: `http://localhost:3000`
- Frontend (marketing) App: `http://localhost:5173`

If you adjust ports, update any hardcoded client API URLs (e.g., in `dashboard` components that call `http://localhost:8000/...`).

### Cloning This Repository
```
git clone <your-repo-url> StockTrading
cd StockTrading
# Follow Installation and Running Locally sections
```

### Notable Scripts
- `backend/package.json`
  - `start`: `nodemon index.js`
- `dashboard/package.json`
  - `start`: `react-scripts start`
  - `build`: `react-scripts build`
- `frontend/package.json`
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`

### Troubleshooting
- Ensure MongoDB is reachable at `MONGO_URL`.
- For Razorpay, use test keys and test mode; verify the API can reach Razorpay and that the webhook/callback URLs are correct if used.
- If the dashboard shows CORS issues, confirm the backend enables CORS and that origins match your dev hosts.
- If you see React StrictMode double‑mount side effects, ensure any DOM manipulations add/remove nodes safely and that portals target stable containers.

### License
ISC — see `package.json` in `backend`.


