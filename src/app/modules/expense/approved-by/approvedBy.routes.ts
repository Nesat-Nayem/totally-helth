import express from 'express';
import { auth } from '../../../middlewares/authMiddleware';
import {
  createApprovedBy,
  deleteApprovedBy,
  getApprovedById,
  getApprovedBys,
  updateApprovedBy,
} from './approvedBy.controller';

const router = express.Router();

router.get('/', getApprovedBys);
router.get('/:id', getApprovedById);
router.post('/', auth(), createApprovedBy);
router.patch('/:id', auth(), updateApprovedBy);
router.delete('/:id', auth(), deleteApprovedBy);

export const approvedByRouter = router;

