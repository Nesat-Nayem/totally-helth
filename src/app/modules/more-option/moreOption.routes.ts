import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createMoreOption, deleteMoreOption, getMoreOptionById, getMoreOptions, updateMoreOption } from './moreOption.controller';

const router = express.Router();

router.get('/', getMoreOptions);
router.get('/:id', getMoreOptionById);
router.post('/', auth(), createMoreOption);
router.patch('/:id', auth(), updateMoreOption);
router.delete('/:id', auth(), deleteMoreOption);

export const moreOptionRouter = router;
