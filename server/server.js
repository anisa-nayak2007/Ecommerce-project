// Main Express.js Server Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const { initializeAndSeed } = require('./database/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Stack
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Static Local Uploads Serving
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '7d',
  immutable: true
}));

// 2. Mount Decoupled REST API
app.use('/api', apiRoutes);

// 3. Static Client Serving (Allows accessing storefront directly on port 5000 as well)
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'ANISA Apparel Express API', timestamp: new Date() });
});

// Fallback to client index for client-side navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize SQLite3 Database and Start Server
async function startServer() {
  try {
    await initializeAndSeed();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`   ANISA STUDIO APPAREL BACKEND RUNNING                `);
      console.log(`   REST API Endpoint : http://localhost:${PORT}/api    `);
      console.log(`   Uploads Directory : http://localhost:${PORT}/uploads`);
      console.log(`   Storefront Web    : http://localhost:${PORT}/       `);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
}

// In local execution, start HTTP listener
if (require.main === module) {
  startServer();
} else {
  // In Vercel serverless environment, initialize DB lazily
  initializeAndSeed().catch(err => {
    console.error('Vercel serverless seed error:', err);
  });
}

module.exports = app;
