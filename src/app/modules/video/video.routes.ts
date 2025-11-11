import express from 'express';
import { upsertVideo, getVideo } from './video.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Upsert video (create or update - same record can be updated many times) - admin only
router.post('/', auth('admin'), upsertVideo);

// Get video for frontend (public)
router.get('/', getVideo);

export const videoRouter = router;
