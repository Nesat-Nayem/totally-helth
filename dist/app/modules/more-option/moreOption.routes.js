"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moreOptionRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const moreOption_controller_1 = require("./moreOption.controller");
const router = express_1.default.Router();
router.get('/', (0, authMiddleware_1.auth)(), moreOption_controller_1.getMoreOptions);
router.get('/:id', (0, authMiddleware_1.auth)(), moreOption_controller_1.getMoreOptionById);
router.post('/', (0, authMiddleware_1.auth)(), moreOption_controller_1.createMoreOption);
router.patch('/:id', (0, authMiddleware_1.auth)(), moreOption_controller_1.updateMoreOption);
router.delete('/:id', (0, authMiddleware_1.auth)(), moreOption_controller_1.deleteMoreOption);
exports.moreOptionRouter = router;
