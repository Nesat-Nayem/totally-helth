import express from 'express';
import { getTermsCondition, updateTermsCondition } from './terms-condition.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get privacy policy
router.get('/', getTermsCondition);

// Update privacy policy
router.put('/', auth(), updateTermsCondition);

export const TermsConditionRouter = router;