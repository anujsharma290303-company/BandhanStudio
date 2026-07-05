import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', (_req, res) => {
	return res.json({ clients: [] });
});

export default router;