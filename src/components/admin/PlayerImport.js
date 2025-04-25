// src/components/admin/PlayerImport.js
import React, { useState } from 'react';
import { importPlayersFromCSV, importPlayersFromExcel } from '../../services/importService';
import Card from '../common/Card';
import Button from '../common/Button';

const PlayerImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let result;
      
      // Check file type and use appropriate import function
      if (file.name.endsWith('.csv')) {
        result = await importPlayersFromCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        result = await importPlayersFromExcel(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel file.');
      }
      
      setImportResult(result);
      
      // Callback
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to import players. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Import Players">
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-blue-800 font-medium mb-2">Import Instructions</h4>
          <ul className="text-blue-700 text-sm space-y-1 list-disc pl-5">
            <li>Use CSV or Excel file format (.csv, .xlsx, .xls)</li>
            <li>Required columns: name, role, battingStyle, bowlingStyle, basePrice</li>
            <li>Optional columns: stats (matches, runs, wickets, etc.), image</li>
            <li>First row should be header row with column names</li>
          </ul>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8">
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
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange} 
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              CSV or Excel up to 10MB
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
                onClick={() => setFile(null)}
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
        
        {/* Import Button */}
        <div>
          <Button
            onClick={handleImport}
            variant="primary"
            disabled={!file || loading}
            fullWidth
          >
            {loading ? 'Importing Players...' : 'Import Players'}
          </Button>
        </div>
        
        {/* Import Results */}
        {importResult && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-green-800 font-medium mb-2">Import Successful</h4>
            <p className="text-green-700">
              Successfully imported {importResult.totalCount} players.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlayerImport;