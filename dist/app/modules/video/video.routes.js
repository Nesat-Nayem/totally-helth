"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRouter = void 0;
const express_1 = __importDefault(require("express"));
const video_controller_1 = require("./video.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Video
 *     description: Video area management for homepage video section
 */
/**
 * @swagger
 * /v1/api/videos:
 *   post:
 *     summary: Create or update video (upsert)
 *     description: Creates a new video record if none exists, otherwise updates the existing record. Used for the homepage video area section.
 *     tags:
 *       - Video
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoUrl
 *             properties:
 *               brandLogo:
 *                 type: string
 *                 description: Brand logo URL displayed in video section
 *                 example: "https://example.com/brand-logo.png"
 *               videoUrl:
 *                 type: string
 *                 description: YouTube or video embed URL
 *                 example: "https://www.youtube.com/embed/dQw4w9WgXcQ"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *                 description: Video section status
 *     responses:
 *       201:
 *         description: Video created successfully (first time)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *       200:
 *         description: Video updated successfully (subsequent times)
 *       400:
 *         description: Validation error
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), video_controller_1.upsertVideo);
/**
 * @swagger
 * /v1/api/videos:
 *   get:
 *     summary: Get video data for frontend
 *     description: Retrieves the current video data for the homepage video area section (public endpoint)
 *     tags:
 *       - Video
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status (optional)
 *     responses:
 *       200:
 *         description: Video data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 */
router.get('/', video_controller_1.getVideo);
exports.videoRouter = router;
