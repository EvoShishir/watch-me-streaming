import OptimizedVideoCard from "@/components/OptimizedVideoCard";
import { apiService } from "@/services/api";
import { VideoType } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CategoryContentScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();

  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchCategoryContent(true);
  }, [id, fetchCategoryContent]);

  const fetchCategoryContent = useCallback(
    async (isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          setLoading(true);
          setCurrentPage(1);
          setVideos([]);
          setHasMoreData(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const page = isRefresh ? 1 : currentPage + 1;

        const data = await apiService.fetchCategoryPosts(id, page, 50);

        // The API service now normalizes the response format
        const posts = data.posts || [];

        const newVideos = posts.map((post) =>
          apiService.convertSearchAPIPostToVideo(post)
        );

        if (isRefresh) {
          setVideos(newVideos);
        } else {
          setVideos((prevVideos) => {
            // Filter out duplicates based on video ID
            const existingIds = new Set(prevVideos.map((video) => video.id));
            const uniqueNewVideos = newVideos.filter(
              (video) => !existingIds.has(video.id)
            );
            return [...prevVideos, ...uniqueNewVideos];
          });
        }

        // Update pagination info
        if (data.pagination && data.pagination.totalPages !== undefined) {
          setTotalPages(data.pagination.totalPages);
          setHasMoreData(page < data.pagination.totalPages);
        } else {
          // If no pagination info or totalPages is undefined, assume we have more data if we got a full page
          setHasMoreData(posts.length === 50);
        }

        if (!isRefresh) {
          setCurrentPage((prev) => prev + 1);
        }
      } catch (error) {
        setError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [id, currentPage]
  );

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreData) {
      fetchCategoryContent(false);
    }
  }, [loadingMore, hasMoreData, fetchCategoryContent]);

  const handleRefresh = useCallback(() => {
    fetchCategoryContent(true);
  }, [id]);

  const handleVideoPress = useCallback(
    (videoId: string) => {
      router.push(`/video/${videoId}`);
    },
    [router]
  );

  const renderVideoItem = useCallback(
    ({ item, index }: { item: VideoType; index: number }) => (
      <OptimizedVideoCard
        video={item}
        onPress={() => handleVideoPress(item.id)}
        width={165}
        height={250}
      />
    ),
    [handleVideoPress]
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

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No content available</Text>
        <Text style={styles.emptySubtext}>
          This category doesn't have any content yet
        </Text>
      </View>
    );
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchCategoryContent}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{name}</Text>
        <Text style={styles.headerSubtitle}>
          {videos.length} {videos.length === 1 ? "item" : "items"}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideoItem}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={loading}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        getItemLayout={(data, index) => ({
          length: 270, // height + margin
          offset: 270 * Math.floor(index / 2),
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: "#e50914",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#999",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-around",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#999",
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
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#e50914",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
