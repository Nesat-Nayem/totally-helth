/**
 * Shift Management Routes
 * 
 * Defines API endpoints for shift operations including opening, closing,
 * and day close functionality. All routes require admin authentication.
 * 
 * @author API Team
 * @version 1.0.0
 */

import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { 
  dayClose,
  closeShift,
  openShift,
  getOpenShift,
  getShifts,
  getShiftById,
} from './shift.controller';

const router = express.Router();

// ============================================================================
// SHIFT OPERATIONS
// ============================================================================

/**
 * @route GET /api/shifts/current
 * @desc Get current open shift
 * @access Admin
 */
router.get('/current', auth('admin'), getOpenShift);

/**
 * @route POST /api/shifts/start
 * @desc Start new shift
 * @access Admin
 */
router.post('/start', auth('admin'), openShift);

/**
 * @route POST /api/shifts/close
 * @desc Close shift with denominations
 * @access Admin
 */
router.post('/close', auth('admin'), closeShift);

/**
 * @route POST /api/shifts/day-close
 * @desc Perform day close operation
 * @access Admin
 */
router.post('/day-close', auth('admin'), dayClose);

// ============================================================================
// SHIFT QUERIES
// ============================================================================

/**
 * @route GET /api/shifts
 * @desc Get all shifts with filtering
 * @access Admin
 */
router.get('/', auth('admin'), getShifts);

/**
 * @route GET /api/shifts/:id
 * @desc Get shift by ID
 * @access Admin
 */
router.get('/:id', auth('admin'), getShiftById);

export const shiftRouter = router;
