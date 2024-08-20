// src/controllers/user.controller.js
import { createUser, updateRecentSongs } from '../services/user.services.js';
import prisma from '../../prisma/prisma.client.js';

// Controller function to handle user creation request
export async function createUserController(req, res) {
  try {
    const { username, email, password } = req.body;
    const { uid } = req.user; // Get user ID from the token

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: uid }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user
    const newUser = await createUser({ username, email, password });

    // Optionally update recent songs if needed
    // await updateRecentSongs(uid, someSongId); // Replace someSongId with the actual song ID

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
