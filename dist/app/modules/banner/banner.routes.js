"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerRouter = void 0;
const express_1 = __importDefault(require("express"));
const banner_controller_1 = require("./banner.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /v1/api/banners:
 *   post:
 *     summary: Create a banner
 *     tags:
 *       - Banners
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
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Banner image
 *               stock:
 *                 type: integer
 *                 description: Google review count
 *               tag:
 *                 type: string
 *                 format: binary
 *                 description: Certification logo
 *               description:
 *                 type: string
 *               meta:
 *                 type: string
 *                 description: Meta title
 *               description2:
 *                 type: string
 *                 description: Meta description
 *               metaTag:
 *                 type: string
 *                 description: Meta keywords
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Banner created
 *       400:
 *         description: Validation error
 */
// Create a new banner with image uploads (banner image and certification logo)
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([{ name: 'file', maxCount: 1 }, { name: 'tag', maxCount: 1 }]), banner_controller_1.createBanner);
/**
 * @swagger
 * /v1/api/banners:
 *   get:
 *     summary: Get all banners
 *     tags:
 *       - Banners
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of banners
 */
router.get('/', banner_controller_1.getAllBanners);
/**
 * @swagger
 * /v1/api/banners/{id}:
 *   get:
 *     summary: Get banner by ID
 *     tags:
 *       - Banners
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner details
 *       404:
 *         description: Not found
 */
router.get('/:id', banner_controller_1.getBannerById);
/**
 * @swagger
 * /v1/api/banners/{id}:
 *   put:
 *     summary: Update a banner
 *     tags:
 *       - Banners
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
 *               title:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               tag:
 *                 type: string
 *                 format: binary
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               meta:
 *                 type: string
 *               description2:
 *                 type: string
 *               metaTag:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Banner updated
 *       404:
 *         description: Not found
 */
// Update a banner by ID with optional image uploads
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([{ name: 'file', maxCount: 1 }, { name: 'tag', maxCount: 1 }]), banner_controller_1.updateBannerById);
/**
 * @swagger
 * /v1/api/banners/{id}:
 *   delete:
 *     summary: Delete (soft) a banner
 *     tags:
 *       - Banners
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
 *         description: Banner deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), banner_controller_1.deleteBannerById);
exports.bannerRouter = router;
