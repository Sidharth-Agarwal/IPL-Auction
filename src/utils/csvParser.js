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
      transformHeader: header => header ? header.trim() : header,
      delimitersToGuess: [',', '\t', '|', ';'],
    };
    
    // Merge options
    const parseOptions = {
      ...defaultOptions,
      ...options,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          // Filter out non-critical warnings (like incomplete final line)
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
    };
    
    try {
      // Parse from file or string
      if (typeof source === 'string') {
        Papa.parse(source, parseOptions);
      } else if (source instanceof File) {
        Papa.parse(source, parseOptions);
      } else {
        reject(new Error('Invalid source type. Expected File or string.'));
      }
    } catch (error) {
      reject(error);
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
  if (!data || !Array.isArray(data) || data.length === 0) {
    errors.push('CSV data is empty');
    return { isValid: false, errors, warnings };
  }
  
  // Check for required fields
  if (requiredFields.length > 0) {
    const firstRow = data[0];
    
    if (!firstRow || typeof firstRow !== 'object') {
      errors.push('Invalid CSV format: First row is not an object');
      return { isValid: false, errors, warnings };
    }
    
    const headerKeys = Object.keys(firstRow).map(key => key.toLowerCase());
    
    const missingFields = requiredFields.filter(field => {
      // Field can have alternative names
      const fieldAlternatives = field.toLowerCase().split('|');
      return !fieldAlternatives.some(alt => headerKeys.includes(alt));
    });
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
  
  // Check for empty values in important fields for each row
  data.forEach((row, index) => {
    if (!row || typeof row !== 'object') {
      warnings.push(`Row ${index + 1} has invalid format and will be skipped`);
      return;
    }
    
    if (requiredFields.length > 0) {
      requiredFields.forEach(field => {
        // Field can have alternative names
        const fieldAlternatives = field.split('|');
        
        // Find the first matching field name
        const matchedKey = Object.keys(row).find(key => 
          fieldAlternatives.some(alt => 
            key.toLowerCase() === alt.toLowerCase()
          )
        );
        
        if (matchedKey && (row[matchedKey] === null || row[matchedKey] === undefined || row[matchedKey] === '')) {
          warnings.push(`Row ${index + 1} has empty value for required field: ${field}`);
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: data // return validated data
  };
};

/**
 * Normalize CSV column headers
 * 
 * @param {Array} data - Parsed CSV data
 * @param {Object} mappings - Object mapping possible header names to standard names
 * @returns {Array} - Data with normalized headers
 */
export const normalizeCSVHeaders = (data, mappings) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  return data.map(row => {
    const normalizedRow = {};
    
    Object.entries(row).forEach(([key, value]) => {
      let normalizedKey = key;
      
      // Check if this key should be mapped to a standard name
      Object.entries(mappings).forEach(([standardKey, possibleNames]) => {
        if (possibleNames.some(name => name.toLowerCase() === key.toLowerCase())) {
          normalizedKey = standardKey;
        }
      });
      
      normalizedRow[normalizedKey] = value;
    });
    
    return normalizedRow;
  });
};

/**
 * Convert CSV data to array of player objects with standardized field names
 * 
 * @param {Array} data - Parsed CSV data
 * @returns {Array} - Array of player objects
 */
export const csvToPlayerObjects = (data) => {
  if (!Array.isArray(data)) return [];
  
  // Field mappings
  const fieldMappings = {
    name: ['name', 'Name', 'player_name', 'PlayerName', 'player name', 'fullname', 'full name'],
    role: ['role', 'Role', 'player_role', 'PlayerRole', 'position', 'player type', 'type'],
    battingStyle: ['battingStyle', 'BattingStyle', 'batting_style', 'batting', 'bat style', 'batting hand'],
    bowlingStyle: ['bowlingStyle', 'BowlingStyle', 'bowling_style', 'bowling', 'bowl style', 'bowling hand'],
    basePrice: ['basePrice', 'BasePrice', 'base_price', 'base', 'price', 'start price', 'starting price'],
    image: ['image', 'Image', 'player_image', 'PlayerImage', 'photo', 'picture', 'avatar'],
    
    // Stats fields
    'stats.matches': ['matches', 'Matches', 'match_count', 'games', 'played'],
    'stats.runs': ['runs', 'Runs', 'total_runs', 'batting_runs'],
    'stats.wickets': ['wickets', 'Wickets', 'total_wickets', 'bowling_wickets'],
    'stats.average': ['average', 'Average', 'batting_average', 'bat_avg'],
    'stats.strikeRate': ['strikeRate', 'StrikeRate', 'strike_rate', 'batting_sr'],
    'stats.economy': ['economy', 'Economy', 'bowling_economy', 'bowl_economy'],
    'stats.centuries': ['centuries', 'Centuries', '100s', 'hundreds'],
    'stats.fifties': ['fifties', 'Fifties', '50s', 'half_centuries']
  };
  
  return data.map(row => {
    if (!row || typeof row !== 'object') return null;
    
    // Create a player object
    const playerObject = {
      name: '',
      role: '',
      battingStyle: '',
      bowlingStyle: '',
      basePrice: 1000, // Default base price
      image: '',
      stats: {}
    };
    
    // Process each field mapping
    Object.entries(fieldMappings).forEach(([targetField, possibleSourceFields]) => {
      // Find the first matching source field
      const sourceField = Object.keys(row).find(key => 
        possibleSourceFields.some(possibleKey => 
          key.toLowerCase() === possibleKey.toLowerCase()
        )
      );
      
      if (sourceField && row[sourceField] !== undefined && row[sourceField] !== null && row[sourceField] !== '') {
        if (targetField.startsWith('stats.')) {
          // Handle nested stats fields
          const statKey = targetField.split('.')[1];
          let value = row[sourceField];
          
          // Convert to number if appropriate
          if (typeof value === 'string' && !isNaN(Number(value))) {
            value = Number(value);
          }
          
          playerObject.stats[statKey] = value;
        } else {
          // Handle direct fields
          let value = row[sourceField];
          
          // Special handling for basePrice to ensure it's a number
          if (targetField === 'basePrice') {
            value = typeof value === 'string' ? parseInt(value) : (value || 1000);
            value = isNaN(value) || value <= 0 ? 1000 : value;
          }
          
          playerObject[targetField] = value;
        }
      }
    });
    
    // Ensure player has a name
    if (!playerObject.name || playerObject.name.trim() === '') {
      return null; // Skip players without names
    }
    
    return playerObject;
  }).filter(Boolean); // Remove null entries
};

/**
 * Convert array of objects to CSV string
 * 
 * @param {Array} data - Array of objects to convert
 * @param {Object} options - CSV generation options
 * @returns {string} - CSV string
 */
export const objectsToCSV = (data, options = {}) => {
  if (!Array.isArray(data) || data.length === 0) return '';
  
  try {
    return Papa.unparse(data, options);
  } catch (error) {
    console.error('Error converting objects to CSV:', error);
    return '';
  }
};

/**
 * Prepare auction results for export
 * 
 * @param {Array} players - Sold players array
 * @param {Array} teams - Teams array
 * @returns {Object} - Object with formatted data for export
 */
export const prepareAuctionResultsForExport = (players, teams) => {
  if (!Array.isArray(players) || !Array.isArray(teams)) {
    return { teamResults: [], playerResults: [] };
  }
  
  // Create a map of team ID to team name for quick lookup
  const teamMap = teams.reduce((map, team) => {
    map[team.id] = team.name;
    return map;
  }, {});
  
  // Format player results
  const playerResults = players
    .filter(player => player.status === 'sold' && player.soldTo)
    .map(player => ({
      'Player Name': player.name,
      'Role': player.role || '',
      'Batting Style': player.battingStyle || '',
      'Bowling Style': player.bowlingStyle || '',
      'Base Price': player.basePrice,
      'Sold For': player.soldAmount,
      'Team': teamMap[player.soldTo] || 'Unknown Team'
    }));
  
  // Format team results
  const teamResults = teams.map(team => {
    const teamPlayers = players.filter(p => p.soldTo === team.id);
    
    return {
      'Team Name': team.name,
      'Owner': team.owner || '',
      'Total Players': teamPlayers.length,
      'Total Spent': teamPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0),
      'Remaining Budget': team.wallet,
      'Players': teamPlayers.map(p => p.name).join(', ')
    };
  });
  
  return {
    playerResults,
    teamResults
  };
};

export default {
  parseCSV,
  validateCSVData,
  normalizeCSVHeaders,
  csvToPlayerObjects,
  objectsToCSV,
  prepareAuctionResultsForExport
};