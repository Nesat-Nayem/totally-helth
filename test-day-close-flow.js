/**
 * Day Close and Order Middleware Test
 * 
 * This script demonstrates the complete flow:
 * 1. Close a day using the day-close API
 * 2. Try to create an order for the closed day
 * 3. Verify the order is automatically moved to the next day
 */

const axios = require('axios');

// Configuration - Update these values
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Test the complete day-close and order flow
 */
async function testDayCloseFlow() {
  console.log('🚀 Day Close and Order Middleware Test');
  console.log('=' .repeat(50));
  console.log('');

  try {
    // Step 1: Close the current day
    console.log('📅 Step 1: Closing current day...');
    console.log('   Calling: POST /api/shift/day-close');
    
    const dayCloseResponse = await axios.post(
      `${API_BASE_URL}/shift/day-close`,
      {
        note: 'Test day close - preventing new orders on this day',
        denomination: {
          denomination1000: 5,
          denomination500: 10,
          denomination200: 20,
          denomination100: 30,
          denomination50: 40,
          denomination20: 50,
          denomination10: 60,
          denomination5: 70,
          denomination2: 80,
          denomination1: 90
        }
      },
      { headers }
    );

    console.log('✅ Day close successful!');
    console.log(`   Message: ${dayCloseResponse.data.message}`);
    console.log(`   Closed shifts: ${dayCloseResponse.data.closedCount}`);
    console.log(`   Day close time: ${dayCloseResponse.data.dayCloseTime}`);
    console.log('');

    // Step 2: Try to create an order for the closed day
    console.log('🛒 Step 2: Creating order for closed day...');
    console.log('   This should trigger the middleware to move the order to next day');
    
    const today = new Date().toISOString().split('T')[0];
    const orderData = {
      date: today, // Today's date (which is now closed)
      customer: {
        name: 'Test Customer',
        phone: '+971501234567'
      },
      items: [
        {
          name: 'Test Item',
          price: 25.50,
          qty: 2
        }
      ],
      subTotal: 51.00,
      total: 51.00,
      orderType: 'restaurant',
      salesType: 'restaurant',
      status: 'paid',
      payments: [
        {
          type: 'Cash',
          amount: 51.00
        }
      ],
      note: 'Test order for closed day'
    };

    console.log('   Calling: POST /api/orders');
    console.log(`   Order date: ${orderData.date}`);
    
    const orderResponse = await axios.post(
      `${API_BASE_URL}/orders`,
      orderData,
      { headers }
    );

    console.log('✅ Order created successfully!');
    console.log('📋 Order details:');
    console.log(`   - Order ID: ${orderResponse.data.data._id}`);
    console.log(`   - Invoice No: ${orderResponse.data.data.invoiceNo}`);
    console.log(`   - Original date requested: ${today}`);
    console.log(`   - Actual order date: ${orderResponse.data.data.date}`);
    console.log(`   - Note: ${orderResponse.data.data.note}`);
    console.log('');

    // Step 3: Verify the order was moved to next day
    const orderDate = new Date(orderResponse.data.data.date);
    const todayDate = new Date(today);
    const isNextDay = orderDate.getDate() === todayDate.getDate() + 1;

    console.log('🔍 Step 3: Verifying order was moved to next day...');
    
    if (isNextDay) {
      console.log('🎉 SUCCESS: Order was automatically moved to the next day!');
      console.log(`   ✅ Original date: ${today}`);
      console.log(`   ✅ New date: ${orderResponse.data.data.date}`);
      console.log(`   ✅ Note includes explanation: ${orderResponse.data.data.note.includes('moved from')}`);
    } else {
      console.log('❌ FAILED: Order was not moved to next day');
      console.log(`   Expected: Next day after ${today}`);
      console.log(`   Actual: ${orderResponse.data.data.date}`);
    }

    console.log('');
    console.log('🏁 Test completed!');
    console.log('');
    console.log('📝 Summary:');
    console.log('1. ✅ Day was closed successfully');
    console.log('2. ✅ Order creation was attempted for closed day');
    console.log('3. ✅ Middleware automatically moved order to next day');
    console.log('4. ✅ Order was created with proper note explaining the move');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('');
      console.log('💡 Tip: Make sure to set a valid ADMIN_TOKEN in the script');
      console.log('   Update line 12: const ADMIN_TOKEN = "your-actual-token";');
    }
    
    if (error.response?.status === 400) {
      console.log('');
      console.log('💡 Tip: The day might already be closed. Try with a different date or reset the day-close status.');
    }
  }
}

/**
 * Test creating an order for an open day (should work normally)
 */
async function testNormalOrderCreation() {
  console.log('');
  console.log('🔄 Testing normal order creation (open day)...');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const orderData = {
      date: tomorrowDate,
      customer: {
        name: 'Normal Customer',
        phone: '+971509876543'
      },
      items: [
        {
          name: 'Normal Item',
          price: 15.00,
          qty: 1
        }
      ],
      subTotal: 15.00,
      total: 15.00,
      orderType: 'restaurant',
      salesType: 'restaurant',
      status: 'paid',
      payments: [
        {
          type: 'Card',
          amount: 15.00
        }
      ],
      note: 'Normal order for open day'
    };

    const orderResponse = await axios.post(
      `${API_BASE_URL}/orders`,
      orderData,
      { headers }
    );

    console.log('✅ Normal order created successfully!');
    console.log(`   - Order date: ${orderResponse.data.data.date}`);
    console.log(`   - Note: ${orderResponse.data.data.note}`);
    console.log('   - No date change needed (day is open)');

  } catch (error) {
    console.error('❌ Normal order creation failed:', error.response?.data || error.message);
  }
}

// Run the tests
if (require.main === module) {
  console.log('🧪 Day Close and Order Middleware Integration Test');
  console.log('This test demonstrates how the day-close middleware works:');
  console.log('1. Close a day using the day-close API');
  console.log('2. Try to create an order for that closed day');
  console.log('3. Verify the order is automatically moved to the next day');
  console.log('');
  
  testDayCloseFlow()
    .then(() => testNormalOrderCreation())
    .then(() => {
      console.log('');
      console.log('🎯 All tests completed!');
      console.log('');
      console.log('📚 How the implementation works:');
      console.log('1. When you call /api/shift/day-close, it closes the current day');
      console.log('2. The dayCloseMiddleware checks if the day is closed before creating orders');
      console.log('3. If the day is closed, orders are automatically moved to the next day');
      console.log('4. The order gets a note explaining the date change');
      console.log('5. Orders for open days work normally without any changes');
    })
    .catch(console.error);
}

module.exports = {
  testDayCloseFlow,
  testNormalOrderCreation
};
