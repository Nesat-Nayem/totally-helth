"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvedByRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../middlewares/authMiddleware");
const approvedBy_controller_1 = require("./approvedBy.controller");
const router = express_1.default.Router();
router.get('/', approvedBy_controller_1.getApprovedBys);
router.get('/:id', approvedBy_controller_1.getApprovedById);
router.post('/', (0, authMiddleware_1.auth)(), approvedBy_controller_1.createApprovedBy);
router.patch('/:id', (0, authMiddleware_1.auth)(), approvedBy_controller_1.updateApprovedBy);
router.delete('/:id', (0, authMiddleware_1.auth)(), approvedBy_controller_1.deleteApprovedBy);
exports.approvedByRouter = router;
