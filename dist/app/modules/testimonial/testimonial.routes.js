"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonialRouter = void 0;
const express_1 = __importDefault(require("express"));
const testimonial_controller_1 = require("./testimonial.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
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
router.post('/', (0, authMiddleware_1.auth)('admin'), testimonial_controller_1.createTestimonial);
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
router.get('/', testimonial_controller_1.getAllTestimonials);
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
router.get('/:id', testimonial_controller_1.getTestimonialById);
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
router.put('/:id', (0, authMiddleware_1.auth)('admin'), testimonial_controller_1.updateTestimonial);
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
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), testimonial_controller_1.deleteTestimonial);
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
router.get('/public/active', testimonial_controller_1.getActiveTestimonials);
exports.testimonialRouter = router;
