// src/utils/importUtils.js
import Papa from 'papaparse';

/**
 * Parse CSV from file
 * @param {File} file - CSV file to parse
 * @returns {Promise} - Resolves with parsed data
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: header => header ? header.trim() : header,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          // Filter out non-critical warnings
          const criticalErrors = results.errors.filter(e => 
            e.type !== 'FieldMismatch' && !e.message.includes('Trailing'));
          
          if (criticalErrors.length > 0) {
            reject(new Error(`CSV parsing error: ${criticalErrors[0].message}`));
            return;
          }
        }
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Validate that CSV data has required fields
 * @param {Array} data - CSV data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
export const validateCSV = (data, requiredFields = ['name']) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      valid: false,
      errors: ['CSV data is empty']
    };
  }
  
  // Check header row for required fields
  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return {
      valid: false,
      errors: ['Invalid CSV format']
    };
  }
  
  const headerKeys = Object.keys(firstRow).map(key => key.toLowerCase());
  const missingFields = [];
  
  for (const field of requiredFields) {
    // Check each alternative field name
    const alternatives = field.split('|');
    const hasField = alternatives.some(alt => 
      headerKeys.includes(alt.toLowerCase())
    );
    
    if (!hasField) {
      missingFields.push(alternatives[0]);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }
  
  return {
    valid: true,
    errors: []
  };
};

/**
 * Convert CSV data to JSON
 * @param {string} csvString - CSV content as string
 * @returns {Object} - Parsed result
 */
export const csvToJson = (csvString) => {
  try {
    const result = Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    
    return {
      data: result.data,
      errors: result.errors,
      meta: result.meta
    };
  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
    throw error;
  }
};

/**
 * Convert JSON to CSV
 * @param {Array} jsonData - Array of objects to convert
 * @returns {string} - CSV string
 */
export const jsonToCsv = (jsonData) => {
  try {
    return Papa.unparse(jsonData);
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    throw error;
  }
};

export default {
  parseCSV,
  validateCSV,
  csvToJson,
  jsonToCsv
};