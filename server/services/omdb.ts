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

function extractYear(yearStr: string): string | undefined {
  const match = yearStr.match(/(\d{4})/);
  return match ? match[1] : undefined;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titlesMatch(projectTitle: string, omdbTitle: string): boolean {
  const normalizedProject = normalizeTitle(projectTitle);
  const normalizedOmdb = normalizeTitle(omdbTitle);
  
  if (normalizedProject === normalizedOmdb) {
    return true;
  }
  
  if (normalizedProject.includes(normalizedOmdb) || normalizedOmdb.includes(normalizedProject)) {
    return true;
  }
  
  const projectWords = new Set(normalizedProject.split(" ").filter(w => w.length > 2));
  const omdbWords = new Set(normalizedOmdb.split(" ").filter(w => w.length > 2));
  
  if (projectWords.size === 0 || omdbWords.size === 0) {
    return normalizedProject === normalizedOmdb;
  }
  
  let matchingWords = 0;
  Array.from(projectWords).forEach(word => {
    if (omdbWords.has(word)) {
      matchingWords++;
    }
  });
  
  const overlapRatio = matchingWords / Math.min(projectWords.size, omdbWords.size);
  return overlapRatio >= 0.5;
}

export async function enrichProjectsWithPosters<T extends { title: string; year: string; coverImage?: string; sourceUrl?: string }>(
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
      let cleanTitle = project.title
        .replace(/\|/g, "")
        .replace(/\*/g, "")
        .replace(/\(film\)/gi, "")
        .replace(/\(documentary\)/gi, "")
        .replace(/\(short\)/gi, "")
        .replace(/\(movie\)/gi, "")
        .replace(/\(tv\s*series?\)/gi, "")
        .replace(/[^a-zA-Z0-9\s'-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      
      if (cleanTitle.length < 2) {
        return project;
      }

      const year = extractYear(project.year);

      try {
        const movie = await searchMovie(cleanTitle, year);
        
        if (movie && movie.Poster) {
          if (!titlesMatch(cleanTitle, movie.Title)) {
            console.log(`Title mismatch - Requested: "${cleanTitle}", Got: "${movie.Title}" - skipping`);
            return project;
          }
          
          if (year) {
            const omdbYear = extractYear(movie.Year);
            if (omdbYear && Math.abs(parseInt(omdbYear) - parseInt(year)) > 2) {
              console.log(`Year mismatch - Requested: ${year}, Got: ${movie.Year} - skipping`);
              return project;
            }
          }
          
          console.log(`Matched: "${cleanTitle}" (${year}) -> "${movie.Title}" (${movie.Year}) [${movie.imdbID}]`);
          const updates: Partial<T> = { coverImage: movie.Poster } as Partial<T>;
          
          // Add IMDb sourceUrl if project doesn't have one and we have a valid imdbID
          if (!project.sourceUrl && movie.imdbID) {
            (updates as any).sourceUrl = `https://www.imdb.com/title/${movie.imdbID}/`;
          }
          
          return { ...project, ...updates };
        }
      } catch (error) {
        console.error(`Failed to get poster for ${cleanTitle}:`, error);
      }
      
      return project;
    })
  );

  return enrichedProjects;
}
