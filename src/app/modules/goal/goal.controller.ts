import { Request, Response, NextFunction } from 'express';
import { Goal } from './goal.model';
import { goalCreateValidation, goalUpdateValidation } from './goal.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

const buildSectionsFromRequest = (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const getFilePath = (name: string) => files?.[name]?.[0]?.path;

  const sectionDefs = [
    {
      title: (req.body.section1Title as string) || undefined,
      description: (req.body.section1Description as string) || undefined,
      icon: getFilePath('section1Icon') || (req.body.section1Icon as string) || undefined,
    },
    {
      title: (req.body.section2Title as string) || undefined,
      description: (req.body.section2Description as string) || undefined,
      icon: getFilePath('section2Icon') || (req.body.section2Icon as string) || undefined,
    },
    {
      title: (req.body.section3Title as string) || undefined,
      description: (req.body.section3Description as string) || undefined,
      icon: getFilePath('section3Icon') || (req.body.section3Icon as string) || undefined,
    },
  ];

  const sections = sectionDefs.filter(s => s.title && s.description && s.icon) as { title: string; description: string; icon: string; }[];
  return sections;
};

// Upsert function: creates if doesn't exist, updates if exists
export const upsertGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, subtitle, metaTitle, metaDescription, metaKeywords, status } = req.body as any;

    const sections = buildSectionsFromRequest(req);
    if (sections.length === 0) {
      next(new appError('At least one section with title, icon and description is required', 400));
      return;
    }

    const payload = {
      title,
      subtitle,
      sections,
      metaTitle,
      metaDescription,
      metaKeywords,
      status: status === 'inactive' ? 'inactive' : 'active',
    };

    // Check if a goal already exists (not deleted)
    const existingGoal = await Goal.findOne({ isDeleted: false });

    if (existingGoal) {
      // Update existing goal
      const validated = goalUpdateValidation.parse(payload);
      const updated = await Goal.findByIdAndUpdate(existingGoal._id, validated, { new: true });
      res.json({ success: true, statusCode: 200, message: 'Goal updated successfully', data: updated });
      return;
    } else {
      // Create new goal
      const validated = goalCreateValidation.parse(payload);
      const goal = new Goal(validated);
      await goal.save();
      res.status(201).json({ success: true, statusCode: 201, message: 'Goal created successfully', data: goal });
      return;
    }
  } catch (error) {
    // Cleanup uploaded icons on error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const paths = [files?.section1Icon?.[0]?.path, files?.section2Icon?.[0]?.path, files?.section3Icon?.[0]?.path].filter(Boolean) as string[];
    for (const p of paths) {
      const publicId = p.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-goals/${publicId}`);
    }
    next(error);
  }
};

// Get goal for frontend (returns single active goal or first available)
export const getGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') filter.status = status;
    
    // Get the first active goal (since we're using upsert pattern, there should be one main goal)
    const goal = await Goal.findOne(filter).sort({ createdAt: -1 });
    
    if (!goal) {
      res.json({ success: true, statusCode: 200, message: 'No goal found', data: null });
      return;
    }
    
    res.json({ success: true, statusCode: 200, message: 'Goal retrieved successfully', data: goal });
  } catch (error) {
    next(error);
  }
};
