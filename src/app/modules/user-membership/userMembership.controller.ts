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
 *           enum: [active, expired, cancelled, completed]
 *           description: Membership status
 *         isActive:
 *           type: boolean
 *           description: Quick status check
 *         totalPrice:
 *           type: number
 *           description: Total price of the membership
 *         receivedAmount:
 *           type: number
 *           description: Amount received from customer (for frontend compatibility)
 *         cumulativePaid:
 *           type: number
 *           description: Total amount paid by customer (cumulative)
 *         payableAmount:
 *           type: number
 *           description: Remaining amount to be paid
 *         paymentMode:
 *           type: string
 *           enum: [cash, card, online, payment_link]
 *           description: Payment method used
 *         paymentStatus:
 *           type: string
 *           enum: [paid, unpaid, partial]
 *           description: Payment status
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
 *                 description: Initial payment amount (optional)
 *               paymentMode:
 *                 type: string
 *                 enum: [cash, card, online, payment_link]
 *                 description: Payment method used (optional)
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, unpaid, partial]
 *                 description: Payment status (optional)
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
      const { userId, mealPlanId, totalMeals, totalPrice, receivedAmount: initialPayment = 0, paymentMode, paymentStatus, note, startDate, endDate } = validated.body;

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

       // Calculate payable amount (remaining amount to be paid)
       const receivedAmount = initialPayment;
       const cumulativePaid = initialPayment;
       const payableAmount = totalPrice - cumulativePaid;
       
       // Determine payment status
       let finalPaymentStatus = paymentStatus;
       if (!finalPaymentStatus) {
         if (cumulativePaid >= totalPrice) {
           finalPaymentStatus = 'paid';
         } else if (cumulativePaid > 0) {
           finalPaymentStatus = 'partial';
         } else {
           finalPaymentStatus = 'unpaid';
         }
       }

       const membership = new UserMembership({
         userId,
         mealPlanId,
         totalMeals,
         remainingMeals: totalMeals,
         consumedMeals: 0,
         totalPrice,
         receivedAmount,
         cumulativePaid,
         payableAmount,
         paymentMode: paymentMode || null,
         paymentStatus: finalPaymentStatus,
         note: note || '',
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
           notes: 'Membership created',
           // Payment tracking
           totalPrice,
           receivedAmount,
           cumulativePaid,
           payableAmount,
           paymentMode: paymentMode || null,
           paymentStatus: finalPaymentStatus,
           amountPaid: initialPayment,
           amountChanged: initialPayment
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

      // Track if payment fields are being updated
      const paymentFieldsUpdated = updateData.receivedAmount !== undefined || 
                                   updateData.paymentMode !== undefined || 
                                   updateData.paymentStatus !== undefined || 
                                   updateData.note !== undefined;

      // If receivedAmount is being updated, treat it as additional payment
      if (updateData.receivedAmount !== undefined) {
        const additionalPayment = updateData.receivedAmount;
        
        // Validate additional payment
        if (additionalPayment < 0) {
          throw new appError('Additional payment amount cannot be negative', 400);
        }
        
        // Calculate new cumulative paid amount
        const newCumulativePaid = currentMembership.cumulativePaid + additionalPayment;
        
        // Ensure cumulative paid doesn't exceed total price
        if (newCumulativePaid > currentMembership.totalPrice) {
          throw new appError(`Total payments (${newCumulativePaid}) cannot exceed total price (${currentMembership.totalPrice})`, 400);
        }
        
        // Update both receivedAmount and cumulativePaid
        updateData.receivedAmount = additionalPayment; // This is the additional payment received
        updateData.cumulativePaid = newCumulativePaid; // This is the total cumulative amount
        updateData.payableAmount = currentMembership.totalPrice - newCumulativePaid;
        
        // Auto-update payment status based on cumulative paid amount
        if (updateData.paymentStatus === undefined) {
          if (newCumulativePaid >= currentMembership.totalPrice) {
            updateData.paymentStatus = 'paid';
          } else if (newCumulativePaid > 0) {
            updateData.paymentStatus = 'partial';
          } else {
            updateData.paymentStatus = 'unpaid';
          }
        }
        
        // Store the additional payment amount for history tracking
        updateData.additionalPayment = additionalPayment;
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
       ).populate('userId', 'name email phone address status')
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

       // Add payment history entry if payment fields were updated
       if (paymentFieldsUpdated) {
         const currentCumulativePaid = currentMembership.cumulativePaid;
         const newCumulativePaid = updateData.cumulativePaid || currentCumulativePaid;
         const additionalPayment = updateData.additionalPayment || 0;
         const newReceivedAmount = updateData.receivedAmount || currentMembership.receivedAmount;
         const newPayableAmount = updateData.payableAmount || (currentMembership.totalPrice - newCumulativePaid);
         const newPaymentStatus = updateData.paymentStatus || currentMembership.paymentStatus;
         const newPaymentMode = updateData.paymentMode || currentMembership.paymentMode;
         
         const paymentHistoryEntry = {
           action: 'payment_updated' as const,
           consumedMeals: currentMembership.consumedMeals,
           remainingMeals: currentMembership.remainingMeals,
           mealsChanged: 0,
           mealType: 'general' as const,
           timestamp: new Date(),
           notes: `Payment updated: ${currentCumulativePaid} → ${newCumulativePaid} cumulative paid, ${currentMembership.payableAmount} → ${newPayableAmount} payable`,
           // Payment tracking
           totalPrice: currentMembership.totalPrice,
           receivedAmount: newReceivedAmount,
           cumulativePaid: newCumulativePaid,
           payableAmount: newPayableAmount,
           paymentMode: newPaymentMode,
           paymentStatus: newPaymentStatus,
           amountPaid: additionalPayment,
           amountChanged: additionalPayment
         };
         
         await UserMembership.findByIdAndUpdate(
           id,
           { $push: { history: paymentHistoryEntry } }
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
      ).populate('userId', 'name email phone address status')
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
