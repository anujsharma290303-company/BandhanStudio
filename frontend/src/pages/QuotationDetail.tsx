import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuotation, finalizeQuotation, convertToBill } from '../api/quotation';

export default function QuotationDetail() {
	const { id } = useParams<{ id: string }>();
	const [error, setError] = useState<string | null>(null);
	const [working, setWorking] = useState(false);
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ['quotation', id],
		queryFn: () => getQuotation(id as string),
		enabled: !!id,
	});

	async function handleFinalize() {
		if (!id) return;
		setError(null);
		setWorking(true);
		try {
			await finalizeQuotation(id);
			await queryClient.invalidateQueries({ queryKey: ['quotation', id] });
		} catch {
			setError('Could not finalize this quotation.');
		} finally {
			setWorking(false);
		}
	}

	async function handleConvert() {
		if (!id) return;
		setError(null);
		setWorking(true);
		try {
			await convertToBill(id);
			await queryClient.invalidateQueries({ queryKey: ['quotation', id] });
		} catch {
			setError('Could not convert to a bill.');
		} finally {
			setWorking(false);
		}
	}

	if (isLoading) return <div className="p-8">Loading...</div>;
	if (!data) return <div className="p-8 text-red-600">Quotation not found.</div>;

	const q = data.quotation;

	return (
		<div className="p-8 max-w-2xl mx-auto">
			<Link to="/quotations" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
				&larr; Back to Quotations
			</Link>

			<div className="flex justify-between items-center mb-2">
				<h1 className="text-2xl font-semibold">Quotation</h1>
				<span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-gray-100 text-gray-600">
					{q.status}
				</span>
			</div>

			{q.Client && (
				<p className="text-gray-500 mb-4">For {q.Client.name} — {q.Client.phone}</p>
			)}

			{error && (
				<div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>
			)}

			<div className="bg-white rounded shadow p-4 mb-4">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-gray-500 border-b">
							<th className="pb-2">Item</th>
							<th className="pb-2">Qty</th>
							<th className="pb-2">Rate</th>
							<th className="pb-2">Amount</th>
						</tr>
					</thead>
					<tbody>
						{q.lineItems.map((item, i) => (
							<tr key={i} className="border-b last:border-0">
								<td className="py-2">{item.label}</td>
								<td className="py-2">{item.qty}</td>
								<td className="py-2">₹{item.rate}</td>
								<td className="py-2">₹{item.amount}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="bg-white rounded shadow p-4 mb-6 space-y-1">
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Subtotal</span><span>₹{q.subtotal}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Tax ({q.gstType === 'cgst_sgst' ? 'CGST+SGST' : 'IGST'})</span>
					<span>₹{q.taxAmount}</span>
				</div>
				<div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
					<span>Total</span><span>₹{q.total}</span>
				</div>
			</div>

			<div className="flex gap-3">
				{q.status === 'draft' && (
					<button
						onClick={handleFinalize}
						disabled={working}
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
					>
						Finalize
					</button>
				)}
				{q.status === 'final' && (
					<button
						onClick={handleConvert}
						disabled={working}
						className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
					>
						Convert to Bill
					</button>
				)}
				{q.status === 'converted' && (
					<p className="text-sm text-gray-500">This quotation has been converted to a bill.</p>
				)}
			</div>
		</div>
	);
}