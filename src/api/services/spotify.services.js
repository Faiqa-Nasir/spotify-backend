import axios from 'axios';
import dotenv from 'dotenv';
import qs from 'qs';
import prisma from "../../prisma/prisma.client.js";

dotenv.config();

let accessToken = null;
let tokenExpiresAt = null;

// Function to get a new access token from Spotify
async function getNewAccessToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const data = qs.stringify({ grant_type: 'client_credentials' });
  const headers = {
    Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const response = await axios.post(tokenUrl, data, { headers });

  accessToken = response.data.access_token;
  tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

  return accessToken;
}

// Function to get the access token, refreshing it if necessary
async function getAccessToken() {
  if (accessToken && tokenExpiresAt > Date.now()) {
    return accessToken;
  }

  return await getNewAccessToken();
}


// Function to get songs by genres from the database
async function getArtistName(artistId) {
  try {
    const token = await getAccessToken(); // Get token inside function
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching artist from Spotify:', error.message);
    throw new Error('Failed to fetch artist from Spotify.');
  }
}

// Combined function to get songs by genres and artist details
async function getSongsByGenres(genres) {
  try {
    const genresArray = Array.isArray(genres) ? genres : [genres];

    // Fetch songs from the database where genres match
    const songs = await prisma.song.findMany({
      where: {
        genres: {
          hasSome: genresArray,
        },
      },
      select: {
        id: true,
        name: true,
        artistId: true,
        picture: true,
        filePath: true,
      },
    });

    // Fetch artist details for each song
    const songsWithArtistNames = await Promise.all(
      songs.map(async (song) => {
        const artist = await getArtistName(song.artistId);
        return {
          ...song,
          artistName: artist.name,
          artistId: artist.id,
        };
      })
    );

    return songsWithArtistNames;
  } catch (error) {
    console.error('Error fetching songs by genres:', error.message);
    throw new Error('Failed to fetch songs by genres.');
  }
}

export {
  // existing exports
  getSongsByGenres,
};

// Function to get a song by its ID
//chnage it so it just retreives from db
async function getSongById(songId) {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${songId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const song = response.data;

    return {
      id: song.id,
      name: song.name,
      artistId: song.artists[0]?.id || null, 
      dateOfRelease: song.album.release_date || null, 
      albumId: song.album.id || null, 
      spotifyId: song.id, 
      durationMs: song.duration_ms, 
      imageUrl: song.album.images[0]?.url || null, 
      filePath: `/audio/${songId}.mp3`, 
    };
  } catch (error) {
    console.error('Error fetching song from Spotify:', error.message);
    throw new Error('Failed to fetch song from Spotify.');
  }
}
// Function to get an artist by their ID
async function getArtistById(artistId) {
  const token = await getAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Function to search for songs by name
async function searchSongByName(name) {
  const token = await getAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/search`, {
    params: {
      q: name,
      type: 'track',
      limit: 10,
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.tracks.items;
}

// Function to get recommendations based on recently played songs
async function getRecommendationsBasedOnRecentlyPlayed(userId) {
  const songIds = ''; // Placeholder for song IDs

  const token = await getAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/recommendations`, {
    params: {
      seed_tracks: songIds,
      limit: 10,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.tracks;
}

// Function to get recommendations based on genres
async function getRecommendationsBasedOnGenres(genres) {
  const token = await getAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/recommendations`, {
    params: {
      seed_genres: genres.join(','),
      limit: 10,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.tracks;
}

// Function to get recommendations based on followed artists
async function getRecommendationsBasedOnFollowedArtists(artistIds) {
  const token = await getAccessToken();
  const response = await axios.get(`https://api.spotify.com/v1/recommendations`, {
    params: {
      seed_artists: artistIds.join(','),
      limit: 10,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.tracks;
}
async function addSongToDatabaseById(songId, genre) {
  try {
    console.log(songId);
    // Fetch song details from Spotify API
    let song;
    try {
      const token = await getAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${songId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      song = response.data;
    } catch (fetchError) {
      console.error('Error fetching song from Spotify:', fetchError.message);
      throw new Error('Failed to fetch song from Spotify.');
    }

    // Prepare the song data
    const songDetails = {
      id: song.id,
      name: song.name,
      artistId: song.artists[0]?.id || null,
      dateOfRelease: song.album.release_date || null,
      albumId: song.album.id || null,
      spotifyId: song.id,
      durationMs: song.duration_ms,
      imageUrl: song.album.images[0]?.url || null,
      filePath: `/audio/${songId}.mp3`,
    };

    const genresArray = Array.isArray(genre) ? genre : [genre];

    // Add song to the database
    try {
      const newSong = await prisma.song.create({
        data: {
          id: songDetails.id, // Spotify ID as the database ID
          name: songDetails.name,
          artistId: songDetails.artistId,
          picture: songDetails.imageUrl,
          genres: genresArray, // Add genre to the song
          dateOfRelease: new Date(songDetails.dateOfRelease),
          albumId: songDetails.albumId,
          duration: Math.floor(songDetails.durationMs / 1000), // Convert duration from ms to seconds
          playedNumber: 0,
          filePath: songDetails.filePath,
          spotifyId: songDetails.spotifyId,
        },
      });

      return newSong;
    } catch (dbError) {
      console.error('Error adding song to database:', dbError.message);
      throw new Error('Failed to add song to database.');
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    throw error;
  }
}



export {
  getSongById,
  getArtistById,
  searchSongByName,
  getRecommendationsBasedOnRecentlyPlayed,
  getRecommendationsBasedOnGenres,
  getRecommendationsBasedOnFollowedArtists,
  addSongToDatabaseById
};


