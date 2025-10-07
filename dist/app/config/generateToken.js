"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
// utils/generateToken.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import { IStaff } from '../modules/staff/staff.model';
const generateToken = (user, extras) => {
    const payload = Object.assign({ userId: user._id, name: user.name, phone: user.phone, role: user.role }, (extras || {}));
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
// test
