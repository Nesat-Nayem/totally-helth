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
    moreOptions: {
        type: [
            new mongoose_1.Schema({
                name: { type: String, required: true, trim: true },
            }, { _id: false }),
        ],
        default: [],
    },
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
                // comment field is optional
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
    basePriceWithoutVAT: { type: Number, min: 0 },
    totalWithVAT: { type: Number, min: 0 },
    discountType: { type: String, enum: ['flat', 'percent'] },
    discountAmount: { type: Number, min: 0 },
    shippingCharge: { type: Number, min: 0 },
    rounding: { type: Number, default: 0 },
    payableAmount: { type: Number, min: 0 },
    receiveAmount: { type: Number, min: 0 },
    cumulativePaid: { type: Number, min: 0, default: 0 },
    changeAmount: { type: Number, min: 0 },
    dueAmount: { type: Number, min: 0 },
    note: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    paymentMode: { type: String, trim: true },
    orderType: { type: String, enum: ['DineIn', 'TakeAway', 'Delivery', 'restaurant', 'online', 'membership', 'NewMembership', 'MembershipMeal'] },
    salesType: { type: String, enum: ['restaurant', 'online', 'membership'] },
    payments: {
        type: [
            new mongoose_1.Schema({
                type: { type: String, enum: ['Cash', 'Card', 'Gateway', 'Online Transfer', 'Payment Link'], trim: true },
                methodType: { type: String, enum: ['direct', 'split'], default: 'direct', trim: true },
                amount: { type: Number, min: 0 },
            }, { _id: false }),
        ],
        default: [],
    },
    membership: {
        hold: { type: Boolean, default: false },
        holdRanges: {
            type: [
                new mongoose_1.Schema({
                    from: { type: String, trim: true }, // YYYY-MM-DD
                    to: { type: String, trim: true },
                }, { _id: false }),
            ],
            default: [],
        },
    },
    branchId: { type: String, trim: true },
    brand: { type: String, trim: true },
    aggregatorId: { type: String, trim: true },
    paymentMethodId: { type: String, trim: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'paid' },
    canceled: { type: Boolean, default: false },
    cancelReason: { type: String, trim: true },
    canceledAt: { type: Date },
    dayCloseId: { type: String, trim: true },
    dayCloseDate: { type: String, trim: true },
    dayCloseStart: { type: Date },
    dayCloseEnd: { type: Date },
    isDeleted: { type: Boolean, default: false },
    paymentHistory: {
        type: new mongoose_1.Schema({
            totalPaid: { type: Number, min: 0, default: 0 },
            changeSequence: {
                type: [{
                        from: [{ type: String, trim: true }], // Previous modes
                        to: [{ type: String, trim: true }], // New modes
                        timestamp: { type: Date, default: Date.now }
                    }],
                default: []
            },
            entries: [
                new mongoose_1.Schema({
                    timestamp: { type: Date, default: Date.now },
                    action: { type: String, trim: true },
                    total: { type: Number, min: 0 },
                    paid: { type: Number, min: 0 },
                    remaining: { type: Number, min: 0 },
                    payments: [
                        {
                            type: { type: String, trim: true },
                            methodType: { type: String, trim: true },
                            amount: { type: Number, min: 0 }
                        }
                    ],
                    description: { type: String, trim: true },
                }, { _id: false }),
            ],
        }, { _id: false }),
        default: { totalPaid: 0, entries: [] },
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            var _a, _b;
            const r = ret;
            if (r.createdAt) {
                r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
            if (r.updatedAt) {
                r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
            // add computed membership stats
            try {
                if (r.salesType === 'membership' && r.startDate && r.endDate) {
                    const toDateOnly = (d) => {
                        const dt = new Date(d);
                        const y = dt.getFullYear();
                        const m = dt.getMonth();
                        const day = dt.getDate();
                        return new Date(y, m, day);
                    };
                    const dayDiffInclusive = (a, b) => {
                        const msPerDay = 24 * 60 * 60 * 1000;
                        return Math.max(0, Math.floor((toDateOnly(b).getTime() - toDateOnly(a).getTime()) / msPerDay) + 1);
                    };
                    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
                    const start = toDateOnly(r.startDate);
                    const end = toDateOnly(r.endDate);
                    const today = toDateOnly(new Date());
                    const upto = today < end ? today : end;
                    const totalMeals = dayDiffInclusive(start, end);
                    const activeDaysSoFar = dayDiffInclusive(start, upto);
                    // compute hold days within the [start, upto] interval
                    let holdDays = 0;
                    const ranges = (((_a = r.membership) === null || _a === void 0 ? void 0 : _a.holdRanges) || []);
                    for (const rng of ranges) {
                        const from = toDateOnly(rng.from);
                        const to = rng.to ? toDateOnly(rng.to) : toDateOnly(new Date());
                        // overlap with [start, upto]
                        const overlapStart = from > start ? from : start;
                        const overlapEnd = to < upto ? to : upto;
                        if (overlapEnd >= overlapStart) {
                            holdDays += dayDiffInclusive(overlapStart, overlapEnd);
                        }
                    }
                    let consumed = clamp(activeDaysSoFar - holdDays, 0, totalMeals);
                    // if currently on hold, do not count today as consumed if hold started today
                    r.membershipStats = {
                        totalMeals,
                        consumedMeals: consumed,
                        pendingMeals: clamp(totalMeals - consumed, 0, totalMeals),
                        isOnHold: !!((_b = r.membership) === null || _b === void 0 ? void 0 : _b.hold),
                    };
                }
            }
            catch (e) {
                // ignore compute errors
            }
        },
    },
});
OrderSchema.index({ invoiceNo: 'text', orderNo: 'text', 'customer.name': 'text' });
OrderSchema.index({ date: 1, status: 1, branchId: 1, brand: 1 });
exports.Order = mongoose_1.default.model('Order', OrderSchema);
