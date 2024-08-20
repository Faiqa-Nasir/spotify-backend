import prisma from '../../prisma/prisma.client.js'; // Adjust import based on your setup

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
