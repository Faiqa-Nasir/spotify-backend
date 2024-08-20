import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { homeRouter,searchRouter,playlistRouter,userAccountRouter,addSongsToDbRouter } from './api/routes/index.js';
import errorHandler from './api/middlewares/errorHandler.middleware.js';
import logger from './config/logger.js';

dotenv.config();
logger.info(`Environment: ${process.env.NODE_ENV}`);

// Server setup
const app = express();
const server = http.createServer(app);

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'DEVELOPMENT') {
      return callback(null, true);
    }

    const allowedOrigins = [
      // Add production URLs here
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET_KEY)); // Setup cookie-parser with secret key
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
app.use('/', homeRouter);
app.use('/search', searchRouter);
app.use('/account', userAccountRouter);
app.use('/playlist',playlistRouter)
app.use('/addSongs',addSongsToDbRouter)

// Example route to test server
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
