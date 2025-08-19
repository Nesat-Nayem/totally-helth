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
exports.deleteGoalById = exports.updateGoalById = exports.getGoalById = exports.getAllGoals = exports.createGoal = void 0;
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
const createGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { title, subtitle, metaTitle, metaDescription, metaKeywords, status, order } = req.body;
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
            order: order ? parseInt(order, 10) : 0,
        };
        const validated = goal_validation_1.goalCreateValidation.parse(payload);
        const goal = new goal_model_1.Goal(validated);
        yield goal.save();
        res.status(201).json({ success: true, statusCode: 201, message: 'Goal created successfully', data: goal });
        return;
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
exports.createGoal = createGoal;
const getAllGoals = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive')
            filter.status = status;
        const goals = yield goal_model_1.Goal.find(filter).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, statusCode: 200, message: 'Goals retrieved successfully', data: goals });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllGoals = getAllGoals;
const getGoalById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = yield goal_model_1.Goal.findOne({ _id: req.params.id, isDeleted: false });
        if (!goal) {
            next(new appError_1.appError('Goal not found', 404));
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'Goal retrieved successfully', data: goal });
    }
    catch (error) {
        next(error);
    }
});
exports.getGoalById = getGoalById;
const updateGoalById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const id = req.params.id;
        const goal = yield goal_model_1.Goal.findOne({ _id: id, isDeleted: false });
        if (!goal) {
            next(new appError_1.appError('Goal not found', 404));
            return;
        }
        const updateData = {};
        const { title, subtitle, metaTitle, metaDescription, metaKeywords, status, order } = req.body;
        if (title !== undefined)
            updateData.title = title;
        if (subtitle !== undefined)
            updateData.subtitle = subtitle;
        if (metaTitle !== undefined)
            updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined)
            updateData.metaDescription = metaDescription;
        if (metaKeywords !== undefined)
            updateData.metaKeywords = metaKeywords;
        if (status !== undefined)
            updateData.status = status === 'inactive' ? 'inactive' : 'active';
        if (order !== undefined)
            updateData.order = parseInt(order, 10);
        // Handle section updates; if any section parts provided, rebuild sections array
        const maybeSections = buildSectionsFromRequest(req);
        if (maybeSections.length > 0) {
            // Cleanup old icons if they are being replaced and new icons are provided
            for (const s of maybeSections) {
                // no safe way to detect which icon replaced which; skip deletion here
            }
            updateData.sections = maybeSections;
        }
        if (Object.keys(updateData).length === 0) {
            res.json({ success: true, statusCode: 200, message: 'No changes to update', data: goal });
            return;
        }
        const validated = goal_validation_1.goalUpdateValidation.parse(updateData);
        const updated = yield goal_model_1.Goal.findByIdAndUpdate(id, validated, { new: true });
        res.json({ success: true, statusCode: 200, message: 'Goal updated successfully', data: updated });
    }
    catch (error) {
        // cleanup newly uploaded icons on error
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
exports.updateGoalById = updateGoalById;
const deleteGoalById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = yield goal_model_1.Goal.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!goal) {
            next(new appError_1.appError('Goal not found', 404));
            return;
        }
        res.json({ success: true, statusCode: 200, message: 'Goal deleted successfully', data: goal });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteGoalById = deleteGoalById;
