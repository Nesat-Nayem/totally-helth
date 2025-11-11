"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalRouter = void 0;
const express_1 = __importDefault(require("express"));
const goal_controller_1 = require("./goal.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Goals
 *     description: Goal management
 */
/**
 * @swagger
 * /goals:
 *   post:
 *     summary: Create or update goal (upsert) - First time creates, subsequent times updates
 *     tags:
 *       - Goals
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
 *               subtitle:
 *                 type: string
 *               section1Title:
 *                 type: string
 *               section1Description:
 *                 type: string
 *               section1Icon:
 *                 type: string
 *                 format: binary
 *               section2Title:
 *                 type: string
 *               section2Description:
 *                 type: string
 *               section2Icon:
 *                 type: string
 *                 format: binary
 *               section3Title:
 *                 type: string
 *               section3Description:
 *                 type: string
 *               section3Icon:
 *                 type: string
 *                 format: binary
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               metaKeywords:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Goal created (first time)
 *       200:
 *         description: Goal updated (subsequent times)
 *       400:
 *         description: Validation error
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.fields([
    { name: 'section1Icon', maxCount: 1 },
    { name: 'section2Icon', maxCount: 1 },
    { name: 'section3Icon', maxCount: 1 },
]), goal_controller_1.upsertGoal);
/**
 * @swagger
 * /goals:
 *   get:
 *     summary: Get goal for frontend (returns single active goal)
 *     tags:
 *       - Goals
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Goal retrieved successfully
 */
router.get('/', goal_controller_1.getGoal);
exports.goalRouter = router;
