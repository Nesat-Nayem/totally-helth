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
exports.AboutUs = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AboutUsSchema = new mongoose_1.Schema({
    // General Information
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    banner: { type: String, trim: true },
    infoTitle1: { type: String, trim: true },
    infoSubTitle1: { type: String, trim: true },
    infoTitle2: { type: String, trim: true },
    infoSubTitle2: { type: String, trim: true },
    description: { type: String, trim: true },
    // Founder Information
    founderTitle: { type: String, trim: true },
    founderImage: { type: String, trim: true },
    founderName: { type: String, trim: true },
    founderDesignation: { type: String, trim: true },
    founderDescription: { type: String, trim: true },
    // About Information
    aboutTitle: { type: String, trim: true },
    aboutSubTitle: { type: String, trim: true },
    isoCertificate: { type: String, trim: true },
    aboutBanner1: { type: String, trim: true },
    aboutBanner2: { type: String, trim: true },
    aboutBanner3: { type: String, trim: true },
    aboutDescription: { type: String, trim: true },
    // Meta Options
    metaTitle: { type: String, trim: true },
    metaKeywords: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            if (ret.createdAt)
                ret.createdAt = new Date(ret.createdAt).toISOString();
            if (ret.updatedAt)
                ret.updatedAt = new Date(ret.updatedAt).toISOString();
        },
    },
});
exports.AboutUs = mongoose_1.default.model('AboutUs', AboutUsSchema);
