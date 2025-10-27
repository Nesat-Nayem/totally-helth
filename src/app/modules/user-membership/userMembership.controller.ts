import { Request, Response, NextFunction } from 'express';
import { UserMembership } from './userMembership.model';
import { MealPlan } from '../meal-plan/mealPlan.model';
import { appError } from '../../errors/appError';
import handleZodError from '../../errors/handleZodError';
import { 
  createUserMembershipSchema,
  updateUserMembershipSchema,
  getUserMembershipSchema,
  getUserMembershipsSchema,
  deleteUserMembershipSchema
} from './userMembership.validation';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserMembership:
 *       type: object
 *       required:
 *         - userId
 *         - mealPlanId
 *         - totalMeals
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the membership
 *         userId:
 *           type: string
 *           description: Reference to User
 *         mealPlanId:
 *           type: string
 *           description: Reference to MealPlan
 *         totalMeals:
 *           type: number
 *           description: Total number of meals in the membership
 *         remainingMeals:
 *           type: number
 *           description: Number of meals remaining
 *         consumedMeals:
 *           type: number
 *           description: Number of meals consumed
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the membership started
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the membership expires
 *         status:
 *           type: string
 *           enum: [active, expired, cancelled, completed]
 *           description: Membership status
 *         isActive:
 *           type: boolean
 *           description: Quick status check
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export class UserMembershipController {
  /**
   * @swagger
   * /api/v1/user-memberships:
   *   post:
   *     summary: Create a new user membership
   *     tags: [User Memberships]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - mealPlanId
   *               - totalMeals
   *               - endDate
   *             properties:
   *               userId:
   *                 type: string
   *               mealPlanId:
   *                 type: string
   *               totalMeals:
   *                 type: number
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: User membership created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async createUserMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createUserMembershipSchema.parse({ body: req.body });
      const { userId, mealPlanId, totalMeals, startDate, endDate } = validated.body;

      // Verify meal plan exists
      const mealPlan = await MealPlan.findById(mealPlanId);
      if (!mealPlan) {
        throw new appError('Meal plan not found', 404);
      }

       const membership = new UserMembership({
         userId,
         mealPlanId,
         totalMeals,
         remainingMeals: totalMeals,
         consumedMeals: 0,
         startDate: startDate ? new Date(startDate) : new Date(),
         endDate: new Date(endDate),
         status: 'active',
         isActive: true,
         history: [{
           action: 'created',
           consumedMeals: 0,
           remainingMeals: totalMeals,
           mealsChanged: 0,
           mealType: 'general',
           timestamp: new Date(),
           notes: 'Membership created'
         }]
       });

      await membership.save();

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'User membership created successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/user-memberships:
   *   get:
   *     summary: Get all user memberships
   *     tags: [User Memberships]
   *     parameters:
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *         description: Filter by user ID
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, expired, cancelled, completed]
   *         description: Filter by status
   *       - in: query
   *         name: page
   *         schema:
   *           type: string
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: string
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: User memberships retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   */
  static async getUserMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getUserMembershipsSchema.parse({ query: req.query });
      const { userId, status, page = '1', limit = '10' } = validated.query;

      const filter: any = {};
      if (userId) filter.userId = userId;
      if (status) filter.status = status;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const memberships = await UserMembership.find(filter)
        .populate('userId', 'name email phone')
        .populate('mealPlanId', 'title description price totalMeals durationDays')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await UserMembership.countDocuments(filter);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User memberships retrieved successfully',
        data: {
          memberships,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/user-memberships/{id}:
   *   get:
   *     summary: Get user membership by ID
   *     tags: [User Memberships]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Membership ID
   *     responses:
   *       200:
   *         description: User membership retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: User membership not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getUserMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getUserMembershipSchema.parse({ params: req.params });
      const { id } = validated.params;

      const membership = await UserMembership.findById(id)
        .populate('userId', 'name email phone')
        .populate('mealPlanId', 'title description price totalMeals durationDays');

      if (!membership) {
        throw new appError('User membership not found', 404);
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User membership retrieved successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/user-memberships/{id}:
   *   put:
   *     summary: Update user membership
   *     tags: [User Memberships]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Membership ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               remainingMeals:
   *                 type: number
   *               consumedMeals:
   *                 type: number
   *               status:
   *                 type: string
   *                 enum: [active, expired, cancelled, completed]
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: User membership updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: User membership not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async updateUserMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateUserMembershipSchema.parse({ 
        params: req.params, 
        body: req.body 
      });
      const { id } = validated.params;
      const updateData = validated.body;

      // Get the current membership to check total meals
      const currentMembership = await UserMembership.findById(id);
      if (!currentMembership) {
        throw new appError('User membership not found', 404);
      }

       // Simple incremental calculation with history tracking
       if (updateData.consumedMeals !== undefined || updateData.remainingMeals !== undefined) {
         const currentConsumed = currentMembership.consumedMeals;
         const currentRemaining = currentMembership.remainingMeals;
         let newConsumed = currentConsumed;
         let newRemaining = currentRemaining;
         let mealsChanged = 0;
         let action = 'consumed';
         
         // If consumed meals is provided, treat as incremental consumption
         if (updateData.consumedMeals !== undefined) {
           if (updateData.consumedMeals < 0) {
             throw new appError('Consumed meals cannot be negative', 400);
           }
           
           const requestedConsumed = updateData.consumedMeals;
           
           // Always treat as incremental consumption
           mealsChanged = requestedConsumed;
           
           // Check if we can add this many meals
           if (mealsChanged > currentRemaining) {
             throw new appError(`Cannot consume ${mealsChanged} meals. Only ${currentRemaining} meals remaining`, 400);
           }
           
           // Add consumed meals incrementally
           newConsumed = currentConsumed + mealsChanged;
           newRemaining = currentRemaining - mealsChanged;
         }
         
         // If remaining meals is provided, calculate how many meals were consumed
         if (updateData.remainingMeals !== undefined) {
           if (updateData.remainingMeals < 0) {
             throw new appError('Remaining meals cannot be negative', 400);
           }
           
           const requestedRemaining = updateData.remainingMeals;
           mealsChanged = currentRemaining - requestedRemaining;
           
           // Check if we can consume this many meals
           if (mealsChanged > currentRemaining) {
             throw new appError(`Cannot consume ${mealsChanged} meals. Only ${currentRemaining} meals remaining`, 400);
           }
           
           if (mealsChanged < 0) {
             throw new appError(`Cannot increase remaining meals above current amount (${currentRemaining})`, 400);
           }
           
           // Update remaining and consumed
           newRemaining = requestedRemaining;
           newConsumed = currentConsumed + mealsChanged;
         }
         
         // Add to history
         const historyEntry = {
           action,
           consumedMeals: newConsumed,
           remainingMeals: newRemaining,
           mealsChanged,
           mealType: 'general',
           timestamp: new Date(),
           notes: `Consumed ${mealsChanged} meals: ${currentConsumed} → ${newConsumed} consumed, ${currentRemaining} → ${newRemaining} remaining`
         };
         
         // Set the calculated values
         updateData.consumedMeals = newConsumed;
         updateData.remainingMeals = newRemaining;
       }

      // Update status based on remaining meals
      if (updateData.remainingMeals !== undefined) {
        if (updateData.remainingMeals === 0) {
          updateData.status = 'completed';
          updateData.isActive = false;
        } else if (updateData.remainingMeals > 0 && currentMembership.status === 'completed') {
          updateData.status = 'active';
          updateData.isActive = true;
        }
      }

       const membership = await UserMembership.findByIdAndUpdate(
         id,
         updateData,
         { new: true, runValidators: true }
       ).populate('userId', 'name email phone')
        .populate('mealPlanId', 'title description price totalMeals durationDays');

       // Add history entry if meals were updated
       if (updateData.consumedMeals !== undefined || updateData.remainingMeals !== undefined) {
         const currentConsumed = currentMembership.consumedMeals;
         const currentRemaining = currentMembership.remainingMeals;
         const newConsumed = updateData.consumedMeals || currentConsumed;
         const newRemaining = updateData.remainingMeals || currentRemaining;
         const mealsChanged = newConsumed - currentConsumed;
         
         const historyEntry = {
           action: 'consumed' as const,
           consumedMeals: newConsumed,
           remainingMeals: newRemaining,
           mealsChanged,
           mealType: 'general' as const,
           timestamp: new Date(),
           notes: `Consumed ${mealsChanged} meals: ${currentConsumed} → ${newConsumed} consumed, ${currentRemaining} → ${newRemaining} remaining`
         };
         
         await UserMembership.findByIdAndUpdate(
           id,
           { $push: { history: historyEntry } }
         );
       }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User membership updated successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/user-memberships/{id}/consume:
   *   post:
   *     summary: Add meals to consumption (incremental)
   *     tags: [User Memberships]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User membership ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mealsToConsume
   *             properties:
   *               mealsToConsume:
   *                 type: number
   *                 minimum: 1
   *                 description: Number of meals to add to consumption
   *     responses:
   *       200:
   *         description: Meals consumed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async consumeMeals(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { mealsToConsume } = req.body;

      if (!mealsToConsume || mealsToConsume <= 0) {
        throw new appError('Invalid number of meals to consume', 400);
      }

      const membership = await UserMembership.findById(id);
      if (!membership) {
        throw new appError('User membership not found', 404);
      }

      if (membership.remainingMeals < mealsToConsume) {
        throw new appError(`Not enough remaining meals. Available: ${membership.remainingMeals}, Requested: ${mealsToConsume}`, 400);
      }

      // Update membership: decrease remaining meals and increase consumed meals
      const updatedMembership = await UserMembership.findByIdAndUpdate(
        id,
        {
          $inc: {
            remainingMeals: -mealsToConsume,
            consumedMeals: mealsToConsume
          }
        },
        { new: true }
      ).populate('userId', 'name email phone')
       .populate('mealPlanId', 'title description price totalMeals durationDays');

      // Check if membership is completed
      if (updatedMembership && updatedMembership.remainingMeals <= 0) {
        await UserMembership.findByIdAndUpdate(id, {
          status: 'completed',
          isActive: false,
          remainingMeals: 0
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `${mealsToConsume} meals consumed successfully`,
        data: updatedMembership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/user-memberships/{id}:
   *   delete:
   *     summary: Delete user membership
   *     tags: [User Memberships]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Membership ID
   *     responses:
   *       200:
   *         description: User membership deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: User membership not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async deleteUserMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = deleteUserMembershipSchema.parse({ params: req.params });
      const { id } = validated.params;

      const membership = await UserMembership.findByIdAndDelete(id);

      if (!membership) {
        throw new appError('User membership not found', 404);
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User membership deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

}
