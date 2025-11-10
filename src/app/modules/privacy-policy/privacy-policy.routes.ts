import express from 'express';
import { getPrivacyPolicy, updatePrivacyPolicy } from './privacy-policy.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get privacy policy
router.get('/', getPrivacyPolicy);

// Update privacy policy
router.put('/', auth(), updatePrivacyPolicy);


export const privacyPolicyRouter = router;