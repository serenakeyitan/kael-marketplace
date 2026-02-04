'use client';

import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth-client';

export function useAuthSync() {
  const { data: session } = authClient.useSession();
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      // Only sync if we have a session and haven't synced this user yet
      if (session?.user && session.user.id !== lastSyncedUserId.current) {
        try {
          const response = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
              // If Better Auth provides username, use it
              username: (session.user as any).username,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('User synced to Supabase:', data);
            lastSyncedUserId.current = session.user.id;
          } else {
            console.error('Failed to sync user to Supabase');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    syncUser();
  }, [session?.user]);

  return session;
}