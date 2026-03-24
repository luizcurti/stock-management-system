import * as dotenv from 'dotenv';
dotenv.config();
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { RegisterRoutes } from './build/routes';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ValidateError } from 'tsoa';
import { customError } from './src/customErrors/customErrors';

export const app = express();

app.use(
  cors({
    origin:
      process.env.ALLOWED_ORIGINS?.split(',') ??
      (process.env.NODE_ENV !== 'production' ? '*' : []),
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Swagger documentation - only load if available
try {
  const swaggerUI = require('swagger-ui-express');
  const swaggerDoc = require('./swagger.json');
  app.use('/docs', swaggerUI.serve);
  app.get('/docs', swaggerUI.setup(swaggerDoc));
} catch (error) {
  console.warn('Swagger documentation not available. Run build first.');
  app.get('/docs', (_req: Request, res: Response) => {
    res.status(503).json({
      message: 'API documentation not available. Please run build first.',
    });
  });
}

RegisterRoutes(app);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Global error handler — must be 4-parameter for Express to treat it as error middleware
app.use(function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ValidateError) {
    res.status(422).json({
      message: 'Validation failed',
      details: err.fields,
    });
    return;
  }

  if (err instanceof customError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  next();
});

// 404 Not Found Handler
app.use(function notFoundHandler(_req: Request, res: Response) {
  res.status(404).send({
    message: 'Not Found',
  });
});