import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'team_member';

interface AuthUser {
	id: string;
	name: string;
	username: string;
	role: Role;
}

interface AuthState {
	token: string | null;
	user: AuthUser | null;
	setAuth: (token: string, user: AuthUser) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			setAuth: (token, user) => set({ token, user }),
			logout: () => set({ token: null, user: null }),
		}),
		{ name: 'bandan-auth' }
	)
);