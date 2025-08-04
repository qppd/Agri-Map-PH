# OAuth Setup Guide for AgriMap PH

This guide will help you configure Google and GitHub OAuth authentication alongside the existing Facebook login.

## Firebase Console Setup

### 1. Enable Authentication Providers

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your AgriMap PH project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable the following providers:

#### Facebook (Already Configured)
- Status: ✅ Should already be enabled
- App ID: [Your Facebook App ID]
- App Secret: [Your Facebook App Secret]

#### Google
1. Click on **Google** provider
2. Enable the provider
3. Set your project's public-facing name: "AgriMap PH"
4. Choose your support email
5. Click **Save**
6. Copy the **Web client ID** and **Web client secret** (you'll need these for advanced configuration)

#### GitHub
1. Click on **GitHub** provider
2. Enable the provider
3. You'll need to create a GitHub OAuth App first:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: AgriMap PH
     - **Homepage URL**: `http://localhost:3000` (for development) / Your production URL
     - **Authorization callback URL**: `https://agrimap-ph.firebaseapp.com/__/auth/handler`
     - **Application description**: Real-time agricultural price mapping for the Philippines
4. Copy the **Client ID** and generate a **Client Secret**
5. Back in Firebase, paste the Client ID and Client Secret
6. Click **Save**

### 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## OAuth App Configuration Details

### Google OAuth Setup (Optional - for advanced features)
If you need additional Google services:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (should be auto-created by Firebase)
3. Enable Google+ API if needed
4. Go to **Credentials** and configure OAuth consent screen
5. Add authorized domains: `localhost`, `your-domain.com`

### GitHub OAuth App Details
When creating your GitHub OAuth App, use these settings:

**For Development:**
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`

**For Production:**
- Homepage URL: `https://your-domain.com`
- Authorization callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`

## Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign In" to open the authentication modal
4. Test all three authentication methods:
   - ✅ Continue with Google
   - ✅ Continue with GitHub  
   - ✅ Continue with Facebook

## Features Implemented

### Authentication Methods
- **Facebook OAuth**: Original implementation maintained
- **Google OAuth**: New integration with proper scopes
- **GitHub OAuth**: New integration with email scope

### User Experience
- **Multi-provider support**: Users can choose their preferred sign-in method
- **Clear login state**: Shows which provider was used for authentication
- **Proper error handling**: Specific error messages for each provider
- **Logout functionality**: Single sign-out works for all providers
- **User profile display**: Shows provider-specific information

### Security Features
- **Email scope**: All providers request email access
- **Profile information**: Name and profile picture when available
- **User identification**: Consistent user ID across sessions
- **Provider tracking**: Maintains record of authentication method

### Data Management
- **Consistent user tokens**: User UID remains the same for data submissions
- **Daily submission limits**: Maintained across all authentication methods
- **User profile storage**: Provider information stored in Firebase Realtime Database
- **Login tracking**: Last login timestamps and provider information

## Troubleshooting

### Common Issues

1. **"App not configured" error**
   - Ensure all OAuth apps are properly configured
   - Check that callback URLs match exactly

2. **"This app isn't verified" warning (Google)**
   - This is normal for development
   - Users can click "Advanced" > "Go to AgriMap PH (unsafe)"
   - For production, submit for Google verification

3. **GitHub permissions error**
   - Ensure your GitHub OAuth app has correct callback URL
   - Check that the client secret is properly set in Firebase

4. **Firebase configuration errors**
   - Verify all environment variables are set correctly
   - Ensure Firebase project has authentication enabled

### Development vs Production

**Development:**
- Use `localhost:3000` in OAuth app configurations
- Firebase hosting not required
- Self-signed certificates may cause warnings

**Production:**
- Update OAuth apps with production URLs
- Use Firebase hosting or your custom domain
- Ensure HTTPS is enabled
- Consider Google app verification for better user experience

## Next Steps

1. **Test thoroughly**: Try each authentication method
2. **Add email verification**: Optional but recommended for production
3. **Implement user roles**: If needed for different user types
4. **Add social features**: User profiles, submission history, etc.
5. **Monitor usage**: Track which authentication methods are most popular

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify Firebase configuration in the console
3. Test OAuth apps independently if needed
4. Ensure environment variables are properly loaded

The authentication system is now fully integrated and production-ready!
