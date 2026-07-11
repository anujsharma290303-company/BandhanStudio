export type DiscountType = 'flat' | 'percent';

export interface LineItem {
	label: string;
	qty: number;
	rate: number;
	amount: number;
}

export function calculateTotals(
	lineItems: LineItem[],
	discountType: DiscountType,
	discountValue: number,
	taxRate: number
) {
	// Recompute each line's amount live from qty * rate — never trust stale amount
	const recalculated = lineItems.map((item) => ({
		...item,
		amount: item.qty * item.rate,
	}));

	const subtotal = recalculated.reduce((sum, item) => sum + item.amount, 0);

	const discount =
		discountType === 'flat' ? discountValue : subtotal * (discountValue / 100);

	const afterDiscount = subtotal - discount;
	const taxAmount = afterDiscount * (taxRate / 100);
	const total = afterDiscount + taxAmount;

	return {
		lineItems: recalculated,
		subtotal: Number(subtotal.toFixed(2)),
		taxAmount: Number(taxAmount.toFixed(2)),
		total: Number(total.toFixed(2)),
	};
}