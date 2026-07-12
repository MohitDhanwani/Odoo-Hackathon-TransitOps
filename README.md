# 🚛 TransitOps - Next-Generation Fleet Management

TransitOps is a premium, full-stack fleet management platform designed to help logistics companies digitize their operations, maximize fleet utilization, and deeply understand their unit economics. With a focus on a cinematic user experience and robust data architecture, it replaces disparate spreadsheets with a single, unified source of truth.

---

## ✨ Key Features

- **📊 Live Operational Dashboard:** Get a bird's-eye view of your entire operation, including active trips, available vehicles, and fleet utilization metrics.
- **🚚 Fleet & Driver Registry:** Manage vehicles and personnel. Automatically track which vehicles are on trips, in the shop for maintenance, or retired.
- **🗺️ Intelligent Trip Dispatching:** Dispatch trips by seamlessly assigning available drivers to available vehicles. Completing a trip automatically logs exact fuel consumption and updates the vehicle's odometer.
- **🔧 Maintenance & Expense Tracking:** Log maintenance repairs and general expenses to keep vehicles in top condition while accurately tracking costs.
- **📈 Analytics & ROI:** Beautiful, real-time charts powered by Recharts that visualize Cost vs. Revenue per vehicle, expense breakdowns, and fuel consumption over time. Export complete datasets to CSV with a single click.
- **🔐 Role-Based Access Control (RBAC):** Tailored experiences for Fleet Managers, Dispatchers, Safety Officers, and Financial Analysts.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** Next.js 14 (App Router) & React
- **Styling:** Tailwind CSS v4 for utility-first styling
- **Components:** shadcn/ui for accessible, beautiful components
- **Animations:** Framer Motion for smooth, cinematic interactions
- **Charts:** Recharts for dynamic data visualization

**Backend:**
- **Framework:** Node.js & Express (TypeScript)
- **Database ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon Serverless Postgres)
- **Security:** JWT Authentication, bcrypt password hashing, and express-rate-limit

---

## 🚀 Local Development Setup

To run TransitOps locally, you'll need Node.js (v18+) and npm installed.

### 1. Clone the Repository
```bash
git clone https://github.com/MohitDhanwani/Odoo-Hackathon-TransitOps.git
cd Odoo-Hackathon-TransitOps
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file based on .env.example (You will need a PostgreSQL connection string)
cp .env.example .env

# Run database migrations and seed the database with mock data
npx drizzle-kit push
npx tsx src/db/seed.ts

# Start the backend development server (Runs on port 3000)
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (NEXT_PUBLIC_API_URL should point to the backend)
cp .env.example .env

# Start the frontend development server (Runs on port 8000)
npm run dev
```

### 4. Explore the App
Visit `http://localhost:8000` in your browser. 
You can log in using the seed accounts generated during the backend setup (e.g., `fleetmanager1@transitops.com` / password: `password123`).

---

## 🌍 Production Deployment

TransitOps is fully configured for easy cloud deployment.

- **Backend:** Includes a highly-optimized, multi-stage `Dockerfile`. Simply connect your GitHub repository to platforms like **Render**, **Railway**, or **Fly.io**, select the Docker environment, and the platform will handle the rest.
- **Frontend:** Includes a built-in Next.js proxy configuration (`next.config.ts`) that guarantees cross-origin cookies work perfectly in production. The frontend is perfectly optimized for immediate deployment on **Vercel** or **Netlify**.

---

*Built with ❤️ for the Odoo Hackathon*
