import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AboutUsDetails } from "./about-us-details.model";
import { aboutUsDetailsValidation, aboutUsDetailsUpdateValidation } from "./about-us-details.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

// Create or Update About Us Details (creates if doesn't exist, updates if exists)
export const createOrUpdateAboutUsDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { headline, description, services } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imageFile = files?.image?.[0];

    // Check if record exists
    let existingDetails = await AboutUsDetails.findOne({ isDeleted: false });

    if (existingDetails) {
      // ========== UPDATE EXISTING RECORD ==========
      const updateData: any = {};
      
      // Update headline if provided
      if (headline !== undefined && headline !== null && headline !== '') {
        updateData.headline = headline;
      }
      
      // Update description if provided
      if (description !== undefined && description !== null && description !== '') {
        updateData.description = description;
      }

      // Handle main image - only if new file is uploaded
      if (imageFile) {
        updateData.image = imageFile.path;
        // Delete old image if exists
        if (existingDetails.image && !existingDetails.image.includes('placeholder')) {
          const publicId = existingDetails.image.split('/').pop()?.split('.')[0];
          if (publicId) {
            cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
          }
        }
      }

      // Handle services - REPLACE entire array with request array
      // If services is provided, it REPLACES all existing services (removes services not in request)
      if (services !== undefined && services !== null && services !== '') {
        try {
          const servs = typeof services === 'string' ? JSON.parse(services) : services;
          
          // Process services array - this will REPLACE the entire services array
          if (Array.isArray(servs)) {
            // Process each service from request - this becomes the final services array
            const finalServices: any[] = [];
            
            servs.forEach((serv: any) => {
              // Skip invalid services
              if (!serv || typeof serv !== 'object') {
                return;
              }
              
              // Add service to final array (either updated existing or new)
              const serviceToAdd: any = {
                title: serv.title || '',
                description: serv.description || '',
              };
              
              // CRITICAL: Preserve _id if it exists (for updates), convert string to ObjectId for proper matching
              if (serv._id) {
                // Convert string _id to ObjectId for proper Mongoose subdocument matching
                serviceToAdd._id = typeof serv._id === 'string' 
                  ? new mongoose.Types.ObjectId(serv._id) 
                  : serv._id;
              }
              
              finalServices.push(serviceToAdd);
            });
            
            // REPLACE entire services array with final services (removes services not in request)
            updateData.services = finalServices;
          } else if (servs === null || servs === '') {
            // Empty array or null means clear all services
            updateData.services = [];
          }
        } catch (e: any) {
          // If services parsing fails, don't update services - preserve existing
          console.error('Error parsing services:', e.message);
        }
      }
      // If services is not provided, existing services are automatically preserved (not in updateData)

      // Update the record
      if (Object.keys(updateData).length > 0) {
        // Update fields directly on the document for better subdocument handling
        if (updateData.headline !== undefined) {
          existingDetails.headline = updateData.headline;
        }
        if (updateData.description !== undefined) {
          existingDetails.description = updateData.description;
        }
        if (updateData.image !== undefined) {
          existingDetails.image = updateData.image;
        }
        if (updateData.services !== undefined) {
          // Replace services array - Mongoose will handle _id matching for subdocuments
          existingDetails.services = updateData.services;
          // Mark services array as modified to ensure Mongoose saves it
          existingDetails.markModified('services');
        }
        
        // Save the document to persist changes
        const updatedDetails = await existingDetails.save();

        res.json({
          success: true,
          statusCode: 200,
          message: "About Us Details updated successfully",
          data: updatedDetails,
        });
        return;
      }

      // No changes
      res.json({
        success: true,
        statusCode: 200,
        message: "No changes to update",
        data: existingDetails,
      });
      return;
    } else {
      // ========== CREATE NEW RECORD ==========
      
      // Validate required fields
      if (!imageFile) {
        return next(new appError("Main image is required for creating About Us Details", 400));
      }
      
      if (!headline || !description) {
        return next(new appError("Headline and description are required", 400));
      }

      // Process services - optional for create
      let servicesData: { title: string; description: string }[] = [];
      if (services) {
        try {
          const servs = typeof services === 'string' ? JSON.parse(services) : services;
          
          if (Array.isArray(servs) && servs.length > 0) {
            servicesData = servs.map((serv: any) => {
              return {
                title: serv.title || '',
                description: serv.description || '',
              };
            }).filter(service => service.title && service.title.trim() !== ''); // Only include services with valid title
          }
        } catch (e: any) {
          // If services parsing fails, just create without services
          console.error('Error parsing services:', e.message);
        }
      }

      // Create new record
      const payload = {
        image: imageFile.path,
        headline,
        description,
        services: servicesData,
      };

      const validatedData = aboutUsDetailsValidation.parse(payload);
      const aboutUsDetails = new AboutUsDetails(validatedData);
      await aboutUsDetails.save();

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: "About Us Details created successfully",
        data: aboutUsDetails,
      });
      return;
    }
  } catch (error: any) {
    // Clean up uploaded files on error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imagePath = files?.image?.[0]?.path;
    
    if (imagePath) {
      const publicId = imagePath.split('/').pop()?.split('.')[0];
      if (publicId) {
        cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
      }
    }
    
    next(error);
  }
};

// Get All About Us Details (Admin)
export const getAllAboutUsDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const details = await AboutUsDetails.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      statusCode: 200,
      message: "About Us Details retrieved successfully",
      data: details,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get Single About Us Details (Frontend)
export const getAboutUsDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const details = await AboutUsDetails.findOne({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    if (!details) {
      res.json({
        success: true,
        statusCode: 200,
        message: "About Us Details not found",
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "About Us Details retrieved successfully",
      data: details,
    });
    return;
  } catch (error) {
    next(error);
  }
};
