import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Film, Calendar, Globe, Pencil } from "lucide-react";

interface SocialLink {
  platform: Platform;
  url: string;
}

interface ProfileHeaderProps {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  projectCount: number;
  yearsActive: string;
  platforms: Platform[];
  socialLinks: SocialLink[];
  profileId?: string;
  onImageUpdated?: (newImageUrl: string) => void;
}

export default function ProfileHeader({
  name,
  role,
  bio,
  imageUrl,
  projectCount,
  yearsActive,
  platforms,
  socialLinks,
  profileId,
  onImageUpdated,
}: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleEditClick = () => {
    setNewImageUrl(imageUrl || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveImage = async () => {
    if (!profileId || !newImageUrl.trim()) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/profiles/${profileId}/image`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: newImageUrl.trim() }),
      });
      
      if (response.ok) {
        onImageUpdated?.(newImageUrl.trim());
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update image:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <header className="py-12 md:py-16" data-testid="section-profile-header">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
          <div className="relative mx-auto md:mx-0">
            <Avatar className="w-32 h-32 md:w-48 md:h-48 shadow-lg">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback className="text-3xl md:text-5xl font-display bg-gradient-to-br from-primary/20 to-primary/40">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {profileId && (
              <button
                onClick={handleEditClick}
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-200"
                data-testid="button-edit-profile-image"
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <div className="text-center md:text-left space-y-4">
            <div className="space-y-2">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight"
                data-testid="text-profile-name"
              >
                {name}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                {role}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Film className="w-4 h-4" />
                {projectCount} Projects
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {yearsActive}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {platforms.length} Platforms
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-elevate active-elevate-2 rounded-md"
                  data-testid={`link-social-${link.platform}`}
                >
                  <PlatformBadge platform={link.platform} />
                </a>
              ))}
            </div>

            <p 
              className="max-w-3xl text-base leading-relaxed text-foreground/90"
              data-testid="text-profile-bio"
            >
              {bio}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>
              Paste a URL to a new profile picture for {name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://example.com/image.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              data-testid="input-profile-image-url"
            />
            {newImageUrl && (
              <div className="mt-4 flex justify-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={newImageUrl} alt="Preview" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-profile-image"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={isUpdating || !newImageUrl.trim()}
              data-testid="button-save-profile-image"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
