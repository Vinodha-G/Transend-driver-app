/**
 * AppContext.js - Global State Management with Persistence
 * 
 * Provides global state management using React Context API.
 * Persists user profile data across app restarts using AsyncStorage.
 * 
 * Features:
 * - User profile with image management (persistent)
 * - Job listings with real-time status updates
 * - Notification system with read/unread tracking
 * - Computed statistics for dashboard display
 * 
 * @version 2.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  // User Profile State
  const [user, setUser] = useState({
    name: 'John Driver',
    email: 'john.driver@example.com',
    phone: '+1 234 567 8900',
    profileImage: 'https://via.placeholder.com/150',
  });

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Job Available',
      message: 'A new delivery job is available near your location',
      time: '5 mins ago',
      read: false,
    },
    {
      id: 2,
      title: 'Job Completed',
      message: 'Your delivery to Toronto has been marked as completed',
      time: '1 hour ago',
      read: true,
    },
  ]);

  // Jobs State
  const [jobs, setJobs] = useState([
    {
      id: 1,
      companyName: 'Muthu & Co',
      orderId: '15612',
      type: 'LTL',
      dateTime: "15 May'25 at 10:15 AM",
      profileImage: 'https://via.placeholder.com/50',
      pickupLocation: '17, Yonge St, Toronto, Canada',
      dropoffLocation: '20, Yonge St, Toronto, Canada',
      status: 'new',
    },
    {
      id: 2,
      companyName: 'MVP',
      orderId: '89142',
      type: 'LTL',
      dateTime: "15 May'25 at 10:15 AM",
      profileImage: 'https://via.placeholder.com/50',
      pickupLocation: '17, Yonge St, Toronto, Canada',
      dropoffLocation: '20, Yonge St, Toronto, Canada',
      status: 'accepted',
    },
    {
      id: 3,
      companyName: 'ULINE',
      orderId: '51616',
      type: 'LTL',
      dateTime: "15 May'25 at 10:15 AM",
      profileImage: 'https://via.placeholder.com/50',
      pickupLocation: '17, Yonge St, Toronto, Canada',
      dropoffLocation: '20, Yonge St, Toronto, Canada',
      status: 'pickedup',
    },
  ]);

  /** Load User from AsyncStorage on app start */
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userProfile');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to load user from AsyncStorage', err);
      }
    };
    loadUserFromStorage();
  }, []);

  /** Mark Notification as Read */
  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  /** Update Job Status */
  const updateJobStatus = (jobId, newStatus) => {
    setJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status: newStatus } : job))
    );
  };

  /** Update User Profile (also persists to AsyncStorage) */
  const updateUserProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to save user profile to AsyncStorage', err);
    }
  };

  const value = {
    user,
    notifications,
    jobs,
    markNotificationAsRead,
    updateJobStatus,
    updateUserProfile,
    unreadNotifications: notifications.filter(n => !n.read).length,
    jobStats: {
      newOrders: jobs.filter(j => j.status === 'new').length,
      accepted: jobs.filter(j => j.status === 'accepted').length,
      pickedup: jobs.filter(j => j.status === 'pickedup').length,
      delivered: jobs.filter(j => j.status === 'delivered').length,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
