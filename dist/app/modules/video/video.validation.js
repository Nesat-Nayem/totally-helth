"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoValidation = void 0;
const zod_1 = require("zod");
exports.videoValidation = zod_1.z.object({
    brandLogo: zod_1.z.string().optional().or(zod_1.z.literal('')),
    videoUrl: zod_1.z.string().min(1, 'Video URL is required'),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
