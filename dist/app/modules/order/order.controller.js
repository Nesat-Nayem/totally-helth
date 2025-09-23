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
exports.deleteOrderById = exports.updateOrderById = exports.getOrderById = exports.getOrders = exports.unholdMembership = exports.holdMembership = exports.cancelOrder = exports.createOrder = void 0;
const zod_1 = require("zod");
const order_model_1 = require("./order.model");
const order_validation_1 = require("./order.validation");
const counter_model_1 = require("../../services/counter.model");
function dateStamp() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${dd}`;
}
function nextSeq(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = yield counter_model_1.Counter.findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { upsert: true, new: true });
        return doc.seq;
    });
}
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = order_validation_1.orderCreateValidation.parse(req.body);
        // normalize date
        const date = new Date(payload.date);
        // invoice / order number auto-generation if missing
        const stamp = dateStamp();
        let invoiceNo = payload.invoiceNo;
        if (!invoiceNo) {
            const s = yield nextSeq(`INV-${stamp}`);
            invoiceNo = `INV-${stamp}-${String(s).padStart(6, '0')}`;
        }
        const ordSeq = yield nextSeq(`ORD-${stamp}`);
        const orderNo = `ORD-${stamp}-${String(ordSeq).padStart(6, '0')}`;
        // branch from token (if available)
        const reqWithUser = req;
        const branchId = payload.branchId || reqWithUser.branchId;
        const created = yield order_model_1.Order.create(Object.assign(Object.assign({}, payload), { invoiceNo,
            orderNo,
            branchId,
            date }));
        res.status(201).json({ message: 'Order created', data: created });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create order' });
    }
});
exports.createOrder = createOrder;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = req.params.id;
        const reason = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.reason) || '';
        const item = yield order_model_1.Order.findOneAndUpdate({ _id: id, isDeleted: false }, { canceled: true, cancelReason: reason, canceledAt: new Date() }, { new: true });
        if (!item) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json({ message: 'Order canceled', data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to cancel order' });
    }
});
exports.cancelOrder = cancelOrder;
function todayYmd() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}
const holdMembership = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.get('salesType') !== 'membership') {
            res.status(400).json({ message: 'Not a membership order' });
            return;
        }
        const mem = order.get('membership') || {};
        if (mem.hold) {
            res.json({ message: 'Already on hold', data: order });
            return;
        }
        const ranges = Array.isArray(mem.holdRanges) ? mem.holdRanges : [];
        // if last range is open, do nothing, else push new open range starting today
        if (!(ranges.length > 0 && !ranges[ranges.length - 1].to)) {
            ranges.push({ from: todayYmd() });
        }
        mem.hold = true;
        mem.holdRanges = ranges;
        order.set('membership', mem);
        yield order.save();
        res.json({ message: 'Membership put on hold', data: order });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to hold membership' });
    }
});
exports.holdMembership = holdMembership;
const unholdMembership = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.get('salesType') !== 'membership') {
            res.status(400).json({ message: 'Not a membership order' });
            return;
        }
        const mem = order.get('membership') || {};
        if (!mem.hold) {
            res.json({ message: 'Membership already active', data: order });
            return;
        }
        const ranges = Array.isArray(mem.holdRanges) ? mem.holdRanges : [];
        if (ranges.length === 0 || ranges[ranges.length - 1].to) {
            // create a small zero-length hold if none open, else just proceed
            ranges.push({ from: todayYmd(), to: todayYmd() });
        }
        else {
            ranges[ranges.length - 1].to = todayYmd();
        }
        mem.hold = false;
        mem.holdRanges = ranges;
        order.set('membership', mem);
        yield order.save();
        res.json({ message: 'Membership resumed', data: order });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to unhold membership' });
    }
});
exports.unholdMembership = unholdMembership;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q = '', page = '1', limit = '20', status, startDate, endDate, salesType, customerId, aggregatorId, branchId, orderType, canceled } = req.query;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (salesType) {
            const types = String(salesType)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (types.length > 0) {
                filter.salesType = { $in: types };
            }
        }
        if (customerId) {
            filter['customer.id'] = String(customerId);
        }
        if (aggregatorId) {
            filter.aggregatorId = String(aggregatorId);
        }
        if (branchId) {
            filter.branchId = String(branchId);
        }
        if (orderType) {
            const types = String(orderType).split(',').map((s) => s.trim()).filter(Boolean);
            if (types.length > 0)
                filter.orderType = { $in: types };
        }
        if (typeof canceled !== 'undefined') {
            filter.canceled = String(canceled) === 'true' || String(canceled) === '1';
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        if (q) {
            filter.$or = [
                { invoiceNo: { $regex: q, $options: 'i' } },
                { 'customer.name': { $regex: q, $options: 'i' } },
            ];
        }
        const p = Math.max(1, parseInt(page, 10) || 1);
        const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
        const skip = (p - 1) * l;
        const [items, total] = yield Promise.all([
            order_model_1.Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
            order_model_1.Order.countDocuments(filter),
        ]);
        // totals
        const totalsAgg = yield order_model_1.Order.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
        ]);
        const summary = totalsAgg[0] || { total: 0, count: 0 };
        res.json({ data: items, meta: { page: p, limit: l, total }, summary });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch orders' });
    }
});
exports.getOrders = getOrders;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield order_model_1.Order.findOne({ _id: req.params.id, isDeleted: false });
        if (!item) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json({ data: item });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch order' });
    }
});
exports.getOrderById = getOrderById;
const updateOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = order_validation_1.orderUpdateValidation.parse(req.body);
        const item = yield order_model_1.Order.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, payload.date ? Object.assign(Object.assign({}, payload), { date: new Date(payload.date) }) : payload, { new: true });
        if (!item) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json({ message: 'Order updated', data: item });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            res.status(400).json({ message: ((_b = (_a = err.issues) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || 'Validation error' });
            return;
        }
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update order' });
    }
});
exports.updateOrderById = updateOrderById;
const deleteOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield order_model_1.Order.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!item) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json({ message: 'Order deleted' });
    }
    catch (err) {
        res.status(500).json({ message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete order' });
    }
});
exports.deleteOrderById = deleteOrderById;
