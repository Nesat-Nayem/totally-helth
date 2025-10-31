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
  setMembershipStatusSchema,
  punchMealsSchema
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
           currentConsumed: 0,
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
  /**
   * Helper function to enhance weeks data with simple consumed status flags for frontend
   * Preserves all existing fields, only adds isConsumed flags
   */
  private static enhanceWeeksWithConsumedStatus(weeks: any[]) {
    if (!weeks || !Array.isArray(weeks)) return weeks;
    
    return weeks.map((weekPlan: any) => {
      if (!weekPlan.days || !Array.isArray(weekPlan.days)) {
        return { 
          ...weekPlan, // Keep all existing fields
          isConsumed: weekPlan.isConsumed !== undefined ? weekPlan.isConsumed : false 
        };
      }

      let allDaysConsumed = true;
      const enhancedDays = weekPlan.days.map((day: any) => {
        const consumedMeals = day.consumedMeals || {};
        const consumedCount = Object.values(consumedMeals).filter(Boolean).length;
        const totalMeals = 4; // breakfast, lunch, dinner, snacks
        
        // Simple: day is consumed if all 4 meals are consumed
        const dayIsConsumed = consumedCount === totalMeals;
        
        // Track if all days are consumed
        if (!dayIsConsumed) {
          allDaysConsumed = false;
        }
        
        // Preserve all existing fields, only add/update isConsumed
        return {
          ...day, // Keep all existing fields (meals, consumedMeals, etc.)
          isConsumed: day.isConsumed !== undefined ? day.isConsumed : dayIsConsumed,
        };
      });

      return {
        ...weekPlan, // Keep all existing fields (repeatFromWeek, etc.)
        days: enhancedDays,
        isConsumed: weekPlan.isConsumed !== undefined ? weekPlan.isConsumed : allDaysConsumed,
      };
    });
  }

  /**
   * Helper function to calculate consumed days summary for each week
   */
  private static calculateWeekConsumedSummary(weeks: any[]) {
    if (!weeks || !Array.isArray(weeks)) return [];
    
    return weeks.map((weekPlan: any) => {
      if (!weekPlan.days || !Array.isArray(weekPlan.days)) {
        return {
          week: weekPlan.week,
          totalDays: 0,
          consumedDays: 0,
          consumedDaysList: [],
          consumedMealsCount: 0,
        };
      }

      let consumedDays = 0;
      let consumedMealsCount = 0;
      const consumedDaysList: Array<{
        day: string;
        consumedMeals: number;
        totalMeals: number;
        isComplete: boolean;
        consumedTypes: string[];
        mealItemsByType: {
          breakfast?: string[];
          lunch?: string[];
          dinner?: string[];
          snacks?: string[];
        };
      }> = [];

      weekPlan.days.forEach((day: any) => {
        if (day.consumedMeals) {
          const consumedMealsForDay = day.consumedMeals;
          const dayConsumedCount = Object.values(consumedMealsForDay).filter(Boolean).length;
          
          if (dayConsumedCount > 0) {
            consumedDays++;
            consumedMealsCount += dayConsumedCount;
            
            // Get meal items for each consumed meal type
            const mealItemsByType: {
              breakfast?: string[];
              lunch?: string[];
              dinner?: string[];
              snacks?: string[];
            } = {};
            
            // Extract meal items from day plan for consumed meal types
            const consumedTypes = Object.keys(consumedMealsForDay).filter(
              (key: string) => consumedMealsForDay[key] === true
            ) as ('breakfast' | 'lunch' | 'dinner' | 'snacks')[];
            
            consumedTypes.forEach((mealType) => {
              if (day.meals && day.meals[mealType]) {
                mealItemsByType[mealType] = day.meals[mealType];
              }
            });
            
            consumedDaysList.push({
              day: day.day,
              consumedMeals: dayConsumedCount,
              totalMeals: 4, // breakfast, lunch, dinner, snacks
              isComplete: dayConsumedCount === 4,
              consumedTypes: consumedTypes,
              mealItemsByType: mealItemsByType, // Store actual meal items from meal plan
            });
          }
        }
      });

      return {
        week: weekPlan.week,
        totalDays: weekPlan.days.length,
        consumedDays,
        consumedDaysList,
        consumedMealsCount,
        totalMealsInWeek: weekPlan.days.length * 4, // Each day has 4 meal types
        isComplete: consumedDays === weekPlan.days.length, // All days consumed
        completionPercentage: weekPlan.days.length > 0 
          ? Math.round((consumedMealsCount / (weekPlan.days.length * 4)) * 100)
          : 0,
      };
    });
  }

  static async getUserMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getUserMembershipSchema.parse({ params: req.params });
      const { id } = validated.params;

      const membership = await UserMembership.findById(id)
        .populate('userId', 'name email phone address status')
        .populate('mealPlanId', 'title description price totalMeals durationDays')
        .lean(); // Return plain JavaScript objects, not Mongoose documents

      if (!membership) {
        throw new appError('User membership not found', 404);
      }

      // Just return whatever is in database - no calculations, no enhancements
      // All data should be updated by PUNCH API
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

        // Don't add mealItems to membership object - only store in history
        
        // Update consumed and remaining meals based on meal items
        const newConsumedMeals = (currentMembership.consumedMeals || 0) + totalNewMeals;
        const newRemainingMeals = currentMembership.remainingMeals - totalNewMeals;
        
        // Set the calculated values
        updateData.consumedMeals = newConsumedMeals;
        updateData.remainingMeals = newRemainingMeals;
        
        // Add history entry for meal consumption
        const historyEntry = {
          action: 'consumed' as const,
          consumedMeals: newConsumedMeals, // Total consumed after this action
          remainingMeals: newRemainingMeals, // Remaining after this action
          currentConsumed: totalNewMeals, // Meals consumed in THIS action
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
         
        // Add to history
        const historyEntry = {
          action,
          consumedMeals: newConsumed, // Total consumed after this action
          remainingMeals: newRemaining, // Remaining after this action
          currentConsumed: mealsChanged, // Meals consumed in THIS action
          timestamp: new Date(),
          notes: `Consumed ${mealsChanged} meals: ${currentConsumed} → ${newConsumed} consumed, ${currentRemaining} → ${newRemaining} remaining`
        };
        
        // Add to history
        updateData.history = [...(currentMembership.history || []), historyEntry];
         
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
  /**
   * @swagger
   * /api/v1/user-memberships/{id}/punch:
   *   post:
   *     summary: Punch meals for a specific week and day
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
   *             required:
   *               - consumedMealTypes
   *             properties:
   *               date:
   *                 type: string
   *                 format: date
   *                 description: Date in YYYY-MM-DD format (optional, defaults to today)
   *               week:
   *                 type: number
   *                 description: Week number (1-based, optional - provide with day)
   *               day:
   *                 type: string
   *                 enum: [saturday, sunday, monday, tuesday, wednesday, thursday, friday]
   *                 description: Day of the week (optional - provide with week)
   *               consumedMealTypes:
   *                 type: array
   *                 items:
   *                   type: string
   *                   enum: [breakfast, lunch, dinner, snacks]
   *                 description: Array of meal types consumed
   *               notes:
   *                 type: string
   *                 description: Optional notes
   *     responses:
   *       200:
   *         description: Meals punched successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: User membership not found
   */
  /**
   * Helper function to calculate week number from startDate
   */
  private static calculateWeekFromDate(targetDate: Date, startDate: Date): number {
    const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1; // Week 1 starts from startDate
  }

  /**
   * Helper function to get day name from date
   */
  private static getDayNameFromDate(date: Date): 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const dayIndex = date.getDay();
    return days[dayIndex];
  }

  static async punchMeals(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = punchMealsSchema.parse({ 
        params: req.params, 
        body: req.body 
      });
      const { id } = validated.params;
      const { date, week: providedWeek, day: providedDay, consumedMealTypes, mealItems: mealItemsFromRequest, notes } = validated.body;

      // Get the current membership
      const membership = await UserMembership.findById(id);
      if (!membership) {
        throw new appError('User membership not found', 404);
      }

      // Check if membership is active
      if (membership.status !== 'active') {
        throw new appError('Cannot punch meals for inactive membership', 400);
      }

      // Check if weeks data exists
      if (!membership.weeks || membership.weeks.length === 0) {
        throw new appError('No meal plan weeks found for this membership', 400);
      }

      // Calculate week and day from date if provided, otherwise use provided week/day
      let week: number;
      let day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
      let targetDate: Date;

      if (date) {
        // Use provided date
        targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
          throw new appError('Invalid date format. Use YYYY-MM-DD', 400);
        }
        
        // Set time to start of day for accurate calculation
        targetDate.setHours(0, 0, 0, 0);
        const startDate = new Date(membership.startDate);
        startDate.setHours(0, 0, 0, 0);

        // Validate date is within membership period
        if (targetDate < startDate) {
          throw new appError('Date cannot be before membership start date', 400);
        }
        if (targetDate > new Date(membership.endDate)) {
          throw new appError('Date cannot be after membership end date', 400);
        }

        // Calculate week from date
        week = this.calculateWeekFromDate(targetDate, startDate);
        
        // Get day name from date
        day = this.getDayNameFromDate(targetDate);
      } else if (providedWeek && providedDay) {
        // Use provided week and day
        week = providedWeek;
        day = providedDay.toLowerCase() as 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
        // Calculate target date from week and day
        const startDate = new Date(membership.startDate);
        startDate.setHours(0, 0, 0, 0);
        const daysFromStart = (week - 1) * 7;
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayIndex = dayNames.indexOf(day);
        const startDayIndex = startDate.getDay();
        const dayOffset = (targetDayIndex - startDayIndex + 7) % 7;
        targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + daysFromStart + dayOffset);
      } else {
        // Default to today's date
        targetDate = new Date();
        targetDate.setHours(0, 0, 0, 0);
        const startDate = new Date(membership.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        week = this.calculateWeekFromDate(targetDate, startDate);
        day = this.getDayNameFromDate(targetDate);
      }

      // Find the week in the weeks array
      const weekPlan = membership.weeks.find(w => w.week === week);
      if (!weekPlan) {
        throw new appError(`Week ${week} not found in meal plan (calculated from date ${targetDate.toISOString().split('T')[0]})`, 404);
      }

      // Find the day in the week
      const dayPlan = weekPlan.days.find(d => d.day === day);
      if (!dayPlan) {
        throw new appError(`Day ${day} not found in week ${week}`, 404);
      }

      // Get existing consumed meals for this day (if any)
      const existingConsumed = dayPlan.consumedMeals || {
        breakfast: false,
        lunch: false,
        dinner: false,
        snacks: false,
      };
      
      // Extract meal types from consumedMealTypes OR from mealItems if consumedMealTypes is not provided
      let mealTypesToCheck: ('breakfast' | 'lunch' | 'dinner' | 'snacks')[] = [];
      
      if (consumedMealTypes && consumedMealTypes.length > 0) {
        // Use provided consumedMealTypes
        mealTypesToCheck = [...new Set(consumedMealTypes)] as ('breakfast' | 'lunch' | 'dinner' | 'snacks')[];
      } else if (mealItemsFromRequest && mealItemsFromRequest.length > 0) {
        // Extract meal types from mealItems if consumedMealTypes not provided
        mealTypesToCheck = [...new Set(mealItemsFromRequest.map((item: any) => item.mealType))] as ('breakfast' | 'lunch' | 'dinner' | 'snacks')[];
      }
      
      // Calculate how many NEW meals are being consumed (only count meal types not already consumed)
      let newMealsCount = 0;
      const newlyConsumedTypes: ('breakfast' | 'lunch' | 'dinner' | 'snacks')[] = [];
      
      for (const mealType of mealTypesToCheck) {
        if (!existingConsumed[mealType as keyof typeof existingConsumed]) {
          // This meal type hasn't been consumed yet - count it as new
          newMealsCount++;
          newlyConsumedTypes.push(mealType);
        }
        // If already consumed, we skip it (don't count again, but also don't throw error)
      }
      
      // If no new meals to consume (all already consumed or no meal types provided), throw error
      if (newMealsCount === 0 && mealTypesToCheck.length > 0) {
        throw new appError(
          `All requested meal types (${mealTypesToCheck.join(', ')}) have already been consumed for ${day} in week ${week}`,
          400
        );
      }
      
      if (mealTypesToCheck.length === 0) {
        throw new appError(
          'No meal types provided. Please provide either consumedMealTypes or mealItems',
          400
        );
      }

      // For mealItems, we'll check remaining meals after calculating quantities
      // For consumedMealTypes, check now
      if (!mealItemsFromRequest || mealItemsFromRequest.length === 0) {
        // Check if we have enough remaining meals (simple case: each meal type = 1 meal)
        if (membership.remainingMeals < newMealsCount) {
          throw new appError(
            `Cannot consume ${newMealsCount} meals. Only ${membership.remainingMeals} meals remaining`,
            400
          );
        }
      }

      // Update consumedMeals tracking for this day (only mark newly consumed types as true)
      const updatedConsumedMeals = { ...existingConsumed };
      for (const mealType of newlyConsumedTypes) {
        (updatedConsumedMeals as any)[mealType] = true;
      }
      
      // Use newly consumed types for meal items (only process new ones)
      const mealTypesToProcess = newlyConsumedTypes;

      // Update the day plan in the weeks array
      const weekIndex = membership.weeks.findIndex(w => w.week === week);
      const dayIndex = membership.weeks[weekIndex].days.findIndex(d => d.day === day.toLowerCase());
      membership.weeks[weekIndex].days[dayIndex].consumedMeals = updatedConsumedMeals;
      
      // Handle meal items from frontend (with quantities) if provided
      let mealItems: any[] = [];
      let actualMealsConsumed = newMealsCount;
      
      if (mealItemsFromRequest && mealItemsFromRequest.length > 0) {
        // Frontend sent detailed meal items with quantities
        mealItems = mealItemsFromRequest.map((item: any) => ({
          title: item.mealItemTitle,
          qty: item.qty || 1,
          punchingTime: new Date(),
          mealType: item.mealType,
          moreOptions: [],
        }));
        
        // Calculate total meals based on quantities
        actualMealsConsumed = mealItemsFromRequest.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
        
        // Update consumed meals count based on actual quantities
        const actualRemainingMeals = membership.remainingMeals - actualMealsConsumed;
        if (actualRemainingMeals < 0) {
          throw new appError(
            `Cannot consume ${actualMealsConsumed} meals. Only ${membership.remainingMeals} meals remaining`,
            400
          );
        }
        
        // Update consumed/remaining based on actual quantities
        const actualConsumedMeals = membership.consumedMeals + actualMealsConsumed;
        membership.consumedMeals = actualConsumedMeals;
        membership.remainingMeals = actualRemainingMeals;
        newMealsCount = actualMealsConsumed; // Update for history
      } else {
        // Use simple consumedMealTypes (each meal type = 1 meal)
        for (const mealType of mealTypesToProcess) {
          const mealItemsForType = (dayPlan.meals as any)[mealType] || [];
          
          if (mealItemsForType.length > 0) {
            mealItemsForType.forEach((mealItemName: string) => {
              mealItems.push({
                title: mealItemName,
                qty: 1,
                punchingTime: new Date(),
                mealType: mealType,
                moreOptions: [],
              });
            });
          } else {
            mealItems.push({
              title: `${mealType} meal`,
              qty: 1,
              punchingTime: new Date(),
              mealType: mealType,
              moreOptions: [],
            });
          }
        }
        
        // Update consumed and remaining meals
        const newConsumedMeals = membership.consumedMeals + newMealsCount;
        const newRemainingMeals = membership.remainingMeals - newMealsCount;
        
        membership.consumedMeals = newConsumedMeals;
        membership.remainingMeals = newRemainingMeals;
      }
      
      // Update isConsumed flag for the day (true if all 4 meals consumed)
      const totalMealsForDay = Object.values(updatedConsumedMeals).filter(Boolean).length;
      membership.weeks[weekIndex].days[dayIndex].isConsumed = totalMealsForDay === 4;
      
      // Update isConsumed flag for the week (true if all days consumed)
      const allDaysConsumed = membership.weeks[weekIndex].days.every((d: any) => {
        const dayConsumed = d.consumedMeals || {};
        return Object.values(dayConsumed).filter(Boolean).length === 4;
      });
      membership.weeks[weekIndex].isConsumed = allDaysConsumed;

      // Update status if all meals are consumed
      if (membership.remainingMeals === 0) {
        membership.status = 'completed';
      }

      // Don't add mealItems to membership object - only store in history
      
      const dateStr = targetDate.toISOString().split('T')[0];
      
      // Build notes message
      let notesMessage = `Punched ${newMealsCount} meal(s) for ${day} (${dateStr}) in week ${week}: ${mealTypesToProcess.join(', ')}`;
      if (mealTypesToCheck.length > newlyConsumedTypes.length) {
        const alreadyConsumed = mealTypesToCheck.filter((t: string) => !newlyConsumedTypes.includes(t as any));
        notesMessage += ` (${alreadyConsumed.join(', ')} already consumed, skipped)`;
      }
      
      // Add history entry
      const historyEntry = {
        action: 'consumed' as const,
        consumedMeals: membership.consumedMeals, // Total consumed after this action
        remainingMeals: membership.remainingMeals, // Remaining after this action
        currentConsumed: newMealsCount, // Meals consumed in THIS punch
        timestamp: new Date(),
        notes: notes || notesMessage, // Notes for this history entry
        week: week,
        day: day,
        consumedMealTypes: mealTypesToProcess, // Only newly consumed types
        mealItems: mealItems, // Meal items for this specific history entry
      };

      membership.history.push(historyEntry);

      // Save the membership
      await membership.save();

      // Populate references before returning
      await membership.populate('userId', 'name email phone address status');
      await membership.populate('mealPlanId', 'title description price totalMeals durationDays');

      let successMessage = `Successfully punched ${newMealsCount} meal(s) for ${day} (${dateStr}) in week ${week}`;
      if (mealTypesToCheck.length > newlyConsumedTypes.length) {
        const alreadyConsumed = mealTypesToCheck.filter((t: string) => !newlyConsumedTypes.includes(t as any));
        successMessage += `. ${alreadyConsumed.join(', ')} already consumed (skipped)`;
      }

      // Just return what's saved in database - no enhancements needed
      // isConsumed flags are already updated in database above
      const membershipObj = membership.toObject();
      
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: successMessage,
        data: membershipObj,
      });
    } catch (error) {
      next(error);
    }
  }

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
