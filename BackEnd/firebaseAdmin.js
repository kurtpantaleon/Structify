const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to the service account key file
const serviceAccountPath = path.join(__dirname, 'structify-f712f-firebase-adminsdk-fbsvc-2f42c321c6.json');

// Check if service account key exists
let firebaseAdminInitialized = false;

try {
  // Initialize Firebase Admin if the service account key exists
  if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath))
    });
    firebaseAdminInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.warn('Service account key not found at:', serviceAccountPath);
    console.warn('Firebase Admin functionality will be limited');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

module.exports = {
  admin,
  isInitialized: () => firebaseAdminInitialized
};
