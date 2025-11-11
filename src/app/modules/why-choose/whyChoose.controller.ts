import { Request, Response, NextFunction } from 'express';
import { WhyChoose } from './whyChoose.model';
import { whyChooseCreateValidation, whyChooseUpdateValidation } from './whyChoose.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

/**
 * Upsert why choose data
 * Creates a new record if none exists, otherwise updates the existing record
 */
export const upsertWhyChoose = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const getFilePath = (name: string) => files?.[name]?.[0]?.path;

    const {
      title,
      subTitle,
      card1Icon,
      card1Title,
      card1Items,
      card2Icon,
      card2Title,
      card2Items,
      card3Icon,
      card3Title,
      card3Items,
      status,
    } = req.body as any;

    // Helper function to parse items array (can be JSON string, comma-separated, or array)
    const parseItems = (items: any): string[] => {
      if (!items) return [];
      if (Array.isArray(items)) return items.filter(Boolean);
      if (typeof items === 'string') {
        try {
          const parsed = JSON.parse(items);
          return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
          // If not JSON, treat as comma-separated
          return items.split(',').map((item: string) => item.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Check if why choose already exists (not deleted)
    const existingWhyChoose = await WhyChoose.findOne({ isDeleted: false });

    if (existingWhyChoose) {
      // Update existing why choose - build payload with only provided fields
      const updatePayload: any = {};

      if (title !== undefined) updatePayload.title = title;
      if (subTitle !== undefined) updatePayload.subTitle = subTitle;
      if (status !== undefined) updatePayload.status = status === 'inactive' ? 'inactive' : 'active';

      // Handle card1 - only update if provided
      if (card1Icon !== undefined || card1Title !== undefined || card1Items !== undefined) {
        const newCard1Icon = getFilePath('card1Icon');
        updatePayload.card1 = {
          icon: newCard1Icon || (card1Icon !== undefined ? card1Icon : existingWhyChoose.card1.icon),
          title: card1Title !== undefined ? card1Title : existingWhyChoose.card1.title,
          items: card1Items !== undefined ? parseItems(card1Items) : existingWhyChoose.card1.items,
        };
        // Cleanup old card1 icon if new one uploaded
        if (newCard1Icon && existingWhyChoose.card1.icon) {
          try {
            const publicId = existingWhyChoose.card1.icon.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(`why-choose/${publicId}`);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }

      // Handle card2 - only update if provided
      if (card2Icon !== undefined || card2Title !== undefined || card2Items !== undefined) {
        const newCard2Icon = getFilePath('card2Icon');
        updatePayload.card2 = {
          icon: newCard2Icon || (card2Icon !== undefined ? card2Icon : existingWhyChoose.card2.icon),
          title: card2Title !== undefined ? card2Title : existingWhyChoose.card2.title,
          items: card2Items !== undefined ? parseItems(card2Items) : existingWhyChoose.card2.items,
        };
        // Cleanup old card2 icon if new one uploaded
        if (newCard2Icon && existingWhyChoose.card2.icon) {
          try {
            const publicId = existingWhyChoose.card2.icon.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(`why-choose/${publicId}`);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }

      // Handle card3 - only update if provided
      if (card3Icon !== undefined || card3Title !== undefined || card3Items !== undefined) {
        const newCard3Icon = getFilePath('card3Icon');
        updatePayload.card3 = {
          icon: newCard3Icon || (card3Icon !== undefined ? card3Icon : existingWhyChoose.card3.icon),
          title: card3Title !== undefined ? card3Title : existingWhyChoose.card3.title,
          items: card3Items !== undefined ? parseItems(card3Items) : existingWhyChoose.card3.items,
        };
        // Cleanup old card3 icon if new one uploaded
        if (newCard3Icon && existingWhyChoose.card3.icon) {
          try {
            const publicId = existingWhyChoose.card3.icon.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(`why-choose/${publicId}`);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }

      // Validate update payload
      const validated = whyChooseUpdateValidation.parse(updatePayload);
      const updated = await WhyChoose.findByIdAndUpdate(
        existingWhyChoose._id,
        validated,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: 'Why choose updated successfully',
        data: updated,
      });
      return;
    } else {
      // Create new why choose - all fields required
      const card1Icon = getFilePath('card1Icon') || req.body.card1Icon;
      const card2Icon = getFilePath('card2Icon') || req.body.card2Icon;
      const card3Icon = getFilePath('card3Icon') || req.body.card3Icon;

      // Build cards
      const card1 = {
        icon: card1Icon,
        title: card1Title || req.body.card1?.title,
        items: parseItems(card1Items || req.body.card1?.items),
      };

      const card2 = {
        icon: card2Icon,
        title: card2Title || req.body.card2?.title,
        items: parseItems(card2Items || req.body.card2?.items),
      };

      const card3 = {
        icon: card3Icon,
        title: card3Title || req.body.card3?.title,
        items: parseItems(card3Items || req.body.card3?.items),
      };

      const payload = {
        title,
        subTitle,
        card1,
        card2,
        card3,
        status: status === 'inactive' ? 'inactive' : 'active',
      };

      // Validate create payload
      const validated = whyChooseCreateValidation.parse(payload);
      const whyChoose = new WhyChoose(validated);
      await whyChoose.save();

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Why choose created successfully',
        data: whyChoose,
      });
      return;
    }
  } catch (error) {
    // Cleanup uploaded files on error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const paths = [
      files?.card1Icon?.[0]?.path,
      files?.card2Icon?.[0]?.path,
      files?.card3Icon?.[0]?.path,
    ].filter(Boolean) as string[];
    for (const p of paths) {
      try {
        const publicId = p.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`why-choose/${publicId}`);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
    next(error);
  }
};

/**
 * Get why choose data
 * Returns the single why choose document (for admin and public)
 */
export const getWhyChoose = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') filter.status = status;

    // Get the single why choose document (since we're using upsert pattern)
    const whyChoose = await WhyChoose.findOne(filter).sort({ createdAt: -1 });

    if (!whyChoose) {
      res.json({
        success: true,
        statusCode: 200,
        message: 'Why choose not found',
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Why choose retrieved successfully',
      data: whyChoose,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get why choose by ID
 * Returns a specific why choose document by ID (for admin)
 */
export const getWhyChooseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const whyChoose = await WhyChoose.findOne({ _id: id, isDeleted: false });

    if (!whyChoose) {
      next(new appError('Why choose not found', 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Why choose retrieved successfully',
      data: whyChoose,
    });
  } catch (error) {
    next(error);
  }
};

