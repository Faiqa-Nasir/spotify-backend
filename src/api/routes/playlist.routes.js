import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { updateSongAndUser } from '../controllers/song.controllers.js';

const router = express.Router();

// Route to update song play count and user's recently played songs
router.post('/update-song/:songId', authenticateToken, updateSongAndUser);

export default router;
