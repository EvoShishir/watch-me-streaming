import { Episode, Season } from "@/types";
import React, { useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const EPISODE_WIDTH = 200;
const EPISODE_HEIGHT = 120;

interface SeasonRowProps {
  season: Season;
  onEpisodePress: (episode: Episode) => void;
}

export default function SeasonRow({ season, onEpisodePress }: SeasonRowProps) {
  const renderEpisode = useCallback(
    ({ item: episode }: { item: Episode }) => (
      <Pressable
        style={styles.episodeContainer}
        onPress={() => {
          console.log(
            "Episode pressed:",
            episode.title,
            "ID:",
            episode.id,
            "Video URL:",
            episode.videoUrl
          );
          onEpisodePress(episode);
        }}
        android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
      >
        <Image
          source={{ uri: episode.poster }}
          style={styles.episodeThumbnail}
          resizeMode="cover"
        />
        <View style={styles.episodeOverlay}>
          <Text style={styles.episodeNumber}>E{episode.episodeNumber}</Text>
        </View>
        <View style={styles.episodeInfo}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {episode.title}
          </Text>
          <Text style={styles.episodeDuration}>{episode.duration}m</Text>
        </View>
      </Pressable>
    ),
    [onEpisodePress]
  );

  return (
    <View style={styles.seasonContainer}>
      <Text style={styles.seasonTitle}>
        Season {season.seasonNumber} ({season.episodes.length} episodes)
      </Text>
      <FlatList
        data={season.episodes}
        renderItem={renderEpisode}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.episodesList}
        getItemLayout={(data, index) => ({
          length: EPISODE_WIDTH + 16, // width + margin
          offset: (EPISODE_WIDTH + 16) * index,
          index,
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seasonContainer: {
    marginBottom: 24,
  },
  seasonTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  episodesList: {
    paddingHorizontal: 16,
  },
  episodeContainer: {
    width: EPISODE_WIDTH,
    marginRight: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
  },
  episodeThumbnail: {
    width: "100%",
    height: EPISODE_HEIGHT,
  },
  episodeOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  episodeNumber: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  episodeInfo: {
    padding: 12,
  },
  episodeTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  episodeDuration: {
    color: "#999",
    fontSize: 12,
  },
});
