import {
    getSongById,
    getArtistById,
    searchSongByName,
    getSongsByGenres,
    getRecommendationsBasedOnRecentlyPlayed,
    getRecommendationsBasedOnGenres,
    getRecommendationsBasedOnFollowedArtists,
  } from '../services/spotify.services.js';
  
  export async function searchSongById(req, res) {
    try {
      const { id } = req.params;
      const song = await getSongById(id);
      res.status(200).json(song);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  export async function searchArtistById(req, res) {
    try {
      const { id } = req.params;
      const artist = await getArtistById(id);
      res.status(200).json(artist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
 
export async function searchSongsByGenres(req, res) {
  try {
    const { genre } = req.params; // Get genre from route parameters

    if (!genre) {
      return res.status(400).json({ error: 'Genre parameter is required' });
    }

    // Handle single genre or comma-separated list of genres
    const genresArray = genre.split(',').map(g => g.trim());

    const songs = await getSongsByGenres(genresArray);

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  export async function searchSongName(req, res) {
    try {
      const { name } = req.query;
      const songs = await searchSongByName(name);
      res.status(200).json(songs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  export async function getRecommendations(req, res) {
    try {
      const { userId, genres, artistIds } = req.query;
      let recommendations;
  
      if (userId) {
        recommendations = await getRecommendationsBasedOnRecentlyPlayed(userId);
      } else if (genres) {
        recommendations = await getRecommendationsBasedOnGenres(genres.split(','));
      } else if (artistIds) {
        recommendations = await getRecommendationsBasedOnFollowedArtists(artistIds.split(','));
      } else {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
  
      res.status(200).json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  