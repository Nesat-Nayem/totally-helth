"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseModuleRouter = void 0;
const express_1 = __importDefault(require("express"));
const expenseType_routes_1 = require("./expense-type/expenseType.routes");
const supplier_routes_1 = require("./supplier/supplier.routes");
const approvedBy_routes_1 = require("./approved-by/approvedBy.routes");
const expense_routes_1 = require("./expense/expense.routes");
const router = express_1.default.Router();
// Expense Type CRUD
router.use('/expense-types', expenseType_routes_1.expenseTypeRouter);
// Supplier CRUD
router.use('/suppliers', supplier_routes_1.supplierRouter);
// Approved By CRUD
router.use('/approved-bys', approvedBy_routes_1.approvedByRouter);
// Main Expense CRUD
router.use('/', expense_routes_1.expenseRouter);
exports.expenseModuleRouter = router;
