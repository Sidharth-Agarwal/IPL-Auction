// src/utils/formatters.js

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '$') => {
    if (amount === undefined || amount === null) return `${currency}0`;
    
    return `${currency}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };
  
  /**
   * Format date
   * @param {Date|number|string} date - Date to format
   * @param {Object} options - Format options
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return dateObj.toLocaleString('en-US', {...defaultOptions, ...options});
  };
  
  /**
   * Format date to time only
   * @param {Date|number|string} date - Date to format
   * @returns {string} - Formatted time string
   */
  export const formatTime = (date) => {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, length = 100) => {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return `${text.substring(0, length)}...`;
  };
  
  /**
   * Format player name
   * @param {string} name - Player name
   * @returns {string} - Formatted player name
   */
  export const formatPlayerName = (name) => {
    if (!name) return '';
    
    // Convert to title case
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.substring(1).toLowerCase())
      .join(' ');
  };
  
  /**
   * Get initials from name
   * @param {string} name - Full name
   * @returns {string} - Initials
   */
  export const getInitials = (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };
  
  /**
   * Format player stats for display
   * @param {Object} stats - Player statistics
   * @returns {Array} - Formatted stats array
   */
  export const formatPlayerStats = (stats) => {
    if (!stats || typeof stats !== 'object') return [];
    
    // Map of stat keys to display labels
    const statLabels = {
      matches: 'Matches',
      runs: 'Runs',
      wickets: 'Wickets',
      average: 'Average',
      strikeRate: 'Strike Rate',
      economy: 'Economy',
      centuries: 'Centuries',
      fifties: 'Fifties'
    };
    
    return Object.entries(stats)
      .filter(([key]) => statLabels[key])
      .map(([key, value]) => ({
        label: statLabels[key],
        value: value
      }));
  };