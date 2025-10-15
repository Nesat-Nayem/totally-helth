import { Document, Types } from 'mongoose';

export interface IOrderItem {
  productId?: string;
  title: string;
  price: number;
  qty: number;
}


export interface IOrder extends Document {
  orderNo?: string;
  invoiceNo: string;
  date: Date | string;
  customer?: {
    id?: string;
    name: string;
    phone?: string;
  };
  items: IOrderItem[];
  extraItems?: Array<{ name: string; price: number; qty?: number }>;
  subTotal: number;
  total: number;
  vatPercent?: number;
  vatAmount?: number;
  discountType?: 'flat' | 'percent';
  discountAmount?: number;
  shippingCharge?: number;
  rounding?: number;
  payableAmount?: number;
  receiveAmount?: number;
  cumulativePaid?: number;
  changeAmount?: number;
  dueAmount?: number;
  note?: string;
  startDate?: string;
  endDate?: string;
  paymentMode?: string;
  orderType?: 'DineIn' | 'TakeAway' | 'Delivery' | 'NewMembership' | 'MembershipMeal';
  salesType?: 'restaurant' | 'online' | 'membership';
  payments?: Array<{ type: 'Cash' | 'Card' | 'Gateway'; amount: number }>;
  membership?: {
    hold?: boolean;
    holdRanges?: Array<{ from: string; to?: string }>;
  };
  membershipStats?: {
    totalMeals: number;
    consumedMeals: number;
    pendingMeals: number;
    isOnHold: boolean;
  };
  branchId?: string;
  brand?: string;
  aggregatorId?: string;
  paymentMethodId?: string;
  status: 'paid' | 'unpaid';
  canceled?: boolean;
  cancelReason?: string;
  canceledAt?: Date | string;
  dayCloseId?: string;
  dayCloseDate?: string;
  dayCloseStart?: Date | string;
  dayCloseEnd?: Date | string;
  isDeleted?: boolean;
  paymentHistory?: {
    totalPaid: number;
    entries: Array<{
      timestamp: Date;
      action: string;
      total: number;
      paid: number;
      remaining: number;
      payments: Array<{ type: string; amount: number }>;
      description: string;
    }>;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
