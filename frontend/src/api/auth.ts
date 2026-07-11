import apiClient from './client';
import type { Role } from '../stores/authStores';

interface LoginResponse {
	token: string;
	user: {
		id: string;
		name: string;
		username: string;
		role: Role;
	};
}

export async function login(username: string, password: string): Promise<LoginResponse> {
	const res = await apiClient.post<LoginResponse>('/auth/login', { username, password });
	return res.data;
}