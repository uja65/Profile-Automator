import axios from "axios";

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface EnrichmentResult {
  additionalInfo: string;
  projects: Array<{
    title: string;
    year: string;
    role: string;
    platform: string;
  }>;
  collaborators: string[];
  success: boolean;
}

export async function searchWithPerplexity(
  name: string,
  context: string
): Promise<EnrichmentResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn("PERPLEXITY_API_KEY not configured, skipping enrichment");
    return {
      additionalInfo: "",
      projects: [],
      collaborators: [],
      success: false,
    };
  }

  try {
    const prompt = `Find information about the creative professional "${name}". 
Context from their website: ${context.slice(0, 1000)}

Please provide:
1. A brief summary of who they are and their notable work
2. A list of their major projects (films, videos, albums, etc.) with years
3. Key collaborators they've worked with
4. Any relevant IMDb, YouTube, Vimeo, or other platform profiles

Format the response as structured information.`;

    const response = await axios.post<PerplexityResponse>(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a research assistant that finds accurate information about creative professionals. Provide factual, verified information only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0]?.message?.content || "";
    
    // Parse the response to extract structured data
    const projects = extractProjects(content);
    const collaborators = extractCollaborators(content);

    return {
      additionalInfo: content,
      projects,
      collaborators,
      success: true,
    };
  } catch (error) {
    console.error("Perplexity API error:", error);
    return {
      additionalInfo: "",
      projects: [],
      collaborators: [],
      success: false,
    };
  }
}

function extractProjects(content: string): Array<{
  title: string;
  year: string;
  role: string;
  platform: string;
}> {
  const projects: Array<{
    title: string;
    year: string;
    role: string;
    platform: string;
  }> = [];

  // Simple regex patterns to extract project info
  const yearPattern = /\b(19|20)\d{2}\b/g;
  const lines = content.split("\n");

  for (const line of lines) {
    const yearMatch = line.match(yearPattern);
    if (yearMatch && line.length > 10 && line.length < 200) {
      // This line likely contains a project
      const cleanedTitle = line
        .replace(yearPattern, "")
        .replace(/[-–—:]/g, "")
        .replace(/\(.*?\)/g, "")
        .trim()
        .slice(0, 100);

      if (cleanedTitle.length > 3) {
        projects.push({
          title: cleanedTitle,
          year: yearMatch[0],
          role: "Creator",
          platform: "website",
        });
      }
    }
  }

  return projects.slice(0, 10);
}

function extractCollaborators(content: string): string[] {
  const collaborators: string[] = [];
  
  // Look for patterns like "worked with", "collaborated with", "featuring"
  const patterns = [
    /(?:worked with|collaborated with|featuring|starring)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    /(?:with|and)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1].trim();
      if (name.length > 3 && name.length < 50 && !collaborators.includes(name)) {
        collaborators.push(name);
      }
    }
  }

  return collaborators.slice(0, 10);
}
