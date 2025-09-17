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
exports.deleteCustomerById = exports.updateCustomerById = exports.getCustomerById = exports.getCustomers = exports.createCustomer = void 0;
const zod_1 = require("zod");
const customer_model_1 = require("./customer.model");
const customer_validation_1 = require("./customer.validation");
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = customer_validation_1.customerCreateValidation.parse(req.body);
        const created = yield customer_model_1.Customer.create(payload);
        res.status(201).json({ message: 'Customer created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create customer' });
    }
});
exports.createCustomer = createCustomer;
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q = '', page = '1', limit = '20', status } = req.query;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
            ];
        }
        const p = Math.max(1, parseInt(page, 10) || 1);
        const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
        const skip = (p - 1) * l;
        const [items, total] = yield Promise.all([
            customer_model_1.Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
            customer_model_1.Customer.countDocuments(filter),
        ]);
        res.json({ data: items, meta: { page: p, limit: l, total } });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch customers' });
    }
});
exports.getCustomers = getCustomers;
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield customer_model_1.Customer.findOne({ _id: req.params.id, isDeleted: false });
        if (!item) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch customer' });
    }
});
exports.getCustomerById = getCustomerById;
const updateCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = customer_validation_1.customerUpdateValidation.parse(req.body);
        const item = yield customer_model_1.Customer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, payload, { new: true });
        if (!item) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json({ message: 'Customer updated', data: item });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update customer' });
    }
});
exports.updateCustomerById = updateCustomerById;
const deleteCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield customer_model_1.Customer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!item) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json({ message: 'Customer deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete customer' });
    }
});
exports.deleteCustomerById = deleteCustomerById;
