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
