import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const categories = [
  "All",
  "Food Tips",
  "Recipes",
  "Restaurant News",
  "Food Culture",
];

const featured = {
  id: "biryani",
  title: "The Story Behind Chicken Biryani",
  description:
    "Explore the rich history, spices and traditions that make biryani a timeless favorite.",
  date: "12 Mar 2024",
  time: "5 min read",
  category: "Recipes",
  image: require("../../assets/images/featured_biryani.png"),
};

const articles = [
  {
    id: "paneer",
    category: "Recipes",
    title: "Top 5 Must-Try Paneer Dishes in India",
    description: "From creamy classics to spicy delights, here are the best...",
    date: "10 Mar 2024",
    time: "4 min read",
    image: require("../../assets/images/paneer_dish.png"),
  },
  {
    id: "fried-chicken",
    category: "Food Culture",
    title: "Why Fried Chicken is a Global Favorite",
    description:
      "Crispy, juicy and full of flavor — learn what makes it special.",
    date: "8 Mar 2024",
    time: "3 min read",
    image: require("../../assets/images/fried_chicken.png"),
  },
  {
    id: "spices",
    category: "Food Tips",
    title: "5 Essential Spices in Indian Cooking",
    description: "Discover the spices that bring Indian food to life.",
    date: "5 Mar 2024",
    time: "4 min read",
    image: require("../../assets/images/indian_spices.png"),
  },
  {
    id: "restaurant",
    category: "Restaurant News",
    title: "How to Choose the Best Restaurant",
    description:
      "Simple tips to find great food, better service and a memorable experience.",
    date: "28 Feb 2024",
    time: "3 min read",
    image: require("../../assets/images/restaurant_interior.png"),
  },
];

export default function BlogsScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();

  const RED = colors.primary;
  const WHITE = colors.white;
  const MUTED = colors.textMuted;
  const BG = colors.background;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState("");

  const padding = width < 380 ? 14 : 20;
  const gap = 12;
  const cardWidth = (width - padding * 2 - gap) / 2;

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return articles.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  const openArticle = (item) => {
    router.push({
      pathname: "/blog-details",
      params: {
        id: item.id,
        title: item.title,
        description: item.description,
        date: item.date,
        time: item.time,
        category: item.category,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={BG}
      />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingHorizontal: padding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="chevron-back"
                  size={25}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>

              <Text style={styles.heading}>Blogs</Text>
            </View>

            <Text style={styles.subtitle}>
              Discover food stories, tips and trends
            </Text>
          </View>

          <Pressable
            onPress={() => setSearchVisible((value) => !value)}
            style={styles.searchButton}
            accessibilityLabel="Search blogs"
          >
            <Ionicons
              name="search-outline"
              size={25}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>

        {/* SEARCH */}
        {searchVisible && (
          <View style={styles.searchField}>
            <Ionicons name="search-outline" size={21} color={MUTED} />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search food articles..."
              placeholderTextColor={MUTED}
              style={styles.searchInput}
              autoCorrect={false}
              returnKeyType="search"
            />

            {!!search && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={21} color={MUTED} />
              </Pressable>
            )}
          </View>
        )}

        {/* CATEGORIES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((item) => {
            const active = selectedCategory === item;

            return (
              <Pressable
                key={item}
                onPress={() => setSelectedCategory(item)}
                style={[styles.categoryChip, active && styles.categoryActive]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* FEATURED BANNER */}
        {selectedCategory === "All" && !search.trim() && (
          <Pressable
            onPress={() => openArticle(featured)}
            style={styles.featuredCard}
          >
            <ImageBackground
              source={featured.image}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageStyle}
              resizeMode="cover"
            >
              <View pointerEvents="none" style={styles.featuredShade} />

              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>

                <Text style={styles.featuredTitle}>
                  The Story Behind{"\n"}Chicken Biryani
                </Text>

                <Text style={styles.featuredDescription}>
                  Explore the rich history, spices and traditions that make
                  biryani a timeless favorite.
                </Text>

                <View style={styles.featuredMeta}>
                  <Ionicons name="calendar-outline" size={16} color={WHITE} />
                  <Text style={styles.featuredMetaText}>{featured.date}</Text>

                  <View style={styles.metaDivider} />

                  <Ionicons name="time-outline" size={17} color={WHITE} />
                  <Text style={styles.featuredMetaText}>{featured.time}</Text>
                </View>

                <View style={styles.readMore}>
                  <Text style={styles.readMoreText}>Read More</Text>
                  <Ionicons name="arrow-forward" size={19} color={WHITE} />
                </View>
              </View>

              <View style={styles.dots}>
                <View style={styles.activeDot} />
              </View>
            </ImageBackground>
          </Pressable>
        )}

        {/* LATEST ARTICLES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "All" ? "Latest Articles" : selectedCategory}
          </Text>

          <Pressable
            onPress={() => {
              setSelectedCategory("All");
              setSearch("");
            }}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="arrow-forward" size={19} color={RED} />
          </Pressable>
        </View>

        {/* ARTICLE GRID */}
        <View style={styles.articleGrid}>
          {filteredArticles.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openArticle(item)}
              style={[styles.articleCard, { width: cardWidth }]}
            >
              <Image
                source={item.image}
                style={styles.articleImage}
                resizeMode="cover"
              />

              <View style={styles.articleBody}>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.articleDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.articleMeta}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.articleMetaText}>{item.date}</Text>
                </View>

                <View style={styles.articleMeta}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.articleMetaText}>{item.time}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* EMPTY SEARCH RESULT */}
        {filteredArticles.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={38} color={MUTED} />
            <Text style={styles.emptyTitle}>No articles found</Text>
            <Text style={styles.emptyDescription}>
              Try a different search or category.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingTop: 20,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    color: colors.textPrimary,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.regular,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.regular,
    lineHeight: 20,
    marginTop: 5,
  },

  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  searchField: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,
    paddingVertical: 12,
  },

  categoryScroll: {
    marginHorizontal: -2,
    marginBottom: 22,
  },

  categoryList: {
    gap: 10,
    paddingHorizontal: 2,
  },

  categoryChip: {
    minHeight: 44,
    paddingHorizontal: 17,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElement,
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  categoryActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryText: {
    color: colors.textPrimary,
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,
    fontWeight: "600",
  },

  categoryTextActive: {
    color: colors.white,
    fontFamily: Fonts.regular,
  },

  featuredCard: {
    width: "100%",
    height: 350,
    marginBottom: 26,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  featuredImage: {
    flex: 1,
    justifyContent: "center",
  },

  featuredImageStyle: {
    borderRadius: 20,
  },

  featuredShade: {
    ...StyleSheet.absoluteFillObject,
    width: "78%",
    backgroundColor: colors.overlayDark,
  },

  featuredContent: {
    width: "79%",
    paddingLeft: 14,
    paddingVertical: 12,
    alignItems: "flex-start",
  },

  featuredBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    backgroundColor: colors.primary,
    marginBottom: 12,
  },

  featuredBadgeText: {
    color: colors.white,
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,
  },

  featuredTitle: {
    color: colors.textPrimary,
    fontSize: 23,
    lineHeight: 29,
    fontFamily: Fonts.regular,
    fontWeight: "800",
    marginBottom: 8,
  },

  featuredDescription: {
    color: colors.textSecondary,
    fontSize: Fonts.size.md,
    lineHeight: 17,
    fontFamily: Fonts.regular,
    marginBottom: 11,
  },

  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 13,
  },

  featuredMetaText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: Fonts.regular,
  },

  metaDivider: {
    height: 16,
    width: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 3,
  },

  readMore: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 24,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  readMoreText: {
    color: colors.white,
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,
  },

  dots: {
    position: "absolute",
    right: 12,
    bottom: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  activeDot: {
    width: 22,
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 15,
  },

  sectionTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.regular,
    fontWeight: "800",
  },

  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  seeAllText: {
    color: colors.primary,
    fontSize: Fonts.size.md,
    fontFamily: Fonts.regular,
  },

  articleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  articleCard: {
    overflow: "hidden",
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  articleImage: {
    width: "100%",
    height: 125,
    backgroundColor: colors.surface,
  },

  articleBody: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
  },

  articleTitle: {
    color: colors.textPrimary,
    fontSize: Fonts.size.xl,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    fontWeight: "800",
    minHeight: 40,
  },

  articleDescription: {
    color: colors.textSecondary,
    fontSize: Fonts.size.md,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    marginTop: 5,
    marginBottom: 8,
    minHeight: 34,
  },

  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },

  articleMetaText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    flexShrink: 1,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 45,
  },

  emptyTitle: {
    color: colors.textPrimary,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    marginTop: 12,
  },

  emptyDescription: {
    color: colors.textSecondary,
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    marginTop: 6,
    textAlign: "center",
  },
});
