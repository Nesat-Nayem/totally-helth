import express from 'express';
import { createBranch, deleteBranch, getBranchById, getBranches, updateBranch } from './branch.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Branches (Restaurants)
 *     description: Branch/Restaurant management for homepage restaurants section and locations
 */

/**
 * @swagger
 * /v1/api/branches:
 *   get:
 *     summary: Get all branches/restaurants
 *     description: Retrieves all branches for the homepage restaurants section and restaurant locations
 *     tags:
 *       - Branches (Restaurants)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Branches retrieved successfully
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
 *                     $ref: '#/components/schemas/Branch'
 */
router.get('/', getBranches);

/**
 * @swagger
 * /v1/api/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     description: Retrieves a specific branch/restaurant by its ID
 *     tags:
 *       - Branches (Restaurants)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 */
router.get('/:id', getBranchById);

/**
 * @swagger
 * /v1/api/branches:
 *   post:
 *     summary: Create a new branch/restaurant
 *     description: Creates a new branch for the restaurants section (admin only)
 *     tags:
 *       - Branches (Restaurants)
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
 *                 description: Branch/Restaurant name
 *                 example: "Downtown Branch"
 *               location:
 *                 type: string
 *                 description: Branch location/address
 *                 example: "123 Main Street, Dubai"
 *               brand:
 *                 type: string
 *                 description: Associated brand name
 *                 example: "Totally Healthy"
 *               logo:
 *                 type: string
 *                 description: Branch logo URL
 *                 example: "https://example.com/branch-logo.png"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *                 description: Branch status
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Validation error or branch already exists
 */
router.post('/', auth('admin'), createBranch);

/**
 * @swagger
 * /v1/api/branches/{id}:
 *   patch:
 *     summary: Update a branch/restaurant
 *     description: Updates an existing branch (admin only)
 *     tags:
 *       - Branches (Restaurants)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Branch name
 *               location:
 *                 type: string
 *                 description: Branch location
 *               brand:
 *                 type: string
 *                 description: Associated brand
 *               logo:
 *                 type: string
 *                 description: Branch logo URL
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Branch status
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       404:
 *         description: Branch not found
 */
router.patch('/:id', auth('admin'), updateBranch);

/**
 * @swagger
 * /v1/api/branches/{id}:
 *   delete:
 *     summary: Delete a branch/restaurant
 *     description: Deletes a branch (admin only)
 *     tags:
 *       - Branches (Restaurants)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 */
router.delete('/:id', auth('admin'), deleteBranch);

export const branchRouter = router;
