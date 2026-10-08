import path from 'path';
import dotenv from 'dotenv';

// Explicitly load backend/.env whether run from workspace root or backend dir
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { seedDatabase } from './services/seederService';
import apiRouter from './routes/index';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware';
import { generalLimiter } from './middleware/rateLimiter';

const app: Express = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
// Reload trigger for .env changes: 2026-10-07T21:07:00

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for cookies and client requests
const rawClientUrls = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''));

const staticOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://basi.world',
  'https://www.basi.world',
];

const allowedOrigins = Array.from(new Set([...rawClientUrls, ...staticOrigins]));

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow server-to-server or requests without origin header (like mobile/Postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');

      // Allow if explicit in allowedOrigins
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // Automatically allow custom domain basi.world and its subdomains
      if (
        cleanOrigin === 'https://basi.world' ||
        cleanOrigin === 'http://basi.world' ||
        cleanOrigin.endsWith('.basi.world')
      ) {
        return callback(null, true);
      }

      // Automatically allow any Vercel domain (*.vercel.app)
      if (cleanOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow localhost in non-production or for local debugging
      if (
        cleanOrigin.startsWith('http://localhost:') ||
        cleanOrigin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS] Origin not allowed: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter for general endpoints
app.use('/api', generalLimiter);

// API Routes
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter); // Backward compatibility alias

// Root health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Basi Portfolio Dynamic CMS API',
    status: 'online',
    version: '2.0.0',
    docs: '/api/health',
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Database initialization and server startup
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(port, () => {
    console.log(`✓ Portfolio CMS Backend running at http://localhost:${port}`);
    console.log(`✓ API Endpoint: http://localhost:${port}/api`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
