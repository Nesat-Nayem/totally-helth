"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRouter = void 0;
const express_1 = __importDefault(require("express"));
const branch_controller_1 = require("./branch.controller");
const router = express_1.default.Router();
// Get branches
router.get('/', branch_controller_1.getBranches);
router.get('/:id', branch_controller_1.getBranchById);
// Branch operations - no authorization required
router.post('/', branch_controller_1.createBranch);
router.patch('/:id', branch_controller_1.updateBranch);
router.delete('/:id', branch_controller_1.deleteBranch);
exports.branchRouter = router;
