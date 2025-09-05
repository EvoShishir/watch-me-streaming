import OptimizedVideoCard from "@/components/OptimizedVideoCard";
import { apiService } from "@/services/api";
import { VideoType } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
  });
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate optimal number of columns based on screen width
  const getNumColumns = () => {
    const { width } = dimensions;

    // Simple approach: more columns for wider screens
    let columns = 2; // Default for narrow screens

    if (width >= 600) columns = 3; // Small tablets
    if (width >= 800) columns = 4; // Large tablets
    if (width >= 1000) columns = 5; // Very wide screens
    if (width >= 1200) columns = 6; // Ultra-wide screens

    return columns;
  };

  const numColumns = getNumColumns();

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const performSearch = useCallback(
    async (query: string, isLoadMore: boolean = false) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        setCurrentPage(1);
        setHasMoreData(true);
        return;
      }

      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setCurrentPage(1);
          setSearchResults([]);
          setHasMoreData(true);
        }

        setError(null);

        const page = isLoadMore ? currentPage + 1 : 1;
        const data = await apiService.searchPosts(query, page, 50);

        const videos = data.posts.map((post) =>
          apiService.convertSearchAPIPostToVideo(post)
        );

        if (isLoadMore) {
          setSearchResults((prevResults) => {
            // Filter out duplicates based on video ID
            const existingIds = new Set(prevResults.map((video) => video.id));
            const uniqueNewVideos = videos.filter(
              (video) => !existingIds.has(video.id)
            );
            return [...prevResults, ...uniqueNewVideos];
          });
        } else {
          setSearchResults(videos);
          setHasSearched(true);
        }

        // Update pagination info
        if (data.pagination && data.pagination.totalPages !== undefined) {
          setHasMoreData(page < data.pagination.totalPages);
        } else {
          // If no pagination info or totalPages is undefined, assume we have more data if we got a full page
          setHasMoreData(videos.length === 50);
        }

        if (isLoadMore) {
          setCurrentPage((prev) => prev + 1);
        }
      } catch (error) {
        setError("Failed to search. Please try again.");
        if (!isLoadMore) {
          setSearchResults([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentPage]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search by 500ms
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    },
    [performSearch]
  );

  const handleVideoPress = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreData && searchQuery.trim()) {
      performSearch(searchQuery, true);
    }
  }, [loadingMore, hasMoreData, searchQuery, performSearch]);

  const renderVideoItem = useCallback(
    ({ item, index }: { item: VideoType; index: number }) => (
      <OptimizedVideoCard
        video={item}
        onPress={() => handleVideoPress(item.id)}
        width={165}
        height={250}
      />
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#e50914" />
        <Text style={styles.loadingFooterText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies and TV shows..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus={false}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {!loading && (
        <FlatList
          key={`${numColumns}-${dimensions.width}`}
          data={searchResults}
          renderItem={renderVideoItem}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          ListHeaderComponent={
            hasSearched && searchQuery.trim() !== "" ? (
              <Text style={styles.resultText}>
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
              </Text>
            ) : !hasSearched ? (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  Search for movies and TV shows
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Enter a title, actor, or genre to find content
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            hasSearched && searchQuery.trim() !== "" ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try searching for different keywords
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 270, // height + margin
            offset: 270 * Math.floor(index / numColumns),
            index,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  searchInput: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  resultText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "600",
  },
  noResultsContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  noResultsText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noResultsSubtext: {
    color: "#999",
    fontSize: 14,
  },
  row: {
    justifyContent: "space-around",
    marginBottom: 20,
  },
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  placeholderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  placeholderSubtext: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingFooterText: {
    color: "#999",
    fontSize: 14,
    marginLeft: 8,
  },
});
