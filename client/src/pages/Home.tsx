import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import URLInputForm from "@/components/URLInputForm";
import ProfileHeader from "@/components/ProfileHeader";
import ProjectGrid from "@/components/ProjectGrid";
import MediaGallery from "@/components/MediaGallery";
import LoadingState from "@/components/LoadingState";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowUp, Sparkles, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";

type AppState = "input" | "loading" | "profile" | "error";
type LoadingStage = "crawling" | "aggregating" | "synthesizing" | "building";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("crawling");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/profiles/generate", { url });
      return response.json() as Promise<Profile>;
    },
    onSuccess: (data) => {
      setProfile(data);
      setAppState("profile");
    },
    onError: (error) => {
      console.error("Generation failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate profile");
      setAppState("error");
    },
  });

  const handleSubmit = async (url: string) => {
    setAppState("loading");
    setErrorMessage("");
    
    // Simulate stage progression while waiting for API
    const stages: LoadingStage[] = ["crawling", "aggregating", "synthesizing", "building"];
    let stageIndex = 0;
    
    const stageInterval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stages.length - 1);
      setLoadingStage(stages[stageIndex]);
    }, 3000);

    try {
      await generateMutation.mutateAsync(url);
    } finally {
      clearInterval(stageInterval);
    }
  };

  const handleReset = () => {
    setAppState("input");
    setProfile(null);
    setErrorMessage("");
  };

  const handlePlayVideo = (projectId: string) => {
    console.log("Playing video for project:", projectId);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            Tabb Profile
          </button>
          
          <div className="flex items-center gap-2">
            {(appState === "profile" || appState === "error") && (
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
            </div>
            <URLInputForm onSubmit={handleSubmit} isLoading={generateMutation.isPending} />
          </div>
        )}

        {appState === "loading" && (
          <LoadingState stage={loadingStage} />
        )}

        {appState === "error" && (
          <div className="py-20 md:py-32">
            <div className="max-w-md mx-auto px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Generation Failed</h2>
              <p className="text-muted-foreground mb-6">{errorMessage || "Something went wrong. Please try again."}</p>
              <Button onClick={handleReset} data-testid="button-try-again">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {appState === "profile" && profile && (
          <>
            <ProfileHeader 
              name={profile.name}
              role={profile.role}
              bio={profile.bio}
              imageUrl={profile.imageUrl}
              projectCount={profile.projectCount}
              yearsActive={profile.yearsActive}
              platforms={profile.platforms}
              socialLinks={profile.socialLinks}
            />
            
            <div className="border-t" />
            
            <ProjectGrid 
              projects={profile.projects} 
              title="Featured Projects"
              onPlayVideo={handlePlayVideo}
            />
            
            {profile.media.length > 0 && (
              <>
                <div className="border-t" />
                <MediaGallery items={profile.media} title="Videos & Media" />
              </>
            )}
            
            <div className="py-12">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Data sourced from {profile.platforms.join(", ")}.
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
