import { apiService } from "@/services/api";
import { VideoType } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create video player with expo-video
  const player = useVideoPlayer(video?.videoUrl || "", (player) => {
    player.loop = false;
  });

  const fetchVideoDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if this is an episode ID (format: postId-s1-e1)
      if (id.includes("-s") && id.includes("-e")) {
        // Extract the original post ID from episode ID
        const postId = id.split("-s")[0];

        const postData = await apiService.fetchIndividualPost(postId);
        const tvShowData = apiService.convertIndividualPostToVideo(postData);

        if (tvShowData.type === "tv") {
          // Find the specific episode
          const episode = findEpisodeById(tvShowData, id);
          if (episode) {
            setVideo(episode);
          } else {
            throw new Error("Episode not found");
          }
        } else {
          throw new Error("Expected TV show data for episode ID");
        }
      } else {
        // Regular video ID
        const postData = await apiService.fetchIndividualPost(id);
        const videoData = apiService.convertIndividualPostToVideo(postData);

        setVideo(videoData);
      }
    } catch (error) {
      setError("Failed to load video. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideoDetails();
  }, [id, fetchVideoDetails]);

  // Helper function to find episode by ID
  const findEpisodeById = (tvShow: any, episodeId: string) => {
    for (const season of tvShow.seasons) {
      for (const episode of season.episodes) {
        if (episode.id === episodeId) {
          return episode;
        }
      }
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    );
  }

  if (error || !video) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Video not found"}</Text>
          <Pressable style={styles.retryButton} onPress={fetchVideoDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Player */}
      <VideoView
        player={player}
        style={styles.videoContainer}
        contentFit="contain"
        allowsFullscreen={true}
        allowsPictureInPicture={true}
        showsTimecodes={true}
        requiresLinearPlayback={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 16,
  },
});
