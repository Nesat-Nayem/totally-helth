"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.counterPageUpdateValidation = exports.counterPageValidation = void 0;
const zod_1 = require("zod");
exports.counterPageValidation = zod_1.z.object({
    totalReviews: zod_1.z.number().min(0, 'Total reviews must be a positive number'),
    totalMealItems: zod_1.z.number().min(0, 'Total meal items must be a positive number'),
    happyClients: zod_1.z.number().min(0, 'Happy clients must be a positive number'),
    yearsHelpingPeople: zod_1.z.number().min(0, 'Years helping people must be a positive number'),
});
exports.counterPageUpdateValidation = zod_1.z.object({
    totalReviews: zod_1.z.number().min(0).optional(),
    totalMealItems: zod_1.z.number().min(0).optional(),
    happyClients: zod_1.z.number().min(0).optional(),
    yearsHelpingPeople: zod_1.z.number().min(0).optional(),
});
