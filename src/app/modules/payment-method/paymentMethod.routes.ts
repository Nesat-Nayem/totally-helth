import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createPaymentMethod, deletePaymentMethod, getPaymentMethodById, getPaymentMethods, updatePaymentMethod } from './paymentMethod.controller';

const router = express.Router();

router.get('/', auth(), getPaymentMethods);
router.get('/:id', auth(), getPaymentMethodById);
router.post('/', auth(), createPaymentMethod);
router.patch('/:id', auth(), updatePaymentMethod);
router.delete('/:id', auth(), deletePaymentMethod);

export const paymentMethodRouter = router;
