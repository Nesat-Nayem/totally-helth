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
exports.deleteMealPlanById = exports.updateMealPlanById = exports.getMealPlanById = exports.getAllMealPlans = exports.createMealPlan = void 0;
const mealPlan_model_1 = require("./mealPlan.model");
const mealPlan_validation_1 = require("./mealPlan.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createMealPlan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const body = req.body;
        // files: images[] and optional thumbnail
        const files = req.files;
        const images = ((files === null || files === void 0 ? void 0 : files.images) || []).map((f) => f.path);
        const thumbnail = (_b = (_a = files === null || files === void 0 ? void 0 : files.thumbnail) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
        const payload = {
            title: body.title,
            description: body.description,
            badge: body.badge,
            discount: body.discount,
            price: body.price ? Number(body.price) : undefined,
            delPrice: body.delPrice ? Number(body.delPrice) : undefined,
            category: body.category,
            brand: body.brand,
            kcalList: body.kcalList ? ensureArray(body.kcalList) : undefined,
            deliveredList: body.deliveredList ? ensureArray(body.deliveredList) : undefined,
            suitableList: body.suitableList ? ensureArray(body.suitableList) : undefined,
            daysPerWeek: body.daysPerWeek ? ensureArray(body.daysPerWeek) : undefined,
            weeksOffers: body.weeksOffers ? ensureWeekOffers(body.weeksOffers) : undefined,
            totalMeals: body.totalMeals ? Number(body.totalMeals) : undefined,
            durationDays: body.durationDays ? Number(body.durationDays) : undefined,
            images: images.length ? images : undefined,
            thumbnail: thumbnail,
            status: body.status === 'inactive' ? 'inactive' : 'active',
        };
        const validated = mealPlan_validation_1.mealPlanValidation.parse(payload);
        const doc = new mealPlan_model_1.MealPlan(validated);
        yield doc.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Meal plan created successfully',
            data: doc,
        });
        return;
    }
    catch (error) {
        tryCleanupUploaded(req);
        next(error);
    }
});
exports.createMealPlan = createMealPlan;
const getAllMealPlans = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, q, brand, category, page = '1', limit = '20', fields } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive')
            filter.status = status;
        if (brand)
            filter.brand = brand;
        if (category)
            filter.category = category;
        if (q)
            filter.$text = { $search: q };
        const pageNum = Math.max(1, parseInt(page || '1', 10));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit || '20', 10)));
        const projection = buildProjection(fields);
        const [items, total] = yield Promise.all([
            mealPlan_model_1.MealPlan.find(filter, projection).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
            mealPlan_model_1.MealPlan.countDocuments(filter),
        ]);
        res.json({
            success: true,
            statusCode: 200,
            message: 'Meal plans retrieved successfully',
            data: items,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                hasNext: pageNum * limitNum < total,
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMealPlans = getAllMealPlans;
const getMealPlanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield mealPlan_model_1.MealPlan.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Meal plan not found', 404));
        res.json({
            success: true,
            statusCode: 200,
            message: 'Meal plan retrieved successfully',
            data: doc,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getMealPlanById = getMealPlanById;
const updateMealPlanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = req.params.id;
        const doc = yield mealPlan_model_1.MealPlan.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Meal plan not found', 404));
        const body = req.body;
        const updateData = {};
        if (body.title !== undefined)
            updateData.title = body.title;
        if (body.description !== undefined)
            updateData.description = body.description;
        if (body.badge !== undefined)
            updateData.badge = body.badge;
        if (body.discount !== undefined)
            updateData.discount = body.discount;
        if (body.price !== undefined)
            updateData.price = Number(body.price);
        if (body.delPrice !== undefined)
            updateData.delPrice = Number(body.delPrice);
        if (body.category !== undefined)
            updateData.category = body.category;
        if (body.brand !== undefined)
            updateData.brand = body.brand;
        if (body.kcalList !== undefined)
            updateData.kcalList = ensureArray(body.kcalList);
        if (body.deliveredList !== undefined)
            updateData.deliveredList = ensureArray(body.deliveredList);
        if (body.suitableList !== undefined)
            updateData.suitableList = ensureArray(body.suitableList);
        if (body.daysPerWeek !== undefined)
            updateData.daysPerWeek = ensureArray(body.daysPerWeek);
        if (body.weeksOffers !== undefined)
            updateData.weeksOffers = ensureWeekOffers(body.weeksOffers);
        if (body.status !== undefined)
            updateData.status = body.status === 'inactive' ? 'inactive' : 'active';
        if (body.totalMeals !== undefined)
            updateData.totalMeals = Number(body.totalMeals);
        if (body.durationDays !== undefined)
            updateData.durationDays = Number(body.durationDays);
        const files = req.files;
        const newImages = ((files === null || files === void 0 ? void 0 : files.images) || []).map((f) => f.path);
        const newThumbnail = (_b = (_a = files === null || files === void 0 ? void 0 : files.thumbnail) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
        if (newImages.length) {
            updateData.images = newImages; // replace set for now
            // Optionally cleanup old images
            if (Array.isArray(doc.images)) {
                for (const p of doc.images)
                    yield tryDestroyCloudinary(p);
            }
        }
        if (newThumbnail) {
            updateData.thumbnail = newThumbnail;
            if (doc.thumbnail)
                yield tryDestroyCloudinary(doc.thumbnail);
        }
        if (Object.keys(updateData).length > 0) {
            const validated = mealPlan_validation_1.mealPlanUpdateValidation.parse(updateData);
            const updated = yield mealPlan_model_1.MealPlan.findByIdAndUpdate(id, validated, { new: true });
            res.json({ success: true, statusCode: 200, message: 'Meal plan updated successfully', data: updated });
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
        return;
    }
    catch (error) {
        tryCleanupUploaded(req);
        next(error);
    }
});
exports.updateMealPlanById = updateMealPlanById;
const deleteMealPlanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield mealPlan_model_1.MealPlan.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!doc)
            return next(new appError_1.appError('Meal plan not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Meal plan deleted successfully', data: doc });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteMealPlanById = deleteMealPlanById;
// helpers
function ensureArray(input) {
    if (Array.isArray(input))
        return input.map(String).filter((s) => s === null || s === void 0 ? void 0 : s.length);
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed))
                return parsed.map(String).filter((s) => s === null || s === void 0 ? void 0 : s.length);
        }
        catch (_a) {
            // comma separated fallback
            return input.split(',').map((s) => s.trim()).filter((s) => s.length);
        }
    }
    return [];
}
function ensureWeekOffers(input) {
    if (Array.isArray(input))
        return input;
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed))
                return parsed;
        }
        catch (_a) { }
    }
    return [];
}
function tryDestroyCloudinary(path) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const publicId = (_c = (_b = (_a = path === null || path === void 0 ? void 0 : path.split('/')) === null || _a === void 0 ? void 0 : _a.pop()) === null || _b === void 0 ? void 0 : _b.split('.')) === null || _c === void 0 ? void 0 : _c[0];
        if (publicId) {
            try {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-uploads/${publicId}`);
            }
            catch (_d) {
                // ignore
            }
        }
    });
}
function tryCleanupUploaded(req) {
    var _a, _b;
    const files = req.files;
    const uploadedPaths = [
        ...((files === null || files === void 0 ? void 0 : files.images) || []).map((f) => f.path),
        (_b = (_a = files === null || files === void 0 ? void 0 : files.thumbnail) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path,
    ].filter(Boolean);
    uploadedPaths.forEach((p) => __awaiter(this, void 0, void 0, function* () {
        yield tryDestroyCloudinary(p);
    }));
}
function buildProjection(fields) {
    if (!fields)
        return undefined;
    const proj = {};
    fields
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((f) => (proj[f] = 1));
    // Always include _id
    if (!proj._id)
        proj._id = 1;
    return Object.keys(proj).length ? proj : undefined;
}
