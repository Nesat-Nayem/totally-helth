# Day Close Report Delete API Documentation

## Overview
Simple delete API for day close reports. Deletes everything for a specific date and branch.

## API Endpoint

### Delete Day Close Reports by Date
**Endpoint:** `DELETE /api/day-close-report/date/:date`

**Description:** Deletes all day close reports for a specific date and branch. Handles both shift-wise and whole-day scenarios automatically.

**Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format (e.g., "2024-01-15")

**Authentication:** Admin required

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Day close reports deleted successfully for 2024-01-15",
  "data": {
    "date": "2024-01-15",
    "branchId": "branch123",
    "totalDeleted": 3
  }
}
```

## Error Responses

### 404 - Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "No day close reports found for the specified date"
}
```

### 400 - Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid date format. Use YYYY-MM-DD format"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Branch ID is required for delete operation"
}
```

## Usage Example

```bash
curl -X DELETE \
  "https://api.example.com/api/day-close-report/date/2024-01-15" \
  -H "Authorization: Bearer your-admin-token"
```

## What Gets Deleted

The API automatically deletes all related records for the specified date **ONLY for the user's branch**:
- All shifts with 'day-close' status (branch-specific)
- All DayClose records (branch-specific)
- All DaySales records (branch-specific)

## Security Features

1. **Branch Isolation:** Users can ONLY delete reports from their own branch
2. **Admin Authentication:** Only admin users can perform delete operations
3. **Branch ID Required:** API will fail if no branch ID is provided
4. **Complete Cleanup:** Removes all related data for the date and branch only

## Notes

- Deletes everything for the specified date
- Works for both shift-wise and whole-day scenarios
- Deleted records cannot be recovered, so use with caution
