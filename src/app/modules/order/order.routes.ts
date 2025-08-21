import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createOrder, deleteOrderById, getOrderById, getOrders, updateOrderById } from './order.controller';

const router = express.Router();

// Create order (admin)
router.post('/', auth('admin'), createOrder);

// List orders (admin)
router.get('/', auth('admin'), getOrders);

// Get by id (admin)
router.get('/:id', auth('admin'), getOrderById);

// Update (admin)
router.put('/:id', auth('admin'), updateOrderById);

// Soft delete (admin)
router.delete('/:id', auth('admin'), deleteOrderById);

export const orderRouter = router;
