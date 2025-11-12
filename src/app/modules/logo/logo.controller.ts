import { NextFunction, Request, Response } from 'express';
import { Logo } from './logo.model';
import { logoValidation, logoUpdateValidation } from './logo.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

export const createLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, order } = req.body as any;

    const imageFile = req.file;

    if (!imageFile) {
      next(new appError('Logo image (file) is required', 400));
      return;
    }

    const payload = {
      image: imageFile.path,
      status: status === 'inactive' ? 'inactive' : 'active',
      order: order ? parseInt(order as string, 10) : 0,
    };

    const validatedData = logoValidation.parse(payload);

    const logo = new Logo(validatedData);
    await logo.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Logo created successfully',
      data: logo,
    });
    return;
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`restaurant-logos/${publicId}`);
        } catch (cloudinaryError) {
          // Log error but don't fail
          console.error('Error deleting file from cloudinary:', cloudinaryError);
        }
      }
    }
    next(error);
  }
};

export const getAllLogos = async (
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

    // Sort by order ascending, then by createdAt descending
    const logos = await Logo.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (logos.length === 0) {
      res.json({
        success: true,
        statusCode: 200,
        message: 'No logos found',
        data: [],
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Logos retrieved successfully',
      data: logos,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getLogoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logo = await Logo.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!logo) {
      return next(new appError('Logo not found', 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Logo retrieved successfully',
      data: logo,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateLogoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logoId = req.params.id;
    const { status, order } = req.body as any;

    // Find the logo to update
    const logo = await Logo.findOne({
      _id: logoId,
      isDeleted: false,
    });

    if (!logo) {
      next(new appError('Logo not found', 404));
      return;
    }

    // Prepare update data
    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status === 'inactive' ? 'inactive' : 'active';
    }

    if (order !== undefined) {
      updateData.order = parseInt(order as string, 10);
    }

    // If there's a new image file
    const imageFile = req.file;
    if (imageFile) {
      updateData.image = imageFile.path;
      // Delete old image from cloudinary
      if (logo.image) {
        const publicId = logo.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(`restaurant-logos/${publicId}`);
          } catch (cloudinaryError) {
            // Log error but don't fail the request
            console.error('Error deleting old logo from cloudinary:', cloudinaryError);
          }
        }
      }
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = logoUpdateValidation.parse(updateData);

      // Update the logo
      const updatedLogo = await Logo.findByIdAndUpdate(
        logoId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: 'Logo updated successfully',
        data: updatedLogo,
      });
      return;
    }

    // If no updates provided
    res.json({
      success: true,
      statusCode: 200,
      message: 'No changes to update',
      data: logo,
    });
    return;
  } catch (error) {
    // If error occurs and image was uploaded, delete it
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`restaurant-logos/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting file from cloudinary:', cloudinaryError);
        }
      }
    }
    next(error);
  }
};

export const deleteLogoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logo = await Logo.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!logo) {
      next(new appError('Logo not found', 404));
      return;
    }

    // Soft delete
    logo.isDeleted = true;
    await logo.save();

    // Optionally delete from cloudinary
    if (logo.image) {
      const publicId = logo.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`restaurant-logos/${publicId}`);
        } catch (cloudinaryError) {
          // Log error but don't fail the request
          console.error('Error deleting logo from cloudinary:', cloudinaryError);
        }
      }
    }

    res.json({
      success: true,
      statusCode: 200,
      message: 'Logo deleted successfully',
      data: logo,
    });
    return;
  } catch (error) {
    next(error);
  }
};

