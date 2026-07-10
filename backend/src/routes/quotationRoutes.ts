import { Router } from 'express';
import {
	listQuotations,
	getQuotation,
	createQuotation,
	updateQuotation,
	finalizeQuotation,
	convertToBill,
} from '../controllers/quotationController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', listQuotations);
router.get('/:id', getQuotation);
router.post('/', createQuotation);
router.put('/:id', updateQuotation);
router.post('/:id/finalize', finalizeQuotation);
router.post('/:id/convert-to-bill', convertToBill);

export default router;