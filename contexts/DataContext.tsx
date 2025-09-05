import { apiService } from "@/services/api";
import { Category, VideoType } from "@/types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface DataContextType {
  categories: Category[];
  allVideos: VideoType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allVideos, setAllVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.fetchHomepageData();

      // Create categories from API data
      const newCategories: Category[] = [];
      const videos: VideoType[] = [];

      // Add trending and recently added categories
      if (data.latestPost && data.latestPost.length > 0) {
        newCategories.push(apiService.createTrendingCategory(data.latestPost));
        newCategories.push(
          apiService.createRecentlyAddedCategory(data.latestPost)
        );

        // Add latest posts to all videos
        data.latestPost.forEach((post) => {
          videos.push(apiService.convertAPIPostToVideo(post));
        });
      }

      // Add regular categories and collect all videos
      if (data.categoryPosts) {
        data.categoryPosts.forEach((apiCategory) => {
          if (apiCategory.posts && apiCategory.posts.length > 0) {
            newCategories.push(apiService.convertAPICategory(apiCategory));

            // Add category videos to all videos (avoid duplicates)
            apiCategory.posts.forEach((post) => {
              const existingVideo = videos.find(
                (v) => v.id === post.id.toString()
              );
              if (!existingVideo) {
                videos.push(apiService.convertAPIPostToVideo(post));
              }
            });
          }
        });
      }

      setCategories(newCategories);
      setAllVideos(videos);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value: DataContextType = {
    categories,
    allVideos,
    loading,
    error,
    refetch: fetchData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
