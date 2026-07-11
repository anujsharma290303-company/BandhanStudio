import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { Quotation } from '../api/quotation';

async function listQuotations(): Promise<{ quotations: Quotation[] }> {
	const res = await apiClient.get('/quotations');
	return res.data;
}

export default function QuotationsList() {
	const { data, isLoading } = useQuery({
		queryKey: ['quotations'],
		queryFn: listQuotations,
	});

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold">Quotations</h1>
				<Link
					to="/quotations/new"
					className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
				>
					+ New Quotation
				</Link>
			</div>

			{isLoading && <p className="text-gray-500">Loading...</p>}

			{data && (
				<div className="bg-white rounded shadow divide-y">
					{data.quotations.length === 0 && (
						<p className="p-4 text-gray-500">No quotations yet.</p>
					)}
					{data.quotations.map((q) => (
						<Link
							key={q.id}
							to={`/quotations/${q.id}`}
							className="flex justify-between items-center p-4 hover:bg-gray-50"
						>
							<div>
								<p className="font-medium">{q.Client?.name ?? 'Unknown client'}</p>
								<p className="text-sm text-gray-500">
									₹{q.total} · {new Date(q.createdAt).toLocaleDateString()}
								</p>
							</div>
							<span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-gray-100 text-gray-600">
								{q.status}
							</span>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}