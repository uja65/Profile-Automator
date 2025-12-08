import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  media_type?: string;
  overview?: string;
}

interface TMDBPersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  popularity: number;
}

interface TMDBPersonSearchResponse {
  page: number;
  results: TMDBPersonResult[];
  total_results: number;
  total_pages: number;
}

interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_results: number;
  total_pages: number;
}

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  imdb_id?: string;
  overview?: string;
}

interface TMDBTVShow {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  overview?: string;
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

function titlesMatch(projectTitle: string, tmdbTitle: string): boolean {
  const normalizedProject = normalizeTitle(projectTitle);
  const normalizedTmdb = normalizeTitle(tmdbTitle);
  
  if (normalizedProject === normalizedTmdb) {
    return true;
  }
  
  if (normalizedProject.includes(normalizedTmdb) || normalizedTmdb.includes(normalizedProject)) {
    return true;
  }
  
  const projectWords = new Set(normalizedProject.split(" ").filter(w => w.length > 2));
  const tmdbWords = new Set(normalizedTmdb.split(" ").filter(w => w.length > 2));
  
  if (projectWords.size === 0 || tmdbWords.size === 0) {
    return normalizedProject === normalizedTmdb;
  }
  
  let matchingWords = 0;
  Array.from(projectWords).forEach(word => {
    if (tmdbWords.has(word)) {
      matchingWords++;
    }
  });
  
  const overlapRatio = matchingWords / Math.min(projectWords.size, tmdbWords.size);
  return overlapRatio >= 0.6;
}

export function buildPosterUrl(posterPath: string, size: string = "w500"): string {
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export async function searchMulti(query: string, year?: string): Promise<TMDBSearchResult | null> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    console.warn("TMDB_API_KEY not configured, skipping TMDB lookup");
    return null;
  }

  try {
    const params: Record<string, string> = {
      api_key: apiKey,
      query: query,
      include_adult: "false",
    };
    
    if (year) {
      params.year = year;
    }

    const response = await axios.get<TMDBSearchResponse>(`${TMDB_BASE_URL}/search/multi`, {
      params,
      timeout: 5000,
    });

    if (response.data.results && response.data.results.length > 0) {
      const movieOrTv = response.data.results.find(
        r => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path
      );
      
      if (movieOrTv) {
        return movieOrTv;
      }
    }

    return null;
  } catch (error) {
    console.error("TMDB multi search error:", error);
    return null;
  }
}

export async function searchMovie(title: string, year?: string): Promise<TMDBSearchResult | null> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    console.warn("TMDB_API_KEY not configured, skipping movie lookup");
    return null;
  }

  try {
    const params: Record<string, string> = {
      api_key: apiKey,
      query: title,
      include_adult: "false",
    };
    
    if (year) {
      params.year = year;
    }

    const response = await axios.get<TMDBSearchResponse>(`${TMDB_BASE_URL}/search/movie`, {
      params,
      timeout: 5000,
    });

    if (response.data.results && response.data.results.length > 0) {
      const withPoster = response.data.results.find(r => r.poster_path);
      if (withPoster) {
        return withPoster;
      }
    }

    return null;
  } catch (error) {
    console.error("TMDB movie search error:", error);
    return null;
  }
}

export async function searchTV(title: string, year?: string): Promise<TMDBSearchResult | null> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    console.warn("TMDB_API_KEY not configured, skipping TV lookup");
    return null;
  }

  try {
    const params: Record<string, string> = {
      api_key: apiKey,
      query: title,
      include_adult: "false",
    };
    
    if (year) {
      params.first_air_date_year = year;
    }

    const response = await axios.get<TMDBSearchResponse>(`${TMDB_BASE_URL}/search/tv`, {
      params,
      timeout: 5000,
    });

    if (response.data.results && response.data.results.length > 0) {
      const withPoster = response.data.results.find(r => r.poster_path);
      if (withPoster) {
        return withPoster;
      }
    }

    return null;
  } catch (error) {
    console.error("TMDB TV search error:", error);
    return null;
  }
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.get<TMDBMovie>(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: { api_key: apiKey },
      timeout: 5000,
    });

    return response.data;
  } catch (error) {
    console.error("TMDB movie details error:", error);
    return null;
  }
}

export async function enrichProjectsWithPosters<T extends { title: string; year: string; coverImage?: string; sourceUrl?: string }>(
  projects: T[]
): Promise<T[]> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    console.warn("TMDB_API_KEY not configured, skipping poster enrichment");
    return projects;
  }

  console.log("Enriching projects with TMDB posters...");
  
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
        // First try movie search
        let result = await searchMovie(cleanTitle, year);
        let mediaType = "movie";
        
        // If no movie found, try TV search
        if (!result) {
          result = await searchTV(cleanTitle, year);
          mediaType = "tv";
        }
        
        // If still nothing, try multi-search
        if (!result) {
          result = await searchMulti(cleanTitle, year);
          mediaType = result?.media_type || "movie";
        }
        
        if (result && result.poster_path) {
          const tmdbTitle = result.title || result.name || "";
          
          if (!titlesMatch(cleanTitle, tmdbTitle)) {
            console.log(`Title mismatch - Requested: "${cleanTitle}", Got: "${tmdbTitle}" - skipping`);
            return project;
          }
          
          const tmdbDateStr = result.release_date || result.first_air_date || "";
          const tmdbYear = extractYear(tmdbDateStr);
          
          if (year && tmdbYear) {
            if (Math.abs(parseInt(tmdbYear) - parseInt(year)) > 2) {
              console.log(`Year mismatch - Requested: ${year}, Got: ${tmdbYear} - skipping`);
              return project;
            }
          }
          
          console.log(`TMDB Matched: "${cleanTitle}" (${year}) -> "${tmdbTitle}" (${tmdbYear}) [${mediaType}:${result.id}]`);
          
          const posterUrl = buildPosterUrl(result.poster_path);
          const updates: Partial<T> = { coverImage: posterUrl } as Partial<T>;
          
          // Add TMDB sourceUrl if project doesn't have one
          if (!project.sourceUrl) {
            if (mediaType === "tv") {
              (updates as any).sourceUrl = `https://www.themoviedb.org/tv/${result.id}`;
            } else {
              (updates as any).sourceUrl = `https://www.themoviedb.org/movie/${result.id}`;
            }
          }
          
          return { ...project, ...updates };
        }
      } catch (error) {
        console.error(`Failed to get TMDB poster for ${cleanTitle}:`, error);
      }
      
      return project;
    })
  );

  return enrichedProjects;
}

export async function searchPerson(name: string): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    console.warn("TMDB_API_KEY not configured, skipping person lookup");
    return null;
  }

  try {
    const response = await axios.get<TMDBPersonSearchResponse>(`${TMDB_BASE_URL}/search/person`, {
      params: {
        api_key: apiKey,
        query: name,
        include_adult: "false",
      },
      timeout: 5000,
    });

    if (response.data.results && response.data.results.length > 0) {
      // Find the best match - prefer someone with a profile photo and high popularity
      const withPhoto = response.data.results
        .filter(r => r.profile_path)
        .sort((a, b) => b.popularity - a.popularity);
      
      if (withPhoto.length > 0) {
        const profilePath = withPhoto[0].profile_path;
        console.log(`TMDB Person found: "${name}" -> "${withPhoto[0].name}" (popularity: ${withPhoto[0].popularity})`);
        return `${TMDB_IMAGE_BASE}/w500${profilePath}`;
      }
    }

    return null;
  } catch (error) {
    console.error("TMDB person search error:", error);
    return null;
  }
}
