"use strict";
/**
 * Unified Sales Service
 *
 * Single, simple function to handle all sales calculations
 *
 * @author API Team
 * @version 1.0.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSales = void 0;
const order_model_1 = require("../order/order.model");
/**
 * Calculates sales data for a shift with time-based matching
 * @param startTime - Shift start time
 * @param endTime - Shift end time
 * @param branchId - Branch ID to filter orders (optional)
 * @returns Promise<IShiftSales> - Calculated sales data
 */
const calculateSales = (startTime, endTime, branchId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find orders created OR updated during the shift time period
        const query = {
            $or: [
                {
                    createdAt: {
                        $gte: startTime,
                        $lte: endTime
                    }
                },
                {
                    updatedAt: {
                        $gte: startTime,
                        $lte: endTime
                    }
                }
            ],
            status: 'paid', // Only paid orders
            canceled: { $ne: true }, // Exclude canceled
            isDeleted: { $ne: true } // Exclude deleted
        };
        if (branchId) {
            query.branchId = branchId;
        }
        const orders = yield order_model_1.Order.find(query).lean();
        // Initialize sales data
        const sales = {
            totalOrders: orders.length,
            totalSales: 0,
            totalDiscount: 0,
            totalVat: 0,
            payments: {
                cash: 0,
                card: 0,
                online: 0,
            },
            salesByType: {
                restaurant: 0,
                online: 0,
                membership: 0,
            },
        };
        // Process each order
        orders.forEach(order => {
            let orderTotal = 0;
            const discountAmount = order.discountAmount || 0;
            const vatAmount = order.vatAmount || 0;
            // Process payment breakdown and calculate order total
            if (order.payments && order.payments.length > 0) {
                order.payments.forEach(payment => {
                    var _a;
                    const paymentAmount = payment.amount || 0;
                    orderTotal += paymentAmount; // Add to order total
                    switch ((_a = payment.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) {
                        case 'cash':
                            sales.payments.cash += paymentAmount;
                            break;
                        case 'card':
                            sales.payments.card += paymentAmount;
                            break;
                        default:
                            sales.payments.online += paymentAmount; // UPI, Gateway, etc.
                            break;
                    }
                });
            }
            else {
                // No payment breakdown = use payableAmount or total
                orderTotal = order.payableAmount || order.total || 0;
                sales.payments.cash += orderTotal;
            }
            // Use the calculated order total for totalSales
            sales.totalSales += orderTotal;
            // Add discount and VAT amounts
            sales.totalDiscount += discountAmount;
            sales.totalVat += vatAmount;
            // Categorize by sales type
            if (order.salesType === 'restaurant') {
                sales.salesByType.restaurant += orderTotal;
            }
            else if (order.salesType === 'online') {
                sales.salesByType.online += orderTotal;
            }
            else if (order.salesType === 'membership') {
                sales.salesByType.membership += orderTotal;
            }
            else {
                // Fallback to restaurant for unknown sales types
                sales.salesByType.restaurant += orderTotal;
            }
        });
        return sales;
    }
    catch (error) {
        console.error('❌ Error calculating sales:', error);
        return {
            totalOrders: 0,
            totalSales: 0,
            totalDiscount: 0,
            totalVat: 0,
            payments: { cash: 0, card: 0, online: 0 },
            salesByType: { restaurant: 0, online: 0, membership: 0 },
        };
    }
});
exports.calculateSales = calculateSales;
