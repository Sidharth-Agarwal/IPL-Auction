// src/services/playerService.js
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
  import Papa from 'papaparse';
  
  export const playerService = {
    // Import players from CSV
    async importPlayersFromCSV(file) {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const importedPlayers = [];
              for (const playerData of results.data) {
                // Validate and transform player data
                const player = {
                  name: playerData.name || '',
                  basePrice: parseFloat(playerData.basePrice) || 0,
                  category: playerData.category || '',
                  status: 'available',
                  stats: {
                    matches: parseInt(playerData.matches) || 0,
                    runs: parseInt(playerData.runs) || 0,
                    average: parseFloat(playerData.average) || 0
                  },
                  createdAt: new Date()
                };
  
                // Add player to Firestore
                const docRef = await addDoc(collection(db, 'players'), player);
                importedPlayers.push({ id: docRef.id, ...player });
              }
              resolve(importedPlayers);
            } catch (error) {
              reject(error);
            }
          },
          error: (error) => reject(error)
        });
      });
    },
  
    // Create a single player
    async createPlayer(playerData, imageFile = null) {
      try {
        // Upload image if provided
        let imageUrl = '';
        if (imageFile) {
          const storageRef = ref(storage, `players/${Date.now()}_${imageFile.name}`);
          const snapshot = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(snapshot.ref);
        }
  
        // Prepare player object
        const player = {
          name: playerData.name,
          basePrice: parseFloat(playerData.basePrice) || 0,
          category: playerData.category,
          status: 'available',
          imageUrl: imageUrl,
          stats: {
            matches: parseInt(playerData.matches) || 0,
            runs: parseInt(playerData.runs) || 0,
            average: parseFloat(playerData.average) || 0
          },
          createdAt: new Date()
        };
  
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'players'), player);
        return { id: docRef.id, ...player };
      } catch (error) {
        console.error('Error creating player:', error);
        throw error;
      }
    },
  
    // Get all players
    async getAllPlayers() {
      try {
        const playersCollection = collection(db, 'players');
        const snapshot = await getDocs(playersCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching players:', error);
        throw error;
      }
    },
  
    // Update a player
    async updatePlayer(playerId, updateData, newImageFile = null) {
      try {
        const playerRef = doc(db, 'players', playerId);
        
        // Handle image upload if new image provided
        if (newImageFile) {
          const storageRef = ref(storage, `players/${Date.now()}_${newImageFile.name}`);
          const snapshot = await uploadBytes(storageRef, newImageFile);
          updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }
  
        // Update Firestore document
        await updateDoc(playerRef, updateData);
        return { id: playerId, ...updateData };
      } catch (error) {
        console.error('Error updating player:', error);
        throw error;
      }
    },
  
    // Delete a player
    async deletePlayer(playerId) {
      try {
        const playerRef = doc(db, 'players', playerId);
        await deleteDoc(playerRef);
        return playerId;
      } catch (error) {
        console.error('Error deleting player:', error);
        throw error;
      }
    },
  
    // Get players by category
    async getPlayersByCategory(category) {
      try {
        const playersRef = collection(db, 'players');
        const q = query(playersRef, where('category', '==', category));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching players by category:', error);
        throw error;
      }
    }
  };