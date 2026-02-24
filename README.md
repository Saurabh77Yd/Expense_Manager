# A full-stack expense tracking application built using React + TypeScript, Express.js, and MongoDB.

✨ Features

- **Add Expense**
  - Manual entry with date, amount, vendor
  - Auto-categorization based on vendor keyword
  - Description field (optional)

- **Upload CSV**
  - Drag & drop interface
  - Bulk import support
  - Real-time success/error feedback

- **Anomaly Detection**
  - Calculates category average
  - Flags expenses > 3× average
  - Highlights anomalies in dashboard

- **Dashboard with**
  - Monthly totals per category
  - Top 5 vendors
  - Anomaly count & listing
***
 - Dark / Light mode toggle
 - Fully responsive layout
 - Lazy loading 
 - Context-based refresh 

# 🛠 Tech Stack
- **Frontend**
 - React
 - TypeScript
 - Vite
 - Tailwind CSS 
 - Recharts
 - Axios

- **Backend**
 - Node.js
 - Express.js
 - TypeScript
 - MongoDB (Mongoose)
 - Zod (validation)
 - Multer (file upload)
 - csv-parse

# 🚀 Project Setup
🔹 1️⃣ Backend Setup
**Step 1: Install dependencies**
cd backend
npm install
**Step 2: Create .env file inside backend folder**
# ==============================
# Server Configuration
# ==============================
PORT=4000

# ==============================
# MongoDB Connection
# ==============================
MONGO_URI=mongodb://localhost:27017/spendex

# ==============================
# Environment
# ==============================
NODE_ENV=development

**Step 3: Start Backend**
npm run dev
server run on: http://localhost:4000

🔹 2️⃣ Frontend Setup
**Step 1: Install dependencies**
cd frontend
npm install

**Step 2: Start Frontend**
npm run dev
Frontend run on: http://localhost:3000
# ==========================================================================
# Design Note

Rule-based categorization is implemented using a keyword-to-category mapping object. Vendor names are normalized (lowercase + trim) and matched using substring checks to assign categories automatically.

Anomaly detection is handled in the backend using MongoDB aggregation to compute category averages. Expenses exceeding 3× the average are flagged as anomalies. Recalculation occurs on insert, delete, or CSV import.

The data model uses a single Expense collection with indexes on category, date, vendorName, and isAnomaly to optimize filtering and dashboard queries.

A trade-off made was recalculating anomalies per category instead of maintaining incremental averages. This simplifies logic while remaining performant for assignment-scale datasets.

# ===================================================================================

# Conclusion
 - This project demonstrates:
 - Clean separation of concerns
 - Scalable API design
 - Aggregation-based analytics
 - Optimized frontend architecture 
 - Structured, production-aware codebase

## Possible Improvements (Backend)
- Add pagination for large datasets
- Add centralized error handling
- Add rate limiting for production environments

## Possible Improvements (Frontend)
- Integrate React Query for better handling
- Implement optimistic UI updates to improve user experience 