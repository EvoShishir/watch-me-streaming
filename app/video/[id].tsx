import SeasonRow from "@/components/SeasonRow";
import { apiService } from "@/services/api";
import { Episode, TVShow, VideoType } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  const fetchVideoDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const postData = await apiService.fetchIndividualPost(id);

      const videoData = apiService.convertIndividualPostToVideo(postData);

      setVideo(videoData);
    } catch (error) {
      setError("Failed to load video details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>Loading video details...</Text>
        </View>
      </View>
    );
  }

  if (error || !video) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Video not found"}</Text>
          <Pressable style={styles.retryButton} onPress={fetchVideoDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handlePlayPress = () => {
    if (video.type === "tv") {
      // For TV shows, play the first episode
      const tvShow = video as TVShow;
      if (tvShow.seasons.length > 0 && tvShow.seasons[0].episodes.length > 0) {
        const firstEpisode = tvShow.seasons[0].episodes[0];
        router.push(`/player/${firstEpisode.id}`);
      }
    } else {
      // For movies, play the main video
      router.push(`/player/${video.id}`);
    }
  };

  const handleEpisodePress = (episode: Episode) => {
    router.push(`/player/${episode.id}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with backdrop */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: video.backdrop }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"]}
            style={styles.gradient}
          >
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>

            <View style={styles.heroContent}>
              <Text style={styles.title}>{video.title}</Text>
              <View style={styles.metadata}>
                <Text style={styles.year}>{video.releaseYear}</Text>
                <Text style={styles.rating}>⭐ {video.rating.toFixed(1)}</Text>
                <Text style={styles.duration}>
                  {video.watchTime ||
                    (video.type === "movie"
                      ? `${video.duration}m`
                      : `${video.totalEpisodes} Episodes`)}
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

              <Pressable
                style={styles.playButton}
                onPress={handlePlayPress}
                android_ripple={{ color: "rgba(0, 0, 0, 0.2)" }}
              >
                <Text style={styles.playButtonText}>
                  ▶ {video.type === "tv" ? "Play First Episode" : "Play"}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.description}>{video.description}</Text>

          {/* Episodes Section (for TV shows) */}
          {video.type === "tv" && (video as TVShow).seasons && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Episodes</Text>
              {(video as TVShow).seasons.map((season) => (
                <SeasonRow
                  key={season.seasonNumber}
                  season={season}
                  onEpisodePress={handleEpisodePress}
                />
              ))}
            </View>
          )}

          {/* Quality Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quality</Text>
            <Text style={styles.sectionText}>{video.quality}</Text>
          </View>

          {/* Debug Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Debug Info</Text>
            <Text style={styles.sectionText}>Type: {video.type}</Text>
            <Text style={styles.sectionText}>
              Seasons:{" "}
              {video.type === "tv"
                ? (video as TVShow).seasons?.length || 0
                : "N/A"}
            </Text>
            <Text style={styles.sectionText}>
              Total Episodes:{" "}
              {video.type === "tv"
                ? (video as TVShow).totalEpisodes || 0
                : "N/A"}
            </Text>
          </View>

          {/* Cast & Crew placeholder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast & Crew</Text>
            <Text style={styles.sectionText}>Coming Soon</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 400,
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  heroContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  year: {
    color: "#ccc",
    fontSize: 16,
    marginRight: 16,
  },
  rating: {
    color: "#ffd700",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 16,
  },
  duration: {
    color: "#ccc",
    fontSize: 16,
  },
  genres: {
    flexDirection: "row",
    marginBottom: 20,
  },
  genre: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  playButton: {
    backgroundColor: "#e50914",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  contentSection: {
    padding: 16,
  },
  description: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionText: {
    color: "#ccc",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
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
