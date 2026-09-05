# 🌾 Kisan Mandi (किसान मंडी)

> **Smart Agricultural Procurement & E-Token System**
> A modern digital mandi platform empowering farmers with seamless slot booking, real-time queue tracking, automated Minimum Support Price (MSP) calculation, transparent quality inspection, digital J-Form receipts, and direct benefit transfer (DBT) tracking.

---

## 📑 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [System Architecture](#-system-architecture)
- [How Data is Stored (Database Schema)](#-how-data-is-stored-database-schema)
- [How the Backend Works](#-how-the-backend-works)
- [How the Frontend Connects to the Backend](#-how-the-frontend-connects-to-the-backend)
- [End-to-End Data Flow](#-end-to-end-data-flow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events)
- [Getting Started & Setup Guide](#-getting-started--setup-guide)
- [Environment Variables](#-environment-variables)

---

## 📌 Overview & Problem Statement

Traditional agricultural mandis (procurement centers) often suffer from:
1. **Severe Congestion & Long Waiting Times**: Farmers wait in queues with loaded tractor-trolleys for days.
2. **Intermediary Exploitation**: Lack of transparent pricing and quota monitoring allows middlemen to hoard procurement benefits.
3. **Delayed & Opaque Payments**: Farmers struggle to track MSP payment disbursement.
4. **Disputes in Quality Grading**: Lack of standardized grading and digital receipts.

### 💡 The Kisan Mandi Solution
- **E-Token & Slot Management**: Farmers schedule specific time slots at designated procurement centres.
- **7/12 Land Record Verification & Quota Enforcement**: Calculates fair procurement quotas based on land acreage to prevent hoarding.
- **Real-Time Live Queue**: WebSocket-driven live queue status (Waiting $\to$ At Gate $\to$ Weighing $\to$ Quality Inspection $\to$ Completed).
- **Quality Inspection & Digital J-Form**: Instant digital procurement receipt generation with grade breakdown and net MSP calculation.
- **DBT Payment Tracking**: End-to-end transparent status tracking (Pending $\to$ Processing $\to$ Transferred).
- **Multilingual Support**: Accessible interface in English, Hindi, and regional languages.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                   │
│   • Tailwind CSS  • Lucide Icons  • React Router       │
│   • AuthContext   • LanguageContext (i18n)              │
└────────────▲──────────────────────────────▲─────────────┘
             │ HTTP / REST (Axios)          │ WebSocket (Socket.io-client)
             │ via Vite Proxy (/api)        │ (ws://localhost:5000)
┌────────────▼──────────────────────────────▼─────────────┐
│                 Node.js / Express Server                │
│   • JWT Auth & OTP Verification                         │
│   • Express Validator & Helmet Security                 │
│   • Socket.IO Server (Real-time queue rooms)            │
│   • REST Controllers (Bookings, MSP, J-Form, etc.)      │
└───────────────────────────▲─────────────────────────────┘
                            │ SQL Queries via Knex.js
┌───────────────────────────▼─────────────────────────────┐
│                 PostgreSQL Database                     │
│   • Docker Container / Local Instance                   │
│   • 12 Migrations (Farmers, Bookings, J-Forms, etc.)   │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄 How Data is Stored (Database Schema)

Data is stored in a relational **PostgreSQL** database managed using **Knex.js** migration and seed scripts (`server/src/migrations`).

### Entity Relationship & Core Tables:

1. **`farmers`**: Farmer accounts, mobile numbers, Aadhaar hash, role (`farmer` / `admin`), and bank details (Account No, IFSC, Bank Name) for Direct Benefit Transfer.
2. **`procurement_centres`**: Mandi centers with district, state, capacity per day, and operating hours.
3. **`time_slots`**: Time slots for centres with start time, end time, and maximum capacity.
4. **`land_records`**: 7/12 land records (Survey number, Village, Total Acreage, Sown Crop, Max Yield Quota).
5. **`msp_rates`**: Government-notified Minimum Support Price master for commodities (Wheat, Paddy, Mustard, Cotton, etc.) per quintal.
6. **`bookings`**: Slot reservations containing token number (e.g. `TK-20260901-001`), farmer ID, centre ID, slot ID, commodity, estimated quantity, booking status (`booked`, `checked_in`, `in_progress`, `completed`, `cancelled`), and quality inspection data.
7. **`payments`**: Payment records with gross amount, deductions, net MSP payable, DBT transaction reference, and status (`pending`, `processing`, `transferred`, `failed`).
8. **`grievances`**: Farmer helpdesk tickets categorised by issue type (`payment_delay`, `slot_rescheduling`, `quality_dispute`) with resolution notes.
9. **`otp_verifications`**: OTP codes with expiration timestamps for passwordless mobile logins.
10. **`notifications`**: SMS/system notifications log dispatched to farmers.

---

## ⚙ How the Backend Works

- **Server Engine (`server/src/index.js`)**: Express server wrapped in Node.js `http.createServer()` to support both HTTP endpoints and WebSocket connections simultaneously on port `5000`.
- **Database Layer (`server/src/config/db.js`)**: Knex.js connection pool connected to PostgreSQL.
- **Authentication & Security (`server/src/middleware/auth.js`)**:
  - Stateless JSON Web Tokens (JWT) signed and verified with `JWT_SECRET`.
  - Passwords hashed using `bcryptjs`.
  - Role-based middleware (`authMiddleware`, `adminOnly`).
  - Security headers enforced with `helmet`, CORS configured for the frontend origin.
- **Real-Time Queue Engine (`server/src/socket/queue.socket.js`)**:
  - Socket.IO rooms created per procurement centre (`centre_${centreId}`).
  - When an admin updates a token's status (Checked In, In Progress, Completed), the server broadcasts `queue:updated` events to all clients connected to that centre room.
- **Business Logic Controllers (`server/src/controllers/`)**:
  - `booking.controller.js`: Validates farmer quota against land records before issuing tokens.
  - `admin.controller.js`: Handles check-ins, quality inspection grading, and weight recordings.
  - `jform.controller.js`: Automatically calculates deductions and generates official J-Form procurement receipts.
  - `payment.controller.js`: Computes net payouts and updates DBT disbursement states.

---

## 💻 How the Frontend Connects to the Backend

1. **Vite Development Proxy (`client/vite.config.js`)**:
   - Requests from the frontend matching `/api/*` are automatically forwarded to `http://localhost:5000/api/*`, eliminating CORS issues during development.
2. **Axios Centralized API Client (`client/src/services/api.js`)**:
   - A single Axios instance with request interceptors automatically attaches the JWT token (`Authorization: Bearer <token>`) from `localStorage` to all authenticated requests.
3. **Socket.IO Real-time Connection (`client/src/services/socket.js`)**:
   - Connects to the backend WebSocket server.
   - Farmers/admins join centre-specific rooms (`joinQueueRoom(centreId)`) to receive instant queue movements without refreshing the page.
4. **React Context State Management**:
   - **`AuthContext.jsx`**: Persists logged-in user profile, role, token, and handles login/logout states.
   - **`LanguageContext.jsx`**: Manages multilingual UI translations dynamically.
5. **Protected Routing (`client/src/App.jsx`)**:
   - React Router v6 with custom `<ProtectedRoute>` guards to separate farmer views from restricted `<AdminPage>` interfaces.

---

## 🔄 End-to-End Data Flow

```
1. REGISTRATION & VERIFICATION
   Farmer registers/logs in via OTP ──▶ Backend validates ──▶ Farmer adds 7/12 Land Record
                                                                      │
2. SLOT BOOKING                                                       ▼
   Farmer selects Mandi & Slot ──▶ Quota checked against Land Acreage ──▶ Token Generated (e.g. TK-001)
                                                                      │
3. MANDI ARRIVAL & QUEUE                                              ▼
   Farmer arrives at Mandi ──▶ Admin marks "Check-In" ──▶ Real-time Queue updates via WebSockets
                                                                      │
4. QUALITY INSPECTION & WEIGHING                                      ▼
   Admin records actual weight & quality grade (A/B/C) ──▶ System computes MSP & deductions
                                                                      │
5. J-FORM & PAYMENT                                                   ▼
   Digital J-Form Receipt Generated ──▶ DBT Payment initiated ──▶ Farmer tracks payment live
```

---

## 🛠 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide React, React Hot Toast |
| **Backend** | Node.js, Express.js, Knex.js Query Builder, Socket.IO |
| **Database** | PostgreSQL 15 |
| **Auth & Security** | JWT (JSON Web Tokens), Bcrypt.js, Helmet, Express-Validator |
| **Containerization** | Docker & Docker Compose (PostgreSQL) |

---

## 📂 Project Structure

```
kisan-mandi/
├── docker-compose.yml           # PostgreSQL container definition
├── client/                      # React Frontend (Vite)
│   ├── index.html
│   ├── vite.config.js           # Vite config & /api proxy
│   ├── tailwind.config.js       # Tailwind CSS styling
│   ├── package.json
│   └── src/
│       ├── App.jsx              # Application router & route guards
│       ├── main.jsx             # React entry point
│       ├── components/
│       │   ├── common/Navbar.jsx
│       │   └── admin/QualityInspectionModal.jsx
│       ├── context/
│       │   ├── AuthContext.jsx      # Global Auth & Token state
│       │   └── LanguageContext.jsx  # Multilingual dictionary
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── BookSlotPage.jsx     # Slot booking & token creation
│       │   ├── MyBookingsPage.jsx   # Farmer tokens & J-Form access
│       │   ├── LiveQueuePage.jsx    # Real-time WebSocket mandi queue
│       │   ├── PaymentTrackPage.jsx # DBT payment tracker
│       │   ├── LandRecordsPage.jsx  # 7/12 Record & Quota manager
│       │   ├── HelpdeskPage.jsx     # Grievances & support
│       │   └── AdminPage.jsx        # Mandi officer operations
│       └── services/
│           ├── api.js           # Axios API calls & request interceptors
│           └── socket.js        # Socket.IO client helpers
└── server/                      # Node.js / Express Backend
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js             # Server entry & Socket.IO initialization
        ├── config/
        │   ├── db.js            # Knex database connection instance
        │   └── knexfile.js      # Knex database configuration
        ├── controllers/         # Business logic for all modules
        ├── middleware/
        │   ├── auth.js          # JWT & Role authorization
        │   └── validate.js      # Express validator schema
        ├── migrations/          # 12 Database migrations (tables & schemas)
        ├── routes/              # Express API route endpoints
        ├── seeds/               # Initial seed data (centres, MSP rates)
        ├── services/            # OTP & SMS simulation services
        └── socket/
            └── queue.socket.js  # WebSocket queue room handlers
```

---

## 📡 API Reference

### 🔐 Auth (`/api/auth`)
- `POST /request-otp` — Request OTP for login
- `POST /verify-otp` — Verify OTP & receive JWT token
- `POST /register` — Register a new farmer with bank details
- `POST /login` — Standard login
- `GET /profile` — Fetch currently authenticated user profile

### 🏛 Centres & Slots (`/api/centres`)
- `GET /` — List procurement centres (filterable by district)
- `GET /:id` — Get centre details
- `GET /:id/slots?date=YYYY-MM-DD` — Get available time slots for a given date

### 🎟 Bookings (`/api/bookings`)
- `POST /` — Create a new slot booking & token
- `GET /mine` — Fetch all bookings for logged-in farmer
- `GET /:id` — Get booking details
- `PATCH /:id/cancel` — Cancel a booking

### 📊 Live Queue (`/api/queue`)
- `GET /:centreId/live` — Get real-time queue snapshot for a centre
- `GET /:centreId/position/:bookingId` — Get farmer's current position and estimated wait time

### 🌾 MSP Rates & Land Records
- `GET /api/msp-rates` — Get all notified MSP commodity rates
- `GET /api/land-records` — Get logged-in farmer's 7/12 land records
- `GET /api/land-records/quota/:commodity` — Check available procurement quota for a crop
- `POST /api/land-records` — Add/verify a land record

### 🧾 J-Form & Payments
- `GET /api/jform/:bookingId` — Fetch/render digital J-Form receipt
- `GET /api/payments` — Get payment records for logged-in farmer
- `GET /api/payments/:bookingId` — Get payment status for a specific booking

### 🛡 Admin Operations (`/api/admin`)
- `PATCH /bookings/:id/check-in` — Check-in farmer at mandi gate
- `PATCH /bookings/:id/start` — Move token to quality/weighing stage
- `PATCH /bookings/:id/complete` — Complete inspection, record weight, grade, and generate payment
- `PATCH /payments/:id` — Update payment status & reference number
- `GET /centres/:centreId/stats` — Mandi operational statistics

---

## ⚡ WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `queue:join` | Client $\to$ Server | Farmer/Admin joins a specific centre's queue room (`{ centreId }`) |
| `queue:leave` | Client $\to$ Server | Leaves the centre's queue room |
| `queue:updated` | Server $\to$ Client | Broadcasted when a token moves status (checked-in, started, completed) |

---

## 🚀 Getting Started & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (or Docker to run PostgreSQL)

---

### Step 1: Start PostgreSQL

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Using Local PostgreSQL**
Ensure PostgreSQL is running locally and create a database named `kisan_mandi`:
```sql
CREATE DATABASE kisan_mandi;
```

---

### Step 2: Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   *(Update `DB_PASSWORD` if your local postgres password differs)*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations & seed data:
   ```bash
   npm run migrate
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on **`http://localhost:5000`**.

---

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at **`http://localhost:5173`**.

---

## 🔑 Default Test Accounts (from Seeds)

| Role | Mobile / Email | Password / OTP | Purpose |
|---|---|---|---|
| **Farmer** | `9876543210` | `password123` (or OTP `123456`) | Test slot booking, land records, live queue, payments |
| **Admin** | `9999999999` | `password123` | Access `/admin` dashboard for check-in, quality inspection, & J-Forms |

---

## 🔒 Environment Variables

Inside `server/.env`:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kisan_mandi
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret
JWT_SECRET=kisan_mandi_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d

# Fast2SMS (Optional for simulated SMS)
FAST2SMS_API_KEY=your_key_here

# Frontend URL
CLIENT_URL=http://localhost:5173
```
