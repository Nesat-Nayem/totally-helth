"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideo = exports.upsertVideo = void 0;
const video_model_1 = require("./video.model");
const video_validation_1 = require("./video.validation");
// Upsert video (create or update - only one video record)
const upsertVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { brandLogo, videoUrl, status } = req.body;
        const payload = {
            brandLogo: brandLogo || undefined,
            videoUrl,
            status: status === 'inactive' ? 'inactive' : 'active',
        };
        const validated = video_validation_1.videoValidation.parse(payload);
        // Find existing video (only one video should exist)
        const existingVideo = yield video_model_1.Video.findOne({ isDeleted: false });
        let video;
        if (existingVideo) {
            // Update existing video
            video = yield video_model_1.Video.findByIdAndUpdate(existingVideo._id, validated, { new: true, runValidators: true });
        }
        else {
            // Create new video
            video = new video_model_1.Video(validated);
            yield video.save();
        }
        res.status(existingVideo ? 200 : 201).json({
            success: true,
            statusCode: existingVideo ? 200 : 201,
            message: existingVideo ? 'Video updated successfully' : 'Video created successfully',
            data: video,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.upsertVideo = upsertVideo;
// Get video (returns single video for homepage)
const getVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.Video.findOne({ isDeleted: false, status: 'active' });
        res.json({
            success: true,
            statusCode: 200,
            message: 'Video retrieved successfully',
            data: video || null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVideo = getVideo;
