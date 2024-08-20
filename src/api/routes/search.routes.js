import express from 'express';
import {
  searchSongById,
  searchArtistById,
  searchSongName,
  getRecommendations,
  searchSongsByGenres, // Import the new controller function
} from '../controllers/search.controllers.js';

const router = express.Router();

router.get('/song/:id', searchSongById);
router.get('/artist/:id', searchArtistById);
router.get('/search', searchSongName);
router.get('/recommendations', getRecommendations);
router.get('/songs-by-genres/:genre', searchSongsByGenres); // New route

export default router;
