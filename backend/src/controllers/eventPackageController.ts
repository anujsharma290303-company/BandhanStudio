import { Request, Response } from 'express';
import EventPackage from '../models/EventPackage';

export async function listEventPackages(req: Request, res: Response) {
	try {
		const packages = await EventPackage.findAll({ order: [['name', 'ASC']] });
		return res.json({ packages });
	} catch {
		return res.status(500).json({ error: 'Failed to fetch packages' });
	}
}