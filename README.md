# 🌱 KisanDirect - Quick-Commerce & Multi-Store Farm Fresh Platform

A production-grade, mobile-first quick-commerce web application specializing in **fresh pulses, sprouts, and exotic vegetables** (Matki sprouts, Broccoli, Kabuli Chhole, Moong sprouts, Malai Paneer, Hydroponic Spinach, etc.) built with **Next.js (App Router)** and **MySQL**.

Supports dual pricing tiers (**Retail Consumers** & **Hotel Wholesale / HoReCa**), pure **Cash on Delivery (COD)** checkout, and **Isolated Multi-Admin Store Management**.

---

## 🚀 Key Highlights

* **100% Database Driven**: Zero hardcoded mock items. All produce, categories, pack tiers, orders, and customer accounts reside in MySQL.
* **Dual Commerce Engines**:
  * **🥬 Retail**: 200g - 1kg consumer portions, 15–20 min instant delivery.
  * **🏨 Hotel Wholesale (HoReCa)**: 5kg – 50kg crates/sacks, commercial volume pricing, GST invoicing, and receiving dock drop notes.
* **Pure Cash on Delivery (COD)**: No third-party payment gateway friction or failed redirects.
* **Frictionless Auth**: Direct mobile + password verification (zero SMS OTP).
* **Multi-Admin / Multi-Store Architecture**:
  * Multiple independent admins (e.g. suppliers, brothers, regional farms) each have an independent store.
  * Self-serve Admin Registration at `/admin/signup`.
  * Isolated inventory stock counts, order queues, and dedicated buyer directories.
* **Mobile-First Progressive Web App (PWA)**: Includes manifest, app shortcuts, and install prompt for home screen installation.

---

## 🏬 Multi-Store Architecture

```
                      ┌────────────────────────────────────────┐
                      │       MySQL Database (fresh_ecom)      │
                      └──────────────────┬─────────────────────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
        ┌───────────────────────────┐           ┌───────────────────────────┐
        │          Store 1          │           │          Store 2          │
        │  KisanDirect Central Farm │           │   Brothers Green Harvest  │
        │   Admin: 9999999999       │           │   Admin: 8888888888       │
        ├───────────────────────────┤           ├───────────────────────────┤
        │ • 9 Central Produce Items │           │ • 2 Hydroponic Produce    │
        │ • Scoped Live Stock       │           │ • Scoped Live Stock       │
        │ • Store 1 Orders Only     │           │ • Store 2 Orders Only     │
        │ • Store 1 Buyers (Pooja)  │           │ • Store 2 Buyers (Chef)   │
        └───────────────────────────┘           └───────────────────────────┘
```

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 15 (App Router, Turbopack)
* **Styling**: Modern Vanilla CSS, responsive dark mode operations hub, Lucide Icons
* **State Management**: React Context (`CartContext`, `AuthContext`)
* **Database**: MySQL with Connection Pooling (`mysql2/promise`)
* **Authentication**: HTTP-only Secure JWT Cookies (`jsonwebtoken`, `bcryptjs`)
* **PWA**: Web App Manifest, Service Worker ready

---

## 📦 Getting Started

### 1. Prerequisites
* Node.js 18+ installed
* MySQL 8.0+ running locally or in cloud

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/mayurshete1331/ecom.git
cd ecom
npm install
```

### 3. Configure Environment Variables
Create `.env.local` in the project root:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fresh_ecom
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Database Setup & Seeding
Run the seed scripts to automatically create the tables, stores, categories, produce, and initial orders:
```bash
# Seed initial database and base catalog
node scripts/seed.js

# Apply multi-store schema and secondary farm store
node scripts/migrate-multistore.js
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is in use).

---

## 🔑 Pre-configured Accounts

### Store Operations Admins
| Role / Store | Phone | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Store 1 Admin** (*KisanDirect Central Farm*) | `9999999999` | `admin123` | `/admin/login` |
| **Store 2 Admin** (*Brothers Green Harvest*) | `8888888888` | `admin123` | `/admin/login` |
| **Register New Store** | Custom | Custom | `/admin/signup` |

### Customer Accounts
| Account Type | Name | Phone | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Retail Consumer** | Pooja Sharma | `9876543210` | `password123` | Household Delivery |
| **Hotel Wholesale** | Chef Rajesh Khanna | `9123456780` | `hotel123` | Grand Emerald Hotel (GSTIN & Dock Notes) |

---

## 🧪 Testing & Verification

Run the automated multi-tenant isolation suite:
```bash
node scripts/verify-multistore.js
```
Validates store-isolated stock updates, customer directory scoping, order routing, and storefront farm filtering.

---

## 📄 License
This project is proprietary and confidential. Developed for KisanDirect operations.
