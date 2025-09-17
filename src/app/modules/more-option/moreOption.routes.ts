import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createMoreOption, deleteMoreOption, getMoreOptionById, getMoreOptions, updateMoreOption } from './moreOption.controller';

const router = express.Router();

router.get('/', getMoreOptions);
router.get('/:id', getMoreOptionById);
router.post('/', auth('admin'), createMoreOption);
router.patch('/:id', auth('admin'), updateMoreOption);
router.delete('/:id', auth('admin'), deleteMoreOption);

export const moreOptionRouter = router;
