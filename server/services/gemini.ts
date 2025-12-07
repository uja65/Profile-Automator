import { GoogleGenAI } from "@google/genai";
import type { SynthesisResult, CrawledData, Platform, Project, MediaItem } from "@shared/schema";

const platformTypes = ["imdb", "tmdb", "omdb", "youtube", "vimeo", "linkedin", "facebook", "website"] as const;

interface EnrichmentData {
  additionalInfo: string;
  projects: Array<{
    title: string;
    year: string;
    role: string;
    platform: string;
  }>;
  collaborators: string[];
}

export async function synthesizeProfile(
  crawledData: CrawledData,
  enrichmentData: EnrichmentData
): Promise<SynthesisResult> {
  // Use Replit AI Integrations (preferred) or fallback to user's API key
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  
  if (!apiKey) {
    console.warn("No Gemini API key configured, using fallback synthesis");
    return createFallbackProfile(crawledData, enrichmentData);
  }

  try {
    console.log("Gemini API available, attempting synthesis...");
    // Using Replit AI Integrations - requires apiVersion: "" for compatibility
    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: baseUrl ? { apiVersion: "", baseUrl } : undefined
    });

    const prompt = `Analyze the following data about a creative professional and synthesize a unified profile.

CRAWLED DATA FROM THEIR WEBSITE:
Title: ${crawledData.title || "Unknown"}
Description: ${crawledData.description || "None"}
Text Content: ${crawledData.textContent.slice(0, 3000)}
Social Links: ${JSON.stringify(crawledData.socialLinks)}

ADDITIONAL RESEARCH DATA:
${enrichmentData.additionalInfo.slice(0, 2000)}

EXTRACTED PROJECTS:
${JSON.stringify(enrichmentData.projects)}

COLLABORATORS MENTIONED:
${enrichmentData.collaborators.join(", ")}

Please synthesize this information and respond with a JSON object containing:
{
  "name": "Full name of the person",
  "role": "Their primary role/profession (e.g., Film Director, Musician, Designer)",
  "bio": "A comprehensive 2-3 sentence biography",
  "yearsActive": "Year range like '2010 - Present'",
  "confidence": 0.0 to 1.0 (how confident you are in this profile),
  "projects": [
    {
      "id": "unique-id",
      "title": "Project title",
      "year": "2023",
      "role": "Their role",
      "platform": "imdb|youtube|vimeo|tmdb|website",
      "collaborators": ["name1", "name2"],
      "hasVideo": true/false,
      "description": "Brief description"
    }
  ],
  "media": [
    {
      "id": "unique-id",
      "url": "video URL if available",
      "title": "Video title",
      "description": "Description",
      "platform": "youtube|vimeo"
    }
  ],
  "platforms": ["imdb", "youtube"] // platforms where they have presence
}

If you cannot determine certain information, use reasonable defaults and lower the confidence score.
Respond ONLY with valid JSON, no markdown formatting.`;

    const usingReplitAI = !!process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    console.log(`Calling Gemini API (${usingReplitAI ? 'Replit AI' : 'user key'}) with model gemini-2.5-flash...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    console.log("Gemini API responded");

    // Extract text from response - handle both direct text property and candidates structure
    let text = "";
    if (typeof response.text === "string") {
      text = response.text;
      console.log("Extracted text from response.text property");
    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
      console.log("Extracted text from response.candidates structure");
    }
    
    if (!text) {
      console.warn("Gemini returned empty response, using fallback");
      console.log("Response structure:", JSON.stringify(response, null, 2).substring(0, 500));
      return createFallbackProfile(crawledData, enrichmentData);
    }
    
    console.log("Gemini synthesis successful, parsing JSON response...");
    
    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    // Try to extract valid JSON from the response
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.log("Initial JSON parse failed, attempting to fix...");
      // Try to find JSON object boundaries
      const startBrace = jsonText.indexOf('{');
      const endBrace = jsonText.lastIndexOf('}');
      if (startBrace !== -1 && endBrace > startBrace) {
        jsonText = jsonText.slice(startBrace, endBrace + 1);
        try {
          parsed = JSON.parse(jsonText);
        } catch (e2) {
          // Try fixing common issues: unescaped quotes, trailing commas
          jsonText = jsonText
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/:\s*"([^"]*)"([^",}\]]*)"([^"]*)":/g, ': "$1\\"$2\\"$3":');
          parsed = JSON.parse(jsonText);
        }
      } else {
        throw e;
      }
    }
    
    // Validate and normalize the response
    return normalizeProfile(parsed, crawledData);
  } catch (error) {
    console.error("Gemini synthesis error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return createFallbackProfile(crawledData, enrichmentData);
  }
}

function normalizeProfile(parsed: any, crawledData: CrawledData): SynthesisResult {
  const validPlatforms = (platforms: any[]): Platform[] => {
    if (!Array.isArray(platforms)) return ["website"];
    return platforms.filter((p): p is Platform => 
      platformTypes.includes(p as Platform)
    );
  };

  const normalizedProjects: Project[] = (parsed.projects || []).map((p: any, i: number) => ({
    id: p.id || `project-${i}`,
    title: String(p.title || "Untitled Project"),
    year: String(p.year || "Unknown"),
    role: String(p.role || "Creator"),
    platform: platformTypes.includes(p.platform) ? p.platform : "website",
    collaborators: Array.isArray(p.collaborators) ? p.collaborators.map(String) : [],
    hasVideo: Boolean(p.hasVideo),
    description: p.description ? String(p.description) : undefined,
    coverImage: undefined,
  }));

  const normalizedMedia: MediaItem[] = (parsed.media || []).map((m: any, i: number) => ({
    id: m.id || `media-${i}`,
    url: String(m.url || ""),
    title: String(m.title || "Untitled"),
    description: m.description ? String(m.description) : undefined,
    platform: platformTypes.includes(m.platform) ? m.platform : "youtube",
    thumbnail: undefined,
  })).filter((m: MediaItem) => m.url);

  return {
    name: String(parsed.name || crawledData.title || "Unknown"),
    role: String(parsed.role || "Creative Professional"),
    bio: String(parsed.bio || crawledData.description || "No biography available."),
    yearsActive: String(parsed.yearsActive || "Unknown"),
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
    projects: normalizedProjects,
    media: normalizedMedia,
    platforms: validPlatforms(parsed.platforms),
  };
}

function createFallbackProfile(
  crawledData: CrawledData,
  enrichmentData: EnrichmentData
): SynthesisResult {
  // Extract name from title or metadata
  const name = crawledData.title?.split(/[-–|]/)[0].trim() || "Unknown";
  
  // Create projects from enrichment data
  const projects: Project[] = enrichmentData.projects.map((p, i) => ({
    id: `project-${i}`,
    title: p.title,
    year: p.year,
    role: p.role,
    platform: (platformTypes.includes(p.platform as Platform) ? p.platform : "website") as Platform,
    collaborators: enrichmentData.collaborators.slice(0, 3),
    hasVideo: false,
  }));

  // Extract platforms from social links
  const platforms: Platform[] = crawledData.socialLinks.map(l => l.platform);
  if (!platforms.includes("website")) {
    platforms.push("website");
  }

  return {
    name,
    role: "Creative Professional",
    bio: crawledData.description || "Profile synthesized from web presence.",
    yearsActive: "Unknown",
    confidence: 0.4,
    projects,
    media: [],
    platforms: Array.from(new Set(platforms)),
  };
}
