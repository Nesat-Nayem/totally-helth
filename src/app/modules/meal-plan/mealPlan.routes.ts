import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { upload } from '../../config/cloudinary';
import {
  createMealPlan,
  getAllMealPlans,
  getMealPlanById,
  updateMealPlanById,
  deleteMealPlanById,
} from './mealPlan.controller';

const router = express.Router();

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
router.post(
  '/',
  auth('admin'),
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  createMealPlan
);

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
router.get('/', getAllMealPlans);

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
router.get('/:id', getMealPlanById);

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
router.put(
  '/:id',
  auth('admin'),
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  updateMealPlanById
);

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
router.delete('/:id', auth('admin'), deleteMealPlanById);

export const mealPlanRouter = router;
