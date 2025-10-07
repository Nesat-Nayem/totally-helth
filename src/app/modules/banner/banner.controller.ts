import { NextFunction, Request, Response } from "express";
import { Banner } from "./banner.model";
import { bannerValidation, bannerUpdateValidation } from "./banner.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

export const createBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      stock,
      description,
      meta,
      description2,
      metaTag,
      status,
      order,
    } = req.body as any;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    } | undefined;

    const imageFile = files?.file?.[0];
    const certLogoFile = files?.tag?.[0];

    if (!imageFile) {
      next(new appError("Banner image (file) is required", 400));
      return;
    }
    if (!certLogoFile) {
      next(new appError("Certification logo (tag) is required", 400));
      return;
    }

    const payload = {
      title,
      image: imageFile.path,
      certLogo: certLogoFile.path,
      description,
      metaTitle: meta,
      metaDescription: description2,
      metaKeywords: metaTag,
      googleReviewCount: stock ? parseInt(stock as string, 10) : 0,
      status: status === 'inactive' ? 'inactive' : 'active',
      order: order ? parseInt(order as string, 10) : 0,
    };

    const validatedData = bannerValidation.parse(payload);

    const banner = new Banner(validatedData);
    await banner.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Banner created successfully",
      data: banner,
    });
    return;
  } catch (error) {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    } | undefined;
    const uploadedPaths = [files?.file?.[0]?.path, files?.tag?.[0]?.path].filter(Boolean) as string[];
    for (const p of uploadedPaths) {
      const publicId = p.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
    }
    next(error);
  }
};

export const getAllBanners = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Optional status filter (?status=active|inactive)
    const { status } = req.query as { status?: string };
    const filter: any = { isDeleted: false };
    if (status === 'active' || status === 'inactive') {
      filter.status = status;
    }

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    
    if (banners.length === 0) {
       res.json({
        success: true,
        statusCode: 200,
        message: "No banners found",
        data: [],
      });
      return
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Banners retrieved successfully",
      data: banners,
    });
    return;
  } catch (error) {
    
    next(error);
  }
};

export const getBannerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banner = await Banner.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!banner) {
      return next(new appError("Banner not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Banner retrieved successfully",
      data: banner,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateBannerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bannerId = req.params.id;
    const { title, status, order, stock, description, meta, description2, metaTag } = req.body as any;
    
    // Find the banner to update
    const banner = await Banner.findOne({ 
      _id: bannerId, 
      isDeleted: false 
    });
    
    if (!banner) {
       next(new appError("Banner not found", 404));
       return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) {
      updateData.title = title;
    }

    if (status !== undefined) {
      updateData.status = status === 'inactive' ? 'inactive' : 'active';
    }

    if (order !== undefined) {
      updateData.order = parseInt(order as string, 10);
    }

    if (stock !== undefined) {
      updateData.googleReviewCount = parseInt(stock as string, 10);
    }

    if (description !== undefined) updateData.description = description;
    if (meta !== undefined) updateData.metaTitle = meta;
    if (description2 !== undefined) updateData.metaDescription = description2;
    if (metaTag !== undefined) updateData.metaKeywords = metaTag;

    // If there's a new image
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imageFile = files?.file?.[0];
    const certLogoFile = files?.tag?.[0];
    if (imageFile) {
      updateData.image = imageFile.path;
      if (banner.image) {
        const publicId = banner.image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
      }
    }
    if (certLogoFile) {
      updateData.certLogo = certLogoFile.path;
      if (banner.certLogo) {
        const publicId = banner.certLogo.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
      }
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = bannerUpdateValidation.parse(updateData);
      
      // Update the banner
      const updatedBanner = await Banner.findByIdAndUpdate(
        bannerId,
        validatedData,
        { new: true }
      );

       res.json({
        success: true,
        statusCode: 200,
        message: "Banner updated successfully",
        data: updatedBanner,
      });
      return;
      
    }

    // If no updates provided
     res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: banner,
    });
    return;
    

  } catch (error) {
    // If error occurs and image was uploaded, delete it
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const uploadedPaths = [files?.file?.[0]?.path, files?.tag?.[0]?.path].filter(Boolean) as string[];
    for (const p of uploadedPaths) {
      const publicId = p.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
    }
    next(error);
  }
};

export const deleteBannerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banner = await Banner.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!banner) {
       next(new appError("Banner not found", 404));
       return;
    }

    
    res.json({
      success: true,
      statusCode: 200,
      message: "Banner deleted successfully",
      data: banner,
    });
    return;
  } catch (error) {
    next(error);
  }
};
