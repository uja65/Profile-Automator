import axios from "axios";

export interface VimeoVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  createdAt: string;
}

export async function getVimeoThumbnail(videoUrl: string): Promise<string | null> {
  try {
    const response = await axios.get(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`, {
      timeout: 5000
    });
    
    if (response.data?.thumbnail_url) {
      return response.data.thumbnail_url;
    }
    return null;
  } catch (error) {
    console.log("Vimeo oEmbed error for:", videoUrl);
    return null;
  }
}

export function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export function extractVimeoUsername(url: string): string | null {
  // Matches vimeo.com/username or vimeo.com/user/username
  const userMatch = url.match(/vimeo\.com\/(?:user\/)?([a-zA-Z0-9_-]+)(?:\/|$)/);
  if (userMatch) {
    const username = userMatch[1];
    // Exclude numeric IDs (those are video IDs, not usernames)
    if (!/^\d+$/.test(username) && !['videos', 'channels', 'groups'].includes(username)) {
      return username;
    }
  }
  return null;
}

export async function fetchVimeoUserVideos(vimeoUrl: string): Promise<VimeoVideo[]> {
  const apiKey = process.env.VIMEO_API_KEY;
  
  if (!apiKey) {
    console.log("VIMEO_API_KEY not configured, skipping Vimeo video fetch");
    return [];
  }

  try {
    const username = extractVimeoUsername(vimeoUrl);
    if (!username) {
      console.log("Could not extract Vimeo username from URL:", vimeoUrl);
      return [];
    }

    // Fetch user videos using Vimeo API
    const response = await axios.get(
      `https://api.vimeo.com/users/${username}/videos`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          per_page: 20,
          sort: 'date',
          direction: 'desc',
        },
        timeout: 10000,
      }
    );

    const videos: VimeoVideo[] = response.data.data.map((video: any) => ({
      id: video.uri.split('/').pop(),
      title: video.name || 'Untitled',
      description: video.description?.slice(0, 200) || '',
      thumbnail: video.pictures?.sizes?.[3]?.link || 
                 video.pictures?.sizes?.[2]?.link ||
                 video.pictures?.sizes?.[1]?.link || '',
      url: video.link,
      createdAt: video.created_time,
    }));

    console.log(`Fetched ${videos.length} videos from Vimeo user: ${username}`);
    return videos;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log("Vimeo user not found:", vimeoUrl);
    } else {
      console.error("Vimeo API error:", error.message || error);
    }
    return [];
  }
}

export function formatVimeoDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
