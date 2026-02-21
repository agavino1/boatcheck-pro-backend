import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import inspectionRoutes from './routes/inspections.js';
import technicianRoutes from './routes/technicians.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const normalizeEnv = (value) =>
  typeof value === 'string' ? value.replace(/^['"]|['"]$/g, '') : value;

const app = express();
const PORT = Number(normalizeEnv(process.env.PORT)) || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: normalizeEnv(process.env.FRONTEND_URL) || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

let dbReady = false;

// Health check
app.get('/health', (req, res) => {
  // Keep 200 so container platforms don't restart us while DB is recovering.
  res.status(200).json({
    status: dbReady ? 'OK' : 'DEGRADED',
    database: dbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

const startHttpServer = () => {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${normalizeEnv(process.env.NODE_ENV) || 'development'}`);
  });
};

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    dbReady = true;
    console.log('✓ Database connection established');

    await sequelize.sync({ alter: normalizeEnv(process.env.NODE_ENV) === 'development' });
    console.log('✓ Database models synchronized');
  } catch (err) {
    dbReady = false;
    console.error('✗ Database init failed, server stays up in degraded mode:', err.message);

    // Retry periodically so Railway service stays alive while config is fixed.
    setTimeout(connectDatabase, 15000);
  }
};

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

startHttpServer();
connectDatabase();

export default app;
