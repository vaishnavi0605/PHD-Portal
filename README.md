# PhD Admission Portal — Mathematics Department

A secure, full-stack PhD Admission Portal built with **React + Vite + Tailwind CSS** (frontend) and **Node.js + Express + Supabase** (backend).

---

## 🏗️ Project Structure

```
phd_portal/
├── client/          # React frontend (Vite + Tailwind)
├── server/          # Express backend
├── database/
│   └── schema.sql   # Copy-paste into Supabase SQL Editor
└── README.md
```

---

## 🚀 Quick Start

### 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste `database/schema.sql` → Run
3. Go to **Authentication → SMTP Settings** → configure Gmail:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: your Gmail address
   - Password: Gmail App Password (generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords))
4. Go to **Settings → API** → copy your URL, anon key, and service_role key

### 2. Create an Admin User

1. Go to Supabase **Authentication → Users → Add user**
2. Create a user with email + password
3. Copy the user's UUID from the Users table
4. In **SQL Editor**, run:
   ```sql
   INSERT INTO admins (user_id, name) VALUES ('paste-uuid-here', 'Admin Name');
   ```

### 3. Configure Environment Variables

**Client** (`client/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

**Server** (`server/.env`):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5000
CLIENT_URL=http://localhost:5173
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 4. Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication

| Role    | Method               | Access                         |
|---------|----------------------|--------------------------------|
| Student | Email OTP (Supabase) | Submit & edit own application  |
| Admin   | Email + Password     | View all, filter, export Excel |

---

## 📊 Features

- **Student Portal**: Multi-section form (Personal, 10th/12th/Graduation/PG, Exam Scores, NBHM)
- **Admin Dashboard**: Live filters (CGPA, Category, GATE, NBHM), sortable table, stat cards
- **Excel Export**: Styled XLSX with ExcelJS — filtered data, zebra rows, frozen header

---

## 🗄️ Database Tables

| Table         | Description                          |
|---------------|--------------------------------------|
| `admins`      | Admin user IDs                       |
| `applications`| One per student — personal + scores  |
| `education`   | 4 rows per application (10th–PG)     |
| `exam_scores` | GATE / CSIR scores                   |

---

## 🛡️ Security

- **RLS**: Students can only access their own data
- **Service Role**: Backend bypasses RLS for admin reads
- **JWT**: All API endpoints verify Supabase JWT
- **Zod**: All POST body validated before DB write
- **One application per student**: enforced via `UNIQUE(user_id)` on applications table
