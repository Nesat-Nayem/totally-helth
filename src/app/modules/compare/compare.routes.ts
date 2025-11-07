import express from 'express';
import { upsertCompare, getCompare } from './compare.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

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
router.post(
  '/',
  auth('admin'),
  upload.fields([
    { name: 'banner1', maxCount: 1 },
    { name: 'banner2', maxCount: 1 },
  ]),
  upsertCompare
);

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
router.get('/', getCompare);

export const compareRouter = router;

