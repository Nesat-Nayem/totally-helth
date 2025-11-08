import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { upsertWhyChoose, getWhyChoose, getWhyChooseById } from './whyChoose.controller';
import { upload } from '../../config/cloudinary';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Why Choose
 *     description: Why Choose management (Why Choose Totally Healthy Meal Plans section)
 */

/**
 * @swagger
 * /why-choose:
 *   post:
 *     summary: Create or update why choose (upsert) - First time creates, subsequent times updates
 *     description: Creates a new why choose record if none exists, otherwise updates the existing record
 *     tags:
 *       - Why Choose
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
 *               - subTitle
 *               - card1Icon
 *               - card1Title
 *               - card1Items
 *               - card2Icon
 *               - card2Title
 *               - card2Items
 *               - card3Icon
 *               - card3Title
 *               - card3Items
 *             properties:
 *               title:
 *                 type: string
 *                 description: Main title
 *               subTitle:
 *                 type: string
 *                 description: Subtitle
 *               card1Icon:
 *                 type: string
 *                 format: binary
 *                 description: Card 1 icon image
 *               card1Title:
 *                 type: string
 *                 description: Card 1 title
 *               card1Items:
 *                 type: string
 *                 description: Card 1 items as JSON array string or comma-separated string (e.g., "[\"Item 1\", \"Item 2\"]" or "Item 1, Item 2")
 *               card2Icon:
 *                 type: string
 *                 format: binary
 *                 description: Card 2 icon image
 *               card2Title:
 *                 type: string
 *                 description: Card 2 title
 *               card2Items:
 *                 type: string
 *                 description: Card 2 items as JSON array string or comma-separated string
 *               card3Icon:
 *                 type: string
 *                 format: binary
 *                 description: Card 3 icon image
 *               card3Title:
 *                 type: string
 *                 description: Card 3 title
 *               card3Items:
 *                 type: string
 *                 description: Card 3 items as JSON array string or comma-separated string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Why choose created successfully (first time)
 *       200:
 *         description: Why choose updated successfully (subsequent times)
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  auth('admin'),
  upload.fields([
    { name: 'card1Icon', maxCount: 1 },
    { name: 'card2Icon', maxCount: 1 },
    { name: 'card3Icon', maxCount: 1 },
  ]),
  upsertWhyChoose
);

/**
 * @swagger
 * /why-choose:
 *   get:
 *     summary: Get why choose data
 *     description: Retrieves the current why choose data (for admin and public/homepage)
 *     tags:
 *       - Why Choose
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status (optional)
 *     responses:
 *       200:
 *         description: Why choose data retrieved successfully
 */
router.get('/', getWhyChoose);

/**
 * @swagger
 * /why-choose/{id}:
 *   get:
 *     summary: Get why choose by ID
 *     description: Retrieves a specific why choose document by ID (for admin)
 *     tags:
 *       - Why Choose
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Why choose ID
 *     responses:
 *       200:
 *         description: Why choose retrieved successfully
 *       404:
 *         description: Why choose not found
 */
router.get('/:id', getWhyChooseById);

export const whyChooseRouter = router;

