import { describe, it, expect } from 'vitest';
import { calculateTotals } from './quotationCalc';

describe('calculateTotals', () => {
	it('sums line item amounts into subtotal', () => {
		const result = calculateTotals(
			[{ label: 'A', qty: 1, rate: 100, amount: 100 }, { label: 'B', qty: 1, rate: 50, amount: 50 }],
			'flat', 0, 0
		);
		expect(result.subtotal).toBe(150);
	});

	it('applies percent discount before tax', () => {
		const result = calculateTotals(
			[{ label: 'A', qty: 1, rate: 1000, amount: 1000 }],
			'percent', 10, 18
		);
		expect(result.total).toBe(1062);
	});

	it('recalculates amount as qty * rate for each line item', () => {
		const result = calculateTotals(
			[{ label: 'A', qty: 3, rate: 200, amount: 999 }], // amount deliberately wrong
			'flat', 0, 0
		);
		expect(result.subtotal).toBe(600); // 3 * 200, ignoring the stale 999
	});
});