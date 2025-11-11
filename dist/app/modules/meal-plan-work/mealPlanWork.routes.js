"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealPlanWorkRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const mealPlanWork_controller_1 = require("./mealPlanWork.controller");
const cloudinary_1 = require("../../config/cloudinary");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Meal Plan Work
 *     description: Meal Plan Work management (How Totally Healthy Meal Plans Work section)
 */
/**
 * @swagger
 * /meal-plan-work:
 *   post:
 *     summary: Create or update meal plan work (upsert) - First time creates, subsequent times updates
 *     description: Creates a new meal plan work record if none exists, otherwise updates the existing record
 *     tags:
 *       - Meal Plan Work
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subtitle
 *               - step1Title
 *               - step1SubTitle
 *               - step2Title
 *               - step2SubTitle
 *               - step3Title
 *               - step3SubTitle
 *               - metaTitle
 *               - metaTagKeyword
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: General title
 *               subtitle:
 *                 type: string
 *                 description: General subtitle
 *               banner1:
 *                 type: string
 *                 format: binary
 *                 description: Banner 1 image
 *               banner2:
 *                 type: string
 *                 format: binary
 *                 description: Banner 2 image
 *               step1Title:
 *                 type: string
 *                 description: Step 1 title
 *               step1SubTitle:
 *                 type: string
 *                 description: Step 1 subtitle
 *               step2Title:
 *                 type: string
 *                 description: Step 2 title
 *               step2SubTitle:
 *                 type: string
 *                 description: Step 2 subtitle
 *               step3Title:
 *                 type: string
 *                 description: Step 3 title
 *               step3SubTitle:
 *                 type: string
 *                 description: Step 3 subtitle
 *               metaTitle:
 *                 type: string
 *                 description: Meta title for SEO
 *               metaTagKeyword:
 *                 type: string
 *                 description: Meta tag keywords for SEO
 *               description:
 *                 type: string
 *                 description: Meta description
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Meal plan work created successfully (first time)
 *       200:
 *         description: Meal plan work updated successfully (subsequent times)
 *       400:
 *         description: Validation error
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([
    { name: 'banner1', maxCount: 1 },
    { name: 'banner2', maxCount: 1 },
]), mealPlanWork_controller_1.upsertMealPlanWork);
/**
 * @swagger
 * /meal-plan-work:
 *   get:
 *     summary: Get meal plan work data
 *     description: Retrieves the current meal plan work data (for admin and public/homepage)
 *     tags:
 *       - Meal Plan Work
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status (optional)
 *     responses:
 *       200:
 *         description: Meal plan work data retrieved successfully
 */
router.get('/', mealPlanWork_controller_1.getMealPlanWork);
/**
 * @swagger
 * /meal-plan-work/{id}:
 *   get:
 *     summary: Get meal plan work by ID
 *     description: Retrieves a specific meal plan work document by ID (for admin)
 *     tags:
 *       - Meal Plan Work
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal plan work ID
 *     responses:
 *       200:
 *         description: Meal plan work retrieved successfully
 *       404:
 *         description: Meal plan work not found
 */
router.get('/:id', (0, authMiddleware_1.auth)('admin'), mealPlanWork_controller_1.getMealPlanWorkById);
exports.mealPlanWorkRouter = router;
