// src/services/user.service.js
import prisma from '../../prisma/prisma.client.js'; // Adjust the import path as necessary

// Function to create a new user
export async function createUser(userData) {
  try {
    const { username, email, password } = userData;

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password, // Ensure password is hashed before saving
        followedArtists: [],
        playlistIds: [],
        likedSongs: [],
        recentSongIds: []
      }
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw new Error('Failed to create user.');
  }
}

// Function to update a user's recent song list
export async function updateRecentSongs(userId, songId) {
  try {
    // Update recent song IDs list
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        recentSongIds: {
          push: songId // Add the songId to the recentSongIds array
        }
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating recent songs:', error.message);
    throw new Error('Failed to update recent songs.');
  }
}
