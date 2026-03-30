import admin from 'firebase-admin';
import fs from 'fs';

let initialized = false;

function initializeFirebaseAdmin() {
  if (initialized) return;

  const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;
  if (!credentialsPath) {
    throw new Error('FIREBASE_CREDENTIALS_PATH is not set');
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });

  initialized = true;
}

export async function requireAuth(req, res, next) {
  try {
    initializeFirebaseAdmin();

    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing auth token' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid auth token' });
  }
}
