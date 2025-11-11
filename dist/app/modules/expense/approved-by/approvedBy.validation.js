"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvedByUpdateValidation = exports.approvedByCreateValidation = void 0;
const zod_1 = require("zod");
exports.approvedByCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.approvedByUpdateValidation = exports.approvedByCreateValidation.partial();
