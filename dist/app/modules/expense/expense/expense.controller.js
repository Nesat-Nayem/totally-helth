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
exports.getCashExpenses = exports.getCardExpenses = exports.getCreditExpenses = exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.getExpenses = exports.createExpense = void 0;
const zod_1 = require("zod");
const expense_model_1 = require("./expense.model");
const expense_validation_1 = require("./expense.validation");
// Helper function to calculate amounts
const calculateAmounts = (baseAmount, taxPercent, vatPercent) => {
    const taxAmount = (baseAmount * taxPercent) / 100;
    const vatAmount = (baseAmount * vatPercent) / 100;
    const grandTotal = baseAmount + taxAmount + vatAmount;
    return { taxAmount, vatAmount, grandTotal };
};
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = expense_validation_1.expenseCreateValidation.parse(req.body);
        // Calculate amounts
        const baseAmount = payload.baseAmount || 0;
        const taxPercent = payload.taxPercent || 0;
        const vatPercent = payload.vatPercent || 5;
        const { taxAmount, vatAmount, grandTotal } = calculateAmounts(baseAmount, taxPercent, vatPercent);
        // Parse invoice date
        const invoiceDate = typeof payload.invoiceDate === 'string'
            ? new Date(payload.invoiceDate)
            : payload.invoiceDate;
        const expenseData = Object.assign(Object.assign({}, payload), { invoiceDate,
            taxAmount,
            vatAmount,
            grandTotal });
        const created = yield expense_model_1.Expense.create(expenseData);
        const populated = yield expense_model_1.Expense.findById(created._id)
            .populate('expenseType')
            .populate('supplier')
            .populate('approvedBy');
        res.status(201).json({ message: 'Expense created', data: populated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create expense' });
    }
});
exports.createExpense = createExpense;
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentMethod, month, year, q, search } = req.query;
        const query = {};
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }
        // Search functionality - search by invoiceId, description, paymentReferenceNo, notes
        const searchTerm = q || search;
        if (searchTerm) {
            query.$or = [
                { invoiceId: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { paymentReferenceNo: { $regex: searchTerm, $options: 'i' } },
                { notes: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (month || year) {
            const yearNum = year ? parseInt(year) : new Date().getFullYear();
            const monthNum = month ? parseInt(month) : new Date().getMonth() + 1;
            const startDate = new Date(yearNum, monthNum - 1, 1);
            const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
            query.invoiceDate = { $gte: startDate, $lte: endDate };
        }
        const items = yield expense_model_1.Expense.find(query)
            .populate('expenseType')
            .populate('supplier')
            .populate('approvedBy')
            .sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch expenses' });
    }
});
exports.getExpenses = getExpenses;
const getExpenseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield expense_model_1.Expense.findById(req.params.id)
            .populate('expenseType')
            .populate('supplier')
            .populate('approvedBy');
        if (!item) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch expense' });
    }
});
exports.getExpenseById = getExpenseById;
const updateExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clean up empty strings and handle ObjectId fields
        const cleanedBody = {};
        Object.keys(req.body).forEach((key) => {
            const value = req.body[key];
            // Handle empty strings for optional text fields
            if (value === '' || value === null || value === undefined) {
                if (['description', 'paymentReferenceNo', 'notes'].includes(key)) {
                    cleanedBody[key] = '';
                }
                // Skip other empty values - don't include them in update
                return;
            }
            // Handle ObjectId fields - extract _id if it's an object
            if (['expenseType', 'supplier', 'approvedBy'].includes(key)) {
                if (typeof value === 'object' && value !== null) {
                    // If it's an object with _id, use that
                    if (value._id) {
                        cleanedBody[key] = String(value._id);
                    }
                    else if (value.id) {
                        cleanedBody[key] = String(value.id);
                    }
                    // If object doesn't have _id or id, skip it
                }
                else if (typeof value === 'string' && value.length > 0) {
                    cleanedBody[key] = value;
                }
                // Skip if value doesn't match expected format
                return;
            }
            // Handle other fields - include all non-empty values
            cleanedBody[key] = value;
        });
        const payload = expense_validation_1.expenseUpdateValidation.parse(cleanedBody);
        // Recalculate amounts if baseAmount, taxPercent, or vatPercent changed
        const existing = yield expense_model_1.Expense.findById(req.params.id);
        if (!existing) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }
        const baseAmount = payload.baseAmount !== undefined ? payload.baseAmount : existing.baseAmount;
        const taxPercent = payload.taxPercent !== undefined ? payload.taxPercent : existing.taxPercent;
        const vatPercent = payload.vatPercent !== undefined ? payload.vatPercent : existing.vatPercent;
        const { taxAmount, vatAmount, grandTotal } = calculateAmounts(baseAmount, taxPercent, vatPercent);
        // Parse invoice date if provided
        if (payload.invoiceDate) {
            payload.invoiceDate = typeof payload.invoiceDate === 'string'
                ? new Date(payload.invoiceDate)
                : payload.invoiceDate;
        }
        const updateData = Object.assign(Object.assign({}, payload), { taxAmount,
            vatAmount,
            grandTotal });
        // Remove undefined values to avoid overwriting with undefined
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
        const updated = yield expense_model_1.Expense.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate('expenseType')
            .populate('supplier')
            .populate('approvedBy');
        if (!updated) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: updated
        });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const errorMessages = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: err.issues,
                details: errorMessages
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update expense'
        });
    }
});
exports.updateExpense = updateExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield expense_model_1.Expense.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }
        res.json({ message: 'Expense deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete expense' });
    }
});
exports.deleteExpense = deleteExpense;
// Get credit expenses list
const getCreditExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year, q, search } = req.query;
        const query = { paymentMethod: 'Credit' };
        // Search functionality - search by invoiceId, description, paymentReferenceNo, supplier name, etc.
        const searchTerm = q || search;
        if (searchTerm) {
            query.$or = [
                { invoiceId: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { paymentReferenceNo: { $regex: searchTerm, $options: 'i' } },
                { notes: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (month || year) {
            const yearNum = year ? parseInt(year) : new Date().getFullYear();
            const monthNum = month ? parseInt(month) : new Date().getMonth() + 1;
            const startDate = new Date(yearNum, monthNum - 1, 1);
            const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
            query.invoiceDate = { $gte: startDate, $lte: endDate };
        }
        const items = yield expense_model_1.Expense.find(query)
            .populate('expenseType')
            .populate('supplier')
            .populate('approvedBy')
            .sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch credit expenses' });
    }
});
exports.getCreditExpenses = getCreditExpenses;
// Get card expenses list
const getCardExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year, q, search } = req.query;
        const query = { paymentMethod: 'Card' };
        // Search functionality - search by invoiceId, description, paymentReferenceNo, supplier name, etc.
        const searchTerm = q || search;
        if (searchTerm) {
            query.$or = [
                { invoiceId: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { paymentReferenceNo: { $regex: searchTerm, $options: 'i' } },
                { notes: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (month || year) {
            const yearNum = year ? parseInt(year) : new Date().getFullYear();
            const monthNum = month ? parseInt(month) : new Date().getMonth() + 1;
            const startDate = new Date(yearNum, monthNum - 1, 1);
            const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
            query.invoiceDate = { $gte: startDate, $lte: endDate };
        }
        const items = yield expense_model_1.Expense.find(query)
            .populate('expenseType')
            .populate('supplier')
            .populate('approvedBy')
            .sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch card expenses' });
    }
});
exports.getCardExpenses = getCardExpenses;
// Get cash expenses list
const getCashExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year, q, search } = req.query;
        const query = { paymentMethod: 'Cash' };
        // Search functionality - search by invoiceId, description, paymentReferenceNo, supplier name, etc.
        const searchTerm = q || search;
        if (searchTerm) {
            query.$or = [
                { invoiceId: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { paymentReferenceNo: { $regex: searchTerm, $options: 'i' } },
                { notes: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (month || year) {
            const yearNum = year ? parseInt(year) : new Date().getFullYear();
            const monthNum = month ? parseInt(month) : new Date().getMonth() + 1;
            const startDate = new Date(yearNum, monthNum - 1, 1);
            const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
            query.invoiceDate = { $gte: startDate, $lte: endDate };
        }
        const items = yield expense_model_1.Expense.find(query)
            .populate('expenseType')
            .populate('supplier')
            .populate('approvedBy')
            .sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch cash expenses' });
    }
});
exports.getCashExpenses = getCashExpenses;
