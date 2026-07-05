/// <reference path="../types/express.d.ts" />

import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

type AuthUser = {
	id: string;
	username: string;
	role: 'admin' | 'team_member';
};

function isAuthUser(payload: string | JwtPayload): payload is JwtPayload & AuthUser {
	return (
		typeof payload !== 'string' &&
		typeof payload.id === 'string' &&
		typeof payload.username === 'string' &&
		(payload.role === 'admin' || payload.role === 'team_member')
	);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authorizationHeader = req.headers.authorization;

	if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const token = authorizationHeader.slice('Bearer '.length);

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

		if (!isAuthUser(decoded)) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		req.user = decoded;
		return next();
	} catch {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	if (req.user.role !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	return next();
}
