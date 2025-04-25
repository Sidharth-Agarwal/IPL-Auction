// src/components/auction/BiddingPanel.js
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

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

  // Update bid amount when minBid changes
  useEffect(() => {
    setBidAmount(minBid);
  }, [minBid]);
  
  // Calculate quick increment amounts based on current minBid
  useEffect(() => {
    // Set quick increment to approximately 5-10% of the current min bid
    if (minBid < 1000) {
      setQuickIncrement(100);
    } else if (minBid < 5000) {
      setQuickIncrement(500);
    } else if (minBid < 10000) {
      setQuickIncrement(1000);
    } else {
      setQuickIncrement(2000);
    }
  }, [minBid]);

  const handleBidChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minBid) {
      setBidAmount(value);
    }
  };

  const handleQuickIncrement = (amount) => {
    setBidAmount(prevAmount => prevAmount + amount);
  };

  const handleSubmitBid = async () => {
    if (bidAmount < minBid) {
      return;
    }
    
    try {
      setLoading(true);
      await onPlaceBid(bidAmount);
    } catch (error) {
      console.error("Error placing bid:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Place Your Bid">
      {isHighestBidder ? (
        <div className="bg-green-50 p-4 mb-4 rounded-md text-center">
          <p className="text-green-700 font-medium">You are currently the highest bidder!</p>
        </div>
      ) : disabled ? (
        <div className="bg-yellow-50 p-4 mb-4 rounded-md text-center">
          <p className="text-yellow-700 font-medium">
            You don't have enough wallet balance to place a bid.
          </p>
        </div>
      ) : null}
      
      <div className="space-y-4">
        {/* Bid Input */}
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Your Bid Amount (min: ${minBid.toLocaleString()})
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="bidAmount"
              id="bidAmount"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0"
              value={bidAmount}
              onChange={handleBidChange}
              min={minBid}
              step="100"
              disabled={disabled || isHighestBidder || loading}
            />
          </div>
        </div>
        
        {/* Quick Increment Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            onClick={() => handleQuickIncrement(quickIncrement)}
            disabled={disabled || isHighestBidder || loading}
            size="sm"
          >
            +{quickIncrement.toLocaleString()}
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleQuickIncrement(quickIncrement * 2)}
            disabled={disabled || isHighestBidder || loading}
            size="sm"
          >
            +{(quickIncrement * 2).toLocaleString()}
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleQuickIncrement(quickIncrement * 5)}
            disabled={disabled || isHighestBidder || loading}
            size="sm"
          >
            +{(quickIncrement * 5).toLocaleString()}
          </Button>
        </div>
        
        {/* Place Bid Button */}
        <Button
          variant="primary"
          onClick={handleSubmitBid}
          disabled={disabled || isHighestBidder || loading || bidAmount < minBid}
          fullWidth
        >
          {loading ? 'Placing Bid...' : 'Place Bid'}
        </Button>
      </div>
    </Card>
  );
};

export default BiddingPanel;