import express from 'express';
import { getRecentSongs,getTopPlayedSongs,getRecommendations, getSongsRecommendationByLikedArtists,getAllArtistsController, getSongsRecommendationByPopularSongs, getMostPlayedArtistsRightNow } from '../controllers/home.controllers.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const home = express.Router();


home.get('/recommend', authenticateToken, getRecommendations);


// Route to get recent songs
home.get('/recent-songs', getRecentSongs);

// Route to get song recommendations by liked artists
home.get('/songs-recommendation-by-liked-artists', getSongsRecommendationByLikedArtists);

// Route to get song recommendations by popular songs
home.get('/songs-recommendation-by-popular-songs', getSongsRecommendationByPopularSongs);

// Route to get most played artists right now
home.get('/most-played-artists-right-now', getMostPlayedArtistsRightNow);

home.get('/artists',authenticateToken, getAllArtistsController);

home.get('/top-played-songs', getTopPlayedSongs);



export default home;
