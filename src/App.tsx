import React, { useState, useEffect } from 'react';
import { CHANNELS_DATA } from './channels';
import { Channel } from './types';
import ScrollingTicker from './components/ScrollingTicker';
import IPTVPlayer from './components/IPTVPlayer';
import ChannelGrid from './components/ChannelGrid';
import { 
  Tv, 
  Heart, 
  Info,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState<boolean>(false);
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);

  // Hydrate favorites securely from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neon_iptv_favorites');
      if (saved) {
        setFavoritedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage hydrate error: ', e);
    }
  }, []);

  const toggleFavorite = (channelId: string) => {
    let updated: string[] = [];
    if (favoritedIds.includes(channelId)) {
      updated = favoritedIds.filter(id => id !== channelId);
    } else {
      updated = [...favoritedIds, channelId];
    }
    setFavoritedIds(updated);
    try {
      localStorage.setItem('neon_iptv_favorites', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error: ', e);
    }
  };

  const selectChannelHandler = (channel: Channel) => {
    setSelectedChannel(channel);
    // Auto restore to top layout when clicking a clean channel
    setIsPlayerMinimized(false);
    
    // Smoothly scroll to the top player if they click from deep below
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePlayerHandler = () => {
    setSelectedChannel(null);
    setIsPlayerMinimized(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 selection:bg-cyan-500/30 font-sans relative">
      
      {/* Scrolling Notice Ticker at the absolute top */}
      <ScrollingTicker />

      {/* Modern Premium Header */}
      <header className="relative border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md py-5 px-6 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand with Neon Glow */}
          <div className="flex items-center space-x-3.5 select-none">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Tv className="w-5.5 h-5.5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                লাইভ টিভি পোর্টাল
              </h1>
              <p className="text-[10px] text-cyan-400/95 uppercase tracking-widest leading-none mt-1.5 font-extrabold">
                ৬৭টি প্রিমিয়াম স্পোর্টস ও বিনোদন চ্যানেল
              </p>
            </div>
          </div>

          {/* Favorited and State Indicators */}
          <div className="flex items-center space-x-4">
            {favoritedIds.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-850 rounded-xl px-3.5 py-2 flex items-center space-x-2 text-xs">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                <span className="text-gray-300 font-bold">{favoritedIds.length}টি বুকমার্ক</span>
              </div>
            )}

            <div className="flex items-center space-x-2 bg-emerald-950/20 px-3.5 py-2 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>অনলাইন সার্ভার</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 min-h-[75vh]">

        {/* 1. EMBEDDED TOP DISPLAY PLAYER (Opens in place, channels are below it scrollable) */}
        {selectedChannel && !isPlayerMinimized && (
          <div className="w-full pb-2 animate-in fade-in slide-in-from-top-3 duration-300">
            <IPTVPlayer 
              channel={selectedChannel} 
              onClose={closePlayerHandler}
              isPinned={favoritedIds.includes(selectedChannel.id)}
              onTogglePin={() => toggleFavorite(selectedChannel.id)}
              isMinimized={false}
              onToggleMinimize={() => setIsPlayerMinimized(true)}
            />
          </div>
        )}

        {/* 2. CHANNELS DIRECTORY AREA (Always rendered at bottom, fully scrollable) */}
        <div className="pt-2">
          <ChannelGrid 
            channels={CHANNELS_DATA} 
            selectedChannel={isPlayerMinimized ? null : selectedChannel} 
            onSelectChannel={selectChannelHandler}
            favoritedIds={favoritedIds}
            onToggleFavorite={toggleFavorite}
          />
        </div>

      </main>

      {/* 3. MINIMIZED FLOATING PLAYER CORNER OVERLAY (If user clicks minimize) */}
      {selectedChannel && isPlayerMinimized && (
        <IPTVPlayer 
          channel={selectedChannel} 
          onClose={closePlayerHandler}
          isPinned={favoritedIds.includes(selectedChannel.id)}
          onTogglePin={() => toggleFavorite(selectedChannel.id)}
          isMinimized={true}
          onToggleMinimize={() => setIsPlayerMinimized(false)}
        />
      )}

      {/* Aesthetic Cyber Footer */}
      <footer className="bg-black border-t border-neutral-900 py-10 px-6 text-center text-xs text-gray-500 mt-12 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Tv className="w-4 h-4 text-cyan-500/40" />
            <span>লাইভ টিভি সার্ভার • সকল স্ট্রীম স্বয়ংক্রিয়ভাবে অপ্টিমাইজড</span>
          </div>
          <span className="text-[10px] text-gray-600">
            নিয়মিত নতুন চ্যানেল যুক্ত করতে আপডেট রাখুন
          </span>
        </div>
      </footer>

    </div>
  );
}
