import apiClient from './client';
import type { LineItem, DiscountType } from '../utils/quotationCalc';

export type GstType = 'cgst_sgst' | 'igst';
export type QuotationStatus = 'draft' | 'final' | 'converted';

export interface Quotation {
	id: string;
	clientId: string;
	Client?: { id: string; name: string; phone: string };
	lineItems: LineItem[];
	discountType: DiscountType;
	discountValue: number;
	gstType: GstType;
	taxRate: number;
	subtotal: number;
	taxAmount: number;
	total: number;
	status: QuotationStatus;
	createdAt: string;
}

export interface EventPackage {
	id: string;
	name: string;
	description: string | null;
	lineItems: LineItem[];
}

export async function listEventPackages(): Promise<{ packages: EventPackage[] }> {
	const res = await apiClient.get('/event-packages');
	return res.data;
}

export async function createQuotation(data: {
	clientId: string;
	lineItems: LineItem[];
	discountType: DiscountType;
	discountValue: number;
	gstType: GstType;
	taxRate: number;
}): Promise<{ quotation: Quotation }> {
	const res = await apiClient.post('/quotations', data);
	return res.data;
}

export async function getQuotation(id: string): Promise<{ quotation: Quotation }> {
	const res = await apiClient.get(`/quotations/${id}`);
	return res.data;
}

export async function updateQuotation(
	id: string,
	data: Partial<{
		lineItems: LineItem[];
		discountType: DiscountType;
		discountValue: number;
		gstType: GstType;
		taxRate: number;
	}>
): Promise<{ quotation: Quotation }> {
	const res = await apiClient.put(`/quotations/${id}`, data);
	return res.data;
}

export async function finalizeQuotation(id: string): Promise<{ quotation: Quotation }> {
	const res = await apiClient.post(`/quotations/${id}/finalize`);
	return res.data;
}

export async function convertToBill(id: string): Promise<{ bill: any }> {
	const res = await apiClient.post(`/quotations/${id}/convert-to-bill`);
	return res.data;
}