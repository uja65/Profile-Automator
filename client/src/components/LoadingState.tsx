import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  stage?: "crawling" | "aggregating" | "synthesizing" | "building";
}

const stageLabels = {
  crawling: "Crawling URL...",
  aggregating: "Aggregating data from platforms...",
  synthesizing: "AI is synthesizing profile...",
  building: "Building your profile...",
};

export function ProfileLoadingState({ stage = "crawling" }: LoadingStateProps) {
  return (
    <div className="py-12 md:py-16" data-testid="loading-profile">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium font-display">{stageLabels[stage]}</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        </div>

        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start mt-8">
          <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto md:mx-0" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto md:mx-0" />
            <Skeleton className="h-6 w-1/2 mx-auto md:mx-0" />
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsLoadingState() {
  return (
    <div className="py-12" data-testid="loading-projects">
      <div className="max-w-7xl mx-auto px-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoadingState({ stage }: LoadingStateProps) {
  return (
    <>
      <ProfileLoadingState stage={stage} />
      <ProjectsLoadingState />
    </>
  );
}
