"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const brand_controller_1 = require("./brand.controller");
const router = express_1.default.Router();
router.get('/', brand_controller_1.getBrands);
router.get('/:id', brand_controller_1.getBrandById);
router.post('/', (0, authMiddleware_1.auth)('admin'), brand_controller_1.createBrand);
router.patch('/:id', (0, authMiddleware_1.auth)('admin'), brand_controller_1.updateBrand);
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), brand_controller_1.deleteBrand);
exports.brandRouter = router;
