// src/controllers/user.controller.js
import { createUser, updateRecentSongs,findUserByEmail,followArtistService,getUserDetailsById } from '../services/user.services.js';
import bcrypt from 'bcrypt'; // For hashing passwords, if needed
// src/api/controller/user.controller.js

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.uid; // Assuming the user ID is stored in req.user.uid after authentication

    const userDetails = await getUserDetailsById(userId);
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export async function createUserController(req, res) {
  try {
    const { id, username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await createUser({
      id, // Pass the ID from the request body
      username,
      email,
      password: hashedPassword
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export async function followArtistController(req, res) {
  const { artistId } = req.body; // Get artistId from request body
  const { user } = req; // Get user info from the request (set by authenticateToken middleware)

  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required' });
  }

  try {
    // Call the service to follow the artist
    const updatedUser = await followArtistService(user.uid, artistId);

    // Return the updated user details
    res.status(200).json({
      message: 'Artist followed successfully',
      user: updatedUser
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
}
