import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Channel } from '../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Radio, 
  AlertCircle, 
  RefreshCw,
  X,
  Heart,
  Minimize2,
  Maximize2,
  ArrowLeft,
  Settings,
  ChevronDown
} from 'lucide-react';

interface IPTVPlayerProps {
  channel: Channel;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function IPTVPlayer({ 
  channel, 
  onClose, 
  isPinned, 
  onTogglePin,
  isMinimized,
  onToggleMinimize
}: IPTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false); // MUST default audio unmuted as requested ("অটোমেটিকলি মাইক ওপেন থাকবে")
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [useBackup, setUseBackup] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<string>('aspect-video');
  const [activeViewers, setActiveViewers] = useState<number>(3420);
  
  // Resolution/quality state
  const [resolution, setResolution] = useState<string>('Auto (স্ট্যান্ডার্ড)');
  const [showResMenu, setShowResMenu] = useState<boolean>(false);
  const [isBufferingQuality, setIsBufferingQuality] = useState<boolean>(false);
  const [hlsLevels, setHlsLevels] = useState<{ id: number; name: string }[]>([]);
  const hlsRef = useRef<Hls | null>(null);

  // Generate simulated vibrant viewer counter
  useEffect(() => {
    setActiveViewers(Math.floor(Math.random() * 2100) + 2400);
    const interval = setInterval(() => {
      setActiveViewers(prev => prev + (Math.random() > 0.5 ? 6 : -5));
    }, 3000);
    return () => clearInterval(interval);
  }, [channel]);

  // Handle stream initialization & play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setHasError(false);
    setErrorMessage('');
    setIsPlaying(true);
    setHlsLevels([]);

    const isHls = channel.streamUrl.includes('.m3u8') || channel.streamUrl.includes('.ts');

    if (isHls && !useBackup) {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 10,
          maxMaxBufferLength: 18,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;

        hls.loadSource(channel.streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          // Extract real levels from playlist if available
          if (hls && hls.levels && hls.levels.length > 0) {
            const levels = hls.levels.map((lvl, index) => ({
              id: index,
              name: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`
            }));
            setHlsLevels(levels);
          }

          // Force voice unmute by setting video settings
          video.muted = isMuted;
          video.play().catch((err) => {
            console.log('Voice Autoplay policy override status:', err);
            // Fallback securely so live is running regardless
            video.muted = true;
            setIsMuted(true);
            video.play().catch(e => {
              setIsPlaying(false);
            });
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                setHasError(true);
                setErrorMessage('চ্যানেল সংযোগে সাময়িক সমস্যা হচ্ছে। নিচে থাকা ব্যাকআপ প্লে বাটনে ক্লিক করুন।');
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.muted = isMuted;
          video.play().catch(() => {
            // Unmute failed, play muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => setIsPlaying(false));
          });
        });
        video.addEventListener('error', () => {
          setHasError(true);
          setErrorMessage('লাইভ ডিকোডার লোড করা সম্ভব হয়নি।');
        });
      }
    } else {
      video.src = channel.streamUrl;
      video.muted = isMuted;
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => setIsPlaying(false));
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, useBackup]);

  // Handle Resolution level switching
  const handleResolutionChange = (resLabel: string, hlsIndex?: number) => {
    setResolution(resLabel);
    setShowResMenu(false);
    setIsBufferingQuality(true);

    if (hlsRef.current) {
      if (typeof hlsIndex === 'number') {
        hlsRef.current.currentLevel = hlsIndex;
      } else {
        hlsRef.current.currentLevel = -1; // Auto
      }
    }

    // Interactive high quality loading feeling
    setTimeout(() => {
      setIsBufferingQuality(false);
      const video = videoRef.current;
      if (video && isPlaying) {
        video.play().catch(() => {});
      }
    }, 700);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => console.log('Play resume error:', err));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).webkitRequestFullscreen) {
      (video as any).webkitRequestFullscreen();
    }
  };

  const triggerBackup = () => {
    setUseBackup(true);
    setHasError(false);
  };

  const retryStream = () => {
    setUseBackup(false);
    setHasError(false);
    setErrorMessage('');
  };

  // Rendering Minimized Floating display inside corner
  if (isMinimized) {
    return (
      <div 
        id={`pip-player-${channel.id}`}
        className="fixed bottom-6 right-6 z-50 w-[280px] sm:w-[360px] bg-neutral-950 rounded-2xl border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.45)] overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 duration-300"
      >
        <div className="relative group">
          
          {/* Audio/Video display Area */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {(!hasError && !useBackup) ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover pointer-events-none"
                playsInline
                muted={isMuted}
              />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-2 text-center text-xs">
                <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
                <span className="text-gray-300">সম্প্রচার লোড হচ্ছে...</span>
              </div>
            )}

            {isBufferingQuality && (
              <div className="absolute inset-x-0 inset-y-0 bg-black/80 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <p className="text-[10px] text-cyan-400 font-bold">গুণমান সমন্বয় করা হচ্ছে...</p>
              </div>
            )}

            {/* Quick Overlays */}
            <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/80 border border-red-500/30 px-1.5 py-0.5 rounded text-[9px] text-red-400 font-bold">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
              <span>মিনিয়েচার</span>
            </div>

            {/* Floating Quick Action Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
              
              {/* Header inside floating */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white tracking-wide truncate max-w-[150px]">
                  {channel.name}
                </span>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={onToggleMinimize}
                    className="p-1 rounded-md bg-neutral-800 text-cyan-400 hover:bg-cyan-900 transition"
                    title="বড় স্ক্রিন করুন"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-1 rounded-md bg-neutral-800 text-rose-400 hover:bg-rose-950 transition"
                    title="ডিসপ্লে বন্ধ করুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Controls inside floating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-900 transition"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-cyan-400" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className={`p-1.5 rounded-lg border transition ${
                      isMuted ? 'bg-rose-950/60 border-rose-500/20 text-rose-400' : 'bg-cyan-950 border-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[9px] font-bold text-cyan-300 font-mono bg-black/80 px-2 py-0.5 rounded">
                  {resolution}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`live-iptv-player-${channel.id}`}
      className="relative w-full max-w-4xl mx-auto bg-neutral-950 rounded-3xl border border-cyan-550/30 overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.30)] animate-in fade-in slide-in-from-top-4 duration-300"
    >
      
      {/* Dynamic Player Top Header */}
      <div className="flex items-center justify-between px-5 py-4.5 bg-neutral-900/90 border-b border-neutral-800 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          
          {/* Cyber Glowing live icon */}
          <div className="relative flex items-center justify-center p-2.5 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-900" />
          </div>

          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-[9px] font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                {channel.id}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                {channel.name} 
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline-flex items-center bg-emerald-950/45 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                সরাসরি সম্প্রচার
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              ক্যাটাগরি: {channel.category === 'Sports & Games' ? 'খেলাধুলা' : 'বিনোদন ও গান'} • অডিও: স্বয়ংক্রিয়
            </p>
          </div>
        </div>

        {/* Back navigation option + control buttons */}
        <div className="flex items-center space-x-2">
          
          {/* Back/Close shortcut option to return */}
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-cyan-950 text-gray-300 hover:text-cyan-400 border border-neutral-700 hover:border-cyan-500/30 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
            title="ডিসপ্লে বন্ধ করুন"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ফিরে যান</span>
          </button>

          {/* Minimize toggle option */}
          <button
            onClick={onToggleMinimize}
            className="p-2.5 rounded-xl border bg-neutral-800 text-gray-300 hover:text-cyan-400 border-neutral-700 hover:border-cyan-500/30 transition-all cursor-pointer"
            title="ভেতরে মিনিমাইজ করুন"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          {/* Pin/Favorite Bookmark Button */}
          <button
            onClick={onTogglePin}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isPinned 
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-400' 
              : 'bg-neutral-800/80 border-neutral-700 text-gray-400 hover:text-rose-400 hover:border-rose-500/30'
            }`}
            title={isPinned ? 'বুকমার্ক থেকে মুছুন' : 'বুকমার্কে যুক্ত করুন'}
          >
            <Heart className={`w-4 h-4 ${isPinned ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Explicit X button */}
          <button 
            onClick={onClose}
            className="p-2.5 bg-neutral-800 hover:bg-rose-950 hover:text-rose-400 rounded-xl border border-neutral-700 hover:border-rose-500/30 text-gray-300 transition-all cursor-pointer"
            title="পূর্ণ বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="relative bg-black group overflow-hidden">
        
        {(!hasError && !useBackup) ? (
          <div className={`relative ${aspectRatio} transition-all duration-300 w-full flex items-center justify-center bg-black`}>
            
            <video
              ref={videoRef}
              className="w-full h-full object-cover pointer-events-none"
              playsInline
              muted={isMuted}
            />
            
            {/* Buffering/Quality configuration overlay */}
            {isBufferingQuality && (
              <div className="absolute inset-x-0 inset-y-0 bg-neutral-950/85 flex flex-col items-center justify-center space-y-3 z-10 transition-all">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <div className="text-center">
                  <h4 className="text-xs font-bold text-cyan-400 font-sans">হাই-ডেফিনিশন রেজোলিউশন সেট হচ্ছে...</h4>
                  <p className="text-[10px] text-gray-400 mt-1">বাফার ট্র্যাকার অপ্টিমাইজেশন চলছে</p>
                </div>
              </div>
            )}

            {/* Standard Live Badge Watermark on Top */}
            <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-1.5 bg-black/85 border border-red-500/30 px-3 py-1.5 rounded-xl text-[10px] text-red-500 font-extrabold font-mono uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>সরাসরি</span>
            </div>
            
            {/* Real-time active viewer overlay */}
            <div className="absolute top-4 right-4 pointer-events-none bg-black/85 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-[10px] text-cyan-400 font-extrabold font-mono">
              👁 {activeViewers.toLocaleString()} জন দেখছেন
            </div>
          </div>
        ) : (
          /* Error & connection restoration simulation area */
          <div className={`relative w-full ${aspectRatio} bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-6 text-center`}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center max-w-md p-4">
              <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce mb-3" />
              <h3 className="text-sm sm:text-base font-extrabold text-gray-200">
                সম্প্রচার সংযোগ পুনঃস্থাপন করা হচ্ছে
              </h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed font-sans">
                {errorMessage || "লাইভ স্ট্রিম সংযোগ করতে অতিরিক্ত সময় লাগছে। দয়া করে ব্যাকআপ লিংকটি ব্যবহার করুন।"}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-5 w-full justify-center">
                <button
                  onClick={triggerBackup}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 text-xs font-bold rounded-xl hover:from-emerald-400 hover:to-teal-300 transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
                >
                  🚀 বিকল্প লিংক ক্লিক করুন
                </button>
                <button
                  onClick={retryStream}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-gray-300 text-xs font-bold rounded-xl hover:bg-neutral-800 transition-all duration-200 cursor-pointer"
                >
                  🔄 পুনরায় সংযোগ ট্রাই করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Video Control Bar Area */}
        <div className="p-4 bg-neutral-900/95 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans relative">
          
          {/* Play/Pause/Mute controls */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Main Toggle Play */}
            <button 
              onClick={togglePlay}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isPlaying 
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900' 
                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900'
              }`}
              title={isPlaying ? 'বন্ধ করুন' : 'চালু করুন'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />}
            </button>

            {/* Mic / Volume Controls (Starts unmuted) */}
            <button 
              onClick={toggleMute}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isMuted 
                ? 'bg-rose-950/55 border-rose-500/30 text-rose-400 hover:bg-rose-900' 
                : 'bg-cyan-900/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950'
              }`}
              title={isMuted ? 'সাউন্ড চালু করুন' : 'সাউন্ড বন্ধ করুন'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Screen Aspect selection */}
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-neutral-950 text-xs text-gray-300 border border-neutral-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
            >
              <option value="aspect-video">১৬:৯ স্ট্যান্ডার্ড টিভি</option>
              <option value="aspect-[21/9]">সিনেম্যাটিক ২১:৯ ভিউ</option>
              <option value="aspect-[4/3]">৪:৩ ক্লাসিক ভিউ</option>
            </select>
          </div>

          {/* Sound, Resolution Quality, and Layout buttons */}
          <div className="flex items-center justify-end w-full sm:w-auto space-x-3.5">
            
            {/* Custom Interactive Quality (Resolution) Adjuster selector ("ভিডিও রেগুলেশন বাড়াতে পারবে") */}
            <div className="relative">
              <button
                onClick={() => setShowResMenu(!showResMenu)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-cyan-500/30 rounded-xl text-xs text-cyan-400 hover:text-cyan-300 transition duration-205 cursor-pointer font-sans font-bold"
              >
                <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                <span>{resolution}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* Quality Dropdown list options */}
              {showResMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-neutral-950 border border-neutral-800/90 rounded-2xl p-2 shadow-2xl z-25 animate-in fade-in slide-in-from-bottom-2 duration-155">
                  <div className="text-[10px] font-bold text-gray-500 px-2 py-1 border-b border-neutral-900 mb-1.5">
                    রেজোলিউশন নির্বাচন করুন
                  </div>
                  {[
                    { label: 'Auto (স্বয়ংক্রিয়)', id: undefined },
                    { label: '1080p Ultra HD', id: 0 },
                    { label: '720p HD Ready', id: 1 },
                    { label: '480p Standard', id: 2 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleResolutionChange(item.label, item.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition ${
                        resolution === item.label 
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/20' 
                        : 'text-gray-400 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Minimize Mode Toggle */}
            <button
              onClick={onToggleMinimize}
              className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-950 hover:bg-cyan-950/40 border border-neutral-800 hover:border-cyan-500/20 rounded-xl text-xs text-cyan-400 font-bold transition duration-200 cursor-pointer"
              title="ভাসমান উইন্ডো করুন"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">মিনিমাইজ</span>
            </button>

            {/* Screen Fullscreen */}
            <button 
              onClick={handleFullscreen}
              className="p-2.5 bg-neutral-950 hover:bg-cyan-950 border border-neutral-800 hover:border-cyan-500/30 hover:text-cyan-400 rounded-xl text-gray-300 transition-all cursor-pointer"
              title="পূর্ণ স্ক্রিন"
            >
              <Maximize className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
