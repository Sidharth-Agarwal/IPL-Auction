// src/components/admin/TeamForm.js
import React, { useState } from 'react';
import { createTeam } from '../../services/teamService';
import Card from '../common/Card';
import Button from '../common/Button';

const TeamForm = ({ onTeamCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    wallet: 10000,
    logo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'wallet' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create the team
      const newTeam = await createTeam(formData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        owner: '',
        wallet: 10000,
        logo: ''
      });
      
      // Callback
      if (onTeamCreated) {
        onTeamCreated(newTeam);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to create team. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Team">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4">
          <p>Team created successfully!</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Team Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Team Owner */}
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
              Team Owner
            </label>
            <input
              type="text"
              id="owner"
              name="owner"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.owner}
              onChange={handleChange}
            />
          </div>
          
          {/* Wallet Amount */}
          <div>
            <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Wallet Amount
            </label>
            <input
              type="number"
              id="wallet"
              name="wallet"
              min="0"
              step="1000"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.wallet}
              onChange={handleChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Default wallet amount is 10,000 credits
            </p>
          </div>
          
          {/* Team Logo URL */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
              Team Logo URL
            </label>
            <input
              type="text"
              id="logo"
              name="logo"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional. Enter a URL to your team logo image.
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Creating Team...' : 'Create Team'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default TeamForm;