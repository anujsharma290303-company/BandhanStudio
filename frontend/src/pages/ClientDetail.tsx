import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getClient, updateClient, deleteClient } from '../api/clients';
import ClientForm from '../components/ClientForm';
import type {ClientFormValues} from '../components/ClientForm';
export default function ClientDetail() {
	const { id } = useParams<{ id: string }>();
	const [editing, setEditing] = useState(false);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery({
		queryKey: ['client', id],
		queryFn: () => getClient(id as string),
		enabled: !!id,
	});

	async function handleUpdate(values: ClientFormValues) {
		if (!id) return;
		await updateClient(id, values);
		await queryClient.invalidateQueries({ queryKey: ['client', id] });
		setEditing(false);
	}

	async function handleDelete() {
		if (!id) return;
		if (!confirm('Delete this client? This cannot be undone.')) return;
		try {
			await deleteClient(id);
			navigate('/clients');
		} catch (err) {
			alert('Could not delete client — they may have existing quotations or bills.');
		}
	}

	if (isLoading) return <div className="p-8">Loading...</div>;
	if (error || !data) return <div className="p-8 text-red-600">Client not found.</div>;

	const client = data.client;

	return (
		<div className="p-8 max-w-md mx-auto">
			<div className="flex justify-between items-center mb-6">
                <Link to="/clients" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
	&larr; Back to Clients
</Link>
				<h1 className="text-2xl font-semibold">{client.name}</h1>
				{!editing && (
					<div className="flex gap-2">
						<button
							onClick={() => setEditing(true)}
							className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
						>
							Edit
						</button>
						<button
							onClick={handleDelete}
							className="text-sm border border-red-300 text-red-600 px-3 py-1 rounded hover:bg-red-50"
						>
							Delete
						</button>
					</div>
				)}
			</div>

			{editing ? (
	<div>
		<ClientForm
			initialValues={{
				name: client.name,
				phone: client.phone,
				email: client.email ?? '',
				address: client.address ?? '',
			}}
			onSubmit={handleUpdate}
			submitLabel="Save Changes"
		/>
		<button
			onClick={() => setEditing(false)}
			className="mt-3 text-sm text-gray-500 hover:underline"
		>
			Cancel
		</button>
	</div>
) :  (
				<div className="bg-white p-6 rounded shadow space-y-2">
					<p><span className="text-gray-500">Phone:</span> {client.phone}</p>
					<p><span className="text-gray-500">Email:</span> {client.email || '—'}</p>
					<p><span className="text-gray-500">Address:</span> {client.address || '—'}</p>
					<p className="text-sm text-gray-400 pt-2">
						Added {new Date(client.createdAt).toLocaleDateString()}
					</p>
				</div>
			)}
		</div>
	);
}