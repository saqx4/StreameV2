/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Heart, 
  Bookmark, 
  Star,
  Film,
  Tv,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useUserMedia } from '../hooks/useUserMedia';
import { logger } from '../utils';
import type { MediaItem } from '../services/userMediaService';

const MediaCard: React.FC<{ 
  item: MediaItem; 
  onRemove: (id: number) => void;
}> = ({ item, onRemove }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the delete button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (item.type === 'movie') {
      navigate({ to: '/movie/$movieId', params: { movieId: item.id.toString() } });
    } else {
      navigate({ to: '/tv-show/$showId', params: { showId: item.id.toString() } });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
        {/* Poster Image */}
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Type Badge */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
          <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
            item.type === 'movie' 
              ? 'bg-blue-500/80 text-white' 
              : 'bg-purple-500/80 text-white'
          }`}>
            {item.type === 'movie' ? <Film size={10} className="sm:w-3 sm:h-3" /> : <Tv size={10} className="sm:w-3 sm:h-3" />}
            <span className="hidden sm:inline">{item.type === 'movie' ? 'Movie' : 'TV'}</span>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
                        logger.debug('Delete button clicked for item:', item.id);
            onRemove(item.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-1 sm:top-2 right-1 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
        >
          <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
        </button>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>{item.year}</span>
            <div className="flex items-center gap-1">
              <Star size={8} className="text-yellow-400 fill-current sm:w-[10px] sm:h-[10px]" />
              <span>{item.rating}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1 hidden sm:block">
            Added: {new Date(item.addedDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ProfilePage: React.FC = () => {
  const { currentUser, logout, loading, changePassword, requestPasswordReset } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changing, setChanging] = useState(false);
  const [changeMsg, setChangeMsg] = useState<string | null>(null);
  const { 
    watchlist, 
    favorites, 
    removeItemFromWatchlist, 
    removeItemFromFavorites,
    refresh: refreshUserMedia
  } = useUserMedia();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate({ to: '/' });
    }
  }, [currentUser, loading, navigate]);

  // Refresh user media data when profile page is visited
  useEffect(() => {
    if (currentUser && !loading && location.pathname === '/profile') {
      refreshUserMedia();
    }
  }, [currentUser, loading, location.pathname, refreshUserMedia]);

  // Removed debug logging for production

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Loading profile...
        </motion.div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: '/' });
    } catch (error) {
      logger.error('Error logging out:', error);
    }
  };

  const handleRemoveFromWatchlist = async (id: number) => {
    try {
      logger.debug('Attempting to remove item from watchlist:', id);
      await removeItemFromWatchlist(id);
      logger.debug('Successfully removed item from watchlist:', id);
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
    }
  };

  const handleRemoveFromFavorites = async (id: number) => {
    try {
      logger.debug('Attempting to remove item from favorites:', id);
      await removeItemFromFavorites(id);
      logger.debug('Successfully removed item from favorites:', id);
    } catch (error) {
      logger.error('Error removing from favorites:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      setChangeMsg('Please enter your current password.');
      return;
    }
    
    if (!newPassword || newPassword.length < 8) {
      setChangeMsg('New password must be at least 8 characters.');
      return;
    }

    if (currentPassword === newPassword) {
      setChangeMsg('New password must be different from current password.');
      return;
    }

    try {
      setChanging(true);
      setChangeMsg(null);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setChangeMsg('Password updated successfully.');
    } catch (error) {
      setChangeMsg(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setChanging(false);
    }
  };

  const handleSendReset = async () => {
    if (!currentUser?.email) return;
    try {
      setChanging(true);
      setChangeMsg(null);
      await requestPasswordReset(currentUser.email);
      setChangeMsg('Password reset email sent. Check your inbox.');
    } catch (error) {
      setChangeMsg(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                {currentUser.displayName ? 
                  currentUser.displayName.charAt(0).toUpperCase() : 
                  <User size={24} className="sm:w-8 sm:h-8" />
                }
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {currentUser.displayName || 'User'}
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">{currentUser.email}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 sm:gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300"
            >
              <LogOut size={16} className="sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Security</h2>
          </div>
          <form onSubmit={handleChangePassword} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current Password */}
              <div className="relative">
                <label className="block text-sm text-gray-300 mb-1">
                  <Lock size={14} className="inline mr-1" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm text-gray-300 mb-1">
                  <Lock size={14} className="inline mr-1" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password (min 8 chars)"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                type="submit"
                disabled={changing}
                className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold disabled:opacity-50 transition-colors"
              >
                {changing ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={handleSendReset}
                disabled={changing}
                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-50 transition-colors"
              >
                Send Reset Email
              </button>
            </div>
          </form>
          {changeMsg && (
            <div className="mt-3 text-sm text-gray-300">
              {changeMsg}
            </div>
          )}
        </motion.div>

        {/* Watchlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Bookmark size={20} className="text-blue-400 sm:w-6 sm:h-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">My Watchlist</h2>
            <span className="text-gray-400 text-sm sm:text-base">({watchlist.length})</span>
          </div>
          
          {watchlist.length > 0 ? (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 sm:gap-4 pb-4" style={{ width: 'max-content' }}>
                {watchlist.map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-40 sm:w-48">
                    <MediaCard
                      item={item}
                      onRemove={handleRemoveFromWatchlist}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 bg-gray-800/20 rounded-lg border border-gray-700/50">
              <Bookmark size={40} className="text-gray-600 mx-auto mb-3 sm:w-12 sm:h-12" />
              <h3 className="text-gray-400 text-lg sm:text-xl font-semibold mb-2">No items in watchlist</h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">Start adding movies and TV shows to watch later!</p>
            </div>
          )}
        </motion.div>

        {/* Favorites Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Heart size={20} className="text-pink-400 sm:w-6 sm:h-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">My Favorites</h2>
            <span className="text-gray-400 text-sm sm:text-base">({favorites.length})</span>
          </div>
          
          {favorites.length > 0 ? (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 sm:gap-4 pb-4" style={{ width: 'max-content' }}>
                {favorites.map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-40 sm:w-48">
                    <MediaCard
                      item={item}
                      onRemove={handleRemoveFromFavorites}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 bg-gray-800/20 rounded-lg border border-gray-700/50">
              <Heart size={40} className="text-gray-600 mx-auto mb-3 sm:w-12 sm:h-12" />
              <h3 className="text-gray-400 text-lg sm:text-xl font-semibold mb-2">No favorite items</h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">Start adding your favorite movies and TV shows!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
