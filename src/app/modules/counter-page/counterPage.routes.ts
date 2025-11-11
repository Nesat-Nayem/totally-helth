import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { upsertCounterPage, getCounterPage } from './counterPage.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Counter Page
 *     description: Counter page management (Total Reviews, Total Meal Items, Happy Clients, Years Helping People)
 */

/**
 * @swagger
 * /counter-page:
 *   post:
 *     summary: Create or update counter page data (upsert)
 *     description: Creates a new counter page record if none exists, otherwise updates the existing record
 *     tags:
 *       - Counter Page
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalReviews
 *               - totalMealItems
 *               - happyClients
 *               - yearsHelpingPeople
 *             properties:
 *               totalReviews:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000
 *               totalMealItems:
 *                 type: number
 *                 minimum: 0
 *                 example: 500
 *               happyClients:
 *                 type: number
 *                 minimum: 0
 *                 example: 2000
 *               yearsHelpingPeople:
 *                 type: number
 *                 minimum: 0
 *                 example: 10
 *     responses:
 *       201:
 *         description: Counter page created successfully
 *       200:
 *         description: Counter page updated successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth('admin'), upsertCounterPage);

/**
 * @swagger
 * /counter-page:
 *   get:
 *     summary: Get counter page data
 *     description: Retrieves the current counter page data
 *     tags:
 *       - Counter Page
 *     responses:
 *       200:
 *         description: Counter page data retrieved successfully
 */
router.get('/', getCounterPage);

export const counterPageRouter = router;

