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
exports.getGoal = exports.upsertGoal = void 0;
const goal_model_1 = require("./goal.model");
const goal_validation_1 = require("./goal.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const buildSectionsFromRequest = (req) => {
    const files = req.files;
    const getFilePath = (name) => { var _a, _b; return (_b = (_a = files === null || files === void 0 ? void 0 : files[name]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path; };
    const sectionDefs = [
        {
            title: req.body.section1Title || undefined,
            description: req.body.section1Description || undefined,
            icon: getFilePath('section1Icon') || req.body.section1Icon || undefined,
        },
        {
            title: req.body.section2Title || undefined,
            description: req.body.section2Description || undefined,
            icon: getFilePath('section2Icon') || req.body.section2Icon || undefined,
        },
        {
            title: req.body.section3Title || undefined,
            description: req.body.section3Description || undefined,
            icon: getFilePath('section3Icon') || req.body.section3Icon || undefined,
        },
    ];
    const sections = sectionDefs.filter(s => s.title && s.description && s.icon);
    return sections;
};
// Upsert function: creates if doesn't exist, updates if exists
const upsertGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { title, subtitle, metaTitle, metaDescription, metaKeywords, status } = req.body;
        const sections = buildSectionsFromRequest(req);
        if (sections.length === 0) {
            next(new appError_1.appError('At least one section with title, icon and description is required', 400));
            return;
        }
        const payload = {
            title,
            subtitle,
            sections,
            metaTitle,
            metaDescription,
            metaKeywords,
            status: status === 'inactive' ? 'inactive' : 'active',
        };
        // Check if a goal already exists (not deleted)
        const existingGoal = yield goal_model_1.Goal.findOne({ isDeleted: false });
        if (existingGoal) {
            // Update existing goal
            const validated = goal_validation_1.goalUpdateValidation.parse(payload);
            const updated = yield goal_model_1.Goal.findByIdAndUpdate(existingGoal._id, validated, { new: true });
            res.json({ success: true, statusCode: 200, message: 'Goal updated successfully', data: updated });
            return;
        }
        else {
            // Create new goal
            const validated = goal_validation_1.goalCreateValidation.parse(payload);
            const goal = new goal_model_1.Goal(validated);
            yield goal.save();
            res.status(201).json({ success: true, statusCode: 201, message: 'Goal created successfully', data: goal });
            return;
        }
    }
    catch (error) {
        // Cleanup uploaded icons on error
        const files = req.files;
        const paths = [(_b = (_a = files === null || files === void 0 ? void 0 : files.section1Icon) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path, (_d = (_c = files === null || files === void 0 ? void 0 : files.section2Icon) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path, (_f = (_e = files === null || files === void 0 ? void 0 : files.section3Icon) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path].filter(Boolean);
        for (const p of paths) {
            const publicId = (_g = p.split('/').pop()) === null || _g === void 0 ? void 0 : _g.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-goals/${publicId}`);
        }
        next(error);
    }
});
exports.upsertGoal = upsertGoal;
// Get goal for frontend (returns single active goal or first available)
const getGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive')
            filter.status = status;
        // Get the first active goal (since we're using upsert pattern, there should be one main goal)
        const goal = yield goal_model_1.Goal.findOne(filter).sort({ createdAt: -1 });
        if (!goal) {
            res.json({ success: true, statusCode: 200, message: 'No goal found', data: null });
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'Goal retrieved successfully', data: goal });
    }
    catch (error) {
        next(error);
    }
});
exports.getGoal = getGoal;
