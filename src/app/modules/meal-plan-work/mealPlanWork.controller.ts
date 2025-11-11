import { Request, Response, NextFunction } from 'express';
import { MealPlanWork } from './mealPlanWork.model';
import { mealPlanWorkCreateValidation, mealPlanWorkUpdateValidation } from './mealPlanWork.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

/**
 * Upsert meal plan work data
 * Creates a new record if none exists, otherwise updates the existing record
 */
export const upsertMealPlanWork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const getFilePath = (name: string) => files?.[name]?.[0]?.path;

    const {
      title,
      subtitle,
      step1Title,
      step1SubTitle,
      step2Title,
      step2SubTitle,
      step3Title,
      step3SubTitle,
      metaTitle,
      metaTagKeyword,
      description,
      status,
    } = req.body as any;

    // Check if meal plan work already exists (not deleted)
    const existingMealPlanWork = await MealPlanWork.findOne({ isDeleted: false });

    if (existingMealPlanWork) {
      // Update existing meal plan work - build payload with only provided fields
      const updatePayload: any = {};

      if (title !== undefined) updatePayload.title = title;
      if (subtitle !== undefined) updatePayload.subtitle = subtitle;
      if (metaTitle !== undefined) updatePayload.metaTitle = metaTitle;
      if (metaTagKeyword !== undefined) updatePayload.metaTagKeyword = metaTagKeyword;
      if (description !== undefined) updatePayload.description = description;
      if (status !== undefined) updatePayload.status = status === 'inactive' ? 'inactive' : 'active';

      // Handle banner uploads - only update if new file is uploaded
      const newBanner1 = getFilePath('banner1');
      const newBanner2 = getFilePath('banner2');
      
      if (newBanner1) {
        // Cleanup old banner1
        if (existingMealPlanWork.banner1) {
          try {
            const publicId = existingMealPlanWork.banner1.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(`meal-plan-work/${publicId}`);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        updatePayload.banner1 = newBanner1;
      } else if (req.body.banner1 !== undefined) {
        updatePayload.banner1 = req.body.banner1;
      }

      if (newBanner2) {
        // Cleanup old banner2
        if (existingMealPlanWork.banner2) {
          try {
            const publicId = existingMealPlanWork.banner2.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(`meal-plan-work/${publicId}`);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        updatePayload.banner2 = newBanner2;
      } else if (req.body.banner2 !== undefined) {
        updatePayload.banner2 = req.body.banner2;
      }

      // Handle steps - only update if provided
      if (step1Title !== undefined || step1SubTitle !== undefined) {
        updatePayload.step1 = {
          title: step1Title !== undefined ? step1Title : existingMealPlanWork.step1.title,
          subTitle: step1SubTitle !== undefined ? step1SubTitle : existingMealPlanWork.step1.subTitle,
        };
      }

      if (step2Title !== undefined || step2SubTitle !== undefined) {
        updatePayload.step2 = {
          title: step2Title !== undefined ? step2Title : existingMealPlanWork.step2.title,
          subTitle: step2SubTitle !== undefined ? step2SubTitle : existingMealPlanWork.step2.subTitle,
        };
      }

      if (step3Title !== undefined || step3SubTitle !== undefined) {
        updatePayload.step3 = {
          title: step3Title !== undefined ? step3Title : existingMealPlanWork.step3.title,
          subTitle: step3SubTitle !== undefined ? step3SubTitle : existingMealPlanWork.step3.subTitle,
        };
      }

      // Validate update payload
      const validated = mealPlanWorkUpdateValidation.parse(updatePayload);
      const updated = await MealPlanWork.findByIdAndUpdate(
        existingMealPlanWork._id,
        validated,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: 'Meal plan work updated successfully',
        data: updated,
      });
      return;
    } else {
      // Create new meal plan work - all fields required
      const banner1 = getFilePath('banner1') || req.body.banner1;
      const banner2 = getFilePath('banner2') || req.body.banner2;

      // Build steps
      const step1 = {
        title: step1Title || req.body.step1?.title,
        subTitle: step1SubTitle || req.body.step1?.subTitle,
      };

      const step2 = {
        title: step2Title || req.body.step2?.title,
        subTitle: step2SubTitle || req.body.step2?.subTitle,
      };

      const step3 = {
        title: step3Title || req.body.step3?.title,
        subTitle: step3SubTitle || req.body.step3?.subTitle,
      };

      const payload = {
        title,
        subtitle,
        banner1,
        banner2,
        step1,
        step2,
        step3,
        metaTitle,
        metaTagKeyword,
        description,
        status: status === 'inactive' ? 'inactive' : 'active',
      };

      // Validate create payload
      const validated = mealPlanWorkCreateValidation.parse(payload);
      const mealPlanWork = new MealPlanWork(validated);
      await mealPlanWork.save();

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Meal plan work created successfully',
        data: mealPlanWork,
      });
      return;
    }
  } catch (error) {
    // Cleanup uploaded banners on error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const paths = [files?.banner1?.[0]?.path, files?.banner2?.[0]?.path].filter(Boolean) as string[];
    for (const p of paths) {
      try {
        const publicId = p.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`meal-plan-work/${publicId}`);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
    next(error);
  }
};

/**
 * Get meal plan work data
 * Returns the single meal plan work document (for admin and public)
 */
export const getMealPlanWork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') filter.status = status;

    // Get the single meal plan work document (since we're using upsert pattern)
    const mealPlanWork = await MealPlanWork.findOne(filter).sort({ createdAt: -1 });

    if (!mealPlanWork) {
      res.json({
        success: true,
        statusCode: 200,
        message: 'Meal plan work not found',
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Meal plan work retrieved successfully',
      data: mealPlanWork,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get meal plan work by ID
 * Returns a specific meal plan work document by ID (for admin)
 */
export const getMealPlanWorkById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const mealPlanWork = await MealPlanWork.findOne({ _id: id, isDeleted: false });

    if (!mealPlanWork) {
      next(new appError('Meal plan work not found', 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Meal plan work retrieved successfully',
      data: mealPlanWork,
    });
  } catch (error) {
    next(error);
  }
};

