import ProjectCard from "../ProjectCard";

export default function ProjectCardExample() {
  return (
    <div className="max-w-sm">
      <ProjectCard
        id="oppenheimer"
        title="Oppenheimer"
        year="2023"
        role="Director, Writer, Producer"
        coverImage="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop"
        platform="imdb"
        collaborators={["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."]}
        hasVideo={true}
        onPlay={() => console.log("Playing trailer")}
      />
    </div>
  );
}
