import { Request, Response, NextFunction } from 'express';
import { Testimonial } from './testimonial.model';
import { testimonialCreateValidation, testimonialUpdateValidation } from './testimonial.validation';
import { appError } from '../../errors/appError';

// Create testimonial
export const createTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quote, authorName, authorProfession, order, status } = req.body;

    const payload = {
      quote,
      authorName,
      authorProfession,
      order: order ? parseInt(order) : 0,
      status: status === 'inactive' ? 'inactive' : 'active',
    };

    const validated = testimonialCreateValidation.parse(payload);
    const testimonial = new Testimonial(validated);
    await testimonial.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Testimonial created successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

// Get all testimonials (admin)
export const getAllTestimonials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') filter.status = status;

    const testimonials = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Testimonials retrieved successfully',
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

// Get single testimonial by ID (admin)
export const getTestimonialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findOne({ _id: id, isDeleted: false });

    if (!testimonial) {
      next(new appError('Testimonial not found', 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Testimonial retrieved successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

// Update testimonial
export const updateTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { quote, authorName, authorProfession, order, status } = req.body;

    const testimonial = await Testimonial.findOne({ _id: id, isDeleted: false });

    if (!testimonial) {
      next(new appError('Testimonial not found', 404));
      return;
    }

    const payload: any = {};
    if (quote !== undefined) payload.quote = quote;
    if (authorName !== undefined) payload.authorName = authorName;
    if (authorProfession !== undefined) payload.authorProfession = authorProfession;
    if (order !== undefined) payload.order = parseInt(order);
    if (status !== undefined) payload.status = status === 'inactive' ? 'inactive' : 'active';

    const validated = testimonialUpdateValidation.parse(payload);
    const updated = await Testimonial.findByIdAndUpdate(id, validated, { new: true });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Testimonial updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Delete testimonial (soft delete)
export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findOne({ _id: id, isDeleted: false });

    if (!testimonial) {
      next(new appError('Testimonial not found', 404));
      return;
    }

    await Testimonial.findByIdAndUpdate(id, { isDeleted: true });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get active testimonials for frontend (sorted by order)
export const getActiveTestimonials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ isDeleted: false, status: 'active' }).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Testimonials retrieved successfully',
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

