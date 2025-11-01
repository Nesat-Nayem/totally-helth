"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const paymentMethod_controller_1 = require("./paymentMethod.controller");
const router = express_1.default.Router();
router.get('/', (0, authMiddleware_1.auth)(), paymentMethod_controller_1.getPaymentMethods);
router.get('/:id', (0, authMiddleware_1.auth)(), paymentMethod_controller_1.getPaymentMethodById);
router.post('/', (0, authMiddleware_1.auth)(), paymentMethod_controller_1.createPaymentMethod);
router.patch('/:id', (0, authMiddleware_1.auth)(), paymentMethod_controller_1.updatePaymentMethod);
router.delete('/:id', (0, authMiddleware_1.auth)(), paymentMethod_controller_1.deletePaymentMethod);
exports.paymentMethodRouter = router;
