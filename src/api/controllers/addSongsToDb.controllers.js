import { addSongToDatabaseById } from '../services/spotify.services.js';

// Controller function
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
  