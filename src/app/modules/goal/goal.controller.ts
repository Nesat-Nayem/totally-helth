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

export const createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, subtitle, metaTitle, metaDescription, metaKeywords, status, order } = req.body as any;

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
      order: order ? parseInt(order as string, 10) : 0,
    };

    const validated = goalCreateValidation.parse(payload);
    const goal = new Goal(validated);
    await goal.save();

    res.status(201).json({ success: true, statusCode: 201, message: 'Goal created successfully', data: goal });
    return;
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

export const getAllGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') filter.status = status;
    const goals = await Goal.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, statusCode: 200, message: 'Goals retrieved successfully', data: goals });
  } catch (error) {
    next(error);
  }
};

export const getGoalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, isDeleted: false });
    if (!goal) {
      next(new appError('Goal not found', 404));
      return;
    }
    res.json({ success: true, statusCode: 200, message: 'Goal retrieved successfully', data: goal });
  } catch (error) {
    next(error);
  }
};

export const updateGoalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    const goal = await Goal.findOne({ _id: id, isDeleted: false });
    if (!goal) {
      next(new appError('Goal not found', 404));
      return;
    }

    const updateData: any = {};
    const { title, subtitle, metaTitle, metaDescription, metaKeywords, status, order } = req.body as any;
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;
    if (status !== undefined) updateData.status = status === 'inactive' ? 'inactive' : 'active';
    if (order !== undefined) updateData.order = parseInt(order as string, 10);

    // Handle section updates; if any section parts provided, rebuild sections array
    const maybeSections = buildSectionsFromRequest(req);
    if (maybeSections.length > 0) {
      // Cleanup old icons if they are being replaced and new icons are provided
      for (const s of maybeSections) {
        // no safe way to detect which icon replaced which; skip deletion here
      }
      updateData.sections = maybeSections;
    }

    if (Object.keys(updateData).length === 0) {
      res.json({ success: true, statusCode: 200, message: 'No changes to update', data: goal });
      return;
    }

    const validated = goalUpdateValidation.parse(updateData);
    const updated = await Goal.findByIdAndUpdate(id, validated, { new: true });
    res.json({ success: true, statusCode: 200, message: 'Goal updated successfully', data: updated });
  } catch (error) {
    // cleanup newly uploaded icons on error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const paths = [files?.section1Icon?.[0]?.path, files?.section2Icon?.[0]?.path, files?.section3Icon?.[0]?.path].filter(Boolean) as string[];
    for (const p of paths) {
      const publicId = p.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-goals/${publicId}`);
    }
    next(error);
  }
};

export const deleteGoalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
    if (!goal) {
      next(new appError('Goal not found', 404));
      return;
    }
    res.json({ success: true, statusCode: 200, message: 'Goal deleted successfully', data: goal });
  } catch (error) {
    next(error);
  }
};
