import { useNavigate } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import type {ClientFormValues} from '../components/ClientForm';
import { createClient } from '../api/clients';

export default function NewClient() {
	const navigate = useNavigate();

	async function handleSubmit(values: ClientFormValues) {
		const { client } = await createClient(values);
		navigate(`/clients/${client.id}`);
	}

	return (
		<div className="p-8 max-w-md mx-auto">
			<h1 className="text-2xl font-semibold mb-6">New Client</h1>
			<ClientForm onSubmit={handleSubmit} submitLabel="Create Client" />
		</div>
	);
}