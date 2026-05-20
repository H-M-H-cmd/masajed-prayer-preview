"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSwipeable } from "react-swipeable";
import Image from "next/image";

interface CarouselProps {
  images: string[];
  currentIndex?: number;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "full";
  variant?: "default" | "minimal";
  showDots?: boolean;
  contain?: boolean;
  autoPlay?: boolean;
  interval?: number;
  showOverlay?: boolean;
  noRounded?: boolean;
  hideLockIcon?: boolean;
}

export function Carousel({
  images,
  currentIndex: initialIndex = 0,
  className,
  aspectRatio = "video",
  variant = "default",
  showDots = true,
  contain = false,
  autoPlay = true,
  interval = 5000,
  showOverlay = false,
  noRounded = false,
  hideLockIcon = false,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [isAutoPlayLocked, setIsAutoPlayLocked] = React.useState(false);
  const [showControls, setShowControls] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    full: "h-[40vh]",
  };

  React.useEffect(() => {
    if (autoPlay && !isAutoPlayLocked && !isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, images.length, interval, isHovered, isAutoPlayLocked]);

  const handlePrevious = React.useCallback(() => {
    setHasInteracted(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = React.useCallback(() => {
    setHasInteracted(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleDotClick = (index: number) => {
    setHasInteracted(true);
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlayLocked(!isAutoPlayLocked);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  const showControlsWithDelay = () => {
    setShowControls(true);
    setHasInteracted(true);
  };

  const hideControls = () => {
    setShowControls(false);
  };

  // Update swipe handlers
  const { ref: swipeableRef, ...swipeHandlers } = useSwipeable({
    onSwipeStart: () => {
      showControlsWithDelay();
    },
    onSwiping: () => {
      setShowControls(true);
    },
    onSwipedLeft: () => {
      handleNext();
      hideControls();
    },
    onSwipedRight: () => {
      handlePrevious();
      hideControls();
    },
    onTouchEndOrOnMouseUp: () => {
      hideControls();
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // Combine refs
  React.useEffect(() => {
    if (containerRef.current) {
      swipeableRef(containerRef.current);
    }
  }, [swipeableRef]);

  return (
    <div
      ref={containerRef}
      className={cn("relative group", className)}
      onMouseEnter={() => {
        setIsHovered(true);
        showControlsWithDelay();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        hideControls();
      }}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
      {...swipeHandlers}
    >
      <div 
        className={cn(
          "relative overflow-hidden",
          aspectRatioClasses[aspectRatio],
          !noRounded && aspectRatio !== "full" && "rounded-lg"
        )}
      >
        {images.map((image, index) => (
          <div
            key={image}
            className={cn(
              "absolute inset-0 w-full h-full transition-transform duration-500",
              index === currentIndex ? "translate-x-0" : index < currentIndex ? "-translate-x-full" : "translate-x-full"
            )}
            aria-hidden={index !== currentIndex}
          >
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className={cn("object-cover", contain && "object-contain")}
              priority={index === currentIndex}
            />
          </div>
        ))}

        {/* Animated Overlay - Keep smooth transition */}
        {showOverlay && (
          <div 
            className={cn(
              "absolute inset-0",
              "bg-gradient-to-t from-background/80 via-background/20 to-transparent",
              "transition-opacity duration-200 ease-in-out",
              (isHovered || showControls) ? "opacity-0" : "opacity-100"
            )}
          />
        )}
      </div>

      {/* Auto-play toggle icon - Update condition */}
      {!hideLockIcon && (hasInteracted || showControls) && (
        <div
          onClick={toggleAutoPlay}
          role="button"
          aria-label={isAutoPlayLocked ? "Enable auto-play" : "Disable auto-play"}
          className={cn(
            "absolute top-4 right-4 z-20 cursor-pointer",
            "transition-all duration-200 ease-in-out",
            (showControls || isHovered) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}
        >
          {isAutoPlayLocked ? (
            <Lock className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          ) : (
            <Unlock className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          )}
        </div>
      )}

      {variant === "default" && images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "bg-background/50 hover:bg-background/80"
            )}
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "bg-background/50 hover:bg-background/80"
            )}
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div 
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20"
          role="tablist"
          aria-label="Choose image to display"
        >
          {images.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`Image ${index + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-primary w-4"
                  : "bg-primary/50 hover:bg-primary/75"
              )}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 