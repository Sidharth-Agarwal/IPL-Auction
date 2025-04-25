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
    throw error;
  }
};

// Get players by status
export const getPlayersByStatus = async (status) => {
  try {
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
    throw error;
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
      throw new Error("Player not found");
    }
  } catch (error) {
    console.error("Error getting player:", error);
    throw error;
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