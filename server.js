const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const seedData = require('./scripts/seed.js');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const studentRoutes = require('./routes/studentRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Body Parser Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Morgan HTTP Logger in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Static Assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// Configure EJS Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'crp_cyclic_recruitment_portal_session_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
    },
  })
);

// Connect Flash for Alert Notifications
app.use(flash());

// Global Variables across all EJS Views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

// Mount Routes
app.use('/', authRoutes);
app.use('/', publicRoutes);
app.use('/student', studentRoutes);
app.use('/department', departmentRoutes);
app.use('/admin', adminRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'Cyclic Recruitment Portal (CRP)',
    version: '2.0.0',
    mode: 'EJS Multi-Module MVC',
  });
});

// 404 Page Not Found Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found | CRP',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).render('500', {
    title: '500 - Server Error | CRP',
    error: err.message || 'Internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if initial data seeding is needed
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Running initial data seeder...');
      await seedData();
    }

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Cyclic Recruitment Portal is Running!`);
      console.log(`🌐 Application URL: http://localhost:${PORT}`);
      console.log(`🔑 Role Logins:`);
      console.log(`   - Placement Admin: admin@crp.edu / admin123`);
      console.log(`   - MCA Coordinator: mca.coord@crp.edu / dept123`);
      console.log(`   - Student (MCA):   rahul.mca@crp.edu / student123`);
      console.log(`====================================================`);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
