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
exports.getMealPlanWorkById = exports.getMealPlanWork = exports.upsertMealPlanWork = void 0;
const mealPlanWork_model_1 = require("./mealPlanWork.model");
const mealPlanWork_validation_1 = require("./mealPlanWork.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
/**
 * Upsert meal plan work data
 * Creates a new record if none exists, otherwise updates the existing record
 */
const upsertMealPlanWork = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    try {
        const files = req.files;
        const getFilePath = (name) => { var _a, _b; return (_b = (_a = files === null || files === void 0 ? void 0 : files[name]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path; };
        const { title, subtitle, step1Title, step1SubTitle, step2Title, step2SubTitle, step3Title, step3SubTitle, metaTitle, metaTagKeyword, description, status, } = req.body;
        // Check if meal plan work already exists (not deleted)
        const existingMealPlanWork = yield mealPlanWork_model_1.MealPlanWork.findOne({ isDeleted: false });
        if (existingMealPlanWork) {
            // Update existing meal plan work - build payload with only provided fields
            const updatePayload = {};
            if (title !== undefined)
                updatePayload.title = title;
            if (subtitle !== undefined)
                updatePayload.subtitle = subtitle;
            if (metaTitle !== undefined)
                updatePayload.metaTitle = metaTitle;
            if (metaTagKeyword !== undefined)
                updatePayload.metaTagKeyword = metaTagKeyword;
            if (description !== undefined)
                updatePayload.description = description;
            if (status !== undefined)
                updatePayload.status = status === 'inactive' ? 'inactive' : 'active';
            // Handle banner uploads - only update if new file is uploaded
            const newBanner1 = getFilePath('banner1');
            const newBanner2 = getFilePath('banner2');
            if (newBanner1) {
                // Cleanup old banner1
                if (existingMealPlanWork.banner1) {
                    try {
                        const publicId = (_a = existingMealPlanWork.banner1.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                        if (publicId)
                            yield cloudinary_1.cloudinary.uploader.destroy(`meal-plan-work/${publicId}`);
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                updatePayload.banner1 = newBanner1;
            }
            else if (req.body.banner1 !== undefined) {
                updatePayload.banner1 = req.body.banner1;
            }
            if (newBanner2) {
                // Cleanup old banner2
                if (existingMealPlanWork.banner2) {
                    try {
                        const publicId = (_b = existingMealPlanWork.banner2.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
                        if (publicId)
                            yield cloudinary_1.cloudinary.uploader.destroy(`meal-plan-work/${publicId}`);
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                updatePayload.banner2 = newBanner2;
            }
            else if (req.body.banner2 !== undefined) {
                updatePayload.banner2 = req.body.banner2;
            }
            // Handle steps - only update if provided
            if (step1Title !== undefined || step1SubTitle !== undefined) {
                updatePayload.step1 = {
                    title: step1Title !== undefined ? step1Title : existingMealPlanWork.step1.title,
                    subTitle: step1SubTitle !== undefined ? step1SubTitle : existingMealPlanWork.step1.subTitle,
                };
            }
            if (step2Title !== undefined || step2SubTitle !== undefined) {
                updatePayload.step2 = {
                    title: step2Title !== undefined ? step2Title : existingMealPlanWork.step2.title,
                    subTitle: step2SubTitle !== undefined ? step2SubTitle : existingMealPlanWork.step2.subTitle,
                };
            }
            if (step3Title !== undefined || step3SubTitle !== undefined) {
                updatePayload.step3 = {
                    title: step3Title !== undefined ? step3Title : existingMealPlanWork.step3.title,
                    subTitle: step3SubTitle !== undefined ? step3SubTitle : existingMealPlanWork.step3.subTitle,
                };
            }
            // Validate update payload
            const validated = mealPlanWork_validation_1.mealPlanWorkUpdateValidation.parse(updatePayload);
            const updated = yield mealPlanWork_model_1.MealPlanWork.findByIdAndUpdate(existingMealPlanWork._id, validated, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: 'Meal plan work updated successfully',
                data: updated,
            });
            return;
        }
        else {
            // Create new meal plan work - all fields required
            const banner1 = getFilePath('banner1') || req.body.banner1;
            const banner2 = getFilePath('banner2') || req.body.banner2;
            // Build steps
            const step1 = {
                title: step1Title || ((_c = req.body.step1) === null || _c === void 0 ? void 0 : _c.title),
                subTitle: step1SubTitle || ((_d = req.body.step1) === null || _d === void 0 ? void 0 : _d.subTitle),
            };
            const step2 = {
                title: step2Title || ((_e = req.body.step2) === null || _e === void 0 ? void 0 : _e.title),
                subTitle: step2SubTitle || ((_f = req.body.step2) === null || _f === void 0 ? void 0 : _f.subTitle),
            };
            const step3 = {
                title: step3Title || ((_g = req.body.step3) === null || _g === void 0 ? void 0 : _g.title),
                subTitle: step3SubTitle || ((_h = req.body.step3) === null || _h === void 0 ? void 0 : _h.subTitle),
            };
            const payload = {
                title,
                subtitle,
                banner1,
                banner2,
                step1,
                step2,
                step3,
                metaTitle,
                metaTagKeyword,
                description,
                status: status === 'inactive' ? 'inactive' : 'active',
            };
            // Validate create payload
            const validated = mealPlanWork_validation_1.mealPlanWorkCreateValidation.parse(payload);
            const mealPlanWork = new mealPlanWork_model_1.MealPlanWork(validated);
            yield mealPlanWork.save();
            res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Meal plan work created successfully',
                data: mealPlanWork,
            });
            return;
        }
    }
    catch (error) {
        // Cleanup uploaded banners on error
        const files = req.files;
        const paths = [(_k = (_j = files === null || files === void 0 ? void 0 : files.banner1) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.path, (_m = (_l = files === null || files === void 0 ? void 0 : files.banner2) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.path].filter(Boolean);
        for (const p of paths) {
            try {
                const publicId = (_o = p.split('/').pop()) === null || _o === void 0 ? void 0 : _o.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`meal-plan-work/${publicId}`);
            }
            catch (err) {
                // Ignore cleanup errors
            }
        }
        next(error);
    }
});
exports.upsertMealPlanWork = upsertMealPlanWork;
/**
 * Get meal plan work data
 * Returns the single meal plan work document (for admin and public)
 */
const getMealPlanWork = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive')
            filter.status = status;
        // Get the single meal plan work document (since we're using upsert pattern)
        const mealPlanWork = yield mealPlanWork_model_1.MealPlanWork.findOne(filter).sort({ createdAt: -1 });
        if (!mealPlanWork) {
            res.json({
                success: true,
                statusCode: 200,
                message: 'Meal plan work not found',
                data: null,
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Meal plan work retrieved successfully',
            data: mealPlanWork,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMealPlanWork = getMealPlanWork;
/**
 * Get meal plan work by ID
 * Returns a specific meal plan work document by ID (for admin)
 */
const getMealPlanWorkById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const mealPlanWork = yield mealPlanWork_model_1.MealPlanWork.findOne({ _id: id, isDeleted: false });
        if (!mealPlanWork) {
            next(new appError_1.appError('Meal plan work not found', 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Meal plan work retrieved successfully',
            data: mealPlanWork,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMealPlanWorkById = getMealPlanWorkById;
