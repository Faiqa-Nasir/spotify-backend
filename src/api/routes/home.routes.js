import express from 'express';
import { getRecentSongs, getSongsRecommendationByLikedArtists, getSongsRecommendationByPopularSongs, getMostPlayedArtistsRightNow } from '../controllers/home.controllers.js';

const home = express.Router();

// Route to get recent songs
home.get('/recent-songs', getRecentSongs);

// Route to get song recommendations by liked artists
home.get('/songs-recommendation-by-liked-artists', getSongsRecommendationByLikedArtists);

// Route to get song recommendations by popular songs
home.get('/songs-recommendation-by-popular-songs', getSongsRecommendationByPopularSongs);

// Route to get most played artists right now
home.get('/most-played-artists-right-now', getMostPlayedArtistsRightNow);

export default home;
