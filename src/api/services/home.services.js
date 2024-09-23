import axios from 'axios';
import dotenv from 'dotenv';
import qs from 'qs';
import prisma from "../../prisma/prisma.client.js";
import _ from 'lodash';

dotenv.config();

let accessToken = null;
let tokenExpiresAt = null;

export const getRecommendationsService = async (userId) => {
  // Fetch user data with select to get scalar fields
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      likedSongs: true,        // Selecting scalar fields correctly
      recentSongIds: true,
      followedArtists: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get liked and recent songs IDs
  const songIds = [...user.likedSongs, ...user.recentSongIds];

  // Fetch the genres of the liked and recent songs
  const songs = await prisma.song.findMany({
    where: {
      id: { in: songIds },
    },
    select: {
      genres: true,
    },
  });

  // Extract genres from songs, handling potential null or empty values
  const genres = songs.flatMap(song => song.genres || []);

  // Fetch followed artists and their songs
  const followedArtists = await prisma.artist.findMany({
    where: {
      id: { in: user.followedArtists },
    },
    select: {
      songs: {
        select: {
          id: true,
        },
      },
    },
  });

  // Extract song IDs from followed artists
  const followedArtistSongIds = followedArtists.flatMap(artist => artist.songs.map(song => song.id));
console.log("here");
  // Fetch songs based on genres and followed artist song IDs
  const recommendedSongs = await prisma.song.findMany({
    where: {
      OR: [
        {
          genres: {
            hasSome: genres,
          },
        },
        {
          id: { in: followedArtistSongIds },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      artist: {
        select: {
          artistPick: true, // Assuming artistPick is the artist's name
        },
      },
      picture: true,
    },
  });

  // Format the result
  const formattedSongs = recommendedSongs.map(song => ({
    artistName: song.artist.artistPick,
    songName: song.name,
    songId: song.id,
    songPicture: song.picture,
  }));

  // Shuffle the recommendations and limit to top 10
  const shuffledRecommendations = _.shuffle(formattedSongs).slice(0, 10);

  return shuffledRecommendations;
};





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

// Function to fetch recent songs from the database
export const fetchRecentSongs = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { recentSongIds: true }
    });
    const songs = await prisma.song.findMany({
        where: { id: { in: user.recentSongIds } },
        select: { id: true, name: true, picture: true }
    });
    return songs;
};
export async function fetchTopPlayedSongs() {
  try {
    // Fetch the top 10 most played songs
    const songs = await prisma.song.findMany({
      orderBy: { playedNumber: 'desc' }, // Sort by play count in descending order
      take: 10, // Limit to top 10
      select: {
        id: true,
        name: true,
        picture: true, // Include only the necessary fields
        artistId: true, // Include artistId to fetch artist details
      },
    });

    if (songs.length === 0) {
      return []; // Return an empty array if no songs are found
    }

    // Extract artist IDs from the fetched songs
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
    console.error('Error fetching top played songs:', error);
    throw new Error(`Failed to fetch top played songs: ${error.message}`);
  }
}

// Function to fetch songs recommendation by liked artists
export const fetchSongsRecommendationByLikedArtists = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { followedArtists: true }
    });

    const accessToken = await getAccessToken();

    const artistIds = user.followedArtists.join(',');
    const spotifyApi = new SpotifyWebApi({ accessToken });
    const recommendations = await spotifyApi.getRecommendations({ seed_artists: artistIds });

    const songIds = recommendations.body.tracks.map(track => track.id);
    const songsInDb = await prisma.song.findMany({
        where: { spotifyId: { in: songIds } },
        select: { id: true, name: true, picture: true }
    });

    return songsInDb;
};

// Function to fetch popular songs from the database
export const fetchSongsRecommendationByPopularSongs = async () => {
    const songs = await prisma.song.findMany({
        orderBy: { playedNumber: 'desc' },
        take: 10,
        select: { id: true, name: true, picture: true }
    });
    return songs;
};

// Function to fetch most played artists from the database
export const fetchMostPlayedArtistsRightNow = async () => {
    const artists = await prisma.artist.findMany({
        orderBy: { followersNumber: 'desc' },
        take: 5,
        select: { id: true, name: true, picture: true }
    });
    return artists;
};
// src/api/services/artist.service.js
// src/api/services/artist.service.js

export async function getAllArtists(userId) {
  try {
    
    // Fetch the user's followed artists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { followedArtists: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch all artists excluding the ones followed by the user
    const artists = await prisma.artist.findMany({
      where: {
        id: {
          notIn: user.followedArtists,
        },
      },
      select: {
        id: true,
        picture: true,
        artistPick: true,
      },
    });

    return artists;
  } catch (error) {
    throw new Error('Failed to fetch artists: ' + error.message);
  }
}

