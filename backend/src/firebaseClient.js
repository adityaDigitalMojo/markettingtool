const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
    // Attempt to load the service account from environment or file
    // In production, we'll use a JSON string in GOOGLE_APPLICATION_CREDENTIALS_JSON or similar
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Handle potential escaping issues from environment variables
        let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
        // Remove surrounding quotes if Render added them
        if (rawJson.startsWith("'") && rawJson.endsWith("'")) rawJson = rawJson.slice(1, -1);
        if (rawJson.startsWith('"') && rawJson.endsWith('"')) rawJson = rawJson.slice(1, -1);

        serviceAccount = JSON.parse(rawJson);

        // Ensure private_key handles newline characters correctly
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
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
