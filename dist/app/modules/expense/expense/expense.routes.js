"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../middlewares/authMiddleware");
const expense_controller_1 = require("./expense.controller");
const router = express_1.default.Router();
// Main CRUD routes
router.get('/', expense_controller_1.getExpenses);
router.get('/credit', expense_controller_1.getCreditExpenses);
router.get('/card', expense_controller_1.getCardExpenses);
router.get('/cash', expense_controller_1.getCashExpenses);
router.get('/:id', expense_controller_1.getExpenseById);
router.post('/', (0, authMiddleware_1.auth)(), expense_controller_1.createExpense);
router.patch('/:id', (0, authMiddleware_1.auth)(), expense_controller_1.updateExpense);
router.put('/:id', (0, authMiddleware_1.auth)(), expense_controller_1.updateExpense);
router.delete('/:id', (0, authMiddleware_1.auth)(), expense_controller_1.deleteExpense);
exports.expenseRouter = router;
