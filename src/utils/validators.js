// src/utils/validators.js

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
export const validateRequired = (data, requiredFields) => {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { _general: 'Invalid data provided' }
    };
  }
  
  if (!Array.isArray(requiredFields) || requiredFields.length === 0) {
    return {
      isValid: true,
      errors: {}
    };
  }
  
  const errors = {};
  
  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || 
        (typeof data[field] === 'string' && data[field].trim() === '')) {
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
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate number value
 * @param {number|string} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} - Whether value is valid
 */
export const isValidNumber = (value, min = null, max = null) => {
  // Handle empty values
  if (value === null || value === undefined || value === '') return false;
  
  // Convert string to number if needed
  const num = typeof value === 'string' ? Number(value) : value;
  
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
  if (!teamData || typeof teamData !== 'object') {
    return {
      isValid: false,
      errors: { _general: 'Invalid team data provided' }
    };
  }
  
  const errors = {};
  
  // Name is required
  if (!teamData.name || typeof teamData.name !== 'string' || teamData.name.trim() === '') {
    errors.name = 'Team name is required';
  }
  
  // Wallet must be a valid number
  if (!isValidNumber(teamData.wallet, 0)) {
    errors.wallet = 'Wallet amount must be a positive number';
  }
  
  // Owner (optional)
  if (teamData.owner !== undefined && teamData.owner !== null && 
     (typeof teamData.owner !== 'string' || teamData.owner.trim() === '')) {
    errors.owner = 'Owner name must be a valid string';
  }
  
  // Logo URL format (if provided)
  if (teamData.logo && teamData.logo.trim() !== '' && !isValidUrl(teamData.logo)) {
    errors.logo = 'Logo must be a valid URL';
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
  if (!playerData || typeof playerData !== 'object') {
    return {
      isValid: false,
      errors: { _general: 'Invalid player data provided' }
    };
  }
  
  const errors = {};
  
  // Name is required
  if (!playerData.name || typeof playerData.name !== 'string' || playerData.name.trim() === '') {
    errors.name = 'Player name is required';
  }
  
  // Base price must be a valid number
  if (!isValidNumber(playerData.basePrice, 0)) {
    errors.basePrice = 'Base price must be a positive number';
  }
  
  // Role validation (if provided)
  const validRoles = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];
  if (playerData.role && !validRoles.includes(playerData.role)) {
    errors.role = `Role must be one of: ${validRoles.join(', ')}`;
  }
  
  // Stats validation (if provided)
  if (playerData.stats && typeof playerData.stats === 'object') {
    Object.entries(playerData.stats).forEach(([key, value]) => {
      if (value !== null && value !== undefined && !isValidNumber(value, 0)) {
        if (!errors.stats) errors.stats = {};
        errors.stats[key] = `${key} must be a positive number`;
      }
    });
  }
  
  // Image URL validation (if provided)
  if (playerData.image && typeof playerData.image === 'string' && 
      playerData.image.trim() !== '' && !isValidUrl(playerData.image)) {
    errors.image = 'Image must be a valid URL';
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

/**
 * Validate auction settings
 * @param {Object} settings - Auction settings
 * @returns {Object} - Validation result
 */
export const validateAuctionSettings = (settings) => {
  if (!settings || typeof settings !== 'object') {
    return {
      isValid: false,
      errors: { _general: 'Invalid settings provided' }
    };
  }
  
  const errors = {};
  
  // Validate min bid increment
  if (!isValidNumber(settings.minBidIncrement, 10)) {
    errors.minBidIncrement = 'Minimum bid increment must be at least 10';
  }
  
  // Validate unsold price reduction
  if (settings.unsoldPriceReduction !== undefined && 
      !isValidNumber(settings.unsoldPriceReduction, 0.1, 1)) {
    errors.unsoldPriceReduction = 'Unsold price reduction must be between 0.1 and 1';
  }
  
  // Validate auction date if provided
  if (settings.auctionDate) {
    const date = new Date(settings.auctionDate);
    if (isNaN(date.getTime())) {
      errors.auctionDate = 'Invalid auction date format';
    } else if (date < new Date()) {
      errors.auctionDate = 'Auction date cannot be in the past';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if a value exists and isn't empty
 * @param {*} value - Value to check
 * @returns {boolean} - Whether value exists and isn't empty
 */
export const hasValue = (value) => {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'string') return value.trim() !== '';
  
  if (Array.isArray(value)) return value.length > 0;
  
  if (typeof value === 'object') return Object.keys(value).length > 0;
  
  return true;
};