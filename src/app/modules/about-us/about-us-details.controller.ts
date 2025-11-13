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
    const iconFiles = files?.icons || [];

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
            // Track which icon files have been used
            let iconFileIndex = 0;
            
            // Create map of existing services by _id for quick lookup (to preserve icons)
            const existingServiceMap = new Map();
            existingDetails.services.forEach((s: any) => {
              if (s._id) {
                existingServiceMap.set(s._id.toString(), s);
              }
            });
            
            // Track which existing services are being kept (to delete icons of removed services)
            const keptServiceIds = new Set(
              servs
                .map((s: any) => s._id?.toString())
                .filter(Boolean)
            );
            
            // Delete icons of services that are being removed
            existingDetails.services.forEach((existingService: any) => {
              const existingId = existingService._id?.toString();
              // If service has _id and it's NOT in the request, it's being removed
              if (existingId && !keptServiceIds.has(existingId)) {
                // Delete icon from Cloudinary
                if (existingService.icon && !existingService.icon.includes('placeholder')) {
                  const publicId = existingService.icon.split('/').pop()?.split('.')[0];
                  if (publicId) {
                    cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
                  }
                }
              }
            });
            
            // Process each service from request - this becomes the final services array
            const finalServices: any[] = [];
            
            servs.forEach((serv: any) => {
              // Skip invalid services
              if (!serv || typeof serv !== 'object') {
                return;
              }
              
              let iconValue = '';
              let oldIconToDelete = null;
              
              // Find existing service by _id if provided
              const existingService = serv._id 
                ? existingServiceMap.get(serv._id.toString())
                : null;
              
              // Check if valid icon URL is provided in request
              const providedIcon = serv.icon && typeof serv.icon === 'string' 
                ? serv.icon.trim() 
                : '';
              
              const hasValidIconUrl = providedIcon !== '' && 
                providedIcon !== '""' && 
                providedIcon !== 'null' &&
                !providedIcon.includes('placeholder') &&
                (providedIcon.startsWith('http') || providedIcon.startsWith('/'));
              
              // Check if existing service has valid icon
              const hasValidExistingIcon = existingService?.icon && 
                typeof existingService.icon === 'string' &&
                !existingService.icon.includes('placeholder') &&
                (existingService.icon.startsWith('http') || existingService.icon.startsWith('/'));
              
              // Determine icon value with priority: new upload > provided URL > existing icon
              // IMPORTANT: Only consume icon file if service needs it (new service or updating existing without valid URL)
              const needsIconFile = !serv._id || (!hasValidIconUrl && !hasValidExistingIcon);
              
              if (needsIconFile && iconFiles[iconFileIndex]?.path) {
                // New icon file uploaded - use it (for new service or updating existing without valid icon)
                if (existingService?.icon && !existingService.icon.includes('placeholder')) {
                  oldIconToDelete = existingService.icon;
                }
                iconValue = iconFiles[iconFileIndex].path;
                iconFileIndex++;
              } else if (hasValidIconUrl) {
                // Valid icon URL provided in request - use it (don't consume file)
                iconValue = providedIcon;
              } else if (hasValidExistingIcon) {
                // Use existing icon from database (don't consume file)
                iconValue = existingService.icon;
              } else if (!serv._id) {
                // New service without valid icon or file - skip it (can't create without icon)
                return;
              } else {
                // Existing service being updated but no valid icon provided - keep existing
                iconValue = existingService?.icon || '';
              }
              
              // Delete old icon from Cloudinary if replacing
              if (oldIconToDelete) {
                const publicId = oldIconToDelete.split('/').pop()?.split('.')[0];
                if (publicId) {
                  cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
                }
              }
              
              // Add service to final array (either updated existing or new)
              const serviceToAdd: any = {
                title: serv.title || '',
                description: serv.description || '',
                icon: iconValue,
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
            
            // Delete all existing service icons
            existingDetails.services.forEach((existingService: any) => {
              if (existingService.icon && !existingService.icon.includes('placeholder')) {
                const publicId = existingService.icon.split('/').pop()?.split('.')[0];
                if (publicId) {
                  cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
                }
              }
            });
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
      let servicesData: { title: string; description: string; icon: string }[] = [];
      if (services) {
        try {
          const servs = typeof services === 'string' ? JSON.parse(services) : services;
          
          if (Array.isArray(servs) && servs.length > 0) {
            let iconFileIndex = 0;
            
            servicesData = servs.map((serv: any) => {
              // For new services, icon must come from uploaded file or provided URL
              const providedIcon = serv.icon && typeof serv.icon === 'string' 
                ? serv.icon.trim() 
                : '';
              
              const hasValidIconUrl = providedIcon !== '' && 
                providedIcon !== '""' && 
                providedIcon !== 'null' &&
                !providedIcon.includes('placeholder') &&
                (providedIcon.startsWith('http') || providedIcon.startsWith('/'));
              
              const iconValue = iconFiles[iconFileIndex]?.path || 
                (hasValidIconUrl ? providedIcon : '');
              
              if (iconFiles[iconFileIndex]?.path) {
                iconFileIndex++;
              }
              
              return {
                title: serv.title || '',
                description: serv.description || '',
                icon: iconValue,
              };
            }).filter(service => service.icon && service.icon.trim() !== ''); // Only include services with valid icons
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
    const uploadedPaths = [
      files?.image?.[0]?.path,
      ...(files?.icons || []).map((f: Express.Multer.File) => f.path),
    ].filter(Boolean) as string[];
    
    for (const p of uploadedPaths) {
      const publicId = p.split('/').pop()?.split('.')[0];
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
