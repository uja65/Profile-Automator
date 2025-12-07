import ProjectCard from "./ProjectCard";
import type { Platform } from "./PlatformBadge";
import { Film } from "lucide-react";

interface Project {
  id: string;
  title: string;
  year: string;
  role: string;
  coverImage?: string;
  platform: Platform;
  collaborators?: string[];
  hasVideo?: boolean;
  videoUrl?: string;
}

interface ProjectGridProps {
  projects: Project[];
  title?: string;
  onPlayVideo?: (projectId: string) => void;
}

export default function ProjectGrid({ 
  projects, 
  title = "Projects",
  onPlayVideo 
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <section className="py-12" data-testid="section-projects-empty">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-16">
            <Film className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">No projects found</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12" data-testid="section-projects">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-semibold font-display mb-8">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onPlay={() => onPlayVideo?.(project.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
