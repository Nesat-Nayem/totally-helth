import express from 'express';
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getActiveTestimonials,
} from './testimonial.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Testimonials
 *     description: Testimonial management
 */

/**
 * @swagger
 * /testimonials:
 *   post:
 *     summary: Create a new testimonial (admin only)
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quote
 *               - authorName
 *               - authorProfession
 *             properties:
 *               quote:
 *                 type: string
 *               authorName:
 *                 type: string
 *               authorProfession:
 *                 type: string
 *               order:
 *                 type: number
 *                 default: 0
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth('admin'), createTestimonial);

/**
 * @swagger
 * /testimonials:
 *   get:
 *     summary: Get all testimonials (admin only)
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Testimonials retrieved successfully
 */
router.get('/', getAllTestimonials);

/**
 * @swagger
 * /testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID (admin only)
 *     tags:
 *       - Testimonials
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
 *         description: Testimonial retrieved successfully
 *       404:
 *         description: Testimonial not found
 */
router.get('/:id', getTestimonialById);

/**
 * @swagger
 * /testimonials/{id}:
 *   put:
 *     summary: Update testimonial (admin only)
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quote:
 *                 type: string
 *               authorName:
 *                 type: string
 *               authorProfession:
 *                 type: string
 *               order:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *       404:
 *         description: Testimonial not found
 */
router.put('/:id', auth('admin'), updateTestimonial);

/**
 * @swagger
 * /testimonials/{id}:
 *   delete:
 *     summary: Delete testimonial (admin only)
 *     tags:
 *       - Testimonials
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
 *         description: Testimonial deleted successfully
 *       404:
 *         description: Testimonial not found
 */
router.delete('/:id', auth('admin'), deleteTestimonial);

/**
 * @swagger
 * /testimonials/public/active:
 *   get:
 *     summary: Get active testimonials for frontend (public)
 *     tags:
 *       - Testimonials
 *     responses:
 *       200:
 *         description: Active testimonials retrieved successfully
 */
router.get('/public/active', getActiveTestimonials);

export const testimonialRouter = router;

