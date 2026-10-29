# 🎓 Cyclic Recruitment Portal (CRP)
### College Seasonal Hiring Intelligence, Cyclic Pattern Tracking & Placement Management System

A complete full-stack web application that helps college students understand **recurring company recruitment patterns**, identify **expected hiring seasons**, check their **eligibility from 1st academic year until final year**, and systematically prepare for placement drives.

The portal tracks companies that repeatedly recruit from colleges during specific months or seasons (such as **Accenture** visiting consistently in **September / Q3**). The portal analyzes historical recruitment logs to predict upcoming visits and highlights whether each opportunity is **`Confirmed (Official Schedule)`** or **`Estimated (Predicted from Historical Pattern)`**.

---

## 🚀 Quick Start & Live Application

### 1. Launch the Application
```bash
# Start backend and serve frontend (runs on http://localhost:5000)
npm start
```
- **Live Portal Homepage:** [http://localhost:5000/index.html](http://localhost:5000/index.html)
- **12-Month Cyclic Calendar:** [http://localhost:5000/seasonal-calendar.html](http://localhost:5000/seasonal-calendar.html)
- **Company Catalog & Pattern Intelligence:** [http://localhost:5000/companies.html](http://localhost:5000/companies.html)

### 2. Demo User Credentials (All Roles Ready)

| Role | Email | Password | Academic Year / Details |
| :--- | :--- | :--- | :--- |
| **Placement Admin** | `admin@crp.edu` | `admin123` | Central Placement Officer |
| **Teacher / Coordinator** | `teacher@crp.edu` | `dept123` | Department Faculty Coordinator |
| **MCA Coordinator** | `mca.coord@crp.edu` | `dept123` | Prof. K. Venkatesh (MCA HOD) |
| **Student (Final Year MCA)** | `rahul.mca@crp.edu` | `student123` | Final Year, CGPA 8.85, 0 Arrears (Eligible for Accenture) |
| **Student (1st Year CSE)** | `arjun.firstyear@crp.edu` | `student123` | 1st Year Fresher, CGPA 7.4, 1 Arrear (Diagnostics demonstration) |

---

## 🌟 Core Features & Modules

### 1. 🔁 Cyclic & Seasonal Recruitment Tracking (Core Engine)
- **Multi-Year Historical Analysis:** Tracks past recruitment dates, packages, student selection counts, and cutoffs across multiple academic cycles (2021–2025).
- **Statistical Recurrence Engine:** Analyzes mode hiring month, quarterly frequency, and pattern consistency rate (e.g. Accenture's 4-year September hiring cycle).
- **12-Month Interactive Recruitment Calendar:** Monthly ribbon (Jan–Dec) and seasonal quarters (Q1–Q4) with instant filtering.
- **Confirmed vs. Estimated Status:**
  - `Confirmed`: Officially scheduled campus drives announced by the placement cell.
  - `Estimated`: Predicted campus arrival window derived from historical hiring cycles.

### 2. ⚡ Automated Multi-Criteria Eligibility Engine
Evaluates student profiles against company requirements in real time:
- **Criteria Checked:** CGPA, active arrears, academic year (1st to 4th year), degree/qualification, 10th standard percentage, 12th/Diploma percentage.
- **Exact Diagnostic Messages:**
  - *Eligible:* `"Eligible: You meet the currently configured eligibility criteria."`
  - *Ineligible (CGPA):* `"Not Eligible: Your CGPA is below the company's minimum requirement of 7.0."`
  - *Ineligible (Academic Year):* `"Not Eligible: This opportunity is restricted to 3rd Year, 4th Year students. You are currently in 1st Year."`
  - *Ineligible (Arrears):* `"Not Eligible: Company requires 0 active arrears. You currently have 1 active backlog."`
- **Tailored Recommendations:** Suggests specific action items, roadmaps, and preparation strategies.

### 3. 👥 Three Role-Based Modules
- **👨‍🎓 Student Module:** Profile management with Academic Year (1st–4th), CGPA, diploma/12th scores, arrears, bookmarked companies wishlist, cyclic calendar, company profiles, and preparation roadmaps.
- **🏛️ Teacher / Department Coordinator Module:** Department roster management, batch eligibility matcher (*e.g., test 45 students against Accenture in one click*), broadcast department notices, and placement readiness tracking.
- **🛡️ Admin Module:** Central controller to manage companies, historical recruitment logs, upcoming drives, departments, students, and college-wide placement statistics.

---

## 🗄️ Relational MySQL Database Deliverables
The project includes complete production-grade relational MySQL 8.0 scripts:
- **`database.sql`:** Complete DDL with 15 normalized tables, foreign keys, cascade constraints, indexes, and views (`v_recurring_company_patterns`, `v_department_placement_readiness`).
- **`seed.sql`:** Multi-year demo data featuring Accenture, TCS, AWS, Microsoft, Deloitte, Goldman Sachs, SAP Labs, Zoho, and 4-year recruitment logs.

To import into MySQL:
```bash
mysql -u root -p < database.sql
mysql -u root -p < seed.sql
```

---

## 📁 Project Folder Structure

```
cyclic-recruitment-portal/
├── server.js                     # Root Express server, sessions, EJS config & error handlers
├── package.json                  # Dependencies & scripts
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── config/
│   └── db.js                     # MongoDB connection with zero-config memory fallback
├── models/
│   ├── User.js                   # Authentication & role-based credentials (bcryptjs)
│   ├── Student.js                # Academic scores, CGPA, backlogs & skills
│   ├── Department.js             # MCA, CSE, ISE, ECE departments & HOD details
│   ├── Company.js                # Corporate recruiters, industry & compensation tiers
│   ├── RecruitmentDrive.js       # Seasonal hiring drives, cutoffs & interview rounds
│   ├── Announcement.js           # Priority notices broadcasted to departments
│   └── PlacementRecord.js        # Official verified placement offers and CTCs
├── middleware/
│   └── authMiddleware.js         # Session validation & role-based access control
├── controllers/
│   ├── authController.js         # Login, student registration & session destruction
│   ├── studentController.js      # Student dashboard, profile, drives & roadmaps
│   ├── departmentController.js   # Dept dashboard, student roster, eligible drives & stats
│   └── adminController.js        # Admin dashboard, full CRUD operations & reports
├── routes/
│   ├── authRoutes.js             # /login, /register, /logout
│   ├── publicRoutes.js           # /, /seasonal-calendar, /companies, /companies/:id
│   ├── studentRoutes.js          # /student/dashboard, /profile, /drives, /roadmaps
│   ├── departmentRoutes.js       # /department/dashboard, /students, /drives, /statistics
│   └── adminRoutes.js            # /admin/dashboard, CRUD on companies, drives, students...
├── views/
│   ├── partials/
│   │   ├── header.ejs            # HTML head, Bootstrap 5, Bootstrap Icons, Chart.js
│   │   ├── navbar.ejs            # Dynamic role-based navigation & quick demo login bar
│   │   ├── alerts.ejs            # Flash notifications (success/error alerts)
│   │   └── footer.ejs            # Footer with architectural principles & links
│   ├── home.ejs                  # Landing page with seasonal cycles & module presentations
│   ├── login.ejs                 # Unified login with 1-click demo filler buttons
│   ├── register.ejs              # Student enrollment with academic metrics
│   ├── seasonal-calendar.ejs     # Q1-Q4 tabbed interactive hiring calendar
│   ├── 404.ejs                   # Clean page not found template
│   ├── 500.ejs                   # Server error template
│   ├── companies/
│   │   ├── list.ejs              # Catalog with search, seasonal filters & badges
│   │   └── details.ejs           # Full details, round timeline & real-time eligibility
│   ├── student/
│   │   ├── dashboard.ejs         # Metric tiles, current drives & notices
│   │   ├── profile.ejs           # Manage CGPA, backlogs, skills & URLs
│   │   ├── drives.ejs            # Seasonal drives list with live eligibility badges
│   │   └── roadmaps.ejs          # 8-week sprint roadmap, DSA & STAR framework
│   ├── department/
│   │   ├── dashboard.ejs         # Department strength, placed count & eligible drives
│   │   ├── students.ejs          # Department student roster with filters
│   │   ├── drives.ejs            # Eligible drives with batch student matcher
│   │   ├── placements.ejs        # Department placement record table
│   │   └── statistics.ejs        # Chart.js placement conversion & company charts
│   └── admin/
│       ├── dashboard.ejs         # Central counters, quick shortcuts & recent drives
│       ├── companies.ejs         # Company management table
│       ├── company-form.ejs      # Add/edit corporate partner
│       ├── drives.ejs            # Seasonal drives management table
│       ├── drive-form.ejs        # Schedule/edit seasonal drive with round details
│       ├── students.ejs          # College-wide student records table
│       ├── student-form.ejs      # Add/edit student record
│       ├── departments.ejs       # Add and view academic departments
│       ├── announcements.ejs     # Broadcast priority notices
│       ├── placement-records.ejs # Record and track verified campus offers
│       └── reports.ejs           # Executive charts & department performance
├── public/
│   ├── css/
│   │   └── style.css             # Collegiate blue-and-white theme & seasonal badges
│   └── js/
│       └── main.js               # Tooltips, auto-dismiss alerts & 1-click demo fillers
├── scripts/
│   ├── seed.js                   # Comprehensive realistic database seeder
│   └── test_flow.js              # Automated end-to-end functional test suite
└── README.md
```

---

## 🛠️ Required NPM Packages & Technologies

- **`express`**: Fast, unopinionated web framework for Node.js
- **`ejs`**: Embedded JavaScript template engine for server-side HTML rendering
- **`express-session`**: Server-side session management for role-based authentication
- **`connect-flash`**: Flash alert messages stored in sessions
- **`mongoose`**: Object Data Modeling (ODM) library for MongoDB
- **`bcryptjs`**: Cryptographic password hashing (salt rounds = 10)
- **`method-override`**: Allows HTML forms to support RESTful operations
- **`dotenv`**: Environment variable management
- **`morgan`**: HTTP request logger middleware
- **`mongodb-memory-server`**: Automatic zero-config fallback if local MongoDB is not running

---

## 🔑 Demonstration Login Credentials

The project comes pre-seeded with sample accounts across all roles. 
*(You can also click the **Quick 1-Click Demo Credentials** buttons directly on the login page!)*

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Placement Admin** | `admin@crp.edu` | `admin123` | Central Placement Cell (Full CRUD, Reports, Announcements) |
| **MCA Department** | `mca.coord@crp.edu` | `dept123` | MCA Department Coordinator (Student Roster, Batch Matcher) |
| **CSE Department** | `cse.coord@crp.edu` | `dept123` | CSE Department Coordinator |
| **Student (MCA - Placed)** | `rahul.mca@crp.edu` | `student123` | Rahul Sharma (CGPA: 8.85, 0 Backlogs, Placed at AWS) |
| **Student (CSE - Placed)** | `priya.cse@crp.edu` | `student123` | Priya Sundaram (CGPA: 9.15, 0 Backlogs, Placed at Microsoft) |
| **Student (MCA - Backlog)** | `amit.mca@crp.edu` | `student123` | Amit Patel (CGPA: 7.20, 1 Backlog - tests cutoff diagnostics) |

---

## 🚀 Step-by-Step Instructions to Run the Application

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** (v9 or higher)
- **MongoDB** (Local MongoDB running, or zero-config automatic memory fallback will initialize seamlessly)

### 2. Navigate to Project Directory
```bash
cd "c:\Users\sreejishna\OneDrive\Desktop\crp pro"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Database with Demonstration Data
```bash
npm run seed
```
*(This loads 4 departments, 8 seasonal companies across Q1–Q4, 8 recruitment drives, demo users, notices, and placement records).*

### 5. Start the Application
```bash
npm start
```

### 6. Open in Browser
- **Portal URL**: [http://localhost:5000](http://localhost:5000)
- **Login Page**: [http://localhost:5000/login](http://localhost:5000/login)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🎓 List of Key Features to Demonstrate to your Mentor

When presenting your MCA project, demonstrate these features in this order:

1. **Role-Based Authentication & Session Security**:
   - Show the unified `/login` page with 1-click demonstration credential buttons.
   - Show that logging in as `admin@crp.edu` opens the Admin panel, while `rahul.mca@crp.edu` opens the Student dashboard.
   - Demonstrate route authorization: show that a student attempting to access `/admin/dashboard` is blocked and redirected safely.

2. **The 4 Seasonal Campus Hiring Cycles (Q1 to Q4)**:
   - Navigate to `/seasonal-calendar` to showcase how companies are structured around academic quarters (Spring Internships, Summer Consulting, Autumn Mega Drives, Winter Core).
   - Filter by quarter (e.g. Q1 Jan–Mar vs Q3 Jul–Sep).

3. **Student Automated Eligibility Diagnostic Checker**:
   - Log in as Rahul Sharma (CGPA 8.85, 0 backlogs): show the green **"Eligible"** badge on AWS.
   - Switch to Amit Patel (CGPA 7.20, 1 backlog): show the warning **"Ineligible for Cutoff"** with exact mismatch diagnostics (*"CGPA 7.20 below 7.50"* or *"1 backlog exceeds 0 allowed"*).

4. **Multi-Stage Selection Rounds Timeline**:
   - Open any company details page (e.g., AWS or Goldman Sachs) and show the step-by-step interview rounds (OA, Live Coding, LLD, Bar Raiser).

5. **Department Coordinator Module & Dynamic Batch Matcher**:
   - Log in as `mca.coord@crp.edu`.
   - Show the department student roster.
   - Open **Eligible Drives**: demonstrate the batch student matcher (*e.g., "3 of 3 MCA Candidates Eligible for AWS"*).
   - Open **Placement Statistics** and present the interactive Chart.js graphs.

6. **Central Placement Admin Full CRUD Management**:
   - Schedule a new seasonal drive with cutoffs, package, and rounds.
   - Add/edit a corporate partner in the company directory.
   - Broadcast a priority notice to students and observe it appear instantly on the student dashboard.
   - Open **Reports & Analytics** to show college-wide charts.

---

## ⚠️ Common Errors and Their Solutions

1. **Error: `EADDRINUSE: address already in use :::5000`**
   - *Cause*: A previously launched Node server process is still holding port 5000.
   - *Solution*: Kill the process holding port 5000:
     - On Windows PowerShell: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force`
     - Or change `PORT=5001` in `.env`.

2. **Error: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`**
   - *Cause*: Local MongoDB service is stopped.
   - *Solution*: The project has a built-in automatic fallback to `mongodb-memory-server` in [`config/db.js`](file:///c:/Users/sreejishna/OneDrive/Desktop/crp%20pro/config/db.js). It will automatically start an in-memory database instance within 2.5 seconds if MongoDB is not reachable.

3. **Error: `Failed to lookup view "..." in views directory`**
   - *Cause*: Incorrect view path or missing `.ejs` file.
   - *Solution*: Ensure views are located under `views/` with subfolders `views/partials/`, `views/student/`, `views/department/`, `views/admin/`, and `views/companies/`.

4. **Error: Flash messages not displaying**
   - *Cause*: Session middleware must be placed before `connect-flash()` in `server.js`.
   - *Solution*: Keep the middleware sequence: `session()` → `flash()` → `app.use((req, res, next) => { res.locals... })`.
