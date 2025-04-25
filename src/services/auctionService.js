// src/services/auctionService.js
import { db } from "../firebase/config";
import { 
  collection, 
  doc,
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  limit,
  setDoc
} from "firebase/firestore";

import { markPlayerAsSold } from "./playerService";
import { addPlayerToTeam } from "./teamService";

const auctionSettingsRef = doc(db, "auction", "settings");
const bidsCollection = collection(db, "auction", "bids", "allBids");

// Initialize auction settings
export const initializeAuction = async (settings = {}) => {
  try {
    const settingsData = {
      isActive: false,
      currentPlayerId: null,
      minBidIncrement: settings.minBidIncrement || 100,
      basePriceMultiplier: settings.basePriceMultiplier || 1.0,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(auctionSettingsRef, settingsData);
    return settingsData;
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === 'not-found') {
      const settingsData = {
        isActive: false,
        currentPlayerId: null,
        minBidIncrement: settings.minBidIncrement || 100,
        basePriceMultiplier: settings.basePriceMultiplier || 1.0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(auctionSettingsRef, settingsData);
      return settingsData;
    }
    
    console.error("Error initializing auction:", error);
    throw error;
  }
};

// Get auction settings
export const getAuctionSettings = async () => {
  try {
    const docSnap = await getDoc(auctionSettingsRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Auction settings not found");
    }
  } catch (error) {
    console.error("Error getting auction settings:", error);
    throw error;
  }
};

// Listen to auction settings changes in real-time
export const subscribeToAuctionSettings = (callback) => {
  return onSnapshot(auctionSettingsRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  });
};

// Start auction for a player
export const startPlayerAuction = async (playerId) => {
  try {
    await updateDoc(auctionSettingsRef, {
      isActive: true,
      currentPlayerId: playerId,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error starting player auction:", error);
    throw error;
  }
};

// End current player auction
export const endPlayerAuction = async () => {
  try {
    await updateDoc(auctionSettingsRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error ending player auction:", error);
    throw error;
  }
};

// Place a bid
export const placeBid = async (playerId, teamId, amount) => {
  try {
    // First get auction settings to check if auction is active
    const settings = await getAuctionSettings();
    
    if (!settings.isActive || settings.currentPlayerId !== playerId) {
      throw new Error("Auction is not active for this player");
    }
    
    // Get the highest bid so far
    const highestBid = await getHighestBid(playerId);
    
    // Check if the bid is higher than the current highest bid + min increment
    if (highestBid && amount < (highestBid.amount + settings.minBidIncrement)) {
      throw new Error(`Bid must be at least ${highestBid.amount + settings.minBidIncrement}`);
    }
    
    // Add the bid
    const bid = {
      playerId,
      teamId,
      amount,
      timestamp: serverTimestamp()
    };
    
    await addDoc(bidsCollection, bid);
    return { success: true, bid };
  } catch (error) {
    console.error("Error placing bid:", error);
    throw error;
  }
};

// Get the highest bid for a player
export const getHighestBid = async (playerId) => {
  try {
    const q = query(
      bidsCollection,
      where("playerId", "==", playerId),
      orderBy("amount", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const highestBid = querySnapshot.docs[0];
    return {
      id: highestBid.id,
      ...highestBid.data()
    };
  } catch (error) {
    console.error("Error getting highest bid:", error);
    throw error;
  }
};

// Get all bids for a player
export const getPlayerBids = async (playerId) => {
  try {
    const q = query(
      bidsCollection,
      where("playerId", "==", playerId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting player bids:", error);
    throw error;
  }
};

// Listen to bids for a player in real-time
export const subscribeToPlayerBids = (playerId, callback) => {
  const q = query(
    bidsCollection,
    where("playerId", "==", playerId),
    orderBy("timestamp", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const bids = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bids);
  });
};

// Complete the sale of a player
export const completePlayerSale = async (playerId) => {
  try {
    // Get the highest bid
    const highestBid = await getHighestBid(playerId);
    
    if (!highestBid) {
      throw new Error("No bids found for this player");
    }
    
    // Mark player as sold
    await markPlayerAsSold(playerId, highestBid.teamId, highestBid.amount);
    
    // Add player to the team and deduct wallet
    await addPlayerToTeam(highestBid.teamId, playerId, highestBid.amount);
    
    // End the auction for this player
    await endPlayerAuction();
    
    return { 
      success: true,
      teamId: highestBid.teamId,
      amount: highestBid.amount 
    };
  } catch (error) {
    console.error("Error completing player sale:", error);
    throw error;
  }
};

// Get a summary of all sold players
export const getSoldPlayersSummary = async () => {
  try {
    const q = query(
      collection(db, "players"),
      where("status", "==", "sold"),
      orderBy("soldAmount", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting sold players summary:", error);
    throw error;
  }
};