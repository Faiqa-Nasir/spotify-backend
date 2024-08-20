import { incrementSongPlayCount, addSongToUserRecentList } from '../services/song.services.js';

export async function updateSongAndUser(req, res) {
  try {
    const { songId } = req.params; // Extract songId from route parameters
    const userId = req.user.uid; // Extract user ID (Firebase UID) from the token
    const username = req.user.name; // Extract the username from the token (if available)

    if (!songId || !userId) {
      return res.status(400).json({ error: 'Song ID and User ID are required' });
    }

    // Update song play count
    await incrementSongPlayCount(songId);

    // Add song to user's recently played list
    await addSongToUserRecentList(userId, songId);

    res.status(200).json({ message: 'Song play count updated and added to user recent list' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
