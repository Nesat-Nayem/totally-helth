import express from 'express';
import { createBranch, deleteBranch, getBranchById, getBranches, updateBranch } from './branch.controller';

const router = express.Router();

// Get branches
router.get('/', getBranches);
router.get('/:id', getBranchById);

// Branch operations - no authorization required
router.post('/', createBranch);
router.patch('/:id', updateBranch);
router.delete('/:id', deleteBranch);

export const branchRouter = router;
