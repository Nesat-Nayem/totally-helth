"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const dayCloseMiddleware_1 = require("../../middlewares/dayCloseMiddleware");
const order_controller_1 = require("./order.controller");
const router = express_1.default.Router();
// Create order - check day close before allowing order creation
router.post('/', (0, authMiddleware_1.auth)(), dayCloseMiddleware_1.dayCloseMiddleware, order_controller_1.createOrder);
// List orders
router.get('/', order_controller_1.getOrders);
// Get paid orders for today
router.get('/today/paid', order_controller_1.getPaidOrdersToday);
// Get unpaid orders for today
router.get('/today/unpaid', order_controller_1.getUnpaidOrdersToday);
// Membership hold/unhold
router.post('/:id/membership/hold', (0, authMiddleware_1.auth)(), order_controller_1.holdMembership);
router.post('/:id/membership/unhold', (0, authMiddleware_1.auth)(), order_controller_1.unholdMembership);
// Cancel order
router.post('/:id/cancel', (0, authMiddleware_1.auth)(), order_controller_1.cancelOrder);
// Get by id
router.get('/:id', order_controller_1.getOrderById);
// Update
router.put('/:id', (0, authMiddleware_1.auth)(), order_controller_1.updateOrderById);
// Simple payment mode change - just pass payment mode, system handles the rest
router.patch('/:id/payment-mode-simple', (0, authMiddleware_1.auth)(), order_controller_1.changePaymentModeSimple);
// Soft delete
router.delete('/:id', (0, authMiddleware_1.auth)(), order_controller_1.deleteOrderById);
exports.orderRouter = router;
