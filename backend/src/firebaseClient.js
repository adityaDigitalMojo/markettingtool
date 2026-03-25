const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
    // Attempt to load the service account from environment or file
    // In production, we'll use a JSON string in GOOGLE_APPLICATION_CREDENTIALS_JSON or similar
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
        // Local development: look for serviceAccountKey.json in the backend root
        const keyPath = path.join(__dirname, '../serviceAccountKey.json');
        serviceAccount = require(keyPath);
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    console.log("✅ Firebase Admin SDK Initialized");
} catch (error) {
    console.error("❌ Firebase Initialization Error:", error.message);
    console.log("⚠️ Continuing without Firebase. Database calls will fail.");
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

module.exports = { admin, db };
