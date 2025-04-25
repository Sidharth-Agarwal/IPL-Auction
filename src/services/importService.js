// src/services/importService.js
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { addPlayers } from './playerService';

// Import players from CSV file
export const importPlayersFromCSV = async (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Transform CSV data to player format
          const players = results.data.map(row => {
            return transformPlayerData(row);
          });
          
          // Add players to database
          const addedPlayers = await addPlayers(players);
          resolve({
            success: true,
            totalCount: addedPlayers.length,
            players: addedPlayers
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Import players from Excel file
export const importPlayersFromExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        // Transform Excel data to player format
        const players = jsonData.map(row => {
          return transformPlayerData(row);
        });
        
        // Add players to database
        const addedPlayers = await addPlayers(players);
        resolve({
          success: true,
          totalCount: addedPlayers.length,
          players: addedPlayers
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Transform CSV/Excel row to player object
const transformPlayerData = (row) => {
  // Expected columns in CSV/Excel:
  // name, role, battingStyle, bowlingStyle, basePrice, stats, etc.
  
  // Handle different column name formats
  const name = row.name || row.Name || row.player_name || row.PlayerName || '';
  const role = row.role || row.Role || row.player_role || row.PlayerRole || '';
  const battingStyle = row.battingStyle || row.BattingStyle || row.batting_style || row.batting || '';
  const bowlingStyle = row.bowlingStyle || row.BowlingStyle || row.bowling_style || row.bowling || '';
  const basePrice = parseInt(row.basePrice || row.BasePrice || row.base_price || row.base || 0);
  
  // Handle stats as an object or individual columns
  let stats = {};
  if (row.stats && typeof row.stats === 'object') {
    stats = row.stats;
  } else {
    // Try to identify stats columns and build stats object
    const possibleStatsColumns = [
      'matches', 'Matches', 'runs', 'Runs', 'wickets', 'Wickets', 
      'average', 'Average', 'strikeRate', 'StrikeRate', 'economy', 'Economy',
      'centuries', 'Centuries', 'fifties', 'Fifties'
    ];
    
    possibleStatsColumns.forEach(col => {
      if (row[col] !== undefined) {
        // Convert to camelCase key
        const key = col.charAt(0).toLowerCase() + col.slice(1);
        stats[key] = row[col];
      }
    });
  }
  
  return {
    name,
    role,
    battingStyle,
    bowlingStyle,
    basePrice: basePrice > 0 ? basePrice : 1000, // Default base price
    stats,
    // Add default image if needed
    image: row.image || row.Image || row.player_image || '/assets/images/player-placeholder.png'
  };
};

export default {
  importPlayersFromCSV,
  importPlayersFromExcel
};