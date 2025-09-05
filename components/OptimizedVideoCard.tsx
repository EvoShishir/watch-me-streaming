import { VideoType } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface VideoCardProps {
  video: VideoType;
  onPress: () => void;
  width?: number;
  height?: number;
}

const { width: screenWidth } = Dimensions.get("window");

const OptimizedVideoCard = memo(function VideoCard({
  video,
  onPress,
  width = 150,
  height = 225,
}: VideoCardProps) {
  return (
    <Pressable
      style={[styles.container, { width, height }]}
      onPress={onPress}
      android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
    >
      <Image
        source={{ uri: video.poster }}
        style={styles.poster}
        resizeMode="cover"
        // Performance optimizations for images
        fadeDuration={200}
        progressiveRenderingEnabled={true}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.year}>{video.releaseYear}</Text>
            <Text style={styles.rating}>⭐ {video.rating.toFixed(1)}</Text>
          </View>
          {/* Quality and Watch Time */}
          {video.watchTime && (
            <Text style={styles.watchTime} numberOfLines={1}>
              {video.watchTime}
            </Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#1a1a1a",
    elevation: 3,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
  },
  info: {
    padding: 8,
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  year: {
    color: "#ccc",
    fontSize: 10,
  },
  rating: {
    color: "#ffd700",
    fontSize: 10,
    fontWeight: "600",
  },
  watchTime: {
    color: "#999",
    fontSize: 9,
    fontWeight: "500",
  },
});

export default OptimizedVideoCard;
