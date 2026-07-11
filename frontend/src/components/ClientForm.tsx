import { useState } from 'react';

export interface ClientFormValues {
	name: string;
	phone: string;
	email: string;
	address: string;
}

interface Props {
	initialValues?: ClientFormValues;
	onSubmit: (values: ClientFormValues) => Promise<void>;
	submitLabel: string;
}

export default function ClientForm({ initialValues, onSubmit, submitLabel }: Props) {
	const [values, setValues] = useState<ClientFormValues>(
		initialValues ?? { name: '', phone: '', email: '', address: '' }
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function update<K extends keyof ClientFormValues>(key: K, value: string) {
		setValues((v) => ({ ...v, [key]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onSubmit(values);
		} catch (err) {
			setError('Something went wrong. Please check the fields and try again.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md">
			{error && (
				<div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
					{error}
				</div>
			)}

			<label className="block text-sm font-medium mb-1">Name *</label>
			<input
				type="text"
				value={values.name}
				onChange={(e) => update('name', e.target.value)}
				className="w-full border rounded px-3 py-2 mb-4"
				required
			/>

			<label className="block text-sm font-medium mb-1">Phone *</label>
			<input
				type="text"
				value={values.phone}
				onChange={(e) => update('phone', e.target.value)}
				className="w-full border rounded px-3 py-2 mb-4"
				required
			/>

			<label className="block text-sm font-medium mb-1">Email</label>
			<input
				type="email"
				value={values.email}
				onChange={(e) => update('email', e.target.value)}
				className="w-full border rounded px-3 py-2 mb-4"
			/>

			<label className="block text-sm font-medium mb-1">Address</label>
			<textarea
				value={values.address}
				onChange={(e) => update('address', e.target.value)}
				className="w-full border rounded px-3 py-2 mb-6"
				rows={3}
			/>

			<button
				type="submit"
				disabled={saving}
				className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
			>
				{saving ? 'Saving...' : submitLabel}
			</button>
		</form>
	);
}