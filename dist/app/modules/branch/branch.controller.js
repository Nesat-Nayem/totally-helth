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
exports.deleteBranch = exports.updateBranch = exports.getBranchById = exports.getBranches = exports.createBranch = void 0;
const branch_model_1 = require("./branch.model");
const branch_validation_1 = require("./branch.validation");
const createBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = branch_validation_1.branchCreateValidation.parse(req.body);
        const exists = yield branch_model_1.Branch.findOne({ name: payload.name });
        if (exists) {
            res.status(400).json({ success: false, statusCode: 400, message: 'Branch name already exists' });
            return;
        }
        const branch = yield branch_model_1.Branch.create(payload);
        res.status(201).json({ success: true, statusCode: 201, message: 'Branch created', data: branch });
        return;
    }
    catch (error) {
        res.status(400).json({ success: false, statusCode: 400, message: error.message });
    }
});
exports.createBranch = createBranch;
const getBranches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branches = yield branch_model_1.Branch.find().sort({ createdAt: -1 });
        res.json({ success: true, statusCode: 200, message: 'Branches fetched', data: branches });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, statusCode: 500, message: error.message });
    }
});
exports.getBranches = getBranches;
const getBranchById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branch = yield branch_model_1.Branch.findById(req.params.id);
        if (!branch) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Branch not found' });
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'Branch fetched', data: branch });
        return;
    }
    catch (error) {
        res.status(400).json({ success: false, statusCode: 400, message: error.message });
    }
});
exports.getBranchById = getBranchById;
const updateBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = branch_validation_1.branchUpdateValidation.parse(req.body);
        if (payload.name) {
            const conflict = yield branch_model_1.Branch.findOne({ name: payload.name, _id: { $ne: req.params.id } });
            if (conflict) {
                res.status(400).json({ success: false, statusCode: 400, message: 'Branch name already exists' });
                return;
            }
        }
        const branch = yield branch_model_1.Branch.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!branch) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Branch not found' });
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'Branch updated', data: branch });
        return;
    }
    catch (error) {
        res.status(400).json({ success: false, statusCode: 400, message: error.message });
    }
});
exports.updateBranch = updateBranch;
const deleteBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branch = yield branch_model_1.Branch.findByIdAndDelete(req.params.id);
        if (!branch) {
            res.status(404).json({ success: false, statusCode: 404, message: 'Branch not found' });
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'Branch deleted' });
        return;
    }
    catch (error) {
        res.status(400).json({ success: false, statusCode: 400, message: error.message });
    }
});
exports.deleteBranch = deleteBranch;
