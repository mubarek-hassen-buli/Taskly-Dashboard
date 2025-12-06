import React, { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface InvitePageProps {
  invitationId: string;
  onComplete: () => void;
}

const InvitePage: React.FC<InvitePageProps> = ({ invitationId, onComplete }) => {
  const acceptInvitation = useMutation(api.invitations.accept);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAcceptInvitation = async () => {
      if (!invitationId) {
        setStatus('error');
        setErrorMessage('Invalid invitation link');
        return;
      }

      try {
        const result = await acceptInvitation({ invitationId: invitationId as any });
        console.log('Invitation accepted, result:', result);
        setStatus('success');
        
        // Redirect to dashboard with team ID
        setTimeout(() => {
          window.location.href = `/?switchingToTeam=${result.teamId}`;
        }, 2000);
      } catch (error: any) {
        console.error('Error accepting invitation:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to accept invitation');
      }
    };

    handleAcceptInvitation();
  }, [invitationId, acceptInvitation, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Loader size={48} className="text-purple-600 dark:text-purple-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Accepting Invitation...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we add you to the team
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to the Team!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You've successfully joined the team
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader size={16} className="animate-spin" />
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-block p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <XCircle size={48} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
