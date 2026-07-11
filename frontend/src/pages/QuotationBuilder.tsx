import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listClients } from '../api/clients';
import { listEventPackages, createQuotation } from '../api/quotation';
import type {  GstType } from '../api/quotation';
import { calculateTotals} from '../utils/quotationCalc';
import type { LineItem, DiscountType } from '../utils/quotationCalc';

let rowId = 0;
function newRow(): LineItem & { rowId: number } {
	return { rowId: rowId++, label: '', qty: 1, rate: 0, amount: 0 };
}

export default function QuotationBuilder() {
	const navigate = useNavigate();

	const [clientSearch, setClientSearch] = useState('');
	const [clientId, setClientId] = useState<string | null>(null);
	const [clientName, setClientName] = useState('');

	const [rows, setRows] = useState<(LineItem & { rowId: number })[]>([newRow()]);
	const [discountType, setDiscountType] = useState<DiscountType>('flat');
	const [discountValue, setDiscountValue] = useState(0);
	const [gstType, setGstType] = useState<GstType>('cgst_sgst');
	const [taxRate, setTaxRate] = useState(18);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { data: clientResults } = useQuery({
		queryKey: ['clients', clientSearch],
		queryFn: () => listClients(clientSearch),
		enabled: clientSearch.length > 0 && !clientId,
	});

	const { data: packagesData } = useQuery({
		queryKey: ['event-packages'],
		queryFn: listEventPackages,
	});

	const totals = useMemo(
		() => calculateTotals(rows, discountType, discountValue, taxRate),
		[rows, discountType, discountValue, taxRate]
	);

	function updateRow(rowId: number, field: keyof LineItem, value: string | number) {
		setRows((prev) =>
			prev.map((r) => (r.rowId === rowId ? { ...r, [field]: value } : r))
		);
	}

	function addRow() {
		setRows((prev) => [...prev, newRow()]);
	}

	function removeRow(rowId: number) {
		setRows((prev) => prev.filter((r) => r.rowId !== rowId));
	}

	function applyPackage(packageId: string) {
		const pkg = packagesData?.packages.find((p) => p.id === packageId);
		if (!pkg) return;
		setRows(pkg.lineItems.map((item) => ({ ...item, rowId: rowId++ })));
	}

	async function handleSubmit() {
		setError(null);

		if (!clientId) {
			setError('Please select a client.');
			return;
		}
		if (rows.length === 0 || rows.some((r) => !r.label || r.rate <= 0)) {
			setError('Every line item needs a label and a rate greater than 0.');
			return;
		}

		setSaving(true);
		try {
			const { quotation } = await createQuotation({
				clientId,
				lineItems: rows.map(({ rowId, ...item }) => item),
				discountType,
				discountValue,
				gstType,
				taxRate,
			});
			navigate(`/quotations/${quotation.id}`);
		} catch (err) {
			setError('Failed to create quotation. Please try again.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<h1 className="text-2xl font-semibold mb-6">New Quotation</h1>

			{error && (
				<div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
					{error}
				</div>
			)}

			{/* Client picker */}
			<div className="bg-white p-4 rounded shadow mb-4">
				<label className="block text-sm font-medium mb-1">Client *</label>
				{clientId ? (
					<div className="flex justify-between items-center border rounded px-3 py-2">
						<span>{clientName}</span>
						<button
							type="button"
							onClick={() => { setClientId(null); setClientName(''); setClientSearch(''); }}
							className="text-sm text-blue-600 hover:underline"
						>
							Change
						</button>
					</div>
				) : (
					<>
						<input
							type="text"
							placeholder="Search client by name or phone..."
							value={clientSearch}
							onChange={(e) => setClientSearch(e.target.value)}
							className="w-full border rounded px-3 py-2"
						/>
						{clientResults && clientResults.clients.length > 0 && (
							<div className="border rounded mt-1 divide-y">
								{clientResults.clients.map((c) => (
									<button
										type="button"
										key={c.id}
										onClick={() => { setClientId(c.id); setClientName(c.name); }}
										className="w-full text-left px-3 py-2 hover:bg-gray-50"
									>
										{c.name} — {c.phone}
									</button>
								))}
							</div>
						)}
					</>
				)}
			</div>

			{/* Package picker */}
			<div className="bg-white p-4 rounded shadow mb-4">
				<label className="block text-sm font-medium mb-1">Start from a package (optional)</label>
				<select
					onChange={(e) => e.target.value && applyPackage(e.target.value)}
					className="w-full border rounded px-3 py-2"
					defaultValue=""
				>
					<option value="">— Custom (blank) —</option>
					{packagesData?.packages.map((p) => (
						<option key={p.id} value={p.id}>{p.name}</option>
					))}
				</select>
				<p className="text-xs text-gray-400 mt-1">
					Selecting a package fills the line items below — you can edit or remove anything after.
				</p>
			</div>

			{/* Line items */}
			<div className="bg-white p-4 rounded shadow mb-4">
				<label className="block text-sm font-medium mb-2">Line Items</label>
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-gray-500 border-b">
							<th className="pb-2">Label</th>
							<th className="pb-2 w-20">Qty</th>
							<th className="pb-2 w-28">Rate</th>
							<th className="pb-2 w-28">Amount</th>
							<th className="pb-2 w-10"></th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row.rowId} className="border-b last:border-0">
								<td className="py-2 pr-2">
									<input
										type="text"
										value={row.label}
										onChange={(e) => updateRow(row.rowId, 'label', e.target.value)}
										className="w-full border rounded px-2 py-1"
									/>
								</td>
								<td className="py-2 pr-2">
									<input
										type="number"
										value={row.qty}
										onChange={(e) => updateRow(row.rowId, 'qty', Number(e.target.value))}
										className="w-full border rounded px-2 py-1"
										min={1}
									/>
								</td>
								<td className="py-2 pr-2">
									<input
										type="number"
										value={row.rate}
										onChange={(e) => updateRow(row.rowId, 'rate', Number(e.target.value))}
										className="w-full border rounded px-2 py-1"
										min={0}
									/>
								</td>
								<td className="py-2 pr-2 text-gray-600">
									₹{(row.qty * row.rate).toFixed(2)}
								</td>
								<td className="py-2">
									<button
										type="button"
										onClick={() => removeRow(row.rowId)}
										className="text-red-500 hover:text-red-700"
									>
										✕
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<button
					type="button"
					onClick={addRow}
					className="mt-2 text-sm text-blue-600 hover:underline"
				>
					+ Add line item
				</button>
			</div>

			{/* Discount + GST */}
			<div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium mb-1">Discount</label>
					<div className="flex gap-2">
						<select
							value={discountType}
							onChange={(e) => setDiscountType(e.target.value as DiscountType)}
							className="border rounded px-2 py-2"
						>
							<option value="flat">₹ Flat</option>
							<option value="percent">% Percent</option>
						</select>
						<input
							type="number"
							value={discountValue}
							onChange={(e) => setDiscountValue(Number(e.target.value))}
							className="w-full border rounded px-2 py-2"
							min={0}
						/>
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">GST</label>
					<div className="flex gap-2">
						<select
							value={gstType}
							onChange={(e) => setGstType(e.target.value as GstType)}
							className="border rounded px-2 py-2"
						>
							<option value="cgst_sgst">CGST + SGST</option>
							<option value="igst">IGST</option>
						</select>
						<input
							type="number"
							value={taxRate}
							onChange={(e) => setTaxRate(Number(e.target.value))}
							className="w-full border rounded px-2 py-2"
							min={0}
							max={100}
						/>
						<span className="self-center text-gray-500">%</span>
					</div>
				</div>
			</div>

			{/* Live totals */}
			<div className="bg-white p-4 rounded shadow mb-6 space-y-1">
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Subtotal</span>
					<span>₹{totals.subtotal.toFixed(2)}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">Tax ({gstType === 'cgst_sgst' ? 'CGST+SGST' : 'IGST'})</span>
					<span>₹{totals.taxAmount.toFixed(2)}</span>
				</div>
				<div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
					<span>Total</span>
					<span>₹{totals.total.toFixed(2)}</span>
				</div>
			</div>

			<button
				onClick={handleSubmit}
				disabled={saving}
				className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
			>
				{saving ? 'Creating...' : 'Create Quotation (Draft)'}
			</button>
		</div>
	);
}