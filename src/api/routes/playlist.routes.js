import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { updateSongAndUser,addSongToPlaylist,getSongsByPlaylist,getPlaylists,createPlaylist,getSong,getAlbums,addRecentSongController,getUserRecentSongs,getUserLikedSongs,likeSongController,getFollowedArtistsController } from '../controllers/song.controllers.js';

const router = express.Router();

// Route to update song play count and user's recently played songs
router.post('/update-song/:songId', authenticateToken, updateSongAndUser);

router.post('/add-recent-song', authenticateToken, addRecentSongController);

router.get('/recent-songs', authenticateToken, getUserRecentSongs);

router.post('/like-song', authenticateToken, likeSongController);
router.get('/user/followed-artists', authenticateToken, getFollowedArtistsController);
router.get('/liked-songs', authenticateToken, getUserLikedSongs);
router.get('/get-song/:id', getSong);

router.get('/albums/:artistId', getAlbums);

router.post('/create-playlist', authenticateToken, createPlaylist);

router.post('/add-song-to-playlist', authenticateToken, addSongToPlaylist);

router.get('/get-playlists', authenticateToken, getPlaylists);
router.get('/playlist-songs/:playlistId/songs',authenticateToken, getSongsByPlaylist);



export default router;
