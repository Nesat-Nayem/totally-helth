import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createCustomer, deleteCustomerById, getCustomerById, getCustomers, updateCustomerById } from './customer.controller';

const router = express.Router();

// Create customer (admin)
router.post('/', auth('admin'), createCustomer);

// List customers (public for now; adjust if needed)
router.get('/', getCustomers);

// Get by id
router.get('/:id', getCustomerById);

// Update (admin)
router.put('/:id', auth('admin'), updateCustomerById);

// Soft delete (admin)
router.delete('/:id', auth('admin'), deleteCustomerById);

export const customerRouter = router;
