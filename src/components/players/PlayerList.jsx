import React, { useState, useEffect } from 'react';
import { playerService } from '../../services/playerService';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch players on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const fetchedPlayers = await playerService.getAllPlayers();
      setPlayers(fetchedPlayers);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch players');
      setLoading(false);
    }
  };

  // Handle player deletion
  const handleDeletePlayer = async (playerId) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playerService.deletePlayer(playerId);
        setPlayers(players.filter(player => player.id !== playerId));
      } catch (err) {
        setError('Failed to delete player');
      }
    }
  };

  // Start editing a player
  const handleEditPlayer = (player) => {
    setEditingPlayer({...player});
    setSelectedImage(null);
  };

  // Handle input change in edit mode
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPlayer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection for editing
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  // Save edited player
  const handleSavePlayer = async (e) => {
    e.preventDefault();
    try {
      // Prepare update data
      const updateData = {
        name: editingPlayer.name,
        basePrice: parseFloat(editingPlayer.basePrice),
        category: editingPlayer.category,
        stats: {
          matches: parseInt(editingPlayer.stats.matches) || 0,
          runs: parseInt(editingPlayer.stats.runs) || 0,
          average: parseFloat(editingPlayer.stats.average) || 0
        }
      };

      // Update player with optional image
      const updatedPlayer = await playerService.updatePlayer(
        editingPlayer.id, 
        updateData, 
        selectedImage
      );

      // Update players list
      setPlayers(players.map(player => 
        player.id === updatedPlayer.id ? {...player, ...updatedPlayer} : player
      ));

      // Reset editing state
      setEditingPlayer(null);
      setSelectedImage(null);
    } catch (err) {
      setError('Failed to update player');
      console.error(err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Players List</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <div 
            key={player.id} 
            className="border rounded-lg p-4 shadow-sm bg-gray-50 relative"
          >
            {/* Player Edit Mode */}
            {editingPlayer && editingPlayer.id === player.id ? (
              <form onSubmit={handleSavePlayer} className="space-y-4">
                <input 
                  type="text"
                  name="name"
                  value={editingPlayer.name}
                  onChange={handleEditInputChange}
                  placeholder="Player Name"
                  required
                  className="w-full border rounded px-3 py-2"
                />
                <input 
                  type="number"
                  name="basePrice"
                  value={editingPlayer.basePrice}
                  onChange={handleEditInputChange}
                  placeholder="Base Price"
                  required
                  className="w-full border rounded px-3 py-2"
                />
                <select 
                  name="category"
                  value={editingPlayer.category}
                  onChange={handleEditInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Category</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
                <input 
                  type="number"
                  name="stats.matches"
                  value={editingPlayer.stats.matches}
                  onChange={handleEditInputChange}
                  placeholder="Matches Played"
                  className="w-full border rounded px-3 py-2"
                />
                <input 
                  type="number"
                  name="stats.runs"
                  value={editingPlayer.stats.runs}
                  onChange={handleEditInputChange}
                  placeholder="Total Runs"
                  className="w-full border rounded px-3 py-2"
                />
                <input 
                  type="number"
                  name="stats.average"
                  step="0.01"
                  value={editingPlayer.stats.average}
                  onChange={handleEditInputChange}
                  placeholder="Average"
                  className="w-full border rounded px-3 py-2"
                />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="flex space-x-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingPlayer(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Player View Mode
              <>
                {player.imageUrl && (
                  <img 
                    src={player.imageUrl} 
                    alt={player.name} 
                    className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-center mb-2">{player.name}</h3>
                <div className="text-center text-gray-600 space-y-1">
                  <p>Category: {player.category}</p>
                  <p>Base Price: {player.basePrice}</p>
                  <p>Matches: {player.stats?.matches || 0}</p>
                  <p>Runs: {player.stats?.runs || 0}</p>
                  <p>Average: {player.stats?.average || 0}</p>
                </div>
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={() => handleEditPlayer(player)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePlayer(player.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* No Players Message */}
      {players.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-xl">No players found. Start importing players!</p>
        </div>
      )}
    </div>
  );
};

export default PlayerList;