# 🌾 Kisan Mandi (किसान मंडी)

> **Smart Agricultural MSP Procurement, E-Token Queue & Anti-Corruption Governance Platform**
> A modern digital agri-procurement ecosystem empowering farmers with digital slot booking, real-time WebSocket queue tracking, dynamic 7/12 land record yield quotas, transparent quality grading, instant digital J-Form receipts, DBT subsidy tracking, live weather & MSP advisories with Marathi/English Text-to-Speech, and an apex Super Admin Vigilance tribunal for direct reporting of mandi malpractice.

---

## 🌐 Live Production Deployment

| Service | Platform | Live URL |
| :--- | :---: | :--- |
| **Frontend Application** | **Vercel** | 🔗 **[https://kisan-mandi-pied.vercel.app](https://kisan-mandi-pied.vercel.app)** |
| **Backend REST & Socket.IO API** | **Render** | 🔗 **[https://kisan-mandi-api-2hwb.onrender.com](https://kisan-mandi-api-2hwb.onrender.com)** |
| **Cloud PostgreSQL Database** | **Neon** | 🐘 `PostgreSQL 16 Cloud Instance (Singapore)` |
| **Source Code Repository** | **GitHub** | 📦 **[https://github.com/saksham-kamble/kisan-mandi](https://github.com/saksham-kamble/kisan-mandi)** |

---

## 📑 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Quick Demo Credentials](#-quick-demo-credentials)
- [Database Schema (13 Migrations)](#-database-schema-13-migrations)
- [End-to-End Data Flow](#-end-to-end-data-flow)
- [API Reference](#-api-reference)
- [WebSocket Live Queue Events](#-websocket-live-queue-events)
- [Local Development & Setup Guide](#-local-development--setup-guide)
- [Deployment Guide](#-deployment-guide)

---

## 📌 Overview & Problem Statement

Traditional agricultural mandis (APMCs) across India suffer from:
1. **Severe Congestion & Days-Long Highway Queues**: Farmers wait with loaded tractor-trolleys for 3–5 days, burning fuel and suffering distress.
2. **Intermediary Exploitation & Quota Hoarding**: Traders and middlemen pose as farmers to hoard government MSP procurement benefits.
3. **Arbitrary Quality Cuts & Scale Tampering**: Subjective quality and moisture deductions by local clerks without transparent receipts.
4. **Delayed Payments & Lack of Escalation**: Farmers struggle to track Direct Benefit Transfer (DBT) disbursements and have no mechanism to report local mandi officer corruption to higher authorities.

### 💡 The Kisan Mandi Solution
* **E-Token & Slotted Yard Entry**: Farmers schedule preferred arrival windows at designated procurement centres.
* **7/12 Digital Land Record Verification**: Calculates agricultural yield quotas dynamically (e.g., $18\text{ quintals/acre}$ for Wheat) to eliminate quota hoarding.
* **Real-Time WebSocket Queue**: Live queue board (Waiting $\to$ At Gate $\to$ Weighing $\to$ Quality Inspection $\to$ Completed) with instant status sync.
* **Standardized Quality Inspection & Digital J-Form**: Instant digital procurement receipt with moisture deduction formulas and official net MSP calculation.
* **Direct Benefit Transfer (DBT) Tracker**: End-to-end transparent subsidy tracking (`Pending` $\to$ `Processing` $\to$ `Transferred`) with bank account management.
* **Mandi Announcements & Weather Advisories**: Real-time government MSP revisions, IMD weather warnings, and scheme notifications with **Marathi & English Web Speech API Text-to-Speech (TTS)**.
* **Super Admin Vigilance Tribunal**: A higher administrative tier above local Mandi Admins allowing farmers to report mandi malpractice directly to the **District Nodal Officer / APMC Director**.

---

## 🚀 Key Features

### 1. 🌾 Farmer Experience
* **1-Click Registration & OTP Verification**: Phone verification with universal demo OTP auto-fill.
* **Farmer Profile & DBT Bank Management**: Update personal info, village, district, Aadhaar last 4, and bank account details for fast payouts.
* **7/12 Land Record Management**: Add, edit, or delete digital 7/12 records with real-time MSP quota recalculation.
* **Slot Booking with Conflict Protection**: Visual indicators tagging previously booked slots with token numbers to prevent double-booking.
* **Multilingual UI & Audio**: Complete bilingual support in **Marathi (मराठी)** and **English** with audio narration for low-literacy farmers.

### 2. 🏛️ Mandi Admin Operations
* **Digital Gate Check-In**: Instant token verification upon tractor arrival.
* **Quality Inspection Modal**: Parameterized grading (Moisture %, Foreign Matter %, Damaged Kernel %) with automated penalty calculations.
* **Weighbridge Confirmation**: Records gross, tare, and net weights with automatic MSP payout computation.
* **Digital J-Form Issuance**: Generates official sales receipts with state emblem branding and verifiable transaction IDs.

### 3. 👑 District Super Admin (Apex Governance & Vigilance)
* **Statewide APMC Command Dashboard**: Aggregated metrics across all procurement centres (total quintals procured, total payouts disbursed, active queue throughput).
* **Mandi Vigilance & Corruption Desk**: Dedicated tribunal reviewing complaints filed directly against mandis, scale tampering, or officer misconduct with official executive sanctions.
* **APMC Centres Audit**: Comprehensive inspection of daily capacity, delays, and cancellation rates per centre.
* **Statewide Broadcast Manager**: Post instant weather warnings, MSP revisions, or government schemes across all mandis.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                   │
│   • Tailwind CSS  • Lucide Icons  • React Router        │
│   • AuthContext   • LanguageContext (i18n + Web Speech) │
│   🔗 https://kisan-mandi-pied.vercel.app                │
└────────────▲──────────────────────────────▲─────────────┘
             │ HTTPS / REST (Axios)         │ WebSocket (Socket.IO)
             │ via /api                     │ (wss://kisan-mandi-api)
┌────────────▼──────────────────────────────▼─────────────┐
│                 Node.js / Express Server                │
│   • JWT Authentication (3-Tier RBAC)                    │
│   • Express Validator & Helmet Security                 │
│   • Socket.IO Server (Real-time queue rooms)            │
│   • REST Controllers (Bookings, Land Records, Updates)  │
│   🔗 https://kisan-mandi-api-2hwb.onrender.com          │
└───────────────────────────▲─────────────────────────────┘
                            │ PostgreSQL Client via Knex.js
┌───────────────────────────▼─────────────────────────────┐
│                 Neon Cloud PostgreSQL                   │
│   • 13 Knex Migrations & Seeds                          │
│   • Farmers, Bookings, 7/12 Records, Announcements      │
│   🐘 Neon Serverless Postgres (Singapore)               │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Role-Based Access Control (RBAC)

| Tier | Role | Description & Permissions |
| :---: | :--- | :--- |
| **Tier 1** | `farmer` | Book slots, view queue, manage 7/12 land records, track DBT payments, raise grievances against mandis. |
| **Tier 2** | `admin` | Mandi procurement officer; check in farmers, conduct quality inspections, record weighbridge weights, complete transactions. |
| **Tier 3** | `super_admin` | District Nodal Officer / APMC Director; statewide analytics, resolve vigilance complaints against mandis, audit centre performance, broadcast advisories. |

---

## 🔑 Quick Demo Credentials

You can log in instantly using the **1-Click Demo Login Cards** on the login page:

| Role | Mobile Number | Password | Profile Name |
| :--- | :---: | :---: | :--- |
| **👨‍🌾 Farmer** | `9876543210` | `password123` | Tukaram Patil (Pune) |
| **👨‍🌾 Farmer 2** | `9876543211` | `password123` | Dnyaneshwar Shinde (Nashik) |
| **🏛️ Mandi Admin** | `9999999999` | `password123` | Pune APMC Officer |
| **👑 Super Admin** | `8888888888` | `password123` | District Nodal Officer / APMC Director |

---

## 🗄 Database Schema (13 Migrations)

```
001_create_farmers.js                      -> Farmers & Admins table with password hash and profile
002_create_procurement_centres.js          -> APMC Mandi centres with capacity & operating hours
003_create_time_slots.js                   -> Centre time slots with farmer limits
004_create_bookings.js                     -> E-Token bookings, commodity, status, quality inspection
005_create_payments.js                     -> Gross amount, net MSP, DBT transfer status
006_create_notifications.js               -> SMS and in-app notifications
007_create_otp_verifications.js           -> OTP verification store for phone registrations
008_add_bank_details_to_farmers.js        -> DBT Account Number, IFSC, Bank Name, Branch
009_create_msp_rates.js                   -> Government MSP rate master per quintal
010_add_quality_inspection.js             -> Moisture %, foreign matter %, quality grade
011_create_land_records_and_quota.js      -> Digital 7/12 records, acreage, crop sown, yield quotas
012_create_grievances.js                  -> Dispute tickets linked to tokens
013_add_super_admin_and_announcements.js  -> Super admin RBAC, vigilance escalation, mandi announcements
```

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/request-otp` — Request 6-digit registration OTP
* `POST /api/auth/verify-otp` — Verify phone number via OTP
* `POST /api/auth/register` — Complete farmer registration with bank details
* `POST /api/auth/login` — Authenticate and receive JWT token
* `GET /api/auth/profile` — Fetch logged-in user profile
* `PUT /api/auth/profile` — Update personal and DBT bank details

### 🌾 7/12 Land Records (`/api/land-records`)
* `GET /api/land-records` — List farmer's 7/12 records with live quota usage
* `GET /api/land-records/quota/:commodity` — Get available quota for a specific crop
* `POST /api/land-records` — Add new 7/12 land record
* `PUT /api/land-records/:id` — Update survey number, acreage, or crop
* `DELETE /api/land-records/:id` — Delete land record (with active booking validation)

### 📅 Bookings & Queue (`/api/bookings`, `/api/queue`)
* `GET /api/centres` — List procurement centres
* `GET /api/centres/:id/slots` — Get available time slots for a centre
* `POST /api/bookings` — Create a new slotted E-Token booking
* `GET /api/bookings/my-bookings` — List logged-in farmer's bookings
* `PATCH /api/bookings/:id/cancel` — Cancel an upcoming booking
* `GET /api/queue/centre/:centreId` — Fetch live queue status for a mandi

### 📢 Announcements & Live Updates (`/api/updates`)
* `GET /api/updates` — Get active announcements, weather advisories & MSP notices
* `POST /api/updates` — Broadcast new advisory (Admin / Super Admin)
* `DELETE /api/updates/:id` — Remove announcement

### 👑 Super Admin Governance (`/api/super-admin`)
* `GET /api/super-admin/stats` — Statewide aggregated metrics (procurement kg, DBT payouts, grievances)
* `GET /api/super-admin/mandi-reports` — List escalated malpractice and vigilance complaints
* `PATCH /api/super-admin/grievances/:id` — Record Super Admin executive resolution order
* `GET /api/super-admin/centres-audit` — Performance audit of all APMC centres

---

## ⚡ WebSocket Live Queue Events

Connect to Socket.IO at root URL:
```javascript
import { io } from 'socket.io-client';
const socket = io('https://kisan-mandi-api-2hwb.onrender.com');

// Join centre queue room
socket.emit('join:centre', centreId);

// Listen for live token status updates
socket.on('queue:updated', ({ centreId, token, status, currentServing }) => {
  console.log(`Token ${token} updated to ${status}`);
});
```

---

## 💻 Local Development & Setup Guide

### Prerequisites
* **Node.js**: v18 or higher
* **PostgreSQL**: Local PostgreSQL or a free [Neon.tech](https://neon.tech) cloud database

### 1. Clone the Repository
```bash
git clone https://github.com/saksham-kamble/kisan-mandi.git
cd kisan-mandi
```

### 2. Setup Server
```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, and PORT

# Run migrations and seeds
npm run migrate
npm run seed

# Start server in development mode
npm run dev
```

### 3. Setup Client
```bash
cd ../client
npm install

# Start Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🚀 Deployment Guide

### Deploy Backend to Render:
1. Create a **Web Service** pointing to `server` root directory.
2. Build Command: `npm install && npm run migrate && npm run seed`
3. Start Command: `npm start`
4. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`.

### Deploy Frontend to Vercel:
1. Import repository on **Vercel** with Root Directory set to `client`.
2. Framework: `Vite`, Build: `npm run build`, Output: `dist`.
3. Set Environment Variable: `VITE_API_URL=https://<your-render-api>/api`.

---

## 📜 License & Acknowledgements
Built for the agricultural community of India to promote transparency, fair pricing, and zero-exploitation digital governance in APMC mandis. 🌾🇮🇳
