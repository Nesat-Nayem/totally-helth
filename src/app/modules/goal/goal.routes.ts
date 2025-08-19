import express from 'express';
import { createGoal, deleteGoalById, getAllGoals, getGoalById, updateGoalById } from './goal.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

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
 *     summary: Create a goal
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
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Goal created
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  auth('admin'),
  upload.fields([
    { name: 'section1Icon', maxCount: 1 },
    { name: 'section2Icon', maxCount: 1 },
    { name: 'section3Icon', maxCount: 1 },
  ]),
  createGoal
);

/**
 * @swagger
 * /goals:
 *   get:
 *     summary: Get all goals
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
 *         description: List of goals
 */
router.get('/', getAllGoals);

/**
 * @swagger
 * /goals/{id}:
 *   get:
 *     summary: Get goal by ID
 *     tags:
 *       - Goals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal details
 *       404:
 *         description: Not found
 */
router.get('/:id', getGoalById);

/**
 * @swagger
 * /goals/{id}:
 *   put:
 *     summary: Update a goal
 *     tags:
 *       - Goals
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
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Goal updated
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  auth('admin'),
  upload.fields([
    { name: 'section1Icon', maxCount: 1 },
    { name: 'section2Icon', maxCount: 1 },
    { name: 'section3Icon', maxCount: 1 },
  ]),
  updateGoalById
);

/**
 * @swagger
 * /goals/{id}:
 *   delete:
 *     summary: Delete (soft) a goal
 *     tags:
 *       - Goals
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
 *         description: Goal deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', auth('admin'), deleteGoalById);

export const goalRouter = router;
