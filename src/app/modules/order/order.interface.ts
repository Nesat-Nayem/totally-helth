import { Document, Types } from 'mongoose';

export interface IOrderItem {
  productId?: string;
  title: string;
  price: number;
  qty: number;
}

export interface IOrder extends Document {
  invoiceNo: string;
  date: Date | string;
  customer?: {
    id?: string;
    name: string;
    phone?: string;
  };
  items: IOrderItem[];
  subTotal: number;
  total: number;
  startDate?: string;
  endDate?: string;
  paymentMode?: string;
  status: 'paid' | 'unpaid';
  isDeleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
