import { fetchRecentSongs, fetchSongsRecommendationByLikedArtists, fetchSongsRecommendationByPopularSongs, fetchMostPlayedArtistsRightNow } from '../services/home.services.js';

// Controller function to get recent songs
export const getRecentSongs = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in the request object
        const songs = await fetchRecentSongs(userId);
        return res.status(200).json(songs);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch recent songs' });
    }
};

// Controller function to get song recommendations by liked artists
export const getSongsRecommendationByLikedArtists = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in the request object
        const songs = await fetchSongsRecommendationByLikedArtists(userId);
        return res.status(200).json(songs);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch song recommendations' });
    }
};

// Controller function to get song recommendations by popular songs
export const getSongsRecommendationByPopularSongs = async (req, res) => {
    try {
        const songs = await fetchSongsRecommendationByPopularSongs();
        return res.status(200).json(songs);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch popular song recommendations' });
    }
};

// Controller function to get most played artists right now
export const getMostPlayedArtistsRightNow = async (req, res) => {
    try {
        const artists = await fetchMostPlayedArtistsRightNow();
        return res.status(200).json(artists);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch most played artists' });
    }
};
