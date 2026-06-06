import React, { useState, useMemo } from 'react';
import { Channel, CategoryFilter } from '../types';
import { Search, HelpCircle, Video } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  favoritedIds: string[];
  onToggleFavorite: (id: string) => void;
}

export default function ChannelGrid({ 
  channels, 
  selectedChannel, 
  onSelectChannel,
  favoritedIds,
  onToggleFavorite
}: ChannelGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  // Filter channels based on search & category
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
      const matchesSearch = 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        channel.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [channels, activeCategory, searchQuery]);

  // Handle fallback text initials if a logo is broken
  const getInitials = (name: string) => {
    const cleansed = name.replace(/_|-|HD|SD/g, ' ').trim();
    const parts = cleansed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleansed.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Category Tabs & Styled Responsive Search Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-neutral-950/40 border border-cyan-500/10 p-5 rounded-3xl backdrop-blur-xl">
        
        {/* Bengali Styled Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {([
            { key: 'All', label: 'সব চ্যানেল', count: channels.length },
            { key: 'Entertainment & Music', label: 'বিনোদন ও গান', count: channels.filter(c => c.category === 'Entertainment & Music').length },
            { key: 'Sports & Games', label: 'লাইভ খেলাধুলা', count: channels.filter(c => c.category === 'Sports & Games').length }
          ] as { key: CategoryFilter; label: string; count: number }[]).map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 outline-none flex items-center space-x-2 ${
                  isActive 
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]' 
                  : 'bg-neutral-900/70 text-cyan-400/80 border border-cyan-950 hover:bg-cyan-950/20 hover:text-cyan-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                  isActive ? 'bg-neutral-900/40 text-neutral-950' : 'bg-cyan-950/60 text-cyan-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input search box in Bengali */}
        <div className="relative w-full md:w-80 shrink-0">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="আপনার পছন্দের চ্যানেল খুঁজুন... (যেমন: STAR, ZEE)"
            className="w-full bg-neutral-900/50 border border-cyan-950 hover:border-cyan-800/40 focus:border-cyan-500 text-xs rounded-2xl pl-11 pr-4 py-3 text-cyan-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
        </div>

      </div>

      {/* Grid Results Status */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-gray-400">
          মোট চ্যানেল সংখ্যা: <span className="text-cyan-400 font-bold ml-1 font-mono">{filteredChannels.length} টি পাওয়া গেছে</span>
        </p>
        <span className="text-[10px] text-emerald-500 flex items-center space-x-1.5 bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-950/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>সার্ভার সচল আছে</span>
        </span>
      </div>

      {/* Favorite / Bookmarked Circular Channels Row (Direct click from top) */}
      {favoritedIds.length > 0 && searchQuery === '' && (
        <div className="p-4 bg-neutral-950/20 border border-cyan-500/5 rounded-3xl backdrop-blur-md">
          <div className="text-[11px] font-bold text-cyan-400/90 mb-3 ml-2 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>আপনার প্রিয় বুকমার্ক চ্যানেলসমূহ:</span>
          </div>
          <div className="flex flex-wrap gap-4.5">
            {channels.filter(c => favoritedIds.includes(c.id)).map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              return (
                <div 
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  className="flex flex-col items-center cursor-pointer group select-none transition-transform duration-300"
                >
                  <div className={`relative w-15 h-15 rounded-full p-[3px] transition-all duration-300 bg-gradient-to-tr ${
                    isSelected 
                    ? 'from-cyan-400 to-teal-300 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                    : 'from-neutral-800 to-neutral-700 hover:from-cyan-500 hover:to-teal-400'
                  }`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-1.5">
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                          const parent = (e.target as any).parentNode;
                          if (parent) {
                            const errBadge = document.createElement('div');
                            errBadge.className = "text-[10px] font-sans font-bold text-neutral-800 flex items-center justify-center h-full w-full bg-cyan-100 rounded-full";
                            errBadge.innerText = getInitials(channel.name);
                            parent.appendChild(errBadge);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <span className="mt-1.5 text-[10px] font-bold text-gray-400 text-center line-clamp-1 max-w-[65px] group-hover:text-cyan-400">
                    {channel.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Channel Directory - Circular Icons Layout */}
      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-4 gap-y-7 px-1 pt-2">
          {filteredChannels.map((channel) => {
            const isSelected = selectedChannel?.id === channel.id;
            const isPinned = favoritedIds.includes(channel.id);
            
            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className="flex flex-col items-center justify-start cursor-pointer group select-none relative"
              >
                {/* Round Circular Card Panel */}
                <div 
                  className={`relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-[3px] transition-all duration-300 bg-gradient-to-tr ${
                    isSelected 
                    ? 'from-cyan-400 via-teal-400 to-cyan-400 scale-105 shadow-[0_0_18px_rgba(6,182,212,0.4)]' 
                    : 'from-neutral-800 to-neutral-800 hover:from-cyan-500 hover:to-teal-400 hover:scale-105'
                  }`}
                >
                  {/* Clean white round center for maximum contrast logo rendering */}
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-2 shadow-inner">
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                        const parent = (e.target as any).parentNode;
                        if (parent) {
                          const errBadge = document.createElement('div');
                          errBadge.className = "text-[10px] sm:text-xs font-sans font-bold text-neutral-800 flex items-center justify-center h-full w-full bg-cyan-100 rounded-full";
                          errBadge.innerText = getInitials(channel.name);
                          parent.appendChild(errBadge);
                        }
                      }}
                    />
                  </div>

                  {/* Tiny heart icon if bookmarked / pinned */}
                  {isPinned && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-rose-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white">
                      ♥
                    </span>
                  )}
                </div>

                {/* Channel Name underneath the Circle */}
                <span className="mt-2 text-[10px] sm:text-xs font-bold text-gray-300 text-center tracking-tight leading-tight line-clamp-2 max-w-[76px] sm:max-w-[96px] group-hover:text-cyan-400 transition-colors duration-200">
                  {channel.name}
                </span>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty search State */
        <div className="w-full bg-neutral-950/20 border border-cyan-500/10 p-12 text-center rounded-3xl backdrop-blur-xl flex flex-col items-center">
          <HelpCircle className="w-10 h-10 text-cyan-500/30 mb-3" />
          <h3 className="text-sm font-semibold text-gray-300">
            কোনো চ্যানেল পাওয়া যায়নি
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            একটু আলাদা বানান লিখে বা অন্য ক্যাটাগরি সিলেক্ট করে আবার চেষ্টা করুন।
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-4 px-4 py-2 bg-cyan-950 text-cyan-400 text-xs font-bold rounded-xl border border-cyan-500/20 hover:bg-cyan-900 transition-all font-sans"
          >
            রিসেট ফিল্টার
          </button>
        </div>
      )}

    </div>
  );
}
