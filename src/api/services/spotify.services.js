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
// Function to fetch albums for an artist and add them to the database
async function fetchAndAddAlbumsForArtists() {
  try {
    // Fetch all artists from the database
    const artists = await prisma.artist.findMany();

    // Loop over each artist
    for (const artist of artists) {
      const artistId = artist.id;

      // Fetch albums from Spotify API for each artist
      const token = await getAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const albums = response.data.items;

      // Add each album to the database
      for (const album of albums) {
        const albumData = {
          id: album.id,
          name: album.name,
          artistId: artistId,
          releaseDate: new Date(album.release_date),
          picture: album.images[0]?.url || '',
        };

        // Check if the album already exists, if not, create it
        await prisma.album.upsert({
          where: { id: album.id },
          update: albumData,
          create: albumData,
        });
      }

      // Update the artist's albums list (connect the album ids)
      await prisma.artist.update({
        where: { id: artistId },
        data: {
          albums: {
            connect: albums.map((album) => ({ id: album.id })),
          },
        },
      });
    }

    console.log('Albums fetched and added successfully for all artists.');
  } catch (error) {
    console.error('Error fetching or adding albums:', error.message);
    throw new Error('Failed to fetch or add albums.');
  }
}

export {
  // Other exports
  fetchAndAddAlbumsForArtists,
};

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

    // Fetch artist details for each unique artistId
    const artistIds = [...new Set(songs.map(song => song.artistId))];
    const artists = await prisma.artist.findMany({
      where: {
        id: { in: artistIds }
      },
      select: {
        id: true,
        artistPick: true
      }
    });

    // Create a map of artistId to artistName
    const artistMap = new Map(artists.map(artist => [artist.id, artist.artistPick]));

    // Map the songs to the format expected by the frontend
    const result = songs.map(song => ({
      artistName: artistMap.get(song.artistId) || 'Unknown Artist', // If artist is not found, use 'Unknown Artist'
      songName: song.name,
      songId: song.id,
      songPicture: song.picture
    }));

    return result;
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
async function getArtistById(artistId) {
  try {
    // Query the database for the artist with the given ID
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
    });

    if (!artist) {
      throw new Error(`Artist with ID ${artistId} not found.`);
    }

    return artist;
  } catch (error) {
    console.error('Error fetching artist from database:', error.message);
    throw new Error('Failed to fetch artist from database.');
  }
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
async function fetchAndAddArtistToDb(artistId) {
  try {
    // Fetch access token
    const token = await getAccessToken();

    // Fetch artist details from Spotify API
    let artistData;
    try {
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      artistData = response.data;
    } catch (fetchError) {
      console.error('Error fetching artist from Spotify:', fetchError.message);
      throw new Error('Failed to fetch artist from Spotify.');
    }

    // Prepare artist data for database
    const artist = {
      id: artistData.id,
      description: artistData.genres.join(', '), // Genres as description
      followersNumber: artistData.followers.total || 0, // Use total followers from Spotify
      artistPick:artistData.name|| '', // Initialize artistPick to an empty string
      picture: artistData.images[0]?.url || '', // Use the first image URL if available or default to empty string
      // Provide empty nested arrays for relations
      songs: { connect: [] }, // Use connect for empty array of relations
      albums: { connect: [] }, // Use connect for empty array of relations
    };

    // Add or update artist in the database
    const result = await prisma.artist.upsert({
      where: { id: artist.id },
      update: artist,
      create: artist,
    });

    console.log('Artist added or updated successfully:', result);
  } catch (error) {
    console.error('Error processing artist:', error.message);
  }
}

export {
  getSongById,
  getArtistById,
  searchSongByName,
  getRecommendationsBasedOnRecentlyPlayed,
  getRecommendationsBasedOnGenres,
  getRecommendationsBasedOnFollowedArtists,
  addSongToDatabaseById,
  fetchAndAddArtistToDb
};


