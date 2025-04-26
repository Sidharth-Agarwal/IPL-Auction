// src/utils/validation.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };
  
  /**
   * Validate player data
   * @param {Object} playerData - Player data to validate
   * @returns {Object} - Validation result with errors
   */
  export const validatePlayerData = (playerData) => {
    const errors = {};
  
    // Name validation
    if (!playerData.name || playerData.name.trim().length < 2) {
      errors.name = 'Player name must be at least 2 characters long';
    }
  
    // Base price validation
    const basePrice = parseFloat(playerData.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      errors.basePrice = 'Base price must be a positive number';
    }
  
    // Category validation
    const validCategories = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
    if (!playerData.category || !validCategories.includes(playerData.category)) {
      errors.category = 'Invalid player category';
    }
  
    // Stats validation (optional)
    if (playerData.stats) {
      const matches = parseInt(playerData.stats.matches);
      const runs = parseInt(playerData.stats.runs);
      const average = parseFloat(playerData.stats.average);
  
      if (!isNaN(matches) && matches < 0) {
        errors['stats.matches'] = 'Matches cannot be negative';
      }
  
      if (!isNaN(runs) && runs < 0) {
        errors['stats.runs'] = 'Runs cannot be negative';
      }
  
      if (!isNaN(average) && (average < 0 || average > 100)) {
        errors['stats.average'] = 'Average must be between 0 and 100';
      }
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validate team data
   * @param {Object} teamData - Team data to validate
   * @returns {Object} - Validation result with errors
   */
  export const validateTeamData = (teamData) => {
    const errors = {};
  
    // Name validation
    if (!teamData.name || teamData.name.trim().length < 2) {
      errors.name = 'Team name must be at least 2 characters long';
    }
  
    // Wallet validation
    const wallet = parseFloat(teamData.wallet);
    if (isNaN(wallet) || wallet < 0) {
      errors.wallet = 'Wallet amount must be a positive number';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} [locale='en-IN'] - Locale for formatting
   * @returns {string} - Formatted currency string
   */
  export const formatCurrency = (amount, locale = 'en-IN') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  /**
   * Generate unique ID
   * @returns {string} - Unique identifier
   */
  export const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Truncate text
   * @param {string} text - Text to truncate
   * @param {number} [maxLength=50] - Maximum length
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };