-- =====================================================================
-- Cyclic Recruitment Portal (CRP)
-- Complete Relational Database Schema & Setup Script for MySQL 8.0+
-- College Seasonal Hiring Intelligence & Placement Management System
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cyclic_recruitment_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cyclic_recruitment_portal;

-- Disable foreign key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS placement_records;
DROP TABLE IF EXISTS student_applications;
DROP TABLE IF EXISTS student_bookmarks;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS interview_rounds;
DROP TABLE IF EXISTS job_roles;
DROP TABLE IF EXISTS drive_eligible_departments;
DROP TABLE IF EXISTS eligibility_criteria;
DROP TABLE IF EXISTS recruitment_drives;
DROP TABLE IF EXISTS historical_recruitment_records;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Departments Table
-- ---------------------------------------------------------------------
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  hod_name VARCHAR(100) NOT NULL,
  hod_email VARCHAR(100) NOT NULL,
  hod_phone VARCHAR(20),
  description TEXT,
  total_students INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. Users Table (Core Authentication with Role-Based Access Control)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'teacher', 'department') NOT NULL DEFAULT 'student',
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Teachers / Department Coordinators Table
-- ---------------------------------------------------------------------
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department_id INT NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  designation VARCHAR(100) DEFAULT 'Assistant Professor & Placement Coordinator',
  office_location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. Students Table (Academic Year 1st-4th, CGPA, Arrears & Scores)
-- ---------------------------------------------------------------------
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  student_id_usn VARCHAR(30) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  degree VARCHAR(50) NOT NULL DEFAULT 'MCA', -- MCA, B.Tech CSE, B.Tech ISE, B.Tech ECE
  academic_year TINYINT NOT NULL DEFAULT 4, -- 1: 1st Year, 2: 2nd Year, 3: 3rd Year, 4: 4th Year
  batch_year INT NOT NULL DEFAULT 2026,
  cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  arrears INT NOT NULL DEFAULT 0, -- Active backlogs
  history_of_arrears INT NOT NULL DEFAULT 0,
  tenth_percentage DECIMAL(5,2) DEFAULT 0.00,
  twelfth_percentage DECIMAL(5,2) DEFAULT 0.00,
  diploma_percentage DECIMAL(5,2) DEFAULT 0.00,
  skills TEXT, -- Comma-separated or JSON
  bio TEXT,
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  placement_status ENUM('Not Placed', 'Placed', 'Higher Studies', 'Opted Out') DEFAULT 'Not Placed',
  placed_company VARCHAR(150),
  placed_package_lpa DECIMAL(6,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  INDEX idx_students_cgpa (cgpa),
  INDEX idx_students_year (academic_year),
  INDEX idx_students_dept (department_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. Companies Table (Corporate Recruiters with Seasonal Tier Info)
-- ---------------------------------------------------------------------
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  logo_url VARCHAR(255),
  website VARCHAR(255),
  industry VARCHAR(100) NOT NULL,
  tier ENUM('Super Dream (15+ LPA)', 'Dream (8-15 LPA)', 'Tier-1 Core (5-8 LPA)', 'Mass Recruiter (3.5-5 LPA)', 'Fintech', 'Product / Startup') DEFAULT 'Dream (8-15 LPA)',
  hiring_season VARCHAR(80) NOT NULL DEFAULT 'July - September Hiring',
  season_quarter ENUM('Q1', 'Q2', 'Q3', 'Q4', 'All') DEFAULT 'Q3',
  recruitment_type VARCHAR(80) DEFAULT 'Seasonal Mega Drive',
  description TEXT NOT NULL,
  headquarters VARCHAR(100) DEFAULT 'Bengaluru, India',
  contact_email VARCHAR(120),
  contact_person VARCHAR(100),
  salary_range VARCHAR(50) DEFAULT '8 - 14 LPA',
  stipend_monthly INT DEFAULT 35000,
  vacancies INT DEFAULT 20,
  default_location VARCHAR(100) DEFAULT 'Bengaluru / Pan India',
  default_work_mode ENUM('Onsite', 'Remote', 'Hybrid') DEFAULT 'Hybrid',
  experience_requirement VARCHAR(100) DEFAULT 'Freshers (2026 Batch)',
  application_link VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_companies_quarter (season_quarter),
  INDEX idx_companies_tier (tier)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. Historical Recruitment Records (CORE FEATURE: Tracking Past Cyclic Visits)
-- ---------------------------------------------------------------------
CREATE TABLE historical_recruitment_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  academic_year VARCHAR(20) NOT NULL, -- e.g., '2021-2022', '2022-2023', '2023-2024'
  recruitment_year INT NOT NULL, -- Calendar Year: 2021, 2022, 2023, 2024, 2025
  hiring_month VARCHAR(20) NOT NULL, -- 'January' ... 'December'
  hiring_month_number TINYINT NOT NULL, -- 1 to 12
  season_quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
  recruitment_date DATE,
  job_roles_offered TEXT, -- e.g. "Associate Software Engineer, Advanced Developer"
  salary_package VARCHAR(50), -- e.g. "4.5 - 6.5 LPA"
  stipend_monthly INT DEFAULT 0,
  students_selected INT DEFAULT 0,
  total_applicants INT DEFAULT 0,
  min_cgpa_required DECIMAL(4,2) DEFAULT 6.50,
  max_arrears_allowed INT DEFAULT 0,
  allowed_degrees VARCHAR(255) DEFAULT 'MCA, B.Tech CSE, B.Tech ISE, B.Tech ECE',
  selection_rounds TEXT,
  schedule_type ENUM('Confirmed', 'Estimated') DEFAULT 'Confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_historical_company (company_id),
  INDEX idx_historical_month (hiring_month_number),
  INDEX idx_historical_year (recruitment_year)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. Recruitment Drives Table (Scheduled Campus Hiring Drives)
-- ---------------------------------------------------------------------
CREATE TABLE recruitment_drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  drive_title VARCHAR(150) NOT NULL,
  hiring_season VARCHAR(80) NOT NULL DEFAULT 'July - September Hiring',
  season_quarter ENUM('Q1', 'Q2', 'Q3', 'Q4') DEFAULT 'Q3',
  drive_type ENUM('On-Campus Mega Drive', 'Seasonal Hybrid Drive', 'Virtual Dream Drive', 'Pool Campus Drive', 'Regular / Special Drive') DEFAULT 'On-Campus Mega Drive',
  drive_start_date DATE NOT NULL,
  drive_end_date DATE NOT NULL,
  registration_deadline DATETIME NOT NULL,
  status ENUM('Upcoming', 'Active / In Progress', 'Completed', 'Postponed', 'Cancelled') DEFAULT 'Upcoming',
  recruitment_mode ENUM('Virtual / Online', 'In-Person / On-Campus', 'Hybrid (Online Test + Offline Interview)') DEFAULT 'Hybrid (Online Test + Offline Interview)',
  recruitment_location VARCHAR(150) DEFAULT 'Campus Placement Auditorium',
  salary_range VARCHAR(50) DEFAULT '8 - 14 LPA',
  stipend_monthly INT DEFAULT 35000,
  total_openings INT DEFAULT 25,
  schedule_type ENUM('Confirmed', 'Estimated') DEFAULT 'Confirmed',
  application_link VARCHAR(255),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_drives_dates (drive_start_date, drive_end_date),
  INDEX idx_drives_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. Eligibility Criteria Table (Configurable Rules for Drives/Companies)
-- ---------------------------------------------------------------------
CREATE TABLE eligibility_criteria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT DEFAULT NULL,
  drive_id INT DEFAULT NULL,
  min_cgpa DECIMAL(4,2) NOT NULL DEFAULT 6.50,
  max_arrears INT NOT NULL DEFAULT 0,
  min_tenth DECIMAL(5,2) DEFAULT 60.00,
  min_twelfth DECIMAL(5,2) DEFAULT 60.00,
  min_diploma DECIMAL(5,2) DEFAULT 60.00,
  allowed_academic_years VARCHAR(50) DEFAULT '3,4', -- e.g. "3,4" for 3rd and 4th year
  allowed_degrees VARCHAR(255) DEFAULT 'MCA, B.Tech CSE, B.Tech ISE, B.Tech ECE',
  allowed_batches VARCHAR(50) DEFAULT '2026',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES recruitment_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. Drive-Eligible Departments (Many-to-Many Bridge Table)
-- ---------------------------------------------------------------------
CREATE TABLE drive_eligible_departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drive_id INT NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (drive_id) REFERENCES recruitment_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_drive_dept (drive_id, department_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. Job Roles Table
-- ---------------------------------------------------------------------
CREATE TABLE job_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  drive_id INT DEFAULT NULL,
  title VARCHAR(120) NOT NULL,
  role_category VARCHAR(80) DEFAULT 'Software Engineering',
  ctc_min DECIMAL(6,2) DEFAULT 6.00,
  ctc_max DECIMAL(6,2) DEFAULT 12.00,
  currency VARCHAR(10) DEFAULT 'LPA',
  location VARCHAR(100) DEFAULT 'Bengaluru / Hybrid',
  work_mode ENUM('Onsite', 'Remote', 'Hybrid') DEFAULT 'Hybrid',
  vacancies INT DEFAULT 10,
  technical_skills TEXT,
  job_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES recruitment_drives(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. Multi-Stage Interview Rounds Table
-- ---------------------------------------------------------------------
CREATE TABLE interview_rounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT DEFAULT NULL,
  drive_id INT DEFAULT NULL,
  round_number TINYINT NOT NULL DEFAULT 1,
  round_name VARCHAR(120) NOT NULL,
  mode ENUM('Online', 'Offline', 'Offline / In-Person', 'In-Person / On-Campus', 'Hybrid') DEFAULT 'Online',
  duration VARCHAR(50) DEFAULT '60 mins',
  description TEXT,
  tips TEXT,
  topics_covered TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES recruitment_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. Student Bookmarks / Wishlist (Track Companies of Interest)
-- ---------------------------------------------------------------------
CREATE TABLE student_bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY uq_student_company_bookmark (student_id, company_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. Student Job Applications & Status Tracker
-- ---------------------------------------------------------------------
CREATE TABLE student_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  drive_id INT NOT NULL,
  job_role_id INT DEFAULT NULL,
  status ENUM('Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected') DEFAULT 'Submitted',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  interview_date DATETIME DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES recruitment_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE SET NULL,
  UNIQUE KEY uq_student_drive_app (student_id, drive_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 14. Announcements Table (Central & Department Notices)
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('Drive Schedule Update', 'Shortlist & Results', 'Preparation Workshop', 'Policy & Guidelines', 'Emergency Notice') DEFAULT 'Drive Schedule Update',
  priority ENUM('Normal', 'High', 'Urgent') DEFAULT 'Normal',
  target_audience ENUM('All Students', 'Specific Department', 'Registered Candidates', 'Eligible Only') DEFAULT 'All Students',
  department_id INT DEFAULT NULL,
  posted_by_user_id INT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (posted_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 15. Placement Records Table (Official College Placement Statistics)
-- ---------------------------------------------------------------------
CREATE TABLE placement_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  job_role VARCHAR(120) NOT NULL,
  package_lpa DECIMAL(6,2) NOT NULL,
  placement_season VARCHAR(80) DEFAULT 'July - September Hiring',
  placement_year INT NOT NULL DEFAULT 2026,
  offer_type ENUM('Full Time (FTE)', 'Internship + PPO', '6-Month Internship') DEFAULT 'Full Time (FTE)',
  offer_date DATE NOT NULL,
  status ENUM('Offer Accepted', 'Offer Declined', 'Pending Verification') DEFAULT 'Offer Accepted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- DATABASE VIEWS FOR INTELLIGENCE & REPORTING
-- =====================================================================

-- 1. View: Recurring Hiring Pattern Intelligence per Company
CREATE OR REPLACE VIEW v_recurring_company_patterns AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.tier,
  c.industry,
  c.salary_range,
  COUNT(h.id) AS total_past_recruitment_cycles,
  MIN(h.recruitment_year) AS first_recorded_year,
  MAX(h.recruitment_year) AS latest_recorded_year,
  (
    SELECT h2.hiring_month 
    FROM historical_recruitment_records h2 
    WHERE h2.company_id = c.id 
    GROUP BY h2.hiring_month 
    ORDER BY COUNT(*) DESC, MAX(h2.recruitment_year) DESC 
    LIMIT 1
  ) AS recurring_hiring_month,
  (
    SELECT h3.season_quarter 
    FROM historical_recruitment_records h3 
    WHERE h3.company_id = c.id 
    GROUP BY h3.season_quarter 
    ORDER BY COUNT(*) DESC 
    LIMIT 1
  ) AS recurring_quarter,
  ROUND(AVG(h.min_cgpa_required), 2) AS avg_cgpa_cutoff,
  SUM(h.students_selected) AS total_students_selected_historically,
  CASE 
    WHEN COUNT(d.id) > 0 THEN 'Confirmed'
    ELSE 'Estimated'
  END AS current_schedule_status
FROM companies c
LEFT JOIN historical_recruitment_records h ON c.id = h.company_id
LEFT JOIN recruitment_drives d ON c.id = d.company_id AND d.status IN ('Upcoming', 'Active / In Progress')
GROUP BY c.id, c.name, c.tier, c.industry, c.salary_range;

-- 2. View: Department Placement Readiness Summary
CREATE OR REPLACE VIEW v_department_placement_readiness AS
SELECT 
  d.id AS department_id,
  d.name AS department_name,
  d.code AS department_code,
  COUNT(s.id) AS total_students,
  SUM(CASE WHEN s.placement_status = 'Placed' THEN 1 ELSE 0 END) AS placed_students,
  ROUND(AVG(s.cgpa), 2) AS avg_department_cgpa,
  SUM(CASE WHEN s.arrears = 0 THEN 1 ELSE 0 END) AS zero_arrear_students,
  SUM(CASE WHEN s.cgpa >= 7.5 AND s.arrears = 0 THEN 1 ELSE 0 END) AS premier_eligible_candidates,
  ROUND((SUM(CASE WHEN s.placement_status = 'Placed' THEN 1 ELSE 0 END) / NULLIF(COUNT(s.id), 0)) * 100, 1) AS placement_percentage
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
GROUP BY d.id, d.name, d.code;
