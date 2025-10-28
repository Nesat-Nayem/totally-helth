/**
 * Day Close Report Routes
 * 
 * Defines API endpoints for day close report operations.
 * All routes require admin authentication.
 * 
 * @author API Team
 * @version 1.0.0
 */

import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { 
  getDayCloseReports,
  getDayCloseReportsByDate,
  downloadDayCloseReports,
  getSingleDayCloseReport,
  deleteDayCloseReportsByDate,
  generateThermalReceipt,
  generateThermalReceiptJson
} from './day-close-report.controller';

const router = express.Router();

// ============================================================================
// DAY CLOSE REPORT ENDPOINTS
// ============================================================================

/**
 * @route GET /api/day-close-report
 * @desc Get all shifts grouped by day with comprehensive statistics and filtering
 * @access Admin
 */
router.get('/', auth('admin'), getDayCloseReports);

/**
 * @route GET /api/day-close-report/download
 * @desc Download day close reports in various formats (CSV, Excel, PDF)
 * @access Admin
 */
router.get('/download', downloadDayCloseReports);

/**
 * @route GET /api/day-close-report/date/:date
 * @desc Get all day close reports for a specific date
 * @access Admin
 */
router.get('/date/:date', auth('admin'), getDayCloseReportsByDate);

/**
 * @route GET /api/day-close-report/:id
 * @desc Get a single day close report by ID
 * @access Admin
 */
router.get('/:id', auth('admin'), getSingleDayCloseReport);

/**
 * @route DELETE /api/day-close-report/date/:date
 * @desc Delete all day close reports for a specific date
 * @access Admin
 */
router.delete('/date/:date', auth('admin'), deleteDayCloseReportsByDate);

/**
 * @route GET /api/day-close-report/thermal/:date
 * @desc Generate thermal receipt HTML for a specific date (Optimized)
 * @access Admin
 */
router.get('/thermal/:date',auth('admin'), generateThermalReceipt);

/**
 * @route GET /api/day-close-report/thermal-json/:date
 * @desc Generate thermal receipt data in JSON format for frontend processing
 * @access Admin
 */
router.get('/thermal-json/:date', generateThermalReceiptJson);


export const dayCloseReportRouter = router;