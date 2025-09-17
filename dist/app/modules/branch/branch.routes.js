"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const branch_controller_1 = require("./branch.controller");
const router = express_1.default.Router();
// Public list for login branch selection
router.get('/', branch_controller_1.getBranches);
router.get('/:id', branch_controller_1.getBranchById);
// Protected admin operations
router.post('/', (0, authMiddleware_1.auth)('admin'), branch_controller_1.createBranch);
router.patch('/:id', (0, authMiddleware_1.auth)('admin'), branch_controller_1.updateBranch);
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), branch_controller_1.deleteBranch);
exports.branchRouter = router;
