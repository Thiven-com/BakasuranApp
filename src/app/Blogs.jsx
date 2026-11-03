import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { getBlogCategories, getBlogs } from "../utils/Function";

// =========================================================
// FALLBACK BLOG IMAGES
// =========================================================

const FALLBACK_IMAGES = [
  require("../../assets/images/biryani.png"),
  require("../../assets/images/dosa.png"),
  require("../../assets/images/pizza.png"),
  require("../../assets/images/burgers.png"),
  require("../../assets/images/chicken_biryani.jpg"),
];

// =========================================================
// API SUCCESS
// =========================================================

const isApiSuccess = (response) => {
  return (
    response?.success === 1 ||
    response?.success === true ||
    response?.success === "1"
  );
};

// =========================================================
// EXTRACT ARRAY
// =========================================================

const extractArray = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.blogs)) {
    return response.blogs;
  }

  if (Array.isArray(response?.data?.blogs)) {
    return response.data.blogs;
  }

  if (Array.isArray(response?.categories)) {
    return response.categories;
  }

  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }

  if (Array.isArray(response?.blogCategories)) {
    return response.blogCategories;
  }

  if (Array.isArray(response?.data?.blogCategories)) {
    return response.data.blogCategories;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }

    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }

    if (Array.isArray(response?.data?.data?.[key])) {
      return response.data.data[key];
    }
  }

  return [];
};

// =========================================================
// IMAGE SOURCE
// =========================================================

const getImageSource = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === "object" && image?.uri) {
    return {
      uri: image.uri,
    };
  }

  if (typeof image !== "string") {
    return null;
  }

  const value = image.trim();

  if (!value) {
    return null;
  }

  // Full URL
  if (/^https?:\/\//i.test(value)) {
    return {
      uri: value,
    };
  }

  // Relative URL
  const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");
  const imagePath = value.replace(/^\/+/, "");

  return {
    uri: `${baseUrl}/${imagePath}`,
  };
};

// =========================================================
// NORMALIZE CATEGORY
// =========================================================

const normalizeCategory = (item, index) => {
  if (typeof item === "string") {
    return {
      id: String(index),
      name: item,
    };
  }

  return {
    id: String(
      item?.id ??
        item?.category_id ??
        item?.blog_category_id ??
        item?.slug ??
        index,
    ),

    name:
      item?.name ??
      item?.title ??
      item?.category_name ??
      item?.categoryName ??
      item?.label ??
      item?.category ??
      `Category ${index + 1}`,
  };
};

// =========================================================
// NORMALIZE BLOG
// =========================================================

const normalizeBlog = (item, index) => {
  const categoryObject =
    item?.category && typeof item.category === "object" ? item.category : null;

  const imageValue =
    item?.image_url ??
    item?.imageUrl ??
    item?.image ??
    item?.thumbnail_url ??
    item?.thumbnail ??
    item?.banner_image ??
    item?.bannerImage ??
    item?.featured_image ??
    item?.featuredImage ??
    item?.cover_image ??
    item?.coverImage;

  const categoryName =
    categoryObject?.name ??
    categoryObject?.title ??
    item?.category_name ??
    item?.categoryName ??
    (typeof item?.category === "string" ? item.category : null) ??
    "Food";

  const categoryId =
    categoryObject?.id ?? item?.category_id ?? item?.blog_category_id ?? "";

  return {
    id: String(item?.id ?? item?.blog_id ?? item?.slug ?? `blog-${index}`),

    slug: item?.slug ?? "",

    title:
      item?.title ??
      item?.name ??
      item?.blog_title ??
      item?.blogTitle ??
      "Food Story",

    description:
      item?.description ??
      item?.short_description ??
      item?.shortDescription ??
      item?.excerpt ??
      item?.summary ??
      item?.content ??
      "",

    category: String(categoryName),

    categoryId: String(categoryId),

    date:
      item?.date ??
      item?.published_at ??
      item?.publishedAt ??
      item?.created_at ??
      item?.createdAt ??
      "",

    time:
      item?.time ??
      item?.read_time ??
      item?.reading_time ??
      item?.readTime ??
      "5 min read",

    image: getImageSource(imageValue),

    isFeatured:
      item?.is_featured === true ||
      item?.is_featured === 1 ||
      item?.is_featured === "1" ||
      item?.featured === true ||
      item?.featured === 1 ||
      item?.featured === "1" ||
      item?.isFeatured === true,
  };
};

// =========================================================
// DATE FORMAT
// =========================================================

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    !value.includes("T") &&
    !/^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return value;
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
};

// =========================================================
// BLOG SCREEN
// =========================================================

export default function BlogsScreen() {
  const { colors, isDark } = useTheme();

  // =======================================================
  // STATES
  // =======================================================

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // =======================================================
  // GET BLOGS
  // =======================================================

  const loadBlogs = useCallback(async () => {
    try {
      setError("");

      console.log("====================================");
      console.log("📚 GET BLOGS");
      console.log("====================================");

      const response = await getBlogs();

      console.log("📚 BLOG API RESPONSE:", JSON.stringify(response, null, 2));

      const list = extractArray(response, ["blogs", "items", "results"]);

      console.log("📚 BLOG COUNT:", list.length);

      const normalized = list.map(normalizeBlog);

      setBlogs(normalized);

      if (!isApiSuccess(response) && normalized.length === 0) {
        setError(
          response?.message || response?.error || "Unable to load blogs.",
        );
      }
    } catch (err) {
      console.log("❌ GET BLOGS ERROR:", err);

      setError(err?.message || "Unable to load blogs. Please try again.");
    }
  }, []);

  // =======================================================
  // GET BLOG CATEGORIES
  // =======================================================

  const loadBlogCategories = useCallback(async () => {
    try {
      setCategoryError("");

      console.log("====================================");
      console.log("🏷️ GET BLOG CATEGORIES");
      console.log("====================================");

      const response = await getBlogCategories();

      console.log(
        "🏷️ BLOG CATEGORY RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      const list = extractArray(response, [
        "categories",
        "blogCategories",
        "blog_categories",
        "items",
        "results",
      ]);

      console.log("🏷️ CATEGORY COUNT:", list.length);

      const normalized = list.map(normalizeCategory);

      setCategories(normalized);

      if (!isApiSuccess(response) && normalized.length === 0) {
        setCategoryError(
          response?.message ||
            response?.error ||
            "Unable to load blog categories.",
        );
      }
    } catch (err) {
      console.log("❌ GET BLOG CATEGORIES ERROR:", err);

      setCategoryError(err?.message || "Unable to load blog categories.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD APIs
  // =======================================================

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadData = async () => {
        if (!mounted) {
          return;
        }

        setLoading(true);
        setCategoriesLoading(true);

        try {
          await Promise.all([loadBlogs(), loadBlogCategories()]);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      loadData();

      return () => {
        mounted = false;
      };
    }, [loadBlogs, loadBlogCategories]),
  );

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await Promise.all([loadBlogs(), loadBlogCategories()]);
    } catch (err) {
      console.log("❌ REFRESH ERROR:", err);
    } finally {
      setRefreshing(false);
    }
  }, [loadBlogs, loadBlogCategories]);

  // =======================================================
  // CATEGORY LIST
  // =======================================================

  const categoryList = useMemo(() => {
    const result = [
      {
        id: "",
        name: "All",
      },
    ];

    categories.forEach((category) => {
      const exists = result.some(
        (item) =>
          String(item.id) === String(category.id) ||
          item.name.toLowerCase() === String(category.name).toLowerCase(),
      );

      if (!exists) {
        result.push(category);
      }
    });

    return result;
  }, [categories]);

  // =======================================================
  // FILTER BLOGS
  // =======================================================

  const filteredBlogs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return blogs.filter((item) => {
      let categoryMatch = true;

      if (selectedCategory !== "All") {
        const byId =
          selectedCategoryId &&
          String(item.categoryId) === String(selectedCategoryId);

        const byName =
          String(item.category || "")
            .trim()
            .toLowerCase() ===
          String(selectedCategory || "")
            .trim()
            .toLowerCase();

        categoryMatch = Boolean(byId) || Boolean(byName);
      }

      const searchMatch =
        !searchText ||
        String(item.title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.description || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.category || "")
          .toLowerCase()
          .includes(searchText);

      return categoryMatch && searchMatch;
    });
  }, [blogs, selectedCategory, selectedCategoryId, search]);

  // =======================================================
  // FEATURED BLOG
  // =======================================================

  const featuredBlog = useMemo(() => {
    if (filteredBlogs.length === 0) {
      return null;
    }

    return filteredBlogs.find((item) => item.isFeatured) || filteredBlogs[0];
  }, [filteredBlogs]);

  // =======================================================
  // LATEST BLOGS
  // =======================================================

  const latestBlogs = useMemo(() => {
    if (!featuredBlog) {
      return [];
    }

    return filteredBlogs.filter(
      (item) => String(item.id) !== String(featuredBlog.id),
    );
  }, [filteredBlogs, featuredBlog]);

  // =======================================================
  // OPEN BLOG DETAILS
  // =======================================================

  const openArticle = useCallback((item) => {
    if (!item) {
      return;
    }

    router.push({
      pathname: "/blog-details",
      params: {
        id: String(item.id),
        slug: String(item.slug || ""),
        title: String(item.title || ""),
        description: String(item.description || ""),
        date: String(item.date || ""),
        time: String(item.time || ""),
        category: String(item.category || ""),
        categoryId: String(item.categoryId || ""),
      },
    });
  }, []);

  // =======================================================
  // BLOG IMAGE
  // =======================================================

  const getBlogImage = (item, index) => {
    if (item?.image) {
      return item.image;
    }

    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading && blogs.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text
            style={[
              styles.loadingText,
              {
                color: colors.text,
              },
            ]}
          >
            Loading blogs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // MAIN SCREEN
  // =======================================================

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
              },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={23} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Blogs
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Discover food stories & tips
            </Text>
          </View>
        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={23}
            color={colors.textSecondary}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search blogs..."
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
          />

          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* =================================================
            CATEGORY TITLE
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Categories
          </Text>
        </View>

        {/* =================================================
            CATEGORY ERROR
        ================================================= */}

        {categoryError && categories.length === 0 ? (
          <View
            style={[
              styles.smallErrorBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {categoryError}
            </Text>

            <TouchableOpacity
              onPress={loadBlogCategories}
              style={[
                styles.retrySmallButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            CATEGORY LOADING
        ================================================= */}

        {categoriesLoading && categories.length === 0 ? (
          <View style={styles.categoryLoading}>
            <ActivityIndicator size="small" color={colors.primary} />

            <Text
              style={[
                styles.categoryLoadingText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Loading categories...
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categoryList.map((category) => {
              const active = selectedCategory === category.name;

              return (
                <TouchableOpacity
                  key={`${category.id}-${category.name}`}
                  onPress={() => {
                    setSelectedCategory(category.name);

                    setSelectedCategoryId(category.id);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: active ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* =================================================
            BLOG ERROR
        ================================================= */}

        {error && blogs.length === 0 ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={45}
              color={colors.primary}
            />

            <Text
              style={[
                styles.errorTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Unable to load blogs
            </Text>

            <Text
              style={[
                styles.errorText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {error}
            </Text>

            <TouchableOpacity
              onPress={loadBlogs}
              style={[
                styles.retryButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            FEATURED BLOG
        ================================================= */}

        {featuredBlog ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderInside}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Featured
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => openArticle(featuredBlog)}
              style={[
                styles.featuredCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* IMAGE */}
              <Image
                source={getBlogImage(featuredBlog, 0)}
                style={styles.featuredImage}
                resizeMode="cover"
              />

              {/* FEATURED CONTENT */}
              <View style={styles.featuredContent}>
                {/* CATEGORY */}
                <View
                  style={[
                    styles.featuredCategory,
                    {
                      backgroundColor: `${colors.primary}18`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.featuredCategoryText,
                      {
                        color: colors.primary,
                      },
                    ]}
                  >
                    {featuredBlog.category}
                  </Text>
                </View>

                {/* TITLE */}
                <Text
                  numberOfLines={2}
                  style={[
                    styles.featuredTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {featuredBlog.title}
                </Text>

                {/* DESCRIPTION */}
                {featuredBlog.description ? (
                  <Text
                    numberOfLines={3}
                    style={[
                      styles.featuredDescription,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {featuredBlog.description}
                  </Text>
                ) : null}

                {/* META */}
                <View style={styles.featuredMeta}>
                  {featuredBlog.date ? (
                    <View style={styles.metaItemDark}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.textSecondary}
                      />

                      <Text
                        style={[
                          styles.metaTextDark,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {formatDate(featuredBlog.date)}
                      </Text>
                    </View>
                  ) : null}

                  {featuredBlog.time ? (
                    <View style={styles.metaItemDark}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.textSecondary}
                      />

                      <Text
                        style={[
                          styles.metaTextDark,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {featuredBlog.time}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            LATEST ARTICLES
        ================================================= */}

        {latestBlogs.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderInside}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Latest Articles
              </Text>

              <Text
                style={[
                  styles.countText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {latestBlogs.length}{" "}
                {latestBlogs.length === 1 ? "article" : "articles"}
              </Text>
            </View>

            {latestBlogs.map((item, index) => (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                activeOpacity={0.9}
                onPress={() => openArticle(item)}
                style={[
                  styles.articleCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* =================================================
                      IMAGE ON TOP
                  ================================================= */}

                <Image
                  source={getBlogImage(item, index + 1)}
                  style={styles.articleImage}
                  resizeMode="cover"
                />

                {/* =================================================
                      CONTENT BELOW IMAGE
                  ================================================= */}

                <View style={styles.articleContent}>
                  {/* CATEGORY */}
                  <View
                    style={[
                      styles.articleCategory,
                      {
                        backgroundColor: `${colors.primary}18`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.articleCategoryText,
                        {
                          color: colors.primary,
                        },
                      ]}
                    >
                      {item.category}
                    </Text>
                  </View>

                  {/* TITLE */}
                  <Text
                    numberOfLines={3}
                    style={[
                      styles.articleTitle,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>

                  {/* DESCRIPTION */}
                  {item.description ? (
                    <Text
                      numberOfLines={4}
                      style={[
                        styles.articleDescription,
                        {
                          color: colors.textSecondary,
                        },
                      ]}
                    >
                      {item.description}
                    </Text>
                  ) : null}

                  {/* META */}
                  <View style={styles.articleMeta}>
                    {item.date ? (
                      <View style={styles.metaItemDark}>
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color={colors.textSecondary}
                        />

                        <Text
                          style={[
                            styles.metaTextDark,
                            {
                              color: colors.textSecondary,
                            },
                          ]}
                        >
                          {formatDate(item.date)}
                        </Text>
                      </View>
                    ) : null}

                    {item.time ? (
                      <View style={styles.metaItemDark}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={colors.textSecondary}
                        />

                        <Text
                          style={[
                            styles.metaTextDark,
                            {
                              color: colors.textSecondary,
                            },
                          ]}
                        >
                          {item.time}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* READ MORE */}
                  <View
                    style={[
                      styles.readMoreRow,
                      {
                        borderTopColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.readMoreText,
                        {
                          color: colors.primary,
                        },
                      ]}
                    >
                      Read Full Article
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* =================================================
            NO SEARCH RESULT
        ================================================= */}

        {!loading && blogs.length > 0 && filteredBlogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: `${colors.primary}15`,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={45}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No blogs found
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Try another search or category.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedCategoryId("");
              }}
              style={[
                styles.clearButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            NO API DATA
        ================================================= */}

        {!loading && !error && blogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: `${colors.primary}15`,
                },
              ]}
            >
              <Ionicons
                name="newspaper-outline"
                size={45}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No blogs available
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              New food stories will appear here.
            </Text>

            <TouchableOpacity
              onPress={loadBlogs}
              style={[
                styles.clearButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.clearButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // =======================================================
  // LOADING
  // =======================================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 17,
    fontFamily: Fonts?.medium,
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: Fonts?.bold,
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts?.regular,
  },

  // =======================================================
  // SEARCH
  // =======================================================

  searchContainer: {
    marginHorizontal: 18,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  searchInput: {
    flex: 1,
    marginLeft: 11,
    fontSize: 16,
    fontFamily: Fonts?.regular,
    paddingVertical: 12,
  },

  // =======================================================
  // SECTION
  // =======================================================

  section: {
    marginTop: 25,
    paddingHorizontal: 18,
  },

  sectionHeader: {
    marginTop: 24,
    paddingHorizontal: 18,
    marginBottom: 13,
  },

  sectionHeaderInside: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Fonts?.bold,
  },

  countText: {
    fontSize: 14,
    fontFamily: Fonts?.medium,
  },

  // =======================================================
  // CATEGORY
  // =======================================================

  categoryScroll: {
    paddingHorizontal: 18,
    paddingBottom: 3,
    gap: 10,
  },

  categoryChip: {
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1,
  },

  categoryText: {
    fontSize: 15,
    fontFamily: Fonts?.semiBold,
  },

  categoryLoading: {
    minHeight: 50,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  categoryLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Fonts?.regular,
  },

  // =======================================================
  // FEATURED CARD
  // =======================================================

  featuredCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },

  featuredImage: {
    width: "100%",
    height: 235,
  },

  featuredContent: {
    paddingHorizontal: 18,
    paddingVertical: 17,
  },

  featuredCategory: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    marginBottom: 10,
  },

  featuredCategoryText: {
    fontSize: 14,
    fontFamily: Fonts?.semiBold,
  },

  featuredTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontFamily: Fonts?.bold,
  },

  featuredDescription: {
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
    fontFamily: Fonts?.regular,
  },

  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 13,
  },

  // =======================================================
  // ARTICLE CARD - VERTICAL
  // =======================================================

  articleCard: {
    width: "100%",
    borderRadius: 19,
    borderWidth: 1,
    marginBottom: 17,
    overflow: "hidden",
  },

  // IMAGE ON TOP
  articleImage: {
    width: "100%",
    height: 220,
  },

  // CONTENT BELOW IMAGE
  articleContent: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 17,
  },

  articleCategory: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
  },

  articleCategoryText: {
    fontSize: 14,
    fontFamily: Fonts?.semiBold,
  },

  articleTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontFamily: Fonts?.bold,
    marginTop: 10,
  },

  articleDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts?.regular,
    marginTop: 8,
  },

  // =======================================================
  // META
  // =======================================================

  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 13,
  },

  metaItemDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaTextDark: {
    fontSize: 13,
    fontFamily: Fonts?.medium,
  },

  // =======================================================
  // READ MORE
  // =======================================================

  readMoreRow: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  readMoreText: {
    fontSize: 15,
    fontFamily: Fonts?.bold,
  },

  // =======================================================
  // ERRORS
  // =======================================================

  errorBox: {
    marginHorizontal: 18,
    marginTop: 22,
    padding: 27,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },

  errorTitle: {
    fontSize: 19,
    fontFamily: Fonts?.bold,
    marginTop: 11,
  },

  errorText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    fontFamily: Fonts?.regular,
  },

  retryButton: {
    marginTop: 17,
    paddingHorizontal: 27,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retrySmallButton: {
    marginTop: 9,
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold,
  },

  smallErrorBox: {
    marginHorizontal: 18,
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
  },

  // =======================================================
  // EMPTY
  // =======================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 65,
    paddingBottom: 35,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 21,
    fontFamily: Fonts?.bold,
    marginTop: 15,
  },

  emptyText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 22,
    fontFamily: Fonts?.regular,
  },

  clearButton: {
    marginTop: 18,
    paddingHorizontal: 23,
    paddingVertical: 12,
    borderRadius: 12,
  },

  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold,
  },

  bottomSpace: {
    height: 40,
  },
});
