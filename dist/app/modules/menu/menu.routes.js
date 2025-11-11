"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const menu_controller_1 = require("./menu.controller");
const router = express_1.default.Router();
router.get('/', menu_controller_1.getMenus);
router.get('/:id', menu_controller_1.getMenuById);
router.post('/', (0, authMiddleware_1.auth)(), menu_controller_1.createMenu);
router.patch('/:id', (0, authMiddleware_1.auth)(), menu_controller_1.updateMenu);
router.delete('/:id', (0, authMiddleware_1.auth)(), menu_controller_1.deleteMenu);
exports.menuRouter = router;
