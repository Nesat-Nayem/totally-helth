"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GoalSectionSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
    description: { type: String, required: true, trim: true },
}, { _id: false });
const GoalSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    sections: {
        type: [GoalSectionSchema],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0 && arr.length <= 3,
            message: 'sections must contain between 1 and 3 items',
        },
        required: true,
    },
    metaTitle: { type: String, required: true, trim: true },
    metaDescription: { type: String, required: true, trim: true },
    metaKeywords: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            const r = ret;
            if (r.createdAt) {
                r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
            if (r.updatedAt) {
                r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
        },
    },
});
exports.Goal = mongoose_1.default.model('Goal', GoalSchema);
