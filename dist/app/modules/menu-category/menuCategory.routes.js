"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCategoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const menuCategory_controller_1 = require("./menuCategory.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Menu Categories
 *     description: Menu category management for restaurant menus
 */
/**
 * @swagger
 * /v1/api/menu-categories:
 *   get:
 *     summary: Get all menu categories
 *     description: Retrieves all menu categories for restaurant menus
 *     tags:
 *       - Menu Categories
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Menu categories retrieved successfully
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
 *                     $ref: '#/components/schemas/MenuCategory'
 */
router.get('/', menuCategory_controller_1.getMenuCategories);
/**
 * @swagger
 * /v1/api/menu-categories/{id}:
 *   get:
 *     summary: Get menu category by ID
 *     description: Retrieves a specific menu category by its ID
 *     tags:
 *       - Menu Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu category ID
 *     responses:
 *       200:
 *         description: Menu category retrieved successfully
 *       404:
 *         description: Menu category not found
 */
router.get('/:id', menuCategory_controller_1.getMenuCategoryById);
/**
 * @swagger
 * /v1/api/menu-categories:
 *   post:
 *     summary: Create a new menu category
 *     description: Creates a new menu category (admin only)
 *     tags:
 *       - Menu Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Category name
 *                 example: "Breakfast"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Menu category created successfully
 *       400:
 *         description: Validation error or category already exists
 */
router.post('/', (0, authMiddleware_1.auth)(), menuCategory_controller_1.createMenuCategory);
/**
 * @swagger
 * /v1/api/menu-categories/{id}:
 *   patch:
 *     summary: Update a menu category
 *     description: Updates an existing menu category (admin only)
 *     tags:
 *       - Menu Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Menu category updated successfully
 *       404:
 *         description: Menu category not found
 */
router.patch('/:id', (0, authMiddleware_1.auth)(), menuCategory_controller_1.updateMenuCategory);
/**
 * @swagger
 * /v1/api/menu-categories/{id}:
 *   delete:
 *     summary: Delete a menu category
 *     description: Soft deletes a menu category (admin only)
 *     tags:
 *       - Menu Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu category ID
 *     responses:
 *       200:
 *         description: Menu category deleted successfully
 *       404:
 *         description: Menu category not found
 */
router.delete('/:id', (0, authMiddleware_1.auth)(), menuCategory_controller_1.deleteMenuCategory);
exports.menuCategoryRouter = router;
