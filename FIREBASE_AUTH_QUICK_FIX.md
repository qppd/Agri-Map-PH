# 🔧 Firebase Authentication Setup - Quick Fix Guide

## The Issue: `auth/operation-not-allowed`

You're seeing this error because **Google authentication is not enabled** in your Firebase Console. This is a simple configuration issue that can be fixed in a few steps.

## ✅ Quick Fix Steps

### Step 1: Enable Google Authentication

1. **Go to Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. **Select your project**: Choose your AgriMap PH project
3. **Navigate to Authentication**: 
   - Click "Authentication" in the left sidebar
   - Click "Sign-in method" tab
4. **Enable Google Provider**:
   - Find "Google" in the list of providers
   - Click on "Google"
   - Toggle the "Enable" switch to **ON**
   - Set your **project's public-facing name**: "AgriMap PH"
   - Choose your **support email** from the dropdown
   - Click **"Save"**

### Step 2: Enable GitHub Authentication (Optional)

1. **In the same Sign-in method tab**:
   - Find "GitHub" in the list of providers
   - Click on "GitHub"
   - Toggle the "Enable" switch to **ON**
   
2. **Create GitHub OAuth App** (if you haven't already):
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in:
     - **Application name**: AgriMap PH
     - **Homepage URL**: `http://localhost:3000` (for development)
     - **Authorization callback URL**: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
   - Click "Register application"
   - Copy the **Client ID** and generate a **Client Secret**

3. **Back in Firebase**:
   - Paste the **Client ID** and **Client Secret** from GitHub
   - Click **"Save"**

### Step 3: Verify Configuration

1. **Check your Firebase project settings**:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Make sure your web app is configured with the correct domain

2. **Test the authentication**:
   - Refresh your AgriMap PH application
   - Try signing in with Google - it should now work!

## 🎯 Expected Results

After enabling Google authentication:
- ✅ Google sign-in button will work properly
- ✅ Users can sign in with their Google accounts
- ✅ No more `auth/operation-not-allowed` errors

## 📝 Additional Notes

### Development vs Production URLs

**For Development** (localhost):
- Firebase automatically allows `localhost` domains
- No additional configuration needed

**For Production**:
- Add your production domain to Firebase **Authorized domains**
- Go to Authentication > Sign-in method > Authorized domains
- Add your production URL (e.g., `yourdomain.com`)

### Troubleshooting Common Issues

1. **"This app isn't verified" warning (Google)**:
   - This is normal for development
   - Users can click "Advanced" → "Go to AgriMap PH (unsafe)"
   - For production, submit your app for Google verification

2. **GitHub OAuth not working**:
   - Double-check the callback URL matches exactly: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
   - Ensure Client Secret is correctly copied (no extra spaces)

3. **Still getting errors**:
   - Clear browser cache and cookies
   - Try in an incognito/private window
   - Check browser console for additional error details

## 🚀 Testing Your Setup

Once you've enabled the providers, test each one:

1. **Google**: Should show Google's OAuth consent screen
2. **GitHub**: Should redirect to GitHub for authorization
3. **Facebook**: Should work as before (if already configured)

## 📞 Need Help?

If you're still experiencing issues:
1. Check the Firebase Console for any error messages
2. Verify your project ID matches in the callback URLs
3. Ensure you're using the correct Firebase configuration in your `.env.local` file
4. Try testing with a different browser or incognito mode

The authentication system is fully implemented and ready to work once the Firebase providers are enabled! 🎉
