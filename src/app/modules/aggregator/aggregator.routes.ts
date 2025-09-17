import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createAggregator, deleteAggregator, getAggregatorById, getAggregators, updateAggregator } from './aggregator.controller';

const router = express.Router();

router.get('/', getAggregators);
router.get('/:id', getAggregatorById);
router.post('/', auth('admin'), createAggregator);
router.patch('/:id', auth('admin'), updateAggregator);
router.delete('/:id', auth('admin'), deleteAggregator);

export const aggregatorRouter = router;
