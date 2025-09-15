import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createBranch, deleteBranch, getBranchById, getBranches, updateBranch } from './branch.controller';

const router = express.Router();

// Public list for login branch selection
router.get('/', getBranches);
router.get('/:id', getBranchById);

// Protected admin operations
router.post('/', auth('admin'), createBranch);
router.patch('/:id', auth('admin'), updateBranch);
router.delete('/:id', auth('admin'), deleteBranch);

export const branchRouter = router;
