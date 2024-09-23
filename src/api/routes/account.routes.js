// src/routes/user.routes.js
import express from 'express';
import { createUserController,followArtistController,getUserDetails } from '../controllers/account.controllers.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();
// Route to create a new user without token authentication
router.post('/create', createUserController);
router.post('/follow-artist',authenticateToken, followArtistController);
router.get('/user-details', authenticateToken,getUserDetails);

export default router;
