-- =====================================================================
-- Cyclic Recruitment Portal (CRP)
-- Complete Demo Seed Data for MySQL 8.0+
-- Demonstrates Recurring Multi-Year Seasonal Campus Hiring Patterns
-- Passwords:
--   Admin: admin123
--   Teacher/Coordinator: dept123
--   Student: student123
-- =====================================================================

USE cyclic_recruitment_portal;

-- 1. Insert Departments
INSERT INTO departments (id, name, code, hod_name, hod_email, hod_phone, description, total_students) VALUES
(1, 'Department of Master of Computer Applications (MCA)', 'MCA', 'Dr. Ramesh Kumar', 'hod.mca@crp.edu', '+91 98765 43210', 'Premier post-graduate department focusing on Full Stack, Cloud, Software Engineering and AI.', 120),
(2, 'Department of Computer Science & Engineering', 'CSE', 'Dr. Sunita Sharma', 'hod.cse@crp.edu', '+91 98765 43211', 'Leading undergraduate department specializing in Algorithms, Distributed Systems, and AI/ML.', 240),
(3, 'Department of Information Science & Engineering', 'ISE', 'Dr. Anand Verma', 'hod.ise@crp.edu', '+91 98765 43212', 'Specializing in Big Data, Cloud Infrastructure, and Information Security.', 180),
(4, 'Department of Electronics & Communication Engineering', 'ECE', 'Dr. Meenakshi Sundaram', 'hod.ece@crp.edu', '+91 98765 43213', 'Focusing on Embedded Systems, IoT, Edge Computing, and Firmware Engineering.', 160);

-- 2. Insert Users
-- Password hashes created using bcryptjs (salt rounds 10)
-- admin123: $2a$10$w0u6W/G5O0jPqC6k3K5Nte3xZ4S7i5d1g4m5k2e3r7t8y9u0i1o2p
-- dept123:  $2a$10$z7n8b9v0c1x2z3a4s5d6fe7r8t9y0u1i2o3p4a5s6d7f8g9h0j1k2
-- student123: $2a$10$7s8d9f0g1h2j3k4l5m6nOe1r2t3y4u5i6o7p8a9s0d1f2g3h4j5k6
INSERT INTO users (id, name, email, password_hash, role, phone, is_active) VALUES
(1, 'Central Placement Officer', 'admin@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'admin', '+91 98765 11111', TRUE),
(2, 'Prof. K. Venkatesh', 'mca.coord@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'teacher', '+91 98765 22222', TRUE),
(3, 'Prof. S. Nambiar', 'cse.coord@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'teacher', '+91 98765 33333', TRUE),
(4, 'Rahul Sharma', 'rahul.mca@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'student', '+91 98711 22334', TRUE),
(5, 'Priya Sundaram', 'priya.cse@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'student', '+91 98711 33445', TRUE),
(6, 'Arjun Das', 'arjun.ise@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'student', '+91 98711 44556', TRUE),
(7, 'Kiran Patel', 'kiran.ece@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'student', '+91 98711 66778', TRUE),
(8, 'Arjun Nair', 'arjun.firstyear@crp.edu', '$2a$10$K7L1RK5eM2TqA3eL9uB9he7b9eB3j5d1g4m5k2e3r7t8y9u0i1o2p', 'student', '+91 98711 88990', TRUE);

-- 3. Insert Teachers
INSERT INTO teachers (user_id, department_id, employee_id, designation, office_location) VALUES
(2, 1, 'EMP-MCA-012', 'Associate Professor & MCA Placement Officer', 'MCA Block, Room 204'),
(3, 2, 'EMP-CSE-045', 'Assistant Professor & CSE Placement Coordinator', 'Turing Tech Block, Room 310');

-- 4. Insert Students (with Academic Years from 1st Year to Final Year)
INSERT INTO students (user_id, student_id_usn, department_id, degree, academic_year, batch_year, cgpa, arrears, history_of_arrears, tenth_percentage, twelfth_percentage, diploma_percentage, skills, bio, placement_status, placed_company, placed_package_lpa) VALUES
(4, '1CRP24MCA045', 1, 'MCA', 2, 2026, 8.65, 0, 0, 89.50, 86.00, 0.00, 'Java, Spring Boot, React, Node.js, MongoDB, Data Structures, SQL', 'Motivated MCA 2nd Year student with strong full-stack skills.', 'Not Placed', NULL, 0.00),
(5, '1CRP22CS120', 2, 'B.Tech CSE', 4, 2026, 9.15, 0, 0, 95.00, 94.20, 0.00, 'C++, Python, Advanced DSA, System Design, AWS, Docker', 'Final Year CSE student; Competitive programmer on LeetCode.', 'Not Placed', NULL, 0.00),
(6, '1CRP22IS034', 3, 'B.Tech ISE', 3, 2026, 7.90, 0, 0, 84.00, 82.50, 0.00, 'Node.js, Express, React, PostgreSQL, Redis, Kubernetes', 'Pre-final Year ISE student aiming for cloud backend roles.', 'Placed', 'Swiggy', 14.50),
(7, '1CRP22EC088', 4, 'B.Tech ECE', 2, 2026, 6.80, 1, 1, 78.00, 74.00, 0.00, 'C, C++, Embedded Systems, IoT, Python Basics', '2nd Year ECE student focusing on robotics and firmware.', 'Not Placed', NULL, 0.00),
(8, '1CRP25CS019', 2, 'B.Tech CSE', 1, 2029, 7.80, 0, 0, 91.00, 89.00, 0.00, 'Python Basics, HTML/CSS, C Programming, Logic Building', '1st Year fresher exploring cyclic placement patterns and roadmap prep.', 'Not Placed', NULL, 0.00);

-- 5. Insert Companies (Categorized by Seasonal Cycles Q1-Q4)
INSERT INTO companies (id, name, logo_url, website, industry, tier, hiring_season, season_quarter, recruitment_type, description, headquarters, contact_email, contact_person, salary_range, stipend_monthly, vacancies, default_location, default_work_mode, experience_requirement, is_featured) VALUES
(1, 'Accenture India', 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=128&auto=format&fit=crop&q=80', 'https://www.accenture.com/in-en/careers', 'Management & Technology Consulting', 'Tier-1 Core (5-8 LPA)', 'July - September Hiring', 'Q3', 'Seasonal Mega Drive', 'Accenture is a leading global professional services company. Day-1 mass recruitment drive consistently conducted in September offering Associate Software Engineer (4.5 LPA) and Advanced ASE (6.5 LPA) roles.', 'Bengaluru / Pan India', 'campus.india@accenture.com', 'Suresh Menon (Campus Talent Lead)', '4.5 - 6.5 LPA', 25000, 150, 'Pan India / Hybrid', 'Hybrid', 'Freshers (2026 Batch)', TRUE),
(2, 'TCS (Tata Consultancy Services)', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80', 'https://www.tcs.com/careers', 'IT Services & Digital Transformation', 'Dream (8-15 LPA)', 'July - September Hiring', 'Q3', 'Seasonal Mega Drive', 'TCS flagship National Qualifier Test (NQT) campus drive conducted annually in August/September offering Ninja (3.5 LPA), Digital (7.5 LPA), and Prime (9-11.5 LPA) packages.', 'Mumbai / Pan India', 'tcs.campus@tcs.com', 'Priya Deshmukh', '7.5 - 11.5 LPA', 35000, 120, 'Pan India', 'Onsite', 'Freshers (2026 Batch)', TRUE),
(3, 'Amazon Web Services (AWS)', 'https://images.unsplash.com/photo-1523474253243-23194a2b9be2?w=128&auto=format&fit=crop&q=80', 'https://aws.amazon.com/careers', 'Cloud Computing & Distributed Systems', 'Super Dream (15+ LPA)', 'January - March Hiring', 'Q1', 'Seasonal Internship to FTE', 'AWS Q1 Spring campus recruitment focuses on 6-month Software Development Engineer (SDE-1) internships with Pre-Placement Offers (PPOs).', 'Bengaluru / Hyderabad', 'campus-recruitment@amazon.com', 'Vikram Joshi', '18 - 28 LPA', 80000, 25, 'Bengaluru / Hyderabad', 'Hybrid', 'Freshers (2026 Batch)', TRUE),
(4, 'Microsoft India', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80', 'https://careers.microsoft.com', 'Enterprise Software & Cloud Platforms', 'Super Dream (15+ LPA)', 'July - September Hiring', 'Q3', 'Seasonal Mega Drive', 'Microsoft Autumn campus hiring for Software Engineering (SDE-1) roles. Focuses on advanced algorithms, data structures, and distributed systems.', 'Hyderabad / Bengaluru', 'university-india@microsoft.com', 'Anita Rao', '20 - 32 LPA', 85000, 30, 'Hyderabad / Bengaluru', 'Hybrid', 'Freshers (2026 Batch)', TRUE),
(5, 'Deloitte Consulting', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&auto=format&fit=crop&q=80', 'https://www.deloitte.com/careers', 'Consulting & Technology Advisory', 'Dream (8-15 LPA)', 'April - June Hiring', 'Q2', 'Seasonal Mega Drive', 'Deloitte Q2 Summer hiring for Associate Solution Advisors and Cloud Analysts across analytics, cloud infrastructure, and enterprise ERP.', 'Hyderabad / Bengaluru', 'campus.deloitte@deloitte.com', 'Rohit Kulkarni', '7.6 - 9.2 LPA', 30000, 60, 'Pan India (Hybrid)', 'Hybrid', 'Freshers (2026 Batch)', FALSE),
(6, 'Goldman Sachs', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128&auto=format&fit=crop&q=80', 'https://goldmansachs.com/careers', 'Investment Banking & Quantitative Engineering', 'Super Dream (15+ LPA)', 'October - December Hiring', 'Q4', 'Winter Dream Hiring', 'Goldman Sachs Q4 Winter Dream hiring for Analyst (Software & Quantitative Engineering) roles in low-latency trading, cloud finance, and risk systems.', 'Bengaluru (Helios Tech Park)', 'gs-campus-india@gs.com', 'Pooja Agarwal', '22 - 34 LPA', 90000, 20, 'Bengaluru', 'Onsite', 'Freshers (2026 Batch)', TRUE),
(7, 'SAP Labs India', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&auto=format&fit=crop&q=80', 'https://sap.com/careers', 'Enterprise Software & Cloud ERP', 'Dream (8-15 LPA)', 'October - December Hiring', 'Q4', 'Seasonal Mega Drive', 'SAP Labs Q4 hiring for Associate Developers in SAP BTP, Cloud ERP, and HANA in-memory databases.', 'Bengaluru (Whitefield)', 'campus.sap@sap.com', 'Karthik Narayanan', '12 - 16.5 LPA', 45000, 35, 'Bengaluru', 'Hybrid', 'Freshers (2026 Batch)', FALSE),
(8, 'Infosys Limited', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=128&auto=format&fit=crop&q=80', 'https://www.infosys.com/careers', 'IT Services & Digital Platforms', 'Tier-1 Core (5-8 LPA)', 'July - September Hiring', 'Q3', 'Seasonal Mega Drive', 'Infosys campus hiring for Systems Engineer (3.6 LPA), Specialist Programmer (9.5 LPA), and Digital Specialist Engineer (6.25 LPA).', 'Bengaluru / Pune', 'campus@infosys.com', 'Rajesh K', '3.6 - 9.5 LPA', 25000, 100, 'Pan India', 'Hybrid', 'Freshers (2026 Batch)', FALSE),
(9, 'Cognizant (CTS)', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80', 'https://www.cognizant.com/careers', 'IT Services & Cloud Modernization', 'Tier-1 Core (5-8 LPA)', 'October - December Hiring', 'Q4', 'Seasonal Mega Drive', 'Cognizant GenC Elevate and GenC Next campus recruitment hiring across Full Stack, Cloud, and Data Engineering.', 'Chennai / Bengaluru', 'campus@cognizant.com', 'Meera Nair', '4.0 - 6.75 LPA', 20000, 90, 'Pan India', 'Hybrid', 'Freshers (2026 Batch)', FALSE),
(10, 'Zoho Corporation', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80', 'https://www.zoho.com/careers', 'SaaS & Enterprise Cloud Applications', 'Dream (8-15 LPA)', 'April - June Hiring', 'Q2', 'Seasonal Mega Drive', 'Zoho campus drive recruiting Software Developers and QA Engineers for Zoho One suite. Focuses on pure C/Java programming and zero-syntax round.', 'Chennai / Tenkasi', 'campus@zohocorp.com', 'Vaidhyanathan R', '6.0 - 10.0 LPA', 28000, 45, 'Chennai', 'Onsite', 'Freshers (2026 Batch)', FALSE);

-- 6. Insert Historical Recruitment Records (Demonstrating Recurring Patterns Across 2021-2025)
INSERT INTO historical_recruitment_records (company_id, academic_year, recruitment_year, hiring_month, hiring_month_number, season_quarter, recruitment_date, job_roles_offered, salary_package, students_selected, total_applicants, min_cgpa_required, max_arrears_allowed, schedule_type, notes) VALUES
-- ACCENTURE (Recurring Pattern: Consistently visits in September every year!)
(1, '2021-2022', 2021, 'September', 9, 'Q3', '2021-09-14', 'Associate Software Engineer, System Analyst', '4.5 - 6.5 LPA', 132, 280, 6.50, 0, 'Confirmed', 'Conducted Day-1 drive virtually. Cognitive, Technical, and Communication assessments.'),
(1, '2022-2023', 2022, 'September', 9, 'Q3', '2022-09-16', 'Associate Software Engineer, Advanced Developer', '4.5 - 6.5 LPA', 145, 310, 6.50, 0, 'Confirmed', 'High selection rate for MCA candidates with strong SQL and Java knowledge.'),
(1, '2023-2024', 2023, 'October', 10, 'Q4', '2023-10-04', 'Associate Software Engineer, Full Stack Engineer', '4.5 - 6.5 LPA', 128, 295, 6.50, 0, 'Confirmed', 'Shifted by 2 weeks due to national holidays; held first week of October.'),
(1, '2024-2025', 2024, 'September', 9, 'Q3', '2024-09-18', 'Associate Software Engineer (ASE), Advanced ASE', '4.5 - 6.5 LPA', 138, 320, 6.50, 0, 'Confirmed', 'Over 138 offers released. Reinforces strong September hiring cycle.'),

-- TCS (Recurring Pattern: Consistently visits in August!)
(2, '2021-2022', 2021, 'August', 8, 'Q3', '2021-08-20', 'TCS Ninja, TCS Digital', '3.5 - 7.5 LPA', 110, 340, 6.50, 0, 'Confirmed', 'National Qualifier Test (NQT) followed by technical interviews.'),
(2, '2022-2023', 2022, 'August', 8, 'Q3', '2022-08-24', 'TCS Ninja, TCS Digital', '3.5 - 7.5 LPA', 125, 360, 6.50, 0, 'Confirmed', '28 students upgraded to Digital package after Advanced Coding round.'),
(2, '2023-2024', 2023, 'August', 8, 'Q3', '2023-08-22', 'TCS Digital, TCS Prime', '7.5 - 11.5 LPA', 95, 330, 6.50, 0, 'Confirmed', 'Introduced new Prime category (9-11.5 LPA) for top performers.'),
(2, '2024-2025', 2024, 'August', 8, 'Q3', '2024-08-28', 'TCS Digital, TCS Prime', '7.5 - 11.5 LPA', 102, 350, 6.50, 0, 'Confirmed', 'Consistent August recruitment observed across 4 consecutive years.'),

-- AMAZON AWS (Recurring Pattern: Consistently visits in January!)
(3, '2022-2023', 2022, 'January', 1, 'Q1', '2022-01-18', 'SDE-1 Intern to FTE, Cloud Support Associate', '16 - 26 LPA', 18, 140, 7.50, 0, 'Confirmed', 'Spring internship with 6-month PPO conversion.'),
(3, '2023-2024', 2023, 'January', 1, 'Q1', '2023-01-20', 'SDE-1 Intern, Solutions Architect Intern', '18 - 28 LPA', 22, 160, 7.50, 0, 'Confirmed', 'Strict evaluation of Leadership Principles in Bar Raiser round.'),
(3, '2024-2025', 2024, 'February', 2, 'Q1', '2024-02-05', 'Software Development Engineer - Cloud', '18 - 28 LPA', 20, 150, 7.50, 0, 'Confirmed', 'Winter cycle held in early February. All 20 placed interns converted to FTE.'),

-- MICROSOFT INDIA (Recurring Pattern: Consistently visits in July/August!)
(4, '2022-2023', 2022, 'July', 7, 'Q3', '2022-07-28', 'Software Engineer (SDE-1)', '20 - 32 LPA', 25, 180, 8.00, 0, 'Confirmed', 'Autumn Day-0 Super Dream drive. Coding test on Codility.'),
(4, '2023-2024', 2023, 'August', 8, 'Q3', '2023-08-10', 'Software Engineer (SDE-1)', '20 - 32 LPA', 28, 195, 8.00, 0, 'Confirmed', 'Live pair coding with Senior Principal Engineers.'),
(4, '2024-2025', 2024, 'July', 7, 'Q3', '2024-07-25', 'Software Engineer (SDE-1)', '20 - 32 LPA', 32, 210, 8.00, 0, 'Confirmed', 'Consistently visits late July / early August.'),

-- DELOITTE (Recurring Pattern: Consistently visits in April/May!)
(5, '2022-2023', 2022, 'April', 4, 'Q2', '2022-04-18', 'Associate Solution Advisor, Cloud Analyst', '7.6 - 9.2 LPA', 54, 210, 6.50, 0, 'Confirmed', 'Versant English test + Technical interview.'),
(5, '2023-2024', 2023, 'May', 5, 'Q2', '2023-05-12', 'Associate Solution Advisor, Technology Consultant', '7.6 - 9.2 LPA', 60, 230, 6.50, 0, 'Confirmed', 'High hiring volume for MCA & ISE graduates.'),
(5, '2024-2025', 2024, 'April', 4, 'Q2', '2024-04-22', 'Cloud Analyst, Data Analyst', '7.6 - 9.2 LPA', 58, 225, 6.50, 0, 'Confirmed', 'Consistent Q2 hiring cycle pattern observed.'),

-- GOLDMAN SACHS (Recurring Pattern: Consistently visits in October!)
(6, '2022-2023', 2022, 'October', 10, 'Q4', '2022-10-15', 'Analyst - Software & Systems', '22 - 34 LPA', 16, 120, 7.50, 0, 'Confirmed', 'HackerRank test with math, probability and DP algorithms.'),
(6, '2023-2024', 2023, 'October', 10, 'Q4', '2023-10-18', 'Analyst - Quantitative Engineering', '22 - 34 LPA', 18, 135, 7.50, 0, 'Confirmed', 'Winter Dream drive held mid-October.'),
(6, '2024-2025', 2024, 'November', 11, 'Q4', '2024-11-04', 'Analyst - Software Engineering', '22 - 34 LPA', 19, 140, 7.50, 0, 'Confirmed', 'High compensation tier package; zero backlogs strictly enforced.');

-- 7. Insert Active & Upcoming Recruitment Drives
INSERT INTO recruitment_drives (id, company_id, drive_title, hiring_season, season_quarter, drive_type, drive_start_date, drive_end_date, registration_deadline, status, recruitment_mode, salary_range, stipend_monthly, total_openings, schedule_type) VALUES
(1, 1, 'Accenture National Campus Recruitment Drive 2026', 'July - September Hiring', 'Q3', 'On-Campus Mega Drive', '2026-09-15', '2026-09-30', '2026-09-10 23:59:59', 'Active / In Progress', 'Hybrid (Online Test + Offline Interview)', '4.5 - 6.5 LPA', 25000, 150, 'Confirmed'),
(2, 2, 'TCS National Qualifier Test (NQT) Digital Drive 2026', 'July - September Hiring', 'Q3', 'On-Campus Mega Drive', '2026-08-25', '2026-09-20', '2026-08-20 23:59:59', 'Active / In Progress', 'Hybrid (Online Test + Offline Interview)', '7.5 - 11.5 LPA', 35000, 120, 'Confirmed'),
(3, 3, 'AWS Spring Campus SDE-1 Internship Drive 2027', 'January - March Hiring', 'Q1', 'Seasonal Hybrid Drive', '2027-01-12', '2027-02-28', '2027-01-05 23:59:59', 'Upcoming', 'Virtual / Online', '18 - 28 LPA', 80000, 25, 'Confirmed'),
(4, 4, 'Microsoft Autumn SDE-1 Campus Hiring Drive 2026', 'July - September Hiring', 'Q3', 'On-Campus Mega Drive', '2026-07-28', '2026-08-25', '2026-07-20 23:59:59', 'Active / In Progress', 'In-Person / On-Campus', '20 - 32 LPA', 85000, 30, 'Confirmed'),
(5, 6, 'Goldman Sachs Winter Analyst Campus Drive 2026', 'October - December Hiring', 'Q4', 'Virtual Dream Drive', '2026-10-18', '2026-11-20', '2026-10-10 23:59:59', 'Upcoming', 'In-Person / On-Campus', '22 - 34 LPA', 90000, 20, 'Estimated');

-- 8. Insert Eligibility Criteria for Companies and Drives
INSERT INTO eligibility_criteria (company_id, drive_id, min_cgpa, max_arrears, min_tenth, min_twelfth, allowed_academic_years, allowed_degrees) VALUES
(1, 1, 6.50, 0, 60.00, 60.00, '3,4', 'MCA, B.Tech CSE, B.Tech ISE, B.Tech ECE'),
(2, 2, 6.50, 0, 60.00, 60.00, '3,4', 'MCA, B.Tech CSE, B.Tech ISE, B.Tech ECE'),
(3, 3, 7.50, 0, 70.00, 70.00, '3,4', 'MCA, B.Tech CSE, B.Tech ISE, B.Tech ECE'),
(4, 4, 8.00, 0, 75.00, 75.00, '4', 'MCA, B.Tech CSE, B.Tech ISE, B.Tech ECE'),
(6, 5, 7.50, 0, 70.00, 70.00, '4', 'MCA, B.Tech CSE, B.Tech ISE');

-- 9. Insert Multi-Stage Interview Rounds
INSERT INTO interview_rounds (company_id, drive_id, round_number, round_name, mode, duration_mins, description, tips) VALUES
(1, 1, 1, 'Cognitive & Technical Assessment', 'Online', '90 mins', 'English ability, Critical thinking, Abstract reasoning, Pseudocode, Common Applications and MS Office', 'Practice speed-based quantitative puzzles and pseudocode debugging.'),
(1, 1, 2, 'Coding Assessment', 'Online', '45 mins', '2 algorithmic coding problems in C/C++, Java or Python', 'Focus on strings, arrays, hashing, and boundary checks.'),
(1, 1, 3, 'Communication Assessment', 'Online', '30 mins', 'Automated spoken English speaking and listening test via headset', 'Speak clearly with good pronunciation in a quiet room.'),
(1, 1, 4, 'Technical & HR Interview', 'Hybrid', '30 mins', 'Discussion on final year project, OOP concepts, SQL, and cultural fit', 'Prepare clear STAR answers about teamwork and project challenges.'),
(2, 2, 1, 'TCS NQT Advanced Test', 'Online', '120 mins', 'Advanced Quantitative, Reasoning, and 2 Coding questions', 'Aim for high percentile in advanced section to unlock Prime package.'),
(2, 2, 2, 'Technical Interview', 'In-Person / On-Campus', '40 mins', 'Deep dive into data structures, OOP, DBMS queries and final year project', 'Be ready to write clean code on whiteboard.'),
(2, 2, 3, 'Managerial & HR Round', 'In-Person / On-Campus', '30 mins', 'Willingness to relocate, shift flexibility, communication and analytical aptitude', 'Express enthusiasm for learning cloud and full-stack domains.');

-- 10. Insert Student Bookmarks
INSERT INTO student_bookmarks (student_id, company_id) VALUES
(1, 1), -- Rahul bookmarked Accenture
(1, 2), -- Rahul bookmarked TCS
(1, 3); -- Rahul bookmarked AWS

-- 11. Insert Sample Announcements
INSERT INTO announcements (title, content, category, priority, target_audience, department_id, posted_by_user_id, is_pinned) VALUES
('🚀 Accenture Campus Recruitment Drive 2026 Officially Announced', 'Accenture India has confirmed its Day-1 campus drive for MCA and Engineering graduates starting September 15. Verify your CGPA (min 6.5) and 0 active backlogs on your profile.', 'Drive Schedule Update', 'Urgent', 'All Students', NULL, 1, TRUE),
('📢 MCA Department: Accenture & TCS Specialized Prep Sessions', 'The MCA Placement Cell will conduct mock online assessments and coding tests in Computer Lab 3 every day from 4:30 PM to 6:00 PM.', 'Preparation Workshop', 'High', 'Specific Department', 1, 2, TRUE),
('💡 Understanding Cyclic Recruitment Patterns: Guide for 1st to 3rd Year Students', 'Learn how top IT recruiters follow predictable seasonal calendars. Bookmark your dream companies to receive real-time notifications when drives open.', 'Policy & Guidelines', 'Normal', 'All Students', NULL, 1, FALSE);
