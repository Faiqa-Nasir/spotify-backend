import express from 'express';
import { addSongController } from '../controllers/addSongsToDb.controllers.js';

const router = express.Router();

// Route to add a song to the database
router.post('/add-song/:songId', addSongController);

router.get('/', (req, res) => {
    return res.status(200).json("Spotify add songs cicd");
  });
export default router;
