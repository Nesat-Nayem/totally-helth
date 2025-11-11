import { NextFunction, Request, Response } from 'express';
import { Included } from './included.model';
import { includedValidation, includedUpdateValidation } from './included.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

export const createIncluded = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { meal_type, title, nutrition, allergens, status, order } = req.body as any;

    // upload.single('file') puts the file in req.file, not req.files
    const imageFile = req.file;

    if (!imageFile) {
      next(new appError('Meal image (file) is required', 400));
      return;
    }

    // Parse nutrition if it's a string
    let nutritionData;
    if (typeof nutrition === 'string') {
      try {
        nutritionData = JSON.parse(nutrition);
      } catch {
        next(new appError('Invalid nutrition format', 400));
        return;
      }
    } else {
      nutritionData = nutrition;
    }

    // Parse allergens if it's a string
    let allergensArray: string[] = [];
    if (typeof allergens === 'string') {
      try {
        allergensArray = JSON.parse(allergens);
      } catch {
        // If not JSON, try comma-separated
        allergensArray = allergens.split(',').map((a: string) => a.trim()).filter(Boolean);
      }
    } else if (Array.isArray(allergens)) {
      allergensArray = allergens;
    }

    const payload = {
      meal_type,
      title,
      image_url: imageFile.path,
      nutrition: nutritionData,
      allergens: allergensArray,
      status: status === 'inactive' ? 'inactive' : 'active',
      order: order ? parseInt(order as string, 10) : 0,
    };

    const validatedData = includedValidation.parse(payload);

    const included = new Included(validatedData);
    await included.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Included meal created successfully',
      data: included,
    });
    return;
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-included/${publicId}`);
    }
    next(error);
  }
};

export const getAllIncluded = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, meal_type } = req.query as { status?: string; meal_type?: string };
    const filter: any = { isDeleted: false };

    if (status === 'active' || status === 'inactive') {
      filter.status = status;
    }

    if (meal_type === 'BREAKFAST' || meal_type === 'LUNCH' || meal_type === 'DINNER' || meal_type === 'SNACKS') {
      filter.meal_type = meal_type;
    }

    const included = await Included.find(filter)
      .sort({ createdAt: -1, order: 1 })
      .lean();

    if (included.length === 0) {
      res.json({
        success: true,
        statusCode: 200,
        message: 'No included meals found',
        data: [],
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Included meals retrieved successfully',
      data: included,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getIncludedById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const included = await Included.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!included) {
      return next(new appError('Included meal not found', 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Included meal retrieved successfully',
      data: included,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateIncludedById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includedId = req.params.id;
    const { meal_type, title, nutrition, allergens, status, order } = req.body as any;

    const included = await Included.findOne({
      _id: includedId,
      isDeleted: false,
    });

    if (!included) {
      next(new appError('Included meal not found', 404));
      return;
    }

    const updateData: any = {};

    if (meal_type !== undefined) {
      updateData.meal_type = meal_type;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    if (nutrition !== undefined) {
      let nutritionData;
      if (typeof nutrition === 'string') {
        try {
          nutritionData = JSON.parse(nutrition);
        } catch {
          next(new appError('Invalid nutrition format', 400));
          return;
        }
      } else {
        nutritionData = nutrition;
      }
      updateData.nutrition = nutritionData;
    }

    if (allergens !== undefined) {
      let allergensArray: string[] = [];
      if (typeof allergens === 'string') {
        try {
          allergensArray = JSON.parse(allergens);
        } catch {
          allergensArray = allergens.split(',').map((a: string) => a.trim()).filter(Boolean);
        }
      } else if (Array.isArray(allergens)) {
        allergensArray = allergens;
      }
      updateData.allergens = allergensArray;
    }

    if (status !== undefined) {
      updateData.status = status === 'inactive' ? 'inactive' : 'active';
    }

    if (order !== undefined) {
      updateData.order = parseInt(order as string, 10);
    }

    // upload.single('file') puts the file in req.file, not req.files
    const imageFile = req.file;

    if (imageFile) {
      updateData.image_url = imageFile.path;
      if (included.image_url) {
        const publicId = included.image_url.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`restaurant-included/${publicId}`);
      }
    }

    if (Object.keys(updateData).length > 0) {
      const validatedData = includedUpdateValidation.parse(updateData);

      const updatedIncluded = await Included.findByIdAndUpdate(
        includedId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: 'Included meal updated successfully',
        data: updatedIncluded,
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'No changes to update',
      data: included,
    });
    return;
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-included/${publicId}`);
    }
    next(error);
  }
};

export const deleteIncludedById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const included = await Included.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!included) {
      next(new appError('Included meal not found', 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Included meal deleted successfully',
      data: included,
    });
    return;
  } catch (error) {
    next(error);
  }
};

