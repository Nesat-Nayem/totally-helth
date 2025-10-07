# Shift Grouping API Documentation

## Overview
This module provides comprehensive shift management functionality with day-wise grouping capabilities. It allows you to view all shifts organized by date, get shifts for specific days, and track current day activities.

## New API Endpoints

### 1. Get Shifts Grouped by Day
**Endpoint:** `GET /api/day-close-report/shifts/grouped`

**Description:** Retrieves all shifts organized by date with comprehensive statistics for each day.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of days per page (default: 20, max: 100)
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `sortBy` (optional): Sort field (startDate, startTime, etc.)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Shifts grouped by day retrieved successfully",
  "data": [
    {
      "date": "2025-01-15",
      "shifts": [
        {
          "shiftNumber": 1,
          "status": "day-close",
          "startDate": "2025-01-15",
          "startTime": "2025-01-15T08:00:00.000Z",
          "endTime": "2025-01-15T18:00:00.000Z",
          "branchId": "branch123",
          "createdBy": "user123",
          "closedBy": "user123",
          "note": "Day close completed",
          "denominations": {
            "totalCash": 1500.00
          }
        }
      ],
      "statistics": {
        "totalShifts": 3,
        "openShifts": 0,
        "closedShifts": 2,
        "dayCloseShifts": 1,
        "totalCash": 4500.00,
        "firstShiftTime": "2025-01-15T08:00:00.000Z",
        "lastShiftTime": "2025-01-15T16:00:00.000Z"
      },
      "shiftCount": 3
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1,
    "totalShifts": 15,
    "dateRange": {
      "from": "2025-01-10",
      "to": "2025-01-15"
    }
  }
}
```

### 2. Get Shifts for Specific Day
**Endpoint:** `GET /api/day-close-report/shifts/day/:date`

**Description:** Retrieves all shifts for a specific date with day statistics.

**Parameters:**
- `date`: Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Shifts retrieved successfully for date 2025-01-15",
  "data": {
    "date": "2025-01-15",
    "shifts": [
      {
        "shiftNumber": 1,
        "status": "day-close",
        "startDate": "2025-01-15",
        "startTime": "2025-01-15T08:00:00.000Z",
        "endTime": "2025-01-15T18:00:00.000Z",
        "branchId": "branch123",
        "createdBy": "user123",
        "closedBy": "user123",
        "note": "Day close completed",
        "denominations": {
          "totalCash": 1500.00
        }
      }
    ],
    "statistics": {
      "totalShifts": 3,
      "openShifts": 0,
      "closedShifts": 2,
      "dayCloseShifts": 1,
      "totalCash": 4500.00,
      "firstShiftTime": 1736937600000,
      "lastShiftTime": 1736966400000
    }
  },
  "total": 3
}
```

### 3. Get Current Day Shifts
**Endpoint:** `GET /api/day-close-report/shifts/current-day`

**Description:** Retrieves all shifts for the current day with real-time status information.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current day shifts retrieved successfully",
  "data": {
    "date": "2025-01-15",
    "shifts": [
      {
        "shiftNumber": 1,
        "status": "open",
        "startDate": "2025-01-15",
        "startTime": "2025-01-15T08:00:00.000Z",
        "branchId": "branch123",
        "createdBy": "user123",
        "denominations": {
          "totalCash": 0
        }
      }
    ],
    "statistics": {
      "totalShifts": 2,
      "openShifts": 1,
      "closedShifts": 1,
      "dayCloseShifts": 0,
      "totalCash": 1500.00,
      "isDayClosed": false,
      "hasOpenShifts": true,
      "firstShiftTime": 1736937600000,
      "lastShiftTime": 1736966400000
    },
    "currentTime": "2025-01-15T12:30:00.000Z",
    "timezone": "Asia/Dubai"
  },
  "total": 2
}
```

## Features

### Day-wise Grouping
- Groups all shifts by date
- Provides comprehensive statistics for each day
- Supports pagination for large datasets
- Flexible filtering by date range

### Statistics Tracking
- **Total Shifts**: Count of all shifts for the day
- **Open Shifts**: Currently active shifts
- **Closed Shifts**: Completed shifts
- **Day Close Shifts**: Shifts marked as day-close
- **Total Cash**: Sum of all cash from denominations
- **Time Tracking**: First and last shift times

### Real-time Status
- Current day status monitoring
- Open shift detection
- Day close status tracking
- Timezone-aware operations

## Use Cases

1. **Daily Operations Dashboard**: View all shifts for the current day
2. **Historical Analysis**: Analyze shifts across multiple days
3. **Shift Management**: Track open, closed, and day-close shifts
4. **Cash Management**: Monitor total cash across all shifts
5. **Reporting**: Generate comprehensive shift reports

## Authentication
All endpoints require admin authentication using the `auth('admin')` middleware.

## Error Handling
- Invalid date formats return 400 with descriptive messages
- Missing shifts return 404 with appropriate messages
- Server errors return 500 with generic error messages

## Timezone Support
All operations respect the user's timezone setting, defaulting to 'Asia/Dubai' if not specified.
