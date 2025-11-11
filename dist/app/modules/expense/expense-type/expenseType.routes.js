"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseTypeRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../middlewares/authMiddleware");
const expenseType_controller_1 = require("./expenseType.controller");
const router = express_1.default.Router();
router.get('/', expenseType_controller_1.getExpenseTypes);
router.get('/:id', expenseType_controller_1.getExpenseTypeById);
router.post('/', (0, authMiddleware_1.auth)(), expenseType_controller_1.createExpenseType);
router.patch('/:id', (0, authMiddleware_1.auth)(), expenseType_controller_1.updateExpenseType);
router.delete('/:id', (0, authMiddleware_1.auth)(), expenseType_controller_1.deleteExpenseType);
exports.expenseTypeRouter = router;
