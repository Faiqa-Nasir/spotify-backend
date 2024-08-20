// src/middlewares/auth.middleware.js
import admin from '../../config/firebase.js'; // Ensure this path is correct

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (token == null) return res.status(401).json({ error: 'No token provided' });

  try {
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Store user info in request object
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}
