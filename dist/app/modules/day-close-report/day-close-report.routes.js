"use strict";
/**
 * Day Close Report Routes
 *
 * Defines API endpoints for day close report operations.
 * All routes require admin authentication.
 *
 * @author API Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dayCloseReportRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const day_close_report_controller_1 = require("./day-close-report.controller");
const router = express_1.default.Router();
// ============================================================================
// DAY CLOSE REPORT ENDPOINTS
// ============================================================================
/**
 * @route GET /api/day-close-report
 * @desc Get all shifts grouped by day with comprehensive statistics and filtering
 * @access Admin
 */
router.get('/', (0, authMiddleware_1.auth)('admin'), day_close_report_controller_1.getDayCloseReports);
/**
 * @route GET /api/day-close-report/download
 * @desc Download day close reports in various formats (CSV, Excel, PDF)
 * @access Admin
 */
router.get('/download', day_close_report_controller_1.downloadDayCloseReports);
/**
 * @route GET /api/day-close-report/date/:date
 * @desc Get all day close reports for a specific date
 * @access Admin
 */
router.get('/date/:date', (0, authMiddleware_1.auth)('admin'), day_close_report_controller_1.getDayCloseReportsByDate);
/**
 * @route GET /api/day-close-report/:id
 * @desc Get a single day close report by ID
 * @access Admin
 */
router.get('/:id', (0, authMiddleware_1.auth)('admin'), day_close_report_controller_1.getSingleDayCloseReport);
/**
 * @route DELETE /api/day-close-report/date/:date
 * @desc Delete all day close reports for a specific date
 * @access Admin
 */
router.delete('/date/:date', (0, authMiddleware_1.auth)('admin'), day_close_report_controller_1.deleteDayCloseReportsByDate);
/**
 * @route GET /api/day-close-report/thermal/:date
 * @desc Generate thermal receipt HTML for a specific date (Optimized)
 * @access Admin
 */
router.get('/thermal/:date', (0, authMiddleware_1.auth)('admin'), day_close_report_controller_1.generateThermalReceipt);
/**
 * @route GET /api/day-close-report/thermal-json/:date
 * @desc Generate thermal receipt data in JSON format for frontend processing
 * @access Admin
 */
router.get('/thermal-json/:date', (0, authMiddleware_1.auth)('admin'), day_close_report_controller_1.generateThermalReceiptJson);
exports.dayCloseReportRouter = router;
