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
// Create order (admin) - check day close before allowing order creation
router.post('/', (0, authMiddleware_1.auth)('admin'), dayCloseMiddleware_1.dayCloseMiddleware, order_controller_1.createOrder);
// List orders (admin)
router.get('/', (0, authMiddleware_1.auth)('admin'), order_controller_1.getOrders);
// Membership hold/unhold (admin)
router.post('/:id/membership/hold', (0, authMiddleware_1.auth)('admin'), order_controller_1.holdMembership);
router.post('/:id/membership/unhold', (0, authMiddleware_1.auth)('admin'), order_controller_1.unholdMembership);
// Cancel order (admin)
router.post('/:id/cancel', (0, authMiddleware_1.auth)('admin'), order_controller_1.cancelOrder);
// Get by id (admin)
router.get('/:id', (0, authMiddleware_1.auth)('admin'), order_controller_1.getOrderById);
// Update (admin)
router.put('/:id', (0, authMiddleware_1.auth)('admin'), order_controller_1.updateOrderById);
// Soft delete (admin)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), order_controller_1.deleteOrderById);
exports.orderRouter = router;
