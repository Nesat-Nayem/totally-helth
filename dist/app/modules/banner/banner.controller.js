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
exports.deleteBannerById = exports.updateBannerById = exports.getBannerById = exports.getAllBanners = exports.createBanner = void 0;
const banner_model_1 = require("./banner.model");
const banner_validation_1 = require("./banner.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { title, stock, description, meta, description2, metaTag, status, order, } = req.body;
        const files = req.files;
        const imageFile = (_a = files === null || files === void 0 ? void 0 : files.file) === null || _a === void 0 ? void 0 : _a[0];
        const certLogoFile = (_b = files === null || files === void 0 ? void 0 : files.tag) === null || _b === void 0 ? void 0 : _b[0];
        if (!imageFile) {
            next(new appError_1.appError("Banner image (file) is required", 400));
            return;
        }
        if (!certLogoFile) {
            next(new appError_1.appError("Certification logo (tag) is required", 400));
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
            googleReviewCount: stock ? parseInt(stock, 10) : 0,
            status: status === 'inactive' ? 'inactive' : 'active',
            order: order ? parseInt(order, 10) : 0,
        };
        const validatedData = banner_validation_1.bannerValidation.parse(payload);
        const banner = new banner_model_1.Banner(validatedData);
        yield banner.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Banner created successfully",
            data: banner,
        });
        return;
    }
    catch (error) {
        const files = req.files;
        const uploadedPaths = [(_d = (_c = files === null || files === void 0 ? void 0 : files.file) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path, (_f = (_e = files === null || files === void 0 ? void 0 : files.tag) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path].filter(Boolean);
        for (const p of uploadedPaths) {
            const publicId = (_g = p.split('/').pop()) === null || _g === void 0 ? void 0 : _g.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
        }
        next(error);
    }
});
exports.createBanner = createBanner;
const getAllBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Optional status filter (?status=active|inactive)
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive') {
            filter.status = status;
        }
        const banners = yield banner_model_1.Banner.find(filter).sort({ order: 1, createdAt: -1 });
        if (banners.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No banners found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Banners retrieved successfully",
            data: banners,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllBanners = getAllBanners;
const getBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banner = yield banner_model_1.Banner.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!banner) {
            return next(new appError_1.appError("Banner not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Banner retrieved successfully",
            data: banner,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getBannerById = getBannerById;
const updateBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const bannerId = req.params.id;
        const { title, status, order, stock, description, meta, description2, metaTag } = req.body;
        // Find the banner to update
        const banner = yield banner_model_1.Banner.findOne({
            _id: bannerId,
            isDeleted: false
        });
        if (!banner) {
            next(new appError_1.appError("Banner not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
        if (title !== undefined) {
            updateData.title = title;
        }
        if (status !== undefined) {
            updateData.status = status === 'inactive' ? 'inactive' : 'active';
        }
        if (order !== undefined) {
            updateData.order = parseInt(order, 10);
        }
        if (stock !== undefined) {
            updateData.googleReviewCount = parseInt(stock, 10);
        }
        if (description !== undefined)
            updateData.description = description;
        if (meta !== undefined)
            updateData.metaTitle = meta;
        if (description2 !== undefined)
            updateData.metaDescription = description2;
        if (metaTag !== undefined)
            updateData.metaKeywords = metaTag;
        // If there's a new image
        const files = req.files;
        const imageFile = (_a = files === null || files === void 0 ? void 0 : files.file) === null || _a === void 0 ? void 0 : _a[0];
        const certLogoFile = (_b = files === null || files === void 0 ? void 0 : files.tag) === null || _b === void 0 ? void 0 : _b[0];
        if (imageFile) {
            updateData.image = imageFile.path;
            if (banner.image) {
                const publicId = (_c = banner.image.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
            }
        }
        if (certLogoFile) {
            updateData.certLogo = certLogoFile.path;
            if (banner.certLogo) {
                const publicId = (_d = banner.certLogo.split('/').pop()) === null || _d === void 0 ? void 0 : _d.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
            }
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = banner_validation_1.bannerUpdateValidation.parse(updateData);
            // Update the banner
            const updatedBanner = yield banner_model_1.Banner.findByIdAndUpdate(bannerId, validatedData, { new: true });
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
    }
    catch (error) {
        // If error occurs and image was uploaded, delete it
        const files = req.files;
        const uploadedPaths = [(_f = (_e = files === null || files === void 0 ? void 0 : files.file) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path, (_h = (_g = files === null || files === void 0 ? void 0 : files.tag) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.path].filter(Boolean);
        for (const p of uploadedPaths) {
            const publicId = (_j = p.split('/').pop()) === null || _j === void 0 ? void 0 : _j.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
        }
        next(error);
    }
});
exports.updateBannerById = updateBannerById;
const deleteBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banner = yield banner_model_1.Banner.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!banner) {
            next(new appError_1.appError("Banner not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Banner deleted successfully",
            data: banner,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBannerById = deleteBannerById;
