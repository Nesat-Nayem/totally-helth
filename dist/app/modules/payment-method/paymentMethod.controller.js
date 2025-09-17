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
exports.deletePaymentMethod = exports.updatePaymentMethod = exports.getPaymentMethodById = exports.getPaymentMethods = exports.createPaymentMethod = void 0;
const zod_1 = require("zod");
const paymentMethod_model_1 = require("./paymentMethod.model");
const paymentMethod_validation_1 = require("./paymentMethod.validation");
const createPaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = paymentMethod_validation_1.paymentMethodCreateValidation.parse(req.body);
        const exists = yield paymentMethod_model_1.PaymentMethod.findOne({ name: payload.name });
        if (exists) {
            res.status(400).json({ message: 'Payment method already exists' });
            return;
        }
        const created = yield paymentMethod_model_1.PaymentMethod.create(payload);
        res.status(201).json({ message: 'Payment method created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create payment method' });
    }
});
exports.createPaymentMethod = createPaymentMethod;
const getPaymentMethods = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield paymentMethod_model_1.PaymentMethod.find().sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch payment methods' });
    }
});
exports.getPaymentMethods = getPaymentMethods;
const getPaymentMethodById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield paymentMethod_model_1.PaymentMethod.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Payment method not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch payment method' });
    }
});
exports.getPaymentMethodById = getPaymentMethodById;
const updatePaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = paymentMethod_validation_1.paymentMethodUpdateValidation.parse(req.body);
        if (payload.name) {
            const exists = yield paymentMethod_model_1.PaymentMethod.findOne({ name: payload.name, _id: { $ne: req.params.id } });
            if (exists) {
                res.status(400).json({ message: 'Payment method already exists' });
                return;
            }
        }
        const updated = yield paymentMethod_model_1.PaymentMethod.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Payment method not found' });
            return;
        }
        res.json({ message: 'Payment method updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update payment method' });
    }
});
exports.updatePaymentMethod = updatePaymentMethod;
const deletePaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield paymentMethod_model_1.PaymentMethod.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Payment method not found' });
            return;
        }
        res.json({ message: 'Payment method deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete payment method' });
    }
});
exports.deletePaymentMethod = deletePaymentMethod;
