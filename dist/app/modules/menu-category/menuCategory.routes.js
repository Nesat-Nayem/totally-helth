"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCategoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const menuCategory_controller_1 = require("./menuCategory.controller");
const router = express_1.default.Router();
router.get('/', menuCategory_controller_1.getMenuCategories);
router.get('/:id', menuCategory_controller_1.getMenuCategoryById);
router.post('/', (0, authMiddleware_1.auth)(), menuCategory_controller_1.createMenuCategory);
router.patch('/:id', (0, authMiddleware_1.auth)(), menuCategory_controller_1.updateMenuCategory);
router.delete('/:id', (0, authMiddleware_1.auth)(), menuCategory_controller_1.deleteMenuCategory);
exports.menuCategoryRouter = router;
