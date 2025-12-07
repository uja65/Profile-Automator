import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";

interface ConfidenceIndicatorProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export default function ConfidenceIndicator({ score, showLabel = true, size = "md" }: ConfidenceIndicatorProps) {
  const percentage = Math.round(score * 100);
  
  const getColorClass = () => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getLabel = () => {
    if (score >= 0.8) return "High Confidence";
    if (score >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`flex items-center gap-2 ${size === "sm" ? "w-20" : "w-28"}`}
          data-testid="indicator-confidence"
        >
          <div className="flex-1">
            <Progress 
              value={percentage} 
              className={`h-1.5 ${size === "sm" ? "h-1" : "h-1.5"}`}
            />
          </div>
          {showLabel && (
            <span className={`text-xs text-muted-foreground ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
              {percentage}%
            </span>
          )}
          <Info className={`text-muted-foreground ${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm font-medium">{getLabel()}</p>
        <p className="text-xs text-muted-foreground">
          AI confidence score: {percentage}%
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
