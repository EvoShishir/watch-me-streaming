import { Category } from "@/types";
import React, { memo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import OptimizedVideoCard from "./OptimizedVideoCard";

interface CategoryRowProps {
  category: Category;
  onVideoPress: (videoId: string) => void;
  onSeeAllPress?: () => void;
}

const OptimizedCategoryRow = memo(function CategoryRow({
  category,
  onVideoPress,
  onSeeAllPress,
}: CategoryRowProps) {
  const renderVideoItem = ({ item }: { item: any }) => (
    <OptimizedVideoCard video={item} onPress={() => onVideoPress(item.id)} />
  );

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
      <FlatList
        data={category.videos}
        renderItem={renderVideoItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 162, // width + margin
          offset: 162 * index,
          index,
        })}
      />
    </View>
  );
});

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
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
});

export default OptimizedCategoryRow;
