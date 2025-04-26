// src/utils/helpers.js

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Deeply cloned object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
  
    // Handle Date
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
  
    // Handle Array
    if (Array.isArray(obj)) {
      return obj.map(item => deepClone(item));
    }
  
    // Handle Object
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
  
    return clonedObj;
  };
  
  /**
   * Debounce a function
   * @param {Function} func - Function to debounce
   * @param {number} [delay=300] - Delay in milliseconds
   * @returns {Function} - Debounced function
   */
  export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  
  /**
   * Group array of objects by a key
   * @param {Array} array - Array to group
   * @param {string} key - Key to group by
   * @returns {Object} - Grouped object
   */
  export const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
      const groupKey = currentValue[key];
      
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      
      result[groupKey].push(currentValue);
      
      return result;
    }, {});
  };
  
  /**
   * Sort array of objects by a specific key
   * @param {Array} array - Array to sort
   * @param {string} key - Key to sort by
   * @param {boolean} [ascending=true] - Sort direction
   * @returns {Array} - Sorted array
   */
  export const sortBy = (array, key, ascending = true) => {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return ascending ? -1 : 1;
      if (a[key] > b[key]) return ascending ? 1 : -1;
      return 0;
    });
  };
  
  /**
   * Convert file to base64
   * @param {File} file - File to convert
   * @returns {Promise<string>} - Base64 string
   */
  export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  /**
   * Check if two objects are deeply equal
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} - Whether objects are equal
   */
  export const isDeepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
  
    if (
      typeof obj1 !== 'object' || 
      typeof obj2 !== 'object' || 
      obj1 === null || 
      obj2 === null
    ) {
      return false;
    }
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) return false;
  
    for (const key of keys1) {
      const val1 = obj1[key];
      const val2 = obj2[key];
      const areObjects = isObject(val1) && isObject(val2);
      
      if (
        (areObjects && !isDeepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
  
    return true;
  };
  
  /**
   * Check if a value is an object
   * @param {*} value - Value to check
   * @returns {boolean} - Whether value is an object
   */
  const isObject = (value) => {
    return value !== null && typeof value === 'object';
  };
  
  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  export const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };