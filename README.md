# 🌾 Kisan Mandi (किसान मंडी)

> **AI-Powered Agricultural MSP Procurement, Smart Priority Queue & Anti-Corruption GovTech Platform**  
> *Developed for Smart India Hackathon (SIH 2026)*

A modern digital agri-procurement ecosystem empowering farmers with **AI optical crop quality pre-checks**, **Grade-A Fast-Track Priority Queues**, **real-time WebSocket live queue tracking**, **dynamic 7/12 land record yield quotas**, **instant digital J-Form receipts**, **DBT subsidy tracking**, **bilingual Marathi/English Text-to-Speech (TTS)**, and an **Apex Super Admin Vigilance Tribunal** for direct escalation of mandi malpractice.

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
- [Machine Learning & Algorithmic Models Used](#-machine-learning--algorithmic-models-used)
- [Dual-Path Farmer Booking System](#-dual-path-farmer-booking-system)
- [System Architecture](#-system-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Quick Demo Credentials](#-quick-demo-credentials)
- [Database Schema (14 Migrations)](#-database-schema-14-migrations)
- [API Reference](#-api-reference)
- [WebSocket Live Queue Events](#-websocket-live-queue-events)
- [Local Development & Setup Guide](#-local-development--setup-guide)

---

## 📌 Overview & Problem Statement

Traditional agricultural mandis (APMCs) across India suffer from severe operational bottlenecks:
1. **Days-Long Tractor Trolley Queues**: Farmers wait 3 to 5 days on highways outside mandis, burning fuel and suffering distress.
2. **Subjective Quality Cuts & Price Cheating**: Mandi clerks make undocumented, arbitrary quality deductions without verifiable receipts.
3. **Intermediary Exploitation & Quota Hoarding**: Traders and middlemen pose as farmers to hoard government MSP procurement quotas.
4. **Delayed Payments & Lack of Transparency**: Paper J-Forms get lost and farmers struggle to track Direct Benefit Transfer (DBT) disbursements.

### 💡 The Kisan Mandi Solution
* **AI Grain Quality Pre-Check**: Optical computer vision analysis of harvest photos assessing moisture, grain uniformity, and foreign matter to award **Grade-A Fast-Track E-Tokens**.
* **Dual-Path Choice**: Farmers choose between a standard 1-click FIFO booking or an AI Quality scan to save 2–3 hours of waiting.
* **7/12 Digital Land Record Verification**: Calculates agricultural yield quotas dynamically (e.g. $18\text{ quintals/acre}$ for Wheat) to eliminate trader hoarding.
* **Real-Time WebSocket Queue**: Live queue board (`Waiting` $\to$ `Checked In` $\to$ `In Progress` $\to$ `Completed`) with automated audio chime alerts.
* **Standardized Quality Deductions & Digital J-Form**: Instant digital procurement receipt with transparent moisture formulas and official net MSP payouts.
* **Apex Super Admin Vigilance Tribunal**: A higher administrative tier allowing farmers to report scale tampering or officer corruption directly to the **District Nodal Officer / APMC Director**.

---

## 🤖 Machine Learning & Algorithmic Models Used

The Kisan Mandi platform implements **5 specialized algorithmic & machine learning systems**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        🤖 KISAN MANDI INTELLIGENCE ENGINE                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  1. Optical Computer Vision (CNN) & Grain Texture Analysis                            │
│     • Extracts grain uniformity, broken kernel ratio, and foreign matter surface area. │
│     • Multi-Attribute Scoring: Score = Uniformity - w_m(Moisture) - w_f(ForeignMatter) │
│     • Decision Boundary Classification: Grade A (Premium), Grade B (FAQ), Grade C.     │
│                                                                                        │
│  2. Multi-Criteria Dynamic Priority Scheduling (Triage Queue Algorithm)                │
│     • Priority Weighting: W_effective = W_status + W_priorityTier + λ(WaitTime)        │
│     • Sorts tokens dynamically: in_progress → Grade-A Express → Urgent → Standard FIFO│
│                                                                                        │
│  3. Agronomic Yield Quota & Anti-Hoarding Regression Engine                           │
│     • Linear Normative Yield Cap: Quota = Acreage × AgroZoneYieldMax                   │
│     • Prevents traders from exploiting MSP by enforcing land-acreage limits.           │
│                                                                                        │
│  4. Fair Average Quality (FAQ) Moisture Penalty Optimization Model                    │
│     • Mathematical formula: Penalty = max(0, ActualMoisture - MaxMoisture) × 0.5%      │
│     • Enforces uniform, auditable deductions eliminating human bias at weighbridges.   │
│                                                                                        │
│  5. NLP Acoustic Speech Synthesis Engine (Bilingual Voice Assistance)                  │
│     • W3C Speech Synthesis in native Marathi (mr-IN) and English (en-IN)               │
│     • Reads tokens, queue positions, and payment updates aloud for illiterate farmers. │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌾 Dual-Path Farmer Booking System

To ensure maximum accessibility and fairness, farmers are given a transparent choice during slot reservation:

| Feature | 🕒 Option 1: Standard Mandi Queue | ⚡ Option 2: AI Quality Pre-Check |
|---|---|---|
| **Requirement** | No photo required (1-Click Instant) | Clear photo of grain sample |
| **Analysis** | Standard physical inspection at gate | Optical CV grain analysis |
| **Token Type** | Standard FIFO Queue Token | Certified Grade-A Express Pass |
| **Wait Time** | Regular mandi queue order | **2–3 hours saved via Fast-Track Priority** |
| **Ideal For** | Quick reservations / Feature phone users | Clean, dry, premium quality harvest |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React 18 + Vite)             │
│  • Tailwind CSS UI  • Web Audio Chime  • Speech TTS     │
│  • Lucide Icons     • Socket.IO Client • Helper Utils   │
└────────────────────────────┬────────────────────────────┘
                             │ REST API & WebSockets
┌────────────────────────────┴────────────────────────────┐
│              SERVER (Node.js + Express REST API)        │
│  • JWT Auth & RBAC Middleware   • Dynamic Priority Sort │
│  • Automated SMS Dispatcher     • Socket.IO Rooms       │
│  • 7/12 Land Quota Calculator   • J-Form PDF Generator  │
└────────────────────────────┬────────────────────────────┘
                             │ Knex.js Query Builder
┌────────────────────────────┴────────────────────────────┐
│            DATABASE (Cloud PostgreSQL 16 on Neon)       │
│  • 14 Migrations (Farmers, Slots, Priority, J-Forms)    │
│  • Dynamic rolling 7-day slot generator                 │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Role-Based Access Control (RBAC)

1. **🌾 Farmer**: Register/login, manage 7/12 land records, book standard or AI Fast-Track slots, track live queue, view digital J-Forms, and lodge grievance tickets.
2. **🏛️ Mandi Admin**: Gate check-in, live queue management, physical weighbridge inspection, quality grading, and local grievance resolution.
3. **👑 District Super Admin**: Statewide APMC command metrics, APMC centre audit logs, broadcast management, and the Mandi Anti-Corruption Vigilance tribunal.

---

## 🔑 Quick Demo Credentials

| Role | Mobile Number | Password | Demo OTP |
|---|---|---|---|
| **Registered Farmer** | `9876543210` | `password123` | `1234` |
| **Mandi Admin (Pune APMC)** | `9876543211` | `admin123` | `1234` |
| **Super Admin (District Director)**| `9876543212` | `superadmin123` | `1234` |

---

## 🗄️ Database Schema (14 Migrations)

```
001_create_farmers.js                      → Farmer accounts & credentials
002_create_procurement_centres.js          → APMC Mandi locations & capacities
003_create_time_slots.js                   → Rolling daily capacity slots
004_create_bookings.js                     → Token reservations & queue data
005_create_payments.js                     → MSP disbursement tracking
006_create_notifications.js                → In-app alerts & SMS logs
007_create_otp_verifications.js            → OTP verification sessions
008_add_bank_details_to_farmers.js         → DBT bank account & IFSC info
009_create_msp_rates.js                    → Government MSP price master
010_add_quality_inspection.js              → Mandi gate physical inspection fields
011_create_land_records_and_quota.js       → 7/12 land parcel records & quota limits
012_create_grievances.js                   → Grievance helpdesk tickets
013_add_super_admin_and_announcements.js   → Super admin tribunal & announcements
014_add_quality_priority_to_bookings.js    → AI quality score, metrics & priority weight
```

---

## 📡 API Reference

### 1. Authentication
* `POST /api/auth/request-otp` — Request login/registration OTP
* `POST /api/auth/verify-otp` — Verify OTP
* `POST /api/auth/register` — Register new farmer
* `POST /api/auth/login` — Password authentication
* `GET /api/auth/profile` — Farmer profile with DBT bank details
* `PUT /api/auth/profile` — Update profile & bank details

### 2. Slot Booking & AI Quality
* `GET /api/centres` — List active APMC procurement centres
* `GET /api/centres/:id/slots` — Get available time slots for a centre
* `POST /api/bookings` — Create slot booking (supports `express_grade_a` AI pre-check)
* `GET /api/bookings/mine` — Farmer's booking history
* `PATCH /api/bookings/:id/cancel` — Cancel reservation

### 3. Live Queue
* `GET /api/queue/:centreId/live` — Live priority-sorted queue & statistics
* `GET /api/queue/:centreId/position/:bookingId` — Individual token queue position

### 4. Admin & Mandi Operations
* `PATCH /api/admin/bookings/:id/check-in` — Check in farmer tractor at gate
* `PATCH /api/admin/bookings/:id/start` — Start weighbridge & inspection
* `PATCH /api/admin/bookings/:id/complete` — Complete weighment, deduct moisture, issue J-Form
* `PATCH /api/admin/bookings/:id/priority` — Gate triage priority override

### 5. Grievance & Super Admin
* `POST /api/grievances` — Lodge complaint ticket
* `GET /api/super-admin/stats` — Statewide procurement totals
* `GET /api/super-admin/centres-audit` — APMC performance audits

---

## ⚡ WebSocket Live Queue Events

* **`join_queue_room`** (Client $\to$ Server): Joins room for specific `centreId`.
* **`queue_updated`** (Server $\to$ Client): Broadcasts instant queue state when a farmer checks in, advances, or completes procurement.

---

## 💻 Local Development & Setup Guide

### 1. Prerequisites
* **Node.js**: v18 or higher
* **PostgreSQL**: Local instance or free cloud database (Neon / Supabase)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/saksham-kamble/kisan-mandi.git
cd kisan-mandi

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Environment Configuration
Create `.env` inside `server/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/kisan_mandi
JWT_SECRET=kisan_mandi_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

Create `.env` inside `client/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup & Seeding
```bash
cd server
npm run migrate    # Runs all 14 database migrations
npm run seed       # Seeds Maharashtra APMCs, rolling 7-day slots & sample data
```

### 5. Run Development Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🏆 SIH 2026 Team & Acknowledgements

* **Platform**: Kisan Mandi (किसान मंडी)
* **Target Problem Statement**: Smart Agricultural Procurement & Transparent APMC Supply Chain
* **Authors**: Saksham Kamble & Team
