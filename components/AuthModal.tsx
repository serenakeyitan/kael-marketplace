'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthView } from '@daveyplate/better-auth-ui';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function AuthModal({ open, onOpenChange, message }: AuthModalProps) {
  const { isAuthenticated } = useAuth();
  const [authPath, setAuthPath] = useState('sign-in');

  // Close modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && open) {
      onOpenChange(false);
    }
  }, [isAuthenticated, open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            {message || 'You need to be signed in to use this feature'}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <AuthView path={authPath} />
          <div className="mt-4 text-center text-sm text-gray-600">
            {authPath === 'sign-in' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthPath('sign-up')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthPath('sign-in')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}