import { Request, Response } from 'express';
import { Op, ValidationError } from 'sequelize';
import Client from '../models/Client';

function getClientId(req: Request) {
	return typeof req.params.id === 'string' ? req.params.id : undefined;
}

export async function listClients(req: Request, res: Response) {
	const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
	const findOptions = search
		? {
			where: {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${search}%` } },
					{ phone: { [Op.iLike]: `%${search}%` } },
					{ email: { [Op.iLike]: `%${search}%` } },
				],
			},
		}
		: {};

	try {
		const clients = await Client.findAll({
			order: [['createdAt', 'DESC']],
			...findOptions,
		});

		return res.json({ clients });
	} catch (error) {
		return res.status(500).json({ error: 'Failed to fetch clients' });
	}
}

export async function getClient(req: Request, res: Response) {
	const clientId = getClientId(req);

	if (!clientId) {
		return res.status(400).json({ error: 'Invalid client id' });
	}

	try {
		const client = await Client.findByPk(clientId);

		if (!client) {
			return res.status(404).json({ error: 'Client not found' });
		}

		return res.json({ client });
	} catch (error) {
		return res.status(500).json({ error: 'Failed to fetch client' });
	}
}

export async function createClient(req: Request, res: Response) {
	const { name, phone, email, address } = req.body;

	if (!name || !phone) {
		return res.status(400).json({ error: 'Name and phone are required' });
	}

	try {
		const client = await Client.create({
			name,
			phone,
			email: email ?? null,
			address: address ?? null,
		});

		return res.status(201).json({ client });
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.errors[0]?.message ?? 'Invalid client data' });
		}

		return res.status(500).json({ error: 'Failed to create client' });
	}
}

export async function updateClient(req: Request, res: Response) {
	const clientId = getClientId(req);

	if (!clientId) {
		return res.status(400).json({ error: 'Invalid client id' });
	}

	try {
		const client = await Client.findByPk(clientId);

		if (!client) {
			return res.status(404).json({ error: 'Client not found' });
		}

		const updates: Partial<{
			name: string;
			phone: string;
			email: string | null;
			address: string | null;
		}> = {};

		if (req.body.name !== undefined) updates.name = req.body.name;
		if (req.body.phone !== undefined) updates.phone = req.body.phone;
		if (req.body.email !== undefined) updates.email = req.body.email;
		if (req.body.address !== undefined) updates.address = req.body.address;

		await client.update(updates);
		return res.json({ client });
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.errors[0]?.message ?? 'Invalid client data' });
		}

		return res.status(500).json({ error: 'Failed to update client' });
	}
}

export async function deleteClient(req: Request, res: Response) {
	const clientId = getClientId(req);

	if (!clientId) {
		return res.status(400).json({ error: 'Invalid client id' });
	}

	try {
		const client = await Client.findByPk(clientId);

		if (!client) {
			return res.status(404).json({ error: 'Client not found' });
		}

		// TODO: block deletion if this client has quotations once the Quotation model exists.
		await client.destroy();

		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ error: 'Failed to delete client' });
	}
}