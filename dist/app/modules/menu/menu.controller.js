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
exports.deleteMenu = exports.updateMenu = exports.getMenuById = exports.getMenus = exports.createMenu = void 0;
const zod_1 = require("zod");
const menu_model_1 = require("./menu.model");
const menu_validation_1 = require("./menu.validation");
const createMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = menu_validation_1.menuCreateValidation.parse(req.body);
        const created = yield menu_model_1.Menu.create(payload);
        res.status(201).json({ message: 'Menu created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create menu' });
    }
});
exports.createMenu = createMenu;
const getMenus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q = '', page = '1', limit = '20', brand, category, status, priceType } = req.query;
        const filter = { isDeleted: { $ne: true } };
        if (status)
            filter.status = status;
        if (brand)
            filter.brands = { $in: [brand] };
        if (category)
            filter.category = category;
        // priceType filter: restaurant | online | membership
        if (priceType === 'restaurant')
            filter.restaurantPrice = { $gt: 0 };
        if (priceType === 'online')
            filter.onlinePrice = { $gt: 0 };
        if (priceType === 'membership')
            filter.membershipPrice = { $gt: 0 };
        if (q) {
            filter.$or = [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
        }
        const p = Math.max(1, parseInt(page, 10) || 1);
        const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
        const skip = (p - 1) * l;
        const [items, total] = yield Promise.all([
            menu_model_1.Menu.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
            menu_model_1.Menu.countDocuments(filter),
        ]);
        res.json({ data: items, meta: { page: p, limit: l, total } });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch menus' });
    }
});
exports.getMenus = getMenus;
const getMenuById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield menu_model_1.Menu.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Menu not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch menu' });
    }
});
exports.getMenuById = getMenuById;
const updateMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = menu_validation_1.menuUpdateValidation.parse(req.body);
        const updated = yield menu_model_1.Menu.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Menu not found' });
            return;
        }
        res.json({ message: 'Menu updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update menu' });
    }
});
exports.updateMenu = updateMenu;
const deleteMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield menu_model_1.Menu.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Menu not found' });
            return;
        }
        res.json({ message: 'Menu deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete menu' });
    }
});
exports.deleteMenu = deleteMenu;
