// src/components/players/PlayerImport.jsx
import React, { useState, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { parseCSV } from '../../utils/importUtils';
import { addPlayers } from '../../services/playerService';

const PlayerImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (fileType !== 'csv') {
      setError('Invalid file format. Please use CSV files only.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    try {
      // Preview first 5 rows
      const csvData = await parseCSV(selectedFile);
      setPreviewData(csvData.data.slice(0, 5));
      setShowPreview(true);
      
      // Debug - log the headers from CSV to check if Gender is present
      console.log('CSV Headers:', Object.keys(csvData.data[0] || {}));
    } catch (err) {
      console.error('Error parsing CSV:', err);
      setError('Failed to parse the CSV file. Please check the file format.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Manually set the file in the input element
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
      
      // Trigger the onChange handler
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const transformPlayerData = (data) => {
    return data.map(row => {
      // Debug logging for each row to verify gender value
      console.log('Processing row:', row);
      
      // Map CSV headers to our player fields
      // Find the field names from CSV regardless of case
      const findField = (possibleNames) => {
        for (const name of possibleNames) {
          const matchingKey = Object.keys(row).find(key => 
            key.toLowerCase().replace(/[_\s]/g, '') === name.toLowerCase().replace(/[_\s]/g, '')
          );
          if (matchingKey) {
            console.log(`Found ${name} in CSV as: ${matchingKey} with value: ${row[matchingKey]}`);
            return row[matchingKey];
          }
        }
        return null;
      };
      
      // Get player name
      const name = findField(['Name', 'PlayerName', 'Player_Name', 'player name']);
      
      // Get gender - IMPROVED to better handle Female values
      const genderValue = findField(['Gender', 'Sex', 'PlayerGender']);
      let gender = 'male'; // Default gender is male
      
      if (genderValue) {
        // Convert to string to handle any type of input
        const genderStr = String(genderValue).toLowerCase().trim();
        console.log(`Processing gender value: "${genderStr}" for player: ${name}`);
        
        // More robust case-insensitive check for female
        if (genderStr === 'female' || genderStr === 'f' || genderStr === 'woman' || 
            genderStr === 'girl' || genderStr.includes('fem')) {
          gender = 'female';
          console.log(`Setting gender to female for player: ${name}`);
        } 
        // Explicit check for male
        else if (genderStr === 'male' || genderStr === 'm' || genderStr === 'man' || 
                genderStr === 'boy' || genderStr.includes('mal')) {
          gender = 'male';
          console.log(`Setting gender to male for player: ${name}`);
        }
      }
      
      // Get capped/uncapped status
      const cappedValue = findField(['Capped/Uncapped', 'capped/uncapped', 'Capped', 'iscapped']);
      let isCapped = 'uncapped'; // Default is uncapped
      
      if (cappedValue) {
        // Convert to string to handle any type of input
        const cappedStr = String(cappedValue).toLowerCase().trim();
        
        // Check exact match first for "uncapped"
        if (cappedStr === 'uncapped') {
          isCapped = 'uncapped';
        } 
        // Match "capped" for any value that contains "capped" but not "uncapped"
        else if (cappedStr === 'capped' || (cappedStr.includes('cap') && !cappedStr.includes('uncap'))) {
          isCapped = 'capped';
        }
        // Explicitly match "no" or "false" as uncapped
        else if (cappedStr === 'no' || cappedStr === 'false' || cappedStr === '0') {
          isCapped = 'uncapped';
        }
        // Match "yes" or "true" as capped
        else if (cappedStr === 'yes' || cappedStr === 'true' || cappedStr === '1') {
          isCapped = 'capped';
        }
      }
      
      // Log for debugging
      console.log(`Player ${name} has cappedValue: ${cappedValue} → isCapped: ${isCapped}, gender: ${gender}`);
      
      // Get player type
      const playerType = findField(['Player_Type', 'PlayerType', 'Type', 'Role']);
      
      // Get specialization
      const specialization = findField(['Specialization', 'Specialty', 'Skill']);
      
      // Get batting style
      const battingStyle = findField(['Batting_Style', 'BattingStyle', 'BattingHand']);
      
      // Get bowling type
      const ballingType = findField(['Balling_Type', 'BallingType', 'BowlingType', 'BowlingStyle']);
      
      // Get minimum bidding amount (base price)
      const basePrice = parseInt(findField(['Minimum_Bidding_Amount', 'BasePrice', 'BaseBid', 'MinimumBid'])) || 1000;
      
      // Get batting stats
      const battingInnings = parseInt(findField(['Batting_Innings', 'BattingInnings'])) || 0;
      const runs = parseInt(findField(['Runs', 'TotalRuns'])) || 0;
      const battingAverage = parseFloat(findField(['Batting_Average', 'BattingAvg', 'BatAvg'])) || 0;
      const strikeRate = parseFloat(findField(['Strike_Rate', 'StrikeRate', 'SR'])) || 0;
      
      // Get bowling stats
      const ballingInnings = parseInt(findField(['Balling_innings', 'BallingInnings', 'BowlingInnings'])) || 0;
      const wickets = parseInt(findField(['Wickets', 'TotalWickets'])) || 0;
      const ballingAverage = parseFloat(findField(['Balling_Average', 'BallingAvg', 'BowlAvg'])) || 0;
      const economy = parseFloat(findField(['Economy', 'EconomyRate', 'ER'])) || 0;
      
      // Get image URL if provided
      const imageUrl = findField(['ImageUrl', 'Image', 'Photo', 'Picture']) || '';
      
      // Create standardized player object
      const playerData = {
        name: name || '',
        gender,
        isCapped,
        playerType: playerType || '',
        specialization: specialization || '',
        battingStyle: battingStyle || '',
        ballingType: ballingType || '',
        basePrice,
        battingInnings,
        runs,
        battingAverage,
        strikeRate,
        ballingInnings,
        wickets,
        ballingAverage,
        economy,
        imageUrl,
        status: 'available'  // Default status
      };
      
      console.log('Final player data:', playerData);
      return playerData;
    }).filter(player => player.name && player.name.trim() !== '');  // Remove entries without names
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Parse the CSV file
      const csvData = await parseCSV(file);
      
      // Transform data to player format
      const playersData = transformPlayerData(csvData.data);
      
      if (playersData.length === 0) {
        throw new Error('No valid player data found in the file');
      }
      
      // Debug - log the processed players data to check gender values
      console.log('Players to import:', playersData);
      console.log('Gender summary:', playersData.reduce((acc, player) => {
        acc[player.gender] = (acc[player.gender] || 0) + 1;
        return acc;
      }, {}));
      
      // Add players to database
      const result = await addPlayers(playersData);
      
      setLoading(false);
      setFile(null);
      setPreviewData([]);
      setShowPreview(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call success callback
      if (onImportComplete) {
        onImportComplete({
          success: true,
          count: result.length,
          message: `Successfully imported ${result.length} players`
        });
      }
    } catch (err) {
      console.error('Error importing players:', err);
      setError(err.message || 'Failed to import players. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-blue-800 font-medium mb-2">CSV Import Instructions</h4>
        <ul className="text-blue-700 text-sm space-y-1 list-disc pl-5">
          <li>Use CSV file format (.csv)</li>
          <li>Required column: Name</li>
          <li>Important column: Gender (with values "Male" or "Female")</li>
          <li>Recommended columns: Capped/Uncapped, Player_Type, Specialization, Batting_Style, Balling_Type</li>
          <li>Stats columns: Minimum_Bidding_Amount, Batting_Innings, Runs, Batting_Average, Strike_Rate, Balling_innings, Wickets, Balling_Average, Economy</li>
          <li>First row should be header row with column names</li>
          <li>Optional: Photo (URL to player's photo)</li>
        </ul>
      </div>
      
      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} />
      )}
      
      {/* File Upload */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <div className="mt-4 flex text-sm text-gray-600 justify-center">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
            >
              <span>Upload a file</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only"
                accept=".csv"
                onChange={handleFileChange} 
                ref={fileInputRef}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            CSV files only (up to 10MB)
          </p>
        </div>
        
        {file && (
          <div className="mt-4 flex items-center justify-center">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {file.name}
            </div>
            <button
              type="button"
              className="ml-2 text-red-600 hover:text-red-800"
              onClick={() => {
                setFile(null);
                setPreviewData([]);
                setShowPreview(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              aria-label="Remove file"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Data Preview */}
      {showPreview && previewData.length > 0 && (
        <div>
          <h4 className="text-gray-700 font-medium mb-2">Data Preview</h4>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(previewData[0]).map((header) => (
                    <th 
                      key={header}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td 
                        key={cellIndex}
                        className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing first {previewData.length} rows of data
          </p>
        </div>
      )}
      
      {/* Import Button */}
      <Button
        onClick={handleImport}
        variant="primary"
        disabled={!file || loading}
        loading={loading}
        loadingText="Importing Players..."
        fullWidth
      >
        Import Players
      </Button>
    </div>
  );
};

export default PlayerImport;