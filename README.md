# Vendor Performance Analytics Web Application

A production-ready full-stack web application for enterprise supply chain procurement and vendor performance analytics. Built using **React 19 (JavaScript/JSX)**, **Vite 8**, **Tailwind CSS v4**, **Recharts**, **Python 3.12 (FastAPI)**, **SQLAlchemy 2.0**, **Pandas**, and **MySQL 8.0**.

---

## 1. System Architecture & Data Pipeline

The application adheres strictly to the multi-tier analytical data pipeline:

```
Original Procurement Datasets (.csv / .xlsx)
                      ↓
  Python / Pandas Cleansing & Validation Engine
                      ↓
          MySQL 8.0 Relational Database
                      ↓
      Python Statistical & CVPI Scoring Engine
                      ↓
      FastAPI REST APIs (with JWT Security)
                      ↓
   React.js Dashboard & Data Visualization UI
```

---

## 2. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, JavaScript (ES6+), JSX, Vite 8, Tailwind CSS v4, Recharts, Lucide Icons, React Router v7, Axios |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pandas, NumPy, SciPy, SQLAlchemy 2.0, Pydantic v2, PyJWT, Bcrypt |
| **Database** | MySQL 8.0 Community Server / Cloud MySQL, PyMySQL driver, InnoDB storage engine |
| **Testing** | Pytest (Backend API & analytics suites), Vitest & React Testing Library (Frontend UI test suites) |
| **Deployment** | Vercel (Frontend SPA), Render / Railway (FastAPI Web Service), Aiven / PlanetScale / Railway (Managed Cloud MySQL) |

---

## 3. Database Schema Overview (`backend/schema.sql`)

The MySQL database `vendor_analytics_db` includes 8 relational tables:

1. **`users`**: Authentication credentials, names, roles, and salted bcrypt password hashes.
2. **`upload_batches`**: Audit tracking of file uploads, rows processed, and validation status.
3. **`vendors`**: Master vendor directory (vendor number, vendor name, category).
4. **`purchase_transactions`**: Granular purchase line items (PO number, PO date, receiving date, brand, unit price, quantity, dollars).
5. **`sales_transactions`**: Downstream retail sales orders (store, brand, sales date, quantity, total dollars, retail price).
6. **`inventory_records`**: Retail branch inventory snapshots (beginning vs ending stock on hand, unit prices, store locations).
7. **`vendor_invoices`**: Invoice-level aggregation tracking PO dates, invoice dates, total dollars, freight costs, and approvals.
8. **`vendor_summary_metrics`**: Analytical aggregate cache (procurement spend, downstream sales, gross profit, profit margin, stock turnover, lead time, on-time delivery rate, freight %, composite score, rank, 95% confidence intervals).

---

## 4. Analytical KPIs & Scoring Methodology

### A. Average Delivery Lead Time & On-Time Delivery Rate
* **Average Delivery Days**: `AVG(actual_delivery_date - po_date)` across delivered purchase orders.
* **On-Time Delivery Rate**: `(Delivered orders on or before expected SLA ÷ Total delivered orders) × 100`. (Empirical median SLA is benchmarked at 9 days).

### B. Commercial Margins & Velocity
* **Gross Profit**: `Total Sales Dollars - Total Purchase Dollars`.
* **Profit Margin (%)**: `(Gross Profit ÷ Total Sales Dollars) × 100`.
* **Stock Turnover Ratio**: `Total Sales Quantity ÷ Total Purchase Quantity`.
* **Freight Cost Efficiency**: `(Freight Cost ÷ Procurement Dollars) × 100`.

### C. Composite Vendor Performance Index (CVPI)
Every vendor receives an objective performance score on a **0 to 100 scale**:
$$\text{CVPI} = (0.20 \times \text{Spend Scale}) + (0.25 \times \text{Profit Margin}) + (0.25 \times \text{Stock Turnover}) + (0.20 \times \text{Delivery SLA}) + (0.10 \times \text{Freight Efficiency})$$
Vendors are ranked monotonically ($1 \dots N$) based on their CVPI score.

### D. 95% Confidence Intervals
Profit margins across vendor cohorts are evaluated with Student's $t$-distribution:
$$\text{CI}_{95\%} = \bar{x} \pm t_{0.025, n-1} \times \frac{s}{\sqrt{n}}$$

---

## 5. Local Development Setup (Windows PowerShell)

### Prerequisites
* **Python 3.10+** (Tested on Python 3.12.3)
* **Node.js 18+** and **npm** (Tested on Node v24.11.0 / npm 11.6.1)
* **MySQL 8.0 Server** running on `localhost:3306`

### Step 1: Clone Repository & Git Safety
```powershell
git clone <your-repository-url>
cd vendor-performance-analytics

# Ensure .env files are never tracked
git status
```

### Step 2: Database Initialization
```powershell
cd backend
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vendor_analytics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p vendor_analytics_db < schema.sql
```

### Step 3: Backend Setup & Seed Data
```powershell
# Navigate to backend and create virtual environment
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env from template
Copy-Item .env.example .env

# Populate database with initial dataset and compute CVPI metrics
python seed_data.py

# Run schema migrations
python -m app.migrations

# Start FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**
* API Health Check: **http://127.0.0.1:8000/api/health**

### Step 4: Frontend Setup
```powershell
# In a new PowerShell terminal:
cd frontend
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
* Web Dashboard: **http://127.0.0.1:5173/**
* Sign Up: **http://127.0.0.1:5173/signup**
* Sign In: **http://127.0.0.1:5173/login**

---

## 6. Running Automated Tests

### Backend Unit & Integration Tests (Pytest)
```powershell
cd backend
python -m pytest
```
*Runs all 28 backend tests covering authentication, vendor management, CVPI scoring, data cleansing, and authenticated report downloads.*

### Frontend Unit & Component Tests (Vitest)
```powershell
cd frontend
npm run test
```
*Runs 10 component tests covering theme persistence, KPI formatting, login/signup forms, and unified dashboard rendering.*

### Frontend Production Build
```powershell
cd frontend
npm run build
```

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)
| Variable Name | Required | Default / Example Value | Description |
|---|---|---|---|
| `PROJECT_NAME` | No | `Vendor Performance Analytics` | Application display name |
| `PORT` | Yes (Cloud) | `8000` | Port for Uvicorn web server |
| `DATABASE_URL` | **Yes** | `mysql+pymysql://<user>:<password>@<host>:3306/<db>?charset=utf8mb4` | MySQL connection URI |
| `SECRET_KEY` | **Yes** | `python -c "import secrets; print(secrets.token_hex(32))"` | Cryptographic key for signing JWT tokens |
| `ALGORITHM` | No | `HS256` | JWT signature algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `15` | Short-lived access token duration (minutes) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Long-lived refresh token duration (days) |
| `CORS_ORIGINS` | **Yes** | `http://localhost:5173,https://your-app.vercel.app` | Comma-separated allowed frontend origins |
| `UPLOAD_DIR` | No | `backend/uploads_temp` | Temporary storage for CSV uploads |

### Frontend (`frontend/.env`)
| Variable Name | Required | Default / Example Value | Description |
|---|---|---|---|
| `VITE_API_URL` | **Yes (Cloud)** | `https://your-backend.onrender.com/api` | Full URL to the deployed FastAPI backend API |

*(Note: In local development, leaving `VITE_API_URL` unset automatically proxies `/api` requests to `http://127.0.0.1:8000` via Vite).*

---

## 8. Complete Production Deployment Guide

Deploying the application online involves three simple stages:

```
[1. Managed Cloud MySQL] ───► [2. FastAPI Backend on Render/Railway] ───► [3. React Frontend on Vercel]
```

### Stage 1: Cloud MySQL Database Setup
1. Provision a MySQL 8.0 instance on a managed cloud database provider (**Aiven for MySQL**, **Railway**, or **PlanetScale**).
2. Note your connection details: Host, Port (`3306`), Username, Password, Database Name (`vendor_analytics_db`).
3. Import the database schema into the cloud instance:
   ```powershell
   mysql -h <cloud-host> -P 3306 -u <user> -p vendor_analytics_db < backend/schema.sql
   ```
4. Transfer existing records from your local database:
   ```powershell
   # Dump data only (excluding structure)
   mysqldump -u root -p --no-create-info --complete-insert vendor_analytics_db > backup_data.sql
   
   # Import data into cloud database
   mysql -h <cloud-host> -P 3306 -u <user> -p vendor_analytics_db < backup_data.sql
   ```

### Stage 2: Backend Deployment (Render or Railway)
1. In your hosting dashboard (e.g. Render or Railway), create a new **Web Service** connected to your GitHub repository.
2. Configure settings:
   * **Root Directory:** `backend`
   * **Environment:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   * `DATABASE_URL`: `mysql+pymysql://<user>:<password>@<cloud-host>:3306/vendor_analytics_db?charset=utf8mb4`
   * `SECRET_KEY`: `<generate-a-new-random-hex-string>`
   * `CORS_ORIGINS`: `http://localhost:5173,https://<your-future-vercel-app>.vercel.app`
   * `ACCESS_TOKEN_EXPIRE_MINUTES`: `15`
   * `REFRESH_TOKEN_EXPIRE_DAYS`: `7`
4. Deploy the service and verify: `https://<your-backend>.onrender.com/api/health` should return `{"status": "healthy", "database": "connected"}`.

### Stage 3: Frontend Deployment (Vercel)
1. In your Vercel Dashboard, click **Add New > Project** and import your GitHub repository.
2. Configure Project:
   * **Framework Preset:** `Vite`
   * **Root Directory:** `frontend`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. Add Environment Variable:
   * `VITE_API_URL`: `https://<your-backend>.onrender.com/api`
4. Click **Deploy**. Vercel will automatically build the static assets and deploy globally.

### Stage 4: Connect CORS
1. Once Vercel provides your live frontend domain (e.g., `https://vendor-analytics-web.vercel.app`):
2. Go to your Render/Railway backend environment variables.
3. Update `CORS_ORIGINS` to include your exact Vercel URL:
   ```
   CORS_ORIGINS=http://localhost:5173,https://vendor-analytics-web.vercel.app
   ```
4. Save and restart the backend web service. Your application is now live and fully operational for public users!
