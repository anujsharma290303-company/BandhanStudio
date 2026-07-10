import { Router } from 'express';
import { listEventPackages } from '../controllers/eventPackageController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/', listEventPackages);

export default router;