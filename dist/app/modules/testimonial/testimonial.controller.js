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
exports.getActiveTestimonials = exports.deleteTestimonial = exports.updateTestimonial = exports.getTestimonialById = exports.getAllTestimonials = exports.createTestimonial = void 0;
const testimonial_model_1 = require("./testimonial.model");
const testimonial_validation_1 = require("./testimonial.validation");
const appError_1 = require("../../errors/appError");
// Create testimonial
const createTestimonial = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quote, authorName, authorProfession, order, status } = req.body;
        const payload = {
            quote,
            authorName,
            authorProfession,
            order: order ? parseInt(order) : 0,
            status: status === 'inactive' ? 'inactive' : 'active',
        };
        const validated = testimonial_validation_1.testimonialCreateValidation.parse(payload);
        const testimonial = new testimonial_model_1.Testimonial(validated);
        yield testimonial.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Testimonial created successfully',
            data: testimonial,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createTestimonial = createTestimonial;
// Get all testimonials (admin)
const getAllTestimonials = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status === 'active' || status === 'inactive')
            filter.status = status;
        const testimonials = yield testimonial_model_1.Testimonial.find(filter).sort({ order: 1, createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: 'Testimonials retrieved successfully',
            data: testimonials,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTestimonials = getAllTestimonials;
// Get single testimonial by ID (admin)
const getTestimonialById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const testimonial = yield testimonial_model_1.Testimonial.findOne({ _id: id, isDeleted: false });
        if (!testimonial) {
            next(new appError_1.appError('Testimonial not found', 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Testimonial retrieved successfully',
            data: testimonial,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTestimonialById = getTestimonialById;
// Update testimonial
const updateTestimonial = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { quote, authorName, authorProfession, order, status } = req.body;
        const testimonial = yield testimonial_model_1.Testimonial.findOne({ _id: id, isDeleted: false });
        if (!testimonial) {
            next(new appError_1.appError('Testimonial not found', 404));
            return;
        }
        const payload = {};
        if (quote !== undefined)
            payload.quote = quote;
        if (authorName !== undefined)
            payload.authorName = authorName;
        if (authorProfession !== undefined)
            payload.authorProfession = authorProfession;
        if (order !== undefined)
            payload.order = parseInt(order);
        if (status !== undefined)
            payload.status = status === 'inactive' ? 'inactive' : 'active';
        const validated = testimonial_validation_1.testimonialUpdateValidation.parse(payload);
        const updated = yield testimonial_model_1.Testimonial.findByIdAndUpdate(id, validated, { new: true });
        res.json({
            success: true,
            statusCode: 200,
            message: 'Testimonial updated successfully',
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateTestimonial = updateTestimonial;
// Delete testimonial (soft delete)
const deleteTestimonial = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const testimonial = yield testimonial_model_1.Testimonial.findOne({ _id: id, isDeleted: false });
        if (!testimonial) {
            next(new appError_1.appError('Testimonial not found', 404));
            return;
        }
        yield testimonial_model_1.Testimonial.findByIdAndUpdate(id, { isDeleted: true });
        res.json({
            success: true,
            statusCode: 200,
            message: 'Testimonial deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTestimonial = deleteTestimonial;
// Get active testimonials for frontend (sorted by order)
const getActiveTestimonials = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testimonials = yield testimonial_model_1.Testimonial.find({ isDeleted: false, status: 'active' }).sort({ order: 1, createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: 'Testimonials retrieved successfully',
            data: testimonials,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getActiveTestimonials = getActiveTestimonials;
