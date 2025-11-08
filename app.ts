import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { RegisterRoutes } from './build/routes';
import cors from 'cors';

export const app = express();

app.use(cors({ origin: '*' }));

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

// 404 Not Found Handler
app.use(function notFoundHandler(_req: Request, res: Response) {
  res.status(404).send({
    message: 'Not Found',
  });
});