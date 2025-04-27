// src/components/players/PlayerForm.jsx
import React, { useState, useEffect } from 'react';
import { addPlayer, updatePlayer, getPlayer } from '../../services/playerService';
import Card from '../common/Card';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

const PlayerForm = ({ playerId = null, onSuccess = null, onCancel = null }) => {
  const initialFormData = {
    name: '',
    role: '',
    basePrice: 1000,
    imageUrl: '',
    status: 'available',
    soldAmount: 0,
    soldTo: null
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Role options
  const roleOptions = [
    'Batsman',
    'Bowler',
    'All-Rounder',
    'Wicket-Keeper',
    'Captain'
  ];
  
  // Status options
  const statusOptions = [
    'available',
    'sold',
    'unsold'
  ];
  
  // Load player data if editing
  useEffect(() => {
    const loadPlayer = async () => {
      if (!playerId) return;
      
      try {
        setInitialLoading(true);
        const playerData = await getPlayer(playerId);
        setFormData({
          name: playerData.name || '',
          role: playerData.role || '',
          basePrice: playerData.basePrice || 1000,
          imageUrl: playerData.imageUrl || '',
          status: playerData.status || 'available',
          soldAmount: playerData.soldAmount || 0,
          soldTo: playerData.soldTo || null,
          soldToTeam: playerData.soldToTeam || ''
        });
        
        if (playerData.imageUrl) {
          setPreviewUrl(playerData.imageUrl);
        }
        
        setIsEditing(true);
        setInitialLoading(false);
      } catch (error) {
        console.error('Error loading player:', error);
        setFormErrors({ _general: 'Failed to load player data' });
        setInitialLoading(false);
      }
    };
    
    loadPlayer();
  }, [playerId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert to number for number fields
    const processedValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileType = file.type;
    if (!fileType.match('image.*')) {
      setFormErrors(prev => ({
        ...prev,
        imageUrl: 'Please select an image file'
      }));
      return;
    }
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageFile(file);
    
    setFormErrors(prev => ({
      ...prev,
      imageUrl: null
    }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    
    // Reset file input
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Player name is required';
    }
    
    if (formData.basePrice < 0) {
      errors.basePrice = 'Base price cannot be negative';
    }
    
    if (formData.status === 'sold' && !formData.soldAmount) {
      errors.soldAmount = 'Sold amount is required when status is "sold"';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      let imageUrl = formData.imageUrl;
      
      // Upload image to Firebase Storage if a new image file is selected
      if (imageFile && storage) {
        const timestamp = Date.now();
        const imageRef = ref(storage, `playerImages/${formData.name.replace(/\s+/g, '_')}_${timestamp}`);
        
        // Upload the image file
        const snapshot = await uploadBytes(imageRef, imageFile);
        
        // Get the download URL
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const playerData = {
        ...formData,
        imageUrl: imageUrl
      };
      
      if (isEditing) {
        // Update existing player
        await updatePlayer(playerId, playerData);
        setLoading(false);
        if (onSuccess) onSuccess('Player updated successfully!');
      } else {
        // Create new player
        const newPlayer = await addPlayer(playerData);
        setLoading(false);
        
        // Reset form
        setFormData(initialFormData);
        setPreviewUrl('');
        setImageFile(null);
        
        // Callback
        if (onSuccess) onSuccess('Player created successfully!');
      }
    } catch (error) {
      console.error('Error saving player:', error);
      setFormErrors({ _general: isEditing ? 'Failed to update player' : 'Failed to create player' });
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isEditing) {
      // If editing, ask for confirmation before discarding changes
      if (window.confirm('Are you sure you want to discard changes?')) {
        if (onCancel) onCancel();
      }
    } else {
      // Clear form
      setFormData(initialFormData);
      setPreviewUrl('');
      setImageFile(null);
      setFormErrors({});
      
      // Reset file input
      const fileInput = document.querySelector("input[type='file']");
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  if (initialLoading) {
    return <Loading text="Loading player data..." />;
  }

  return (
    <Card title={isEditing ? 'Edit Player' : 'Create New Player'}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Player Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Player Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
              ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`}
            value={formData.name}
            onChange={handleChange}
            required
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>
        
        {/* Player Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
              ${formErrors.role ? 'border-red-300' : 'border-gray-300'}`}
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            {roleOptions.map((role, index) => (
              <option key={index} value={role}>{role}</option>
            ))}
          </select>
          {formErrors.role && (
            <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
          )}
        </div>
        
        {/* Base Price */}
        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
            Base Price
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              min="0"
              step="100000"
              className={`block w-full pl-7 pr-12 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                ${formErrors.basePrice ? 'border-red-300' : 'border-gray-300'}`}
              value={formData.basePrice}
              onChange={handleChange}
            />
          </div>
          {formErrors.basePrice ? (
            <p className="mt-1 text-sm text-red-600">{formErrors.basePrice}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Default base price is 1,000 credits
            </p>
          )}
        </div>
        
        {/* Player Status (only show when editing) */}
        {isEditing && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                ${formErrors.status ? 'border-red-300' : 'border-gray-300'}`}
              value={formData.status}
              onChange={handleChange}
            >
              {statusOptions.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Sold Amount (only show when status is 'sold') */}
        {isEditing && formData.status === 'sold' && (
          <div>
            <label htmlFor="soldAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Sold Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="soldAmount"
                name="soldAmount"
                min="0"
                step="100000"
                className={`block w-full pl-7 pr-12 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                  ${formErrors.soldAmount ? 'border-red-300' : 'border-gray-300'}`}
                value={formData.soldAmount}
                onChange={handleChange}
              />
            </div>
            {formErrors.soldAmount && (
              <p className="mt-1 text-sm text-red-600">{formErrors.soldAmount}</p>
            )}
          </div>
        )}
        
        {/* Player Image */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Player Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0 file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
              ${formErrors.imageUrl ? 'border-red-300' : 'border-gray-300'}`}
            onChange={handleFileChange}
          />
          {formErrors.imageUrl && (
            <p className="mt-1 text-sm text-red-600">{formErrors.imageUrl}</p>
          )}
          
          {/* Image Preview with hover-to-enlarge functionality */}
          {previewUrl && (
            <div className="mt-2 flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Image Preview" 
                  className="h-20 w-20 rounded-full object-cover bg-gray-100 border border-gray-200 hover:w-40 hover:h-40 hover:rounded-md transition-all cursor-pointer"
                  onClick={() => window.open(previewUrl, '_blank')}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="8.5" cy="8.5" r="1.5"%3e%3c/circle%3e%3cpolyline points="21 15 16 10 5 21"%3e%3c/polyline%3e%3c/svg%3e';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
        
        {/* General Form Error */}
        {formErrors._general && (
          <ErrorMessage message={formErrors._general} />
        )}
        
        {/* Submit and Reset Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            {isEditing ? 'Cancel' : 'Reset'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText={isEditing ? 'Updating...' : 'Creating...'}
          >
            {isEditing ? 'Update Player' : 'Create Player'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PlayerForm;