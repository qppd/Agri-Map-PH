'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, AuthUser } from '@/lib/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithFacebook: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  canSubmitToday: boolean;
  checkCanSubmitToday: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [canSubmitToday, setCanSubmitToday] = useState(false);

  const checkCanSubmitToday = useCallback(async () => {
    if (user) {
      try {
        const canSubmit = await authService.canSubmitPriceEntryToday(user.uid);
        setCanSubmitToday(canSubmit);
      } catch (error) {
        console.error('Error checking daily submission:', error);
        setCanSubmitToday(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
      if (authUser) {
        checkCanSubmitToday();
      } else {
        setCanSubmitToday(false);
      }
    });

    return unsubscribe;
  }, [checkCanSubmitToday]);

  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      await authService.signInWithFacebook();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    try {
      setLoading(true);
      await authService.signInWithGitHub();
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCanSubmitToday(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithFacebook,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    canSubmitToday,
    checkCanSubmitToday,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
