import { VideoType } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface FeaturedHeroProps {
  video: VideoType;
  onPlayPress: () => void;
  onInfoPress: () => void;
}

const { width: initialScreenWidth, height: initialScreenHeight } =
  Dimensions.get("window");

export default function FeaturedHero({
  video,
  onPlayPress,
  onInfoPress,
}: FeaturedHeroProps) {
  const [dimensions, setDimensions] = useState({
    width: initialScreenWidth,
    height: initialScreenHeight,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const dynamicStyles = StyleSheet.create({
    container: {
      height: dimensions.width > dimensions.height ? 300 : 400, // Shorter in landscape
      width: dimensions.width,
      position: "relative",
    },
  });

  return (
    <View style={dynamicStyles.container}>
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
              onPress={onPlayPress}
              android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
            >
              <Text style={styles.playButtonText}>▶ Play</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.infoButton]}
              onPress={onInfoPress}
              android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
            >
              <Text style={styles.infoButtonText}>ℹ More Info</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
