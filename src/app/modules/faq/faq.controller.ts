import { NextFunction, Request, Response } from "express";
import { FAQ } from "./faq.model";
import { faqValidation, faqUpdateValidation } from "./faq.validation";
import { appError } from "../../errors/appError";

export const createFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, answer, order, isActive } = req.body;
    
    // Validate the input
    const validatedData = faqValidation.parse({ 
      question, 
      answer,
      order: order ? parseInt(order as string) : undefined,
      isActive: isActive === 'true' || isActive === true
    });

    // Create a new FAQ
    const faq = new FAQ(validatedData);
    await faq.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // For frontend: only return active FAQs (when active=true)
    // For admin: return all FAQs (when authenticated)
    const { active } = req.query;
    const filter: any = { isDeleted: false };
    
    // If active=true is passed, only return active FAQs (for frontend)
    // Otherwise, return all FAQs (for admin)
    if (active === 'true') {
      filter.isActive = true;
    }
    
    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });
    
    if (faqs.length === 0) {
      res.json({
        success: true,
        statusCode: 200,
        message: "No FAQs found",
        data: [],
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "FAQs retrieved successfully",
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFAQById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const faqId = req.params.id;
    const { question, answer, order, isActive } = req.body;
    
    // Find the FAQ to update
    const faq = await FAQ.findOne({ 
      _id: faqId, 
      isDeleted: false 
    });
    
    if (!faq) {
      return next(new appError("FAQ not found", 404));
    }

    // Prepare update data
    const updateData: any = {};
    
    if (question !== undefined) {
      updateData.question = question;
    }
    
    if (answer !== undefined) {
      updateData.answer = answer;
    }
    
    if (order !== undefined) {
      updateData.order = parseInt(order as string);
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive === 'true' || isActive === true;
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = faqUpdateValidation.parse(updateData);
      
      // Update the FAQ
      const updatedFAQ = await FAQ.findByIdAndUpdate(
        faqId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: "FAQ updated successfully",
        data: updatedFAQ,
      });
      return;
    }

    // If no updates provided
    res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const faq = await FAQ.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!faq) {
      return next(new appError("FAQ not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "FAQ deleted successfully",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};