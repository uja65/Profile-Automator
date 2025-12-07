import { useState } from "react";
import URLInputForm from "@/components/URLInputForm";
import ProfileHeader from "@/components/ProfileHeader";
import ProjectGrid from "@/components/ProjectGrid";
import MediaGallery from "@/components/MediaGallery";
import LoadingState from "@/components/LoadingState";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowUp, Sparkles } from "lucide-react";
import type { Platform } from "@/components/PlatformBadge";

// todo: remove mock functionality - this is demo data
const mockProfileData = {
  name: "Christopher Nolan",
  role: "Film Director, Producer, Screenwriter",
  bio: "Christopher Edward Nolan is a British-American filmmaker known for his distinctive storytelling approach and visual style. His films have grossed over $5 billion worldwide and have received numerous accolades, including Academy Awards for Best Director and Best Picture for Oppenheimer (2023). Known for exploring complex themes of time, memory, and identity through intricate narrative structures.",
  imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  projectCount: 12,
  yearsActive: "1998 - Present",
  platforms: ["imdb", "youtube", "vimeo"] as Platform[],
  socialLinks: [
    { platform: "imdb" as Platform, url: "https://imdb.com" },
    { platform: "youtube" as Platform, url: "https://youtube.com" },
    { platform: "linkedin" as Platform, url: "https://linkedin.com" },
  ],
  confidence: 0.94,
};

// todo: remove mock functionality
const mockProjects = [
  {
    id: "1",
    title: "Oppenheimer",
    year: "2023",
    role: "Director, Writer, Producer",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop",
    platform: "imdb" as Platform,
    collaborators: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
    hasVideo: true,
  },
  {
    id: "2",
    title: "Tenet",
    year: "2020",
    role: "Director, Writer, Producer",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=340&fit=crop",
    platform: "tmdb" as Platform,
    collaborators: ["John David Washington", "Elizabeth Debicki"],
    hasVideo: true,
  },
  {
    id: "3",
    title: "Dunkirk",
    year: "2017",
    role: "Director, Writer, Producer",
    coverImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=340&fit=crop",
    platform: "youtube" as Platform,
    collaborators: ["Fionn Whitehead", "Tom Hardy"],
    hasVideo: false,
  },
  {
    id: "4",
    title: "Interstellar",
    year: "2014",
    role: "Director, Writer, Producer",
    coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=340&fit=crop",
    platform: "imdb" as Platform,
    collaborators: ["Matthew McConaughey", "Anne Hathaway"],
    hasVideo: true,
  },
  {
    id: "5",
    title: "The Dark Knight",
    year: "2008",
    role: "Director, Writer",
    coverImage: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&h=340&fit=crop",
    platform: "imdb" as Platform,
    collaborators: ["Christian Bale", "Heath Ledger"],
    hasVideo: true,
  },
  {
    id: "6",
    title: "Inception",
    year: "2010",
    role: "Director, Writer, Producer",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=340&fit=crop",
    platform: "vimeo" as Platform,
    collaborators: ["Leonardo DiCaprio", "Marion Cotillard"],
    hasVideo: true,
  },
];

// todo: remove mock functionality
const mockMedia = [
  {
    id: "1",
    url: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    title: "Oppenheimer - Official Trailer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    platform: "youtube" as Platform,
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop",
  },
  {
    id: "2",
    url: "https://www.youtube.com/watch?v=LdOM0x0XDMo",
    title: "Tenet - Official Trailer",
    description: "Armed with only one word, a CIA operative journeys through a twilight world of international espionage.",
    platform: "youtube" as Platform,
    thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=340&fit=crop",
  },
];

type AppState = "input" | "loading" | "profile";
type LoadingStage = "crawling" | "aggregating" | "synthesizing" | "building";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("crawling");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // todo: remove mock functionality - replace with actual API call
  const handleSubmit = async (url: string) => {
    console.log("Generating profile for:", url);
    setAppState("loading");
    
    const stages: LoadingStage[] = ["crawling", "aggregating", "synthesizing", "building"];
    for (let i = 0; i < stages.length; i++) {
      setLoadingStage(stages[i]);
      await new Promise((r) => setTimeout(r, 1000));
    }
    
    setAppState("profile");
  };

  const handleReset = () => {
    setAppState("input");
  };

  const handlePlayVideo = (projectId: string) => {
    console.log("Playing video for project:", projectId);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle scroll for back-to-top button
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setShowScrollTop(window.scrollY > 400);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 font-display font-bold text-lg hover-elevate active-elevate-2 rounded-md px-2 py-1"
            data-testid="button-logo"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            Auto Profile
          </button>
          
          <div className="flex items-center gap-2">
            {appState === "profile" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                data-testid="button-new-profile"
              >
                New Profile
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        {appState === "input" && (
          <div className="py-20 md:py-32">
            <div className="max-w-4xl mx-auto px-6 text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-4">
                AI-Powered Profile Generator
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Transform any creator's online presence into a verified, visually engaging portfolio
              </p>
            </div>
            <URLInputForm onSubmit={handleSubmit} />
          </div>
        )}

        {appState === "loading" && (
          <LoadingState stage={loadingStage} />
        )}

        {appState === "profile" && (
          <>
            <ProfileHeader {...mockProfileData} />
            
            <div className="border-t" />
            
            <ProjectGrid 
              projects={mockProjects} 
              title="Featured Projects"
              onPlayVideo={handlePlayVideo}
            />
            
            <div className="border-t" />
            
            <MediaGallery items={mockMedia} title="Videos & Media" />
            
            <div className="py-12">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Profile generated with AI confidence score of 94%. Data sourced from IMDb, YouTube, and personal website.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {showScrollTop && (
        <Button
          size="icon"
          variant="secondary"
          className="fixed bottom-6 right-6 z-40 shadow-lg"
          onClick={scrollToTop}
          data-testid="button-scroll-top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
