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
exports.getAboutUsById = exports.getAboutUs = exports.upsertAboutUs = void 0;
const aboutUs_model_1 = require("./aboutUs.model");
// Upsert About Us (create or update)
const upsertAboutUs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const files = req.files;
        const data = Object.assign({}, req.body);
        // Handle file uploads
        if ((_a = files === null || files === void 0 ? void 0 : files.banner) === null || _a === void 0 ? void 0 : _a[0])
            data.banner = files.banner[0].path;
        if ((_b = files === null || files === void 0 ? void 0 : files.founderImage) === null || _b === void 0 ? void 0 : _b[0])
            data.founderImage = files.founderImage[0].path;
        if ((_c = files === null || files === void 0 ? void 0 : files.isoCertificate) === null || _c === void 0 ? void 0 : _c[0])
            data.isoCertificate = files.isoCertificate[0].path;
        if ((_d = files === null || files === void 0 ? void 0 : files.aboutBanner1) === null || _d === void 0 ? void 0 : _d[0])
            data.aboutBanner1 = files.aboutBanner1[0].path;
        if ((_e = files === null || files === void 0 ? void 0 : files.aboutBanner2) === null || _e === void 0 ? void 0 : _e[0])
            data.aboutBanner2 = files.aboutBanner2[0].path;
        if ((_f = files === null || files === void 0 ? void 0 : files.aboutBanner3) === null || _f === void 0 ? void 0 : _f[0])
            data.aboutBanner3 = files.aboutBanner3[0].path;
        // Find existing record
        const existing = yield aboutUs_model_1.AboutUs.findOne({ isDeleted: false });
        if (existing) {
            // Update existing
            const updated = yield aboutUs_model_1.AboutUs.findByIdAndUpdate(existing._id, data, { new: true });
            return res.status(200).json({
                success: true,
                message: 'About Us updated successfully',
                data: updated,
            });
        }
        else {
            // Create new
            const created = yield aboutUs_model_1.AboutUs.create(data);
            return res.status(201).json({
                success: true,
                message: 'About Us created successfully',
                data: created,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to save About Us',
        });
    }
});
exports.upsertAboutUs = upsertAboutUs;
// Get About Us
const getAboutUs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const query = { isDeleted: false };
        if (status)
            query.status = status;
        const aboutUs = yield aboutUs_model_1.AboutUs.findOne(query);
        return res.status(200).json({
            success: true,
            message: 'About Us retrieved successfully',
            data: aboutUs,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get About Us',
        });
    }
});
exports.getAboutUs = getAboutUs;
// Get About Us by ID (for admin)
const getAboutUsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const aboutUs = yield aboutUs_model_1.AboutUs.findById(id);
        if (!aboutUs || aboutUs.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'About Us not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'About Us retrieved successfully',
            data: aboutUs,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get About Us',
        });
    }
});
exports.getAboutUsById = getAboutUsById;
