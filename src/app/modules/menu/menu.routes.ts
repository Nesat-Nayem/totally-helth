import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createMenu, deleteMenu, getMenuById, getMenus, updateMenu } from './menu.controller';

const router = express.Router();

router.get('/', auth(), getMenus);
router.get('/:id', auth(), getMenuById);
router.post('/', auth(), createMenu);
router.patch('/:id', auth(), updateMenu);
router.delete('/:id', auth(), deleteMenu);

export const menuRouter = router;
