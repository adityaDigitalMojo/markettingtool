# Mojo Deployment Guide 🌐

Follow these steps to take your Mojo Marketing Agent from localhost to a live URL.

## 1. Backend Deployment (Node.js)
**Recommended Host**: [Render.com](https://render.com) or [Railway.app](https://railway.app)

1. **Push to GitHub**: Ensure your `backend` folder is in a GitHub repository.
2. **Create Web Service**: Connect your repo to Render/Railway.
3. **Build Command**: `npm install`
4. **Start Command**: `node src/index.js`
5. **Environment Variables**: Add all variables from your `.env` file to the host's dashboard:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.
   - `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`.
   - `PORT=8000`

## 2. Frontend Deployment (React/Vite)
**Recommended Host**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

1. **Update API URL**: In `frontend/src/App.jsx`, change `http://localhost:8000` to your live backend URL (e.g., `https://mojo-api.onrender.com`).
2. **Create Project**: Connect your GitHub repo to Vercel/Netlify.
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Add your live backend URL as `VITE_API_URL`.

## 3. Google/Meta Developer Console Updates
> [!IMPORTANT]
> You must update your API allowed origins!

1. **Google Cloud Console**:
   - Go to **APIs & Services > Credentials**.
   - Under **OAuth 2.0 Client IDs**, add your live frontend URL (e.g., `https://mojo-dashboard.vercel.app`) to **Authorized JavaScript origins**.
2. **Meta App Dashboard**:
   - Go to **App Settings > Basic**.
   - Add your live domain to **App Domains**.

## 4. Production Security Check
- [ ] **No Secrets in Repo**: Ensure `.env` is in `.gitignore`.
- [ ] **HTTPS**: Both Render and Vercel provide SSL (HTTPS) by default.
- [ ] **CORS**: Ensure your backend `index.js` allows requests from your live frontend domain.

```javascript
// Example backend CORS update
app.use(cors({
  origin: ['https://mojo-dashboard.vercel.app', 'http://localhost:5173']
}));
```
