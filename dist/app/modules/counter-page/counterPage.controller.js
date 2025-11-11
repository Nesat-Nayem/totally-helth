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
exports.getCounterPage = exports.upsertCounterPage = void 0;
const counterPage_model_1 = require("./counterPage.model");
const counterPage_validation_1 = require("./counterPage.validation");
/**
 * Upsert counter page data
 * Creates a new record if none exists, otherwise updates the existing record
 */
const upsertCounterPage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { totalReviews, totalMealItems, happyClients, yearsHelpingPeople } = req.body;
        // Convert string inputs to numbers if needed
        const payload = {
            totalReviews: totalReviews ? Number(totalReviews) : 0,
            totalMealItems: totalMealItems ? Number(totalMealItems) : 0,
            happyClients: happyClients ? Number(happyClients) : 0,
            yearsHelpingPeople: yearsHelpingPeople ? Number(yearsHelpingPeople) : 0,
        };
        // Validate the payload
        const validatedData = counterPage_validation_1.counterPageValidation.parse(payload);
        // Use findOneAndUpdate with upsert to create or update in one operation
        const counterPage = yield counterPage_model_1.CounterPage.findOneAndUpdate({}, // Empty filter to find any document (or none)
        validatedData, {
            upsert: true, // Create if doesn't exist
            new: true, // Return the updated document
            setDefaultsOnInsert: true, // Set defaults on insert
        });
        // Check if this was a new document or an update
        const isNew = counterPage.createdAt.getTime() === counterPage.updatedAt.getTime();
        res.status(isNew ? 201 : 200).json({
            success: true,
            statusCode: isNew ? 201 : 200,
            message: isNew
                ? 'Counter page created successfully'
                : 'Counter page updated successfully',
            data: counterPage,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.upsertCounterPage = upsertCounterPage;
/**
 * Get counter page data
 */
const getCounterPage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counterPage = yield counterPage_model_1.CounterPage.findOne();
        if (!counterPage) {
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Counter page data not found',
                data: {
                    totalReviews: 0,
                    totalMealItems: 0,
                    happyClients: 0,
                    yearsHelpingPeople: 0,
                },
            });
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Counter page data retrieved successfully',
            data: counterPage,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCounterPage = getCounterPage;
