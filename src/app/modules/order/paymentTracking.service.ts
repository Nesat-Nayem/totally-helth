import { Order } from './order.model';

// Helper function to calculate total paid amount from payments array
const calculatePaidAmount = (order: any) => {
  // Use cumulativePaid if available, otherwise calculate from payments array
  if (order.cumulativePaid !== undefined) {
    return order.cumulativePaid;
  }
  if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
    return order.payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
  }
  return 0; // No payments made
};

// Helper function to get payment details from payments array
const getPaymentDetails = (order: any) => {
  if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
    return order.payments.map((payment: any) => 
      `${payment.amount} ${payment.type}${payment.methodType ? ` (${payment.methodType})` : ''}`
    ).join(', ');
  }
  return 'No payments';
};

// Helper function to get payment breakdown
const getPaymentBreakdown = (order: any) => {
  if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
    return order.payments;
  }
  return [];
};

// Helper function to get cumulative paid amount from payment history
const getCumulativePaidAmount = (paymentHistory: any[]) => {
  if (!paymentHistory || paymentHistory.length === 0) return 0;
  
  // Find the latest payment_received entry
  const latestPaymentEntry = paymentHistory
    .filter(entry => entry.action === 'payment_received')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  
  return latestPaymentEntry ? latestPaymentEntry.newPaid : 0;
};

export const updateOrderWithAutoTracking = async (orderId: string, updateData: any) => {
  const currentOrder = await Order.findById(orderId);
  if (!currentOrder) {
    throw new Error('Order not found');
  }

  // Determine which total field to use based on what's being updated
  let totalField = 'total'; // default
  let previousTotal = currentOrder.total || 0;
  let newTotal = currentOrder.total || 0;

  // If subTotal is being updated, use subTotal
  if (updateData.subTotal !== undefined) {
    totalField = 'subTotal';
    previousTotal = currentOrder.subTotal || 0;
    newTotal = updateData.subTotal;
  }
  // If total is being updated, use total
  else if (updateData.total !== undefined) {
    totalField = 'total';
    previousTotal = currentOrder.total || 0;
    newTotal = updateData.total;
  }
  // If items are being updated, check which total field exists and use it
  else if (updateData.items !== undefined) {
    // Use subTotal if it exists, otherwise use total
    totalField = currentOrder.subTotal !== undefined ? 'subTotal' : 'total';
    previousTotal = (currentOrder as any)[totalField] || 0;
    newTotal = (currentOrder as any)[totalField] || 0; // Will be recalculated by the system
  }

  // Calculate paid amounts from payments array
  const previousPaid = calculatePaidAmount(currentOrder);
  const newPaid = calculatePaidAmount({ ...currentOrder, ...updateData });
  
  // Get payment details for history
  const previousPaymentDetails = getPaymentDetails(currentOrder);
  const newPaymentDetails = getPaymentDetails({ ...currentOrder, ...updateData });
  const previousPaymentBreakdown = getPaymentBreakdown(currentOrder);
  const newPaymentBreakdown = getPaymentBreakdown({ ...currentOrder, ...updateData });
  
  // Calculate the incremental payment amount for this specific transaction
  const incrementalPayment = newPaid - previousPaid;
  
  const previousRemaining = previousTotal - previousPaid;
  const newRemaining = newTotal - newPaid;
  
  let action = 'edited';
  if (newTotal > previousTotal) action = 'add_item';
  else if (newTotal < previousTotal) action = 'remove_item';
  else if (newPaid > previousPaid) action = 'payment_received';
  else if (newPaid < previousPaid) action = 'payment_received'; // Payment decreased
  else if (JSON.stringify(previousPaymentBreakdown) !== JSON.stringify(newPaymentBreakdown)) {
    action = 'payment_mode_changed'; // Payment mode changed but amount remains same
  }
  
  const historyEntry = {
    timestamp: new Date(),
    action,
    total: newTotal,
    paid: incrementalPayment, // Show only the incremental payment amount for this transaction
    totalPaid: newPaid, // Show the cumulative total paid amount
    remaining: newRemaining,
    payments: newPaymentBreakdown, // Only current payments
    description: `${action}: ₹${newTotal} - Paid: ₹${incrementalPayment} - Total Paid: ₹${newPaid} - Remaining: ₹${newRemaining}`
  };
  
  // Create the updated payment history with totalPaid at the top level
  const existingEntries = currentOrder.paymentHistory?.entries || [];
  const updatedPaymentHistory = {
    totalPaid: newPaid, // Current total paid amount for the entire order
    entries: [...existingEntries, historyEntry]
  };

  return await Order.findByIdAndUpdate(orderId, {
    ...updateData,
    paymentHistory: updatedPaymentHistory
  }, { new: true });
};

// Function to create initial history entry for new orders
export const createInitialHistoryEntry = (order: any) => {
  // Determine which total field to use (prefer subTotal if available)
  const totalField = order.subTotal !== undefined ? 'subTotal' : 'total';
  const total = order[totalField] || 0;
  const paidAmount = calculatePaidAmount(order);
  const remainingAmount = Math.max(0, total - paidAmount);
  
  const initialHistoryEntry = {
    timestamp: new Date(),
    action: 'order_created',
    total: total,
    paid: paidAmount, // For order creation, this is the initial payment amount
    remaining: remainingAmount,
    payments: getPaymentBreakdown(order), // Track payment breakdown from payments array
    description: `Order created: ₹${total} - Paid: ₹${paidAmount} - Remaining: ₹${remainingAmount}`
  };

  // Return the payment history structure with totalPaid at the top level
  return {
    totalPaid: paidAmount, // Current total paid amount for the entire order
    entries: [initialHistoryEntry]
  };
};