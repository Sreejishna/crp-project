const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Department = require('../models/Department');
const Student = require('../models/Student');
const Company = require('../models/Company');
const RecruitmentDrive = require('../models/RecruitmentDrive');
const Announcement = require('../models/Announcement');
const PlacementRecord = require('../models/PlacementRecord');

const seedData = async () => {
  try {
    console.log('🌱 Starting Cyclic Recruitment Portal database seeding...');

    // Clean existing collections
    await User.deleteMany({});
    await Department.deleteMany({});
    await Student.deleteMany({});
    await Company.deleteMany({});
    await RecruitmentDrive.deleteMany({});
    await Announcement.deleteMany({});
    await PlacementRecord.deleteMany({});

    console.log('🧹 Purged existing collections.');

    // 1. Create Academic Departments
    const deptMCA = await Department.create({
      name: 'Department of Master of Computer Applications',
      code: 'MCA',
      hodName: 'Dr. Ramesh Kumar',
      hodEmail: 'hod.mca@crp.edu',
      hodPhone: '+91 98765 43210',
      description: 'Premier MCA department focusing on Full Stack, Cloud, Software Engineering and AI.',
      totalStudents: 3,
    });

    const deptCSE = await Department.create({
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
      hodName: 'Dr. Sunita Sharma',
      hodEmail: 'hod.cse@crp.edu',
      hodPhone: '+91 98765 43211',
      description: 'Undergraduate department specializing in Algorithms, Systems, and Distributed Computing.',
      totalStudents: 2,
    });

    const deptISE = await Department.create({
      name: 'Department of Information Science & Engineering',
      code: 'ISE',
      hodName: 'Dr. Anand Verma',
      hodEmail: 'hod.ise@crp.edu',
      hodPhone: '+91 98765 43212',
      description: 'Specializing in Big Data, Cloud Infrastructure, and Information Security.',
      totalStudents: 1,
    });

    const deptECE = await Department.create({
      name: 'Department of Electronics & Communication Engineering',
      code: 'ECE',
      hodName: 'Dr. Meenakshi Sundaram',
      hodEmail: 'hod.ece@crp.edu',
      hodPhone: '+91 98765 43213',
      description: 'Embedded Systems, IoT, Edge Computing, and Signal Processing.',
      totalStudents: 1,
    });

    console.log('🏛️ Academic departments created.');

    // 2. Create Admin and Department Coordinator Users
    const adminUser = await User.create({
      name: 'Prof. Rajesh Khanna (Placement Head)',
      email: 'admin@crp.edu',
      password: 'admin123',
      role: 'admin',
    });

    const mcaCoordUser = await User.create({
      name: 'Prof. K. Venkatesh (MCA Placement Officer)',
      email: 'mca.coord@crp.edu',
      password: 'dept123',
      role: 'department',
      department: deptMCA._id,
    });

    const cseCoordUser = await User.create({
      name: 'Prof. Deepa Nair (CSE Placement Coordinator)',
      email: 'cse.coord@crp.edu',
      password: 'dept123',
      role: 'department',
      department: deptCSE._id,
    });

    console.log('🛡️ Admin and Department Coordinators created.');

    // 3. Create Demonstration Students
    const studentData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.mca@crp.edu',
        password: 'student123',
        studentId: '1CR24MCA001',
        department: deptMCA._id,
        qualification: 'MCA',
        batch: 2026,
        cgpa: 8.85,
        activeBacklogs: 0,
        tenthPercentage: 88.5,
        twelfthPercentage: 86.0,
        skills: ['Java', 'Data Structures & Algorithms', 'Spring Boot', 'SQL', 'React'],
        phone: '+91 98765 11001',
        placementStatus: 'Placed',
      },
      {
        name: 'Priya Sundaram',
        email: 'priya.cse@crp.edu',
        password: 'student123',
        studentId: '1CR22CS089',
        department: deptCSE._id,
        qualification: 'B.Tech CSE',
        batch: 2026,
        cgpa: 9.15,
        activeBacklogs: 0,
        tenthPercentage: 94.0,
        twelfthPercentage: 91.5,
        skills: ['C++', 'Python', 'Distributed Systems', 'Docker', 'AWS'],
        phone: '+91 98765 11002',
        placementStatus: 'Placed',
      },
      {
        name: 'Amit Patel',
        email: 'amit.mca@crp.edu',
        password: 'student123',
        studentId: '1CR24MCA015',
        department: deptMCA._id,
        qualification: 'MCA',
        batch: 2026,
        cgpa: 7.20,
        activeBacklogs: 1,
        tenthPercentage: 74.0,
        twelfthPercentage: 72.0,
        skills: ['Python', 'Django', 'PostgreSQL', 'HTML/CSS'],
        phone: '+91 98765 11003',
        placementStatus: 'Not Placed',
      },
      {
        name: 'Sneha Kulkarni',
        email: 'sneha.ise@crp.edu',
        password: 'student123',
        studentId: '1CR22IS045',
        department: deptISE._id,
        qualification: 'B.Tech ISE',
        batch: 2026,
        cgpa: 8.50,
        activeBacklogs: 0,
        tenthPercentage: 89.0,
        twelfthPercentage: 87.5,
        skills: ['Java', 'Kafka', 'Kubernetes', 'MySQL'],
        phone: '+91 98765 11004',
        placementStatus: 'Placed',
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram.ece@crp.edu',
        password: 'student123',
        studentId: '1CR22EC102',
        department: deptECE._id,
        qualification: 'B.Tech ECE',
        batch: 2026,
        cgpa: 6.80,
        activeBacklogs: 0,
        tenthPercentage: 71.0,
        twelfthPercentage: 69.5,
        skills: ['C', 'Embedded C', 'Python', 'MATLAB'],
        phone: '+91 98765 11005',
        placementStatus: 'Not Placed',
      },
    ];

    const createdStudents = [];
    for (const s of studentData) {
      const u = await User.create({
        name: s.name,
        email: s.email,
        password: s.password,
        role: 'student',
        department: s.department,
      });

      const st = await Student.create({
        user: u._id,
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        department: s.department,
        qualification: s.qualification,
        batch: s.batch,
        cgpa: s.cgpa,
        activeBacklogs: s.activeBacklogs,
        tenthPercentage: s.tenthPercentage,
        twelfthPercentage: s.twelfthPercentage,
        skills: s.skills,
        phone: s.phone,
        placementStatus: s.placementStatus,
      });

      u.studentRef = st._id;
      await u.save();
      createdStudents.push(st);
    }

    console.log('👨‍🎓 Demonstration students created.');

    // 4. Create Seasonal Companies
    const companiesData = [
      {
        name: 'Amazon Web Services (AWS)',
        industry: 'Cloud Computing & Distributed Systems',
        tier: 'Super Dream (15+ LPA)',
        description: 'AWS is the world leader in cloud infrastructure. This hiring season focuses on Spring Internships with direct FTE Pre-Placement Offers (PPOs).',
        website: 'https://aws.amazon.com',
        headquarters: 'Bengaluru / Hyderabad',
        contactEmail: 'campus-aws@amazon.com',
        contactPerson: 'Vikram Joshi (University TA Lead)',
      },
      {
        name: 'Razorpay',
        industry: 'FinTech & Payment Infrastructure',
        tier: 'Super Dream (15+ LPA)',
        description: 'India’s leading payments and banking platform for startups and enterprises. Hiring high-scale backend software engineers.',
        website: 'https://razorpay.com',
        headquarters: 'Bengaluru (Koramangala)',
        contactEmail: 'university@razorpay.com',
        contactPerson: 'Megha Singhal (Campus Recruiter)',
      },
      {
        name: 'Flipkart',
        industry: 'E-Commerce & Supply Chain Tech',
        tier: 'Super Dream (15+ LPA)',
        description: 'India’s homegrown e-commerce marketplace. Hiring for Supply Chain, Search, Catalog, and Payments engineering.',
        website: 'https://flipkartcareers.com',
        headquarters: 'Bengaluru',
        contactEmail: 'campus-connect@flipkart.com',
        contactPerson: 'Siddharth Roy',
      },
      {
        name: 'Deloitte USI',
        industry: 'Technology & Management Consulting',
        tier: 'Tier-1 Core (5-8 LPA)',
        description: 'Global audit, consulting, and digital engineering enterprise. Q2 hiring focuses on Associate Solution Advisors and Cloud Analysts.',
        website: 'https://www2.deloitte.com',
        headquarters: 'Hyderabad / Bengaluru',
        contactEmail: 'campus.deloitte@deloitte.com',
        contactPerson: 'Rohit Kulkarni',
      },
      {
        name: 'Microsoft India',
        industry: 'Enterprise Software & Cloud Platforms',
        tier: 'Super Dream (15+ LPA)',
        description: 'Microsoft powers global enterprise digital transformation with Azure, Office 365, and AI platforms. Autumn Day-1 flagship drive.',
        website: 'https://careers.microsoft.com',
        headquarters: 'Bengaluru / Hyderabad',
        contactEmail: 'university-india@microsoft.com',
        contactPerson: 'Anita Rao (Director, University Relations)',
      },
      {
        name: 'TCS Digital & Prime',
        industry: 'IT Services & Digital Transformation',
        tier: 'Dream (8-15 LPA)',
        description: 'Tata Consultancy Services premium national recruitment track offering Digital (7.5 LPA) and Prime (9-11 LPA) software roles.',
        website: 'https://www.tcs.com/careers',
        headquarters: 'Pan India (Bengaluru, Pune, Hyderabad)',
        contactEmail: 'tcs.campus@tcs.com',
        contactPerson: 'Sanjay Deshmukh',
      },
      {
        name: 'Goldman Sachs',
        industry: 'Investment Banking & Quantitative Engineering',
        tier: 'Super Dream (15+ LPA)',
        description: 'Leading global investment banking firm recruiting Engineering Analysts for high-frequency trading platforms and financial models.',
        website: 'https://goldmansachs.com/careers',
        headquarters: 'Bengaluru (Helios Tech Park)',
        contactEmail: 'gs-campus-india@gs.com',
        contactPerson: 'Pooja Agarwal',
      },
      {
        name: 'SAP Labs India',
        industry: 'Enterprise Software & Cloud ERP',
        tier: 'Dream (8-15 LPA)',
        description: 'Market leader in enterprise software and cloud applications. Hiring Associate Developers for SAP BTP and HANA platforms.',
        website: 'https://sap.com/careers',
        headquarters: 'Bengaluru (Whitefield)',
        contactEmail: 'campus.sap@sap.com',
        contactPerson: 'Karthik Narayanan',
      },
    ];

    const createdCompanies = await Company.insertMany(companiesData);
    console.log('🏢 Seasonal companies created.');

    // 5. Create Seasonal Recruitment Drives
    const allDeptIds = [deptMCA._id, deptCSE._id, deptISE._id, deptECE._id];

    const drivesData = [
      // Q1 Drives
      {
        company: createdCompanies[0]._id, // AWS
        jobRole: 'Software Development Engineer (SDE-1)',
        hiringSeason: 'January–March',
        seasonQuarter: 'Q1',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-02-28'),
        eligibleDepartments: allDeptIds,
        minCgpa: 7.5,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech CSE, ISE, ECE',
        requiredSkills: ['Java', 'Data Structures & Algorithms', 'Distributed Systems', 'Cloud Basics'],
        vacancies: 25,
        salary: '18 - 28 LPA',
        stipendMonthly: 80000,
        workLocation: 'Bengaluru / Hyderabad',
        workMode: 'Hybrid',
        status: 'Active',
        interviewRounds: [
          { roundNumber: 1, name: 'Online Assessment (OA)', mode: 'Online', description: '2 LeetCode Medium coding questions + 20 Leadership Principles questions' },
          { roundNumber: 2, name: 'Technical Interview 1', mode: 'Online', description: 'Data structures, live code execution, space-time complexity analysis' },
          { roundNumber: 3, name: 'Technical Interview 2 & LLD', mode: 'Online', description: 'Low-Level Design, Schema architecture, SOLID design principles' },
          { roundNumber: 4, name: 'Bar Raiser & Culture Round', mode: 'Online', description: 'Evaluation on Amazon 16 Leadership Principles using STAR methodology' },
        ],
      },
      {
        company: createdCompanies[1]._id, // Razorpay
        jobRole: 'Backend Engineer - Payments Platform',
        hiringSeason: 'January–March',
        seasonQuarter: 'Q1',
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-03-15'),
        eligibleDepartments: [deptMCA._id, deptCSE._id, deptISE._id],
        minCgpa: 7.0,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech CSE, ISE',
        requiredSkills: ['Node.js', 'Go', 'MySQL', 'Redis', 'Kafka', 'REST APIs'],
        vacancies: 15,
        salary: '16 - 24 LPA',
        stipendMonthly: 60000,
        workLocation: 'Bengaluru (Koramangala)',
        workMode: 'On-site',
        status: 'Active',
        interviewRounds: [
          { roundNumber: 1, name: 'Machine Coding Round', mode: 'Online', description: 'Build an in-memory payment ledger or rate limiter in 90 mins' },
          { roundNumber: 2, name: 'Problem Solving & DSA', mode: 'Online', description: 'Concurrency, Mutex, and distributed cache questions' },
          { roundNumber: 3, name: 'Engineering Values & Fit', mode: 'Online', description: 'Product ownership, code maintainability, agility' },
        ],
      },

      // Q2 Drives
      {
        company: createdCompanies[2]._id, // Flipkart
        jobRole: 'Associate Software Engineer',
        hiringSeason: 'April–June',
        seasonQuarter: 'Q2',
        startDate: new Date('2026-04-05'),
        endDate: new Date('2026-05-30'),
        eligibleDepartments: allDeptIds,
        minCgpa: 7.5,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech CSE, ISE, ECE',
        requiredSkills: ['Java', 'Spring Boot', 'Data Structures', 'Database Indexing'],
        vacancies: 30,
        salary: '18 - 26 LPA',
        stipendMonthly: 75000,
        workLocation: 'Bengaluru',
        workMode: 'Hybrid',
        status: 'Upcoming',
        interviewRounds: [
          { roundNumber: 1, name: 'Flipkart GRiD Online Test', mode: 'Online', description: '3 algorithmic problems on Dynamic Programming and Graphs' },
          { roundNumber: 2, name: 'Machine Coding Round', mode: 'Online', description: 'Console-based Ride Sharing or Inventory model design' },
          { roundNumber: 3, name: 'Hiring Manager Round', mode: 'Online', description: 'System trade-offs, architecture, behavioral fit' },
        ],
      },
      {
        company: createdCompanies[3]._id, // Deloitte
        jobRole: 'Associate Solution Advisor (Cloud & AI)',
        hiringSeason: 'April–June',
        seasonQuarter: 'Q2',
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-06-10'),
        eligibleDepartments: allDeptIds,
        minCgpa: 6.5,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech All Branches',
        requiredSkills: ['SQL', 'Python', 'Cloud Fundamentals', 'Analytical Reasoning'],
        vacancies: 60,
        salary: '7.6 - 9.2 LPA',
        stipendMonthly: 30000,
        workLocation: 'Hyderabad / Bengaluru',
        workMode: 'Hybrid',
        status: 'Upcoming',
        interviewRounds: [
          { roundNumber: 1, name: 'Versant & Aptitude Test', mode: 'Online', description: 'Cognitive reasoning and Versant English communication assessment' },
          { roundNumber: 2, name: 'Technical Interview', mode: 'Online', description: 'SQL Joins, Subqueries, Normalization, SDLC' },
          { roundNumber: 3, name: 'Partner Round', mode: 'Online', description: 'Client scenario handling and consulting mindset' },
        ],
      },

      // Q3 Drives
      {
        company: createdCompanies[4]._id, // Microsoft
        jobRole: 'Software Engineer - Core Engineering',
        hiringSeason: 'July–September',
        seasonQuarter: 'Q3',
        startDate: new Date('2026-07-05'),
        endDate: new Date('2026-08-30'),
        eligibleDepartments: allDeptIds,
        minCgpa: 8.0,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech CSE, ISE, ECE',
        requiredSkills: ['C++', 'C#', 'Java', 'Advanced Data Structures', 'Operating Systems'],
        vacancies: 40,
        salary: '20 - 32 LPA',
        stipendMonthly: 85000,
        workLocation: 'Hyderabad / Bengaluru',
        workMode: 'Hybrid',
        status: 'Upcoming',
        interviewRounds: [
          { roundNumber: 1, name: 'Codility Online Test', mode: 'Online', description: '3 algorithmic problems on Arrays, Trees, Dynamic Programming' },
          { roundNumber: 2, name: 'Live Coding Interview 1', mode: 'Offline / In-Person', description: 'Binary Search Trees, Heaps, Graph traversals' },
          { roundNumber: 3, name: 'Systems & OS Architecture', mode: 'Offline / In-Person', description: 'Virtual Memory, Concurrency, Mutex vs Semaphore' },
          { roundNumber: 4, name: 'As Appropriate (Director) Round', mode: 'Offline / In-Person', description: 'Growth mindset, handling failure, open-ended problem solving' },
        ],
      },
      {
        company: createdCompanies[5]._id, // TCS
        jobRole: 'TCS Digital & Prime Software Engineer',
        hiringSeason: 'July–September',
        seasonQuarter: 'Q3',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-09-25'),
        eligibleDepartments: allDeptIds,
        minCgpa: 6.5,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech CSE, ISE, ECE',
        requiredSkills: ['Python', 'Java', 'SQL', 'Cloud Basics', 'Machine Learning Basics'],
        vacancies: 120,
        salary: '7.5 - 11.5 LPA',
        stipendMonthly: 35000,
        workLocation: 'Pan India (Bengaluru, Chennai, Pune)',
        workMode: 'On-site',
        status: 'Upcoming',
        interviewRounds: [
          { roundNumber: 1, name: 'TCS NQT Advanced Test', mode: 'Online', description: 'Advanced Cognitive and 2 Advanced Coding questions' },
          { roundNumber: 2, name: 'Technical Assessment', mode: 'Offline / In-Person', description: 'Project defense, OOP, Database queries' },
          { roundNumber: 3, name: 'HR & Managerial Interview', mode: 'Offline / In-Person', description: 'Location flexibility, teamwork, agility' },
        ],
      },

      // Q4 Drives
      {
        company: createdCompanies[6]._id, // Goldman Sachs
        jobRole: 'Analyst - Engineering Division',
        hiringSeason: 'October–December',
        seasonQuarter: 'Q4',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-11-20'),
        eligibleDepartments: [deptMCA._id, deptCSE._id, deptISE._id],
        minCgpa: 7.5,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech CSE, ISE',
        requiredSkills: ['C++', 'Java', 'Probability & Statistics', 'Low-Latency Design', 'Concurrency'],
        vacancies: 20,
        salary: '22 - 34 LPA',
        stipendMonthly: 90000,
        workLocation: 'Bengaluru (Helios Tech Park)',
        workMode: 'On-site',
        status: 'Upcoming',
        interviewRounds: [
          { roundNumber: 1, name: 'HackerRank Quant & Coding Test', mode: 'Online', description: 'Math, Probability, Advanced Quant + 2 Hard Coding questions' },
          { roundNumber: 2, name: 'Technical Round 1 (Algorithms)', mode: 'Offline / In-Person', description: 'Bit manipulation, Dynamic Programming, Probability puzzles' },
          { roundNumber: 3, name: 'Systems & Memory Architecture', mode: 'Offline / In-Person', description: 'Multi-threading, lock-free queues, memory layouts' },
          { roundNumber: 4, name: 'Culture & Ethics Interview', mode: 'Offline / In-Person', description: 'Integrity, handling extreme stress, team collaboration' },
        ],
      },
      {
        company: createdCompanies[7]._id, // SAP Labs
        jobRole: 'Associate Developer - Cloud ERP Platform',
        hiringSeason: 'October–December',
        seasonQuarter: 'Q4',
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-12-05'),
        eligibleDepartments: allDeptIds,
        minCgpa: 7.0,
        maxBacklogs: 0,
        qualification: 'MCA, B.Tech CSE, ISE, ECE',
        requiredSkills: ['Java', 'Spring Boot', 'TypeScript', 'SQL', 'REST APIs'],
        vacancies: 35,
        salary: '12 - 16.5 LPA',
        stipendMonthly: 45000,
        workLocation: 'Bengaluru (Whitefield)',
        workMode: 'Hybrid',
        status: 'Upcoming',
        interviewRounds: [
          { roundNumber: 1, name: 'Online Coding Test', mode: 'Online', description: 'DSA, Aptitude, Core Java/C++ questions' },
          { roundNumber: 2, name: 'Live Coding Interview', mode: 'Online', description: 'Data structures, OOP, Database queries' },
          { roundNumber: 3, name: 'Managerial & HR', mode: 'Online', description: 'Values, team fitment, communication' },
        ],
      },
    ];

    const createdDrives = await RecruitmentDrive.insertMany(drivesData);
    console.log('📅 Seasonal recruitment drives scheduled.');

    // 6. Create Announcements
    await Announcement.insertMany([
      {
        title: 'AWS Campus Recruitment Pre-Placement Talk OA Scheduled',
        description: 'Online Assessment for Software Development Engineer (SDE-1) will take place this Saturday at 10:00 AM on the official portal. Attendance in formal attire is mandatory.',
        priority: 'Urgent',
        department: null, // All departments
        publishedBy: adminUser._id,
      },
      {
        title: 'MCA Special Mock Technical Interview Sessions',
        description: 'MCA Placement cell will conduct 1-on-1 mock technical interviews covering Data Structures and System Design for 2026 batch candidates starting tomorrow in Lab 3.',
        priority: 'High',
        department: deptMCA._id,
        publishedBy: adminUser._id,
      },
      {
        title: 'Q1 Seasonal Hiring Drives Guidelines Published',
        description: 'Students are advised to review the Q1 seasonal hiring cutoffs and verify their CGPA and backlog status in their dashboard profile prior to campus verification.',
        priority: 'Normal',
        department: null,
        publishedBy: adminUser._id,
      },
    ]);

    console.log('📢 Announcements published.');

    // 7. Create Sample Placement Records
    await PlacementRecord.insertMany([
      {
        student: createdStudents[0]._id, // Rahul Sharma
        company: createdCompanies[0]._id, // AWS
        recruitmentDrive: createdDrives[0]._id,
        jobRole: 'Software Development Engineer (SDE-1)',
        package: '24.0 LPA',
        placementStatus: 'Placed',
      },
      {
        student: createdStudents[1]._id, // Priya Sundaram
        company: createdCompanies[4]._id, // Microsoft
        recruitmentDrive: createdDrives[4]._id,
        jobRole: 'Software Engineer',
        package: '28.5 LPA',
        placementStatus: 'Placed',
      },
      {
        student: createdStudents[3]._id, // Sneha Kulkarni
        company: createdCompanies[1]._id, // Razorpay
        recruitmentDrive: createdDrives[1]._id,
        jobRole: 'Backend Engineer',
        package: '18.0 LPA',
        placementStatus: 'Placed',
      },
    ]);

    console.log('🏆 Sample placement records seeded.');
    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    throw err;
  }
};

if (require.main === module) {
  const { connectDB, closeDB } = require('../config/db');
  connectDB()
    .then(() => seedData())
    .then(() => {
      console.log('🎉 Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedData;
