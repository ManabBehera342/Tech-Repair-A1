# Deployment Guide

This guide will help you deploy the Electronics Repair Management System to production using Vercel for the frontend and Render for the backend.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Render Account](https://render.com)
- GitHub repository with your code

## 🎯 Frontend Deployment (Vercel)

### 1. Connect Repository to Vercel

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory

### 2. Configure Build Settings

Vercel will automatically detect it's a Vite project, but verify these settings:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In Vercel project settings, add the following environment variable:

```
VITE_API_URL=https://your-backend-app.onrender.com
```

Replace `your-backend-app` with your actual Render service name.

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## 🚀 Backend Deployment (Render)

### 1. Connect Repository to Render

1. Visit [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the repository with your code

### 2. Configure Service Settings

- **Name**: `electronics-repair-backend` (or your preferred name)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or your preferred plan)

### 3. Set Environment Variables

In Render service settings, add these environment variables:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret
SPREADSHEET_ID=your-google-sheets-id
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
GEMINI_API_KEY=your-gemini-api-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
TEST_EMAIL=test-email@example.com
```

**Important**: Use actual values from your `.env` file, not the placeholder text above.

### 4. Deploy

Click "Create Web Service" and wait for the deployment to complete.

## 🔗 Post-Deployment Setup

### 1. Update CORS Configuration

After your frontend is deployed, update the backend CORS configuration:

1. Open `backend/app.js`
2. Find the `allowedOrigins` array around line 57
3. Replace `'https://your-app.vercel.app'` with your actual Vercel URL
4. Commit and push the changes

### 2. Update Frontend API URL

Make sure your frontend `.env` file has the correct backend URL:
```
VITE_API_URL=https://your-backend-app.onrender.com
```

## 🧪 Testing

1. Visit your Vercel frontend URL
2. Test the following features:
   - User registration/login
   - Service request creation
   - File uploads
   - Chatbot functionality
   - Dashboard features

## 📝 Important Notes

### Database
- Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or add Render's IP ranges
- Consider using MongoDB Atlas for production

### File Storage
- Cloudinary is already configured for file uploads
- No additional configuration needed for production

### Email
- Gmail app passwords are required for email notifications
- See `backend/NOTIFICATION_SETUP.md` for details

### Security
- Never commit real API keys or secrets to your repository
- Use environment variables for all sensitive data
- Keep your `.env` files local only

## 🛠️ Troubleshooting

### Frontend Issues
- Check browser console for API connection errors
- Verify VITE_API_URL is correctly set
- Ensure build completes without errors

### Backend Issues
- Check Render logs for startup errors
- Verify all environment variables are set
- Test health endpoint: `https://your-backend.onrender.com/health`

### CORS Issues
- Ensure your Vercel URL is added to allowedOrigins
- Check that credentials: true is set in CORS options

## 🔄 Redeployment

### Frontend
- Push changes to your repository
- Vercel will automatically redeploy

### Backend
- Push changes to your repository
- Render will automatically redeploy
- Monitor logs during deployment

For additional help, check the logs in your respective platforms or refer to their documentation.