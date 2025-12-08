import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { generateProfileRequestSchema } from "@shared/schema";
import type { Profile } from "@shared/schema";
import { crawlUrl, normalizeUrl, hashUrl } from "./services/crawler";
import { searchWithPerplexity } from "./services/perplexity";
import { synthesizeProfile } from "./services/gemini";
import { enrichProjectsWithPosters } from "./services/omdb";
import { fetchChannelVideos, formatYouTubeDate } from "./services/youtube";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Generate a new profile from URL
  app.post("/api/profiles/generate", async (req, res) => {
    try {
      const parsed = generateProfileRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parsed.error.errors 
        });
      }

      const { url } = parsed.data;
      const normalizedUrl = normalizeUrl(url);
      const urlHash = hashUrl(normalizedUrl);

      // Check if we already have this profile cached
      const existingProfile = await storage.getProfileByUrlHash(urlHash);
      if (existingProfile) {
        return res.json(existingProfile);
      }

      // Step 1: Crawl the URL
      console.log("Crawling URL:", normalizedUrl);
      const crawledData = await crawlUrl(normalizedUrl);

      // Step 2: Enrich with Perplexity search
      console.log("Enriching with Perplexity...");
      const nameHint = crawledData.title?.split(/[-–|]/)[0].trim() || "";
      const enrichmentData = await searchWithPerplexity(
        nameHint,
        crawledData.textContent
      );

      // Step 3: Synthesize with Gemini
      console.log("Synthesizing with Gemini...");
      const synthesisResult = await synthesizeProfile(crawledData, enrichmentData);

      // Step 4: Enrich projects with OMDB posters
      console.log("Enriching with OMDB posters...");
      const enrichedProjects = await enrichProjectsWithPosters(synthesisResult.projects);

      // Step 5: Fetch YouTube videos if channel URL exists
      console.log("Fetching YouTube videos...");
      let mediaItems = [...synthesisResult.media];
      const youtubeLink = crawledData.socialLinks.find(l => l.platform === 'youtube');
      if (youtubeLink) {
        const youtubeVideos = await fetchChannelVideos(youtubeLink.url);
        const videoMedia = youtubeVideos.map(video => ({
          type: "video" as const,
          url: video.url,
          title: video.title,
          thumbnail: video.thumbnail,
          date: formatYouTubeDate(video.publishedAt),
        }));
        mediaItems = [...videoMedia, ...mediaItems.filter(m => !m.url.includes('youtube.com'))];
      }

      // Step 6: Build the final profile
      const profile: Profile = {
        id: randomUUID(),
        urlHash,
        sourceUrl: normalizedUrl,
        name: synthesisResult.name,
        role: synthesisResult.role,
        bio: synthesisResult.bio,
        imageUrl: crawledData.images[0],
        projectCount: enrichedProjects.length,
        yearsActive: synthesisResult.yearsActive,
        platforms: synthesisResult.platforms,
        socialLinks: crawledData.socialLinks.length > 0 
          ? crawledData.socialLinks 
          : synthesisResult.platforms.map(p => ({ platform: p, url: normalizedUrl })),
        confidence: synthesisResult.confidence,
        projects: enrichedProjects,
        media: mediaItems,
        crawledData: {
          title: crawledData.title,
          description: crawledData.description,
          imageCount: crawledData.images.length,
        },
        createdAt: new Date().toISOString(),
      };

      // Store the profile
      await storage.createProfile(profile);

      console.log("Profile created:", profile.id);
      return res.json(profile);
    } catch (error) {
      console.error("Profile generation error:", error);
      return res.status(500).json({ 
        error: "Failed to generate profile",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get a profile by ID
  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ error: "Failed to get profile" });
    }
  });

  // Get all profiles
  app.get("/api/profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      return res.json(profiles);
    } catch (error) {
      console.error("Get profiles error:", error);
      return res.status(500).json({ error: "Failed to get profiles" });
    }
  });

  return httpServer;
}
