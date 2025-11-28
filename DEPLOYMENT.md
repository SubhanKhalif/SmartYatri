# Deployment Guide

This guide provides instructions for deploying both the frontend and backend of the application to production environments.

## Backend Deployment (Render)

1. **Prerequisites**
   - A Render.com account
   - MongoDB Atlas database (or another MongoDB provider)

2. **Deployment Steps**
   1. Push your code to a GitHub repository
   2. Go to [Render Dashboard](https://dashboard.render.com/)
   3. Click "New" and select "Web Service"
   4. Connect your GitHub repository
   5. Configure the service:
      - **Name**: your-backend-name
      - **Region**: Choose the one closest to your users
      - **Branch**: main (or your production branch)
      - **Build Command**: `npm install && npm run build`
      - **Start Command**: `npm start`
   6. Add environment variables from your `.env` file
   7. Click "Create Web Service"

3. **Environment Variables**
   - `NODE_ENV=production`
   - `PORT=10000` (or your preferred port)
   - `DATABASE_URL` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `FRONTEND_URL` - Your frontend URL (e.g., https://your-vercel-app.vercel.app)
   - Any other environment variables from `.env.example`

## Frontend Deployment (Vercel)

1. **Prerequisites**
   - A Vercel account
   - Node.js and npm installed locally

2. **Build Locally (Optional)**
   ```bash
   cd front
   npm install
   npm run build
   ```

3. **Deployment Steps**
   1. Push your code to a GitHub repository
   2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   3. Click "Add New" → "Project"
   4. Import your GitHub repository
   5. Configure the project:
      - **Framework Preset**: Vite
      - **Build Command**: `npm run build`
      - **Output Directory**: `dist`
      - **Install Command**: `npm install`
   6. Add environment variables:
      - `VITE_API_BASE_URL` - Your backend API URL (e.g., https://your-render-backend.onrender.com/api)
      - `VITE_NODE_ENV=production`
   7. Click "Deploy"

## Post-Deployment Steps

1. **Verify CORS Settings**
   - Ensure your backend's CORS settings in `app.js` include your production frontend URL
   - Update the `allowedOrigins` array with your production domains

2. **Test Authentication**
   - Test login/logout functionality
   - Verify tokens are being stored in localStorage
   - Check that protected routes work as expected

3. **Monitoring**
   - Set up logging and monitoring for both frontend and backend
   - Configure error tracking (e.g., Sentry, LogRocket)

## Environment Variables Reference

### Backend (`.env`)
```
PORT=5000
NODE_ENV=production
DATABASE_URL="mongodb+srv://..."
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
# Add other environment variables as needed
```

### Frontend (`.env.production`)
```
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
VITE_NODE_ENV=production
VITE_FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Troubleshooting

### Token Not Stored in Production
- Ensure your frontend is using HTTPS in production
- Check that the `secure` flag is set to `true` for cookies in production
- Verify CORS settings on the backend allow requests from your frontend domain

### CORS Errors
- Double-check the `allowedOrigins` array in the backend
- Ensure the frontend URL in environment variables matches exactly
- Check for trailing slashes in URLs

### Database Connection Issues
- Verify your MongoDB Atlas IP whitelist includes Render's IPs
- Check that your database user has the correct permissions
- Ensure the connection string is correct and includes the database name

## Maintenance

- Regularly update dependencies
- Monitor application performance and errors
- Rotate secrets and keys periodically
- Keep deployment documentation up to date
