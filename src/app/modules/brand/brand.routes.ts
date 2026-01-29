import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from './brand.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Brands
 *     description: Brand management for homepage brands section
 */

/**
 * @swagger
 * /v1/api/brands:
 *   get:
 *     summary: Get all brands
 *     description: Retrieves all brands for the homepage brands section
 *     tags:
 *       - Brands
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 */
router.get('/', getBrands);

/**
 * @swagger
 * /v1/api/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     description: Retrieves a specific brand by its ID
 *     tags:
 *       - Brands
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 */
router.get('/:id', getBrandById);

/**
 * @swagger
 * /v1/api/brands:
 *   post:
 *     summary: Create a new brand
 *     description: Creates a new brand for the homepage brands section (admin only)
 *     tags:
 *       - Brands
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Brand name
 *                 example: "Nike"
 *               logo:
 *                 type: string
 *                 description: Brand logo URL
 *                 example: "https://example.com/logo.png"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *                 description: Brand status
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Validation error or brand already exists
 */
router.post('/', auth(), createBrand);

/**
 * @swagger
 * /v1/api/brands/{id}:
 *   patch:
 *     summary: Update a brand
 *     description: Updates an existing brand (admin only)
 *     tags:
 *       - Brands
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Brand name
 *               logo:
 *                 type: string
 *                 description: Brand logo URL
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Brand status
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       404:
 *         description: Brand not found
 */
router.patch('/:id', auth(), updateBrand);

/**
 * @swagger
 * /v1/api/brands/{id}:
 *   delete:
 *     summary: Delete a brand
 *     description: Deletes a brand (admin only)
 *     tags:
 *       - Brands
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 */
router.delete('/:id', auth(), deleteBrand);

export const brandRouter = router;
