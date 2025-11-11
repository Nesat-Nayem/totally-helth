import { Request, Response, NextFunction } from 'express';
import { Video } from './video.model';
import { videoValidation } from './video.validation';

// Upsert video (create or update - only one video record)
export const upsertVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { brandLogo, videoUrl, status } = req.body;

    const payload = {
      brandLogo: brandLogo || undefined,
      videoUrl,
      status: status === 'inactive' ? 'inactive' : 'active',
    };

    const validated = videoValidation.parse(payload);

    // Find existing video (only one video should exist)
    const existingVideo = await Video.findOne({ isDeleted: false });

    let video;
    if (existingVideo) {
      // Update existing video
      video = await Video.findByIdAndUpdate(
        existingVideo._id,
        validated,
        { new: true, runValidators: true }
      );
    } else {
      // Create new video
      video = new Video(validated);
      await video.save();
    }

    res.status(existingVideo ? 200 : 201).json({
      success: true,
      statusCode: existingVideo ? 200 : 201,
      message: existingVideo ? 'Video updated successfully' : 'Video created successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// Get video (returns single video for homepage)
export const getVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const video = await Video.findOne({ isDeleted: false, status: 'active' });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Video retrieved successfully',
      data: video || null,
    });
  } catch (error) {
    next(error);
  }
};
