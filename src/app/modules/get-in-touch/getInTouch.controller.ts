import { Request, Response, NextFunction } from 'express';
import { GetInTouch } from './getInTouch.model';
import { getInTouchValidation } from './getInTouch.validation';
import { appError } from '../../errors/appError';

/**
 * Upsert Get In Touch data
 * Single API that creates if not present, or updates if same ID exists
 * PUT /api/get-in-touch/:id - creates new record with ID if not exists, updates if exists
 */
export const upsertGetInTouch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, officeAddress, contactNumbers, emailAddresses, careerInfo } = req.body;

    // Validate MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new appError('Invalid Get In Touch ID format', 400));
    }

    // Validate the payload
    const validatedData = getInTouchValidation.parse({
      title,
      officeAddress,
      contactNumbers,
      emailAddresses,
      careerInfo,
    });

    // Check if document exists
    const existingGetInTouch = await GetInTouch.findById(id);
    
    let getInTouch;
    let isNew = false;

    if (existingGetInTouch) {
      // Update existing record
      getInTouch = await GetInTouch.findByIdAndUpdate(
        id,
        validatedData,
        { new: true }
      );
      isNew = false;
    } else {
      // Create new record with the specified ID
      getInTouch = new GetInTouch({
        _id: id,
        ...validatedData,
      });
      await getInTouch.save();
      isNew = true;
    }

    res.status(isNew ? 201 : 200).json({
      success: true,
      statusCode: isNew ? 201 : 200,
      message: isNew
        ? 'Get In Touch created successfully'
        : 'Get In Touch updated successfully',
      data: getInTouch,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Get In Touch data
 * GET /api/get-in-touch/:id - get by specific ID
 * GET /api/get-in-touch - get the first available record
 * Returns null data if no record exists (no error)
 */
export const getGetInTouch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    let getInTouch = null;

    if (id) {
      // Validate MongoDB ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new appError('Invalid Get In Touch ID format', 400));
      }

      getInTouch = await GetInTouch.findById(id);
    } else {
      // Get the first available record
      getInTouch = await GetInTouch.findOne();
    }

    // Return null data if no record found (no error)
    res.json({
      success: true,
      statusCode: 200,
      message: getInTouch 
        ? 'Get In Touch retrieved successfully' 
        : 'No Get In Touch data found',
      data: getInTouch || null,
    });
  } catch (error) {
    next(error);
  }
};

