# Day Close Reports Download API - Usage Examples

## Overview

The enhanced `downloadDayCloseReports` API now supports comprehensive reporting with multiple data types and formats. It can download day-wise data, shift-wise data, and thermal receipt data in PDF, Excel, and CSV formats.

## API Endpoint

```
GET /api/day-close-report/download
```

## Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `format` | string | Download format: `pdf`, `excel`, `csv` | `format=pdf` |
| `selectedDays` | string | Comma-separated list of dates (YYYY-MM-DD) | `selectedDays=2025-01-15,2025-01-16,2025-01-17` |
| `startDate` | string | Start date for range filtering | `startDate=2025-01-01` |
| `endDate` | string | End date for range filtering | `endDate=2025-01-31` |
| `date` | string | Single date filter (legacy) | `date=2025-01-15` |
| `includeDayWise` | boolean | Include day-wise data | `includeDayWise=true` |
| `includeShiftWise` | boolean | Include shift-wise data | `includeShiftWise=true` |
| `includeThermalReceipt` | boolean | Include thermal receipt data | `includeThermalReceipt=true` |

## Usage Examples

### 1. Download Selected Days as PDF with All Data Types

```bash
GET /api/day-close-report/download?format=pdf&selectedDays=2025-01-15,2025-01-16,2025-01-17&includeDayWise=true&includeShiftWise=true&includeThermalReceipt=true
```

**Frontend Implementation:**
```javascript
// When user selects specific days via checkboxes
const selectedDays = ['2025-01-15', '2025-01-16', '2025-01-17'];
const downloadUrl = `/api/day-close-report/download?format=pdf&selectedDays=${selectedDays.join(',')}&includeDayWise=true&includeShiftWise=true&includeThermalReceipt=true`;

// Trigger download
window.open(downloadUrl, '_blank');
```

### 2. Download Date Range as Excel with Day-wise and Shift-wise Data

```bash
GET /api/day-close-report/download?format=excel&startDate=2025-01-01&endDate=2025-01-31&includeDayWise=true&includeShiftWise=true
```

**Frontend Implementation:**
```javascript
const downloadReport = async (startDate, endDate, format = 'excel') => {
  const params = new URLSearchParams({
    format,
    startDate,
    endDate,
    includeDayWise: 'true',
    includeShiftWise: 'true'
  });
  
  const response = await fetch(`/api/day-close-report/download?${params}`);
  const blob = await response.blob();
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `day-close-reports-${startDate}-to-${endDate}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
```

### 3. Download Single Day as CSV with Thermal Receipt Data

```bash
GET /api/day-close-report/download?format=csv&date=2025-01-15&includeDayWise=true&includeThermalReceipt=true
```

### 4. Download All Available Data as PDF

```bash
GET /api/day-close-report/download?format=pdf&includeDayWise=true&includeShiftWise=true&includeThermalReceipt=true
```

## Data Structure

### Day-wise Data
- Total orders for the entire day
- Total sales for the entire day
- Payment breakdown (cash, card, online)
- Day close time and closed by information

### Shift-wise Data
- Individual shift details
- Shift start/end times
- Shift-specific sales data
- Shift status and responsible staff

### Thermal Receipt Data
- Business information (name, location)
- Cashier details
- Sales summary with discounts and VAT
- Payment method breakdown
- Cash denomination details
- Cash difference calculations

## File Formats

### CSV Format
- Single sheet with all data types
- Headers indicate data type (Day-wise, Shift-wise, Thermal)
- Suitable for data analysis and import into other systems

### Excel Format
- **Day Close Summary Sheet**: Overview of all days
- **Shift Details Sheet**: Individual shift information (if `includeShiftWise=true`)
- **Thermal Receipt Data Sheet**: Thermal receipt details (if `includeThermalReceipt=true`)

### PDF Format
- Professional report layout
- Summary statistics at the top
- Multiple sections based on requested data types
- Print-friendly formatting

## Frontend Integration Examples

### React Component Example

```jsx
import React, { useState } from 'react';

const DayCloseReportDownload = () => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [format, setFormat] = useState('pdf');
  const [includeDayWise, setIncludeDayWise] = useState(true);
  const [includeShiftWise, setIncludeShiftWise] = useState(true);
  const [includeThermalReceipt, setIncludeThermalReceipt] = useState(true);

  const handleDownload = () => {
    const params = new URLSearchParams({
      format,
      selectedDays: selectedDays.join(','),
      includeDayWise: includeDayWise.toString(),
      includeShiftWise: includeShiftWise.toString(),
      includeThermalReceipt: includeThermalReceipt.toString()
    });

    const downloadUrl = `/api/day-close-report/download?${params}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div>
      <h3>Download Day Close Reports</h3>
      
      {/* Date Selection */}
      <div>
        <label>Select Days:</label>
        <input 
          type="date" 
          onChange={(e) => setSelectedDays([e.target.value])}
        />
      </div>

      {/* Format Selection */}
      <div>
        <label>Format:</label>
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      {/* Data Type Selection */}
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={includeDayWise} 
            onChange={(e) => setIncludeDayWise(e.target.checked)}
          />
          Include Day-wise Data
        </label>
      </div>

      <div>
        <label>
          <input 
            type="checkbox" 
            checked={includeShiftWise} 
            onChange={(e) => setIncludeShiftWise(e.target.checked)}
          />
          Include Shift-wise Data
        </label>
      </div>

      <div>
        <label>
          <input 
            type="checkbox" 
            checked={includeThermalReceipt} 
            onChange={(e) => setIncludeThermalReceipt(e.target.checked)}
          />
          Include Thermal Receipt Data
        </label>
      </div>

      <button onClick={handleDownload}>Download Report</button>
    </div>
  );
};

export default DayCloseReportDownload;
```

### Vue.js Component Example

```vue
<template>
  <div class="download-report">
    <h3>Download Day Close Reports</h3>
    
    <!-- Date Selection -->
    <div class="form-group">
      <label>Select Days:</label>
      <input 
        type="date" 
        v-model="selectedDate"
        @change="addSelectedDay"
      />
      <div v-if="selectedDays.length > 0">
        <p>Selected Days: {{ selectedDays.join(', ') }}</p>
        <button @click="clearSelectedDays">Clear All</button>
      </div>
    </div>

    <!-- Format Selection -->
    <div class="form-group">
      <label>Format:</label>
      <select v-model="format">
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
        <option value="csv">CSV</option>
      </select>
    </div>

    <!-- Data Type Selection -->
    <div class="form-group">
      <label>
        <input 
          type="checkbox" 
          v-model="includeDayWise"
        />
        Include Day-wise Data
      </label>
    </div>

    <div class="form-group">
      <label>
        <input 
          type="checkbox" 
          v-model="includeShiftWise"
        />
        Include Shift-wise Data
      </label>
    </div>

    <div class="form-group">
      <label>
        <input 
          type="checkbox" 
          v-model="includeThermalReceipt"
        />
        Include Thermal Receipt Data
      </label>
    </div>

    <button @click="downloadReport" :disabled="selectedDays.length === 0">
      Download Report
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedDate: '',
      selectedDays: [],
      format: 'pdf',
      includeDayWise: true,
      includeShiftWise: true,
      includeThermalReceipt: true
    };
  },
  methods: {
    addSelectedDay() {
      if (this.selectedDate && !this.selectedDays.includes(this.selectedDate)) {
        this.selectedDays.push(this.selectedDate);
      }
    },
    clearSelectedDays() {
      this.selectedDays = [];
    },
    downloadReport() {
      const params = new URLSearchParams({
        format: this.format,
        selectedDays: this.selectedDays.join(','),
        includeDayWise: this.includeDayWise.toString(),
        includeShiftWise: this.includeShiftWise.toString(),
        includeThermalReceipt: this.includeThermalReceipt.toString()
      });

      const downloadUrl = `/api/day-close-report/download?${params}`;
      window.open(downloadUrl, '_blank');
    }
  }
};
</script>
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success with file download
- `400`: Bad request (invalid parameters)
- `404`: No data found for specified criteria
- `500`: Server error during file generation

## Performance Considerations

- Large date ranges may take longer to process
- PDF generation with many days may require more memory
- Consider pagination for very large datasets
- Use specific date ranges instead of downloading all data when possible

## Security Notes

- All requests require admin authentication
- Branch-specific data filtering is applied automatically
- Sensitive data is only included in thermal receipt data when explicitly requested
