'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Maximize2 
} from 'lucide-react';

export interface ProjectMediaItem {
  type: 'image' | 'video';
  url: string;
}

interface ProjectMediaCarouselProps {
  images?: string[];
  videos?: string[];
  thumbnailImage?: string;
  image?: string;
  videoUrl?: string;
  autoPlay?: boolean;
  interval?: number;
  title?: string;
  className?: string;
  onOpenModal?: () => void;
}

export function ProjectMediaCarousel({
  images = [],
  videos = [],
  thumbnailImage = '',
  image = '',
  videoUrl = '',
  autoPlay = true,
  interval = 4000,
  title = 'Project Media',
  className = '',
  onOpenModal,
}: ProjectMediaCarouselProps) {
  // Aggregate all media items
  const mediaList: ProjectMediaItem[] = [];

  // Add primary thumbnail or image first
  const primaryThumb = thumbnailImage || image;
  if (primaryThumb) {
    mediaList.push({ type: 'image', url: primaryThumb });
  }

  // Add additional images
  if (Array.isArray(images)) {
    images.forEach(img => {
      if (img && !mediaList.some(m => m.url === img)) {
        mediaList.push({ type: 'image', url: img });
      }
    });
  }

  // Add videoUrl
  if (videoUrl && !mediaList.some(m => m.url === videoUrl)) {
    mediaList.push({ type: 'video', url: videoUrl });
  }

  // Add additional videos
  if (Array.isArray(videos)) {
    videos.forEach(vid => {
      if (vid && !mediaList.some(m => m.url === vid)) {
        mediaList.push({ type: 'video', url: vid });
      }
    });
  }

  // Default fallback if no media exists
  const hasMedia = mediaList.length > 0;
  const items = hasMedia ? mediaList : [{ type: 'image' as const, url: '/project-placeholder.jpg' }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play interval effect
  useEffect(() => {
    if (!isPlaying || isHovered || items.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, Math.max(2500, interval));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, items.length, interval]);

  const goToPrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };

  const goToNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  const currentItem = items[currentIndex] || items[0];

  const isEmbedVideo = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1`;
    }
    return url;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-surface-elevated group border border-border/60 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Slide Container */}
      <div className="w-full h-full relative flex items-center justify-center bg-surface-elevated/90 overflow-hidden">
        {/* Ambient atmospheric blurred backdrop */}
        {currentItem.type === 'image' && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-125 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${currentItem.url})` }}
          />
        )}

        {currentItem.type === 'video' ? (
          isEmbedVideo(currentItem.url) ? (
            <iframe
              src={getEmbedUrl(currentItem.url)}
              title={title}
              className="relative z-10 w-full h-full object-contain border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={currentItem.url}
              src={currentItem.url}
              autoPlay
              muted
              loop
              playsInline
              className="relative z-10 w-full h-full object-contain p-1"
            />
          )
        ) : (
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt={`${title} - Slide ${currentIndex + 1}`}
            className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02] drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none z-10 opacity-70 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Top Media Info Bar */}
      {items.length > 1 && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-[10px] font-mono font-semibold text-text-secondary">
          {currentItem.type === 'video' ? (
            <VideoIcon className="w-3 h-3 text-primary animate-pulse" />
          ) : (
            <ImageIcon className="w-3 h-3 text-cyan-400" />
          )}
          <span>
            {currentIndex + 1} / {items.length}
          </span>
          {autoPlay && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="ml-1 text-text-secondary hover:text-foreground cursor-pointer"
              title={isPlaying ? 'Pause Auto-slide' : 'Play Auto-slide'}
            >
              {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>
      )}

      {/* Fullscreen Expand Action if provided */}
      {onOpenModal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal();
          }}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-text-secondary hover:text-foreground hover:scale-105 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          title="Expand Media Carousel"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Navigation Controls: Chevrons */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev(e);
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 pointer-events-auto p-2 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/70 text-foreground transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 shadow-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext(e);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 pointer-events-auto p-2 rounded-full bg-background/80 hover:bg-background backdrop-blur-md border border-border/70 text-foreground transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 shadow-md"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border/40">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 gradient-brand-bg shadow-sm'
                  : 'w-1.5 bg-foreground/30 hover:bg-foreground/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
