const express = require('express');
const router = express.Router();
const { admin, isInitialized } = require('../firebaseAdmin');

// Middleware to validate request body
const validateUserId = (req, res, next) => {
  const { userId } = req.body;
  
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({ error: 'Valid userId is required' });
  }
  
  req.validatedUserId = userId.trim();
  next();
};

// Route to delete a Firebase Auth user
router.post('/api/deleteUser', validateUserId, async (req, res) => {
  try {
    // Check if Firebase Admin SDK is initialized
    if (!isInitialized()) {
      return res.status(503).json({ 
        error: 'Firebase Admin SDK not initialized. Service account key may be missing.' 
      });
    }
    
    const userId = req.validatedUserId;
    
    try {
      // Try to get user first to verify it exists
      await admin.auth().getUser(userId);
      
      // Delete the user
      await admin.auth().deleteUser(userId);
      
      console.log(`Successfully deleted Firebase Auth user: ${userId}`);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
      
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.warn(`User ${userId} not found in Firebase Auth`);
        return res.status(404).json({ error: 'User not found in Firebase Authentication' });
      } else {
        console.error(`Error deleting Firebase Auth user ${userId}:`, authError);
        return res.status(500).json({ error: authError.message });
      }
    }
  } catch (error) {
    console.error('Server error deleting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
