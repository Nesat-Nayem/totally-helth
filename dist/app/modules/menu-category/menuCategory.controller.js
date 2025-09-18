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
exports.deleteMenuCategory = exports.updateMenuCategory = exports.getMenuCategoryById = exports.getMenuCategories = exports.createMenuCategory = void 0;
const zod_1 = require("zod");
const menuCategory_model_1 = require("./menuCategory.model");
const menuCategory_validation_1 = require("./menuCategory.validation");
const createMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = menuCategory_validation_1.menuCategoryCreateValidation.parse(req.body);
        const exists = yield menuCategory_model_1.MenuCategory.findOne({ title: payload.title });
        if (exists) {
            res.status(400).json({ message: 'Menu category already exists' });
            return;
        }
        const created = yield menuCategory_model_1.MenuCategory.create(payload);
        res.status(201).json({ message: 'Menu category created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create category' });
    }
});
exports.createMenuCategory = createMenuCategory;
const getMenuCategories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield menuCategory_model_1.MenuCategory.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch categories' });
    }
});
exports.getMenuCategories = getMenuCategories;
const getMenuCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield menuCategory_model_1.MenuCategory.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Menu category not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch category' });
    }
});
exports.getMenuCategoryById = getMenuCategoryById;
const updateMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = menuCategory_validation_1.menuCategoryUpdateValidation.parse(req.body);
        if (payload.title) {
            const exists = yield menuCategory_model_1.MenuCategory.findOne({ title: payload.title, _id: { $ne: req.params.id } });
            if (exists) {
                res.status(400).json({ message: 'Menu category already exists' });
                return;
            }
        }
        const updated = yield menuCategory_model_1.MenuCategory.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Menu category not found' });
            return;
        }
        res.json({ message: 'Menu category updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update category' });
    }
});
exports.updateMenuCategory = updateMenuCategory;
const deleteMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield menuCategory_model_1.MenuCategory.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Menu category not found' });
            return;
        }
        res.json({ message: 'Menu category deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete category' });
    }
});
exports.deleteMenuCategory = deleteMenuCategory;
