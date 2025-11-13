import { NextFunction, Request, Response } from "express";
import { AboutUsAuthor } from "./about-us-author.model";
import { aboutUsAuthorValidation, aboutUsAuthorUpdateValidation } from "./about-us-author.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

// Create or Update About Us Author (creates if doesn't exist, updates if exists)
export const createOrUpdateAboutUsAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, name, designation, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imageFile = files?.image?.[0];

    // Check if record exists
    let existingAuthor = await AboutUsAuthor.findOne({ isDeleted: false });

    if (existingAuthor) {
      // Update existing record
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (name !== undefined) updateData.name = name;
      if (designation !== undefined) updateData.designation = designation;
      if (description !== undefined) updateData.description = description;

      if (imageFile) {
        updateData.image = imageFile.path;
        // Delete old image
        if (existingAuthor.image) {
          const publicId = existingAuthor.image.split('/').pop()?.split('.')[0];
          if (publicId) await cloudinary.uploader.destroy(`about-us/${publicId}`);
        }
      }

      if (Object.keys(updateData).length > 0) {
        const validatedData = aboutUsAuthorUpdateValidation.parse(updateData);
        const updatedAuthor = await AboutUsAuthor.findByIdAndUpdate(
          existingAuthor._id,
          validatedData,
          { new: true }
        );

        res.json({
          success: true,
          statusCode: 200,
          message: "About Us Author updated successfully",
          data: updatedAuthor,
        });
        return;
      }

      res.json({
        success: true,
        statusCode: 200,
        message: "No changes to update",
        data: existingAuthor,
      });
      return;
    } else {
      // Create new record
      if (!imageFile) {
        next(new appError("Image is required", 400));
        return;
      }

      const payload = {
        title,
        name,
        designation,
        image: imageFile.path,
        description,
      };

      const validatedData = aboutUsAuthorValidation.parse(payload);
      const aboutUsAuthor = new AboutUsAuthor(validatedData);
      await aboutUsAuthor.save();

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: "About Us Author created successfully",
        data: aboutUsAuthor,
      });
      return;
    }
  } catch (error) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const uploadedPaths = [files?.image?.[0]?.path].filter(Boolean) as string[];
    for (const p of uploadedPaths) {
      const publicId = p.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`about-us/${publicId}`);
    }
    next(error);
  }
};

// Get All About Us Authors (Admin)
export const getAllAboutUsAuthors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authors = await AboutUsAuthor.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      statusCode: 200,
      message: "About Us Authors retrieved successfully",
      data: authors,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get Single About Us Author (Frontend)
export const getAboutUsAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const author = await AboutUsAuthor.findOne({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    if (!author) {
      res.json({
        success: true,
        statusCode: 200,
        message: "About Us Author not found",
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "About Us Author retrieved successfully",
      data: author,
    });
    return;
  } catch (error) {
    next(error);
  }
};


