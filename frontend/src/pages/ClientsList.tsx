import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listClients } from '../api/clients';

export default function ClientsList() {
	const [search, setSearch] = useState('');

	const { data, isLoading, error } = useQuery({
		queryKey: ['clients', search],
		queryFn: () => listClients(search),
	});

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold">Clients</h1>
				<Link
					to="/clients/new"
					className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
				>
					+ New Client
				</Link>
			</div>

			<input
				type="text"
				placeholder="Search by name, phone, or email..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="w-full border rounded px-3 py-2 mb-4"
			/>

			{isLoading && <p className="text-gray-500">Loading...</p>}
			{error && <p className="text-red-600">Failed to load clients.</p>}

			{data && (
				<div className="bg-white rounded shadow divide-y">
					{data.clients.length === 0 && (
						<p className="p-4 text-gray-500">No clients found.</p>
					)}
					{data.clients.map((client) => (
						<Link
							key={client.id}
							to={`/clients/${client.id}`}
							className="flex justify-between items-center p-4 hover:bg-gray-50"
						>
							<div>
								<p className="font-medium">{client.name}</p>
								<p className="text-sm text-gray-500">{client.phone}</p>
							</div>
							{client.email && (
								<p className="text-sm text-gray-500">{client.email}</p>
							)}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}