import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createMenu, deleteMenu, getMenuById, getMenus, updateMenu } from './menu.controller';

const router = express.Router();

router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', auth('admin'), createMenu);
router.patch('/:id', auth('admin'), updateMenu);
router.delete('/:id', auth('admin'), deleteMenu);

export const menuRouter = router;
