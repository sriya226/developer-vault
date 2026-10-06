require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const sanitize = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    exposedHeaders: ['Content-Disposition'],
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(sanitize);

const limiter = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
  });

app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/auth', limiter(50), require('./routes/authRoutes'));
app.use('/api/users', limiter(300), require('./routes/userRoutes'));
app.use('/api/bookmarks', limiter(1000), require('./routes/bookmarkRoutes'));
app.use('/api/categories', limiter(300), require('./routes/categoryRoutes'));
app.use('/api/billing', limiter(100), require('./routes/billingRoutes'));

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.error('JWT_SECRET must be set to a long random string (16+ characters). See .env.example.');
    process.exit(1);
  }
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
