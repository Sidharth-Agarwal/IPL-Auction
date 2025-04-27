// src/utils/formatters.js

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '$') => {
    // Handle undefined or null values
    if (amount === undefined || amount === null) {
      return `${currency}0`;
    }
    
    // Convert to number if string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Handle NaN
    if (isNaN(numAmount)) {
      return `${currency}0`;
    }
    
    return `${currency}${numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };
  
  /**
   * Format date
   * @param {Date|string} date - Date to format
   * @param {Object} options - Format options
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    // Create date object if string
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Handle invalid dates
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Default format options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Merge options
    const formatOptions = {...defaultOptions, ...options};
    
    return dateObj.toLocaleDateString('en-US', formatOptions);
  };
  
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} - Number with commas
   */
  export const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    
    return num.toLocaleString('en-US');
  };
  
  /**
   * Format percentage
   * @param {number} value - Value to format as percentage
   * @param {number} total - Total value (denominator)
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted percentage
   */
  export const formatPercentage = (value, total, decimals = 1) => {
    if (!value || !total || total === 0) {
      return '0%';
    }
    
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length before truncation
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, length = 100) => {
    if (!text) return '';
    
    if (text.length <= length) {
      return text;
    }
    
    return `${text.substring(0, length)}...`;
  };
  
  /**
   * Get player status display text
   * @param {string} status - Player status code
   * @returns {string} - Display text for status
   */
  export const formatPlayerStatus = (status) => {
    switch (status) {
      case 'sold':
        return 'Sold';
      case 'unsold':
        return 'Unsold';
      case 'available':
        return 'Available';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };
  
  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  export default {
    formatCurrency,
    formatDate,
    formatNumber,
    formatPercentage,
    truncateText,
    formatPlayerStatus,
    formatFileSize
  };