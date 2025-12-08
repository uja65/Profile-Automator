import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
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
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover-elevate" 
      onClick={handleClick}
      data-testid="card-media-embed"
    >
      <div className="relative aspect-video bg-muted">
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
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <ExternalLink className="w-7 h-7 text-foreground" />
          </div>
        </div>
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
