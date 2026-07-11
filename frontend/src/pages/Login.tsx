import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/authStores';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const setAuth = useAuthStore((s) => s.setAuth);
	const navigate = useNavigate();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const { token, user } = await login(username, password);
			setAuth(token, user);
			navigate('/dashboard');
		} catch (err) {
			setError('Invalid credentials');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<form
				onSubmit={handleSubmit}
				className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
			>
				<h1 className="text-2xl font-semibold mb-6 text-center">Bandan Studio</h1>

				{error && (
					<div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
						{error}
					</div>
				)}

				<label className="block text-sm font-medium mb-1">Username</label>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="w-full border rounded px-3 py-2 mb-4"
					required
				/>

				<label className="block text-sm font-medium mb-1">Password</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full border rounded px-3 py-2 mb-6"
					required
				/>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? 'Signing in...' : 'Sign In'}
				</button>
			</form>
		</div>
	);
}