"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRouter = void 0;
const express_1 = __importDefault(require("express"));
const video_controller_1 = require("./video.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Upsert video (create or update - same record can be updated many times) - admin only
router.post('/', (0, authMiddleware_1.auth)('admin'), video_controller_1.upsertVideo);
// Get video for frontend (public)
router.get('/', video_controller_1.getVideo);
exports.videoRouter = router;
