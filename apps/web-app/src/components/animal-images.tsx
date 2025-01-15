"use client";

import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatDistance } from "date-fns";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

import type { AnimalMediaType } from "@acme/db/schema";
import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@acme/ui/carousel";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";
import { cn } from "@acme/ui/lib/utils";

import { PhotoUpload } from "~/components/photo-upload";
import { env } from "~/env.client";
import { useClient } from "~/supabase/client";

interface CarouselDotsProps {
  api: EmblaCarouselType | undefined;
}

function CarouselDots({ api }: CarouselDotsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
    },
    [api],
  );

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;

    onInit(api);
    onSelect(api);
    api.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);

    return () => {
      api.off("reInit", onInit).off("reInit", onSelect).off("select", onSelect);
    };
  }, [api, onInit, onSelect]);

  return (
    <div className="flex justify-center gap-2 py-2">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          type="button"
          className={cn(
            "size-2 rounded-full transition-colors",
            index === selectedIndex
              ? "bg-primary"
              : "bg-primary/20 hover:bg-primary/40",
          )}
          onClick={() => onDotButtonClick(index)}
        />
      ))}
    </div>
  );
}

interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string | null;
  onPlay?: () => void;
}

function VideoPlayer({ url, thumbnailUrl, onPlay }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      void videoRef.current.play();
      onPlay?.();
    }

    setIsPlaying(!isPlaying);
  }, [isPlaying, onPlay]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  return (
    <div className="relative aspect-square w-full">
      <video
        ref={videoRef}
        src={url}
        poster={thumbnailUrl ?? undefined}
        muted={isMuted}
        playsInline
        loop
        className="size-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="size-12 rounded-full bg-black/50 text-white hover:bg-black/60"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="size-6" />
          ) : (
            <Play className="size-6 pl-1" />
          )}
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-4 size-8 rounded-full bg-black/50 text-white hover:bg-black/60"
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="size-4" />
        ) : (
          <Volume2 className="size-4" />
        )}
      </Button>
    </div>
  );
}

interface AnimalImagesProps {
  animalId: string;
  shelterId: string;
  name?: string;
  roomId: string;
  kennelId: string;
  media?: AnimalMediaType[];
}

interface MediaMetadata extends Record<string, unknown> {
  uploadedById: string;
  uploadedAt: string;
}

function hasValidMetadata(
  metadata: Record<string, unknown> | undefined,
): metadata is MediaMetadata {
  return (
    metadata !== undefined &&
    typeof metadata.uploadedById === "string" &&
    metadata.uploadedById.length > 0 &&
    typeof metadata.uploadedAt === "string"
  );
}

export function AnimalImages({
  animalId,
  shelterId,
  name,
  roomId,
  kennelId,
  media,
}: AnimalImagesProps) {
  const isMobile = useIsMobile();
  const [carouselApi, setCarouselApi] = useState<EmblaCarouselType>();
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(
    null,
  );
  const [mediaUrls, setMediaUrls] = useState<
    Record<string, AnimalMediaType & { url: string }>
  >({});

  const supabase = useClient();

  useEffect(() => {
    function getPublicUrls() {
      if (!media?.length) return;

      const urls: Record<string, AnimalMediaType & { url: string }> = {};

      for (const item of media) {
        const { data } = supabase.storage
          .from(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET)
          .getPublicUrl(item.s3Path);
        urls[item.s3Path] = {
          ...item,
          url: data.publicUrl,
        };
      }

      setMediaUrls(urls);
    }

    getPublicUrls();
  }, [media, supabase.storage]);

  const handleVideoPlay = useCallback(
    (index: number) => {
      if (currentVideoIndex !== null && currentVideoIndex !== index) {
        const videos = document.querySelectorAll("video");
        videos[currentVideoIndex]?.pause();
      }
      setCurrentVideoIndex(index);
    },
    [currentVideoIndex],
  );

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const videos = document.querySelectorAll("video");
      for (const video of videos) video.pause();
      setCurrentVideoIndex(null);
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (media && media.length > 0) {
    return (
      <div>
        <div className="relative">
          <Carousel
            className={cn("w-full", isMobile && "mt-2")}
            setApi={setCarouselApi}
          >
            <CarouselContent>
              {Object.values(mediaUrls)
                .sort((a, b) => {
                  const dateA = a.createdAt
                    ? new Date(a.createdAt)
                    : new Date(0);
                  const dateB = b.createdAt
                    ? new Date(b.createdAt)
                    : new Date(0);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((item, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square w-full">
                      {item.type.includes("image") ? (
                        <Image
                          src={item.url}
                          alt={`Photo ${index + 1} of ${name}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                      ) : (
                        <VideoPlayer
                          url={item.url}
                          thumbnailUrl={
                            item.thumbnailUrl
                              ? mediaUrls[item.thumbnailUrl]?.url
                              : null
                          }
                          onPlay={() => handleVideoPlay(index)}
                        />
                      )}
                      {item.metadata !== null &&
                        hasValidMetadata(item.metadata) && (
                          <div className="absolute left-0 right-0 top-0 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarFallback>
                                    {item.metadata.uploadedById[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-white drop-shadow-md">
                                    {item.metadata.uploadedById}
                                  </span>
                                  <span className="text-xs text-white/90 drop-shadow-md">
                                    {formatDistance(
                                      new Date(),
                                      new Date(item.metadata.uploadedAt),
                                      {
                                        addSuffix: true,
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      <div className="absolute bottom-4 left-4 right-4">
                        {(item.type === "image" ||
                          currentVideoIndex !== index) && (
                          <PhotoUpload
                            animalId={animalId}
                            roomId={roomId}
                            kennelId={kennelId}
                            shelterId={shelterId}
                            includePreview={false}
                            label="Add Photos"
                            className="w-full bg-transparent backdrop-blur-sm"
                            variant="ghost"
                          />
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
          </Carousel>
          <CarouselDots api={carouselApi} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "relative aspect-square w-full bg-muted",
          isMobile && "mt-2",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="size-32 text-muted-foreground/20"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
            <circle cx="12" cy="12" r="8" />
            <path d="m15 9-3 3-3-3" />
          </svg>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <PhotoUpload
            animalId={animalId}
            roomId=""
            kennelId=""
            shelterId={shelterId}
            includePreview={false}
            label="Add Photos"
            className="w-full bg-transparent backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
}
