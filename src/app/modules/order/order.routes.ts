import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { dayCloseMiddleware } from '../../middlewares/dayCloseMiddleware';
import { createOrder, deleteOrderById, getOrderById, getOrders, updateOrderById, holdMembership, unholdMembership, cancelOrder, getPaidOrdersToday, getUnpaidOrdersToday, changePaymentModeSimple } from './order.controller';

const router = express.Router();

// Create order - check day close before allowing order creation
router.post('/', auth(), dayCloseMiddleware, createOrder);


// List orders
router.get('/', getOrders);

// Get paid orders for today
router.get('/today/paid', getPaidOrdersToday);

// Get unpaid orders for today
router.get('/today/unpaid', getUnpaidOrdersToday);

// Membership hold/unhold
router.post('/:id/membership/hold', auth(), holdMembership);
router.post('/:id/membership/unhold', auth(), unholdMembership);

// Cancel order
router.post('/:id/cancel', auth(), cancelOrder);

// Get by id
router.get('/:id', getOrderById);

// Update
router.put('/:id', auth(), updateOrderById);

// Simple payment mode change - just pass payment mode, system handles the rest
router.patch('/:id/payment-mode-simple', auth(), changePaymentModeSimple);

// Soft delete
router.delete('/:id', auth(), deleteOrderById);

export const orderRouter = router;
