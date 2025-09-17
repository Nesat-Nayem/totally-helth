"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregatorRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const aggregator_controller_1 = require("./aggregator.controller");
const router = express_1.default.Router();
router.get('/', aggregator_controller_1.getAggregators);
router.get('/:id', aggregator_controller_1.getAggregatorById);
router.post('/', (0, authMiddleware_1.auth)('admin'), aggregator_controller_1.createAggregator);
router.patch('/:id', (0, authMiddleware_1.auth)('admin'), aggregator_controller_1.updateAggregator);
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), aggregator_controller_1.deleteAggregator);
exports.aggregatorRouter = router;
