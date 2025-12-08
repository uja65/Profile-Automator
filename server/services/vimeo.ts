import axios from "axios";

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
