// Authentication service for AgriMap PH
import { auth, database } from './firebase';
import { 
  signInWithPopup, 
  FacebookAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
}

export class AuthService {
  private static instance: AuthService;
  private facebookProvider: FacebookAuthProvider;
  private googleProvider: GoogleAuthProvider;
  private githubProvider: GithubAuthProvider;

  private constructor() {
    this.facebookProvider = new FacebookAuthProvider();
    this.facebookProvider.addScope('email');
    
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
    
    this.githubProvider = new GithubAuthProvider();
    this.githubProvider.addScope('user:email');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign in with Facebook
  public async signInWithFacebook(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, this.facebookProvider);
      const user = result.user;
      
      // Store user data in Realtime Database
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'facebook'
      };

      await this.saveUserToDatabase(authUser);
      return authUser;
    } catch (error: unknown) {
      console.error('Facebook sign-in error:', error);
      
      // Handle specific error codes
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/operation-not-allowed') {
        throw new Error('Facebook sign-in is not enabled. Please contact support or try another sign-in method.');
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email but different sign-in method.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error('Failed to sign in with Facebook. Please try again or use another sign-in method.');
    }
  }

  // Sign in with Google
  public async signInWithGoogle(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;
      
      // Store user data in Realtime Database
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'google'
      };

      await this.saveUserToDatabase(authUser);
      return authUser;
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      
      // Handle specific error codes
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is not enabled. Please contact support or try another sign-in method.');
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email but different sign-in method.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error('Failed to sign in with Google. Please try again or use another sign-in method.');
    }
  }

  // Sign in with GitHub
  public async signInWithGitHub(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, this.githubProvider);
      const user = result.user;
      
      // Store user data in Realtime Database
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'github'
      };

      await this.saveUserToDatabase(authUser);
      return authUser;
    } catch (error: unknown) {
      console.error('GitHub sign-in error:', error);
      
      // Handle specific error codes
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/operation-not-allowed') {
        throw new Error('GitHub sign-in is not enabled. Please contact support or try another sign-in method.');
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email but different sign-in method.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error('Failed to sign in with GitHub. Please try again or use another sign-in method.');
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  public getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  public onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Determine provider from providerData
        let provider = 'unknown';
        if (user.providerData.length > 0) {
          const providerId = user.providerData[0].providerId;
          switch (providerId) {
            case 'facebook.com':
              provider = 'facebook';
              break;
            case 'google.com':
              provider = 'google';
              break;
            case 'github.com':
              provider = 'github';
              break;
            default:
              provider = providerId;
          }
        }

        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider
        };
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }

  // Check if user can submit a price entry today
  public async canSubmitPriceEntryToday(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const submissionRef = ref(database, `userSubmissions/${userId}/${today}`);
      const snapshot = await get(submissionRef);
      
      // If no submission today, user can submit
      return !snapshot.exists();
    } catch (error) {
      console.error('Error checking daily submission:', error);
      return false;
    }
  }

  // Record a price entry submission for today
  public async recordDailySubmission(userId: string, entryId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const submissionRef = ref(database, `userSubmissions/${userId}/${today}`);
      
      await set(submissionRef, {
        entryId,
        timestamp: new Date().toISOString(),
        submitted: true
      });
    } catch (error) {
      console.error('Error recording daily submission:', error);
      throw new Error('Failed to record submission');
    }
  }

  // Get user's submission history
  public async getUserSubmissionHistory(userId: string): Promise<{ id: string; timestamp: number; product: string; price: number; date: string }[]> {
    try {
      const userSubmissionsRef = ref(database, `userSubmissions/${userId}`);
      const snapshot = await get(userSubmissionsRef);
      
      if (snapshot.exists()) {
        return Object.entries(snapshot.val()).map(([date, data]) => {
          const submissionData = data as { id?: string; timestamp?: number; product?: string; price?: number };
          return {
            id: submissionData.id || '',
            timestamp: submissionData.timestamp || 0,
            product: submissionData.product || '',
            price: submissionData.price || 0,
            date
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching submission history:', error);
      return [];
    }
  }

  // Save user data to database
  private async saveUserToDatabase(user: AuthUser): Promise<void> {
    try {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        ...user,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving user to database:', error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
