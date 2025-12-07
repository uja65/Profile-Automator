import ProjectGrid from "../ProjectGrid";

const mockProjects = [
  {
    id: "1",
    title: "Oppenheimer",
    year: "2023",
    role: "Director",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop",
    platform: "imdb" as const,
    collaborators: ["Cillian Murphy", "Emily Blunt"],
    hasVideo: true,
  },
  {
    id: "2",
    title: "Tenet",
    year: "2020",
    role: "Director, Writer",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=340&fit=crop",
    platform: "tmdb" as const,
    collaborators: ["John David Washington"],
    hasVideo: true,
  },
  {
    id: "3",
    title: "Dunkirk",
    year: "2017",
    role: "Director",
    coverImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=340&fit=crop",
    platform: "youtube" as const,
    hasVideo: false,
  },
];

export default function ProjectGridExample() {
  return (
    <ProjectGrid
      projects={mockProjects}
      title="Featured Projects"
      onPlayVideo={(id) => console.log("Play video for:", id)}
    />
  );
}
