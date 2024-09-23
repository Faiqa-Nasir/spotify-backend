import prisma from '../../prisma/prisma.client.js'; // Adjust the import path as necessary
// src/api/service/user.service.js

export async function getUserDetailsById(userId) {
  try {
    // Fetch user details from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        followedArtists: true,
        likedSongs: true
      }
    });

    if (!user) {
      throw new Error('Failed to fetch user.');
    }

    // Return user details with counts
    return {
      username: user.username,
      email: user.email,
      countOfArtists: user.followedArtists.length,
      countOfLikedSongs: user.likedSongs.length
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};


// Function to create a new user
export async function createUser(userData) {
  try {
    const { id, username, email, password } = userData;

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        id, // Include the ID field
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
export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email }
  });
}
export async function followArtistService(userId, artistId) {
  try {
    // Check if the artist exists in the database
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
    });

    if (!artist) {
      throw new Error('Artist not found');
    }

    // Fetch the user's current followed artists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { followedArtists: true },
    });

    // Check if the artist is already followed
    if (user.followedArtists.includes(artistId)) {
      return user; // No need to update if the artist is already followed
    }

    // Update the user's followedArtists list with a unique artist ID
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        followedArtists: { push: artistId },
      },
    });

    // Increment the artist's follower count
    await prisma.artist.update({
      where: { id: artistId },
      data: {
        followerCount: { increment: 1 },
      },
    });

    return updatedUser; // Return the updated user details
  } catch (error) {
    throw new Error(error.message);
  }
}
