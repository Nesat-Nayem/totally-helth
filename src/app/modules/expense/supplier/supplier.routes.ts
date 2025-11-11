  import express from 'express';
  import { auth } from '../../../middlewares/authMiddleware';
  import {
    createSupplier,
    deleteSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier,
  } from './supplier.controller';

  const router = express.Router();

  router.get('/', getSuppliers);
  router.get('/:id', getSupplierById);
  router.post('/', auth(), createSupplier);
  router.patch('/:id', auth(), updateSupplier);
  router.delete('/:id', auth(), deleteSupplier);

  export const supplierRouter = router;

