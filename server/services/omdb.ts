import axios from "axios";

interface OMDBSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDBSearchResponse {
  Search?: OMDBSearchResult[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

interface OMDBMovie {
  Title: string;
  Year: string;
  Poster: string;
  imdbID: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  Genre?: string;
  Response: string;
}

export async function searchMovie(title: string, year?: string): Promise<OMDBMovie | null> {
  const apiKey = process.env.OMDB_API_KEY;
  
  if (!apiKey) {
    console.warn("OMDB_API_KEY not configured, skipping poster lookup");
    return null;
  }

  try {
    const params: Record<string, string> = {
      apikey: apiKey,
      t: title,
      type: "movie",
    };
    
    if (year) {
      params.y = year;
    }

    const response = await axios.get<OMDBMovie>("https://www.omdbapi.com/", {
      params,
      timeout: 5000,
    });

    if (response.data.Response === "True" && response.data.Poster !== "N/A") {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("OMDB API error:", error);
    return null;
  }
}

export async function getMoviePoster(title: string, year?: string): Promise<string | undefined> {
  const movie = await searchMovie(title, year);
  return movie?.Poster;
}

export async function enrichProjectsWithPosters<T extends { title: string; year: string; coverImage?: string }>(
  projects: T[]
): Promise<T[]> {
  const apiKey = process.env.OMDB_API_KEY;
  
  if (!apiKey) {
    console.warn("OMDB_API_KEY not configured, skipping poster enrichment");
    return projects;
  }

  console.log("Enriching projects with OMDB posters...");
  
  const enrichedProjects = await Promise.all(
    projects.map(async (project) => {
      // Clean up the title - remove markdown formatting and extra characters
      const cleanTitle = project.title
        .replace(/\|/g, "")
        .replace(/\*/g, "")
        .replace(/[^a-zA-Z0-9\s'-]/g, "")
        .trim();
      
      // Skip if title is too short or looks like garbage
      if (cleanTitle.length < 2) {
        return project;
      }

      try {
        const poster = await getMoviePoster(cleanTitle, project.year);
        if (poster) {
          return { ...project, coverImage: poster };
        }
      } catch (error) {
        console.error(`Failed to get poster for ${cleanTitle}:`, error);
      }
      
      return project;
    })
  );

  return enrichedProjects;
}
