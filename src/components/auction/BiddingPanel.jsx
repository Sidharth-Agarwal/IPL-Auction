// src/components/auction/BiddingPanel.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { BID_INCREMENTS } from '../../utils/constants';

const BiddingPanel = ({ 
  minBid, 
  onPlaceBid, 
  highestBid, 
  isHighestBidder = false,
  disabled = false
}) => {
  const [bidAmount, setBidAmount] = useState(minBid);
  const [quickIncrement, setQuickIncrement] = useState(100);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Update bid amount when minBid changes
  useEffect(() => {
    setBidAmount(minBid);
    setErrorMessage(null);
  }, [minBid]);
  
  // Calculate quick increment amounts based on current minBid
  useEffect(() => {
    // Find the appropriate increment based on the current min bid
    for (const { threshold, increment } of BID_INCREMENTS) {
      if (minBid < threshold) {
        setQuickIncrement(increment);
        break;
      }
    }
    
    // If minBid is higher than all thresholds, use the highest increment
    if (minBid >= BID_INCREMENTS[BID_INCREMENTS.length - 1].threshold) {
      setQuickIncrement(BID_INCREMENTS[BID_INCREMENTS.length - 1].increment);
    }
  }, [minBid]);

  const handleBidChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setBidAmount(value);
      
      // Clear error if valid
      if (value >= minBid) {
        setErrorMessage(null);
      } else {
        setErrorMessage(`Bid must be at least ${formatCurrency(minBid)}`);
      }
    }
  };

  const handleQuickIncrement = (amount) => {
    const newAmount = bidAmount + amount;
    setBidAmount(newAmount);
    setErrorMessage(null);
  };

  const handleSubmitBid = async () => {
    // Validate bid amount
    if (bidAmount < minBid) {
      setErrorMessage(`Bid must be at least ${formatCurrency(minBid)}`);
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage(null);
      
      await onPlaceBid(bidAmount);
      
      // Bidding panel will be updated automatically via subscription
    } catch (error) {
      console.error("Error placing bid:", error);
      setErrorMessage(error.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Place Your Bid">
      {isHighestBidder ? (
        <div className="bg-green-50 p-4 mb-4 rounded-md text-center">
          <p className="text-green-700 font-medium">You are currently the highest bidder!</p>
          <p className="text-green-600 text-sm">Your bid: {formatCurrency(highestBid?.amount || 0)}</p>
        </div>
      ) : disabled && !isHighestBidder ? (
        <div className="bg-yellow-50 p-4 mb-4 rounded-md text-center">
          <p className="text-yellow-700 font-medium">
            {loading ? 'Processing your bid...' : 'You don\'t have enough wallet balance to place a bid.'}
          </p>
        </div>
      ) : null}
      
      <div className="space-y-4 p-4">
        {/* Bid Input */}
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Your Bid Amount (min: {formatCurrency(minBid)})
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="bidAmount"
              id="bidAmount"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md
                ${errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="0"
              value={bidAmount}
              onChange={handleBidChange}
              min={minBid}
              step="100"
              disabled={disabled || isHighestBidder || loading}
            />
          </div>
          {errorMessage && (
            <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>
        
        {/* Quick Increment Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            onClick={() => handleQuickIncrement(quickIncrement)}
            disabled={disabled || isHighestBidder || loading}
            size="sm"
          >
            +{formatCurrency(quickIncrement, '')}
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleQuickIncrement(quickIncrement * 2)}
            disabled={disabled || isHighestBidder || loading}
            size="sm"
          >
            +{formatCurrency(quickIncrement * 2, '')}
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleQuickIncrement(quickIncrement * 5)}
            disabled={disabled || isHighestBidder || loading}
            size="sm"
          >
            +{formatCurrency(quickIncrement * 5, '')}
          </Button>
        </div>
        
        {/* Place Bid Button */}
        <Button
          variant="primary"
          onClick={handleSubmitBid}
          disabled={disabled || isHighestBidder || loading || bidAmount < minBid}
          loading={loading}
          loadingText="Placing Bid..."
          fullWidth
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          Place Bid
        </Button>
        
        {/* Current High Bid */}
        {highestBid && (
          <div className="pt-4 mt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current highest bid:</span>
              <span className="font-semibold text-green-700">{formatCurrency(highestBid.amount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Required increment:</span>
              <span className="font-semibold">{formatCurrency(quickIncrement)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

BiddingPanel.propTypes = {
  minBid: PropTypes.number.isRequired,
  onPlaceBid: PropTypes.func.isRequired,
  highestBid: PropTypes.shape({
    id: PropTypes.string,
    teamId: PropTypes.string,
    amount: PropTypes.number,
    timestamp: PropTypes.any
  }),
  isHighestBidder: PropTypes.bool,
  disabled: PropTypes.bool
};

export default BiddingPanel;