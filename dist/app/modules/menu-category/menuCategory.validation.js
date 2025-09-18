"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCategoryUpdateValidation = exports.menuCategoryCreateValidation = void 0;
const zod_1 = require("zod");
exports.menuCategoryCreateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.menuCategoryUpdateValidation = exports.menuCategoryCreateValidation.partial();
