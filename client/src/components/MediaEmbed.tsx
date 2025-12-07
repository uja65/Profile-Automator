import { useState } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";
import { Play, X } from "lucide-react";
import PlatformBadge, { type Platform } from "./PlatformBadge";
import SourceTag from "./SourceTag";

interface MediaEmbedProps {
  url: string;
  title: string;
  description?: string;
  platform: Platform;
  thumbnail?: string;
}

export default function MediaEmbed({
  url,
  title,
  description,
  platform,
  thumbnail,
}: MediaEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlay = () => {
    setShowPlayer(true);
    setIsPlaying(true);
  };

  const handleClose = () => {
    setShowPlayer(false);
    setIsPlaying(false);
  };

  return (
    <Card className="overflow-hidden" data-testid="card-media-embed">
      <div className="relative aspect-video bg-muted">
        {showPlayer ? (
          <>
            <ReactPlayer
              url={url}
              playing={isPlaying}
              controls
              width="100%"
              height="100%"
              className="absolute inset-0"
            />
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover-elevate"
              data-testid="button-close-media"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <PlatformBadge platform={platform} className="scale-150" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover-elevate active-elevate-2 transition-transform hover:scale-110"
                data-testid="button-play-media"
              >
                <Play className="w-7 h-7 text-foreground fill-foreground ml-1" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium font-display line-clamp-1" data-testid="text-media-title">
            {title}
          </h4>
          <PlatformBadge platform={platform} />
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        <SourceTag platform={platform} />
      </div>
    </Card>
  );
}
