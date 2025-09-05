import { useData } from "@/contexts/DataContext";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FeaturedHero from "./FeaturedHero";
import OptimizedCategoryRow from "./OptimizedCategoryRow";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface HomePageProps {
  onVideoPress: (videoId: string) => void;
  onPlayVideo: (videoId: string) => void;
}

export default function HomePage({ onVideoPress, onPlayVideo }: HomePageProps) {
  const { categories, loading, error, refetch } = useData();
  const router = useRouter();

  const featuredVideo = useMemo(() => {
    return categories.find((cat) => cat.id === "trending")?.videos[0];
  }, [categories]);

  // Show more categories on homepage
  const displayCategories = useMemo(() => {
    return categories.slice(0, 10); // Show first 10 categories
  }, [categories]);

  const renderCategoryItem = useCallback(
    ({ item: category }: { item: any }) => (
      <OptimizedCategoryRow
        category={category}
        onVideoPress={onVideoPress}
        onSeeAllPress={() => {
          // Navigate to category content page
          router.push({
            pathname: "/category-content/[id]",
            params: {
              id: category.id,
              name: category.name,
            },
          });
        }}
      />
    ),
    [onVideoPress, router]
  );

  const renderHeader = useCallback(
    () => (
      <>
        {featuredVideo && (
          <FeaturedHero
            video={featuredVideo}
            onPlayPress={() => onPlayVideo(featuredVideo.id)}
            onInfoPress={() => onVideoPress(featuredVideo.id)}
          />
        )}
      </>
    ),
    [featuredVideo, onPlayVideo, onVideoPress]
  );

  const renderFooter = useCallback(
    () => <View style={styles.bottomSpacing} />,
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
          translucent
        />
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
          translucent
        />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      <FlatList
        data={displayCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        bounces={false}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 280, // Approximate height of category row
          offset: 280 * index,
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
  bottomSpacing: {
    height: 100,
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
