'use client';

import { AuthModal } from '@/components/AuthModal';
import { useAuthModal } from '@/hooks/use-auth-modal';

export function AuthModalProvider() {
  const { isOpen, message, closeAuthModal } = useAuthModal();

  return (
    <AuthModal
      open={isOpen}
      onOpenChange={(open) => !open && closeAuthModal()}
      message={message}
    />
  );
}