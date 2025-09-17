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
exports.deleteMoreOption = exports.updateMoreOption = exports.getMoreOptionById = exports.getMoreOptions = exports.createMoreOption = void 0;
const zod_1 = require("zod");
const moreOption_model_1 = require("./moreOption.model");
const moreOption_validation_1 = require("./moreOption.validation");
const createMoreOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = moreOption_validation_1.moreOptionCreateValidation.parse(req.body);
        const created = yield moreOption_model_1.MoreOption.create(payload);
        res.status(201).json({ message: 'More option created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create more option' });
    }
});
exports.createMoreOption = createMoreOption;
const getMoreOptions = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield moreOption_model_1.MoreOption.find().sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch more options' });
    }
});
exports.getMoreOptions = getMoreOptions;
const getMoreOptionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield moreOption_model_1.MoreOption.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'More option not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch more option' });
    }
});
exports.getMoreOptionById = getMoreOptionById;
const updateMoreOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = moreOption_validation_1.moreOptionUpdateValidation.parse(req.body);
        const updated = yield moreOption_model_1.MoreOption.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'More option not found' });
            return;
        }
        res.json({ message: 'More option updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update more option' });
    }
});
exports.updateMoreOption = updateMoreOption;
const deleteMoreOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield moreOption_model_1.MoreOption.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'More option not found' });
            return;
        }
        res.json({ message: 'More option deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete more option' });
    }
});
exports.deleteMoreOption = deleteMoreOption;
