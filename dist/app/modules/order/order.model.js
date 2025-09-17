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
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    productId: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    orderNo: { type: String, trim: true },
    invoiceNo: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    customer: {
        id: { type: String, trim: true },
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
    },
    items: { type: [OrderItemSchema], required: true },
    extraItems: {
        type: [
            new mongoose_1.Schema({
                name: { type: String, required: true, trim: true },
                price: { type: Number, required: true, min: 0 },
                qty: { type: Number, required: true, min: 1, default: 1 },
            }, { _id: false }),
        ],
        default: [],
    },
    subTotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    vatPercent: { type: Number, min: 0 },
    vatAmount: { type: Number, min: 0 },
    discountType: { type: String, enum: ['flat', 'percent'] },
    discountAmount: { type: Number, min: 0 },
    shippingCharge: { type: Number, min: 0 },
    rounding: { type: Number, default: 0 },
    payableAmount: { type: Number, min: 0 },
    receiveAmount: { type: Number, min: 0 },
    changeAmount: { type: Number, min: 0 },
    dueAmount: { type: Number, min: 0 },
    note: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    paymentMode: { type: String, trim: true },
    branchId: { type: String, trim: true },
    brand: { type: String, trim: true },
    aggregatorId: { type: String, trim: true },
    paymentMethodId: { type: String, trim: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'paid' },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
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
OrderSchema.index({ invoiceNo: 'text', orderNo: 'text', 'customer.name': 'text' });
OrderSchema.index({ date: 1, status: 1, branchId: 1, brand: 1 });
exports.Order = mongoose_1.default.model('Order', OrderSchema);
