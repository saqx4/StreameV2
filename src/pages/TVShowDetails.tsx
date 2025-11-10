/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Heart, Star, Calendar, ArrowLeft, Globe, Tv, Clock, Download } from 'lucide-react';
import { useTMDBMediaDetails } from '../hooks/useTMDB';
import { useTVSeasonDetails } from '../hooks/useTVSeasonDetails';
import { useAuth } from '../hooks/useAuth';
import { useUserMedia } from '../hooks/useUserMedia';
import { useToast } from '../hooks/useToast';
import { AuthModal } from '../components/auth/AuthModal';
import { ToastContainer } from '../components/ui/Toast';
import { logger } from '../utils';
import { API_CONFIG } from '../constants';
import type { TVShow } from '../types/media';

interface TVShowDetailsProps {
  showId: string;
  onBack?: () => void;
}

export const TVShowDetails: React.FC<TVShowDetailsProps> = ({ showId, onBack }) => {
  // Initialize from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const [selectedPlayer, setSelectedPlayer] = useState<'vidsrc-xyz' | 'vidlink' | 'vidsrc-to' | 'vidsrc-embed' | '2embed' | 'videasy'>('vidsrc-xyz');
  const [selectedSeason, setSelectedSeason] = useState(parseInt(urlParams.get('season') || '1'));
  const [selectedEpisode, setSelectedEpisode] = useState(parseInt(urlParams.get('episode') || '1'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const { currentUser } = useAuth();
  const { 
    checkIsInWatchlist, 
    checkIsInFavorites, 
    addItemToWatchlist, 
    removeItemFromWatchlist, 
    addItemToFavorites, 
    removeItemFromFavorites 
  } = useUserMedia();

  const { 
    data: tvShowData, 
    loading, 
    error 
  } = useTMDBMediaDetails(parseInt(showId), 'tv');

  // Type guard to ensure we have TV show data
  const tvShow = tvShowData?.type === 'tv' ? tvShowData as TVShow : null;

  // Fetch season details with episodes
  const { data: seasonData, loading: seasonLoading } = useTVSeasonDetails(
    parseInt(showId),
    selectedSeason
  );

  // Check if TV show is in user's lists
  const isInWatchlist = currentUser ? checkIsInWatchlist(parseInt(showId)) : false;
  const isLiked = currentUser ? checkIsInFavorites(parseInt(showId)) : false;

  // Update URL when season/episode changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('season', selectedSeason.toString());
    url.searchParams.set('episode', selectedEpisode.toString());
    window.history.replaceState({}, '', url.toString());
  }, [selectedSeason, selectedEpisode]);

  // Horizontal scroll control for episodes list
  const episodesContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollEpisodes = (dir: 'left' | 'right') => {
    const el = episodesContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // VidLink Watch Progress Tracking
  useEffect(() => {
    const handleVidLinkMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://vidlink.pro') return;
      
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        localStorage.setItem('vidLinkTVProgress', JSON.stringify(mediaData));
        logger.debug('VidLink TV Progress Saved:', mediaData);
      }

      if (event.data?.type === 'PLAYER_EVENT') {
        const { event: eventType, currentTime, duration } = event.data.data;
        logger.debug(`Player ${eventType} at ${currentTime}s of ${duration}s`);
      }
    };

    window.addEventListener('message', handleVidLinkMessage);
    
    return () => {
      window.removeEventListener('message', handleVidLinkMessage);
    };
  }, []);

  const handleWatchlistToggle = async () => {
    console.log('📺 TV Watchlist button clicked!');
    console.log('Current user:', currentUser);
    console.log('TV Show:', tvShow);
    console.log('Is in watchlist:', isInWatchlist);
    
    if (!currentUser) {
      console.log('⚠️ No user logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    if (!tvShow) {
      console.log('⚠️ No TV show data available');
      showError('TV show data not loaded yet. Please wait...');
      return;
    }

    try {
      console.log('🔄 Starting watchlist toggle...');
      if (isInWatchlist) {
        console.log('➖ Removing from watchlist');
        await removeItemFromWatchlist(parseInt(showId));
        success('✅ Removed from watchlist');
      } else {
        console.log('➕ Adding to watchlist');
        const itemToAdd = {
          id: parseInt(showId),
          title: tvShow.title,
          type: 'tv' as const,
          year: new Date(tvShow.releaseDate).getFullYear(),
          rating: tvShow.rating,
          poster: tvShow.posterUrl
        };
        console.log('Item to add:', itemToAdd);
        await addItemToWatchlist(itemToAdd);
        success('✅ Added to watchlist!');
      }
    } catch (err) {
      console.error('❌ Error toggling watchlist:', err);
      logger.error('Error toggling watchlist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update watchlist';
      showError(errorMessage);
    }
  };

  const handleLikeToggle = async () => {
    console.log('❤️ TV Like button clicked!');
    console.log('Current user:', currentUser);
    console.log('TV Show:', tvShow);
    console.log('Is liked:', isLiked);
    
    if (!currentUser) {
      console.log('⚠️ No user logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    if (!tvShow) {
      console.log('⚠️ No TV show data available');
      showError('TV show data not loaded yet. Please wait...');
      return;
    }

    try {
      console.log('🔄 Starting favorites toggle...');
      if (isLiked) {
        console.log('➖ Removing from favorites');
        await removeItemFromFavorites(parseInt(showId));
        success('✅ Removed from favorites');
      } else {
        console.log('➕ Adding to favorites');
        const itemToAdd = {
          id: parseInt(showId),
          title: tvShow.title,
          type: 'tv' as const,
          year: new Date(tvShow.releaseDate).getFullYear(),
          rating: tvShow.rating,
          poster: tvShow.posterUrl
        };
        console.log('Item to add:', itemToAdd);
        await addItemToFavorites(itemToAdd);
        success('✅ Added to favorites!');
      }
    } catch (err) {
      console.error('❌ Error toggling favorites:', err);
      logger.error('Error toggling favorites:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update favorites';
      showError(errorMessage);
    }
  };

  const handleWatchNow = () => {
    const playerSection = document.getElementById('content-section');
    if (playerSection) {
      playerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getPlayerUrl = (tmdbId: string, season: number, episode: number) => {
    switch (selectedPlayer) {
      case 'vidsrc-xyz':
        return `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      case 'vidlink':
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
      case 'vidsrc-to':
        return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
      case 'vidsrc-embed':
        return `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      case '2embed':
        return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
      case 'videasy':
        return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`;
      default:
        return `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
    }
  };

  const getDownloadUrl = (tmdbId: string, season: number, episode: number) => {
    return `https://dl.vidsrc.vip/tv/${tmdbId}/${season}/${episode}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
                    <div className="w-20 h-20 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">📺</div>
          <div className="text-white text-2xl mb-2">TV Show not found</div>
          <div className="text-white/60">{error || 'The requested TV show could not be loaded'}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 text-white overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Hero Section */}
      <div className="relative h-screen min-h-[600px]">
        {/* Background with Parallax Effect */}
        <motion.div 
          className="absolute inset-0 scale-110"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${tvShow.backdropUrl})` }}
          />
          {/* Lighter Gradient Overlays for Clear Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-blue-900/5 pointer-events-none" />
          
          {/* Reduced particles for performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400/20 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0 
                }}
                animate={{
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 2
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div 
          className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 pt-16 sm:pt-20 md:pt-24"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            {onBack && (
              <button
                onClick={onBack}
                className="group flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-lg hover:bg-black/40 transition-all border border-white/10 hover:border-green-400/30"
              >
                <ArrowLeft size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium text-sm">Back to TV Shows</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* TV Show Information */}
        <div className="absolute inset-0 flex items-center justify-start p-4 sm:p-8 pt-28 sm:pt-32 md:pt-40 z-20">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* TV Show Title */}
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-green-400 via-teal-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-2xl">
                  {tvShow.title}
                </span>
              </h1>

              {/* TV Show Meta */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-1 sm:gap-2 bg-green-400/10 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full border border-green-400/20">
                  <Star className="text-green-400" size={14} fill="currentColor" />
                  <span className="font-bold text-white text-xs sm:text-base">{tvShow.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-white/60 text-xs sm:text-sm">/10</span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 bg-white/5 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full">
                  <Calendar size={14} className="text-green-400" />
                  <span className="font-semibold text-white text-xs sm:text-base">{new Date(tvShow.firstAirDate || tvShow.releaseDate).getFullYear()}</span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 bg-purple-500/10 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full border border-purple-400/20">
                  <Tv size={14} className="text-purple-400" />
                  <span className="font-semibold text-white text-xs sm:text-base">{tvShow.numberOfSeasons} Season{tvShow.numberOfSeasons !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 bg-green-500/10 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full border border-green-400/20">
                  <Globe size={14} className="text-green-400" />
                  <span className="font-semibold text-white text-xs sm:text-base">{tvShow.language}</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 bg-orange-500/10 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full border border-orange-400/20">
                  <span className="font-semibold text-orange-400 text-xs sm:text-base">{tvShow?.status || 'Unknown'}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-8 flex-wrap">
                {tvShow.genres?.slice(0, 3).map((genre: string, index: number) => (
                  <motion.span 
                    key={index}
                    className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-800/30 to-slate-700/30 backdrop-blur-sm rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-white/10 hover:border-green-400/30 transition-all cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {genre}
                  </motion.span>
                ))}
              </div>

              {/* Description */}
              <motion.p 
                className="text-sm sm:text-lg text-white/90 mb-4 sm:mb-8 max-w-4xl leading-relaxed font-medium line-clamp-3 sm:line-clamp-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {tvShow.description}
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 relative z-30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button 
                  onClick={handleWatchNow}
                  className="group flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-300 hover:to-teal-400 text-black px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all hover:scale-105 shadow-2xl hover:shadow-green-400/25"
                >
                  <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  Watch Now
                </button>
                
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Watchlist button clicked - handler called');
                    handleWatchlistToggle();
                  }}
                  className={`group flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all hover:scale-105 relative z-40 cursor-pointer ${
                    isInWatchlist 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl shadow-green-500/25'
                      : 'bg-white/5 backdrop-blur-md hover:bg-white/15 text-white border border-white/10 hover:border-green-400/30'
                  }`}
                >
                  <Plus size={18} className={`transition-transform duration-300 ${isInWatchlist ? 'rotate-45' : 'group-hover:rotate-90'}`} />
                  <span className="hidden sm:inline">{isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
                  <span className="sm:hidden">{isInWatchlist ? 'Remove' : 'Add'}</span>
                </button>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Favorites button clicked - handler called');
                    handleLikeToggle();
                  }}
                  className={`group flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all hover:scale-105 relative z-40 cursor-pointer ${
                    isLiked 
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-2xl shadow-pink-500/25'
                      : 'bg-white/5 backdrop-blur-md hover:bg-white/15 text-white border border-white/10 hover:border-pink-400/30'
                  }`}
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className="group-hover:scale-110 transition-transform" />
                  {isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section - Direct Player */}
      <div id="content-section" className="relative bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          
          {/* Video Player Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 lg:mb-12"
          >
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Player Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      Now Watching
                    </h2>
                    <p className="text-white/60 text-sm">
                      Season {selectedSeason} • Episode {selectedEpisode}
                      {seasonData?.episodes.find(ep => ep.episodeNumber === selectedEpisode)?.name && 
                        ` • ${seasonData.episodes.find(ep => ep.episodeNumber === selectedEpisode)?.name}`
                      }
                    </p>
                  </div>
                  <a
                    href={getDownloadUrl(tvShow.id, selectedSeason, selectedEpisode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-all"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </div>

                {/* Player Selection Pills */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'vidsrc-xyz', label: 'VidSrc XYZ', color: 'from-blue-500 to-cyan-500' },
                    { id: 'vidlink', label: 'VidLink', color: 'from-purple-500 to-pink-500' },
                    { id: 'vidsrc-to', label: 'VidSrc TO', color: 'from-green-500 to-emerald-500' },
                    { id: 'vidsrc-embed', label: 'VidSrc RU', color: 'from-orange-500 to-red-500' },
                    { id: '2embed', label: '2Embed', color: 'from-yellow-500 to-orange-500' },
                    { id: 'videasy', label: 'Videasy', color: 'from-indigo-500 to-purple-500' }
                  ].map(({ id, label, color }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedPlayer(id as typeof selectedPlayer)}
                      className={`px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        selectedPlayer === id
                          ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105`
                          : 'bg-slate-800/50 text-white/70 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={getPlayerUrl(tvShow.id, selectedSeason, selectedEpisode)}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              {/* Player Footer */}
              <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80">
                      Playing on: {
                        selectedPlayer === 'vidsrc-xyz' ? 'VidSrc XYZ' :
                        selectedPlayer === 'vidlink' ? 'VidLink Pro' :
                        selectedPlayer === 'vidsrc-to' ? 'VidSrc TO' :
                        selectedPlayer === 'vidsrc-embed' ? 'VidSrc RU' :
                        selectedPlayer === '2embed' ? '2Embed' :
                        selectedPlayer === 'videasy' ? 'Videasy' : 'Unknown'
                      }
                    </span>
                  </div>
                  <span className="text-white/50">
                    Switch servers if one doesn't work
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Episodes Section */}
          <div className="space-y-6">
            {/* Season Selector */}
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4">Select Season</h3>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {Array.from({ length: tvShow?.numberOfSeasons || 1 }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedSeason(i + 1);
                      setSelectedEpisode(1);
                    }}
                    className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
                      selectedSeason === i + 1
                        ? 'bg-gradient-to-r from-green-400 to-teal-500 text-black shadow-lg shadow-green-500/25'
                        : 'bg-slate-800/50 text-white/80 hover:text-white hover:bg-slate-700/50 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    Season {i + 1}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Episodes List - Horizontal Scroll */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Tv size={18} className="text-green-400 sm:w-5 sm:h-5" />
                  <span className="flex items-center gap-1">
                    Episodes
                    {seasonData?.episodes && (
                      <span className="text-white/60 text-sm sm:text-base">({seasonData.episodes.length})</span>
                    )}
                  </span>
                </h3>
              </div>
              
              {seasonLoading ? (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 rounded-xl overflow-hidden">
                      <div className="aspect-video bg-slate-800/50 animate-pulse" />
                      <div className="p-4 bg-slate-800/30">
                        <div className="h-5 bg-slate-700/50 rounded mb-2 animate-pulse" />
                        <div className="h-4 bg-slate-700/30 rounded mb-1 animate-pulse" />
                        <div className="h-4 bg-slate-700/30 rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : seasonData?.episodes && seasonData.episodes.length > 0 ? (
                <div className="relative">
                  <div
                    ref={episodesContainerRef}
                    className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
                  >
                    {seasonData.episodes.map((episode, index) => (
                      <motion.div
                        key={episode.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }}
                        onClick={() => {
                          setSelectedEpisode(episode.episodeNumber);
                          document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 snap-start ${
                          selectedEpisode === episode.episodeNumber
                            ? 'ring-2 ring-green-400'
                            : 'hover:ring-2 hover:ring-white/30'
                        }`}
                      >
                        {/* Episode Card */}
                        <div className="relative h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
                          {/* Episode Thumbnail */}
                          <div className="relative aspect-video bg-slate-900">
                            {episode.stillPath ? (
                              <img
                                src={`${API_CONFIG.tmdb.imageBaseUrl}/w500${episode.stillPath}`}
                                alt={episode.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                <Tv size={48} className="text-slate-600" />
                              </div>
                            )}
                            
                            {/* Episode Number Badge */}
                            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">
                              <span className="text-white font-bold text-xs sm:text-sm">EP {episode.episodeNumber}</span>
                            </div>

                            {/* Rating Badge */}
                            {episode.voteAverage > 0 && (
                              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/90 backdrop-blur-sm px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-1.5">
                                <Star size={12} className="text-yellow-400 sm:w-3.5 sm:h-3.5" fill="currentColor" />
                                <span className="text-white text-xs sm:text-sm font-bold">
                                  {episode.voteAverage.toFixed(1)}
                                </span>
                              </div>
                            )}

                            {/* Play Overlay */}
                            {selectedEpisode === episode.episodeNumber ? (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 flex items-center justify-center"
                              >
                                <motion.div 
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                  className="relative"
                                >
                                  {/* Pulsing ring */}
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                                  />
                                  <div className="relative bg-gradient-to-br from-green-400 to-teal-500 rounded-full p-4 shadow-2xl">
                                    <Play size={28} fill="black" className="text-black ml-0.5" />
                                  </div>
                                </motion.div>
                                <div className="absolute bottom-3 left-0 right-0 text-center">
                                  <span className="bg-green-400/90 text-black px-3 py-1 rounded-full text-xs font-bold">
                                    NOW PLAYING
                                  </span>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <motion.div 
                                  whileHover={{ scale: 1.1 }}
                                  className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300"
                                >
                                  <Play size={24} fill="black" className="text-black ml-0.5" />
                                </motion.div>
                              </div>
                            )}
                          </div>

                          {/* Episode Info */}
                          <div className="p-3 sm:p-4 bg-gradient-to-b from-slate-800/50 to-slate-900/80">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h4 className="text-white font-bold text-sm sm:text-base line-clamp-2 group-hover:text-green-400 transition-colors duration-300 flex-1">
                                {episode.name || `Episode ${episode.episodeNumber}`}
                              </h4>
                              {selectedEpisode === episode.episodeNumber && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex-shrink-0 bg-green-400 text-black px-2 py-0.5 rounded-full text-[10px] font-bold"
                                >
                                  PLAYING
                                </motion.div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              {episode.runtime > 0 && (
                                <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-lg">
                                  <Clock size={14} className="text-green-400" />
                                  <span className="text-white/80 text-sm font-medium">{episode.runtime} min</span>
                                </div>
                              )}
                              
                              {/* Quick play button on hover */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-400 hover:bg-green-500 text-black p-2 rounded-full shadow-lg"
                              >
                                <Play size={16} fill="black" className="ml-0.5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Arrow Controls */}
                  <button
                    type="button"
                    onClick={() => scrollEpisodes('left')}
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 border border-white/10 hover:border-white/20 transition-all text-white text-2xl"
                    aria-label="Scroll left"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollEpisodes('right')}
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 border border-white/10 hover:border-white/20 transition-all text-white text-2xl"
                    aria-label="Scroll right"
                  >
                    ›
                  </button>
                  
                  {/* Scroll Hint */}
                  {seasonData.episodes.length > 2 && (
                    <div className="hidden sm:block absolute right-0 top-0 bottom-4 w-16 sm:w-20 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/60 bg-slate-800/20 rounded-xl border border-white/10">
                  <Tv size={48} className="mx-auto mb-4 text-white/30" />
                  <p>No episodes available for this season</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};
