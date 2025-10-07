# Day Close Report API

## Overview
Professional day close report management system providing comprehensive reporting capabilities with advanced filtering, multiple export formats, and secure admin-only access.

## Key Features
- **Advanced Filtering** - Date range, status, and custom filters
- **Sales Data Integration** - Day-wise and shift-wise sales tracking
- **Multiple Export Formats** - PDF, Excel, and CSV support
- **Pagination Support** - Efficient data retrieval with pagination
- **Secure Access** - Admin-only authentication and authorization
- **Date-based Operations** - View and delete reports by specific dates
- **Performance Optimized** - Stored sales data for fast reporting

## API Endpoints

### 1. Get Day Close Reports (All)
```http
GET /api/day-close-report
```
**Query Parameters:**
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 20, max: 100): Items per page
- `date` (string): Filter by specific date (YYYY-MM-DD)
- `startDate` (string): Filter from start date (YYYY-MM-DD)
- `endDate` (string): Filter to end date (YYYY-MM-DD)
- `sortBy` (string): Sort field (`startTime` | `endTime` | `status` | `createdAt`)
- `sortOrder` (string): Sort order (`asc` | `desc`)

**Example:**
```http
GET /api/day-close-report?page=1&limit=10&date=2025-01-15&sortBy=startTime&sortOrder=desc
```

### 2. Get Day Close Reports by Date (View All Data for Specific Date)
```http
GET /api/day-close-report/date/:date
```
**Path Parameters:**
- `date` (string): Specific date (YYYY-MM-DD)

**Example:**
```http
GET /api/day-close-report/date/2025-01-15
```

**Response:**
```json
{
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "startDate": "2025-01-15",
      "startTime": "2025-01-15T08:00:00.000Z",
      "endDate": "2025-01-15",
      "endTime": "2025-01-15T22:00:00.000Z",
      "status": "day-close",
      "branchId": "branch123",
      "createdBy": "user123",
      "closedBy": "user123",
      "note": "Daily operations completed",
      "salesData": {
        "daySales": {
          "totalOrders": 25,
          "totalSales": 5000.00,
          "payments": { "cash": 2000, "card": 2000, "online": 1000 }
        },
        "shiftWiseSales": {
          "totalOrders": 20,
          "totalSales": 4000.00,
          "payments": { "cash": 1500, "card": 1500, "online": 1000 }
        }
      }
    }
  ],
  "total": 3,
  "date": "2025-01-15",
  "sales": {
    "dayWise": {
      "totalOrders": 25,
      "totalSales": 5000.00,
      "payments": {
        "cash": 2000,
        "card": 2000,
        "online": 1000
      }
    },
    "shiftWise": {
      "totalOrders": 20,
      "totalSales": 4000.00,
      "payments": {
        "cash": 1500,
        "card": 1500,
        "online": 1000
      }
    },
    "summary": {
      "totalShifts": 2,
      "dayCloseTime": "2025-01-15T22:00:00.000Z",
      "closedBy": "user123"
    }
  }
}
```

### 3. Get Single Day Close Report (With Sales Data)
```http
GET /api/day-close-report/:id
```
**Path Parameters:**
- `id` (string): Report ID

**Response includes:**
- Shift breakdown with individual sales data
- Optimized `sales` object with:
  - `dayWise`: All orders for the entire day
  - `shiftWise`: Orders from shifts only
  - `summary`: Day close metadata (totalShifts, dayCloseTime, closedBy)

### 4. Download Day Close Reports
```http
GET /api/day-close-report/download
```
**Query Parameters:**
- `format` (string, optional): Export format (`csv` | `excel` | `pdf`, default: `csv`)
- `date` (string, optional): Specific date (YYYY-MM-DD)
- `startDate` (string, optional): Start date for range
- `endDate` (string, optional): End date for range
- `reportIds` (string, optional): Comma-separated report IDs

**Examples:**
```http
# Download all reports (CSV)
GET /api/day-close-report/download?format=csv

# Download for specific date (PDF)
GET /api/day-close-report/download?format=pdf&date=2025-01-15

# Download for date range (Excel)
GET /api/day-close-report/download?format=excel&startDate=2025-01-01&endDate=2025-01-31

# Download specific reports (CSV)
GET /api/day-close-report/download?format=csv&reportIds=id1,id2,id3
```

### 5. Delete Single Day Close Report
```http
DELETE /api/day-close-report/:id
```
**Path Parameters:**
- `id` (string): Report ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Day close report deleted successfully"
}
```

## Authentication
All endpoints require admin authentication:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Response Formats

### Success Response (Get Reports)
```json
{
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "startDate": "2025-01-15",
      "startTime": "2025-01-15T08:00:00.000Z",
      "endDate": "2025-01-15",
      "endTime": "2025-01-15T22:00:00.000Z",
      "status": "day-close",
      "branchId": "branch123",
      "createdBy": "user123",
      "closedBy": "user123",
      "note": "Daily operations completed",
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-01-15T22:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Error Response
```json
{
  "message": "No day close reports found for the specified criteria"
}
```

## Download Formats

### CSV Format
- **Content-Type**: `text/csv; charset=utf-8`
- **File Extension**: `.csv`
- **Features**: Comma-separated values, data analysis ready

### Excel Format
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **File Extension**: `.xlsx`
- **Features**: Multiple sheets, styled headers, column formatting

### PDF Format
- **Content-Type**: `text/html`
- **File Extension**: `.html`
- **Features**: Formatted tables, styling, professional layout

## Technical Implementation

### Architecture
- **Controller Pattern** - Clean separation of concerns
- **TypeScript Support** - Full type safety and IntelliSense
- **Zod Validation** - Runtime type checking and validation
- **MongoDB Integration** - Efficient data storage and retrieval

### Security Features
- **Admin Authentication** - Bearer token-based authentication
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Secure error responses without data leakage

### Performance Optimizations
- **Pagination** - Efficient data retrieval for large datasets
- **Lean Queries** - Optimized MongoDB queries
- **Streaming Downloads** - Memory-efficient file generation

## Sales Data Integration

### DaySales Schema
The system now includes a dedicated `DaySales` schema that stores day-wise and shift-wise sales data permanently to avoid recalculation and improve performance.

#### DaySales Document Structure
```typescript
{
  date: string;                    // Date (YYYY-MM-DD)
  branchId?: string;              // Branch identifier
  daySales: {                     // All orders for the entire day
    totalOrders: number;
    totalSales: number;
    payments: {
      cash: number;
      card: number;
      online: number;
    };
  };
  shiftWiseSales: {               // Only orders from shifts
    totalOrders: number;
    totalSales: number;
    payments: {
      cash: number;
      card: number;
      online: number;
    };
  };
  shifts: [{                      // Individual shift summaries
    shiftId: string;
    shiftNumber: number;
    startTime: Date;
    endTime: Date;
    sales: {
      totalOrders: number;
      totalSales: number;
      payments: { cash: number; card: number; online: number; };
    };
  }];
  totalShifts: number;
  dayCloseTime: Date;
  closedBy?: string;
}
```

### Sales Data Flow
1. **Shift Close**: Individual shift sales are calculated and stored
2. **Day Close**: All shift sales are aggregated and stored in DaySales schema
3. **Report APIs**: Use stored data for fast retrieval (with fallback to recalculation)

### Performance Benefits
- **Fast Reporting**: No need to recalculate sales data on every request
- **Consistent Data**: Sales data is calculated once and stored permanently
- **Scalable**: Performance doesn't degrade with large order volumes
- **Reliable**: Fallback to recalculation if stored data is missing

## File Structure
```
day-close-report/
├── README.md                    # Documentation
├── day-sales.model.ts           # DaySales schema for sales data
├── day-close-report.controller.ts    # Business logic
├── day-close-report.interface.ts     # TypeScript interfaces
├── day-close-report.routes.ts         # API routes
└── day-close-report.validation.ts    # Input validation
```

## Dependencies
- **Express.js** - Web framework
- **Zod** - Schema validation
- **ExcelJS** - Excel file generation
- **MongoDB** - Database operations
- **TypeScript** - Type safety