// src/services/authService.js
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
  } from 'firebase/auth';
  import { 
    doc, 
    setDoc, 
    getDoc 
  } from 'firebase/firestore';
  import { auth, db } from './firebaseConfig';
  
  export const authService = {
    // Login user
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Verify admin role
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          await signOut(auth);
          throw new Error('Access denied. Admin login required.');
        }
  
        return userCredential.user;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
  
    // Logout user
    async logout() {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
  
    // Create admin user
    async createAdminUser(email, password, displayName) {
      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Create user document in Firestore with admin role
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: displayName || '',
          role: 'admin',
          createdAt: new Date()
        });
  
        return user;
      } catch (error) {
        console.error('Create admin user error:', error);
        throw error;
      }
    },
  
    // Send password reset email
    async resetPassword(email) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        console.error('Password reset error:', error);
        throw error;
      }
    },
  
    // Check if user is an admin
    async isAdmin(userId) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() && userDoc.data().role === 'admin';
      } catch (error) {
        console.error('Admin check error:', error);
        return false;
      }
    }
  };