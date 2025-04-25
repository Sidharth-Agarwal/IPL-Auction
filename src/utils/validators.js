// src/utils/validators.js

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
export const validateRequired = (data, requiredFields) => {
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors[field] = 'This field is required';
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate number value
   * @param {number|string} value - Value to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean} - Whether value is valid
   */
  export const isValidNumber = (value, min = null, max = null) => {
    const num = Number(value);
    
    if (isNaN(num)) return false;
    
    if (min !== null && num < min) return false;
    
    if (max !== null && num > max) return false;
    
    return true;
  };
  
  /**
   * Validate team form data
   * @param {Object} teamData - Team data
   * @returns {Object} - Validation result
   */
  export const validateTeamForm = (teamData) => {
    const errors = {};
    
    // Name is required
    if (!teamData.name || teamData.name.trim() === '') {
      errors.name = 'Team name is required';
    }
    
    // Wallet must be a valid number
    if (!isValidNumber(teamData.wallet, 0)) {
      errors.wallet = 'Wallet amount must be a positive number';
    }
    
    // Logo URL format (if provided)
    if (teamData.logo && teamData.logo.trim() !== '') {
      try {
        new URL(teamData.logo);
      } catch (e) {
        errors.logo = 'Logo must be a valid URL';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validate player data
   * @param {Object} playerData - Player data
   * @returns {Object} - Validation result
   */
  export const validatePlayerData = (playerData) => {
    const errors = {};
    
    // Name is required
    if (!playerData.name || playerData.name.trim() === '') {
      errors.name = 'Player name is required';
    }
    
    // Base price must be a valid number
    if (!isValidNumber(playerData.basePrice, 0)) {
      errors.basePrice = 'Base price must be a positive number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validate bid amount
   * @param {number|string} bidAmount - Bid amount
   * @param {number} minBid - Minimum bid allowed
   * @param {number} walletBalance - Available wallet balance
   * @returns {Object} - Validation result
   */
  export const validateBid = (bidAmount, minBid, walletBalance) => {
    const errors = {};
    
    // Bid must be a valid number
    if (!isValidNumber(bidAmount, 0)) {
      errors.amount = 'Bid amount must be a positive number';
      return { isValid: false, errors };
    }
    
    const amount = Number(bidAmount);
    
    // Bid must be at least minimum bid
    if (amount < minBid) {
      errors.amount = `Bid must be at least ${minBid}`;
    }
    
    // Bid must not exceed wallet balance
    if (amount > walletBalance) {
      errors.amount = 'Insufficient wallet balance';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };