# PhD Admission Portal — Mathematics Department · IIT Ropar

A secure, full-stack PhD Admission Portal for managing applicants in the Mathematics Department. Built with **React + Vite + Tailwind CSS** on the frontend and **Node.js + Express + Prisma ORM** on the backend, with **Supabase Postgres** as the database and **Gmail SMTP** for OTP-based authentication.

---

## 🏗️ Project Structure

```
phd_portal/
├── client/                  # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/      # FilterBar, Table, FormSection, etc.
│   │   ├── context/         # AuthContext (JWT session management)
│   │   ├── pages/           # Login, ApplicationForm, AdminDashboard
│   │   └── services/        # api.js (Axios client)
│   └── .env                 # Client environment variables
├── server/                  # Express backend
│   ├── controllers/         # applicationController, authController, exportController
│   ├── middleware/          # authMiddleware (JWT), validateMiddleware (Zod)
│   ├── routes/              # applicationRoutes, authRoutes, exportRoutes
│   ├── services/            # prismaClient.js (singleton)
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── seedAdmins.js        # Script to add admin users
│   └── .env                 # Server environment variables
└── README.md
```

---

## 🚀 Quick Start

### 1. Set Up Supabase (Database Only)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database** and copy the two connection strings under **"Connection string → URI"**: one for **Transaction mode (port 6543)** and one for **Direct (port 5432)**.
3. Go to **Project Settings → Authentication** → Configure **Custom SMTP** (recommended for production):
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username / Sender Email**: your Gmail address
   - **Password**: Gmail App Password (generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords))

> [!NOTE]
> Supabase is used **only as a PostgreSQL database host**. Authentication (OTP sending & session management) is handled entirely by the backend via Nodemailer + JWT.

### 2. Configure Environment Variables

**Client** (`client/.env`):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```

**Server** (`server/.env`):
```env
# Supabase Postgres connections (from Project Settings → Database)
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-1-...supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-1-...supabase.com:5432/postgres"

# Supabase API (for verifying student JWTs)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Your own JWT secret for signing session tokens
JWT_SECRET=your_random_secret_here

PORT=5000
CLIENT_URL=http://localhost:5173

# Gmail SMTP for OTP emails
GMAIL_USER=your_gmail@example.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

> ⚠️ **Password with special characters** (e.g. `@`) must be URL-encoded in connection strings. Example: `Dep2026@phd` → `Dep2026%40phd`

### 3. Initialize the Database

```bash
cd server
npm install
npx prisma db push     # Creates all tables in Supabase
```

### 4. Seed Admin Users

1. Open `server/seedAdmins.js` and add your admin email(s):
   ```js
   const admins = [
     { email: 'admin@iitrpr.ac.in', name: 'Admin Name', isAdmin: true },
   ]
   ```
2. Run the seeder:
   ```bash
   node seedAdmins.js
   ```
   Your admin can now log in with an OTP sent to that email.

### 5. Run the App

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication

Both students and admins use the same **Email OTP** flow — no passwords required:

| Role    | Login Method  | How to Identify          | Access                            |
|---------|---------------|--------------------------|-----------------------------------|
| Student | Email OTP     | Not in `users.isAdmin`   | Submit & edit own application     |
| Admin   | Email OTP     | `users.isAdmin = true`   | View all, filter, export Excel    |

OTPs are **generated on the backend**, sent via **Gmail SMTP**, stored temporarily in the `otps` table (10-minute expiry), and consumed on verification. A signed **JWT** is returned and stored in `localStorage` for session management.

---

## 📋 Application Form Sections

| Section | Fields |
|---|---|
| **Personal Details** | Name, Email, DOB, Category, Marital Status, Nationality, Phone, Address, Research Area |
| **Education** | 10th / 12th / Graduation / PG — each with Discipline, Institute, Study Type, Year, Score (% or CGPA), Division |
| **Qualifying Exams** | GATE: Branch, Year, Valid Upto, Percentile, Score, AIR · CSIR: Branch, Year, Valid Upto, Percentile, Score, Duration (JRF/SRF) |
| **NBHM Eligibility** | Checkbox |

> At least **one qualifying exam** (GATE or CSIR) with a score is required to submit.

---

## 📊 Admin Dashboard Features

- **Stat Cards**: Total Applicants, Avg GATE Score, NBHM Eligible count
- **Live Filters**: Category, Min GATE Score, NBHM Eligibility, Sort By, Order
- **Sortable Table**: Name, Education Scores, GATE/CSIR, Research Area, Application Date
- **Excel Export**: Filtered data exported as a styled `.xlsx` file (zebra rows, frozen header, auto-filter) with all fields

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `users` | All users (students + admins). `isAdmin` flag distinguishes roles. |
| `applications` | One per student — personal details, nationality, research area |
| `education` | Up to 4 rows per application (10th, 12th, Grad, PG) with `score_type` (percentage/CGPA) |
| `exam_scores` | GATE / CSIR scores with extended fields (branch, percentile, AIR, duration) |
| `otps` | Temporary OTP codes (auto-expired, deleted after use) |

---

## 🛡️ Security

- **JWT Auth**: All protected API routes verify a backend-signed JWT on every request
- **Admin Check**: Admin-only routes query the `users` table to confirm `isAdmin = true`
- **Input Validation**: All form submissions run through **Zod** schemas before touching the DB
- **OTP Security**: Codes expire in 10 minutes and are deleted after verification
- **One application per student**: enforced via `UNIQUE(user_id)` on the `applications` table
