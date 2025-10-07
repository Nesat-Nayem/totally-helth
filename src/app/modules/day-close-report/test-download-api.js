/**
 * Test script for Day Close Reports Download API
 * 
 * This script demonstrates how to test the enhanced downloadDayCloseReports API
 * with various parameter combinations.
 */

const testDownloadAPI = () => {
  const baseUrl = 'http://localhost:3000/api/day-close-report/download';
  
  // Test cases
  const testCases = [
    {
      name: 'Download selected days as PDF with all data types',
      params: {
        format: 'pdf',
        selectedDays: '2025-01-15,2025-01-16,2025-01-17',
        includeDayWise: 'true',
        includeShiftWise: 'true',
        includeThermalReceipt: 'true'
      }
    },
    {
      name: 'Download date range as Excel with day-wise and shift-wise data',
      params: {
        format: 'excel',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        includeDayWise: 'true',
        includeShiftWise: 'true'
      }
    },
    {
      name: 'Download single day as CSV with thermal receipt data',
      params: {
        format: 'csv',
        date: '2025-01-15',
        includeDayWise: 'true',
        includeThermalReceipt: 'true'
      }
    },
    {
      name: 'Download all data as PDF',
      params: {
        format: 'pdf',
        includeDayWise: 'true',
        includeShiftWise: 'true',
        includeThermalReceipt: 'true'
      }
    }
  ];

  // Generate test URLs
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('URL:', buildTestUrl(baseUrl, testCase.params));
    console.log('Parameters:', testCase.params);
  });

  // Frontend integration examples
  console.log('\n=== Frontend Integration Examples ===');
  
  console.log('\n1. JavaScript/React Example:');
  console.log(`
const downloadReport = async (selectedDays, format = 'pdf') => {
  const params = new URLSearchParams({
    format,
    selectedDays: selectedDays.join(','),
    includeDayWise: 'true',
    includeShiftWise: 'true',
    includeThermalReceipt: 'true'
  });
  
  const response = await fetch(\`/api/day-close-report/download?\${params}\`);
  const blob = await response.blob();
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`day-close-reports-\${selectedDays.join('-')}.\${format === 'excel' ? 'xlsx' : format}\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
  `);

  console.log('\n2. jQuery Example:');
  console.log(`
$('#downloadBtn').click(function() {
  const selectedDays = getSelectedDays(); // Your function to get selected days
  const format = $('#formatSelect').val();
  
  const params = {
    format: format,
    selectedDays: selectedDays.join(','),
    includeDayWise: 'true',
    includeShiftWise: 'true',
    includeThermalReceipt: 'true'
  };
  
  const url = '/api/day-close-report/download?' + $.param(params);
  window.open(url, '_blank');
});
  `);

  console.log('\n3. Vue.js Example:');
  console.log(`
methods: {
  downloadReport() {
    const params = new URLSearchParams({
      format: this.format,
      selectedDays: this.selectedDays.join(','),
      includeDayWise: this.includeDayWise.toString(),
      includeShiftWise: this.includeShiftWise.toString(),
      includeThermalReceipt: this.includeThermalReceipt.toString()
    });

    const downloadUrl = \`/api/day-close-report/download?\${params}\`;
    window.open(downloadUrl, '_blank');
  }
}
  `);
};

const buildTestUrl = (baseUrl, params) => {
  const urlParams = new URLSearchParams(params);
  return `${baseUrl}?${urlParams.toString()}`;
};

// Run the test
testDownloadAPI();

console.log('\n=== API Response Examples ===');
console.log(`
Success Response (200):
- File download with appropriate Content-Type headers
- Content-Disposition header with filename
- Cache-Control: no-cache

Error Responses:
- 400: Bad request (invalid parameters)
- 404: No data found for specified criteria  
- 500: Server error during file generation

Example Error Response:
{
  "success": false,
  "statusCode": 404,
  "message": "No day close reports found for the specified criteria"
}
`);

console.log('\n=== File Naming Convention ===');
console.log(`
Generated filenames follow this pattern:
- day-close-reports-selected-3-days-daywise-shiftwise-thermal.pdf
- day-close-reports-2025-01-15.csv
- day-close-reports-2025-01-01-to-2025-01-31-daywise-shiftwise.xlsx
- day-close-reports-all-2025-01-15-thermal.pdf

The filename includes:
- Base name: day-close-reports
- Selection type: selected-X-days, single date, date range, or all
- Data types: daywise, shiftwise, thermal (if included)
- File extension: .pdf, .xlsx, .csv
`);

module.exports = { testDownloadAPI, buildTestUrl };
