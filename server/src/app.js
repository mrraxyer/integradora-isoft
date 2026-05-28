const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

/*
 * CORS — Cross-Origin Resource Sharing
 *
 * Browsers enforce a same-origin policy: a web page at origin A is blocked
 * from making HTTP requests to origin B unless origin B explicitly permits it
 * via CORS response headers.
 *
 * In this project the React client runs on http://localhost:5173 and the API
 * runs on http://localhost:3000 — different ports = different origins.
 * The `cors` middleware adds the required headers so the browser allows the
 * cross-origin requests made by the frontend.
 */
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP request logger (dev format: colored method, path, status, response time)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json());

// Interactive API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
