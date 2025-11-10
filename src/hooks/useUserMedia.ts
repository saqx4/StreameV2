/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 * 
 * Hook for managing user's watchlist and favorites
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getUserMedia,
  addToWatchlist,
  removeFromWatchlist,
  addToFavorites,
  removeFromFavorites,
  isInWatchlist,
  isInFavorites,
  type MediaItem,
  type UserMediaData,
} from '../services/userMediaService';

export function useUserMedia() {
  const { currentUser } = useAuth();
  const [data, setData] = useState<UserMediaData>({ watchlist: [], favorites: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load user data
  const loadData = useCallback(async () => {
    if (!currentUser) {
      setData({ watchlist: [], favorites: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await getUserMedia(currentUser.uid);
      setData(userData);
    } catch (error) {
      console.error('Error loading user media:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add to watchlist
  const addItemToWatchlist = useCallback(async (item: Omit<MediaItem, 'addedDate'>) => {
    if (!currentUser || updating) return;

    try {
      setUpdating(true);
      await addToWatchlist(currentUser.uid, item);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [currentUser, updating, loadData]);

  // Remove from watchlist
  const removeItemFromWatchlist = useCallback(async (itemId: number) => {
    if (!currentUser || updating) return;

    try {
      setUpdating(true);
      await removeFromWatchlist(currentUser.uid, itemId);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [currentUser, updating, loadData]);

  // Add to favorites
  const addItemToFavorites = useCallback(async (item: Omit<MediaItem, 'addedDate'>) => {
    if (!currentUser || updating) return;

    try {
      setUpdating(true);
      await addToFavorites(currentUser.uid, item);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [currentUser, updating, loadData]);

  // Remove from favorites
  const removeItemFromFavorites = useCallback(async (itemId: number) => {
    if (!currentUser || updating) return;

    try {
      setUpdating(true);
      await removeFromFavorites(currentUser.uid, itemId);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [currentUser, updating, loadData]);

  // Check if item is in watchlist
  const checkIsInWatchlist = useCallback((itemId: number): boolean => {
    return isInWatchlist(data.watchlist, itemId);
  }, [data.watchlist]);

  // Check if item is in favorites
  const checkIsInFavorites = useCallback((itemId: number): boolean => {
    return isInFavorites(data.favorites, itemId);
  }, [data.favorites]);

  return {
    watchlist: data.watchlist,
    favorites: data.favorites,
    loading,
    updating,
    addItemToWatchlist,
    removeItemFromWatchlist,
    addItemToFavorites,
    removeItemFromFavorites,
    checkIsInWatchlist,
    checkIsInFavorites,
    refresh: loadData,
  };
}
