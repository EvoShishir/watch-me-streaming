import { apiService } from "@/services/api";
import { CategoryAPIItem } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CategoryDetailScreen() {
  const { id, name, hasSubCategories } = useLocalSearchParams<{
    id: string;
    name: string;
    hasSubCategories: string;
  }>();
  const router = useRouter();

  const [subCategories, setSubCategories] = useState<CategoryAPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasSubCategories === "true") {
      fetchSubCategories();
    } else {
      setLoading(false);
    }
  }, [id, hasSubCategories]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const allCategories = await apiService.fetchCategories();

      // Find the main category and get its sub-categories
      const mainCategory = allCategories.find(
        (cat) => cat.id.toString() === id
      );
      if (mainCategory && mainCategory.subCategory) {
        setSubCategories(mainCategory.subCategory);
      }
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      setError("Failed to load sub-categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategoryPress = useCallback(
    (subCategory: CategoryAPIItem) => {
      // Navigate to category content (videos)
      router.push({
        pathname: "/category-content/[id]",
        params: {
          id: subCategory.id.toString(),
          name: subCategory.name,
        },
      });
    },
    [router]
  );

  const renderSubCategoryItem = useCallback(
    ({ item }: { item: CategoryAPIItem }) => (
      <Pressable
        style={styles.subCategoryItem}
        onPress={() => handleSubCategoryPress(item)}
        android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
      >
        <Text style={styles.subCategoryName}>{item.name}</Text>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    ),
    [handleSubCategoryPress]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchSubCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (hasSubCategories === "false") {
    // This is a leaf category, redirect to content screen
    React.useEffect(() => {
      router.replace({
        pathname: "/category-content/[id]",
        params: {
          id: id,
          name: name,
        },
      });
    }, [id, name, router]);

    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{name}</Text>
        <Text style={styles.headerSubtitle}>
          Choose a sub-category to browse content
        </Text>
      </View>

      <FlatList
        data={subCategories}
        renderItem={renderSubCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 60, // Approximate height of sub-category item
          offset: 60 * index,
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
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: "#e50914",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#999",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  subCategoryItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    marginBottom: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subCategoryName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  arrow: {
    color: "#e50914",
    fontSize: 16,
    fontWeight: "bold",
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  comingSoonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  comingSoonSubtext: {
    color: "#999",
    fontSize: 16,
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
