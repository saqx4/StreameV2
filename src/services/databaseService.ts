/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

import { supabase } from '../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AuthUser } from '../contexts/AuthContext';

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  year: number;
  rating: number;
  poster: string;
  addedDate: string;
}

export interface UserData {
  watchlist: MediaItem[];
  favorites: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

// Create or get user document
export const createUserDocument = async (user: AuthUser): Promise<void> => {
  if (!user) return;
  
  try {
    const now = new Date().toISOString();
    const userData: UserData = {
      watchlist: [],
      favorites: [],
      createdAt: now,
      updatedAt: now,
    };
    
    // Upsert user row if not exists
    const { error } = await supabase
      .from('users')
      .upsert({ id: user.uid, ...userData }, { onConflict: 'id' });
    
    if (error) {
      console.error('Database error creating user document:', error);
      throw new Error('Database error saving new user. Please try again or contact support.');
    }
  } catch (error) {
    console.error('Error in createUserDocument:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create user profile');
  }
};

// Get user's watchlist and favorites
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('watchlist, favorites, createdAt:created_at, updatedAt:updated_at')
      .eq('id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }
    if (!data) return null;
    return {
      watchlist: (data.watchlist as MediaItem[]) ?? [],
      favorites: (data.favorites as MediaItem[]) ?? [],
      createdAt: (data.createdAt as string | undefined) ?? new Date().toISOString(),
      updatedAt: (data.updatedAt as string | undefined) ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Add item to watchlist
export const addToWatchlist = async (userId: string, mediaItem: MediaItem): Promise<void> => {
  try {
    console.log('Adding to watchlist:', userId, mediaItem);
    const current = (await getUserData(userId)) ?? {
      watchlist: [],
      favorites: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Check if item already exists
    const exists = current.watchlist.some(item => item.id === mediaItem.id);
    if (exists) {
      console.log('Item already in watchlist');
      return;
    }
    
    const itemWithDate: MediaItem = { ...mediaItem, addedDate: new Date().toISOString() };
    const updatedWatchlist = [...(current.watchlist ?? []), itemWithDate];
    
    console.log('Updating watchlist with:', updatedWatchlist);
    const { error } = await supabase
      .from('users')
      .update({ watchlist: updatedWatchlist, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Successfully added to watchlist');
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

// Remove item from watchlist
export const removeFromWatchlist = async (userId: string, mediaItem: MediaItem): Promise<void> => {
  try {
    const current = await getUserData(userId);
    if (!current) return;
    const updatedWatchlist = (current.watchlist ?? []).filter(i => i.id !== mediaItem.id);
    const { error } = await supabase
      .from('users')
      .update({ watchlist: updatedWatchlist, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

// Add item to favorites
export const addToFavorites = async (userId: string, mediaItem: MediaItem): Promise<void> => {
  try {
    console.log('Adding to favorites:', userId, mediaItem);
    const current = (await getUserData(userId)) ?? {
      watchlist: [],
      favorites: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Check if item already exists
    const exists = current.favorites.some(item => item.id === mediaItem.id);
    if (exists) {
      console.log('Item already in favorites');
      return;
    }
    
    const itemWithDate: MediaItem = { ...mediaItem, addedDate: new Date().toISOString() };
    const updatedFavorites = [...(current.favorites ?? []), itemWithDate];
    
    console.log('Updating favorites with:', updatedFavorites);
    const { error } = await supabase
      .from('users')
      .update({ favorites: updatedFavorites, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Successfully added to favorites');
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove item from favorites
export const removeFromFavorites = async (userId: string, mediaItem: MediaItem): Promise<void> => {
  try {
    const current = await getUserData(userId);
    if (!current) return;
    const updatedFavorites = (current.favorites ?? []).filter(i => i.id !== mediaItem.id);
    const { error } = await supabase
      .from('users')
      .update({ favorites: updatedFavorites, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Check if item is in watchlist
export const isInWatchlist = (watchlist: MediaItem[], itemId: number): boolean => {
  return watchlist.some(item => item.id === itemId);
};

// Check if item is in favorites
export const isInFavorites = (favorites: MediaItem[], itemId: number): boolean => {
  return favorites.some(item => item.id === itemId);
};

// Subscribe to user data changes
export const subscribeToUserData = (
  userId: string, 
  callback: (userData: UserData | null) => void
): (() => void) => {
  // Initial fetch
  getUserData(userId).then(callback);

  const channel: RealtimeChannel = supabase
    .channel(`public:users:id=eq.${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
      async () => {
        const data = await getUserData(userId);
        callback(data);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Helper function to find and remove item from array (for complex removal)
export const removeItemFromWatchlist = async (userId: string, itemId: number): Promise<void> => {
  try {
    console.log('removeItemFromWatchlist called with userId:', userId, 'itemId:', itemId);
    const userData = await getUserData(userId);
    if (!userData) {
      console.log('No user data found');
      return;
    }
    
    console.log('Current watchlist:', userData.watchlist);
    const updatedWatchlist = userData.watchlist.filter(item => item.id !== itemId);
    console.log('Updated watchlist:', updatedWatchlist);
    const { error } = await supabase
      .from('users')
      .update({ watchlist: updatedWatchlist, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    console.log('Watchlist updated successfully');
  } catch (error) {
    console.error('Error removing item from watchlist:', error);
    throw error;
  }
};

// Helper function to find and remove item from favorites
export const removeItemFromFavorites = async (userId: string, itemId: number): Promise<void> => {
  try {
    console.log('removeItemFromFavorites called with userId:', userId, 'itemId:', itemId);
    const userData = await getUserData(userId);
    if (!userData) {
      console.log('No user data found');
      return;
    }
    
    console.log('Current favorites:', userData.favorites);
    const updatedFavorites = userData.favorites.filter(item => item.id !== itemId);
    console.log('Updated favorites:', updatedFavorites);
    const { error } = await supabase
      .from('users')
      .update({ favorites: updatedFavorites, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    console.log('Favorites updated successfully');
  } catch (error) {
    console.error('Error removing item from favorites:', error);
    throw error;
  }
};

