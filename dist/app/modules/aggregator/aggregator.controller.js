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
exports.deleteAggregator = exports.updateAggregator = exports.getAggregatorById = exports.getAggregators = exports.createAggregator = void 0;
const zod_1 = require("zod");
const aggregator_model_1 = require("./aggregator.model");
const aggregator_validation_1 = require("./aggregator.validation");
const createAggregator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = aggregator_validation_1.aggregatorCreateValidation.parse(req.body);
        const exists = yield aggregator_model_1.Aggregator.findOne({ name: payload.name });
        if (exists) {
            res.status(400).json({ message: 'Aggregator already exists' });
            return;
        }
        const created = yield aggregator_model_1.Aggregator.create(payload);
        res.status(201).json({ message: 'Aggregator created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create aggregator' });
    }
});
exports.createAggregator = createAggregator;
const getAggregators = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield aggregator_model_1.Aggregator.find().sort({ createdAt: -1 });
        res.json({ data: items });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch aggregators' });
    }
});
exports.getAggregators = getAggregators;
const getAggregatorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield aggregator_model_1.Aggregator.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Aggregator not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch aggregator' });
    }
});
exports.getAggregatorById = getAggregatorById;
const updateAggregator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = aggregator_validation_1.aggregatorUpdateValidation.parse(req.body);
        if (payload.name) {
            const exists = yield aggregator_model_1.Aggregator.findOne({ name: payload.name, _id: { $ne: req.params.id } });
            if (exists) {
                res.status(400).json({ message: 'Aggregator already exists' });
                return;
            }
        }
        const updated = yield aggregator_model_1.Aggregator.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Aggregator not found' });
            return;
        }
        res.json({ message: 'Aggregator updated', data: updated });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update aggregator' });
    }
});
exports.updateAggregator = updateAggregator;
const deleteAggregator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield aggregator_model_1.Aggregator.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Aggregator not found' });
            return;
        }
        res.json({ message: 'Aggregator deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete aggregator' });
    }
});
exports.deleteAggregator = deleteAggregator;
