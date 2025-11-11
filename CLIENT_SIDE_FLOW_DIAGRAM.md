# Client-Side Meal Plan Management - Visual Flow Diagram

## User Journey Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    MEAL PLAN BROWSING PHASE                      │
└──────────────────────────────────────────────────────────────────┘

[1] MEAL PLANS PAGE (/meal-plans)
    │
    ├─ API: GET /v1/api/meal-plans?status=active
    │
    ├─ Display: Grid of meal plan cards
    │   • Title (mealPlan.title)
    │   • Image (mealPlan.thumbnail)
    │   • Price (mealPlan.price)
    │   • Category (mealPlan.category)
    │   • Description (mealPlan.description)
    │   • Calorie options (mealPlan.kcalList)
    │   • Suitable for (mealPlan.suitableList)
    │
    ├─ Filters:
    │   • All / Popular / Weight Loss / Diet Specific
    │   • API: ?category=Weight Loss
    │
    └─ Actions:
        ├─ Click "Customise Your Plan" → [2]
        └─ Click "Sample Menu" → [3]

[2] CUSTOMISE MEAL PLAN PAGE (/meal-plans/customise-meal-plan?planId=X)
    │
    ├─ API: GET /v1/api/meal-plans/{planId}
    │
    ├─ Display Selected Plan:
    │   • Title, description, images
    │   • Calorie options (Regular/Upsized)
    │   • Days per week (5/6/7)
    │   • Number of weeks (4/8/12)
    │   • Allergies checkbox
    │   • Nutritionist consultation
    │
    ├─ User Selections:
    │   • caloriesPerDay: "1000-1400" or "1400-1700"
    │   • daysPerWeek: 5, 6, or 7
    │   • numberOfWeeks: 4, 8, or 12
    │   • allergies: [] or ["peanuts", "dairy"]
    │   • nutritionistConsultation: { required: true/false, type: "call"/"zoom"/"in-person" }
    │
    ├─ Price Calculation:
    │   • Base price from mealPlan.price
    │   • Apply week offer from mealPlan.weeksOffers
    │   • Calculate: weeklyPrice × numberOfWeeks
    │   • Add nutritionist fee if in-person (+150 AED)
    │
    └─ Actions:
        └─ Click "Get My Plan" → [4]

[3] SAMPLE MENU PAGE (/meal-plans/sample-menu?planId=X)
    │
    ├─ API: GET /v1/api/meal-plans/{planId}
    │
    ├─ Display:
    │   • Meal plan title
    │   • Table showing days × meal types
    │   • Sample meals from mealPlan.weeks[0].days
    │
    └─ Actions:
        └─ Back to [1] or Continue to [2]

[4] MEAL SELECTION PAGE (/meal-plans/select-meals) ⭐ NEW PAGE
    │
    ├─ API: GET /v1/api/meal-plans/{planId}
    │
    ├─ Display:
    │   • Week selector tabs (Week 1, Week 2, ...)
    │   • For each week:
    │     - 7 days (Saturday to Friday)
    │     - For each day:
    │       • 4 meal types (Breakfast, Lunch, Snacks, Dinner)
    │       • 3 options per meal type (from mealPlan.weeks[X].days[Y].meals)
    │       • Checkboxes to select 1 option
    │
    ├─ User Selections:
    │   {
    │     week1: {
    │       saturday: {
    │         breakfast: ["Pancakes 1"],
    │         lunch: ["Chicken Bowl 1"],
    │         snacks: ["Fruit Cup 1"],
    │         dinner: ["Soup Bowl 1"]
    │       },
    │       // ... other days
    │     },
    │     week2: {
    │       repeatFromWeek: 1  // Optional: repeat from week 1
    │     },
    │     // ... more weeks
    │   }
    │
    ├─ Features:
    │   • "Pre-select All" button
    │   • "Repeat from Week X" button
    │   • Save selections
    │
    └─ Actions:
        └─ Click "Save Selections" → [5]

[5] CHECKOUT PAGE (/meal-plans/checkout)
    │
    ├─ Display Order Summary:
    │   • Selected meal plan details
    │   • Customization summary (weeks, days, meals)
    │   • Price breakdown
    │   • Discounts applied
    │   • Total price
    │
    ├─ User Input Sections:
    │
    │   [5a] Registration/Login
    │   • Full Name
    │   • Phone Number
    │   • Email
    │   • Password (if new user)
    │   • API: POST /v1/api/customers (if new)
    │
    │   [5b] Nutritionist Consultation (Optional)
    │   • Skip or Confirm
    │   • Type: In Person / Call / Zoom
    │   • Language selection
    │   • Date & Time picker
    │
    │   [5c] Delivery Location
    │   • Type: Home / Office / Other
    │   • Address (Google Maps integration)
    │   • Door/House Number
    │   • Building/Community Name
    │   • Delivery Instructions
    │   • Preferred delivery time
    │
    │   [5d] Plan Start Date
    │   • Date picker
    │   • Auto-calculate end date
    │
    │   [5e] Payment Method
    │   • Add payment method
    │   • Referral code input
    │
    ├─ Calculations:
    │   • totalMeals = weeks × daysPerWeek × (mealsPerDay + snacksPerDay)
    │   • endDate = startDate + (weeks × 7 days)
    │   • totalPrice = calculated from customization
    │   • VAT = totalPrice × 0.05 (5%)
    │   • Bag deposit = 250 AED (refundable)
    │   • Grand total = totalPrice + VAT + bag deposit
    │
    └─ Actions:
        └─ Click "Complete Payment" → [6]

[6] PAYMENT PROCESSING
    │
    ├─ Process Payment:
    │   • Integration with payment gateway
    │   • Handle payment success/failure
    │
    └─ On Success:
        └─ → [7]

[7] CREATE USER MEMBERSHIP
    │
    ├─ API: POST /v1/api/user-memberships
    │
    ├─ Payload:
    │   {
    │     userId: "customer_id", // from [5a]
    │     mealPlanId: "selected_plan_id",
    │     totalMeals: 224, // calculated
    │     totalPrice: 4198, // calculated
    │     receivedAmount: 4198, // from payment
    │     paymentMode: "online", // from payment gateway
    │     paymentStatus: "paid",
    │     startDate: "2025-11-06T00:00:00Z",
    │     endDate: "2026-01-01T00:00:00Z",
    │     note: "Optional notes",
    │     weeks: [
    │       {
    │         week: 1,
    │         days: [
    │           {
    │             day: "saturday",
    │             meals: {
    │               breakfast: ["Pancakes 1"],
    │               lunch: ["Chicken Bowl 1"],
    │               snacks: ["Fruit Cup 1"],
    │               dinner: ["Soup Bowl 1"]
    │             }
    │           },
    │           // ... other days
    │         ]
    │       },
    │       // ... other weeks
    │     ]
    │   }
    │
    ├─ Backend Validation:
    │   ✅ Customer exists
    │   ✅ Meal plan exists
    │   ✅ receivedAmount === totalPrice
    │   ✅ Weeks structure valid
    │
    └─ Success Response:
        └─ → [8]

[8] CONFIRMATION PAGE
    │
    ├─ Display:
    │   • Membership created successfully
    │   • Membership ID
    │   • Total meals
    │   • Start date
    │   • End date
    │   • Payment confirmation
    │
    └─ Actions:
        ├─ View My Memberships
        └─ Download Receipt

┌──────────────────────────────────────────────────────────────────┐
│                    MEMBERSHIP MANAGEMENT PHASE                   │
└──────────────────────────────────────────────────────────────────┘

[9] MY MEMBERSHIPS PAGE (/memberships)
    │
    ├─ API: GET /v1/api/user-memberships?userId={userId}
    │
    ├─ Display:
    │   • List of user's memberships
    │   • Status (active/hold/cancelled/completed)
    │   • Total meals / Remaining meals
    │   • Start date / End date
    │   • Meal plan details
    │
    └─ Actions:
        └─ Click membership → [10]

[10] MEMBERSHIP DETAILS PAGE (/memberships/{id})
    │
    ├─ API: GET /v1/api/user-memberships/{id}
    │
    ├─ Display:
    │   • Membership overview
    │   • Week-by-week meal plan
    │   • Consumption history
    │   • Meal modifications
    │
    └─ Actions:
        ├─ Modify Meals (if allowed)
        └─ View History

```

---

## Data Flow Diagram

```
┌─────────────┐
│   CLIENT    │
│   BROWSER   │
└──────┬──────┘
       │
       │ HTTP Requests
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  GET /v1/api/meal-plans                                  │
│  ├─ Query: ?status=active&category=Weight Loss           │
│  └─ Response: List of meal plans                         │
│                                                           │
│  GET /v1/api/meal-plans/{id}                             │
│  └─ Response: Meal plan with weeks structure              │
│                                                           │
│  POST /v1/api/customers                                  │
│  ├─ Body: { name, phone, email, password }              │
│  └─ Response: Created customer with _id                 │
│                                                           │
│  POST /v1/api/user-memberships                           │
│  ├─ Body: { userId, mealPlanId, weeks, totalPrice, ... } │
│  └─ Response: Created membership                         │
│                                                           │
│  GET /v1/api/user-memberships?userId={id}                │
│  └─ Response: User's memberships                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
       │
       │ Database Operations
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  MealPlan Collection                                     │
│  ├─ _id, title, description, price                        │
│  ├─ category, brand, status                              │
│  ├─ images, thumbnail                                     │
│  ├─ weeks: [{                                             │
│  │    week: 1,                                            │
│  │    days: [{                                            │
│  │      day: "saturday",                                 │
│  │      meals: {                                          │
│  │        breakfast: ["Option 1", "Option 2", "Option 3"],│
│  │        lunch: [...],                                  │
│  │        snacks: [...],                                 │
│  │        dinner: [...]                                  │
│  │      }                                                 │
│  │    }]                                                 │
│  │  }]                                                    │
│                                                           │
│  Customer Collection                                     │
│  ├─ _id, name, phone, email                              │
│  └─ address, status                                      │
│                                                           │
│  UserMembership Collection                               │
│  ├─ _id, userId (ref: Customer)                          │
│  ├─ mealPlanId (ref: MealPlan)                           │
│  ├─ totalMeals, remainingMeals, consumedMeals           │
│  ├─ startDate, endDate                                    │
│  ├─ totalPrice, receivedAmount                           │
│  ├─ paymentMode, paymentStatus                           │
│  ├─ weeks: [{ week, days, repeatFromWeek }]               │
│  └─ history: [{ action, timestamp, mealItems, ... }]     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND STATE STORE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  mealPlanStore: {                                            │
│    availablePlans: MealPlan[],     // From API [1]          │
│    selectedPlan: MealPlan | null,  // From [2]               │
│                                                               │
│    customization: {                                           │
│      caloriesPerDay: string,      // From [2]                │
│      daysPerWeek: number,          // From [2]                │
│      numberOfWeeks: number,       // From [2]                │
│      allergies: string[],         // From [2]                │
│      nutritionist: {...}          // From [2]                │
│    },                                                         │
│                                                               │
│    mealSelections: {                                         │
│      week1: { day: {...} },     // From [4]                 │
│      week2: { day: {...} },                                  │
│      ...                                                      │
│    },                                                         │
│                                                               │
│    checkout: {                                               │
│      userInfo: {...},          // From [5a]                  │
│      delivery: {...},          // From [5c]                  │
│      startDate: Date,          // From [5d]                  │
│      paymentMethod: string     // From [5e]                  │
│    },                                                         │
│                                                               │
│    calculatedTotals: {                                       │
│      totalMeals: number,       // Calculated                 │
│      totalPrice: number,       // Calculated                 │
│      discount: number,         // Calculated                 │
│      finalPrice: number        // Calculated                 │
│    }                                                          │
│  }                                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Calculations

### Total Meals Calculation
```
totalMeals = numberOfWeeks × daysPerWeek × (mealsPerDay + snacksPerDay)

Example:
- 8 weeks × 6 days × (3 meals + 2 snacks) = 8 × 6 × 5 = 240 meals
```

### Price Calculation
```
Step 1: Get base price
  basePrice = mealPlan.price

Step 2: Find applicable offer
  offer = mealPlan.weeksOffers.find(o => o.week === `${numberOfWeeks} weeks`)
  discountPercent = parseFloat(offer.offer.replace('%', ''))

Step 3: Calculate discounted weekly price
  weeklyPrice = basePrice × (1 - discountPercent / 100)

Step 4: Calculate total
  totalPrice = weeklyPrice × numberOfWeeks

Step 5: Add additional charges
  nutritionistFee = (nutritionist.type === 'in-person') ? 150 : 0
  bagDeposit = 250
  vat = totalPrice × 0.05
  grandTotal = totalPrice + nutritionistFee + bagDeposit + vat
```

### End Date Calculation
```
endDate = startDate + (numberOfWeeks × 7 days)

Example:
- Start: 2025-11-06
- Weeks: 8
- End: 2025-11-06 + (8 × 7) = 2025-11-06 + 56 days = 2026-01-01
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [API Error] → [Error Handler] → [User Notification]         │
│                                                               │
│  Common Errors:                                               │
│  • 400: Validation error → Show field-specific errors        │
│  • 404: Meal plan not found → Redirect to browse page       │
│  • 401: Unauthorized → Redirect to login                     │
│  • 500: Server error → Show generic error message            │
│                                                               │
│  Payment Errors:                                             │
│  • Payment failed → Allow retry                              │
│  • Payment cancelled → Return to checkout                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

This flow diagram shows the complete user journey from browsing meal plans to creating a membership. Each step is clearly mapped to API calls, data structures, and user actions.

