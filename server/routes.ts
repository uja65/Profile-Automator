import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { generateProfileRequestSchema } from "@shared/schema";
import type { Profile } from "@shared/schema";
import { crawlUrl, normalizeUrl, hashUrl } from "./services/crawler";
import { searchWithPerplexity } from "./services/perplexity";
import { synthesizeProfile } from "./services/gemini";
import { enrichProjectsWithPosters } from "./services/tmdb";
import { fetchChannelVideos, formatYouTubeDate } from "./services/youtube";
import { getVimeoThumbnail, isVimeoUrl, fetchVimeoUserVideos, formatVimeoDate, VimeoVideo } from "./services/vimeo";

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

      // Step 4: Enrich projects with TMDB posters
      console.log("Enriching with TMDB posters...");
      const enrichedProjects = await enrichProjectsWithPosters(synthesisResult.projects);

      // Step 5: Fetch YouTube videos if channel URL exists
      console.log("Fetching YouTube videos...");
      let mediaItems = [...synthesisResult.media];
      let youtubeVideos: { url: string; title: string; thumbnail: string; publishedAt: string }[] = [];
      const youtubeLink = crawledData.socialLinks.find(l => l.platform === 'youtube');
      if (youtubeLink) {
        youtubeVideos = await fetchChannelVideos(youtubeLink.url);
        const videoMedia = youtubeVideos.map(video => ({
          type: "video" as const,
          url: video.url,
          title: video.title,
          thumbnail: video.thumbnail,
          date: formatYouTubeDate(video.publishedAt),
        }));
        mediaItems = [...videoMedia, ...mediaItems.filter(m => !m.url.includes('youtube.com'))];
      }

      // Step 5b: Fetch Vimeo videos if channel URL exists
      console.log("Fetching Vimeo videos...");
      let vimeoVideos: VimeoVideo[] = [];
      const vimeoLink = crawledData.socialLinks.find(l => l.platform === 'vimeo');
      if (vimeoLink) {
        vimeoVideos = await fetchVimeoUserVideos(vimeoLink.url);
        const vimeoMedia = vimeoVideos.map(video => ({
          type: "video" as const,
          url: video.url,
          title: video.title,
          thumbnail: video.thumbnail,
          date: formatVimeoDate(video.createdAt),
        }));
        mediaItems = [...mediaItems, ...vimeoMedia.filter(vm => !mediaItems.some(m => m.url === vm.url))];
      }

      // Step 6: Enrich projects with YouTube/Vimeo thumbnails as fallback cover images
      console.log("Enriching projects with video thumbnails...");
      const finalProjects = await Promise.all(enrichedProjects.map(async (project) => {
        if (project.coverImage) return project;
        
        // Try to find a matching YouTube video by title similarity
        const projectTitleLower = project.title.toLowerCase();
        const matchingVideo = youtubeVideos.find(video => {
          const videoTitleLower = video.title.toLowerCase();
          return videoTitleLower.includes(projectTitleLower) || 
                 projectTitleLower.includes(videoTitleLower.split('|')[0].trim()) ||
                 projectTitleLower.split(/[\s-]+/).some(word => 
                   word.length > 3 && videoTitleLower.includes(word)
                 );
        });
        
        if (matchingVideo) {
          console.log(`Using YouTube thumbnail for project: ${project.title}`);
          return { ...project, coverImage: matchingVideo.thumbnail };
        }
        
        // If project has a videoUrl that's a YouTube link, extract thumbnail
        if (project.videoUrl?.includes('youtube.com/watch')) {
          const videoId = project.videoUrl.split('v=')[1]?.split('&')[0];
          if (videoId) {
            console.log(`Using YouTube videoUrl thumbnail for project: ${project.title}`);
            return { ...project, coverImage: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` };
          }
        }
        
        // Try to find a matching Vimeo video by title similarity
        const matchingVimeoVideo = vimeoVideos.find(video => {
          const videoTitleLower = video.title.toLowerCase();
          return videoTitleLower.includes(projectTitleLower) || 
                 projectTitleLower.includes(videoTitleLower.split('|')[0].trim()) ||
                 projectTitleLower.split(/[\s-]+/).some(word => 
                   word.length > 3 && videoTitleLower.includes(word)
                 );
        });
        
        if (matchingVimeoVideo && matchingVimeoVideo.thumbnail) {
          console.log(`Using Vimeo channel thumbnail for project: ${project.title}`);
          return { ...project, coverImage: matchingVimeoVideo.thumbnail };
        }
        
        // Fallback: Try Vimeo oEmbed if project has a Vimeo videoUrl
        if (project.videoUrl && isVimeoUrl(project.videoUrl)) {
          const vimeoThumb = await getVimeoThumbnail(project.videoUrl);
          if (vimeoThumb) {
            console.log(`Using Vimeo oEmbed thumbnail for project: ${project.title}`);
            return { ...project, coverImage: vimeoThumb };
          }
        }
        
        return project;
      }));

      // Step 7: Build the final profile
      // Only use platforms that we actually found links for (from crawled social links)
      const actualPlatforms = crawledData.socialLinks.length > 0
        ? Array.from(new Set(crawledData.socialLinks.map(link => link.platform)))
        : ["website"]; // Default to just website if no social links found

      const profile: Profile = {
        id: randomUUID(),
        urlHash,
        sourceUrl: normalizedUrl,
        name: synthesisResult.name,
        role: synthesisResult.role,
        bio: synthesisResult.bio,
        imageUrl: crawledData.images[0],
        projectCount: finalProjects.length,
        yearsActive: synthesisResult.yearsActive,
        platforms: actualPlatforms,
        socialLinks: crawledData.socialLinks.length > 0 
          ? crawledData.socialLinks 
          : [{ platform: "website" as const, url: normalizedUrl }],
        confidence: synthesisResult.confidence,
        projects: finalProjects,
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

  // Update project cover image
  app.patch("/api/profiles/:profileId/projects/:projectId/cover", async (req, res) => {
    try {
      const { profileId, projectId } = req.params;
      const { coverImage } = req.body;
      
      if (!coverImage || typeof coverImage !== 'string') {
        return res.status(400).json({ error: "coverImage URL is required" });
      }
      
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      const projectIndex = profile.projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      profile.projects[projectIndex] = {
        ...profile.projects[projectIndex],
        coverImage,
        coverImageLocked: true,
      };
      
      await storage.updateProfile(profile.id, profile);
      return res.json(profile.projects[projectIndex]);
    } catch (error) {
      console.error("Update project cover error:", error);
      return res.status(500).json({ error: "Failed to update cover image" });
    }
  });

  return httpServer;
}
