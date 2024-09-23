import prisma from '../../prisma/prisma.client.js'; // Adjust import based on your setup


// services/songService.js

export async function getSongsByPlaylistService(playlistId, userId) {
    try {
        // Fetch the playlist using the playlist ID and user ID
        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId
            },
            select: {
                songIds: true // Assuming the playlist contains an array of song IDs
            }
        });

        if (!playlist || !playlist.songIds.length) {
            return []; // Return an empty array if no songs are found in the playlist
        }

        // Fetch the details of songs from the Song table
        const songs = await prisma.song.findMany({
            where: {
                id: { in: playlist.songIds }
            },
            select: {
                id: true,
                name: true,
                picture: true,
                artistId: true // Fetch artist IDs to get artist names later
            }
        });

        // Extract artist IDs from the found songs
        const artistIds = [...new Set(songs.map(song => song.artistId))];

        // Fetch artist details based on artist IDs
        const artists = await prisma.artist.findMany({
            where: {
                id: { in: artistIds }
            },
            select: {
                id: true,
                artistPick: true // Ensure this field matches the actual schema
            }
        });

        // Create a map of artist ID to artistPick
        const artistMap = new Map(artists.map(artist => [artist.id, artist.artistPick]));

        // Prepare the result
        const result = songs.map(song => ({
            artistName: artistMap.get(song.artistId) || 'Unknown Artist',
            songName: song.name,
            songId: song.id,
            songPicture: song.picture
        }));

        return result;
    } catch (error) {
        throw new Error(`Failed to get songs by playlist: ${error.message}`);
    }
}

export async function getPlaylistsService(userId) {
  // Fetch the user's playlist IDs
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { playlistIds: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Fetch the playlists based on the playlist IDs
  const playlists = await prisma.playlist.findMany({
    where: {
      id: {
        in: user.playlistIds
      }
    },
    select: {
      id: true,
      name: true
    }
  });
console.log("hi im here");
  return playlists;
}

// Service function to add a song to a playlist
export async function addSongToPlaylistService(userId, playlistId, songId) {
    // Check if the playlist exists and belongs to the user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { playlistIds: true }
    });

    // Check if the playlist is associated with the user
    if (!user || !user.playlistIds.includes(playlistId)) {
        throw new Error('Playlist not found or does not belong to the user');
    }

    // Fetch the playlist to check if it exists and to get current song IDs
    const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
        select: { songIds: true }
    });

    if (!playlist) {
        throw new Error('Playlist not found');
    }

    // Check if the song is already in the playlist
    if (playlist.songIds.includes(songId)) {
        throw new Error('Song already in playlist');
    }

    // Update the playlist by adding the song ID
    await prisma.playlist.update({
        where: { id: playlistId },
        data: {
            songIds: { push: songId } // Add songId to the songIds array
        }
    });

    return { message: 'Song added to playlist successfully' };
};

// Service function to create a playlist and associate it with a user
export async function createPlaylistForUser  (userId, playlistName) {
  // Create a new playlist
  const playlist = await prisma.playlist.create({
    data: {
      name: playlistName,
      picture: '', // You can set a default picture or pass it as a parameter
      songIds: []  // Initialize with an empty list of song IDs
    }
  });

  // Update the user with the new playlist ID
  await prisma.user.update({
    where: { id: userId },
    data: {
      playlistIds: {
        push: playlist.id  // Add the new playlist ID to the user's playlist IDs
      }
    }
  });

  return playlist; // Return the created playlist
};


export async function getSongById(songId) {
  try {
    // Fetch the song details by ID
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: {
        name: true,
        picture: true,
        duration: true,
        dateOfRelease: true,
        filePath: true,
      },
    });

    if (!song) {
      throw new Error('Song not found');
    }

    return song;
  } catch (error) {
    throw new Error('Failed to fetch song: ' + error.message);
  }
}

export async function getFollowedArtists(userId) {
  try {
    // Fetch the user's followed artist IDs
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followedArtists: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch artist details for the followed artists
    const artists = await prisma.artist.findMany({
      where: { id: { in: user.followedArtists } }, // Fetch artists where their IDs are in the user's followedArtists list
      select: {
        id: true,
        picture: true,
        artistPick: true,
      },
    });

    return artists;
  } catch (error) {
    throw new Error('Failed to fetch followed artists: ' + error.message);
  }
}

export async function getRecentSongs(userId) {
  try {
    // Fetch the user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        recentSongIds: true, // Only select the recentSongIds field
      },
    });

    if (!user || user.recentSongIds.length === 0) {
      return []; // Return an empty array if no recent songs
    }

    // Fetch valid song IDs from the Song table
    const validSongs = await prisma.song.findMany({
      where: {
        id: { in: user.recentSongIds }, // Filter songs that match the recentSongIds
      },
      select: {
        id: true,
        name: true,
        artistId: true,  // Adjust field based on your schema
        picture: true, // Adjust field based on your schema
      },
    });

    // Extract valid song IDs
    const validSongIds = validSongs.map(song => song.id);


    // Fetch the details of recent songs from the Song table
    const songs = await prisma.song.findMany({
      where: {
        id: { in: validSongIds }, // Only fetch songs that exist in the validSongIds
      },
      select: {
        id: true,
        name: true,
        artistId: true,  // Adjust field based on your schema
        picture: true, // Adjust field based on your schema
      },
    });
    // Extract artist IDs from the found songs
    const artistIds = [...new Set(songs.map(song => song.artistId))]; // Use a Set to avoid duplicate IDs

    // Fetch artist details based on artist IDs
    const artists = await prisma.artist.findMany({
      where: {
        id: {
          in: artistIds
        }
      },
      select: {
        id: true,
        artistPick: true // Ensure this field matches the actual schema
      }
    });

    // Create a map of artist ID to artistPick
    const artistMap = new Map(artists.map(artist => [artist.id, artist.artistPick]));

    // Prepare the results
    const result = songs.map(song => ({
      artistName: artistMap.get(song.artistId) || 'Unknown Artist', // If artistPick is not found, use 'Unknown Artist'
      songName: song.name,
      songId: song.id,
      songPicture: song.picture
    }));

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}
export async function getLikedSongs(userId) {
  try {
    // Fetch the user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        likedSongs: true, // Only select the recentSongIds field
      },
    });

    if (!user || user.likedSongs.length === 0) {
      return []; // Return an empty array if no recent songs
    }

    // Fetch valid song IDs from the Song table
    const validSongs = await prisma.song.findMany({
      where: {
        id: { in: user.likedSongs }, // Filter songs that match the recentSongIds
      },
      select: {
        id: true,
        name: true,
        artistId: true,  // Adjust field based on your schema
        picture: true, // Adjust field based on your schema
      },
    });

    // Extract valid song IDs
    const validSongIds = validSongs.map(song => song.id);


    // Fetch the details of recent songs from the Song table
    const songs = await prisma.song.findMany({
      where: {
        id: { in: validSongIds }, // Only fetch songs that exist in the validSongIds
      },
      select: {
        id: true,
        name: true,
        artistId: true,  // Adjust field based on your schema
        picture: true, // Adjust field based on your schema
      },
    });
    // Extract artist IDs from the found songs
    const artistIds = [...new Set(songs.map(song => song.artistId))]; // Use a Set to avoid duplicate IDs

    // Fetch artist details based on artist IDs
    const artists = await prisma.artist.findMany({
      where: {
        id: {
          in: artistIds
        }
      },
      select: {
        id: true,
        artistPick: true // Ensure this field matches the actual schema
      }
    });

    // Create a map of artist ID to artistPick
    const artistMap = new Map(artists.map(artist => [artist.id, artist.artistPick]));

    // Prepare the results
    const result = songs.map(song => ({
      artistName: artistMap.get(song.artistId) || 'Unknown Artist', // If artistPick is not found, use 'Unknown Artist'
      songName: song.name,
      songId: song.id,
      songPicture: song.picture
    }));

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}
// Function to increment the play count of a song
export async function incrementSongPlayCount(songId) {
  try {
    await prisma.song.update({
      where: { id: songId },
      data: { playedNumber: { increment: 1 } },
    });
  } catch (error) {
    console.error('Error updating song play count:', error.message);
    throw new Error('Failed to update song play count');
  }
}

// Function to add a song to the user's recently played list
export async function addSongToUserRecentList(userId, songId) {
  try {
    // Update the user's recentSongIds array
    await prisma.user.update({
      where: { id: userId },
      data: {
        recentSongIds: {
          push: songId,
        },
      },
    });
  } catch (error) {
    console.error('Error adding song to user recent list:', error.message);
    throw new Error('Failed to add song to user recent list');
  }
}
export async function searchByKeyword(keyword) {
  try {
    // Convert keyword to lowercase for case-insensitive search
    const lowercasedKeyword = keyword.toLowerCase();

    // Search for songs that contain the keyword in their name
    const songs = await prisma.song.findMany({
      where: {
        name: {
          contains: lowercasedKeyword,
          mode: 'insensitive' // Case-insensitive search
        }
      }
    });

    // Extract artist IDs from the found songs
    const artistIds = [...new Set(songs.map(song => song.artistId))]; // Use a Set to avoid duplicate IDs

    // Fetch artist details based on artist IDs
    const artists = await prisma.artist.findMany({
      where: {
        id: {
          in: artistIds
        }
      },
      select: {
        id: true,
        artistPick: true // Ensure this field matches the actual schema
      }
    });

    // Create a map of artist ID to artistPick
    const artistMap = new Map(artists.map(artist => [artist.id, artist.artistPick]));

    // Prepare the results
    const result = songs.map(song => ({
      artistName: artistMap.get(song.artistId) || 'Unknown Artist', // If artistPick is not found, use 'Unknown Artist'
      songName: song.name,
      songId: song.id,
      songPicture: song.picture
    }));

    return result;
  } catch (error) {
    console.error('Error searching by keyword:', error.message);
    throw new Error('Failed to search by keyword.');
  }
}

export async function addRecentSong(userId, songId) {
  try {
    // Fetch the user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the song exists in the Song table
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      throw new Error('Song not found');
    }

    // Update the recentSongIds array only if the song exists
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        recentSongIds: { push: songId }, // Add the song ID to the list
      },
    });

    prisma.song.update({
      where: { id: songId },
      data: {
        playedNumber: { increment: 1 }
      }
    })

    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }

}
export async function likeSong(userId, songId) {
  try {
    // Check if the song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      throw new Error('Song not found');
    }

    // Fetch the user's current liked songs
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { likedSongs: true },
    });

    // Check if the song is already liked
    if (user.likedSongs.includes(songId)) {
      throw new Error('Song all ready liked');
    }

    // Add the song ID to the user's liked songs list
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        likedSongs: {
          push: songId,
        },
      },
    });

    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
}
export async function getAlbumsByArtistId(artistId) {
  try {
    const albums = await prisma.album.findMany({
      where: { artistId },
      include: {
        artist: true, // This will include the artist data in the response
      },
    });
    return albums;
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw new Error('Unable to fetch albums.');
  }
}
