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
exports.deleteSupplier = exports.updateSupplier = exports.getSupplierById = exports.getSuppliers = exports.createSupplier = void 0;
const zod_1 = require("zod");
const supplier_model_1 = require("./supplier.model");
const supplier_validation_1 = require("./supplier.validation");
const createSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = supplier_validation_1.supplierCreateValidation.parse(req.body);
        const exists = yield supplier_model_1.Supplier.findOne({ name: payload.name });
        if (exists) {
            res.status(400).json({ message: 'Supplier already exists' });
            return;
        }
        const created = yield supplier_model_1.Supplier.create(payload);
        res.status(201).json({ message: 'Supplier created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create supplier' });
    }
});
exports.createSupplier = createSupplier;
const getSuppliers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield supplier_model_1.Supplier.find().sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch suppliers' });
    }
});
exports.getSuppliers = getSuppliers;
const getSupplierById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield supplier_model_1.Supplier.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch supplier' });
    }
});
exports.getSupplierById = getSupplierById;
const updateSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = supplier_validation_1.supplierUpdateValidation.parse(req.body);
        if (payload.name) {
            const exists = yield supplier_model_1.Supplier.findOne({ name: payload.name, _id: { $ne: req.params.id } });
            if (exists) {
                res.status(400).json({ message: 'Supplier already exists' });
                return;
            }
        }
        const updated = yield supplier_model_1.Supplier.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json({ message: 'Supplier updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update supplier' });
    }
});
exports.updateSupplier = updateSupplier;
const deleteSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield supplier_model_1.Supplier.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json({ message: 'Supplier deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete supplier' });
    }
});
exports.deleteSupplier = deleteSupplier;
