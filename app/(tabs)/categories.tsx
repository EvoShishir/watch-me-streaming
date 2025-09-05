import { apiService } from "@/services/api";
import { CategoryAPIItem } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<CategoryAPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
  });
  const router = useRouter();

  // Calculate optimal number of columns based on screen width
  const getNumColumns = () => {
    const { width } = dimensions;

    // Simple approach: more columns for wider screens
    let columns = 2; // Default for narrow screens

    if (width >= 600) columns = 3; // Small tablets
    if (width >= 800) columns = 4; // Large tablets
    if (width >= 1000) columns = 5; // Very wide screens
    if (width >= 1200) columns = 6; // Ultra-wide screens

    return columns;
  };

  const numColumns = getNumColumns();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchCategories();
      setCategories(data);
    } catch {
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = useCallback(
    (category: CategoryAPIItem) => {
      if (category.subCategory && category.subCategory.length > 0) {
        // Navigate to sub-categories screen
        router.push({
          pathname: "/category/[id]",
          params: {
            id: category.id.toString(),
            name: category.name,
            hasSubCategories: "true",
          },
        });
      } else {
        // Navigate directly to category content
        router.push({
          pathname: "/category-content/[id]",
          params: {
            id: category.id.toString(),
            name: category.name,
          },
        });
      }
    },
    [router]
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: CategoryAPIItem }) => {
      const itemWidth =
        (dimensions.width - 32 - (numColumns - 1) * 16) / numColumns;

      return (
        <Pressable
          style={[styles.categoryItem, { width: itemWidth }]}
          onPress={() => handleCategoryPress(item)}
          android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
        >
          <View style={styles.categoryContent}>
            <Text style={styles.categoryName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.subCategory && item.subCategory.length > 0 && (
              <View style={styles.subCategoryInfo}>
                <Text style={styles.subCategoryCount}>
                  {item.subCategory.length} sub
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [handleCategoryPress, dimensions.width, numColumns]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <Text style={styles.headerSubtitle}>Browse content by category</Text>
      </View>

      <FlatList
        key={`${numColumns}-${dimensions.width}`}
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate height of category item
          offset: 120 * Math.floor(index / numColumns),
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
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#999",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    height: 100,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  subCategoryInfo: {
    marginTop: 4,
  },
  subCategoryCount: {
    color: "#e50914",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
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
