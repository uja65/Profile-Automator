import { useState } from "react";
import { Card } from "@/components/ui/card";
import PlatformBadge, { type Platform } from "./PlatformBadge";
import SourceTag from "./SourceTag";
import { Play, Users, Calendar } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  year: string;
  role: string;
  coverImage?: string;
  platform: Platform;
  collaborators?: string[];
  hasVideo?: boolean;
  onPlay?: () => void;
}

export default function ProjectCard({
  id,
  title,
  year,
  role,
  coverImage,
  platform,
  collaborators = [],
  hasVideo = false,
  onPlay,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group overflow-visible cursor-pointer hover-elevate active-elevate-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-project-${id}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-md">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <span className="text-4xl font-display font-bold text-muted-foreground/30">
              {title[0]}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <PlatformBadge platform={platform} />
        </div>

        {hasVideo && (
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.();
              }}
              className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover-elevate active-elevate-2"
              data-testid={`button-play-${id}`}
            >
              <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 
            className="text-lg font-medium text-white font-display line-clamp-1"
            data-testid={`text-project-title-${id}`}
          >
            {title}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {year}
          </span>
          <span className="font-medium text-foreground">{role}</span>
        </div>

        {collaborators.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{collaborators.slice(0, 2).join(", ")}</span>
            {collaborators.length > 2 && (
              <span className="text-xs">+{collaborators.length - 2}</span>
            )}
          </div>
        )}

        <SourceTag platform={platform} />
      </div>
    </Card>
  );
}
