// src/services/importService.js
import { addPlayers } from './playerService';

// Process CSV data and add players to the database
export const processAndImportPlayers = async (csvData) => {
  try {
    // Transform CSV data to player objects
    const players = transformCsvToPlayers(csvData);
    
    if (players.length === 0) {
      throw new Error('No valid player data found in the CSV');
    }
    
    // Add players to database
    const result = await addPlayers(players);
    
    return {
      success: true,
      count: result.length,
      players: result
    };
  } catch (error) {
    console.error('Error importing players:', error);
    throw error;
  }
};

// Transform CSV data to player objects
const transformCsvToPlayers = (csvData) => {
  return csvData
    .filter(row => row && typeof row === 'object' && Object.keys(row).length > 0)
    .map(row => {
      // Find name field (using various possible column names)
      const nameField = findFieldByAlternatives(row, [
        'name', 'player_name', 'player name', 'full name', 'fullname'
      ]);
      
      // Find role field
      const roleField = findFieldByAlternatives(row, [
        'role', 'player_role', 'player role', 'position', 'type'
      ]);
      
      // Find base price field
      const priceField = findFieldByAlternatives(row, [
        'baseprice', 'base_price', 'base price', 'price', 'value'
      ]);
      
      // Find image field
      const imageField = findFieldByAlternatives(row, [
        'image', 'player_image', 'photo', 'picture', 'image_url'
      ]);
      
      // Skip rows without a name
      if (!nameField || !row[nameField] || row[nameField].trim() === '') {
        return null;
      }
      
      // Create player object
      return {
        name: row[nameField].trim(),
        role: roleField ? row[roleField] : '',
        basePrice: priceField ? parseInt(row[priceField]) || 1000 : 1000,
        image: imageField ? row[imageField] : '',
        battingStyle: row.battingStyle || row.batting_style || row.batting || '',
        bowlingStyle: row.bowlingStyle || row.bowling_style || row.bowling || '',
        nationality: row.nationality || row.country || '',
        age: row.age ? parseInt(row.age) : null
      };
    })
    .filter(Boolean); // Remove null entries
};

// Helper function to find a field by alternative names
const findFieldByAlternatives = (obj, alternatives) => {
  const keys = Object.keys(obj);
  for (const alt of alternatives) {
    const match = keys.find(key => key.toLowerCase() === alt.toLowerCase());
    if (match) return match;
  }
  return null;
};

export default {
  processAndImportPlayers
};