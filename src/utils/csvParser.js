// src/utils/csvParser.js
import Papa from 'papaparse';

/**
 * Parse CSV data from a file or string
 * 
 * @param {File|string} source - CSV file or string content
 * @param {Object} options - Parse options
 * @returns {Promise} - Resolves with parsed data
 */
export const parseCSV = (source, options = {}) => {
  return new Promise((resolve, reject) => {
    // Default options
    const defaultOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
    };
    
    // Merge options
    const parseOptions = {
      ...defaultOptions,
      ...options,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    };
    
    // Parse from file or string
    if (typeof source === 'string') {
      Papa.parse(source, parseOptions);
    } else if (source instanceof File) {
      Papa.parse(source, parseOptions);
    } else {
      reject(new Error('Invalid source type. Expected File or string.'));
    }
  });
};

/**
 * Validate parsed CSV data against expected fields
 * 
 * @param {Array} data - Parsed CSV data
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result with errors if any
 */
export const validateCSVData = (data, requiredFields = []) => {
  const errors = [];
  const warnings = [];
  
  // Check if data is empty
  if (!data || data.length === 0) {
    errors.push('CSV data is empty');
    return { isValid: false, errors, warnings };
  }
  
  // Check for required fields
  if (requiredFields.length > 0) {
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => {
      return !Object.keys(firstRow).some(key => 
        key.toLowerCase() === field.toLowerCase());
    });
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
  
  // Check for empty values in important fields for each row
  data.forEach((row, index) => {
    if (requiredFields.length > 0) {
      requiredFields.forEach(field => {
        // Look for the field with case-insensitive matching
        const matchedKey = Object.keys(row).find(key => 
          key.toLowerCase() === field.toLowerCase());
          
        if (matchedKey && (row[matchedKey] === null || row[matchedKey] === undefined || row[matchedKey] === '')) {
          warnings.push(`Row ${index + 1} has empty value for required field: ${field}`);
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Convert CSV data to array of player objects with standardized field names
 * 
 * @param {Array} data - Parsed CSV data
 * @returns {Array} - Array of player objects
 */
export const csvToPlayerObjects = (data) => {
  return data.map(row => {
    // Map CSV fields to player object fields
    // Handle different possible column names
    const playerObject = {
      name: getValueFromMultipleKeys(row, ['name', 'Name', 'player_name', 'PlayerName']),
      role: getValueFromMultipleKeys(row, ['role', 'Role', 'player_role', 'PlayerRole']),
      battingStyle: getValueFromMultipleKeys(row, ['battingStyle', 'BattingStyle', 'batting_style', 'batting']),
      bowlingStyle: getValueFromMultipleKeys(row, ['bowlingStyle', 'BowlingStyle', 'bowling_style', 'bowling']),
      basePrice: parseInt(getValueFromMultipleKeys(row, ['basePrice', 'BasePrice', 'base_price', 'base']) || 1000),
      image: getValueFromMultipleKeys(row, ['image', 'Image', 'player_image', 'PlayerImage']),
      stats: {}
    };
    
    // Extract player statistics from various possible column names
    const statFields = [
      { keys: ['matches', 'Matches', 'match_count'], target: 'matches' },
      { keys: ['runs', 'Runs', 'total_runs'], target: 'runs' },
      { keys: ['wickets', 'Wickets', 'total_wickets'], target: 'wickets' },
      { keys: ['average', 'Average', 'batting_average'], target: 'average' },
      { keys: ['strikeRate', 'StrikeRate', 'strike_rate'], target: 'strikeRate' },
      { keys: ['economy', 'Economy', 'bowling_economy'], target: 'economy' },
      { keys: ['centuries', 'Centuries', '100s'], target: 'centuries' },
      { keys: ['fifties', 'Fifties', '50s'], target: 'fifties' }
    ];
    
    statFields.forEach(stat => {
      const value = getValueFromMultipleKeys(row, stat.keys);
      if (value !== null && value !== undefined && value !== '') {
        playerObject.stats[stat.target] = value;
      }
    });
    
    // Ensure basePrice is a number and has a minimum value
    if (isNaN(playerObject.basePrice) || playerObject.basePrice <= 0) {
      playerObject.basePrice = 1000; // Default base price
    }
    
    return playerObject;
  });
};

/**
 * Helper function to get a value from multiple possible keys in an object
 * 
 * @param {Object} obj - Source object
 * @param {Array} keys - Array of possible keys to check
 * @returns {*} - Value from the first matching key or null
 */
const getValueFromMultipleKeys = (obj, keys) => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return null;
};

/**
 * Convert array of objects to CSV string
 * 
 * @param {Array} data - Array of objects to convert
 * @param {Object} options - CSV generation options
 * @returns {string} - CSV string
 */
export const objectsToCSV = (data, options = {}) => {
  return Papa.unparse(data, options);
};

export default {
  parseCSV,
  validateCSVData,
  csvToPlayerObjects,
  objectsToCSV
};