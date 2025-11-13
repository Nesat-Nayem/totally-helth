import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AboutUsFood } from "./about-us-food.model";
import { aboutUsFoodValidation, aboutUsFoodUpdateValidation } from "./about-us-food.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

// Create or Update About Us Food (creates if doesn't exist, updates if exists)
export const createOrUpdateAboutUsFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, subtitle, description, certifications } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imageFiles = files?.images || [];
    const certLogoFiles = files?.certLogos || [];

    // Check if record exists
    let existingFood = await AboutUsFood.findOne({ isDeleted: false });

    if (existingFood) {
      // ========== UPDATE EXISTING RECORD ==========
      const updateData: any = {};
      
      // Update basic fields if provided
      if (title !== undefined && title !== null && title !== '') {
        updateData.title = title;
      }
      if (subtitle !== undefined && subtitle !== null && subtitle !== '') {
        updateData.subtitle = subtitle;
      }
      if (description !== undefined && description !== null && description !== '') {
        updateData.description = description;
      }

      // Handle images - ADD new images to existing ones (preserve existing)
      if (imageFiles.length > 0) {
        // Add new images to existing images array (preserve existing)
        const newImagePaths = imageFiles.map((file: Express.Multer.File) => file.path);
        updateData.images = [...existingFood.images, ...newImagePaths];
      }

      // Handle certifications - SMART LOGIC:
      // If request has ANY certifications with _id → REPLACE entire array (removes items not in request)
      // If request has ONLY new certifications (no _id) → ADD to existing (preserve all existing)
      if (certifications !== undefined && certifications !== null && certifications !== '') {
        try {
          const certs = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;
          
          if (Array.isArray(certs)) {
            // Check if request contains any certifications with _id
            const hasExistingCerts = certs.some((c: any) => c && c._id);
            
            // Track which logo files have been used
            let logoFileIndex = 0;
            
            // Create map of existing certifications by _id for quick lookup
            const existingCertMap = new Map();
            existingFood.certifications.forEach((c: any) => {
              if (c._id) {
                existingCertMap.set(c._id.toString(), c);
              }
            });
            
            // Get IDs of certifications being sent in request
            const requestedCertIds = new Set(
              certs
                .map((c: any) => c._id?.toString())
                .filter(Boolean)
            );
            
            const finalCertifications: any[] = [];
            
            if (hasExistingCerts) {
              // MODE 1: REPLACE MODE - Request contains existing certifications with _id
              // This means: Replace entire array (removes certifications not in request)
              
              // Delete logos of certifications that are being removed
              existingFood.certifications.forEach((existingCert: any) => {
                const existingId = existingCert._id?.toString();
                // If certification has _id and it's NOT in the request, it's being removed
                if (existingId && !requestedCertIds.has(existingId)) {
                  // Delete logo from Cloudinary
                  if (existingCert.logo && !existingCert.logo.includes('placeholder') && !existingCert.logo.includes('temp-logo')) {
                    const publicId = existingCert.logo.split('/').pop()?.split('.')[0];
                    if (publicId) {
                      cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
                    }
                  }
                }
              });
              
              // Process only certifications from request (this becomes the final array)
              const processedCertIds = new Set<string>();
              
              certs.forEach((cert: any) => {
                if (!cert || typeof cert !== 'object') {
                  return;
                }
                
                const certId = cert._id?.toString();
                
                // Skip duplicates
                if (certId && processedCertIds.has(certId)) {
                  return;
                }
                if (certId) {
                  processedCertIds.add(certId);
                }
                
                let logoValue = '';
                let oldLogoToDelete = null;
                
                const existingCert = cert._id ? existingCertMap.get(cert._id.toString()) : null;
                
                const providedLogo = cert.logo && typeof cert.logo === 'string' ? cert.logo.trim() : '';
                const hasValidLogoUrl = providedLogo !== '' && 
                  providedLogo !== '""' && 
                  providedLogo !== 'null' &&
                  !providedLogo.includes('placeholder') &&
                  !providedLogo.includes('temp-logo') &&
                  (providedLogo.startsWith('http') || providedLogo.startsWith('/'));
                
                const hasValidExistingLogo = existingCert?.logo && 
                  typeof existingCert.logo === 'string' &&
                  !existingCert.logo.includes('placeholder') &&
                  !existingCert.logo.includes('temp-logo') &&
                  (existingCert.logo.startsWith('http') || existingCert.logo.startsWith('/'));
                
                const needsLogoFile = !cert._id || (!hasValidLogoUrl && !hasValidExistingLogo);
                
                if (needsLogoFile && certLogoFiles[logoFileIndex]?.path) {
                  if (existingCert?.logo && !existingCert.logo.includes('placeholder') && !existingCert.logo.includes('temp-logo')) {
                    oldLogoToDelete = existingCert.logo;
                  }
                  logoValue = certLogoFiles[logoFileIndex].path;
                  logoFileIndex++;
                } else if (hasValidLogoUrl) {
                  logoValue = providedLogo;
                } else if (hasValidExistingLogo) {
                  logoValue = existingCert.logo;
                } else if (!cert._id) {
                  return; // Skip new cert without logo
                } else {
                  logoValue = existingCert?.logo || '';
                }
                
                if (oldLogoToDelete) {
                  const publicId = oldLogoToDelete.split('/').pop()?.split('.')[0];
                  if (publicId) {
                    cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
                  }
                }
                
                const certToAdd: any = {
                  name: cert.name || '',
                  logo: logoValue,
                };
                
                if (cert._id) {
                  certToAdd._id = typeof cert._id === 'string' 
                    ? new mongoose.Types.ObjectId(cert._id) 
                    : cert._id;
                }
                
                finalCertifications.push(certToAdd);
              });
              
            } else {
              // MODE 2: ADD MODE - Request contains only new certifications (no _id)
              // This means: Preserve all existing + add new ones
              
              // STEP 1: Preserve ALL existing certifications
              existingFood.certifications.forEach((existingCert: any) => {
                finalCertifications.push({
                  _id: existingCert._id,
                  name: existingCert.name || '',
                  logo: existingCert.logo || '',
                });
              });
              
              // STEP 2: Add new certifications from request
              certs.forEach((cert: any) => {
                if (!cert || typeof cert !== 'object' || cert._id) {
                  return; // Skip invalid or existing certs
                }
                
                let logoValue = '';
                
                const providedLogo = cert.logo && typeof cert.logo === 'string' ? cert.logo.trim() : '';
                const hasValidLogoUrl = providedLogo !== '' && 
                  providedLogo !== '""' && 
                  providedLogo !== 'null' &&
                  !providedLogo.includes('placeholder') &&
                  !providedLogo.includes('temp-logo') &&
                  (providedLogo.startsWith('http') || providedLogo.startsWith('/'));
                
                if (certLogoFiles[logoFileIndex]?.path) {
                  logoValue = certLogoFiles[logoFileIndex].path;
                  logoFileIndex++;
                } else if (hasValidLogoUrl) {
                  logoValue = providedLogo;
                } else {
                  return; // Skip new cert without logo
                }
                
                finalCertifications.push({
                  name: cert.name || '',
                  logo: logoValue,
                });
              });
            }
            
            updateData.certifications = finalCertifications;
          } else if (certs === null || certs === '') {
            // Empty array or null means clear all certifications
            updateData.certifications = [];
            
            // Delete all existing certification logos
            existingFood.certifications.forEach((existingCert: any) => {
              if (existingCert.logo && !existingCert.logo.includes('placeholder') && !existingCert.logo.includes('temp-logo')) {
                const publicId = existingCert.logo.split('/').pop()?.split('.')[0];
                if (publicId) {
                  cloudinary.uploader.destroy(`about-us/${publicId}`).catch(() => {});
                }
              }
            });
          }
        } catch (e: any) {
          // If certifications parsing fails, don't update certifications - preserve existing
          console.error('Error parsing certifications:', e.message);
        }
      }
      // If certifications is not provided, existing certifications are automatically preserved (not in updateData)

      // Update the record
      if (Object.keys(updateData).length > 0) {
        // Update fields directly on the document for better subdocument handling
        if (updateData.title !== undefined) {
          existingFood.title = updateData.title;
        }
        if (updateData.subtitle !== undefined) {
          existingFood.subtitle = updateData.subtitle;
        }
        if (updateData.description !== undefined) {
          existingFood.description = updateData.description;
        }
        if (updateData.images !== undefined) {
          existingFood.images = updateData.images;
        }
        if (updateData.certifications !== undefined) {
          // Replace certifications array - Mongoose will handle _id matching for subdocuments
          existingFood.certifications = updateData.certifications;
          // Mark certifications array as modified to ensure Mongoose saves it
          existingFood.markModified('certifications');
        }
        
        // Save the document to persist changes
        const updatedFood = await existingFood.save();

        res.json({
          success: true,
          statusCode: 200,
          message: "About Us Food updated successfully",
          data: updatedFood,
        });
        return;
      }

      // No changes
      res.json({
        success: true,
        statusCode: 200,
        message: "No changes to update",
        data: existingFood,
      });
      return;
    } else {
      // Create new record
      if (imageFiles.length === 0) {
        next(new appError("At least one image is required", 400));
        return;
      }

      const imagePaths = imageFiles.map((file: Express.Multer.File) => file.path);
      
      let certificationsData: { name: string; logo: string }[] = [];
      if (certifications) {
        try {
          const certs = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;
          if (Array.isArray(certs)) {
            let logoFileIndex = 0;
            certificationsData = certs.map((cert: any) => {
              // For new certifications, logo must come from uploaded file or provided URL
              const providedLogo = cert.logo && typeof cert.logo === 'string' 
                ? cert.logo.trim() 
                : '';
              
              const hasValidLogoUrl = providedLogo !== '' && 
                providedLogo !== '""' && 
                providedLogo !== 'null' &&
                !providedLogo.includes('placeholder') &&
                !providedLogo.includes('temp-logo') &&
                (providedLogo.startsWith('http') || providedLogo.startsWith('/'));
              
              const logoValue = certLogoFiles[logoFileIndex]?.path || 
                (hasValidLogoUrl ? providedLogo : '');
              
              if (certLogoFiles[logoFileIndex]?.path) {
                logoFileIndex++;
              }
              
              return {
                name: cert.name || '',
                logo: logoValue,
              };
            }).filter(cert => cert.logo && cert.logo.trim() !== ''); // Only include certifications with valid logos
          }
        } catch (e) {
          // If parsing fails, use empty array
        }
      }

      const payload = {
        title,
        subtitle,
        description,
        images: imagePaths,
        certifications: certificationsData,
      };

      const validatedData = aboutUsFoodValidation.parse(payload);
      const aboutUsFood = new AboutUsFood(validatedData);
      await aboutUsFood.save();

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: "About Us Food created successfully",
        data: aboutUsFood,
      });
      return;
    }
  } catch (error) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const uploadedPaths = [
      ...(files?.images || []).map((f: Express.Multer.File) => f.path),
      ...(files?.certLogos || []).map((f: Express.Multer.File) => f.path),
    ];
    for (const p of uploadedPaths) {
      const publicId = p.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`about-us/${publicId}`);
    }
    next(error);
  }
};

// Get All About Us Food (Admin)
export const getAllAboutUsFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const foods = await AboutUsFood.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      statusCode: 200,
      message: "About Us Food retrieved successfully",
      data: foods,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get Single About Us Food (Frontend)
export const getAboutUsFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const food = await AboutUsFood.findOne({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    if (!food) {
      res.json({
        success: true,
        statusCode: 200,
        message: "About Us Food not found",
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "About Us Food retrieved successfully",
      data: food,
    });
    return;
  } catch (error) {
    next(error);
  }
};


