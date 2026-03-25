# How to Run the Mojo Performance Agent

To get the Mojo Performance Agent up and running, follow these steps:

## Prerequisites
- **Node.js**: Ensure you have Node.js installed (`node -v`).
- **NPM**: Ensure you have npm installed (`npm -v`).

## 1. Start the Backend
Navigate to the `backend` directory and run the initialization:
```bash
cd backend
npm install
npm start
```
The API will start at `http://localhost:8000`.

## 2. Start the Frontend
Navigate to the `frontend` directory and start the dev server:
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## 3. Connect Your Accounts
1. Open the dashboard in your browser.
2. Go to the **Settings** tab in the sidebar.
3. Enter your Meta and Google Ads API credentials (Tokens & IDs).
4. Click **Save Config**.

## 4. Analysis
Toggle between **Meta** and **Google** on the dashboard to see real-time audits for the **Amara** project based on the provided SOPs.
