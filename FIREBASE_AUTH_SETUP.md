# Firebase Authentication Setup for AgriMap PH

This guide will help you set up Facebook OAuth authentication for your AgriMap PH application.

## Prerequisites

1. Firebase Project (already set up)
2. Facebook Developer Account
3. Your application domain/URL

## Step 1: Set up Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "Facebook Login" product to your app
4. In Facebook Login settings:
   - Add your domain to "Valid OAuth Redirect URIs"
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
   - Add Firebase Auth domain: `your-project-id.firebaseapp.com`

## Step 2: Configure Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication > Sign-in method
4. Enable Facebook provider
5. Add your Facebook App ID and App Secret from Facebook Developer Console
6. Copy the OAuth redirect URI and add it to your Facebook app settings

## Step 3: Update Firebase Security Rules

Update your Realtime Database rules to require authentication:

```json
{
  "rules": {
    "priceEntries": {
      ".read": true,
      ".write": "auth != null",
      "$entryId": {
        ".validate": "newData.hasChildren(['userId', 'userType', 'product', 'price', 'location', 'timestamp']) && newData.child('userId').val() == auth.uid"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "userSubmissions": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

## Step 4: Test Authentication

1. Run your development server: `npm run dev`
2. Click "Sign In" button
3. Test Facebook login flow
4. Verify user data is saved to Firebase
5. Test daily submission limits

## Features Implemented

- ✅ Facebook OAuth authentication
- ✅ One price entry per user per day limit
- ✅ User profile management
- ✅ Secure data submission with user ID tracking
- ✅ Real-time authentication state management
- ✅ User submission history

## Security Notes

- Users must be authenticated to submit price entries
- Each user can only submit one price entry per day
- User ID is automatically attached to all submissions
- Database rules prevent unauthorized access
- User submission history is private to each user

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
