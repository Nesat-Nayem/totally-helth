"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboutUsRouter = void 0;
const express_1 = __importDefault(require("express"));
const aboutUs_controller_1 = require("./aboutUs.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: About Us
 *     description: About Us page management for homepage about section
 */
/**
 * @swagger
 * /v1/api/about-us:
 *   post:
 *     summary: Create or update About Us (upsert)
 *     description: Creates a new About Us record if none exists, otherwise updates the existing record
 *     tags:
 *       - About Us
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
 *             properties:
 *               title:
 *                 type: string
 *                 description: Main title
 *               subtitle:
 *                 type: string
 *                 description: Subtitle
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Main banner image
 *               infoTitle1:
 *                 type: string
 *                 description: Info section 1 title
 *               infoSubTitle1:
 *                 type: string
 *                 description: Info section 1 subtitle
 *               infoTitle2:
 *                 type: string
 *                 description: Info section 2 title
 *               infoSubTitle2:
 *                 type: string
 *                 description: Info section 2 subtitle
 *               description:
 *                 type: string
 *                 description: Main description
 *               founderTitle:
 *                 type: string
 *                 description: Founder section title
 *               founderImage:
 *                 type: string
 *                 format: binary
 *                 description: Founder image
 *               founderName:
 *                 type: string
 *                 description: Founder name
 *               founderDesignation:
 *                 type: string
 *                 description: Founder designation/title
 *               founderDescription:
 *                 type: string
 *                 description: Founder description
 *               aboutTitle:
 *                 type: string
 *                 description: About information title
 *               aboutSubTitle:
 *                 type: string
 *                 description: About information subtitle
 *               isoCertificate:
 *                 type: string
 *                 format: binary
 *                 description: ISO certificate image
 *               aboutBanner1:
 *                 type: string
 *                 format: binary
 *                 description: About banner 1
 *               aboutBanner2:
 *                 type: string
 *                 format: binary
 *                 description: About banner 2
 *               aboutBanner3:
 *                 type: string
 *                 format: binary
 *                 description: About banner 3
 *               aboutDescription:
 *                 type: string
 *                 description: About section description
 *               metaTitle:
 *                 type: string
 *                 description: Meta title for SEO
 *               metaKeywords:
 *                 type: string
 *                 description: Meta keywords for SEO
 *               metaDescription:
 *                 type: string
 *                 description: Meta description for SEO
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: About Us created successfully (first time)
 *       200:
 *         description: About Us updated successfully (subsequent times)
 *       400:
 *         description: Validation error
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'founderImage', maxCount: 1 },
    { name: 'isoCertificate', maxCount: 1 },
    { name: 'aboutBanner1', maxCount: 1 },
    { name: 'aboutBanner2', maxCount: 1 },
    { name: 'aboutBanner3', maxCount: 1 },
]), aboutUs_controller_1.upsertAboutUs);
/**
 * @swagger
 * /v1/api/about-us:
 *   get:
 *     summary: Get About Us data
 *     description: Retrieves the About Us data for the frontend (public endpoint)
 *     tags:
 *       - About Us
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status (optional)
 *     responses:
 *       200:
 *         description: About Us data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AboutUs'
 */
router.get('/', aboutUs_controller_1.getAboutUs);
/**
 * @swagger
 * /v1/api/about-us/{id}:
 *   get:
 *     summary: Get About Us by ID
 *     description: Retrieves About Us by ID (for admin)
 *     tags:
 *       - About Us
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: About Us ID
 *     responses:
 *       200:
 *         description: About Us retrieved successfully
 *       404:
 *         description: About Us not found
 */
router.get('/:id', (0, authMiddleware_1.auth)('admin'), aboutUs_controller_1.getAboutUsById);
exports.aboutUsRouter = router;
