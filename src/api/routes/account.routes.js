// src/routes/user.routes.js
import express from 'express';
import { createUserController } from '../controllers/account.controllers.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to create a new user, with token authentication middleware
router.post('/create', authenticateToken, createUserController);

export default router;
