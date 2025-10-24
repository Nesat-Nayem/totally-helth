import { Router } from 'express';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleStats
} from './role.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = Router();

// Role management routes - Admin access required
router.post('/roles',   createRole);           // CREATE - Admin only
router.get('/roles',   getAllRoles);           // READ ALL (with search & filter) - Admin only
router.get('/roles/stats',   getRoleStats);    // GET ROLE STATISTICS - Admin only
router.get('/roles/:id',   getRoleById);       // READ ONE - Admin only
router.put('/roles/:id',   updateRole);        // UPDATE - Admin only
router.delete('/roles/:id',   deleteRole);     // DELETE - Admin only

export const roleRouter = router;
