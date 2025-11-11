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
exports.Expense = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const expenseSchema = new mongoose_1.Schema({
    invoiceId: { type: String, required: true, trim: true },
    invoiceDate: { type: Date, required: true },
    expenseType: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExpenseType', required: true },
    description: { type: String, trim: true },
    supplier: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    paymentMethod: { type: String, required: true, trim: true },
    paymentReferenceNo: { type: String, trim: true },
    baseAmount: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    vatPercent: { type: Number, default: 5 },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ApprovedBy', required: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
expenseSchema.index({ invoiceId: 1 });
expenseSchema.index({ invoiceDate: 1 });
expenseSchema.index({ paymentMethod: 1 });
exports.Expense = mongoose_1.default.model('Expense', expenseSchema);
