const express = require('express');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const listsRoutes = require('./routes/lists');

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const app = express();

// Middleware
const corsOptions = cors({
  origin: (origin, callback) => {
    const allowedOrigins =
      process.env.NODE_ENV === "development"
        ? [
          "http://localhost:5173",
          "http://127.0.0.1:5173"
        ]
        : [
          "http://www.righttrackplanner.com",
          "https://www.righttrackplanner.com",
          "http://api.righttrackplanner.com",
          "https://api.righttrackplanner.com",
        ];
    // Allow no-origin requests for tools like Postman
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
});

// app.use(helmet());
app.use(corsOptions);
// app.use(morgan('combined'));
app.use(express.json());

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', authMiddleware, eventsRoutes);
app.use('/api/lists', authMiddleware, listsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Start server
const PORT = process.env.PORT || 443;
async function startServer() {
  try {
    await connectDB();

    const options = {
      key: fs.readFileSync('/certificates/key.pem'), // Hardcoded path since SSL paths are removed
      cert: fs.readFileSync('/certificates/cert.pem')
    };

    https.createServer(options, app).listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer();