/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 * 
 * User Media Service - Handles watchlist and favorites
 */

import { supabase } from '../config/supabase';

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  year: number;
  rating: number;
  poster: string;
  addedDate: string;
}

export interface UserMediaData {
  watchlist: MediaItem[];
  favorites: MediaItem[];
}

/**
 * Get user's watchlist and favorites
 */
export async function getUserMedia(userId: string): Promise<UserMediaData> {
  console.log('📥 Fetching user media for:', userId);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('watchlist, favorites')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User doesn't exist, create them
        console.log('👤 User not found, creating...');
        await createUser(userId);
        return { watchlist: [], favorites: [] };
      }
      throw error;
    }

    const result = {
      watchlist: (data?.watchlist as MediaItem[]) || [],
      favorites: (data?.favorites as MediaItem[]) || [],
    };

    console.log('✅ User media fetched:', result);
    return result;
  } catch (err) {
    console.error('❌ Error fetching user media:', err);
    return { watchlist: [], favorites: [] };
  }
}

/**
 * Create user record
 */
async function createUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      watchlist: [],
      favorites: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error && error.code !== '23505') { // Ignore duplicate key error
    throw error;
  }
}

/**
 * Add item to watchlist
 */
export async function addToWatchlist(userId: string, item: Omit<MediaItem, 'addedDate'>): Promise<void> {
  console.log('➕ Adding to watchlist:', item);
  
  const current = await getUserMedia(userId);
  
  // Check if already exists
  if (current.watchlist.some(i => i.id === item.id)) {
    console.log('⚠️ Item already in watchlist');
    return;
  }

  const newItem: MediaItem = {
    ...item,
    addedDate: new Date().toISOString(),
  };

  const updated = [...current.watchlist, newItem];

  const { error } = await supabase
    .from('users')
    .update({ 
      watchlist: updated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
  
  console.log('✅ Added to watchlist successfully');
}

/**
 * Remove item from watchlist
 */
export async function removeFromWatchlist(userId: string, itemId: number): Promise<void> {
  console.log('➖ Removing from watchlist:', itemId);
  
  const current = await getUserMedia(userId);
  const updated = current.watchlist.filter(i => i.id !== itemId);

  const { error } = await supabase
    .from('users')
    .update({ 
      watchlist: updated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
  
  console.log('✅ Removed from watchlist successfully');
}

/**
 * Add item to favorites
 */
export async function addToFavorites(userId: string, item: Omit<MediaItem, 'addedDate'>): Promise<void> {
  console.log('➕ Adding to favorites:', item);
  
  const current = await getUserMedia(userId);
  
  // Check if already exists
  if (current.favorites.some(i => i.id === item.id)) {
    console.log('⚠️ Item already in favorites');
    return;
  }

  const newItem: MediaItem = {
    ...item,
    addedDate: new Date().toISOString(),
  };

  const updated = [...current.favorites, newItem];

  const { error } = await supabase
    .from('users')
    .update({ 
      favorites: updated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
  
  console.log('✅ Added to favorites successfully');
}

/**
 * Remove item from favorites
 */
export async function removeFromFavorites(userId: string, itemId: number): Promise<void> {
  console.log('➖ Removing from favorites:', itemId);
  
  const current = await getUserMedia(userId);
  const updated = current.favorites.filter(i => i.id !== itemId);

  const { error } = await supabase
    .from('users')
    .update({ 
      favorites: updated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
  
  console.log('✅ Removed from favorites successfully');
}

/**
 * Check if item is in watchlist
 */
export function isInWatchlist(watchlist: MediaItem[], itemId: number): boolean {
  return watchlist.some(item => item.id === itemId);
}

/**
 * Check if item is in favorites
 */
export function isInFavorites(favorites: MediaItem[], itemId: number): boolean {
  return favorites.some(item => item.id === itemId);
}
