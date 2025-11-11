"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../middlewares/authMiddleware");
const supplier_controller_1 = require("./supplier.controller");
const router = express_1.default.Router();
router.get('/', supplier_controller_1.getSuppliers);
router.get('/:id', supplier_controller_1.getSupplierById);
router.post('/', (0, authMiddleware_1.auth)(), supplier_controller_1.createSupplier);
router.patch('/:id', (0, authMiddleware_1.auth)(), supplier_controller_1.updateSupplier);
router.delete('/:id', (0, authMiddleware_1.auth)(), supplier_controller_1.deleteSupplier);
exports.supplierRouter = router;
