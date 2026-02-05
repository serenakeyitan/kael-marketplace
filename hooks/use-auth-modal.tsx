'use client';

import { create } from 'zustand';

interface AuthModalStore {
  isOpen: boolean;
  message?: string;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  message: undefined,
  openAuthModal: (message) => set({ isOpen: true, message }),
  closeAuthModal: () => set({ isOpen: false, message: undefined }),
}));