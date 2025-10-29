"use strict";
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
exports.createInitialHistoryEntry = exports.updateOrderWithAutoTracking = void 0;
const order_model_1 = require("./order.model");
// Helper function to calculate total paid amount from payments array
const calculatePaidAmount = (order) => {
    // Use cumulativePaid if available, otherwise calculate from payments array
    if (order.cumulativePaid !== undefined) {
        return order.cumulativePaid;
    }
    if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
        return order.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }
    return 0; // No payments made
};
// Helper function to get payment details from payments array
const getPaymentDetails = (order) => {
    if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
        return order.payments.map((payment) => `${payment.amount} ${payment.type}${payment.methodType ? ` (${payment.methodType})` : ''}`).join(', ');
    }
    return 'No payments';
};
// Helper function to get payment breakdown
const getPaymentBreakdown = (order) => {
    if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
        return order.payments;
    }
    return [];
};
// Helper function to get cumulative paid amount from payment history
const getCumulativePaidAmount = (paymentHistory) => {
    if (!paymentHistory || paymentHistory.length === 0)
        return 0;
    // Find the latest payment_received entry
    const latestPaymentEntry = paymentHistory
        .filter(entry => entry.action === 'payment_received')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return latestPaymentEntry ? latestPaymentEntry.newPaid : 0;
};
const updateOrderWithAutoTracking = (orderId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentOrder = yield order_model_1.Order.findById(orderId);
    if (!currentOrder) {
        throw new Error('Order not found');
    }
    // Determine which total field to use based on what's being updated
    let totalField = 'total'; // default
    let previousTotal = currentOrder.total || 0;
    let newTotal = currentOrder.total || 0;
    // If subTotal is being updated, use subTotal
    if (updateData.subTotal !== undefined) {
        totalField = 'subTotal';
        previousTotal = currentOrder.subTotal || 0;
        newTotal = updateData.subTotal;
    }
    // If total is being updated, use total
    else if (updateData.total !== undefined) {
        totalField = 'total';
        previousTotal = currentOrder.total || 0;
        newTotal = updateData.total;
    }
    // If items are being updated, check which total field exists and use it
    else if (updateData.items !== undefined) {
        // Use subTotal if it exists, otherwise use total
        totalField = currentOrder.subTotal !== undefined ? 'subTotal' : 'total';
        previousTotal = currentOrder[totalField] || 0;
        newTotal = currentOrder[totalField] || 0; // Will be recalculated by the system
    }
    // Calculate paid amounts from payments array
    const previousPaid = calculatePaidAmount(currentOrder);
    const newPaid = calculatePaidAmount(Object.assign(Object.assign({}, currentOrder), updateData));
    // Get payment details for history
    const previousPaymentDetails = getPaymentDetails(currentOrder);
    const newPaymentDetails = getPaymentDetails(Object.assign(Object.assign({}, currentOrder), updateData));
    const previousPaymentBreakdown = getPaymentBreakdown(currentOrder);
    const newPaymentBreakdown = getPaymentBreakdown(Object.assign(Object.assign({}, currentOrder), updateData));
    // Calculate the incremental payment amount for this specific transaction
    const incrementalPayment = newPaid - previousPaid;
    const previousRemaining = previousTotal - previousPaid;
    const newRemaining = newTotal - newPaid;
    let action = 'edited';
    if (newTotal > previousTotal)
        action = 'add_item';
    else if (newTotal < previousTotal)
        action = 'remove_item';
    else if (newPaid > previousPaid)
        action = 'payment_received';
    else if (newPaid < previousPaid)
        action = 'payment_received'; // Payment decreased
    else if (JSON.stringify(previousPaymentBreakdown) !== JSON.stringify(newPaymentBreakdown)) {
        action = 'payment_mode_changed'; // Payment mode changed but amount remains same
    }
    const historyEntry = {
        timestamp: new Date(),
        action,
        total: newTotal,
        paid: incrementalPayment, // Show only the incremental payment amount for this transaction
        totalPaid: newPaid, // Show the cumulative total paid amount
        remaining: newRemaining,
        payments: newPaymentBreakdown, // Only current payments
        description: `${action}: ₹${newTotal} - Paid: ₹${incrementalPayment} - Total Paid: ₹${newPaid} - Remaining: ₹${newRemaining}`
    };
    // Create the updated payment history with totalPaid at the top level
    const existingEntries = ((_a = currentOrder.paymentHistory) === null || _a === void 0 ? void 0 : _a.entries) || [];
    const updatedPaymentHistory = {
        totalPaid: newPaid, // Current total paid amount for the entire order
        entries: [...existingEntries, historyEntry]
    };
    return yield order_model_1.Order.findByIdAndUpdate(orderId, Object.assign(Object.assign({}, updateData), { paymentHistory: updatedPaymentHistory }), { new: true });
});
exports.updateOrderWithAutoTracking = updateOrderWithAutoTracking;
// Function to create initial history entry for new orders
const createInitialHistoryEntry = (order) => {
    // Determine which total field to use (prefer subTotal if available)
    const totalField = order.subTotal !== undefined ? 'subTotal' : 'total';
    const total = order[totalField] || 0;
    const paidAmount = calculatePaidAmount(order);
    const remainingAmount = Math.max(0, total - paidAmount);
    const initialHistoryEntry = {
        timestamp: new Date(),
        action: 'order_created',
        total: total,
        paid: paidAmount, // For order creation, this is the initial payment amount
        remaining: remainingAmount,
        payments: getPaymentBreakdown(order), // Track payment breakdown from payments array
        description: `Order created: ₹${total} - Paid: ₹${paidAmount} - Remaining: ₹${remainingAmount}`
    };
    // Return the payment history structure with totalPaid at the top level
    return {
        totalPaid: paidAmount, // Current total paid amount for the entire order
        entries: [initialHistoryEntry]
    };
};
exports.createInitialHistoryEntry = createInitialHistoryEntry;
