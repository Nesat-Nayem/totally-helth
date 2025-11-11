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
exports.getWhyChooseById = exports.getWhyChoose = exports.upsertWhyChoose = void 0;
const whyChoose_model_1 = require("./whyChoose.model");
const whyChoose_validation_1 = require("./whyChoose.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
/**
 * Upsert why choose data
 * Creates a new record if none exists, otherwise updates the existing record
 */
const upsertWhyChoose = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    try {
        const files = req.files;
        const getFilePath = (name) => { var _a, _b; return (_b = (_a = files === null || files === void 0 ? void 0 : files[name]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path; };
        const { title, subTitle, card1Icon, card1Title, card1Items, card2Icon, card2Title, card2Items, card3Icon, card3Title, card3Items, status, } = req.body;
        // Helper function to parse items array (can be JSON string, comma-separated, or array)
        const parseItems = (items) => {
            if (!items)
                return [];
            if (Array.isArray(items))
                return items.filter(Boolean);
            if (typeof items === 'string') {
                try {
                    const parsed = JSON.parse(items);
                    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
                }
                catch (_a) {
                    // If not JSON, treat as comma-separated
                    return items.split(',').map((item) => item.trim()).filter(Boolean);
                }
            }
            return [];
        };
        // Check if why choose already exists (not deleted)
        const existingWhyChoose = yield whyChoose_model_1.WhyChoose.findOne({ isDeleted: false });
        if (existingWhyChoose) {
            // Update existing why choose - build payload with only provided fields
            const updatePayload = {};
            if (title !== undefined)
                updatePayload.title = title;
            if (subTitle !== undefined)
                updatePayload.subTitle = subTitle;
            if (status !== undefined)
                updatePayload.status = status === 'inactive' ? 'inactive' : 'active';
            // Handle card1 - only update if provided
            if (card1Icon !== undefined || card1Title !== undefined || card1Items !== undefined) {
                const newCard1Icon = getFilePath('card1Icon');
                updatePayload.card1 = {
                    icon: newCard1Icon || (card1Icon !== undefined ? card1Icon : existingWhyChoose.card1.icon),
                    title: card1Title !== undefined ? card1Title : existingWhyChoose.card1.title,
                    items: card1Items !== undefined ? parseItems(card1Items) : existingWhyChoose.card1.items,
                };
                // Cleanup old card1 icon if new one uploaded
                if (newCard1Icon && existingWhyChoose.card1.icon) {
                    try {
                        const publicId = (_a = existingWhyChoose.card1.icon.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                        if (publicId)
                            yield cloudinary_1.cloudinary.uploader.destroy(`why-choose/${publicId}`);
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
            }
            // Handle card2 - only update if provided
            if (card2Icon !== undefined || card2Title !== undefined || card2Items !== undefined) {
                const newCard2Icon = getFilePath('card2Icon');
                updatePayload.card2 = {
                    icon: newCard2Icon || (card2Icon !== undefined ? card2Icon : existingWhyChoose.card2.icon),
                    title: card2Title !== undefined ? card2Title : existingWhyChoose.card2.title,
                    items: card2Items !== undefined ? parseItems(card2Items) : existingWhyChoose.card2.items,
                };
                // Cleanup old card2 icon if new one uploaded
                if (newCard2Icon && existingWhyChoose.card2.icon) {
                    try {
                        const publicId = (_b = existingWhyChoose.card2.icon.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
                        if (publicId)
                            yield cloudinary_1.cloudinary.uploader.destroy(`why-choose/${publicId}`);
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
            }
            // Handle card3 - only update if provided
            if (card3Icon !== undefined || card3Title !== undefined || card3Items !== undefined) {
                const newCard3Icon = getFilePath('card3Icon');
                updatePayload.card3 = {
                    icon: newCard3Icon || (card3Icon !== undefined ? card3Icon : existingWhyChoose.card3.icon),
                    title: card3Title !== undefined ? card3Title : existingWhyChoose.card3.title,
                    items: card3Items !== undefined ? parseItems(card3Items) : existingWhyChoose.card3.items,
                };
                // Cleanup old card3 icon if new one uploaded
                if (newCard3Icon && existingWhyChoose.card3.icon) {
                    try {
                        const publicId = (_c = existingWhyChoose.card3.icon.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
                        if (publicId)
                            yield cloudinary_1.cloudinary.uploader.destroy(`why-choose/${publicId}`);
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
            }
            // Validate update payload
            const validated = whyChoose_validation_1.whyChooseUpdateValidation.parse(updatePayload);
            const updated = yield whyChoose_model_1.WhyChoose.findByIdAndUpdate(existingWhyChoose._id, validated, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: 'Why choose updated successfully',
                data: updated,
            });
            return;
        }
        else {
            // Create new why choose - all fields required
            const card1Icon = getFilePath('card1Icon') || req.body.card1Icon;
            const card2Icon = getFilePath('card2Icon') || req.body.card2Icon;
            const card3Icon = getFilePath('card3Icon') || req.body.card3Icon;
            // Build cards
            const card1 = {
                icon: card1Icon,
                title: card1Title || ((_d = req.body.card1) === null || _d === void 0 ? void 0 : _d.title),
                items: parseItems(card1Items || ((_e = req.body.card1) === null || _e === void 0 ? void 0 : _e.items)),
            };
            const card2 = {
                icon: card2Icon,
                title: card2Title || ((_f = req.body.card2) === null || _f === void 0 ? void 0 : _f.title),
                items: parseItems(card2Items || ((_g = req.body.card2) === null || _g === void 0 ? void 0 : _g.items)),
            };
            const card3 = {
                icon: card3Icon,
                title: card3Title || ((_h = req.body.card3) === null || _h === void 0 ? void 0 : _h.title),
                items: parseItems(card3Items || ((_j = req.body.card3) === null || _j === void 0 ? void 0 : _j.items)),
            };
            const payload = {
                title,
                subTitle,
                card1,
                card2,
                card3,
                status: status === 'inactive' ? 'inactive' : 'active',
            };
            // Validate create payload
            const validated = whyChoose_validation_1.whyChooseCreateValidation.parse(payload);
            const whyChoose = new whyChoose_model_1.WhyChoose(validated);
            yield whyChoose.save();
            res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Why choose created successfully',
                data: whyChoose,
            });
            return;
        }
    }
    catch (error) {
        // Cleanup uploaded files on error
        const files = req.files;
        const paths = [
            (_l = (_k = files === null || files === void 0 ? void 0 : files.card1Icon) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.path,
            (_o = (_m = files === null || files === void 0 ? void 0 : files.card2Icon) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.path,
            (_q = (_p = files === null || files === void 0 ? void 0 : files.card3Icon) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.path,
        ].filter(Boolean);
        for (const p of paths) {
            try {
                const publicId = (_r = p.split('/').pop()) === null || _r === void 0 ? void 0 : _r.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`why-choose/${publicId}`);
            }
            catch (err) {
                // Ignore cleanup errors
            }
        }
        next(error);
    }
});
exports.upsertWhyChoose = upsertWhyChoose;
/**
 * Get why choose data
 * Returns the single why choose document (for admin and public)
 */
const getWhyChoose = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive')
            filter.status = status;
        // Get the single why choose document (since we're using upsert pattern)
        const whyChoose = yield whyChoose_model_1.WhyChoose.findOne(filter).sort({ createdAt: -1 });
        if (!whyChoose) {
            res.json({
                success: true,
                statusCode: 200,
                message: 'Why choose not found',
                data: null,
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Why choose retrieved successfully',
            data: whyChoose,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getWhyChoose = getWhyChoose;
/**
 * Get why choose by ID
 * Returns a specific why choose document by ID (for admin)
 */
const getWhyChooseById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const whyChoose = yield whyChoose_model_1.WhyChoose.findOne({ _id: id, isDeleted: false });
        if (!whyChoose) {
            next(new appError_1.appError('Why choose not found', 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Why choose retrieved successfully',
            data: whyChoose,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getWhyChooseById = getWhyChooseById;
