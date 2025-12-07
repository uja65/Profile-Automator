import MediaEmbed from "./MediaEmbed";
import type { Platform } from "./PlatformBadge";
import { Video } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  platform: Platform;
  thumbnail?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  title?: string;
}

export default function MediaGallery({ items, title = "Media" }: MediaGalleryProps) {
  if (items.length === 0) {
    return (
      <section className="py-12" data-testid="section-media-empty">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold font-display mb-8">
            {title}
          </h2>
          <div className="text-center py-16">
            <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">No media found</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12" data-testid="section-media">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-semibold font-display mb-8">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {items.map((item) => (
            <MediaEmbed
              key={item.id}
              url={item.url}
              title={item.title}
              description={item.description}
              platform={item.platform}
              thumbnail={item.thumbnail}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
