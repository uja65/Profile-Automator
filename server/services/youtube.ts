import axios from "axios";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

interface YouTubeChannelInfo {
  channelId: string;
  channelTitle: string;
  videos: YouTubeVideo[];
}

function extractChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/channel\/([^/?]+)/,
    /youtube\.com\/c\/([^/?]+)/,
    /youtube\.com\/@([^/?]+)/,
    /youtube\.com\/user\/([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export async function fetchChannelVideos(channelUrl: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.log("YouTube API key not configured");
    return [];
  }

  try {
    const channelIdentifier = extractChannelId(channelUrl);
    if (!channelIdentifier) {
      console.log("Could not extract channel identifier from URL:", channelUrl);
      return [];
    }

    let channelId = channelIdentifier;

    if (channelUrl.includes("/@") || channelUrl.includes("/c/") || channelUrl.includes("/user/")) {
      const searchResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            type: "channel",
            q: channelIdentifier,
            key: apiKey,
            maxResults: 1,
          },
        }
      );

      if (searchResponse.data.items?.length > 0) {
        channelId = searchResponse.data.items[0].snippet.channelId;
      } else {
        console.log("Could not find channel for:", channelIdentifier);
        return [];
      }
    }

    const channelResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels`,
      {
        params: {
          part: "contentDetails",
          id: channelId,
          key: apiKey,
        },
      }
    );

    if (!channelResponse.data.items?.length) {
      console.log("Channel not found:", channelId);
      return [];
    }

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    const videosResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems`,
      {
        params: {
          part: "snippet",
          playlistId: uploadsPlaylistId,
          key: apiKey,
          maxResults: 20,
        },
      }
    );

    const videos: YouTubeVideo[] = videosResponse.data.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description?.slice(0, 200) || "",
      thumbnail: item.snippet.thumbnails?.high?.url || 
                 item.snippet.thumbnails?.medium?.url || 
                 item.snippet.thumbnails?.default?.url || "",
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    }));

    console.log(`Fetched ${videos.length} videos from YouTube channel`);
    return videos;
  } catch (error) {
    console.error("YouTube API error:", error);
    return [];
  }
}

export function formatYouTubeDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}
