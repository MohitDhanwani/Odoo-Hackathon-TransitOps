import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { generalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

import authRoutes from './modules/auth/auth.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import driversRoutes from './modules/drivers/drivers.routes';
import tripsRoutes from './modules/trips/trips.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import fuelLogsRoutes from './modules/fuelLogs/fuelLogs.routes';
import expensesRoutes from './modules/expenses/expenses.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reportsRoutes from './modules/reports/reports.routes';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Apply rate limiter to all API routes
app.use('/api', generalRateLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel-logs', fuelLogsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
