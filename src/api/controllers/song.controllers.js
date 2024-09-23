import { incrementSongPlayCount,getPlaylistsService,getSongsByPlaylistService,addSongToPlaylistService,createPlaylistForUser,getAlbumsByArtistId,likeSong,getLikedSongs,getSongById, addSongToUserRecentList,searchByKeyword,addRecentSong,getRecentSongs,getFollowedArtists } from '../services/song.services.js';

export async function getSongsByPlaylist(req, res) {
    const { playlistId } = req.params;
    const userId = req.user.uid; // Extract user ID from the token
    
    try {
        const songs = await getSongsByPlaylistService(playlistId, userId);
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getPlaylists (req, res) {
  try {
      const userId = req.user.uid; // Extract user ID from the token
      const result = await getPlaylistsService(userId);

      res.status(200).json(result);
  } catch (error) {
      if (error.message === 'Playlist not found') {
          return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Song already in playlist') {
          return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
  }
};

// Controller function to handle adding a song to a playlist
export async function addSongToPlaylist (req, res) {
    try {
        const userId = req.user.uid; // Extract user ID from the token
        const { playlistId, songId } = req.body; // Get playlistId and songId from the request body

        // Call the service function to add the song to the playlist
        const result = await addSongToPlaylistService(userId, playlistId, songId);

        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Playlist not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Song already in playlist') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};



// Controller function to create a playlist for the authenticated user
export async function createPlaylist (req, res) {
  try {
    const userId = req.user.uid; // Assuming the user ID is stored in req.user.id after authentication
    const { name } = req.body; // Get the playlist name from the request body

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    // Call the service function to create a playlist
    const playlist = await createPlaylistForUser(userId, name);
    res.status(201).json(playlist); // Return the created playlist
  } catch (error) {
    console.error('Error in createPlaylist:', error);
    res.status(500).json({ error: error.message });
  }
};

export async function getAlbums(req, res) {
  const { artistId } = req.params;

  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required' });
  }

  try {
    const albums = await getAlbumsByArtistId(artistId);
    
    if (albums.length === 0) {
      return res.status(404).json({ message: 'No albums found for the given artist' });
    }

    // Formatting the response
    const formattedAlbums = albums.map(album => ({
      id: album.id,
      name: album.name,
      artistId: album.artistId,
      artistName: album.artist.name, // Assuming artist has a 'name' field
      releaseDate: album.releaseDate,
      picture: album.picture,
    }));

    res.json(formattedAlbums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFollowedArtistsController(req, res) {
  try {
    const userId = req.user.uid; // Extract user ID from the token
    const followedArtists = await getFollowedArtists(userId);
    res.status(200).json(followedArtists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSong(req, res) {
  try {
    console.log("hi");
    const songId = req.params.id;
    const song = await getSongById(songId);
    
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export async function likeSongController(req, res) {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

    const userId = req.user.uid; // Extract user ID from the token

    // Call the service to like the song
    const updatedUser = await likeSong(userId, songId);

    return res.status(200).json({
      message: 'Song liked successfully',
      user: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

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



export async function searchByKeywordSong(req, res) {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ message: 'Keyword is required.' });
  }

  try {
    const results = await searchByKeyword(keyword);
    console.log("search");
    res.json(results);
  } catch (error) {
    console.error('Error handling search request:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function getUserRecentSongs(req, res) {
  try {
    const userId = req.user.uid; // Assuming the user ID is stored in req.user.uid after authentication
    const displayName = req.user.displayName; // Get the display name (username)

    console.log(`Username: ${displayName}`);

    const recentSongs = await getRecentSongs(userId);
    res.status(200).json(recentSongs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserLikedSongs(req, res) {
  try {
    const userId = req.user.uid; // Assuming the user ID is stored in req.user.uid after authentication

    const recentSongs = await getLikedSongs(userId);
    res.status(200).json(recentSongs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addRecentSongController(req, res) {
  const { songId } = req.body;
  const userId = req.user.uid; // Extracted from the token by the middleware

  try {
    const updatedUser = await addRecentSong(userId, songId);
    res.status(200).json({ message: 'Song added to recent songs', updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

