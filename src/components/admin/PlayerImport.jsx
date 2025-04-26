// src/components/admin/PlayerImport.jsx
import React, { useState, useRef } from 'react';
import { importPlayersFromCSV, importPlayersFromExcel } from '../../services/importService';
import Card from '../common/Card';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import { parseCSV, validateCSVData, csvToPlayerObjects } from '../../utils/csvParser';
import { PLAYER_IMPORT_REQUIRED_FIELDS } from '../../utils/constants';
import { useNotification } from '../../context/NotificationContext';

const PlayerImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);
  
  const { showSuccess, showError, showWarning } = useNotification();

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      setError('Invalid file format. Please use CSV or Excel (.xlsx/.xls) files only.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setWarnings([]);
    setImportResult(null);
    
    // Preview CSV content
    if (fileType === 'csv') {
      try {
        // Preview first 5 rows
        const result = await parseCSV(selectedFile);
        const validationResult = validateCSVData(result.data, PLAYER_IMPORT_REQUIRED_FIELDS);
        
        if (validationResult.warnings.length > 0) {
          setWarnings(validationResult.warnings);
        }
        
        if (!validationResult.isValid) {
          setError(validationResult.errors.join(', '));
          return;
        }
        
        // Process and display preview
        const players = csvToPlayerObjects(result.data.slice(0, 5));
        setPreviewData(players);
        setShowPreviewModal(true);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Failed to parse the CSV file. Please check the file format.');
      }
    } else {
      // For Excel, we'll just show the file name
      setPreviewData([]);
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

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let result;
      const fileType = file.name.split('.').pop().toLowerCase();
      
      // Check file type and use appropriate import function
      if (fileType === 'csv') {
        result = await importPlayersFromCSV(file);
      } else if (['xlsx', 'xls'].includes(fileType)) {
        result = await importPlayersFromExcel(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel file.');
      }
      
      setImportResult(result);
      
      // Show success notification
      showSuccess(`Successfully imported ${result.totalCount} players`);
      
      // If there are warnings, show them
      if (warnings.length > 0) {
        showWarning(`Import completed with ${warnings.length} warnings. Check console for details.`);
      }
      
      // Callback
      if (onImportComplete) {
        onImportComplete(result);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to import players. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card title="Import Players">
        <div className="space-y-6 p-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-blue-800 font-medium mb-2">Import Instructions</h4>
            <ul className="text-blue-700 text-sm space-y-1 list-disc pl-5">
              <li>Use CSV or Excel file format (.csv, .xlsx, .xls)</li>
              <li>Required columns: name, role, battingStyle, bowlingStyle, basePrice</li>
              <li>Optional columns: stats (matches, runs, wickets, etc.), image</li>
              <li>First row should be header row with column names</li>
              <li>Auction scheduled for: Tuesday, April 29th, 2025</li>
            </ul>
          </div>
          
          {/* Error Display */}
          {error && (
            <ErrorMessage message={error} />
          )}
          
          {/* Warning Display */}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    {warnings.length} warning{warnings.length > 1 ? 's' : ''} found. The import may have incomplete data.
                  </p>
                  <details className="mt-1">
                    <summary className="text-sm font-medium underline cursor-pointer">View warnings</summary>
                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                      {warnings.slice(0, 5).map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                      {warnings.length > 5 && <li>...and {warnings.length - 5} more warnings</li>}
                    </ul>
                  </details>
                </div>
              </div>
            </div>
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
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange} 
                    ref={fileInputRef}
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
                  onClick={() => {
                    setFile(null);
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
          
          {/* Import Button */}
          <div>
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
          
          {/* Import Results */}
          {importResult && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-green-800 font-medium mb-2">Import Successful</h4>
              <p className="text-green-700">
                Successfully imported {importResult.totalCount} players.
              </p>
              {importResult.totalCount > 0 && (
                <div className="mt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setImportResult(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      
      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Preview Import Data"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Here's a preview of the first {previewData.length} players from your import file:
          </p>
          
          {previewData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batting Style
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bowling Style
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((player, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {player.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.role || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.battingStyle || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.bowlingStyle || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${player.basePrice?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No preview available for this file type. Please proceed with import to see results.
            </p>
          )}
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowPreviewModal(false)}
          >
            Close Preview
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowPreviewModal(false);
              handleImport();
            }}
          >
            Proceed with Import
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PlayerImport;