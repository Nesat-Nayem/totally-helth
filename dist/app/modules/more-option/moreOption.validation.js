"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moreOptionUpdateValidation = exports.moreOptionCreateValidation = void 0;
const zod_1 = require("zod");
exports.moreOptionCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1),
    price: zod_1.z.number().min(0),
    category: zod_1.z.enum(['more', 'less', 'without', 'general']).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.moreOptionUpdateValidation = exports.moreOptionCreateValidation.partial();
