"use strict";
/**
 * Shift Management Routes
 *
 * Defines API endpoints for shift operations including opening, closing,
 * and day close functionality. All routes require admin authentication.
 *
 * @author API Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const shift_controller_1 = require("./shift.controller");
const router = express_1.default.Router();
// ============================================================================
// SHIFT OPERATIONS
// ============================================================================
/**
 * @route GET /api/shifts/current
 * @desc Get current open shift
 * @access Admin
 */
router.get('/current', (0, authMiddleware_1.auth)('admin'), shift_controller_1.getOpenShift);
/**
 * @route POST /api/shifts/start
 * @desc Start new shift
 * @access Admin
 */
router.post('/start', (0, authMiddleware_1.auth)('admin'), shift_controller_1.openShift);
/**
 * @route POST /api/shifts/close
 * @desc Close shift with denominations
 * @access Admin
 */
router.post('/close', (0, authMiddleware_1.auth)('admin'), shift_controller_1.closeShift);
/**
 * @route POST /api/shifts/day-close
 * @desc Perform day close operation
 * @access Admin
 */
router.post('/day-close', (0, authMiddleware_1.auth)('admin'), shift_controller_1.dayClose);
// ============================================================================
// SHIFT QUERIES
// ============================================================================
/**
 * @route GET /api/shifts
 * @desc Get all shifts with filtering
 * @access Admin
 */
router.get('/', (0, authMiddleware_1.auth)('admin'), shift_controller_1.getShifts);
/**
 * @route GET /api/shifts/:id
 * @desc Get shift by ID
 * @access Admin
 */
router.get('/:id', (0, authMiddleware_1.auth)('admin'), shift_controller_1.getShiftById);
exports.shiftRouter = router;
