// src/services/teamService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc,
    query,
    where
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { db, storage } from './firebaseConfig';
  
  export const teamService = {
    // Create a new team
    async createTeam(teamData, logoFile = null) {
      try {
        // Upload logo if provided
        let logoUrl = '';
        if (logoFile) {
          const storageRef = ref(storage, `team-logos/${Date.now()}_${logoFile.name}`);
          const snapshot = await uploadBytes(storageRef, logoFile);
          logoUrl = await getDownloadURL(snapshot.ref);
        }
  
        // Prepare team object
        const team = {
          name: teamData.name,
          wallet: parseFloat(teamData.wallet) || 0,
          logoUrl: logoUrl,
          players: [], // Initially empty, can be updated later
          createdAt: new Date()
        };
  
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'teams'), team);
        return { id: docRef.id, ...team };
      } catch (error) {
        console.error('Error creating team:', error);
        throw error;
      }
    },
  
    // Get all teams
    async getAllTeams() {
      try {
        const teamsCollection = collection(db, 'teams');
        const snapshot = await getDocs(teamsCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
    },
  
    // Update a team
    async updateTeam(teamId, updateData, newLogoFile = null) {
      try {
        const teamRef = doc(db, 'teams', teamId);
        
        // Handle logo upload if new logo provided
        if (newLogoFile) {
          const storageRef = ref(storage, `team-logos/${Date.now()}_${newLogoFile.name}`);
          const snapshot = await uploadBytes(storageRef, newLogoFile);
          updateData.logoUrl = await getDownloadURL(snapshot.ref);
        }
  
        // Update Firestore document
        await updateDoc(teamRef, updateData);
        return { id: teamId, ...updateData };
      } catch (error) {
        console.error('Error updating team:', error);
        throw error;
      }
    },
  
    // Delete a team
    async deleteTeam(teamId) {
      try {
        const teamRef = doc(db, 'teams', teamId);
        await deleteDoc(teamRef);
        return teamId;
      } catch (error) {
        console.error('Error deleting team:', error);
        throw error;
      }
    },
  
    // Add a player to a team
    async addPlayerToTeam(teamId, playerId) {
      try {
        const teamRef = doc(db, 'teams', teamId);
        
        // Update team's players array
        await updateDoc(teamRef, {
          players: firebase.firestore.FieldValue.arrayUnion(playerId)
        });
  
        return playerId;
      } catch (error) {
        console.error('Error adding player to team:', error);
        throw error;
      }
    },
  
    // Remove a player from a team
    async removePlayerFromTeam(teamId, playerId) {
      try {
        const teamRef = doc(db, 'teams', teamId);
        
        // Remove player from team's players array
        await updateDoc(teamRef, {
          players: firebase.firestore.FieldValue.arrayRemove(playerId)
        });
  
        return playerId;
      } catch (error) {
        console.error('Error removing player from team:', error);
        throw error;
      }
    },
  
    // Update team wallet
    async updateTeamWallet(teamId, amount) {
      try {
        const teamRef = doc(db, 'teams', teamId);
        
        // Update team's wallet
        await updateDoc(teamRef, {
          wallet: firebase.firestore.FieldValue.increment(amount)
        });
  
        return amount;
      } catch (error) {
        console.error('Error updating team wallet:', error);
        throw error;
      }
    }
  };