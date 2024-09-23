import express from 'express';
import { addSongController,fetchAndAddArtistController,addAlbumsForAllArtists } from '../controllers/addSongsToDb.controllers.js';
const router = express.Router();

// Route to add a song to the database
router.post('/add-song/:songId', addSongController);
router.post('/add-artist/:artistId', fetchAndAddArtistController);
router.get('/albums/fetch-and-add', addAlbumsForAllArtists);
export default router;
