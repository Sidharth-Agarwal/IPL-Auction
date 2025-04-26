import React, { useState } from 'react';
import { playerService } from '../../services/playerService';

const PlayerImportForm = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [manualPlayer, setManualPlayer] = useState({
    name: '',
    basePrice: '',
    category: '',
    matches: '',
    runs: '',
    average: ''
  });
  const [playerImage, setPlayerImage] = useState(null);
  const [importedPlayers, setImportedPlayers] = useState([]);
  const [error, setError] = useState('');

  // Handle CSV file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
  };

  // Handle CSV import
  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      const players = await playerService.importPlayersFromCSV(csvFile);
      setImportedPlayers(players);
      setError('');
    } catch (err) {
      setError('Failed to import players. Please check your CSV file.');
      console.error(err);
    }
  };

  // Handle manual player input
  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualPlayer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setPlayerImage(file);
  };

  // Submit manual player creation
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPlayer = await playerService.createPlayer(manualPlayer, playerImage);
      setImportedPlayers(prev => [...prev, newPlayer]);
      
      // Reset form
      setManualPlayer({
        name: '',
        basePrice: '',
        category: '',
        matches: '',
        runs: '',
        average: ''
      });
      setPlayerImage(null);
      document.getElementById('playerImage').value = '';
    } catch (err) {
      setError('Failed to create player');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Player Import</h2>

      {/* CSV Import Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Import from CSV</h3>
        <form onSubmit={handleCsvImport} className="flex items-center space-x-4">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Import CSV
          </button>
        </form>
      </div>

      {/* Manual Player Input Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Add Player Manually</h3>
        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
          <input 
            type="text"
            name="name"
            value={manualPlayer.name}
            onChange={handleManualInputChange}
            placeholder="Player Name"
            required
            className="border rounded px-3 py-2"
          />
          <input 
            type="number"
            name="basePrice"
            value={manualPlayer.basePrice}
            onChange={handleManualInputChange}
            placeholder="Base Price"
            required
            className="border rounded px-3 py-2"
          />
          <select 
            name="category"
            value={manualPlayer.category}
            onChange={handleManualInputChange}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">Select Category</option>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
            <option value="Wicket-Keeper">Wicket-Keeper</option>
          </select>
          <input 
            type="number"
            name="matches"
            value={manualPlayer.matches}
            onChange={handleManualInputChange}
            placeholder="Matches Played"
            className="border rounded px-3 py-2"
          />
          <input 
            type="number"
            name="runs"
            value={manualPlayer.runs}
            onChange={handleManualInputChange}
            placeholder="Total Runs"
            className="border rounded px-3 py-2"
          />
          <input 
            type="number"
            name="average"
            step="0.01"
            value={manualPlayer.average}
            onChange={handleManualInputChange}
            placeholder="Average"
            className="border rounded px-3 py-2"
          />
          <div className="col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Player Image
              <input 
                type="file" 
                id="playerImage"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </label>
          </div>
          <div className="col-span-2">
            <button 
              type="submit" 
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            >
              Add Player
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Imported Players List */}
      {importedPlayers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Imported Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importedPlayers.map((player) => (
              <div 
                key={player.id} 
                className="border rounded-lg p-4 shadow-sm bg-gray-50 flex flex-col items-center"
              >
                {player.imageUrl && (
                  <img 
                    src={player.imageUrl} 
                    alt={player.name} 
                    className="w-24 h-24 object-cover rounded-full mb-3"
                  />
                )}
                <h4 className="font-bold text-lg">{player.name}</h4>
                <p className="text-gray-600">Category: {player.category}</p>
                <p className="text-gray-600">Base Price: {player.basePrice}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerImportForm;