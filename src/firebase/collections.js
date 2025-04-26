// src/firebase/collections.js
import { db } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Collection references
export const teamsRef = collection(db, 'teams');
export const playersRef = collection(db, 'players');
export const auctionSettingsRef = doc(db, 'auction', 'settings');
export const bidsRef = collection(db, 'auction', 'bids', 'allBids');

/**
 * Generic function to get a document by ID from any collection
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} - Document data with ID
 */
export const getDocumentById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error(`Document ${docId} not found in ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to get all documents from a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} options - Query options: orderByField, orderDirection, whereField, whereOperator, whereValue, limitCount
 * @returns {Promise<Array>} - Array of documents with IDs
 */
export const getAllDocuments = async (collectionName, options = {}) => {
  try {
    let collectionRef = collection(db, collectionName);
    let queryRef = collectionRef;
    
    // Build query if options are provided
    if (options.whereField && options.whereOperator && options.whereValue !== undefined) {
      queryRef = query(queryRef, where(options.whereField, options.whereOperator, options.whereValue));
    }
    
    if (options.orderByField) {
      queryRef = query(queryRef, orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    
    if (options.limitCount) {
      queryRef = query(queryRef, limit(options.limitCount));
    }
    
    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to add a document to any collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Document data
 * @returns {Promise<Object>} - Added document with ID
 */
export const addDocument = async (collectionName, data) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a document in any collection
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} - Updated document with ID
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete a document from any collection
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<string>} - Deleted document ID
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return docId;
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Function to set document with a specific ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @returns {Promise<Object>} - Set document with ID
 */
export const setDocumentWithId = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

export default {
  teamsRef,
  playersRef,
  auctionSettingsRef,
  bidsRef,
  getDocumentById,
  getAllDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  setDocumentWithId
};