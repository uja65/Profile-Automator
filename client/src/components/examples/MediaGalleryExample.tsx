import MediaGallery from "../MediaGallery";

const mockMedia = [
  {
    id: "1",
    url: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    title: "Oppenheimer - Official Trailer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    platform: "youtube" as const,
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop",
  },
  {
    id: "2",
    url: "https://vimeo.com/123456789",
    title: "Behind the Scenes Documentary",
    description: "An exclusive look at the making of the film.",
    platform: "vimeo" as const,
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=340&fit=crop",
  },
];

export default function MediaGalleryExample() {
  return <MediaGallery items={mockMedia} title="Videos & Media" />;
}
