import { Request, Response } from 'express';
import { AboutUs } from './aboutUs.model';

// Upsert About Us (create or update)
export const upsertAboutUs = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const data = { ...req.body };

    // Handle file uploads
    if (files?.banner?.[0]) data.banner = files.banner[0].path;
    if (files?.founderImage?.[0]) data.founderImage = files.founderImage[0].path;
    if (files?.isoCertificate?.[0]) data.isoCertificate = files.isoCertificate[0].path;
    if (files?.aboutBanner1?.[0]) data.aboutBanner1 = files.aboutBanner1[0].path;
    if (files?.aboutBanner2?.[0]) data.aboutBanner2 = files.aboutBanner2[0].path;
    if (files?.aboutBanner3?.[0]) data.aboutBanner3 = files.aboutBanner3[0].path;

    // Find existing record
    const existing = await AboutUs.findOne({ isDeleted: false });

    if (existing) {
      // Update existing
      const updated = await AboutUs.findByIdAndUpdate(existing._id, data, { new: true });
      return res.status(200).json({
        success: true,
        message: 'About Us updated successfully',
        data: updated,
      });
    } else {
      // Create new
      const created = await AboutUs.create(data);
      return res.status(201).json({
        success: true,
        message: 'About Us created successfully',
        data: created,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save About Us',
    });
  }
};

// Get About Us
export const getAboutUs = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = { isDeleted: false };
    if (status) query.status = status;

    const aboutUs = await AboutUs.findOne(query);
    return res.status(200).json({
      success: true,
      message: 'About Us retrieved successfully',
      data: aboutUs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get About Us',
    });
  }
};

// Get About Us by ID (for admin)
export const getAboutUsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const aboutUs = await AboutUs.findById(id);

    if (!aboutUs || aboutUs.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'About Us not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'About Us retrieved successfully',
      data: aboutUs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get About Us',
    });
  }
};
