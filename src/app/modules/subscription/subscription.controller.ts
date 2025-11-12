import { NextFunction, Request, Response } from 'express';
import { Subscription } from './subscription.model';
import { subscriptionValidation } from './subscription.validation';
import { appError } from '../../errors/appError';

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email } = req.body;

    const payload = {
      fullName: fullName?.trim(),
      email: email?.trim().toLowerCase(),
    };

    const validatedData = subscriptionValidation.parse(payload);

    // Check if email already exists (not deleted)
    const existingSubscription = await Subscription.findOne({
      email: validatedData.email,
      isDeleted: false,
    });

    if (existingSubscription) {
      return next(new appError('Email already subscribed', 400));
    }

    const subscription = new Subscription(validatedData);
    await subscription.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Subscription created successfully',
      data: subscription,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filter only non-deleted subscriptions
    const filter: any = { isDeleted: false };

    // Get total count for pagination
    const total = await Subscription.countDocuments(filter);

    // Get subscriptions with pagination, sorted by newest first
    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      statusCode: 200,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!subscription) {
      return next(new appError('Subscription not found', 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Subscription retrieved successfully',
      data: subscription,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriptionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!subscription) {
      next(new appError('Subscription not found', 404));
      return;
    }

    // Soft delete
    subscription.isDeleted = true;
    await subscription.save();

    res.json({
      success: true,
      statusCode: 200,
      message: 'Subscription deleted successfully',
      data: subscription,
    });
    return;
  } catch (error) {
    next(error);
  }
};

