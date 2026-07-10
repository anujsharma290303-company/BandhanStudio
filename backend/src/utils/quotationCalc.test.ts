import request from 'supertest';
import express from 'express';
import sequelize from '../config/database';
import Client from '../models/Client';
import Quotation from '../models/Quotation';
import Bill from '../models/Bill';
import quotationRoutes from '../routes/quotationRoutes';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { jest } from '@jest/globals';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

jest.setTimeout(30000);

const app = express();
app.use(express.json());
app.use('/api/quotations', quotationRoutes);

function adminToken() {
	return jwt.sign({ id: 'admin-id', username: 'admin', role: 'admin' }, process.env.JWT_SECRET as string);
}

describe('Quotation state transitions', () => {
	let clientId: string;

	beforeAll(async () => {
  await sequelize.sync({ force: true });
  const client = await Client.create({ name: 'Sharma', phone: '9999999999' });
  clientId = client.id;
}, 30000);

afterAll(async () => sequelize.close(), 30000);

	it('rejects converting a draft quotation to a bill', async () => {
		const q = await Quotation.create({
			clientId, lineItems: [{ label: 'X', qty: 1, rate: 100, amount: 100 }],
			subtotal: 100, taxAmount: 0, total: 100, status: 'draft',
		});

		const res = await request(app)
			.post(`/api/quotations/${q.id}/convert-to-bill`)
			.set('Authorization', `Bearer ${adminToken()}`);

		expect(res.status).toBe(409);
	});

	it('rejects editing a finalized quotation', async () => {
		const q = await Quotation.create({
			clientId, lineItems: [{ label: 'X', qty: 1, rate: 100, amount: 100 }],
			subtotal: 100, taxAmount: 0, total: 100, status: 'final',
		});

		const res = await request(app)
			.put(`/api/quotations/${q.id}`)
			.set('Authorization', `Bearer ${adminToken()}`)
			.send({ discountValue: 50 });

		expect(res.status).toBe(409);
	});

	it('converts a finalized quotation to a bill successfully', async () => {
		const q = await Quotation.create({
			clientId, lineItems: [{ label: 'X', qty: 1, rate: 1000, amount: 1000 }],
			subtotal: 1000, taxAmount: 0, total: 1000, status: 'final',
		});

		const res = await request(app)
			.post(`/api/quotations/${q.id}/convert-to-bill`)
			.set('Authorization', `Bearer ${adminToken()}`);

		expect(res.status).toBe(201);
		expect(Number(res.body.bill.amount)).toBe(1000);

		const updated = await Quotation.findByPk(q.id);
		expect(updated?.status).toBe('converted');
	});

	it('rejects converting an already-converted quotation a second time', async () => {
		const q = await Quotation.create({
			clientId, lineItems: [{ label: 'X', qty: 1, rate: 100, amount: 100 }],
			subtotal: 100, taxAmount: 0, total: 100, status: 'converted',
		});
		await Bill.create({ quotationId: q.id, clientId, amount: 100, status: 'unpaid' });

		const res = await request(app)
			.post(`/api/quotations/${q.id}/convert-to-bill`)
			.set('Authorization', `Bearer ${adminToken()}`);

		expect(res.status).toBe(409);
	});
}); 