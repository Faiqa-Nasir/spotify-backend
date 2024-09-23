import { fetchRecentSongs,fetchTopPlayedSongs,getRecommendationsService, fetchSongsRecommendationByLikedArtists, fetchSongsRecommendationByPopularSongs, fetchMostPlayedArtistsRightNow,getAllArtists } from '../services/home.services.js';


export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.uid; // Assuming the user ID is extracted from the token
    const recommendations = await getRecommendationsService(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};
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

export const getTopPlayedSongs = async (req, res) => {
  try {
      const songs = await fetchTopPlayedSongs();
      res.status(200).json(songs); // Respond with the songs in JSON format
  } catch (error) {
      console.error('Error in getTopPlayedSongs:', error);
      res.status(500).json({ error: 'Failed to fetch top played songs' });
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
// src/api/controllers/artist.controller.js
// src/api/controllers/artist.controller.js

export async function getAllArtistsController(req, res) {
  try {
    const userId = req.user.uid; // Extract the user ID from the token

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const artists = await getAllArtists(userId);
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export async function getFollowedArtists(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followedArtists: {
          select: {
            id: true,
            picture: true,
            artistPick: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.followedArtists;
  } catch (error) {
    throw new Error('Failed to fetch followed artists: ' + error.message);
  }
}
