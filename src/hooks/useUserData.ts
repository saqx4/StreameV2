/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  subscribeToUserData, 
  addToWatchlist, 
  removeItemFromWatchlist, 
  addToFavorites, 
  removeItemFromFavorites, 
  isInWatchlist, 
  isInFavorites,
  type UserData, 
  type MediaItem 
} from '../services/databaseService';

export const useUserData = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToUserData(currentUser.uid, (data) => {
      setUserData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addItemToWatchlist = async (mediaItem: Omit<MediaItem, 'addedDate'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    if (isUpdating) return; // Prevent concurrent updates
    
    try {
      setIsUpdating(true);
      const itemWithDate: MediaItem = {
        ...mediaItem,
        addedDate: new Date().toISOString()
      };
      
      await addToWatchlist(currentUser.uid, itemWithDate);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItemFromWatchlistById = async (itemId: number) => {
    if (!currentUser) throw new Error('User not authenticated');
    if (isUpdating) return; // Prevent concurrent updates
    
    try {
      setIsUpdating(true);
      await removeItemFromWatchlist(currentUser.uid, itemId);
    } finally {
      setIsUpdating(false);
    }
  };

  const addItemToFavorites = async (mediaItem: Omit<MediaItem, 'addedDate'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    if (isUpdating) return; // Prevent concurrent updates
    
    try {
      setIsUpdating(true);
      const itemWithDate: MediaItem = {
        ...mediaItem,
        addedDate: new Date().toISOString()
      };
      
      await addToFavorites(currentUser.uid, itemWithDate);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItemFromFavoritesById = async (itemId: number) => {
    if (!currentUser) throw new Error('User not authenticated');
    if (isUpdating) return; // Prevent concurrent updates
    
    try {
      setIsUpdating(true);
      await removeItemFromFavorites(currentUser.uid, itemId);
    } finally {
      setIsUpdating(false);
    }
  };

  const checkIsInWatchlist = (itemId: number): boolean => {
    if (!userData?.watchlist) return false;
    return isInWatchlist(userData.watchlist, itemId);
  };

  const checkIsInFavorites = (itemId: number): boolean => {
    if (!userData?.favorites) return false;
    return isInFavorites(userData.favorites, itemId);
  };

  return {
    userData,
    loading,
    isUpdating,
    watchlist: userData?.watchlist || [],
    favorites: userData?.favorites || [],
    addItemToWatchlist,
    removeItemFromWatchlistById,
    addItemToFavorites,
    removeItemFromFavoritesById,
    checkIsInWatchlist,
    checkIsInFavorites
  };
};
