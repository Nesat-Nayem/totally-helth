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
exports.deleteApprovedBy = exports.updateApprovedBy = exports.getApprovedById = exports.getApprovedBys = exports.createApprovedBy = void 0;
const zod_1 = require("zod");
const approvedBy_model_1 = require("./approvedBy.model");
const approvedBy_validation_1 = require("./approvedBy.validation");
const createApprovedBy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = approvedBy_validation_1.approvedByCreateValidation.parse(req.body);
        const exists = yield approvedBy_model_1.ApprovedBy.findOne({ name: payload.name });
        if (exists) {
            res.status(400).json({ message: 'Approved by already exists' });
            return;
        }
        const created = yield approvedBy_model_1.ApprovedBy.create(payload);
        res.status(201).json({ message: 'Approved by created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create approved by' });
    }
});
exports.createApprovedBy = createApprovedBy;
const getApprovedBys = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield approvedBy_model_1.ApprovedBy.find().sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch approved bys' });
    }
});
exports.getApprovedBys = getApprovedBys;
const getApprovedById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield approvedBy_model_1.ApprovedBy.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Approved by not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch approved by' });
    }
});
exports.getApprovedById = getApprovedById;
const updateApprovedBy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = approvedBy_validation_1.approvedByUpdateValidation.parse(req.body);
        if (payload.name) {
            const exists = yield approvedBy_model_1.ApprovedBy.findOne({ name: payload.name, _id: { $ne: req.params.id } });
            if (exists) {
                res.status(400).json({ message: 'Approved by already exists' });
                return;
            }
        }
        const updated = yield approvedBy_model_1.ApprovedBy.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Approved by not found' });
            return;
        }
        res.json({ message: 'Approved by updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update approved by' });
    }
});
exports.updateApprovedBy = updateApprovedBy;
const deleteApprovedBy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield approvedBy_model_1.ApprovedBy.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Approved by not found' });
            return;
        }
        res.json({ message: 'Approved by deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete approved by' });
    }
});
exports.deleteApprovedBy = deleteApprovedBy;
