# Smart Real Estate CRM

Smart Real Estate CRM is a full-stack, role-based customer relationship and listing matching system tailored for property marketing agencies.

## Technology Stack

- **Frontend**: React (v19) + TypeScript + Tailwind CSS + Lucide Icons + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: SQLite (local dev.db database, easily portable to PostgreSQL via Prisma datasource config)
- **APIs & Tools**: Swagger UI (documentation), wa.me API link formatting (WhatsApp)

---

## Features

1. **HubSpot-style Dashboard**: Displays total properties, sale/rent distribution, active requests count, total revenue, top areas, top agents, and matching opportunities counts. Includes full light/dark themes.
2. **Dynamic Bilingual Translation**: Toggle dynamically between English and Arabic. RTL (Right-to-Left) alignment is automatically adjusted when Arabic is toggled.
3. **Smart Matching Engine**: 
   - Strict parameters (Property type, listing type) check.
   - Fuzzy scoring logic for locations (preferred areas), budget margins, area size (sqm), bedrooms, and furnishing status.
   - Outputs a Match Score from 0% to 100% with a breakdown of matched parameters.
4. **WhatsApp Dispatch Simulator**: Saves notifications log in the database and generates a wa.me redirect link (`https://wa.me/{phone}?text={message}`) to open WhatsApp Web and send notifications to clients.
5. **Reminders & Calendaring**: Schedules follow-ups and calls. Allows marking tasks as completed.
6. **Broker Network Management**: Tracks external brokers, their deals closed, and calculates commission percentages.
7. **System Audit Logs**: Complete audit trails tracking administrator and manager operations with payload details.

---

## Folder Layout

```
smart-real-estate-crm/
├── backend/            # Express Node API Server
│   ├── prisma/         # Schema, Migrations, dev.db, and Seed scripts
│   └── src/            # REST endpoints, Matching engine, WhatsApp helpers
├── frontend/           # React Client Application
│   ├── src/            # React views, Context translations, API integrations
│   └── index.html      # App template loaded with Google Cairo/Inter fonts
└── start.bat           # Launcher script to run both servers concurrently
```

---

## Setup & Running Guide

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Quick Run (Concurrent Script)
Double-click `start.bat` in the root folder. This automatically starts:
- The Backend server on **http://localhost:5000**
- The Frontend dev client on **http://localhost:5173**

### 3. Manual Start
If you prefer running them in separate terminals:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## Testing Credentials

The database is pre-seeded with mock accounts and listings. Use the following profiles to test roles:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@smartcrm.com` | `admin123` |
| **Sales Manager** | `manager@smartcrm.com` | `manager123` |
| **Sales Agent** | `agent@smartcrm.com` | `agent123` |

---

## API Documentation

The backend REST API comes equipped with Swagger. Once the backend server is running, view the documentation at:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**
