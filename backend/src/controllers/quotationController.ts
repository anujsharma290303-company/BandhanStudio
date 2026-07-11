import { Request, Response } from 'express';
import Quotation, { LineItem, DiscountType, GstType } from '../models/Quotation';
import Bill from '../models/Bill';
import Client from '../models/Client';
import { calculateQuotationTotals } from '../utils/qutationCalc';

function getQuotationId(req: Request): string | undefined {
	return typeof req.params.id === 'string' ? req.params.id : undefined;
}

export async function listQuotations(req: Request, res: Response) {
	try {
		const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
		const where = clientId ? { clientId } : {};
		const quotations = await Quotation.findAll({
			where,
			include: [{ model: Client, attributes: ['id', 'name', 'phone'] }],
			order: [['createdAt', 'DESC']],
		});
		return res.json({ quotations });
	} catch {
		return res.status(500).json({ error: 'Failed to fetch quotations' });
	}
}

export async function getQuotation(req: Request, res: Response) {
	const id = getQuotationId(req);
	if (!id) return res.status(400).json({ error: 'Invalid quotation id' });

	try {
		const quotation = await Quotation.findByPk(id, {
			include: [{ model: Client, attributes: ['id', 'name', 'phone'] }],
		});
		if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
		return res.json({ quotation });
	} catch {
		return res.status(500).json({ error: 'Failed to fetch quotation' });
	}
}

export async function createQuotation(req: Request, res: Response) {
	const {
		clientId,
		lineItems,
		discountType,
		discountValue,
		gstType,
		taxRate,
	}: {
		clientId: string;
		lineItems: LineItem[];
		discountType?: DiscountType;
		discountValue?: number;
		gstType?: GstType;
		taxRate?: number;
	} = req.body;

	if (!clientId || !Array.isArray(lineItems) || lineItems.length === 0) {
		return res.status(400).json({ error: 'clientId and at least one line item are required' });
	}

	try {
		const totals = calculateQuotationTotals(
			lineItems,
			discountType || 'flat',
			discountValue || 0,
			taxRate || 0
		);

		const quotation = await Quotation.create({
			clientId,
			lineItems,
			discountType: discountType || 'flat',
			discountValue: discountValue || 0,
			gstType: gstType || 'cgst_sgst',
			taxRate: taxRate || 0,
			...totals,
			status: 'draft',
		});

		return res.status(201).json({ quotation });
	} catch {
		return res.status(500).json({ error: 'Failed to create quotation' });
	}
}

export async function updateQuotation(req: Request, res: Response) {
	const id = getQuotationId(req);
	if (!id) return res.status(400).json({ error: 'Invalid quotation id' });

	try {
		const quotation = await Quotation.findByPk(id);
		if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

		if (quotation.status !== 'draft') {
			return res.status(409).json({ error: 'Only draft quotations can be edited' });
		}

		const { lineItems, discountType, discountValue, gstType, taxRate } = req.body;

		const newLineItems = lineItems ?? quotation.lineItems;
		const newDiscountType = discountType ?? quotation.discountType;
		const newDiscountValue = discountValue ?? quotation.discountValue;
		const newTaxRate = taxRate ?? quotation.taxRate;

		const totals = calculateQuotationTotals(newLineItems, newDiscountType, newDiscountValue, newTaxRate);

		await quotation.update({
			lineItems: newLineItems,
			discountType: newDiscountType,
			discountValue: newDiscountValue,
			gstType: gstType ?? quotation.gstType,
			taxRate: newTaxRate,
			...totals,
		});

		return res.json({ quotation });
	} catch {
		return res.status(500).json({ error: 'Failed to update quotation' });
	}
}

export async function finalizeQuotation(req: Request, res: Response) {
	const id = getQuotationId(req);
	if (!id) return res.status(400).json({ error: 'Invalid quotation id' });

	try {
		const quotation = await Quotation.findByPk(id);
		if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

		if (quotation.status !== 'draft') {
			return res.status(409).json({ error: 'Only draft quotations can be finalized' });
		}

		await quotation.update({ status: 'final' });
		return res.json({ quotation });
	} catch {
		return res.status(500).json({ error: 'Failed to finalize quotation' });
	}
}

export async function convertToBill(req: Request, res: Response) {
	const id = getQuotationId(req);
	if (!id) return res.status(400).json({ error: 'Invalid quotation id' });

	try {
		const quotation = await Quotation.findByPk(id);
		if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

		if (quotation.status !== 'final') {
			return res.status(409).json({ error: 'Only finalized quotations can be converted to a bill' });
		}

		const bill = await Bill.create({
			quotationId: quotation.id,
			clientId: quotation.clientId,
			amount: quotation.total,
			status: 'unpaid',
		});

		await quotation.update({ status: 'converted' });

		return res.status(201).json({ bill });
	} catch {
		return res.status(500).json({ error: 'Failed to convert quotation to bill' });
	}
}