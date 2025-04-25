// src/services/teamService.js
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
  increment
} from "firebase/firestore";

const teamsCollection = collection(db, "teams");

// Create a new team
export const createTeam = async (teamData) => {
  try {
    // Set initial wallet balance
    const team = {
      ...teamData,
      wallet: teamData.wallet || 10000, // Default wallet balance
      players: [],
      createdAt: new Date()
    };
    
    const docRef = await addDoc(teamsCollection, team);
    return { id: docRef.id, ...team };
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

// Get all teams
export const getAllTeams = async () => {
  try {
    const querySnapshot = await getDocs(teamsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting teams:", error);
    throw error;
  }
};

// Get a specific team
export const getTeam = async (teamId) => {
  try {
    const docRef = doc(db, "teams", teamId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Team not found");
    }
  } catch (error) {
    console.error("Error getting team:", error);
    throw error;
  }
};

// Update team information
export const updateTeam = async (teamId, teamData) => {
  try {
    const teamRef = doc(db, "teams", teamId);
    await updateDoc(teamRef, teamData);
    return { id: teamId, ...teamData };
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
};

// Delete a team
export const deleteTeam = async (teamId) => {
  try {
    await deleteDoc(doc(db, "teams", teamId));
    return teamId;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};

// Add player to team and update wallet
export const addPlayerToTeam = async (teamId, playerId, biddingAmount) => {
  try {
    const teamRef = doc(db, "teams", teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error("Team not found");
    }
    
    const team = teamDoc.data();
    
    // Check if team has enough money
    if (team.wallet < biddingAmount) {
      throw new Error("Insufficient funds in team wallet");
    }
    
    // Update team with new player and deduct wallet amount
    await updateDoc(teamRef, {
      players: [...team.players, playerId],
      wallet: increment(-biddingAmount)
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding player to team:", error);
    throw error;
  }
};