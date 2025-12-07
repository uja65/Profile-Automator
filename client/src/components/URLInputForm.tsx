import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Loader2, Camera, ArrowRight } from "lucide-react";

interface URLInputFormProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export default function URLInputForm({ onSubmit, isLoading = false }: URLInputFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    if (!validateUrl(normalizedUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    onSubmit(normalizedUrl);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card" data-testid="card-url-input">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl md:text-3xl font-display">
          Enhanced Profile Analysis
        </CardTitle>
        <CardDescription className="text-base">
          Transform your portfolio into a stunning professional profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Link className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="https://yourportfolio.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              className="pl-11 h-12 text-base"
              disabled={isLoading}
              data-testid="input-url"
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive" data-testid="text-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 glow-button"
            disabled={isLoading}
            data-testid="button-generate"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Profile...
              </>
            ) : (
              <>
                Generate Profile
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

      </CardContent>
    </Card>
  );
}
