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
exports.deleteBrand = exports.updateBrand = exports.getBrandById = exports.getBrands = exports.createBrand = void 0;
const zod_1 = require("zod");
const brand_model_1 = require("./brand.model");
const brand_validation_1 = require("./brand.validation");
const createBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = brand_validation_1.brandCreateValidation.parse(req.body);
        const exists = yield brand_model_1.Brand.findOne({ name: payload.name });
        if (exists) {
            res.status(400).json({ message: 'Brand already exists' });
            return;
        }
        const created = yield brand_model_1.Brand.create(payload);
        res.status(201).json({ message: 'Brand created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create brand' });
    }
});
exports.createBrand = createBrand;
const getBrands = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield brand_model_1.Brand.find().sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch brands' });
    }
});
exports.getBrands = getBrands;
const getBrandById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield brand_model_1.Brand.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch brand' });
    }
});
exports.getBrandById = getBrandById;
const updateBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = brand_validation_1.brandUpdateValidation.parse(req.body);
        if (payload.name) {
            const exists = yield brand_model_1.Brand.findOne({ name: payload.name, _id: { $ne: req.params.id } });
            if (exists) {
                res.status(400).json({ message: 'Brand already exists' });
                return;
            }
        }
        const updated = yield brand_model_1.Brand.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.json({ message: 'Brand updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update brand' });
    }
});
exports.updateBrand = updateBrand;
const deleteBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield brand_model_1.Brand.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.json({ message: 'Brand deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete brand' });
    }
});
exports.deleteBrand = deleteBrand;
