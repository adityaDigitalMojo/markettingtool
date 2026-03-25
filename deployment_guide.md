# Mojo Deployment Guide 🌐

Follow these steps to take your Mojo Marketing Agent from localhost to a live URL.

## 1. Backend Deployment (Node.js)
**Recommended Host**: [Render.com](https://render.com) or [Railway.app](https://railway.app)

1. **Push to GitHub**: Ensure your `backend` folder is in a GitHub repository.
2. **Create Web Service**: Connect your repo to Render/Railway.
3. **Build Command**: `npm install`
4. **Start Command**: `node src/index.js`
5. **Environment Variables**: Add only the system-level variables to your host's dashboard:
   - `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY` (format: `-----BEGIN PRIVATE KEY-----\n...`), `FIREBASE_CLIENT_EMAIL`.
   - `PORT=8000`

> [!NOTE]
> **Why are Google/Meta variables missing?** 
> Since we implemented Multi-Tenancy, all client-specific API keys (ClientId, Secret, Refresh Token, etc.) are now stored in **Firestore** and managed through your live dashboard's "Settings" page. You only need the Firebase Admin keys in your backend environment to connect to that database.

## 2. Firebase Database Setup
> [!IMPORTANT]
> Mojo now uses Firebase Firestore for multi-tenancy.

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/).
2. **Firestore Database**: Create a Firestore database in "Production" mode and select a region (e.g., `asia-south1`).
3. **Service Account**: Go to **Project Settings > Service Accounts** and generate a new private key.
4. **Environment Variables**: Map the JSON keys to your backend environment variables (see Step 1.5).

## 3. Frontend Deployment (React/Vite)
**Recommended Host**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

1. **Update API URL**: Standardized to use `import.meta.env.VITE_API_URL`.
2. **Create Project**: Connect your GitHub repo to Vercel/Netlify.
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Add your live backend URL as `VITE_API_URL`.

## 4. Google/Meta Developer Console Updates
> [!IMPORTANT]
> You must update your API allowed origins!

1. **Google Cloud Console**:
   - Go to **APIs & Services > Credentials**.
   - Under **OAuth 2.0 Client IDs**, add your live frontend URL (e.g., `https://mojo-dashboard.vercel.app`) to **Authorized JavaScript origins**.
2. **Meta App Dashboard**:
   - Go to **App Settings > Basic**.
   - Add your live domain to **App Domains**.

## 5. Production Security Check
- [x] **No Secrets in Repo**: Ensure `.env` is in `.gitignore`.
- [x] **HTTPS**: Both Render and Vercel provide SSL (HTTPS) by default.
- [ ] **CORS**: Ensure your backend `index.js` allows requests from your live frontend domain.

```javascript
// Example backend CORS update in index.js
app.use(cors({
  origin: ['https://mojo-dashboard.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-id']
}));
```
