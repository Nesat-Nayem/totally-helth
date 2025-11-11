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
exports.getCompare = exports.upsertCompare = void 0;
const compare_model_1 = require("./compare.model");
const compare_validation_1 = require("./compare.validation");
const cloudinary_1 = require("../../config/cloudinary");
// Upsert function: creates if doesn't exist, updates if exists
const upsertCompare = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const files = req.files;
        const getFilePath = (name) => { var _a, _b; return (_b = (_a = files === null || files === void 0 ? void 0 : files[name]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path; };
        const { title, banner1, banner2, compareItems, status } = req.body;
        // Parse compareItems if it's a string (from form data)
        let parsedCompareItems = [];
        if (compareItems) {
            try {
                parsedCompareItems = typeof compareItems === 'string' ? JSON.parse(compareItems) : compareItems;
            }
            catch (_f) {
                parsedCompareItems = [];
            }
        }
        const payload = {
            title,
            banner1: getFilePath('banner1') || banner1 || undefined,
            banner2: getFilePath('banner2') || banner2 || undefined,
            compareItems: parsedCompareItems.length > 0 ? parsedCompareItems : undefined,
            status: status === 'inactive' ? 'inactive' : 'active',
        };
        // Check if compare already exists (not deleted)
        const existingCompare = yield compare_model_1.Compare.findOne({ isDeleted: false });
        if (existingCompare) {
            // Update existing compare
            const validated = compare_validation_1.compareUpdateValidation.parse(payload);
            const updated = yield compare_model_1.Compare.findByIdAndUpdate(existingCompare._id, validated, { new: true });
            res.json({ success: true, statusCode: 200, message: 'Compare updated successfully', data: updated });
            return;
        }
        else {
            // Create new compare
            const validated = compare_validation_1.compareCreateValidation.parse(payload);
            const compare = new compare_model_1.Compare(validated);
            yield compare.save();
            res.status(201).json({ success: true, statusCode: 201, message: 'Compare created successfully', data: compare });
            return;
        }
    }
    catch (error) {
        // Cleanup uploaded banners on error
        const files = req.files;
        const paths = [(_b = (_a = files === null || files === void 0 ? void 0 : files.banner1) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path, (_d = (_c = files === null || files === void 0 ? void 0 : files.banner2) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path].filter(Boolean);
        for (const p of paths) {
            const publicId = (_e = p.split('/').pop()) === null || _e === void 0 ? void 0 : _e.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-compare/${publicId}`);
        }
        next(error);
    }
});
exports.upsertCompare = upsertCompare;
// Get compare for frontend (returns single active compare)
// Note: banner2 is returned as image1 for client side
const getCompare = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive')
            filter.status = status;
        // Get the first compare (since we're using upsert pattern, there should be one main compare)
        const compare = yield compare_model_1.Compare.findOne(filter).sort({ createdAt: -1 });
        if (!compare) {
            res.json({ success: true, statusCode: 200, message: 'No compare found', data: null });
            return;
        }
        // Transform data: banner2 becomes image1 for client side
        const transformedData = Object.assign(Object.assign({}, compare.toObject()), { image1: compare.banner2, image2: compare.banner1 });
        // Remove banner1 and banner2 from response
        delete transformedData.banner1;
        delete transformedData.banner2;
        res.json({ success: true, statusCode: 200, message: 'Compare retrieved successfully', data: transformedData });
    }
    catch (error) {
        next(error);
    }
});
exports.getCompare = getCompare;
