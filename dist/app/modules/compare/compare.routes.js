"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareRouter = void 0;
const express_1 = __importDefault(require("express"));
const compare_controller_1 = require("./compare.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Compare
 *     description: Compare management
 */
/**
 * @swagger
 * /compare:
 *   post:
 *     summary: Create or update compare (upsert) - First time creates, subsequent times updates
 *     tags:
 *       - Compare
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               banner1:
 *                 type: string
 *                 format: binary
 *               banner2:
 *                 type: string
 *                 format: binary
 *               compareItems:
 *                 type: string
 *                 description: JSON array of compare items
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Compare created (first time)
 *       200:
 *         description: Compare updated (subsequent times)
 *       400:
 *         description: Validation error
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([
    { name: 'banner1', maxCount: 1 },
    { name: 'banner2', maxCount: 1 },
]), compare_controller_1.upsertCompare);
/**
 * @swagger
 * /compare:
 *   get:
 *     summary: Get compare for frontend (returns single active compare, banner2 as image1)
 *     tags:
 *       - Compare
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Compare retrieved successfully
 */
router.get('/', compare_controller_1.getCompare);
exports.compareRouter = router;
