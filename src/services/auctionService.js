// src/services/auctionService.js
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp, 
    runTransaction
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  import { updatePlayerStatus } from './playerService';
  
  const auctionCollection = collection(db, 'auction');
  const auctionSettingsDoc = doc(db, 'auction', 'settings');
  const bidsCollection = collection(db, 'bids');
  const teamsCollection = collection(db, 'teams');
  
  // Initialize auction settings
  export const initializeAuction = async () => {
    try {
      // Check if settings document exists
      const settingsDoc = await getDoc(auctionSettingsDoc);
      
      if (settingsDoc.exists()) {
        // Update existing settings
        await updateDoc(auctionSettingsDoc, {
          updatedAt: serverTimestamp()
        });
        return { ...settingsDoc.data() };
      } else {
        // Create new settings document
        const settings = {
          isActive: false,
          currentPlayerId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(auctionSettingsDoc, settings);
        return settings;
      }
    } catch (error) {
      console.error('Error initializing auction:', error);
      throw error;
    }
  };
  
  // Get auction settings
  export const getAuctionSettings = async () => {
    try {
      const settingsDoc = await getDoc(auctionSettingsDoc);
      
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      } else {
        // Create default settings if none exist
        return initializeAuction();
      }
    } catch (error) {
      console.error('Error getting auction settings:', error);
      throw error;
    }
  };
  
  // Record a bid
  export const recordBid = async (playerId, teamId, bidAmount) => {
    try {
      // Get team details for the bid record
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const team = teamDoc.data();
      
      // Check if team has enough budget
      if (team.wallet < bidAmount) {
        throw new Error('Insufficient team budget');
      }
      
      // Record the bid
      const bid = {
        playerId,
        teamId,
        teamName: team.name,
        amount: bidAmount,
        timestamp: serverTimestamp()
      };
      
      const bidRef = await addDoc(bidsCollection, bid);
      return { id: bidRef.id, ...bid };
    } catch (error) {
      console.error('Error recording bid:', error);
      throw error;
    }
  };
  
  // Get bids for a player
  export const getPlayerBids = async (playerId) => {
    try {
      const q = query(
        bidsCollection, 
        where("playerId", "==", playerId),
        orderBy("amount", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting player bids:', error);
      throw error;
    }
  };
  
  // Get the highest bid for a player
  export const getHighestBid = async (playerId) => {
    try {
      const bids = await getPlayerBids(playerId);
      
      if (bids.length === 0) {
        return null;
      }
      
      // Bids are already ordered by amount descending
      return bids[0];
    } catch (error) {
      console.error('Error getting highest bid:', error);
      throw error;
    }
  };
  
  // Complete player sale - Updated to use a transaction for atomicity
  export const completePlayerSale = async (playerId, teamId, soldAmount) => {
    try {
      // Use a transaction to ensure both the player status update and team wallet update happen atomically
      await runTransaction(db, async (transaction) => {
        // Get team document reference
        const teamRef = doc(db, 'teams', teamId);
        const teamDoc = await transaction.get(teamRef);
        
        if (!teamDoc.exists()) {
          throw new Error('Team not found');
        }
        
        const team = teamDoc.data();
        
        // Check if team has enough funds
        if (team.wallet < soldAmount) {
          throw new Error('Team does not have sufficient funds for this purchase');
        }
        
        // Get player document reference
        const playerRef = doc(db, 'players', playerId);
        const playerDoc = await transaction.get(playerRef);
        
        if (!playerDoc.exists()) {
          throw new Error('Player not found');
        }
        
        // Calculate new wallet amount
        const newWalletAmount = team.wallet - soldAmount;
        
        // Update team - deduct the sold amount from wallet and add player to team's players array
        transaction.update(teamRef, {
          wallet: newWalletAmount,
          players: [...(team.players || []), playerId],
          updatedAt: serverTimestamp()
        });
        
        // Update player - mark as sold and record team and amount
        transaction.update(playerRef, {
          status: 'sold',
          soldTo: teamId,
          soldToTeam: team.name, // Store team name for easier reference
          soldAmount: soldAmount,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error completing player sale:', error);
      throw error;
    }
  };
  
  // Mark player as unsold
  export const markPlayerAsUnsold = async (playerId) => {
    try {
      await updatePlayerStatus(playerId, 'unsold');
      return { success: true };
    } catch (error) {
      console.error('Error marking player as unsold:', error);
      throw error;
    }
  };
  
  export default {
    initializeAuction,
    getAuctionSettings,
    recordBid,
    getPlayerBids,
    getHighestBid,
    completePlayerSale,
    markPlayerAsUnsold
  };