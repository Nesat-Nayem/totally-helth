"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRouter = void 0;
const express_1 = require("express");
const role_controller_1 = require("./role.controller");
const router = (0, express_1.Router)();
// Role management routes - Admin access required
router.post('/roles', role_controller_1.createRole); // CREATE - Admin only
router.get('/roles', role_controller_1.getAllRoles); // READ ALL (with search & filter) - Admin only
router.get('/roles/stats', role_controller_1.getRoleStats); // GET ROLE STATISTICS - Admin only
router.get('/roles/:id', role_controller_1.getRoleById); // READ ONE - Admin only
router.put('/roles/:id', role_controller_1.updateRole); // UPDATE - Admin only
router.delete('/roles/:id', role_controller_1.deleteRole); // DELETE - Admin only
exports.roleRouter = router;
