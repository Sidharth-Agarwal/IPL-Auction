// src/services/auctionService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc,
    query,
    where,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from './firebaseConfig';
  
  export const auctionService = {
    // Create a new auction
    async createAuction(auctionData) {
      try {
        const auctionRef = collection(db, 'auctions');
        const newAuction = {
          ...auctionData,
          status: 'not_started',
          currentRound: 1,
          startTime: serverTimestamp(),
          createdAt: serverTimestamp()
        };
  
        const docRef = await addDoc(auctionRef, newAuction);
        return { id: docRef.id, ...newAuction };
      } catch (error) {
        console.error('Error creating auction:', error);
        throw error;
      }
    },
  
    // Get all auctions
    async getAllAuctions() {
      try {
        const auctionsCollection = collection(db, 'auctions');
        const snapshot = await getDocs(auctionsCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching auctions:', error);
        throw error;
      }
    },
  
    // Start an auction
    async startAuction(auctionId) {
      try {
        const auctionRef = doc(db, 'auctions', auctionId);
        await updateDoc(auctionRef, {
          status: 'active',
          startTime: serverTimestamp()
        });
        return auctionId;
      } catch (error) {
        console.error('Error starting auction:', error);
        throw error;
      }
    },
  
    // Update current player in auction
    async updateCurrentPlayer(auctionId, playerId) {
      try {
        const auctionRef = doc(db, 'auctions', auctionId);
        await updateDoc(auctionRef, {
          currentPlayer: playerId
        });
        return playerId;
      } catch (error) {
        console.error('Error updating current player:', error);
        throw error;
      }
    },
  
    // Place a bid
    async placeBid(auctionId, bidData) {
      try {
        const bidsCollection = collection(db, 'bids');
        const newBid = {
          ...bidData,
          timestamp: serverTimestamp()
        };
  
        const docRef = await addDoc(bidsCollection, newBid);
        return { id: docRef.id, ...newBid };
      } catch (error) {
        console.error('Error placing bid:', error);
        throw error;
      }
    },
  
    // Get bids for a specific auction and player
    async getBidsForPlayer(auctionId, playerId) {
      try {
        const bidsRef = collection(db, 'bids');
        const q = query(
          bidsRef, 
          where('auctionId', '==', auctionId),
          where('playerId', '==', playerId)
        );
  
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching player bids:', error);
        throw error;
      }
    },
  
    // Complete an auction
    async completeAuction(auctionId) {
      try {
        const auctionRef = doc(db, 'auctions', auctionId);
        await updateDoc(auctionRef, {
          status: 'completed',
          endTime: serverTimestamp()
        });
        return auctionId;
      } catch (error) {
        console.error('Error completing auction:', error);
        throw error;
      }
    }
  };