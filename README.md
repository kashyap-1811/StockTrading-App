# 📈 StockTrading — Real-Time Stock Trading Simulation Platform

A **modern full-stack stock trading simulation platform** built using the **MERN stack** (MongoDB, Express, React, Node.js) and the **Finnhub API** for live market data.
It enables users to learn long-term investment and portfolio management through a realistic, feature-rich simulation of real-world stock trading — without using real money.

---

## 🚀 Overview

This project replicates a real-world trading environment for **educational and simulation purposes**, enabling users to:

* Analyze live market data and trends
* Simulate buy/sell operations
* Manage holdings and funds
* Visualize profit/loss performance over time

It’s designed as a **monorepo** with three main applications:

| App           | Description                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **backend**   | Node.js + Express API with MongoDB, JWT authentication, Google OAuth, Razorpay wallet transactions, and Socket.IO for live updates. |
| **dashboard** | React (CRA) dashboard for authenticated users — includes Watchlist, Holdings, Analytics, and Funds management.                      |
| **frontend**  | React (Vite) marketing site for visitors and onboarding (landing page, signup flow, about, support).                                |

---

## ✨ Key Features

* 🔄 **Live Market Data (Socket.IO + Finnhub API)**
  Real-time stock price streaming to the dashboard for watchlist and analytics modules.

* 💹 **15-Day Historical Charts (Chart.js)**
  Interactive visualizations of stock trends and performance over time.

* 💰 **Paper Trading (Simulated Buy/Sell)**
  Users can place simulated orders — automatically updating holdings, average prices, and realized P&L.

* 🏦 **Wallet System with Razorpay Integration**
  Add funds using Razorpay Checkout (test mode supported). Transactions are verified on the backend and reflected in the wallet instantly.

* 📉 **Withdrawals & Fund History Management**
  Users can withdraw funds, view all wallet transactions, and **export fund history as CSV**.

* 🔐 **Authentication & Security**
  JWT-based authentication and **Google OAuth 2.0** support via Passport.js for secure logins.

* 📊 **Dashboard Analytics**
  Portfolio summary, holdings overview, account KPIs, and stock analytics — all in one responsive, modern interface.

* ⚙️ **Real-Time Sync**
  WebSocket events push trade, fund, and price updates to connected clients immediately.

---

## 🏗️ Architecture Overview

### **Backend (Node.js / Express)**

Handles authentication, trading logic, wallet management, and realtime updates.

**Key modules:**

* `routes/`

  * `auth.js` — Local & Google OAuth login, JWT issuance
  * `funds.js` — Add/withdraw funds, Razorpay verification, CSV export
  * `trading.js` — Simulated buy/sell execution, holdings updates
  * `stocks.js` — Market data (via `stockService.js`)
  * `user.js` — Profile and account operations
* `models/` — Mongoose models for Users, Holdings, and History
* `Middlewares/verifyToken.js` — JWT validation middleware
* `services/stockService.js` — Live + historical data fetching and broadcasting via Socket.IO

### **Dashboard (React)**

Authenticated trading dashboard for users.

**Key Components:**

* `WatchList/` — Real-time watchlist with Buy modal
* `Holdings/` — Portfolio view with Sell modal and performance metrics
* `Summary/` — Financial overview and performance summary
* `StockAnalytics/` — Interactive stock charts (Chart.js)
* `funds/` — Razorpay top-ups, withdrawals, and transaction history
* `Profile/` — User info and account settings

Global context managed via `contexts/StockContext.js`.

### **Frontend (React + Vite)**

Public marketing website:

* Home, Products, Pricing, Support, and Signup routes
* Redirects to Dashboard post-authentication

---

## 🔐 Technical Flows

### **1. Authentication**

* Supports both local and Google OAuth strategies via Passport.
* On success, backend issues a JWT (`JWT_SECRET` + `JWT_EXPIRES_IN`).
* Clients store the token (e.g., in `localStorage`) and send `Authorization: Bearer <token>` for secure access.

### **2. Funds & Payments**

* Client initiates a top-up → backend creates Razorpay order → frontend opens Razorpay Checkout.
* Upon successful payment, backend verifies signature and credits user’s wallet.
* Withdrawals update wallet and transaction history in MongoDB.

### **3. Trading Flow**

* Buy/Sell requests are validated for balance and holdings.
* Backend calculates average cost, realized P&L, and updates both Holdings and History.
* Socket.IO broadcasts trade events to update the dashboard in real time.

### **4. Market Data**

* `stockService.js` fetches live prices via Finnhub API and historical data from Alpha Vantage.
* Price ticks are emitted over Socket.IO for live dashboard updates.

---

## 🧩 Project Structure

```
StockTrading-App-main/
│
├── backend/
│   ├── index.js
│   ├── routes/{auth,funds,stocks,trading,user,RazorPayPayment}.js
│   ├── models/{UsersModel,HoldingsModel,HistoryModel}.js
│   ├── services/stockService.js
│   ├── Middlewares/verifyToken.js
│   └── env.example
│
├── dashboard/
│   ├── public/
│   └── src/
│       ├── contexts/StockContext.js
│       └── components/{Home,WatchList,Holdings,Summary,StockAnalytics,funds,Profile,Error}/...
│
└── frontend/
    ├── src/pages/{AuthSuccess,AuthError,Dashboard}.jsx
    └── src/landing_page/{Navbar,Home,Products,Pricing,Support,Signup,About}.jsx
```

---

## ⚙️ Environment Setup

### **Requirements**

* Node.js ≥ 18
* npm ≥ 9
* MongoDB ≥ 6 (local or Atlas)
* Razorpay test keys (optional for wallet demo)

### **.env Configuration**

Located at `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017/stocktrading
PORT=8000

JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1d
SESSION_SECRET=replace-with-strong-session-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

KEY_ID=rzp_test_xxxxxxxxxxxx
KEY_SECRET=your_razorpay_secret

FINNHUB_API_KEY=your-finnhub-api
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api
```

---

## 🧠 Installation & Setup

Run these commands from the repo root:

### Backend

```bash
cd backend
npm install
npm run start
```

### Dashboard

```bash
cd dashboard
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Local URLs:**

* Backend API → `http://localhost:8000`
* Dashboard → `http://localhost:3000`
* Frontend → `http://localhost:5173`

---

## 🧾 Highlights

* Developed a **real-time stock trading simulation platform** using the **MERN stack**.
* Integrated **Finnhub API** for live stock market data and **Socket.IO** for realtime synchronization.
* Implemented **Google OAuth** for authentication and **Razorpay** for wallet management.
* Enabled **CSV export** for transaction history and **interactive charting** for 15-day stock visualization.

---

## 🧩 Troubleshooting

* Ensure MongoDB instance is running and reachable.
* Verify Razorpay test keys for wallet flows.
* Fix CORS issues by aligning `localhost` ports in frontend and backend.
* Use `nodemon` for backend development for hot reloading.

---

## 📜 License

Licensed under the **ISC License** — see `package.json` in `/backend`.

---