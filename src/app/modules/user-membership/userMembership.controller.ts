import { Request, Response, NextFunction } from 'express';
import { UserMembership } from './userMembership.model';
import { MealPlan } from '../meal-plan/mealPlan.model';
import { Customer } from '../customer/customer.model';
import { appError } from '../../errors/appError';
import handleZodError from '../../errors/handleZodError';
import { 
  createUserMembershipSchema,
  updateUserMembershipSchema,
  getUserMembershipSchema,
  getUserMembershipsSchema,
  deleteUserMembershipSchema,
  setMembershipStatusSchema
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
 *           description: Reference to Customer
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
 *           enum: [active, hold, cancelled, completed]
 *           description: Membership status
 *         totalPrice:
 *           type: number
 *           description: Total price of the membership
 *         receivedAmount:
 *           type: number
 *           description: Amount received from customer (always equals totalPrice)
 *         paymentMode:
 *           type: string
 *           enum: [cash, card, online, payment_link]
 *           description: Payment method used
 *         paymentStatus:
 *           type: string
 *           enum: [paid]
 *           description: Payment status (always paid for memberships)
 *         note:
 *           type: string
 *           description: Additional notes
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
   *               - totalPrice
   *               - receivedAmount
   *               - endDate
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Customer ID
 *               mealPlanId:
 *                 type: string
 *               totalMeals:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *                 description: Total price of the membership
   *               receivedAmount:
   *                 type: number
   *                 description: Payment amount received (required). Must equal totalPrice for membership creation
 *               paymentMode:
 *                 type: string
 *                 enum: [cash, card, online, payment_link]
 *                 description: Payment method used (optional)
   *               paymentStatus:
   *                 type: string
   *                 enum: [paid]
   *                 description: Payment status (optional). Always 'paid' for memberships
 *               note:
 *                 type: string
 *                 description: Additional notes (optional)
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
      const { userId, mealPlanId, totalMeals, totalPrice, receivedAmount, paymentMode, paymentStatus, note, startDate, endDate, weeks } = validated.body;

      // Verify customer exists
      const customer = await Customer.findById(userId);
      if (!customer) {
        throw new appError('Customer not found', 404);
      }

      // Verify meal plan exists
      const mealPlan = await MealPlan.findById(mealPlanId);
      if (!mealPlan) {
        throw new appError('Meal plan not found', 404);
      }

      // Validate that full payment is made
      if (receivedAmount !== totalPrice) {
        throw new appError('Membership can only be created with full payment. Received amount must equal total price.', 400);
      }

      // Payment status is always 'paid' for memberships
      const finalPaymentStatus = 'paid';

       const membership = new UserMembership({
         userId,
         mealPlanId,
         totalMeals,
         remainingMeals: totalMeals,
         consumedMeals: 0,
         totalPrice,
         receivedAmount,
         paymentMode: paymentMode || null,
         paymentStatus: finalPaymentStatus,
         note: note || '',
         startDate: startDate ? new Date(startDate) : new Date(),
         endDate: new Date(endDate),
         status: 'active',
         weeks: weeks || [],
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
 *         description: Filter by customer ID
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
        .populate('userId', 'name email phone address status')
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
        .populate('userId', 'name email phone address status')
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
 *               receivedAmount:
 *                 type: number
 *                 description: Additional payment amount
 *               paymentMode:
 *                 type: string
 *                 enum: [cash, card, online, payment_link]
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, unpaid, partial]
 *               note:
 *                 type: string
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
      const updateData: any = validated.body;

      // Get the current membership to check total meals
      const currentMembership = await UserMembership.findById(id);
      if (!currentMembership) {
        throw new appError('User membership not found', 404);
      }

      // Determine effective status for this update (use requested status if provided)
      const effectiveStatus = updateData.status ?? currentMembership.status;

      // Handle meal items if provided
      if (updateData.mealItems !== undefined) {
        // If caller is changing status in this request, enforce against the target status
        if (effectiveStatus !== 'active') {
          throw new appError('Cannot add meals to inactive membership', 400);
        }

        // Calculate total quantity of new meal items
        const totalNewMeals = updateData.mealItems.reduce((sum: number, item: any) => sum + item.qty, 0);

        // Check if adding these meals would exceed remaining meals
        if (currentMembership.remainingMeals < totalNewMeals) {
          throw new appError(`Cannot consume ${totalNewMeals} meals. Only ${currentMembership.remainingMeals} meals remaining`, 400);
        }

        // Process meal items and add punching time if not provided
        const processedMealItems = updateData.mealItems.map((item: any) => ({
          productId: item.productId,
          title: item.title,
          qty: item.qty,
          punchingTime: item.punchingTime ? new Date(item.punchingTime) : new Date(),
          mealType: item.mealType || 'general',
          moreOptions: item.moreOptions || [],
          branchId: item.branchId,
          createdBy: item.createdBy,
        }));

        // Add meal items to existing meal items array
        updateData.mealItems = [...(currentMembership.mealItems || []), ...processedMealItems];
        
        // Update consumed and remaining meals based on meal items
        const newConsumedMeals = (currentMembership.consumedMeals || 0) + totalNewMeals;
        const newRemainingMeals = currentMembership.remainingMeals - totalNewMeals;
        
        // Set the calculated values
        updateData.consumedMeals = newConsumedMeals;
        updateData.remainingMeals = newRemainingMeals;
        
        // Add history entry for meal consumption (log only this punch's delta and items)
        const historyEntry = {
          action: 'consumed' as const,
          consumedMeals: totalNewMeals,
          remainingMeals: newRemainingMeals,
          mealsChanged: totalNewMeals,
          mealType: 'general' as const,
          timestamp: new Date(),
          notes: `Consumed ${totalNewMeals} meal(s): ${currentMembership.consumedMeals} → ${newConsumedMeals} consumed, ${currentMembership.remainingMeals} → ${newRemainingMeals} remaining`,
          mealItems: processedMealItems
        };
        
        // Add to history
        updateData.history = [...(currentMembership.history || []), historyEntry];
      }

      // Track if payment fields are being updated
      // If receivedAmount is being updated, validate it equals totalPrice
      if (updateData.receivedAmount !== undefined) {
        // Validate that receivedAmount equals totalPrice (full payment only)
        if (updateData.receivedAmount !== currentMembership.totalPrice) {
          throw new appError('Received amount must equal total price for membership updates', 400);
        }
        
        // Payment status is always 'paid' for memberships
        updateData.paymentStatus = 'paid';
      }

       // Simple incremental calculation with history tracking (only when mealItems are not provided)
       if (updateData.mealItems === undefined && (updateData.consumedMeals !== undefined || updateData.remainingMeals !== undefined)) {
         // Membership must be active (considering target status if being changed in this request)
         if (effectiveStatus !== 'active') {
           throw new appError('Cannot consume meals on a membership that is not active (hold/cancelled/completed)', 400);
         }
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
         
        // Add to history (log only delta consumed for this update)
        const historyEntry = {
          action,
          consumedMeals: mealsChanged,
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
        } else if (updateData.remainingMeals > 0 && (currentMembership.status === 'completed' || currentMembership.status === 'hold')) {
          updateData.status = 'active';
        }
      }

       const membership = await UserMembership.findByIdAndUpdate(
         id,
         updateData,
         { new: true, runValidators: true }
       ).populate('userId', 'name email phone address status')
        .populate('mealPlanId', 'title description price totalMeals durationDays');



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
   * /api/v1/user-memberships/{id}/status:
   *   patch:
   *     summary: Set membership status to hold or active
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
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [hold, active]
   *     responses:
   *       200:
   *         description: Membership status updated
   *       404:
   *         description: User membership not found
   */
  static async setMembershipStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = setMembershipStatusSchema.parse({ params: req.params, body: req.body });
      const { id } = validated.params;
      const { status } = validated.body;

      const membership = await UserMembership.findById(id);
      if (!membership) {
        throw new appError('User membership not found', 404);
      }

      if (status === 'hold') {
        membership.status = 'hold' as any;
      } else if (status === 'active') {
        membership.status = 'active' as any;
      } else if (status === 'cancelled') {
        membership.status = 'cancelled' as any;
      }

      await membership.save();

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Membership status updated successfully',
        data: membership,
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
