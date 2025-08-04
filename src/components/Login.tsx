'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Facebook, Loader2, AlertCircle, Chrome, Github } from 'lucide-react';

interface LoginProps {
  onClose?: () => void;
}

export default function Login({ onClose }: LoginProps) {
  const { signInWithFacebook, signInWithGoogle, signInWithGitHub } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFacebookLogin = async () => {
    setLoadingProvider('facebook');
    setError(null);
    
    try {
      await signInWithFacebook();
      onClose?.();
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Facebook. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingProvider('google');
    setError(null);
    
    try {
      await signInWithGoogle();
      onClose?.();
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGitHubLogin = async () => {
    setLoadingProvider('github');
    setError(null);
    
    try {
      await signInWithGitHub();
      onClose?.();
    } catch (error) {
      console.error('GitHub login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with GitHub. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <LogIn className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Welcome to AgriMap PH</h2>
        <p className="text-gray-600 mt-2">
          Sign in to contribute price data and help the agricultural community
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loadingProvider !== null}
          className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Chrome className="h-5 w-5 mr-2 text-blue-500" />
          )}
          {loadingProvider === 'google' ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* GitHub Login Button */}
        <button
          onClick={handleGitHubLogin}
          disabled={loadingProvider !== null}
          className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loadingProvider === 'github' ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Github className="h-5 w-5 mr-2" />
          )}
          {loadingProvider === 'github' ? 'Signing in...' : 'Continue with GitHub'}
        </button>

        {/* Facebook Login Button */}
        <button
          onClick={handleFacebookLogin}
          disabled={loadingProvider !== null}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loadingProvider === 'facebook' ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Facebook className="h-5 w-5 mr-2" />
          )}
          {loadingProvider === 'facebook' ? 'Signing in...' : 'Continue with Facebook'}
        </button>

        {/* Setup Notice */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> If a sign-in method shows "not enabled" error, you need to enable it in your Firebase Console. 
            See <code>OAUTH_SETUP_GUIDE.md</code> for instructions.
          </p>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          By signing in, you agree to help build a transparent agricultural price database for the Philippines.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <h3 className="font-medium text-green-800 mb-2">Why sign in?</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Contribute one verified price entry per day</li>
          <li>• Help prevent spam and duplicate data</li>
          <li>• Build trust in the agricultural community</li>
          <li>• Access personalized recommendations</li>
        </ul>
      </div>
    </div>
  );
}
