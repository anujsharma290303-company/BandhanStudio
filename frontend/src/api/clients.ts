import apiClient from './client';

export interface Client {
	id: string;
	name: string;
	phone: string;
	email: string | null;
	address: string | null;
	createdAt: string;
}

export async function listClients(search?: string): Promise<{ clients: Client[] }> {
	const res = await apiClient.get('/clients', { params: search ? { search } : {} });
	return res.data;
}

export async function createClient(data: {
	name: string;
	phone: string;
	email?: string;
	address?: string;
}): Promise<{ client: Client }> {
	const res = await apiClient.post('/clients', data);
	return res.data;
}

export async function getClient(id: string): Promise<{ client: Client }> {
	const res = await apiClient.get(`/clients/${id}`);
	return res.data;
}

export async function updateClient(
	id: string,
	data: Partial<{ name: string; phone: string; email: string; address: string }>
): Promise<{ client: Client }> {
	const res = await apiClient.put(`/clients/${id}`, data);
	return res.data;
}

export async function deleteClient(id: string): Promise<void> {
	await apiClient.delete(`/clients/${id}`);
}