import { NextFunction, Request, Response } from 'express';
import { MealPlan } from './mealPlan.model';
import { mealPlanValidation, mealPlanUpdateValidation } from './mealPlan.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

export const createMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as any;

    // files: images[] and optional thumbnail
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const images = (files?.images || []).map((f) => f.path);
    const thumbnail = files?.thumbnail?.[0]?.path;

    const payload = {
      title: body.title,
      description: body.description,
      badge: body.badge,
      discount: body.discount,
      price: body.price ? Number(body.price) : undefined,
      delPrice: body.delPrice ? Number(body.delPrice) : undefined,
      category: body.category,
      brand: body.brand,
      kcalList: body.kcalList ? ensureArray(body.kcalList) : undefined,
      deliveredList: body.deliveredList ? ensureArray(body.deliveredList) : undefined,
      suitableList: body.suitableList ? ensureArray(body.suitableList) : undefined,
      daysPerWeek: body.daysPerWeek ? ensureArray(body.daysPerWeek) : undefined,
      weeksOffers: body.weeksOffers ? ensureWeekOffers(body.weeksOffers) : undefined,
      weeks: body.weeks ? ensureWeeks(body.weeks) : undefined,
      totalMeals: body.totalMeals ? Number(body.totalMeals) : undefined,
      durationDays: body.durationDays ? Number(body.durationDays) : undefined,
      images: images.length ? images : undefined,
      thumbnail: thumbnail,
      status: body.status === 'inactive' ? 'inactive' : 'active',
      showOnClient: body.showOnClient !== undefined ? parseBoolean(body.showOnClient) : true,
    } as any;

    const validated = mealPlanValidation.parse(payload);

    const doc = new MealPlan(validated);
    await doc.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Meal plan created successfully',
      data: doc,
    });
    return;
  } catch (error) {
    tryCleanupUploaded(req);
    next(error);
  }
};

export const getAllMealPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, q, brand, category, page = '1', limit = '20', fields } = req.query as Record<string, string>;

    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') filter.status = status;
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit || '20', 10)));

    const projection = buildProjection(fields);

    const [items, total] = await Promise.all([
      MealPlan.find(filter, projection).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      MealPlan.countDocuments(filter),
    ]);

    res.json({
      success: true,
      statusCode: 200,
      message: 'Meal plans retrieved successfully',
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        hasNext: pageNum * limitNum < total,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMealPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await MealPlan.findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return next(new appError('Meal plan not found', 404));

    res.json({
      success: true,
      statusCode: 200,
      message: 'Meal plan retrieved successfully',
      data: doc,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateMealPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await MealPlan.findOne({ _id: id, isDeleted: false });
    if (!doc) return next(new appError('Meal plan not found', 404));

    const body = req.body as any;
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.discount !== undefined) updateData.discount = body.discount;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.delPrice !== undefined) updateData.delPrice = Number(body.delPrice);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.kcalList !== undefined) updateData.kcalList = ensureArray(body.kcalList);
    if (body.deliveredList !== undefined) updateData.deliveredList = ensureArray(body.deliveredList);
    if (body.suitableList !== undefined) updateData.suitableList = ensureArray(body.suitableList);
    if (body.daysPerWeek !== undefined) updateData.daysPerWeek = ensureArray(body.daysPerWeek);
    if (body.weeksOffers !== undefined) updateData.weeksOffers = ensureWeekOffers(body.weeksOffers);
    if (body.weeks !== undefined) updateData.weeks = ensureWeeks(body.weeks);
    if (body.status !== undefined) updateData.status = body.status === 'inactive' ? 'inactive' : 'active';
    if (body.showOnClient !== undefined) updateData.showOnClient = parseBoolean(body.showOnClient);
    if (body.totalMeals !== undefined) updateData.totalMeals = Number(body.totalMeals);
    if (body.durationDays !== undefined) updateData.durationDays = Number(body.durationDays);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const newImages = (files?.images || []).map((f) => f.path);
    const newThumbnail = files?.thumbnail?.[0]?.path;

    if (newImages.length) {
      updateData.images = newImages; // replace set for now
      // Optionally cleanup old images
      if (Array.isArray(doc.images)) {
        for (const p of doc.images) await tryDestroyCloudinary(p);
      }
    }
    if (newThumbnail) {
      updateData.thumbnail = newThumbnail;
      if (doc.thumbnail) await tryDestroyCloudinary(doc.thumbnail);
    }

    if (Object.keys(updateData).length > 0) {
      const validated = mealPlanUpdateValidation.parse(updateData);
      const updated = await MealPlan.findByIdAndUpdate(id, validated, { new: true });
      res.json({ success: true, statusCode: 200, message: 'Meal plan updated successfully', data: updated });
      return;
    }

    res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
    return;
  } catch (error) {
    tryCleanupUploaded(req);
    next(error);
  }
};

export const deleteMealPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await MealPlan.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
    if (!doc) return next(new appError('Meal plan not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Meal plan deleted successfully', data: doc });
    return;
  } catch (error) {
    next(error);
  }
};

// helpers
function parseBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const lower = input.toLowerCase().trim();
    return lower === 'true' || lower === '1';
  }
  return Boolean(input);
}

function ensureArray(input: any): string[] {
  if (Array.isArray(input)) return input.map(String).filter((s) => s?.length);
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(String).filter((s) => s?.length);
    } catch {
      // comma separated fallback
      return input.split(',').map((s: string) => s.trim()).filter((s: string) => s.length);
    }
  }
  return [];
}

function ensureWeekOffers(input: any): { week: string; offer: string }[] {
  if (Array.isArray(input)) return input as any;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed as any;
    } catch {}
  }
  return [];
}

function ensureWeeks(input: any): any[] {
  if (Array.isArray(input)) return input as any;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed as any;
    } catch {}
  }
  return [];
}

async function tryDestroyCloudinary(path: string) {
  const publicId = path?.split('/')?.pop()?.split('.')?.[0];
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(`restaurant-uploads/${publicId}`);
    } catch {
      // ignore
    }
  }
}

function tryCleanupUploaded(req: Request) {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const uploadedPaths = [
    ...(files?.images || []).map((f) => f.path),
    files?.thumbnail?.[0]?.path,
  ].filter(Boolean) as string[];
  uploadedPaths.forEach(async (p) => {
    await tryDestroyCloudinary(p);
  });
}

function buildProjection(fields?: string): Record<string, 1> | undefined {
  if (!fields) return undefined;
  const proj: Record<string, 1> = {};
  fields
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((f) => (proj[f] = 1));
  // Always include _id
  if (!proj._id) proj._id = 1;
  return Object.keys(proj).length ? proj : undefined;
}
