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
      // Find appropriate column names based on common patterns
      const nameKey = Object.keys(row).find(key => 
        ['name', 'player_name', 'player name', 'playername'].includes(key.toLowerCase())
      );
      
      const roleKey = Object.keys(row).find(key => 
        ['role', 'player_role', 'player role', 'playerrole', 'position', 'type'].includes(key.toLowerCase())
      );
      
      const basePriceKey = Object.keys(row).find(key => 
        ['baseprice', 'base_price', 'base price', 'price', 'value'].includes(key.toLowerCase())
      );
      
      const imageUrlKey = Object.keys(row).find(key => 
        ['image', 'imageurl', 'image_url', 'photo', 'picture', 'player_image', 'player image'].includes(key.toLowerCase())
      );
      
      // Create standardized player object
      return {
        name: nameKey ? row[nameKey] : '',
        role: roleKey ? row[roleKey] : '',
        basePrice: basePriceKey ? parseInt(row[basePriceKey]) || 1000 : 1000,
        imageUrl: imageUrlKey ? row[imageUrlKey] : '',
        status: 'available'  // Default status
      };
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
        <h4 className="text-blue-800 font-medium mb-2">Import Instructions</h4>
        <ul className="text-blue-700 text-sm space-y-1 list-disc pl-5">
          <li>Use CSV file format (.csv)</li>
          <li>Required columns: name, role, basePrice</li>
          <li>First row should be header row with column names</li>
          <li>Optional columns: imageUrl (URL to player's photo)</li>
          <li>For images, provide direct URLs to images hosted on Firebase Storage or other platforms</li>
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