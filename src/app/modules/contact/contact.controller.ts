import { NextFunction, Request, Response } from "express";
import { Contact } from "./contact.model";
import { contactValidation } from "./contact.validation";
import { appError } from "../../errors/appError";

/**
 * Create a new contact enquiry (Public endpoint)
 * POST /api/contact
 */
export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, emailAddress, phoneNumber, subject, message } = req.body;
    
    // Validate the input
    const validatedData = contactValidation.parse({ 
      fullName, 
      emailAddress, 
      phoneNumber: phoneNumber || undefined,
      subject: subject || undefined,
      message
    });

    // Create a new contact enquiry
    const contact = new Contact(validatedData);
    await contact.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Contact enquiry submitted successfully",
      data: {
        id: contact._id,
        fullName: contact.fullName,
        emailAddress: contact.emailAddress,
        subject: contact.subject,
        createdAt: contact.createdAt
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Get all contact enquiries with pagination and filtering (Admin only)
 * GET /api/contact?page=1&limit=10&search=email
 */
export const getAllContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get query parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const { search, startDate, endDate } = req.query;

    // Build filter
    const filter: any = { isDeleted: false };
    
    // Search filter (by email, name, subject, or phone)
    if (search) {
      const searchRegex = { $regex: search as string, $options: 'i' };
      filter.$or = [
        { emailAddress: searchRegex },
        { fullName: searchRegex },
        { subject: searchRegex },
        { phoneNumber: searchRegex }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999); // Include entire end date
        filter.createdAt.$lte = end;
      }
    }
    
    // Get total count and contacts with pagination
    const [total, contacts] = await Promise.all([
      Contact.countDocuments(filter),
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean()
    ]);
    
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      statusCode: 200,
      message: contacts.length > 0 
        ? "Contact enquiries retrieved successfully" 
        : "No contact enquiries found",
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single contact enquiry by ID (Admin only)
 * GET /api/contact/:id
 */
export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new appError("Invalid contact enquiry ID format", 400));
    }
    
    const contact = await Contact.findOne({ 
      _id: id, 
      isDeleted: false 
    }).select('-__v');
    
    if (!contact) {
      return next(new appError("Contact enquiry not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Contact enquiry retrieved successfully",
      data: contact,
    });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete a contact enquiry by ID (Admin only)
 * DELETE /api/contact/:id
 */
export const deleteContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new appError("Invalid contact enquiry ID format", 400));
    }
    
    const contact = await Contact.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    ).select('-__v');
    
    if (!contact) {
      return next(new appError("Contact enquiry not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Contact enquiry deleted successfully",
      data: contact,
    });
    return;
  } catch (error) {
    next(error);
  }
};

