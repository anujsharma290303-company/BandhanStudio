import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import ClientsList from './pages/ClientsList';
import NewClient from './pages/NewClient';
import ClientDetail from './pages/ClientDetail';
import QuotationBuilder from './pages/QuotationBuilder';
import QuotationsList from './pages/QuotationsList';
import QuotationDetail from './pages/QuotationDetail';
const queryClient = new QueryClient();

function Dashboard() {
	return (
		<div className="p-8 max-w-2xl mx-auto">
			<h1 className="text-2xl font-semibold mb-6">Bandan Studio</h1>
			<div className="grid grid-cols-2 gap-4">
				<a
					href="/clients"
					className="bg-white p-6 rounded shadow hover:shadow-md transition"
				>
					<h2 className="font-medium text-lg">Clients</h2>
					<p className="text-sm text-gray-500">View and manage clients</p>
				</a>
				<a
				
					href="/quotations"
					className="bg-white p-6 rounded shadow hover:shadow-md transition"
				>
					<h2 className="font-medium text-lg">Quotations</h2>
					<p className="text-sm text-gray-500">View and create quotations</p>
				</a>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/clients" element={<ClientsList />} />
					<Route path="/clients/new" element={<NewClient />} />
					<Route path="/clients/:id" element={<ClientDetail />} />
					<Route path="/quotations" element={<QuotationsList />} />
					<Route path="/quotations/new" element={<QuotationBuilder />} />
					<Route path="/quotations/:id" element={<QuotationDetail />} />
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	);
}