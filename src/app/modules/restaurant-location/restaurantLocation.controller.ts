import { Request, Response, NextFunction } from 'express';
import { RestaurantLocation } from './restaurantLocation.model';
import {
  restaurantLocationCreateValidation,
  restaurantLocationUpdateValidation,
} from './restaurantLocation.validation';
import { appError } from '../../errors/appError';

export const createRestaurantLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = restaurantLocationCreateValidation.parse(req.body);
    const location = await RestaurantLocation.create(payload);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Restaurant location created successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locations = await RestaurantLocation.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      statusCode: 200,
      message: 'Restaurant locations retrieved successfully',
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new appError('Invalid restaurant location ID format', 400));
    }
    const location = await RestaurantLocation.findById(id);
    if (!location) {
      return next(new appError('Restaurant location not found', 404));
    }
    res.json({
      success: true,
      statusCode: 200,
      message: 'Restaurant location retrieved successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new appError('Invalid restaurant location ID format', 400));
    }
    const payload = restaurantLocationUpdateValidation.parse(req.body);
    const location = await RestaurantLocation.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!location) {
      return next(new appError('Restaurant location not found', 404));
    }
    res.json({
      success: true,
      statusCode: 200,
      message: 'Restaurant location updated successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurantLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new appError('Invalid restaurant location ID format', 400));
    }
    const location = await RestaurantLocation.findByIdAndDelete(id);
    if (!location) {
      return next(new appError('Restaurant location not found', 404));
    }
    res.json({
      success: true,
      statusCode: 200,
      message: 'Restaurant location deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

