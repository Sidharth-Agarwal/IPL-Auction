import { 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const teamsCollection = collection(db, 'teams');

// Create a new team
export const createTeam = async (teamData) => {
    try {
    const team = {
        name: teamData.name,
        owner1: teamData.owner1 || '',
        owner2: teamData.owner2 || '',
        owner3: teamData.owner3 || '',
        captain: teamData.captain || '',
        womanCaptain: teamData.womanCaptain || '',
        wallet: teamData.wallet || 10000,
        logoUrl: teamData.logoUrl || '',
        players: [],
        createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(teamsCollection, team);
    return { id: docRef.id, ...team };
    } catch (error) {
    console.error('Error creating team:', error);
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
    console.error('Error getting teams:', error);
    throw error;
    }
};

// Get a specific team
export const getTeam = async (teamId) => {
    try {
    const docRef = doc(db, 'teams', teamId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error('Team not found');
    }
    } catch (error) {
    console.error('Error getting team:', error);
    throw error;
    }
};

// Update team information
export const updateTeam = async (teamId, teamData) => {
    try {
    const teamRef = doc(db, 'teams', teamId);
    
    // Ensure we're not overwriting existing data
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) {
        throw new Error('Team not found');
    }
    
    // Prepare the update object with only the fields that are provided
    const updateData = {
        updatedAt: serverTimestamp()
    };
    
    // Add fields that are provided
    if (teamData.name !== undefined) updateData.name = teamData.name;
    if (teamData.owner1 !== undefined) updateData.owner1 = teamData.owner1;
    if (teamData.owner2 !== undefined) updateData.owner2 = teamData.owner2;
    if (teamData.owner3 !== undefined) updateData.owner3 = teamData.owner3;
    if (teamData.captain !== undefined) updateData.captain = teamData.captain;
    if (teamData.womanCaptain !== undefined) updateData.womanCaptain = teamData.womanCaptain;
    if (teamData.wallet !== undefined) updateData.wallet = teamData.wallet;
    if (teamData.logoUrl !== undefined) updateData.logoUrl = teamData.logoUrl;
    
    await updateDoc(teamRef, updateData);
    
    return { id: teamId, ...teamData };
    } catch (error) {
    console.error('Error updating team:', error);
    throw error;
    }
};

// Delete a team
export const deleteTeam = async (teamId) => {
    try {
    await deleteDoc(doc(db, 'teams', teamId));
    return { id: teamId };
    } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
    }
};

// Add player to team
export const addPlayerToTeam = async (teamId, playerId, soldAmount) => {
    try {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
        throw new Error('Team not found');
    }
    
    const team = teamDoc.data();
    
    // Check if team has enough budget
    if (team.wallet < soldAmount) {
        throw new Error('Insufficient team budget');
    }
    
    // Check if player is already in the team
    if (team.players && team.players.includes(playerId)) {
        throw new Error('Player already in team');
    }
    
    // Add player to team and update wallet
    await updateDoc(teamRef, {
        players: [...(team.players || []), playerId],
        wallet: team.wallet - soldAmount,
        updatedAt: serverTimestamp()
    });
    
    return { success: true };
    } catch (error) {
    console.error('Error adding player to team:', error);
    throw error;
    }
};

export default {
    createTeam,
    getAllTeams,
    getTeam,
    updateTeam,
    deleteTeam,
    addPlayerToTeam
};