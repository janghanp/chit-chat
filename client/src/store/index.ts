import { create } from 'zustand';

import { User } from '../types';

interface UserStore {
	currentUser: User | null;
	setCurrentUser: (currentUser: User) => void;
}

export const useUserStore = create<UserStore>()((set) => ({
	currentUser: null,
	setCurrentUser: (currentUser: User) => set({ currentUser }),
}));
