"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMembershipController = void 0;
const userMembership_model_1 = require("./userMembership.model");
const mealPlan_model_1 = require("../meal-plan/mealPlan.model");
const customer_model_1 = require("../customer/customer.model");
const appError_1 = require("../../errors/appError");
const userMembership_validation_1 = require("./userMembership.validation");
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
class UserMembershipController {
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
    static createUserMembership(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validated = userMembership_validation_1.createUserMembershipSchema.parse({ body: req.body });
                const { userId, mealPlanId, totalMeals, totalPrice, receivedAmount, paymentMode, paymentStatus, note, startDate, endDate } = validated.body;
                // Verify customer exists
                const customer = yield customer_model_1.Customer.findById(userId);
                if (!customer) {
                    throw new appError_1.appError('Customer not found', 404);
                }
                // Verify meal plan exists
                const mealPlan = yield mealPlan_model_1.MealPlan.findById(mealPlanId);
                if (!mealPlan) {
                    throw new appError_1.appError('Meal plan not found', 404);
                }
                // Validate that full payment is made
                if (receivedAmount !== totalPrice) {
                    throw new appError_1.appError('Membership can only be created with full payment. Received amount must equal total price.', 400);
                }
                // Payment status is always 'paid' for memberships
                const finalPaymentStatus = 'paid';
                const membership = new userMembership_model_1.UserMembership({
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
                yield membership.save();
                res.status(201).json({
                    success: true,
                    statusCode: 201,
                    message: 'User membership created successfully',
                    data: membership,
                });
            }
            catch (error) {
                next(error);
            }
        });
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
    static getUserMemberships(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validated = userMembership_validation_1.getUserMembershipsSchema.parse({ query: req.query });
                const { userId, status, page = '1', limit = '10' } = validated.query;
                const filter = {};
                if (userId)
                    filter.userId = userId;
                if (status)
                    filter.status = status;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const memberships = yield userMembership_model_1.UserMembership.find(filter)
                    .populate('userId', 'name email phone address status')
                    .populate('mealPlanId', 'title description price totalMeals durationDays')
                    .skip(skip)
                    .limit(limitNum)
                    .sort({ createdAt: -1 });
                const total = yield userMembership_model_1.UserMembership.countDocuments(filter);
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
            }
            catch (error) {
                next(error);
            }
        });
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
    static getUserMembership(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validated = userMembership_validation_1.getUserMembershipSchema.parse({ params: req.params });
                const { id } = validated.params;
                const membership = yield userMembership_model_1.UserMembership.findById(id)
                    .populate('userId', 'name email phone address status')
                    .populate('mealPlanId', 'title description price totalMeals durationDays');
                if (!membership) {
                    throw new appError_1.appError('User membership not found', 404);
                }
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'User membership retrieved successfully',
                    data: membership,
                });
            }
            catch (error) {
                next(error);
            }
        });
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
    static updateUserMembership(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validated = userMembership_validation_1.updateUserMembershipSchema.parse({
                    params: req.params,
                    body: req.body
                });
                const { id } = validated.params;
                const updateData = validated.body;
                // Get the current membership to check total meals
                const currentMembership = yield userMembership_model_1.UserMembership.findById(id);
                if (!currentMembership) {
                    throw new appError_1.appError('User membership not found', 404);
                }
                // Handle meal items if provided
                if (updateData.mealItems !== undefined) {
                    // Check if membership is active
                    if (currentMembership.status !== 'active' || !currentMembership.isActive) {
                        throw new appError_1.appError('Cannot add meals to inactive membership', 400);
                    }
                    // Calculate total quantity of new meal items
                    const totalNewMeals = updateData.mealItems.reduce((sum, item) => sum + item.qty, 0);
                    // Check if adding these meals would exceed remaining meals
                    if (currentMembership.remainingMeals < totalNewMeals) {
                        throw new appError_1.appError(`Cannot consume ${totalNewMeals} meals. Only ${currentMembership.remainingMeals} meals remaining`, 400);
                    }
                    // Process meal items and add punching time if not provided
                    const processedMealItems = updateData.mealItems.map((item) => ({
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
                    // Add history entry for meal consumption
                    const historyEntry = {
                        action: 'consumed',
                        consumedMeals: newConsumedMeals,
                        remainingMeals: newRemainingMeals,
                        mealsChanged: totalNewMeals,
                        mealType: 'general',
                        timestamp: new Date(),
                        notes: `Consumed ${totalNewMeals} meal(s): ${currentMembership.consumedMeals} → ${newConsumedMeals} consumed, ${currentMembership.remainingMeals} → ${newRemainingMeals} remaining`
                    };
                    // Add to history
                    updateData.history = [...(currentMembership.history || []), historyEntry];
                }
                // Track if payment fields are being updated
                // If receivedAmount is being updated, validate it equals totalPrice
                if (updateData.receivedAmount !== undefined) {
                    // Validate that receivedAmount equals totalPrice (full payment only)
                    if (updateData.receivedAmount !== currentMembership.totalPrice) {
                        throw new appError_1.appError('Received amount must equal total price for membership updates', 400);
                    }
                    // Payment status is always 'paid' for memberships
                    updateData.paymentStatus = 'paid';
                }
                // Simple incremental calculation with history tracking (only when mealItems are not provided)
                if (updateData.mealItems === undefined && (updateData.consumedMeals !== undefined || updateData.remainingMeals !== undefined)) {
                    const currentConsumed = currentMembership.consumedMeals;
                    const currentRemaining = currentMembership.remainingMeals;
                    let newConsumed = currentConsumed;
                    let newRemaining = currentRemaining;
                    let mealsChanged = 0;
                    let action = 'consumed';
                    // If consumed meals is provided, treat as incremental consumption
                    if (updateData.consumedMeals !== undefined) {
                        if (updateData.consumedMeals < 0) {
                            throw new appError_1.appError('Consumed meals cannot be negative', 400);
                        }
                        const requestedConsumed = updateData.consumedMeals;
                        // Always treat as incremental consumption
                        mealsChanged = requestedConsumed;
                        // Check if we can add this many meals
                        if (mealsChanged > currentRemaining) {
                            throw new appError_1.appError(`Cannot consume ${mealsChanged} meals. Only ${currentRemaining} meals remaining`, 400);
                        }
                        // Add consumed meals incrementally
                        newConsumed = currentConsumed + mealsChanged;
                        newRemaining = currentRemaining - mealsChanged;
                    }
                    // If remaining meals is provided, calculate how many meals were consumed
                    if (updateData.remainingMeals !== undefined) {
                        if (updateData.remainingMeals < 0) {
                            throw new appError_1.appError('Remaining meals cannot be negative', 400);
                        }
                        const requestedRemaining = updateData.remainingMeals;
                        mealsChanged = currentRemaining - requestedRemaining;
                        // Check if we can consume this many meals
                        if (mealsChanged > currentRemaining) {
                            throw new appError_1.appError(`Cannot consume ${mealsChanged} meals. Only ${currentRemaining} meals remaining`, 400);
                        }
                        if (mealsChanged < 0) {
                            throw new appError_1.appError(`Cannot increase remaining meals above current amount (${currentRemaining})`, 400);
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
                    }
                    else if (updateData.remainingMeals > 0 && currentMembership.status === 'completed') {
                        updateData.status = 'active';
                        updateData.isActive = true;
                    }
                }
                const membership = yield userMembership_model_1.UserMembership.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('userId', 'name email phone address status')
                    .populate('mealPlanId', 'title description price totalMeals durationDays');
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'User membership updated successfully',
                    data: membership,
                });
            }
            catch (error) {
                next(error);
            }
        });
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
    static deleteUserMembership(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validated = userMembership_validation_1.deleteUserMembershipSchema.parse({ params: req.params });
                const { id } = validated.params;
                const membership = yield userMembership_model_1.UserMembership.findByIdAndDelete(id);
                if (!membership) {
                    throw new appError_1.appError('User membership not found', 404);
                }
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'User membership deleted successfully',
                    data: null,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.UserMembershipController = UserMembershipController;
