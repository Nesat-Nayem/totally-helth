import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { upsertGetInTouch, getGetInTouch } from './getInTouch.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Get In Touch
 *     description: Get In Touch management (Title, Office Address, Contact Numbers, Email Addresses, Career Info)
 */

/**
 * @swagger
 * /get-in-touch:
 *   get:
 *     summary: Get Get In Touch data
 *     description: Retrieves the current Get In Touch data. Returns null data if no record exists (no error).
 *     tags:
 *       - Get In Touch
 *     responses:
 *       200:
 *         description: Get In Touch data retrieved successfully or null if no data exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 */
router.get('/', getGetInTouch);

/**
 * @swagger
 * /get-in-touch/{id}:
 *   get:
 *     summary: Get Get In Touch data by ID
 *     description: Retrieves Get In Touch data by specific ID. Returns null data if no record exists (no error).
 *     tags:
 *       - Get In Touch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Get In Touch ID
 *     responses:
 *       200:
 *         description: Get In Touch data retrieved successfully or null if no data exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 */
router.get('/:id', getGetInTouch);

/**
 * @swagger
 * /get-in-touch/{id}:
 *   put:
 *     summary: Create or update Get In Touch data (single API for both operations)
 *     description: |
 *       Single API endpoint that handles both create and update:
 *       - First time (ID doesn't exist): Creates a new record with the specified ID
 *       - Second time (same ID exists): Updates the existing record
 *     tags:
 *       - Get In Touch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Get In Touch ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - officeAddress
 *               - contactNumbers
 *               - emailAddresses
 *               - careerInfo
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Get In Touch"
 *               officeAddress:
 *                 type: string
 *                 example: "Floor 15, Tower X2, Cluster X, Jumeirah Lakes Towers, Dubai, UAE. P.O. Box 391150"
 *               contactNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["(+91) 9090909090", "(+91) 9876543210"]
 *               emailAddresses:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["Info@mealplans.com", "support@mealplans.com"]
 *               careerInfo:
 *                 type: string
 *                 example: "If you're interested in employment opportunities at Unicoder, please email us: support@mealplans.com"
 *     responses:
 *       201:
 *         description: Get In Touch created successfully (first time)
 *       200:
 *         description: Get In Touch updated successfully (subsequent calls with same ID)
 *       400:
 *         description: Validation error or invalid ID format
 */
router.put('/:id', auth('admin'), upsertGetInTouch);

export const getInTouchRouter = router;

