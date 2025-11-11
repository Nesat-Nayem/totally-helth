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
exports.deleteIncludedById = exports.updateIncludedById = exports.getIncludedById = exports.getAllIncluded = exports.createIncluded = void 0;
const included_model_1 = require("./included.model");
const included_validation_1 = require("./included.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createIncluded = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { meal_type, title, nutrition, allergens, status, order } = req.body;
        // upload.single('file') puts the file in req.file, not req.files
        const imageFile = req.file;
        if (!imageFile) {
            next(new appError_1.appError('Meal image (file) is required', 400));
            return;
        }
        // Parse nutrition if it's a string
        let nutritionData;
        if (typeof nutrition === 'string') {
            try {
                nutritionData = JSON.parse(nutrition);
            }
            catch (_c) {
                next(new appError_1.appError('Invalid nutrition format', 400));
                return;
            }
        }
        else {
            nutritionData = nutrition;
        }
        // Parse allergens if it's a string
        let allergensArray = [];
        if (typeof allergens === 'string') {
            try {
                allergensArray = JSON.parse(allergens);
            }
            catch (_d) {
                // If not JSON, try comma-separated
                allergensArray = allergens.split(',').map((a) => a.trim()).filter(Boolean);
            }
        }
        else if (Array.isArray(allergens)) {
            allergensArray = allergens;
        }
        const payload = {
            meal_type,
            title,
            image_url: imageFile.path,
            nutrition: nutritionData,
            allergens: allergensArray,
            status: status === 'inactive' ? 'inactive' : 'active',
            order: order ? parseInt(order, 10) : 0,
        };
        const validatedData = included_validation_1.includedValidation.parse(payload);
        const included = new included_model_1.Included(validatedData);
        yield included.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Included meal created successfully',
            data: included,
        });
        return;
    }
    catch (error) {
        // Clean up uploaded file if error occurs
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-included/${publicId}`);
        }
        next(error);
    }
});
exports.createIncluded = createIncluded;
const getAllIncluded = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, meal_type } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive') {
            filter.status = status;
        }
        if (meal_type === 'BREAKFAST' || meal_type === 'LUNCH' || meal_type === 'DINNER' || meal_type === 'SNACKS') {
            filter.meal_type = meal_type;
        }
        const included = yield included_model_1.Included.find(filter)
            .sort({ createdAt: -1, order: 1 })
            .lean();
        if (included.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: 'No included meals found',
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Included meals retrieved successfully',
            data: included,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllIncluded = getAllIncluded;
const getIncludedById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const included = yield included_model_1.Included.findOne({
            _id: req.params.id,
            isDeleted: false,
        });
        if (!included) {
            return next(new appError_1.appError('Included meal not found', 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Included meal retrieved successfully',
            data: included,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getIncludedById = getIncludedById;
const updateIncludedById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const includedId = req.params.id;
        const { meal_type, title, nutrition, allergens, status, order } = req.body;
        const included = yield included_model_1.Included.findOne({
            _id: includedId,
            isDeleted: false,
        });
        if (!included) {
            next(new appError_1.appError('Included meal not found', 404));
            return;
        }
        const updateData = {};
        if (meal_type !== undefined) {
            updateData.meal_type = meal_type;
        }
        if (title !== undefined) {
            updateData.title = title;
        }
        if (nutrition !== undefined) {
            let nutritionData;
            if (typeof nutrition === 'string') {
                try {
                    nutritionData = JSON.parse(nutrition);
                }
                catch (_d) {
                    next(new appError_1.appError('Invalid nutrition format', 400));
                    return;
                }
            }
            else {
                nutritionData = nutrition;
            }
            updateData.nutrition = nutritionData;
        }
        if (allergens !== undefined) {
            let allergensArray = [];
            if (typeof allergens === 'string') {
                try {
                    allergensArray = JSON.parse(allergens);
                }
                catch (_e) {
                    allergensArray = allergens.split(',').map((a) => a.trim()).filter(Boolean);
                }
            }
            else if (Array.isArray(allergens)) {
                allergensArray = allergens;
            }
            updateData.allergens = allergensArray;
        }
        if (status !== undefined) {
            updateData.status = status === 'inactive' ? 'inactive' : 'active';
        }
        if (order !== undefined) {
            updateData.order = parseInt(order, 10);
        }
        // upload.single('file') puts the file in req.file, not req.files
        const imageFile = req.file;
        if (imageFile) {
            updateData.image_url = imageFile.path;
            if (included.image_url) {
                const publicId = (_a = included.image_url.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-included/${publicId}`);
            }
        }
        if (Object.keys(updateData).length > 0) {
            const validatedData = included_validation_1.includedUpdateValidation.parse(updateData);
            const updatedIncluded = yield included_model_1.Included.findByIdAndUpdate(includedId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: 'Included meal updated successfully',
                data: updatedIncluded,
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'No changes to update',
            data: included,
        });
        return;
    }
    catch (error) {
        // Clean up uploaded file if error occurs
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-included/${publicId}`);
        }
        next(error);
    }
});
exports.updateIncludedById = updateIncludedById;
const deleteIncludedById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const included = yield included_model_1.Included.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!included) {
            next(new appError_1.appError('Included meal not found', 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Included meal deleted successfully',
            data: included,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteIncludedById = deleteIncludedById;
