"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.includedRouter = void 0;
const express_1 = __importDefault(require("express"));
const included_controller_1 = require("./included.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /v1/api/included:
 *   post:
 *     summary: Create an included meal
 *     tags:
 *       - Included Meals
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - meal_type
 *               - title
 *               - file
 *               - nutrition
 *             properties:
 *               meal_type:
 *                 type: string
 *                 enum: [BREAKFAST, LUNCH, DINNER, SNACKS]
 *               title:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Meal image
 *               nutrition:
 *                 type: string
 *                 description: JSON string with calories, fat_g, carbs_g, protein_g
 *                 example: '{"calories": 271.0, "fat_g": 15.7, "carbs_g": 28.4, "protein_g": 11.8}'
 *               allergens:
 *                 type: string
 *                 description: JSON array or comma-separated string
 *                 example: '["Dairy", "Eggs", "Spicy"]'
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Included meal created
 *       400:
 *         description: Validation error
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('file'), included_controller_1.createIncluded);
/**
 * @swagger
 * /v1/api/included:
 *   get:
 *     summary: Get all included meals
 *     tags:
 *       - Included Meals
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: meal_type
 *         schema:
 *           type: string
 *           enum: [BREAKFAST, LUNCH, DINNER]
 *         description: Filter by meal type
 *     responses:
 *       200:
 *         description: List of included meals
 */
router.get('/', included_controller_1.getAllIncluded);
/**
 * @swagger
 * /v1/api/included/{id}:
 *   get:
 *     summary: Get included meal by ID
 *     tags:
 *       - Included Meals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Included meal details
 *       404:
 *         description: Not found
 */
router.get('/:id', included_controller_1.getIncludedById);
/**
 * @swagger
 * /v1/api/included/{id}:
 *   put:
 *     summary: Update an included meal
 *     tags:
 *       - Included Meals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               meal_type:
 *                 type: string
 *                 enum: [BREAKFAST, LUNCH, DINNER, SNACKS]
 *               title:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               nutrition:
 *                 type: string
 *                 description: JSON string with calories, fat_g, carbs_g, protein_g
 *               allergens:
 *                 type: string
 *                 description: JSON array or comma-separated string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Included meal updated
 *       404:
 *         description: Not found
 */
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('file'), included_controller_1.updateIncludedById);
/**
 * @swagger
 * /v1/api/included/{id}:
 *   delete:
 *     summary: Delete (soft) an included meal
 *     tags:
 *       - Included Meals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Included meal deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), included_controller_1.deleteIncludedById);
exports.includedRouter = router;
