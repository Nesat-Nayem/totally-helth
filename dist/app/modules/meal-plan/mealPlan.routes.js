"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealPlanRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const cloudinary_1 = require("../../config/cloudinary");
const mealPlan_controller_1 = require("./mealPlan.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /meal-plans:
 *   post:
 *     summary: Create a meal plan
 *     tags:
 *       - Meal Plans
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
 *               description:
 *                 type: string
 *               badge:
 *                 type: string
 *               discount:
 *                 type: string
 *               price:
 *                 type: number
 *               delPrice:
 *                 type: number
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               kcalList:
 *                 type: string
 *                 description: JSON array or comma-separated
 *               deliveredList:
 *                 type: string
 *               suitableList:
 *                 type: string
 *               daysPerWeek:
 *                 type: string
 *               weeksOffers:
 *                 type: string
 *                 description: JSON array of {week, offer}
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Meal plan created
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 },
]), mealPlan_controller_1.createMealPlan);
/**
 * @swagger
 * /meal-plans:
 *   get:
 *     summary: Get all meal plans
 *     tags:
 *       - Meal Plans
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Comma-separated fields to include
 *     responses:
 *       200:
 *         description: List of meal plans
 */
router.get('/', mealPlan_controller_1.getAllMealPlans);
/**
 * @swagger
 * /meal-plans/{id}:
 *   get:
 *     summary: Get meal plan by ID
 *     tags:
 *       - Meal Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meal plan details
 *       404:
 *         description: Not found
 */
router.get('/:id', mealPlan_controller_1.getMealPlanById);
/**
 * @swagger
 * /meal-plans/{id}:
 *   put:
 *     summary: Update a meal plan
 *     tags:
 *       - Meal Plans
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               delPrice:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Meal plan updated
 *       404:
 *         description: Not found
 */
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 },
]), mealPlan_controller_1.updateMealPlanById);
/**
 * @swagger
 * /meal-plans/{id}:
 *   delete:
 *     summary: Delete (soft) a meal plan
 *     tags:
 *       - Meal Plans
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
 *         description: Meal plan deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), mealPlan_controller_1.deleteMealPlanById);
exports.mealPlanRouter = router;
