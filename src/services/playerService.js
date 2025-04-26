// src/services/playerService.js
import { db } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";

const playersCollection = collection(db, "players");

// Add a single player
export const addPlayer = async (playerData) => {
  try {
    const player = {
      ...playerData,
      status: "available", // available, sold, unsold
      soldTo: null,
      soldAmount: 0,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(playersCollection, player);
    return { id: docRef.id, ...player };
  } catch (error) {
    console.error("Error adding player:", error);
    throw error;
  }
};

// Add multiple players (bulk import)
export const addPlayers = async (playersArray) => {
  try {
    const results = [];
    
    for (const playerData of playersArray) {
      const player = {
        ...playerData,
        status: "available",
        soldTo: null,
        soldAmount: 0,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(playersCollection, player);
      results.push({ id: docRef.id, ...player });
    }
    
    return results;
  } catch (error) {
    console.error("Error adding players:", error);
    throw error;
  }
};

// Get all players
export const getAllPlayers = async () => {
  try {
    const querySnapshot = await getDocs(playersCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting players:", error);
    return []; // Return empty array instead of throwing to prevent UI errors
  }
};

// Get players by status - UPDATED to handle index requirement
export const getPlayersByStatus = async (status) => {
  try {
    // Try using just the where clause without orderBy to avoid requiring the index
    const q = query(
      playersCollection, 
      where("status", "==", status)
      // orderBy removed to avoid requiring a composite index
    );
    
    const querySnapshot = await getDocs(q);
    const players = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort locally instead if needed
    players.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return a.createdAt.seconds - b.createdAt.seconds;
      }
      return 0;
    });
    
    return players;
  } catch (error) {
    console.error("Error getting players by status:", error);
    return []; // Return empty array instead of throwing to prevent UI errors
  }
};

// Alternative implementation with proper error handling and instructions for index creation
export const getPlayersByStatusWithIndex = async (status) => {
  try {
    // This query requires a composite index on Firestore
    const q = query(
      playersCollection, 
      where("status", "==", status),
      orderBy("createdAt")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting players by status:", error);
    
    // Handle the specific index error and provide clearer instructions
    if (error.code === 'failed-precondition' && error.message.includes('requires an index')) {
      console.info('This query requires a Firestore index. Please create the index by visiting the URL in the error message above.');
    }
    
    return []; // Return empty array instead of throwing to prevent UI errors
  }
};

// Get a specific player
export const getPlayer = async (playerId) => {
  try {
    const docRef = doc(db, "players", playerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn(`Player with ID ${playerId} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error getting player:", error);
    return null; // Return null instead of throwing
  }
};

// Update player information
export const updatePlayer = async (playerId, playerData) => {
  try {
    const playerRef = doc(db, "players", playerId);
    await updateDoc(playerRef, playerData);
    return { id: playerId, ...playerData };
  } catch (error) {
    console.error("Error updating player:", error);
    throw error;
  }
};

// Mark player as sold
export const markPlayerAsSold = async (playerId, teamId, amount) => {
  try {
    const playerRef = doc(db, "players", playerId);
    await updateDoc(playerRef, {
      status: "sold",
      soldTo: teamId,
      soldAmount: amount
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking player as sold:", error);
    throw error;
  }
};

// Mark player as unsold
export const markPlayerAsUnsold = async (playerId) => {
  try {
    const playerRef = doc(db, "players", playerId);
    await updateDoc(playerRef, {
      status: "unsold",
      soldTo: null,
      soldAmount: 0
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking player as unsold:", error);
    throw error;
  }
};

// Delete a player
export const deletePlayer = async (playerId) => {
  try {
    await deleteDoc(doc(db, "players", playerId));
    return playerId;
  } catch (error) {
    console.error("Error deleting player:", error);
    throw error;
  }
};