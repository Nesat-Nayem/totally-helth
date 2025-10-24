import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createBranch, deleteBranch, getBranchById, getBranches, updateBranch } from './branch.controller';

const router = express.Router();

// Get branches
router.get('/', auth(), getBranches);
router.get('/:id', auth(), getBranchById);

// Protected operations - let global access control handle permissions
router.post('/', auth(), createBranch);
router.patch('/:id', auth(), updateBranch);
router.delete('/:id', auth(), deleteBranch);

export const branchRouter = router;
