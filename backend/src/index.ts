import 'dotenv/config';
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
const allowedOrigins = [
  clientUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or curl/mobile requests without origin header
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ))
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy: Origin not allowed'));
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
