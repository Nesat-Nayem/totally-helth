import { Router } from 'express';
import { UserMembershipController } from './userMembership.controller';

const router = Router();

/**
 * @swagger
 * /v1/api/user-memberships:
 *   post:
 *     summary: Create a new user membership
 *     tags: [User Memberships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - mealPlanId
 *               - totalMeals
 *               - endDate
 *             properties:
 *               userId:
 *                 type: string
 *               mealPlanId:
 *                 type: string
 *               totalMeals:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: User membership created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /v1/api/user-memberships:
 *   get:
 *     summary: Get all user memberships
 *     tags: [User Memberships]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, cancelled, completed]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User memberships retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 * 
 * /v1/api/user-memberships/{id}:
 *   get:
 *     summary: Get user membership by ID
 *     tags: [User Memberships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     responses:
 *       200:
 *         description: User membership retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User membership not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /v1/api/user-memberships/{id}:
 *   put:
 *     summary: Update user membership
 *     tags: [User Memberships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remainingMeals:
 *                 type: number
 *               consumedMeals:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, expired, cancelled, completed]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User membership updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User membership not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /v1/api/user-memberships/{id}:
 *   delete:
 *     summary: Delete user membership
 *     tags: [User Memberships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     responses:
 *       200:
 *         description: User membership deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User membership not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Create user membership
router.post('/', UserMembershipController.createUserMembership);

// Get all user memberships
router.get('/', UserMembershipController.getUserMemberships);

// Get user membership by ID
router.get('/:id', UserMembershipController.getUserMembership);

// Update user membership
router.put('/:id', UserMembershipController.updateUserMembership);

// Consume meals (incremental)
router.post('/:id/consume', UserMembershipController.consumeMeals);

// Delete user membership
router.delete('/:id', UserMembershipController.deleteUserMembership);

export default router;
