import axios from "axios";
import * as cheerio from "cheerio";
import type { CrawledData, SocialLink, Platform } from "@shared/schema";

const PLATFORM_PATTERNS: Record<Platform, RegExp> = {
  imdb: /imdb\.com/i,
  tmdb: /themoviedb\.org/i,
  omdb: /omdbapi\.com/i,
  youtube: /youtube\.com|youtu\.be/i,
  vimeo: /vimeo\.com/i,
  linkedin: /linkedin\.com/i,
  facebook: /facebook\.com/i,
  website: /.*/,
};

function detectPlatform(url: string): Platform {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (platform !== "website" && pattern.test(url)) {
      return platform as Platform;
    }
  }
  return "website";
}

function extractSocialLinks(links: string[]): SocialLink[] {
  const socialLinks: SocialLink[] = [];
  const seen = new Set<string>();

  for (const link of links) {
    try {
      const url = new URL(link);
      const platform = detectPlatform(link);
      
      if (platform !== "website" && !seen.has(platform)) {
        seen.add(platform);
        socialLinks.push({ platform, url: link });
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return socialLinks;
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];
  
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        if (!absoluteUrl.includes("data:") && !absoluteUrl.includes(".svg")) {
          images.push(absoluteUrl);
        }
      } catch {
        // Invalid URL, skip
      }
    }
  });

  // Also check og:image meta tag
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) {
    try {
      images.unshift(new URL(ogImage, baseUrl).href);
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(new Set(images)).slice(0, 20);
}

function extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const links: string[] = [];
  
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        links.push(absoluteUrl);
      } catch {
        // Invalid URL, skip
      }
    }
  });

  return Array.from(new Set(links));
}

function extractMetadata($: cheerio.CheerioAPI): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Open Graph metadata
  $("meta[property^='og:']").each((_, el) => {
    const property = $(el).attr("property");
    const content = $(el).attr("content");
    if (property && content) {
      metadata[property] = content;
    }
  });

  // Twitter card metadata
  $("meta[name^='twitter:']").each((_, el) => {
    const name = $(el).attr("name");
    const content = $(el).attr("content");
    if (name && content) {
      metadata[name] = content;
    }
  });

  // Standard meta tags
  $("meta[name]").each((_, el) => {
    const name = $(el).attr("name");
    const content = $(el).attr("content");
    if (name && content && !name.startsWith("twitter:")) {
      metadata[name] = content;
    }
  });

  return metadata;
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, "\n")
    .trim()
    .slice(0, 10000); // Limit text content
}

export async function crawlUrl(url: string): Promise<CrawledData> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AutoProfileBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $("script, style, noscript, iframe").remove();

    const title = $("title").text().trim() || 
                  $('meta[property="og:title"]').attr("content") || 
                  undefined;
    
    const description = $('meta[name="description"]').attr("content") || 
                        $('meta[property="og:description"]').attr("content") || 
                        undefined;

    const images = extractImages($, url);
    const links = extractLinks($, url);
    const socialLinks = extractSocialLinks(links);
    const metadata = extractMetadata($);

    // Extract main text content
    const textContent = cleanText($("body").text());

    return {
      url,
      title,
      description,
      images,
      links,
      socialLinks,
      textContent,
      metadata,
    };
  } catch (error) {
    console.error("Crawler error:", error);
    
    // Return minimal data on error
    return {
      url,
      title: undefined,
      description: undefined,
      images: [],
      links: [],
      socialLinks: [],
      textContent: "",
      metadata: {},
    };
  }
}

export function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    throw new Error("Invalid URL format");
  }
}

export function hashUrl(url: string): string {
  // Simple hash function for URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
