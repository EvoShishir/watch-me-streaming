import { Category } from "@/types";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import VideoCard from "./VideoCard";

interface CategoryRowProps {
  category: Category;
  onVideoPress: (videoId: string) => void;
  onSeeAllPress?: () => void;
}

export default function CategoryRow({
  category,
  onVideoPress,
  onSeeAllPress,
}: CategoryRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.name}</Text>
        {onSeeAllPress && (
          <Pressable onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {category.videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPress={() => onVideoPress(video.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#e50914",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    paddingLeft: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
});
