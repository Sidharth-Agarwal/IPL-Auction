// src/utils/formatters.js

/**
 * Format currency value
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '$') => {
  // Handle undefined, null, or non-numeric values
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${currency}0`;
  }
  
  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return `${currency}${numericAmount.toLocaleString('en-US', {
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
  
  // Handle Firebase timestamps
  if (date && typeof date === 'object' && date.seconds) {
    date = new Date(date.seconds * 1000);
  } else {
    // Handle regular date objects or strings
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    date = dateObj;
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleString('en-US', {...defaultOptions, ...options});
};

/**
 * Format date and time
 * @param {Date|number|string} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  // Handle Firebase timestamps
  if (date && typeof date === 'object' && date.seconds) {
    date = new Date(date.seconds * 1000);
  } else {
    // Handle regular date objects or strings
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    date = dateObj;
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date to time only
 * @param {Date|number|string} date - Date to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  // Handle Firebase timestamps
  if (date && typeof date === 'object' && date.seconds) {
    date = new Date(date.seconds * 1000);
  } else {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    date = dateObj;
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate time remaining until a future date
 * @param {Date|number|string} futureDate - Future date
 * @returns {Object} - Object with days, hours, minutes, seconds
 */
export const getTimeRemaining = (futureDate) => {
  if (!futureDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  // Handle Firebase timestamps
  if (futureDate && typeof futureDate === 'object' && futureDate.seconds) {
    futureDate = new Date(futureDate.seconds * 1000);
  } else if (!(futureDate instanceof Date)) {
    futureDate = new Date(futureDate);
  }
  
  if (isNaN(futureDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const total = futureDate.getTime() - new Date().getTime();
  
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return { days, hours, minutes, seconds };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= length) return text;
  
  return `${text.substring(0, length)}...`;
};

/**
 * Format player name
 * @param {string} name - Player name
 * @returns {string} - Formatted player name
 */
export const formatPlayerName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  // Convert to title case
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.substring(1).toLowerCase())
    .join(' ');
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @param {number} limit - Maximum number of initials to return
 * @returns {string} - Initials
 */
export const getInitials = (name, limit = 2) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, limit)
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

/**
 * Format auction countdown
 * @param {Date} auctionDate - Date of the auction
 * @returns {string} - Formatted countdown or status
 */
export const formatAuctionCountdown = (auctionDate) => {
  if (!auctionDate) return 'No auction scheduled';
  
  // Handle Firebase timestamps
  if (auctionDate && typeof auctionDate === 'object' && auctionDate.seconds) {
    auctionDate = new Date(auctionDate.seconds * 1000);
  } else if (!(auctionDate instanceof Date)) {
    auctionDate = new Date(auctionDate);
  }
  
  if (isNaN(auctionDate.getTime())) {
    return 'Invalid auction date';
  }
  
  const now = new Date();
  
  if (auctionDate < now) {
    return 'Auction has already taken place';
  }
  
  const { days, hours, minutes } = getTimeRemaining(auctionDate);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} until auction`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} until auction`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''} until auction`;
};