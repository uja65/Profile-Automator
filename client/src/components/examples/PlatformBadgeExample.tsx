import PlatformBadge from "../PlatformBadge";

export default function PlatformBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="imdb" />
      <PlatformBadge platform="youtube" />
      <PlatformBadge platform="vimeo" />
      <PlatformBadge platform="linkedin" />
      <PlatformBadge platform="tmdb" />
    </div>
  );
}
