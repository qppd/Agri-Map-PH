'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/authService';
import { User, LogOut, Calendar, CheckCircle, XCircle, Loader2, Facebook, Chrome, Github } from 'lucide-react';

export default function UserProfile() {
  const { user, signOut, canSubmitToday, checkCanSubmitToday } = useAuth();
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubmissionHistory();
    }
  }, [user]);

  const loadSubmissionHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const history = await authService.getUserSubmissionHistory(user.uid);
      setSubmissionHistory(history.slice(-7)); // Last 7 days
    } catch (error) {
      console.error('Error loading submission history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  // Get provider icon
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'google':
        return <Chrome className="h-4 w-4 text-blue-500" />;
      case 'github':
        return <Github className="h-4 w-4 text-gray-800" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return 'Facebook';
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return provider;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800">
              {user.displayName || 'User'}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-1 mt-1">
              {getProviderIcon(user.provider)}
              <span className="text-xs text-gray-500">
                Signed in with {getProviderName(user.provider)}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Daily Submission Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-800">Today's Submission</span>
          </div>
          <div className="flex items-center space-x-2">
            {canSubmitToday ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">Available</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-600 font-medium">Used</span>
              </>
            )}
          </div>
        </div>
        
        {!canSubmitToday && (
          <p className="text-sm text-gray-600 mt-2">
            You've already submitted a price entry today. Come back tomorrow to contribute again!
          </p>
        )}
      </div>

      {/* Submission History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-800">Recent Activity</h4>
          <button
            onClick={() => {
              checkCanSubmitToday();
              loadSubmissionHistory();
            }}
            disabled={isLoading}
            className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>
        
        {submissionHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No submissions yet</p>
            <p className="text-sm">Start contributing to build our database!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {submissionHistory.map((submission) => (
              <div 
                key={submission.date} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {submission.date === today ? 'Today' : submission.date}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(submission.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Help us build the most comprehensive agricultural price database in the Philippines
        </p>
      </div>
    </div>
  );
}
