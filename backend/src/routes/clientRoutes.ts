import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
	createClient,
	deleteClient,
	getClient,
	listClients,
	updateClient,
} from '../controllers/clientController';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;