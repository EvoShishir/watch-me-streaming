// API Response Types
export interface APIPost {
  id: number;
  title?: string;
  name: string;
  image: string;
  imageSm: string;
  quality: string;
  watchTime: string;
  type: "singleVideo" | "series" | "multiFile" | "singleFile";
  year: string;
}

export interface APICategory {
  id: number;
  name: string;
  type: string;
  parentId: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  posts: APIPost[];
}

export interface APIResponse {
  latestPost: APIPost[];
  categoryPosts: APICategory[];
}

// Search API Types
export interface SearchAPIPost {
  id: number;
  title: string;
  type: "singleVideo" | "series" | "multiFile" | "singleFile";
  image: string;
  imageSm: string;
  cover: string | null;
  metaData: string;
  tags: string;
  view: number;
  name: string;
  quality: string;
  watchTime: string;
  year: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
  };
  categories: {
    name: string;
    id: number;
    type: string;
    parentId: number | null;
  }[];
}

export interface SearchAPIResponse {
  posts: SearchAPIPost[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Categories API Types
export interface CategoryAPIItem {
  id: number;
  name: string;
  type: "main" | "sub";
  parentId: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
    id: number;
  };
  subCategory?: CategoryAPIItem[];
}

export type CategoriesAPIResponse = CategoryAPIItem[];

// Category Posts API Types
export interface CategoryPostAPIResponse {
  posts?: SearchAPIPost[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Sometimes the API returns posts directly as an array
export type CategoryPostsAPIResponse =
  | CategoryPostAPIResponse
  | SearchAPIPost[];

// Individual Post API Types
export interface IndividualPostAPIResponse {
  id: number;
  title: string;
  type: "singleVideo" | "series" | "multiFile" | "singleFile";
  image: string;
  imageSm: string;
  cover: string | null;
  metaData: string;
  tags: string;
  content: string | TVShowContent[]; // Video URL for movies, episodes array for TV shows
  view: number;
  name: string;
  quality: string;
  watchTime: string;
  year: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
  };
  categories: {
    parentId: number | null;
    id: number;
    name: string;
    type: string;
  }[];
}

// TV Show Content Structure
export interface TVShowContent {
  episodes: TVShowEpisode[];
  seasonName: string;
}

export interface TVShowEpisode {
  link: string;
  title: string;
}

// App Types (converted from API)
export interface Video {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  duration: number; // in minutes
  releaseYear: number;
  genres: string[];
  rating: number; // 0-10
  videoUrl: string;
  quality: string;
  watchTime: string;
  subtitles?: Subtitle[];
  audioTracks?: AudioTrack[];
}

export interface Movie extends Video {
  type: "movie";
}

export interface TVShow extends Video {
  type: "tv";
  seasons: Season[];
  totalEpisodes: number;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode extends Video {
  seasonNumber: number;
  episodeNumber: number;
}

export interface Subtitle {
  id: string;
  language: string;
  url: string;
  label: string;
}

export interface AudioTrack {
  id: string;
  language: string;
  url: string;
  label: string;
}

export interface Category {
  id: string;
  name: string;
  videos: (Movie | TVShow)[];
}

export type VideoType = Movie | TVShow;
