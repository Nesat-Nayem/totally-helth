import express from 'express';
import {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  deleteSubscriptionById,
} from './subscription.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /v1/api/subscriptions:
 *   post:
 *     summary: Create a subscription (public)
 *     tags:
 *       - Subscriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the subscriber
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the subscriber
 *     responses:
 *       201:
 *         description: Subscription created
 *       400:
 *         description: Validation error or email already exists
 */
// Create a new subscription (public endpoint)
router.post('/', createSubscription);

/**
 * @swagger
 * /v1/api/subscriptions:
 *   get:
 *     summary: Get all subscriptions (admin only)
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
// Get all subscriptions (admin only)
router.get('/', getAllSubscriptions);

/**
 * @swagger
 * /v1/api/subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID (admin only)
 *     tags:
 *       - Subscriptions
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
 *         description: Subscription details
 *       404:
 *         description: Not found
 */
router.get('/:id', auth('admin'), getSubscriptionById);

/**
 * @swagger
 * /v1/api/subscriptions/{id}:
 *   delete:
 *     summary: Delete (soft) a subscription (admin only)
 *     tags:
 *       - Subscriptions
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
 *         description: Subscription deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', auth('admin'), deleteSubscriptionById);

export const subscriptionRouter = router;

