// src/components/teams/TeamForm.jsx
import React, { useState, useEffect } from 'react';
import { createTeam, updateTeam, getTeam } from '../../services/teamService';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

const TeamForm = ({ teamId = null, onSuccess = null, onCancel = null }) => {
  const initialFormData = {
    name: '',
    owner1: '',
    owner2: '',
    owner3: '',
    captain: '',
    womanCaptain: '',
    wallet: 10000,
    logoUrl: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  
  // Load team data if editing
  useEffect(() => {
    const loadTeam = async () => {
      if (!teamId) return;
      
      try {
        setInitialLoading(true);
        const teamData = await getTeam(teamId);
        setFormData({
          name: teamData.name || '',
          owner1: teamData.owner1 || '',
          owner2: teamData.owner2 || '',
          owner3: teamData.owner3 || '',
          captain: teamData.captain || '',
          womanCaptain: teamData.womanCaptain || '',
          wallet: teamData.wallet || 10000,
          logoUrl: teamData.logoUrl || ''
        });
        
        if (teamData.logoUrl) {
          setPreviewUrl(teamData.logoUrl);
        }
        
        setIsEditing(true);
        setInitialLoading(false);
      } catch (error) {
        console.error('Error loading team:', error);
        setFormErrors({ _general: 'Failed to load team data' });
        setInitialLoading(false);
      }
    };
    
    loadTeam();
  }, [teamId]);

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
        logoUrl: 'Please select an image file'
      }));
      return;
    }
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setLogoFile(file);
    
    setFormErrors(prev => ({
      ...prev,
      logoUrl: null
    }));
  };

  const handleRemoveImage = () => {
    setLogoFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    
    // Reset file input
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Team name is required';
    }
    
    if (formData.wallet <= 0) {
      errors.wallet = 'Wallet amount must be greater than 0';
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
      
      let logoUrl = formData.logoUrl;
      
      // Upload logo to Firebase Storage if a new logo file is selected
      if (logoFile && storage) {
        const timestamp = Date.now();
        const imageRef = ref(storage, `teamLogos/${formData.name.replace(/\s+/g, '_')}_${timestamp}`);
        
        // Upload the image file
        const snapshot = await uploadBytes(imageRef, logoFile);
        
        // Get the download URL
        logoUrl = await getDownloadURL(snapshot.ref);
      }
      
      const teamData = {
        ...formData,
        logoUrl: logoUrl
      };
      
      if (isEditing) {
        // Update existing team
        await updateTeam(teamId, teamData);
        setLoading(false);
        if (onSuccess) onSuccess('Team updated successfully!');
      } else {
        // Create new team
        const newTeam = await createTeam(teamData);
        setLoading(false);
        
        // Reset form
        setFormData(initialFormData);
        setPreviewUrl('');
        setLogoFile(null);
        
        // Callback
        if (onSuccess) onSuccess('Team created successfully!');
      }
    } catch (error) {
      console.error('Error saving team:', error);
      setFormErrors({ _general: isEditing ? 'Failed to update team' : 'Failed to create team' });
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
      setLogoFile(null);
      setFormErrors({});
      
      // Reset file input
      const fileInput = document.querySelector("input[type='file']");
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  if (initialLoading) {
    return <Loading text="Loading team data..." />;
  }

  return (
    <div className="py-2">
      <form onSubmit={handleSubmit} className="space-y-3 px-1">
        {/* Team Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name *
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
        
        {/* Franchise Owner 1 */}
        <div>
          <label htmlFor="owner1" className="block text-sm font-medium text-gray-700 mb-1">
            Owner 1
          </label>
          <input
            type="text"
            id="owner1"
            name="owner1"
            className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            value={formData.owner1}
            onChange={handleChange}
          />
        </div>
        
        {/* Franchise Owner 2 */}
        <div>
          <label htmlFor="owner2" className="block text-sm font-medium text-gray-700 mb-1">
            Owner 2
          </label>
          <input
            type="text"
            id="owner2"
            name="owner2"
            className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            value={formData.owner2}
            onChange={handleChange}
          />
        </div>
        
        {/* Franchise Owner 3 */}
        <div>
          <label htmlFor="owner3" className="block text-sm font-medium text-gray-700 mb-1">
            Owner 3
          </label>
          <input
            type="text"
            id="owner3"
            name="owner3"
            className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            value={formData.owner3}
            onChange={handleChange}
          />
        </div>
        
        {/* Team Captain */}
        <div>
          <label htmlFor="captain" className="block text-sm font-medium text-gray-700 mb-1">
            Team Captain
          </label>
          <input
            type="text"
            id="captain"
            name="captain"
            className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            value={formData.captain}
            onChange={handleChange}
          />
        </div>
        
        {/* Woman Captain */}
        <div>
          <label htmlFor="womanCaptain" className="block text-sm font-medium text-gray-700 mb-1">
            Woman Captain
          </label>
          <input
            type="text"
            id="womanCaptain"
            name="womanCaptain"
            className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            value={formData.womanCaptain}
            onChange={handleChange}
          />
        </div>
        
        {/* Wallet Amount */}
        <div>
          <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 mb-1">
            Initial Wallet Amount
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="wallet"
              name="wallet"
              min="0"
              step="1000"
              className={`block w-full pl-7 pr-12 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                ${formErrors.wallet ? 'border-red-300' : 'border-gray-300'}`}
              value={formData.wallet}
              onChange={handleChange}
            />
          </div>
          {formErrors.wallet ? (
            <p className="mt-1 text-sm text-red-600">{formErrors.wallet}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Default wallet amount is ₹10,000
            </p>
          )}
        </div>
        
        {/* Team Logo */}
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
            Team Logo
          </label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0 file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
              ${formErrors.logoUrl ? 'border-red-300' : 'border-gray-300'}`}
            onChange={handleFileChange}
          />
          {formErrors.logoUrl && (
            <p className="mt-1 text-sm text-red-600">{formErrors.logoUrl}</p>
          )}
          
          {/* Logo Preview */}
          {previewUrl && (
            <div className="mt-2 flex items-center space-x-4">
              <div>
                <img 
                  src={previewUrl} 
                  alt="Logo Preview" 
                  className="h-16 w-16 rounded-full object-cover border border-gray-200"
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
                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-xs"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        
        {/* General Form Error */}
        {formErrors._general && (
          <ErrorMessage message={formErrors._general} />
        )}
        
        {/* Submit and Reset Buttons */}
        <div className="flex justify-end space-x-2 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={loading}
            size="sm"
          >
            {isEditing ? 'Cancel' : 'Reset'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText={isEditing ? 'Updating...' : 'Creating...'}
            size="sm"
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;