import { addSongToDatabaseById,fetchAndAddArtistToDb,fetchAndAddAlbumsForArtists } from '../services/spotify.services.js';

// Controller function
async function addAlbumsForAllArtists(req, res) {
  try {
    await fetchAndAddAlbumsForArtists();
    res.status(200).json({ message: 'Albums added successfully for all artists.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add albums for artists.', error: error.message });
  }
}

export {
  addAlbumsForAllArtists,
};

export async function addSongController(req, res) {
    try {
      const { songId } = req.params; // Get songId from URL parameters
      const { genre } = req.body; // Get genre from request body
      if (!Array.isArray(genre) || genre.length === 0) {
        return res.status(400).json({ error: 'Genre must be a non-empty array.' });
      }
      const songData = await addSongToDatabaseById(songId, genre);
      res.status(200).json(songData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  

  export async function fetchAndAddArtistController(req, res) {
    try {
      const { artistId } = req.params;
  
      if (!artistId) {
        return res.status(400).json({ error: 'Artist ID is required' });
      }
  
      // Call the service function
      await fetchAndAddArtistToDb(artistId);
  
      res.status(200).json({ message: 'Artist data fetched and added to database successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }