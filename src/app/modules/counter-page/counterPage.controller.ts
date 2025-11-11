import { Request, Response, NextFunction } from 'express';
import { CounterPage } from './counterPage.model';
import { counterPageValidation } from './counterPage.validation';
import { appError } from '../../errors/appError';

/**
 * Upsert counter page data
 * Creates a new record if none exists, otherwise updates the existing record
 */
export const upsertCounterPage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { totalReviews, totalMealItems, happyClients, yearsHelpingPeople } = req.body as any;

    // Convert string inputs to numbers if needed
    const payload = {
      totalReviews: totalReviews ? Number(totalReviews) : 0,
      totalMealItems: totalMealItems ? Number(totalMealItems) : 0,
      happyClients: happyClients ? Number(happyClients) : 0,
      yearsHelpingPeople: yearsHelpingPeople ? Number(yearsHelpingPeople) : 0,
    };

    // Validate the payload
    const validatedData = counterPageValidation.parse(payload);

    // Use findOneAndUpdate with upsert to create or update in one operation
    const counterPage = await CounterPage.findOneAndUpdate(
      {}, // Empty filter to find any document (or none)
      validatedData,
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return the updated document
        setDefaultsOnInsert: true, // Set defaults on insert
      }
    );

    // Check if this was a new document or an update
    const isNew = counterPage.createdAt.getTime() === counterPage.updatedAt.getTime();

    res.status(isNew ? 201 : 200).json({
      success: true,
      statusCode: isNew ? 201 : 200,
      message: isNew
        ? 'Counter page created successfully'
        : 'Counter page updated successfully',
      data: counterPage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get counter page data
 */
export const getCounterPage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const counterPage = await CounterPage.findOne();

    if (!counterPage) {
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Counter page data not found',
        data: {
          totalReviews: 0,
          totalMealItems: 0,
          happyClients: 0,
          yearsHelpingPeople: 0,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Counter page data retrieved successfully',
      data: counterPage,
    });
  } catch (error) {
    next(error);
  }
};

