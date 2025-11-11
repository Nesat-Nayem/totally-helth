# Client-Side Meal Plan Management - Recommendations & Flow

## Overview
This document provides recommendations for implementing dynamic client-side meal plan management based on the existing admin-side functionality and static client-side designs.

---

## 1. Data Structure & API Usage

### 1.1 Meal Plan Table - YES, Use It!
**Recommendation**: ✅ **YES, use the MealPlan table** - It's already designed for this purpose.

**Why Use MealPlan Table:**
- Contains all necessary fields: `title`, `description`, `price`, `category`, `images`, `weeks`, etc.
- Has `status: 'active'/'inactive'` for filtering available plans
- Includes structured `weeks` array with meal options
- Supports filtering by `category`, `brand`, `status`
- Has `totalMeals`, `durationDays` for calculations

**API Endpoint to Use:**
```
GET /v1/api/meal-plans?status=active&category=Weight Loss
```

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "International Meal Plan",
      "description": "...",
      "price": 2000,
      "category": "Weight Loss",
      "images": ["..."],
      "thumbnail": "...",
      "weeks": [...],
      "totalMeals": 112,
      "durationDays": 56,
      "status": "active"
    }
  ]
}
```

---

## 2. Client-Side Flow Recommendation

### 2.1 Complete User Journey Flow

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Browse Meal Plans                               │
│ Route: /meal-plans                                       │
│ Action: GET /v1/api/meal-plans?status=active            │
│ Display: Grid of meal plan cards                        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: View Sample Menu (Optional)                    │
│ Route: /meal-plans/sample-menu?planId={id}              │
│ Action: GET /v1/api/meal-plans/{id}                      │
│ Display: Meal plan details with weeks structure         │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Customize Meal Plan                            │
│ Route: /meal-plans/customise-meal-plan?planId={id}     │
│ Action: GET /v1/api/meal-plans/{id} (with weeks)        │
│ User Selects:                                            │
│   - Calories per day (Regular/Upsized)                  │
│   - Days per week (5/6/7)                               │
│   - Number of weeks (4/8/12)                            │
│   - Allergies (if any)                                   │
│   - Nutritionist consultation (optional)                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Select Meals for Each Week (NEW FEATURE)        │
│ Route: /meal-plans/select-meals?planId={id}&weeks={n}  │
│ Action: GET /v1/api/meal-plans/{id}                     │
│ Display: Week-by-week meal selection interface          │
│ User Selects:                                            │
│   - For each week, select meals for each day             │
│   - Choose from 3 options per meal type                 │
│   - Can use "repeat from week X" feature                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Checkout                                        │
│ Route: /meal-plans/checkout                             │
│ User Input:                                             │
│   - Registration/Login                                  │
│   - Delivery location                                   │
│   - Start date                                          │
│   - Payment method                                       │
│ Calculations:                                            │
│   - Total meals = weeks × days × meals per day          │
│   - Apply discounts (weeksOffers)                       │
│   - Calculate total price                               │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Create User Membership                         │
│ Action: POST /v1/api/user-memberships                   │
│ Payload:                                                │
│   - userId (from logged-in user)                       │
│   - mealPlanId                                          │
│   - totalMeals (calculated)                             │
│   - weeks (selected meal structure)                      │
│   - totalPrice (calculated)                             │
│   - receivedAmount (from payment)                       │
│   - startDate, endDate                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. What to Add to Backend (If Needed)

### 3.1 New API Endpoints (Optional Enhancements)

#### A. Get Meal Plan with Full Week Structure
**Current**: `GET /v1/api/meal-plans/{id}` already returns weeks
**Enhancement**: Add query param to include/exclude weeks
```
GET /v1/api/meal-plans/{id}?includeWeeks=true
```

#### B. Calculate Total Meals & Price
**New Endpoint**: `POST /v1/api/meal-plans/calculate`
```json
{
  "mealPlanId": "...",
  "weeks": 8,
  "daysPerWeek": 6,
  "mealsPerDay": 3,
  "snacksPerDay": 2,
  "selectedWeekOffers": ["week-4-offer"]
}
```
**Response**:
```json
{
  "totalMeals": 224,
  "basePrice": 2000,
  "discount": 300,
  "finalPrice": 1700,
  "durationDays": 56
}
```

#### C. Validate Meal Selection
**New Endpoint**: `POST /v1/api/meal-plans/validate-selection`
```json
{
  "mealPlanId": "...",
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": "saturday",
          "meals": {
            "breakfast": ["Pancakes 1"],
            "lunch": ["Chicken Bowl 1"],
            "snacks": ["Fruit Cup 1"],
            "dinner": ["Soup Bowl 1"]
          }
        }
      ]
    }
  ]
}
```
**Response**: Validates against meal plan structure

---

## 4. Frontend Implementation Recommendations

### 4.1 Meal Plan Listing Page (`/meal-plans`)

**Data Fetching:**
```javascript
// Fetch active meal plans
GET /v1/api/meal-plans?status=active&page=1&limit=12

// Filter by category
GET /v1/api/meal-plans?status=active&category=Weight Loss

// Filter by brand
GET /v1/api/meal-plans?status=active&brand=Totally Health
```

**Display Mapping:**
- `title` → Meal Plan Title
- `thumbnail` → Main Image
- `images[0]` → Thumbnail in grid
- `category` → Filter category
- `price` → Price display
- `discount` → Show discount badge
- `description` → Card description
- `suitableList` → Tags (e.g., "Weight Loss", "Global Tastes")
- `kcalList` → Calorie options (Regular/Upsized)
- `deliveredList` → Delivery info ("Delivered daily")
- `totalMeals`, `durationDays` → Plan details

**State Management:**
```javascript
{
  mealPlans: [],
  filters: {
    category: 'all', // 'all', 'popular', 'weight-loss', 'diet-specific'
    search: ''
  },
  loading: false,
  pagination: {
    page: 1,
    totalPages: 1,
    hasNext: false
  }
}
```

---

### 4.2 Customize Meal Plan Page (`/meal-plans/customise-meal-plan`)

**Data Fetching:**
```javascript
// Get selected meal plan details
GET /v1/api/meal-plans/{planId}
```

**User Selections to Capture:**
```javascript
{
  mealPlanId: "...",
  caloriesPerDay: "1000-1400", // or "1400-1700"
  daysPerWeek: 6, // 5, 6, or 7
  numberOfWeeks: 8, // 4, 8, or 12
  allergies: [], // array of allergy strings
  nutritionistConsultation: {
    required: false,
    type: "call", // "in-person", "call", "zoom"
    date: null,
    time: null
  }
}
```

**Price Calculation:**
```javascript
// Calculate based on selections
const baseWeeklyPrice = mealPlan.price;
const selectedWeeks = numberOfWeeks;
const selectedDays = daysPerWeek;

// Apply week offers from mealPlan.weeksOffers
const applicableOffer = mealPlan.weeksOffers?.find(
  offer => offer.week === `${selectedWeeks} weeks`
);

const weeklyPrice = baseWeeklyPrice * (1 - (applicableOffer?.discount || 0) / 100);
const totalPrice = weeklyPrice * selectedWeeks;

// Add nutritionist fee if required
if (nutritionistConsultation.required && nutritionistConsultation.type === 'in-person') {
  totalPrice += 150; // AED 150
}
```

---

### 4.3 Meal Selection Page (`/meal-plans/select-meals`) - NEW PAGE

**Purpose**: Allow users to select specific meals for each week/day

**Data Structure:**
```javascript
// Use mealPlan.weeks structure
{
  weeks: [
    {
      week: 1,
      days: [
        {
          day: "saturday",
          meals: {
            breakfast: ["Option 1", "Option 2", "Option 3"], // 3 options from backend
            lunch: ["Option 1", "Option 2", "Option 3"],
            snacks: ["Option 1", "Option 2", "Option 3"],
            dinner: ["Option 1", "Option 2", "Option 3"]
          }
        },
        // ... 6 more days
      ]
    },
    // ... more weeks
  ]
}
```

**User Interaction:**
- Display week selector tabs (Week 1, Week 2, etc.)
- For each week, show 7 days (Saturday to Friday)
- For each day, show 4 meal types (Breakfast, Lunch, Snacks, Dinner)
- For each meal type, show 3 options as checkboxes
- User selects 1 option per meal type
- "Repeat from Week X" button for weeks that should repeat

**State Management:**
```javascript
{
  selectedMealPlan: {...},
  selectedWeeks: numberOfWeeks, // from customize page
  mealSelections: {
    week1: {
      saturday: {
        breakfast: ["Pancakes 1"],
        lunch: ["Chicken Bowl 1"],
        snacks: ["Fruit Cup 1"],
        dinner: ["Soup Bowl 1"]
      },
      // ... other days
    },
    week2: {
      // ... or use repeatFromWeek: 1
      repeatFromWeek: 1
    },
    // ... more weeks
  },
  repeatWeeks: {
    week2: 1, // week 2 repeats from week 1
    week4: 3  // week 4 repeats from week 3
  }
}
```

**Validation:**
- Ensure at least 1 option selected per meal type per day
- Validate that selected meals exist in meal plan options
- Ensure all weeks are configured before proceeding

---

### 4.4 Checkout Page (`/meal-plans/checkout`)

**Data Collection:**
```javascript
{
  // User Info (if not logged in)
  userInfo: {
    fullName: "...",
    phone: "+971...",
    email: "...",
    password: "..."
  },
  
  // Delivery Info
  delivery: {
    type: "home", // "home", "office", "other"
    address: "...",
    doorNumber: "...",
    buildingName: "...",
    deliveryInstructions: "...",
    preferredTime: "..."
  },
  
  // Plan Start Date
  startDate: "2025-11-06",
  
  // Payment (handled separately)
  paymentMethod: "...",
  referralCode: "..."
}
```

**Price Summary:**
```javascript
{
  mealPlan: {
    title: "...",
    basePrice: 2000,
    weeklyPrice: 625,
    discount: 155 // from weeksOffers
  },
  total: {
    weeks: 8,
    daysPerWeek: 6,
    mealsPerDay: 3,
    snacksPerDay: 2,
    totalMeals: 224,
    weeklyPrice: 625,
    totalPrice: 5000,
    discount: 1240,
    finalPrice: 3760
  },
  additional: {
    nutritionistConsultation: 0, // or 150 if in-person
    bagDeposit: 250, // refundable
    vat: 188, // 5% of finalPrice
    delivery: 0 // free
  },
  grandTotal: 4198 // finalPrice + additional charges
}
```

---

## 5. User Membership Creation Flow

### 5.1 Prepare Membership Data

**From Customize Page:**
```javascript
const totalMeals = calculateTotalMeals(
  numberOfWeeks,
  daysPerWeek,
  mealsPerDay,
  snacksPerDay
);
```

**From Meal Selection Page:**
```javascript
const weeks = buildWeeksStructure(
  mealSelections,
  repeatWeeks,
  selectedWeeks
);
```

**From Checkout Page:**
```javascript
const startDate = new Date(checkoutData.startDate);
const endDate = calculateEndDate(startDate, numberOfWeeks);
```

### 5.2 Create Membership API Call

**Endpoint**: `POST /v1/api/user-memberships`

**Request Payload:**
```json
{
  "userId": "user_id_from_auth", // Get from logged-in user or create customer first
  "mealPlanId": "selected_meal_plan_id",
  "totalMeals": 224, // calculated
  "totalPrice": 4198, // calculated
  "receivedAmount": 4198, // from payment gateway
  "paymentMode": "online", // "cash", "card", "online", "payment_link"
  "paymentStatus": "paid",
  "note": "Optional notes",
  "startDate": "2025-11-06T00:00:00Z",
  "endDate": "2026-01-01T00:00:00Z",
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": "saturday",
          "meals": {
            "breakfast": ["Pancakes 1"],
            "lunch": ["Chicken Bowl 1"],
            "snacks": ["Fruit Cup 1"],
            "dinner": ["Soup Bowl 1"]
          }
        }
        // ... more days
      ]
    }
    // ... more weeks
  ]
}
```

**Important**: 
- `receivedAmount` must equal `totalPrice` (backend enforces this)
- `paymentStatus` is always `"paid"` for memberships
- `weeks` structure must match meal plan structure

---

## 6. Key Implementation Hints

### 6.1 Meal Plan Data Structure Mapping

**Static Design → Dynamic Data:**
```
Static "International Meal Plan" 
  → mealPlan.title = "International Meal Plan"

Static "Regular: 1,000-1,400 kcal"
  → mealPlan.kcalList = ["1,000-1,400", "1,400-1,700"]

Static "Delivered daily"
  → mealPlan.deliveredList = ["Delivered daily"]

Static "3 meals 2 snacks 2 drinks"
  → Calculate from mealPlan.weeks structure
  → Count meals per day from weeks[0].days[0].meals

Static "Suitable for: Weight Loss, Global Tastes"
  → mealPlan.suitableList = ["Weight Loss", "Global Tastes"]
```

### 6.2 Week Selection Logic

**Repeat Week Feature:**
```javascript
// If user selects "Week 3 repeats from Week 2"
{
  week: 3,
  repeatFromWeek: 2,
  days: [] // Empty, backend will copy from week 2
}

// Backend already handles this in UserMembership model
```

### 6.3 Total Meals Calculation

```javascript
function calculateTotalMeals(weeks, daysPerWeek, mealsPerDay, snacksPerDay) {
  const mealsPerWeek = daysPerWeek * (mealsPerDay + snacksPerDay);
  return weeks * mealsPerWeek;
}

// Example: 8 weeks, 6 days/week, 3 meals + 2 snacks = 5 items/day
// Total = 8 × 6 × 5 = 240 meals
```

### 6.4 Price Calculation with Discounts

```javascript
function calculatePrice(mealPlan, weeks, daysPerWeek, selectedOffers) {
  const basePrice = mealPlan.price;
  
  // Find applicable week offer
  const weekOffer = mealPlan.weeksOffers?.find(
    offer => offer.week === `${weeks} weeks`
  );
  
  // Calculate discount
  const discountPercent = weekOffer 
    ? parseFloat(weekOffer.offer.replace('%', '')) 
    : 0;
  
  const weeklyPrice = basePrice * (1 - discountPercent / 100);
  const totalPrice = weeklyPrice * weeks;
  
  return {
    basePrice,
    weeklyPrice,
    totalPrice,
    discount: basePrice * weeks - totalPrice
  };
}
```

### 6.5 Date Calculations

```javascript
function calculateEndDate(startDate, numberOfWeeks) {
  const start = new Date(startDate);
  const days = numberOfWeeks * 7; // Assuming 7 days per week
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return end.toISOString();
}
```

---

## 7. State Management Recommendation

### 7.1 Context/Store Structure

```javascript
// Meal Plan Context
{
  // Browse & Selection
  availableMealPlans: [],
  selectedMealPlan: null,
  
  // Customization
  customization: {
    caloriesPerDay: null,
    daysPerWeek: null,
    numberOfWeeks: null,
    allergies: [],
    nutritionistConsultation: null
  },
  
  // Meal Selection
  mealSelections: {},
  repeatWeeks: {},
  
  // Checkout
  checkout: {
    userInfo: null,
    delivery: null,
    startDate: null,
    paymentMethod: null
  },
  
  // Calculations
  calculatedTotals: {
    totalMeals: 0,
    totalPrice: 0,
    discount: 0,
    finalPrice: 0
  }
}
```

---

## 8. Backend Considerations

### 8.1 What's Already Available ✅

- ✅ MealPlan model with weeks structure
- ✅ UserMembership model with weeks structure
- ✅ GET /v1/api/meal-plans (with filtering)
- ✅ GET /v1/api/meal-plans/{id}
- ✅ POST /v1/api/user-memberships
- ✅ Week repeat functionality (repeatFromWeek)
- ✅ Meal consumption tracking

### 8.2 What Might Need Enhancement

1. **Customer Creation from Client Side**
   - If user registers during checkout, create Customer record first
   - Then use customer._id for membership creation

2. **Payment Integration**
   - Handle payment gateway callback
   - Update membership with payment confirmation
   - Consider creating membership only after payment success

3. **Meal Selection Validation**
   - Validate selected meals exist in meal plan
   - Ensure all required meals are selected
   - Validate week structure

---

## 9. Recommended Flow Summary

### Phase 1: Basic Flow (MVP)
1. ✅ Fetch and display meal plans
2. ✅ Show meal plan details
3. ✅ Customize selections (calories, days, weeks)
4. ✅ Calculate price
5. ✅ Checkout (user info, delivery, date)
6. ✅ Create membership after payment

### Phase 2: Enhanced Flow
1. ✅ Add meal selection page (week-by-week)
2. ✅ Implement repeat week feature
3. ✅ Add sample menu view
4. ✅ Add nutritionist consultation booking

### Phase 3: Advanced Features
1. ✅ Meal modification after membership creation
2. ✅ View active memberships
3. ✅ Track consumption (if user has access)
4. ✅ Renew/extend membership

---

## 10. Important Notes

### ⚠️ Backend Requirements
- `receivedAmount` MUST equal `totalPrice` when creating membership
- `paymentStatus` is always `"paid"` for new memberships
- `weeks` structure must match meal plan structure
- All meals must be selected before creating membership

### ⚠️ Frontend Considerations
- Store selections in localStorage/cookies during flow
- Handle payment gateway redirects
- Validate all inputs before API calls
- Show loading states during API calls
- Handle errors gracefully

### ⚠️ User Experience
- Allow users to go back and modify selections
- Save progress during checkout flow
- Show clear pricing breakdown
- Display selected options clearly
- Provide confirmation before final submission

---

## 11. Testing Checklist

- [ ] Fetch meal plans with filters
- [ ] Display meal plan details correctly
- [ ] Calculate total meals correctly
- [ ] Calculate price with discounts
- [ ] Handle week selection
- [ ] Handle meal selection per day
- [ ] Handle repeat week feature
- [ ] Validate all selections before checkout
- [ ] Create customer if new user
- [ ] Create membership with correct data
- [ ] Handle payment flow
- [ ] Display membership confirmation

---

## Conclusion

**Yes, you can use the MealPlan table** - it's already designed for this purpose. The main additions needed are:

1. **Frontend**: Connect static designs to dynamic API data
2. **Meal Selection Page**: New page for week-by-week meal selection
3. **State Management**: Track user selections through the flow
4. **Payment Integration**: Handle payment and create membership after success

The backend is mostly ready - you just need to ensure customer creation and payment handling are properly integrated.

