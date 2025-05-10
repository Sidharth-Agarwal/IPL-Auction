import { 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const playersCollection = collection(db, 'players');

// Add a single player with updated fields
export const addPlayer = async (playerData) => {
    try {
    const player = {
        name: playerData.name || '',
        gender: playerData.gender || 'male', // Added gender field with default
        isCapped: playerData.isCapped || 'uncapped',
        playerType: playerData.playerType || '',
        specialization: playerData.specialization || '',
        battingStyle: playerData.battingStyle || '',
        ballingType: playerData.ballingType || '',
        basePrice: playerData.basePrice || 1000,
        battingInnings: playerData.battingInnings || 0,
        runs: playerData.runs || 0,
        battingAverage: playerData.battingAverage || 0,
        strikeRate: playerData.strikeRate || 0,
        ballingInnings: playerData.ballingInnings || 0,
        wickets: playerData.wickets || 0,
        ballingAverage: playerData.ballingAverage || 0,
        economy: playerData.economy || 0,
        imageUrl: playerData.imageUrl || '',
        status: 'available', // available, sold, unsold
        soldTo: null,
        soldAmount: 0,
        createdAt: serverTimestamp()
    };
    
    console.log('Adding player with gender:', player.gender); // Debug log
    const docRef = await addDoc(playersCollection, player);
    return { id: docRef.id, ...player };
    } catch (error) {
    console.error('Error adding player:', error);
    throw error;
    }
};

// Add multiple players (bulk import) with updated fields
export const addPlayers = async (playersArray) => {
    try {
    const results = [];
    
    for (const playerData of playersArray) {
        const player = {
        name: playerData.name || '',
        gender: playerData.gender || 'male', // Added gender field with default
        isCapped: playerData.isCapped || 'uncapped',
        playerType: playerData.playerType || '',
        specialization: playerData.specialization || '',
        battingStyle: playerData.battingStyle || '',
        ballingType: playerData.ballingType || '',
        basePrice: playerData.basePrice || 1000,
        battingInnings: playerData.battingInnings || 0,
        runs: playerData.runs || 0,
        battingAverage: playerData.battingAverage || 0,
        strikeRate: playerData.strikeRate || 0,
        ballingInnings: playerData.ballingInnings || 0,
        wickets: playerData.wickets || 0,
        ballingAverage: playerData.ballingAverage || 0,
        economy: playerData.economy || 0,
        imageUrl: playerData.imageUrl || '',
        status: 'available',
        soldTo: null,
        soldAmount: 0,
        createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(playersCollection, player);
        results.push({ id: docRef.id, ...player });
    }
    
    // Log gender distribution
    const genderCounts = results.reduce((acc, player) => {
        acc[player.gender] = (acc[player.gender] || 0) + 1;
        return acc;
    }, {});
    console.log(`Created ${results.length} players with gender distribution:`, genderCounts);
    
    return results;
    } catch (error) {
    console.error('Error adding players:', error);
    throw error;
    }
};

// Get all players
export const getAllPlayers = async () => {
    try {
    const querySnapshot = await getDocs(playersCollection);
    const players = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure gender field is present
        return {
            id: doc.id,
            ...data,
            gender: data.gender || 'male' // Default if missing
        };
    });
    
    // Log gender distribution
    const genderCounts = players.reduce((acc, player) => {
        acc[player.gender] = (acc[player.gender] || 0) + 1;
        return acc;
    }, {});
    console.log(`Retrieved ${players.length} players with gender distribution:`, genderCounts);
    
    return players;
    } catch (error) {
    console.error('Error getting players:', error);
    throw error;
    }
};

// Get available players for auction
export const getAvailablePlayers = async () => {
    try {
    const q = query(playersCollection, where("status", "==", "available"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure gender field is present
        return {
            id: doc.id,
            ...data,
            gender: data.gender || 'male' // Default if missing
        };
    });
    } catch (error) {
    console.error('Error getting available players:', error);
    throw error;
    }
};

// Get a specific player
export const getPlayer = async (playerId) => {
    try {
    const docRef = doc(db, 'players', playerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure gender field is present
        return { 
            id: docSnap.id, 
            ...data,
            gender: data.gender || 'male' // Default if missing
        };
    } else {
        throw new Error('Player not found');
    }
    } catch (error) {
    console.error('Error getting player:', error);
    throw error;
    }
};

// Update player information
export const updatePlayer = async (playerId, playerData) => {
    try {
    const playerRef = doc(db, 'players', playerId);
    
    // Ensure we're not overwriting existing data
    const playerDoc = await getDoc(playerRef);
    if (!playerDoc.exists()) {
        throw new Error('Player not found');
    }
    
    // Create update object with all fields that are provided
    const updateData = {
        updatedAt: serverTimestamp()
    };
    
    // Add each field if it's provided in playerData
    if (playerData.name !== undefined) updateData.name = playerData.name;
    if (playerData.gender !== undefined) updateData.gender = playerData.gender; // Added gender field
    if (playerData.isCapped !== undefined) updateData.isCapped = playerData.isCapped;
    if (playerData.playerType !== undefined) updateData.playerType = playerData.playerType;
    if (playerData.specialization !== undefined) updateData.specialization = playerData.specialization;
    if (playerData.battingStyle !== undefined) updateData.battingStyle = playerData.battingStyle;
    if (playerData.ballingType !== undefined) updateData.ballingType = playerData.ballingType;
    if (playerData.basePrice !== undefined) updateData.basePrice = playerData.basePrice;
    if (playerData.battingInnings !== undefined) updateData.battingInnings = playerData.battingInnings;
    if (playerData.runs !== undefined) updateData.runs = playerData.runs;
    if (playerData.battingAverage !== undefined) updateData.battingAverage = playerData.battingAverage;
    if (playerData.strikeRate !== undefined) updateData.strikeRate = playerData.strikeRate;
    if (playerData.ballingInnings !== undefined) updateData.ballingInnings = playerData.ballingInnings;
    if (playerData.wickets !== undefined) updateData.wickets = playerData.wickets;
    if (playerData.ballingAverage !== undefined) updateData.ballingAverage = playerData.ballingAverage;
    if (playerData.economy !== undefined) updateData.economy = playerData.economy;
    if (playerData.imageUrl !== undefined) updateData.imageUrl = playerData.imageUrl;
    if (playerData.status !== undefined) updateData.status = playerData.status;
    if (playerData.soldTo !== undefined) updateData.soldTo = playerData.soldTo;
    if (playerData.soldToTeam !== undefined) updateData.soldToTeam = playerData.soldToTeam;
    if (playerData.soldAmount !== undefined) updateData.soldAmount = playerData.soldAmount;
    
    console.log('Updating player with data:', updateData);
    await updateDoc(playerRef, updateData);
    
    return { id: playerId, ...updateData };
    } catch (error) {
    console.error('Error updating player:', error);
    throw error;
    }
};

// Update player status (sold/unsold)
export const updatePlayerStatus = async (playerId, status, data = {}) => {
    try {
    const playerRef = doc(db, 'players', playerId);
    
    // Ensure player exists
    const playerDoc = await getDoc(playerRef);
    if (!playerDoc.exists()) {
        throw new Error('Player not found');
    }
    
    // Update status and related fields
    const updateData = {
        status,
        updatedAt: serverTimestamp()
    };
    
    // If status is 'sold', add sold details
    if (status === 'sold' && data.soldTo) {
        updateData.soldTo = data.soldTo;
        updateData.soldAmount = data.soldAmount || 0;
    }
    
    // If status is 'unsold', clear sold details
    if (status === 'unsold') {
        updateData.soldTo = null;
        updateData.soldAmount = 0;
    }
    
    await updateDoc(playerRef, updateData);
    
    return { id: playerId, ...updateData };
    } catch (error) {
    console.error('Error updating player status:', error);
    throw error;
    }
};

// Delete a player
export const deletePlayer = async (playerId) => {
    try {
    await deleteDoc(doc(db, 'players', playerId));
    return { id: playerId };
    } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
    }
};

export default {
    addPlayer,
    addPlayers,
    getAllPlayers,
    getAvailablePlayers,
    getPlayer,
    updatePlayer,
    updatePlayerStatus,
    deletePlayer
};