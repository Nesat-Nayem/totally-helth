import { Request, Response, NextFunction } from 'express';
import { Compare } from './compare.model';
import { compareCreateValidation, compareUpdateValidation } from './compare.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

// Upsert function: creates if doesn't exist, updates if exists
export const upsertCompare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const getFilePath = (name: string) => files?.[name]?.[0]?.path;

    const { title, banner1, banner2, compareItems, status } = req.body as any;

    // Parse compareItems if it's a string (from form data)
    let parsedCompareItems = [];
    if (compareItems) {
      try {
        parsedCompareItems = typeof compareItems === 'string' ? JSON.parse(compareItems) : compareItems;
      } catch {
        parsedCompareItems = [];
      }
    }

    const payload = {
      title,
      banner1: getFilePath('banner1') || banner1 || undefined,
      banner2: getFilePath('banner2') || banner2 || undefined,
      compareItems: parsedCompareItems.length > 0 ? parsedCompareItems : undefined,
      status: status === 'inactive' ? 'inactive' : 'active',
    };

    // Check if compare already exists (not deleted)
    const existingCompare = await Compare.findOne({ isDeleted: false });

    if (existingCompare) {
      // Update existing compare
      const validated = compareUpdateValidation.parse(payload);
      const updated = await Compare.findByIdAndUpdate(existingCompare._id, validated, { new: true });
      res.json({ success: true, statusCode: 200, message: 'Compare updated successfully', data: updated });
      return;
    } else {
      // Create new compare
      const validated = compareCreateValidation.parse(payload);
      const compare = new Compare(validated);
      await compare.save();
      res.status(201).json({ success: true, statusCode: 201, message: 'Compare created successfully', data: compare });
      return;
    }
  } catch (error) {
    // Cleanup uploaded banners on error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const paths = [files?.banner1?.[0]?.path, files?.banner2?.[0]?.path].filter(Boolean) as string[];
    for (const p of paths) {
      const publicId = p.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-compare/${publicId}`);
    }
    next(error);
  }
};

// Get compare for frontend (returns single active compare)
// Note: banner2 is returned as image1 for client side
export const getCompare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') filter.status = status;
    
    // Get the first compare (since we're using upsert pattern, there should be one main compare)
    const compare = await Compare.findOne(filter).sort({ createdAt: -1 });
    
    if (!compare) {
      res.json({ success: true, statusCode: 200, message: 'No compare found', data: null });
      return;
    }
    
    // Transform data: banner2 becomes image1 for client side
    const transformedData: any = {
      ...compare.toObject(),
      image1: compare.banner2, // banner2 shown as image1
      image2: compare.banner1, // banner1 shown as image2
    };
    
    // Remove banner1 and banner2 from response
    delete transformedData.banner1;
    delete transformedData.banner2;
    
    res.json({ success: true, statusCode: 200, message: 'Compare retrieved successfully', data: transformedData });
  } catch (error) {
    next(error);
  }
};

