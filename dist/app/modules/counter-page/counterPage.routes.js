"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.counterPageRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const counterPage_controller_1 = require("./counterPage.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Counter Page
 *     description: Counter page management (Total Reviews, Total Meal Items, Happy Clients, Years Helping People)
 */
/**
 * @swagger
 * /counter-page:
 *   post:
 *     summary: Create or update counter page data (upsert)
 *     description: Creates a new counter page record if none exists, otherwise updates the existing record
 *     tags:
 *       - Counter Page
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalReviews
 *               - totalMealItems
 *               - happyClients
 *               - yearsHelpingPeople
 *             properties:
 *               totalReviews:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000
 *               totalMealItems:
 *                 type: number
 *                 minimum: 0
 *                 example: 500
 *               happyClients:
 *                 type: number
 *                 minimum: 0
 *                 example: 2000
 *               yearsHelpingPeople:
 *                 type: number
 *                 minimum: 0
 *                 example: 10
 *     responses:
 *       201:
 *         description: Counter page created successfully
 *       200:
 *         description: Counter page updated successfully
 *       400:
 *         description: Validation error
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), counterPage_controller_1.upsertCounterPage);
/**
 * @swagger
 * /counter-page:
 *   get:
 *     summary: Get counter page data
 *     description: Retrieves the current counter page data
 *     tags:
 *       - Counter Page
 *     responses:
 *       200:
 *         description: Counter page data retrieved successfully
 */
router.get('/', counterPage_controller_1.getCounterPage);
exports.counterPageRouter = router;
