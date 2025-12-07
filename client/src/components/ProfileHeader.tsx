import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PlatformBadge, { type Platform } from "./PlatformBadge";
import { Film, Calendar, Globe } from "lucide-react";

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
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="py-12 md:py-16" data-testid="section-profile-header">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
          <Avatar className="w-32 h-32 md:w-48 md:h-48 shadow-lg mx-auto md:mx-0">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback className="text-3xl md:text-5xl font-display bg-gradient-to-br from-primary/20 to-primary/40">
              {initials}
            </AvatarFallback>
          </Avatar>

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
    </header>
  );
}
