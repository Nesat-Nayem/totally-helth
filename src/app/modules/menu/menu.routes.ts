import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createMenu, deleteMenu, getMenuById, getMenus, updateMenu } from './menu.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Restaurant Menus
 *     description: Restaurant menu items management for homepage restaurants menu section
 */

/**
 * @swagger
 * /v1/api/menus:
 *   get:
 *     summary: Get all restaurant menu items
 *     description: Retrieves all menu items for the restaurants menu section
 *     tags:
 *       - Restaurant Menus
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *     responses:
 *       200:
 *         description: Menu items retrieved successfully
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
 *                     $ref: '#/components/schemas/Menu'
 */
router.get('/', getMenus);

/**
 * @swagger
 * /v1/api/menus/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     description: Retrieves a specific menu item by its ID
 *     tags:
 *       - Restaurant Menus
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *       404:
 *         description: Menu item not found
 */
router.get('/:id', getMenuById);

/**
 * @swagger
 * /v1/api/menus:
 *   post:
 *     summary: Create a new menu item
 *     description: Creates a new restaurant menu item (admin only)
 *     tags:
 *       - Restaurant Menus
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
 *                 description: Menu item name
 *                 example: "Grilled Chicken Salad"
 *               description:
 *                 type: string
 *                 description: Menu item description
 *               image:
 *                 type: string
 *                 description: Main image URL
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Additional image URLs
 *               restaurantPrice:
 *                 type: number
 *                 description: Dine-in price
 *               restaurantVat:
 *                 type: number
 *                 description: Dine-in VAT amount
 *               restaurantTotalPrice:
 *                 type: number
 *                 description: Dine-in total price with VAT
 *               onlinePrice:
 *                 type: number
 *                 description: Online order price
 *               onlineVat:
 *                 type: number
 *                 description: Online VAT amount
 *               onlineTotalPrice:
 *                 type: number
 *                 description: Online total price with VAT
 *               membershipPrice:
 *                 type: number
 *                 description: Membership price
 *               membershipVat:
 *                 type: number
 *                 description: Membership VAT amount
 *               membershipTotalPrice:
 *                 type: number
 *                 description: Membership total price with VAT
 *               category:
 *                 type: string
 *                 description: Menu category ID
 *               brands:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Associated brand IDs
 *               branches:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Associated branch IDs
 *               calories:
 *                 type: number
 *                 description: Calories per serving
 *               protein:
 *                 type: number
 *                 description: Protein in grams
 *               carbs:
 *                 type: number
 *                 description: Carbohydrates in grams
 *               fibre:
 *                 type: number
 *                 description: Fibre in grams
 *               sugars:
 *                 type: number
 *                 description: Sugars in grams
 *               sodium:
 *                 type: number
 *                 description: Sodium in mg
 *               iron:
 *                 type: number
 *                 description: Iron in mg
 *               calcium:
 *                 type: number
 *                 description: Calcium in mg
 *               vitaminC:
 *                 type: number
 *                 description: Vitamin C in mg
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth(), createMenu);

/**
 * @swagger
 * /v1/api/menus/{id}:
 *   patch:
 *     summary: Update a menu item
 *     description: Updates an existing menu item (admin only)
 *     tags:
 *       - Restaurant Menus
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               restaurantPrice:
 *                 type: number
 *               restaurantVat:
 *                 type: number
 *               restaurantTotalPrice:
 *                 type: number
 *               onlinePrice:
 *                 type: number
 *               onlineVat:
 *                 type: number
 *               onlineTotalPrice:
 *                 type: number
 *               membershipPrice:
 *                 type: number
 *               membershipVat:
 *                 type: number
 *               membershipTotalPrice:
 *                 type: number
 *               category:
 *                 type: string
 *               brands:
 *                 type: array
 *                 items:
 *                   type: string
 *               branches:
 *                 type: array
 *                 items:
 *                   type: string
 *               calories:
 *                 type: number
 *               protein:
 *                 type: number
 *               carbs:
 *                 type: number
 *               fibre:
 *                 type: number
 *               sugars:
 *                 type: number
 *               sodium:
 *                 type: number
 *               iron:
 *                 type: number
 *               calcium:
 *                 type: number
 *               vitaminC:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       404:
 *         description: Menu item not found
 */
router.patch('/:id', auth(), updateMenu);

/**
 * @swagger
 * /v1/api/menus/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     description: Soft deletes a menu item (admin only)
 *     tags:
 *       - Restaurant Menus
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       404:
 *         description: Menu item not found
 */
router.delete('/:id', auth(), deleteMenu);

export const menuRouter = router;
