# Shift Management Module

## Overviews
Professional shift management system for cash handling operations with comprehensive denomination tracking, reporting capabilities, and secure admin access.

## Key Features
- **Shift Lifecycle Management** - Complete open/close workflow
- **Cash Denomination Tracking** - Detailed cash counting and validation
- **Sales Tracking** - Automatic calculation of orders and payments per shift
- **Day Close Operations** - End-of-day processing with sales aggregation
- **Multi-format Reporting** - CSV, Excel, and PDF export capabilities
- **Secure Access Control** - Admin-only authentication and authorization

## API Endpoints

### Core Operations
```http
GET    /api/shifts/current        # Get current open shift
POST   /api/shifts/start          # Start new shift
POST   /api/shifts/close          # Close shift with denominations
POST   /api/shifts/day-close      # Perform day close operation
```

### Management & Queries
```http
GET    /api/shifts                # List all shifts (paginated)
GET    /api/shifts/:id            # Get specific shift by ID
```

## Usage Examples

### Start Shift
```javascript
POST /api/shifts/close-shift
{
  "shiftNumber": 1,
  "loginDate": "2025-01-15",
  "loginTime": "12:17 PM",
  "logoutDate": "2025-01-15",
  "logoutTime": "11:52 PM",
  "loginName": "CASH",
  "note": "Starting new shift"
}
```

### Close Shift
```javascript
POST /api/shifts/close
{
  "denominations": {
    "denomination1000": 5,
    "denomination500": 10,
    "denomination200": 0,
    "denomination100": 0,
    "denomination50": 0,
    "denomination20": 0,
    "denomination10": 0,
    "denomination5": 0,
    "denomination2": 0,
    "denomination1": 0
  },
  "logoutDate": "2025-01-15",
  "logoutTime": "11:52 PM"
}
```

### Day Close (Close All Shifts)
```javascript
POST /api/shifts/day-close
{
  "note": "End of day close"
}
```

### Email Report
```javascript
POST /api/shifts/email
{
  "email": "manager@company.com"
}
```

## Data Model

### Shift Schema
```typescript
{
  shiftNumber: number;           // Auto-increment per day
  status: 'open' | 'closed';     // Current status
  startDate: string;             // YYYY-MM-DD format
  startTime: Date;               // When shift started
  endDate?: string;              // YYYY-MM-DD format
  endTime?: Date;                // When shift ended
  loginName?: string;            // Cashier name
  logoutTime?: Date;             // When logged out
  note?: string;                 // Optional notes
  denominations: {               // Cash denominations
    denomination1000: number;
    denomination500: number;
    denomination200: number;
    denomination100: number;
    denomination50: number;
    denomination20: number;
    denomination10: number;
    denomination5: number;
    denomination2: number;
    denomination1: number;
    totalCash: number;           // Auto-calculated
  };
  sales?: {                     // Sales tracking for this shift
    totalOrders: number;        // Number of orders in this shift
    totalSales: number;         // Total sales amount
    payments: {                 // Payment breakdown
      cash: number;
      card: number;
      online: number;
    };
  };
  branchId?: string;             // Branch identifier
  createdBy?: string;           // User who created
  closedBy?: string;            // User who closed
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
}
```

## Technical Implementation

### Architecture
- **Controller Pattern** - Clean separation of business logic
- **TypeScript Support** - Full type safety and IntelliSense
- **Zod Validation** - Runtime type checking and validation
- **MongoDB Integration** - Efficient data persistence

### Security Features
- **Admin Authentication** - Bearer token-based access control
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Secure error responses

### Performance Features
- **Pagination Support** - Efficient data retrieval
- **Lean Queries** - Optimized database operations
- **Timezone Handling** - Multi-timezone support

## File Structure
```
shift/
├── README.md                    # Documentation
├── sales.service.ts              # Sales calculation service
├── shift.controller.ts          # Business logic
├── shift.interface.ts           # TypeScript interfaces
├── shift.model.ts               # Database model
├── shift.routes.ts              # API routes
└── shift.validation.ts          # Input validation
```

## Sales Tracking

### Automatic Sales Calculation
- **Order Matching**: Orders are matched to shifts based on creation/update timestamps
- **Payment Breakdown**: Tracks cash, card, and online payments separately
- **Real-time Updates**: Sales data is calculated when shifts are closed
- **Day Close Aggregation**: All shift sales are aggregated during day close

### Sales Data Structure
```typescript
{
  totalOrders: number;           // Number of orders in shift
  totalSales: number;            // Total sales amount
  payments: {
    cash: number;               // Cash payments
    card: number;                // Card payments  
    online: number;             // Online/UPI payments
  };
}
```

## Dependencies
- **Express.js** - Web framework
- **MongoDB** - Database operations
- **Zod** - Schema validation
- **TypeScript** - Type safety