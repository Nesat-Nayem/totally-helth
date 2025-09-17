"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const customer_controller_1 = require("./customer.controller");
const router = express_1.default.Router();
// Create customer (admin)
router.post('/', (0, authMiddleware_1.auth)('admin'), customer_controller_1.createCustomer);
// List customers (public for now; adjust if needed)
router.get('/', customer_controller_1.getCustomers);
// Get by id
router.get('/:id', customer_controller_1.getCustomerById);
// Update (admin)
router.put('/:id', (0, authMiddleware_1.auth)('admin'), customer_controller_1.updateCustomerById);
// Soft delete (admin)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), customer_controller_1.deleteCustomerById);
exports.customerRouter = router;
