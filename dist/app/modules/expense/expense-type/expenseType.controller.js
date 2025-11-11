"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpenseType = exports.updateExpenseType = exports.getExpenseTypeById = exports.getExpenseTypes = exports.createExpenseType = void 0;
const zod_1 = require("zod");
const expenseType_model_1 = require("./expenseType.model");
const expenseType_validation_1 = require("./expenseType.validation");
const createExpenseType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = expenseType_validation_1.expenseTypeCreateValidation.parse(req.body);
        const exists = yield expenseType_model_1.ExpenseType.findOne({ name: payload.name });
        if (exists) {
            res.status(400).json({ message: 'Expense type already exists' });
            return;
        }
        const created = yield expenseType_model_1.ExpenseType.create(payload);
        res.status(201).json({ message: 'Expense type created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create expense type' });
    }
});
exports.createExpenseType = createExpenseType;
const getExpenseTypes = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield expenseType_model_1.ExpenseType.find().sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch expense types' });
    }
});
exports.getExpenseTypes = getExpenseTypes;
const getExpenseTypeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield expenseType_model_1.ExpenseType.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Expense type not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch expense type' });
    }
});
exports.getExpenseTypeById = getExpenseTypeById;
const updateExpenseType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = expenseType_validation_1.expenseTypeUpdateValidation.parse(req.body);
        if (payload.name) {
            const exists = yield expenseType_model_1.ExpenseType.findOne({ name: payload.name, _id: { $ne: req.params.id } });
            if (exists) {
                res.status(400).json({ message: 'Expense type already exists' });
                return;
            }
        }
        const updated = yield expenseType_model_1.ExpenseType.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Expense type not found' });
            return;
        }
        res.json({ message: 'Expense type updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update expense type' });
    }
});
exports.updateExpenseType = updateExpenseType;
const deleteExpenseType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield expenseType_model_1.ExpenseType.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Expense type not found' });
            return;
        }
        res.json({ message: 'Expense type deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete expense type' });
    }
});
exports.deleteExpenseType = deleteExpenseType;
