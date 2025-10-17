import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { dayCloseMiddleware } from '../../middlewares/dayCloseMiddleware';
import { createOrder, deleteOrderById, getOrderById, getOrders, updateOrderById, holdMembership, unholdMembership, cancelOrder, getPaidOrdersToday, getUnpaidOrdersToday, changePaymentModeSimple } from './order.controller';

const router = express.Router();

// Create order (admin) - check day close before allowing order creation
router.post('/', auth('admin'), dayCloseMiddleware, createOrder);


// List orders (admin)
router.get('/', auth('admin'), getOrders);

// Get paid orders for today (admin)
router.get('/today/paid', auth('admin'), getPaidOrdersToday);

// Get unpaid orders for today (admin)
router.get('/today/unpaid', auth('admin'), getUnpaidOrdersToday);

// Membership hold/unhold (admin)
router.post('/:id/membership/hold', auth('admin'), holdMembership);
router.post('/:id/membership/unhold', auth('admin'), unholdMembership);

// Cancel order (admin)
router.post('/:id/cancel', auth('admin'), cancelOrder);

// Get by id (admin)
router.get('/:id', auth('admin'), getOrderById);

// Update (admin)
router.put('/:id', auth('admin'), updateOrderById);

// Simple payment mode change (admin) - just pass payment mode, system handles the rest
router.patch('/:id/payment-mode-simple', auth('admin'), changePaymentModeSimple);

// Soft delete (admin)
router.delete('/:id', auth('admin'), deleteOrderById);

export const orderRouter = router;
