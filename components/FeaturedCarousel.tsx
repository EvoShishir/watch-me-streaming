import { VideoType } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface FeaturedCarouselProps {
  videos: VideoType[];
  onPlayPress: (video: VideoType) => void;
  onInfoPress: (video: VideoType) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function FeaturedCarousel({
  videos,
  onPlayPress,
  onInfoPress,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % videos.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [videos.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderCarouselItem = ({ item: video }: { item: VideoType }) => (
    <View style={styles.carouselItem}>
      <Image
        source={{ uri: video.backdrop }}
        style={styles.backdrop}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {video.description}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.year}>{video.releaseYear}</Text>
            <Text style={styles.rating}>⭐ {video.rating.toFixed(1)}</Text>
            <Text style={styles.duration}>
              {video.type === "movie"
                ? `${video.duration}m`
                : `${video.totalEpisodes} Episodes`}
            </Text>
          </View>
          <View style={styles.genres}>
            {video.genres.map((genre, index) => (
              <Text key={genre} style={styles.genre}>
                {genre}
                {index < video.genres.length - 1 ? " • " : ""}
              </Text>
            ))}
          </View>
          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.playButton]}
              onPress={() => onPlayPress(video)}
              android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
            >
              <Text style={styles.playButtonText}>▶ Play</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.infoButton]}
              onPress={() => onInfoPress(video)}
              android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
            >
              <Text style={styles.infoButtonText}>ℹ More Info</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderPaginationDots = () => {
    if (videos.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {videos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  if (videos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderCarouselItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        snapToInterval={screenWidth}
        snapToAlignment="start"
        decelerationRate="fast"
      />
      {renderPaginationDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  carouselItem: {
    width: screenWidth,
    height: screenHeight > 800 ? 450 : 400,
    position: "relative",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  year: {
    color: "#ccc",
    fontSize: 14,
    marginRight: 16,
  },
  rating: {
    color: "#ffd700",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 16,
  },
  duration: {
    color: "#ccc",
    fontSize: 14,
  },
  genres: {
    flexDirection: "row",
    marginBottom: 20,
  },
  genre: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  playButton: {
    backgroundColor: "#fff",
  },
  playButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  infoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  paginationDotActive: {
    backgroundColor: "#e50914",
    width: 24,
  },
});
