import { useState, type MouseEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PlatformBadge, { type Platform } from "./PlatformBadge";
import SourceTag from "./SourceTag";
import { Play, Users, Calendar, Pencil, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  year: string;
  role: string;
  coverImage?: string;
  platform: Platform;
  collaborators?: string[];
  hasVideo?: boolean;
  videoUrl?: string;
  sourceUrl?: string;
  onPlay?: () => void;
  profileId?: string;
  onCoverUpdated?: (projectId: string, newCoverImage: string) => void;
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
  videoUrl,
  sourceUrl,
  onPlay,
  profileId,
  onCoverUpdated,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    } else if (sourceUrl) {
      window.open(sourceUrl, '_blank', 'noopener,noreferrer');
    } else if (hasVideo && onPlay) {
      onPlay();
    }
  };

  const handleEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    setNewCoverUrl(coverImage || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveCover = async () => {
    if (!profileId || !newCoverUrl.trim()) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/profiles/${profileId}/projects/${id}/cover`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: newCoverUrl.trim() }),
      });
      
      if (response.ok) {
        onCoverUpdated?.(id, newCoverUrl.trim());
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update cover:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className="group overflow-visible cursor-pointer hover-elevate active-elevate-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
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

        {profileId && (
          <button
            onClick={handleEditClick}
            className={`absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            data-testid={`button-edit-cover-${id}`}
          >
            <Pencil className="w-4 h-4 text-white" />
          </button>
        )}

        {(hasVideo || videoUrl) && (
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover-elevate active-elevate-2"
              data-testid={`button-play-${id}`}
            >
              <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
            </button>
          </div>
        )}

        {!hasVideo && !videoUrl && sourceUrl && (
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover-elevate active-elevate-2"
              data-testid={`button-link-${id}`}
            >
              <ExternalLink className="w-6 h-6 text-foreground" />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cover Image</DialogTitle>
            <DialogDescription>
              Paste a URL to a new cover image for "{title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://example.com/image.jpg"
              value={newCoverUrl}
              onChange={(e) => setNewCoverUrl(e.target.value)}
              data-testid="input-cover-url"
            />
            {newCoverUrl && (
              <div className="mt-4 aspect-video rounded-md overflow-hidden bg-muted">
                <img
                  src={newCoverUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-cover"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCover}
              disabled={isUpdating || !newCoverUrl.trim()}
              data-testid="button-save-cover"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
