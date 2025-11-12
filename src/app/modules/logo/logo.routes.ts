import express from 'express';
import {
  createLogo,
  getAllLogos,
  getLogoById,
  updateLogoById,
  deleteLogoById,
} from './logo.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /v1/api/logos:
 *   post:
 *     summary: Create a logo
 *     tags:
 *       - Logos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Logo image
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Logo created
 *       400:
 *         description: Validation error
 */
// Create a new logo with image upload
router.post('/', auth('admin'), upload.single('file'), createLogo);

/**
 * @swagger
 * /v1/api/logos:
 *   get:
 *     summary: Get all logos
 *     tags:
 *       - Logos
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of logos
 */
router.get('/', getAllLogos);

/**
 * @swagger
 * /v1/api/logos/{id}:
 *   get:
 *     summary: Get logo by ID
 *     tags:
 *       - Logos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logo details
 *       404:
 *         description: Not found
 */
router.get('/:id', getLogoById);

/**
 * @swagger
 * /v1/api/logos/{id}:
 *   put:
 *     summary: Update a logo
 *     tags:
 *       - Logos
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
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Logo image (optional)
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Logo updated
 *       404:
 *         description: Not found
 */
router.put('/:id', auth('admin'), upload.single('file'), updateLogoById);

/**
 * @swagger
 * /v1/api/logos/{id}:
 *   delete:
 *     summary: Delete (soft) a logo
 *     tags:
 *       - Logos
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
 *         description: Logo deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', auth('admin'), deleteLogoById);

export const logoRouter = router;

