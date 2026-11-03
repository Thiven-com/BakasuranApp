import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { getBlogs } from "../utils/Function";

// =========================================================
// FALLBACK IMAGES
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
// EXTRACT BLOGS
// =========================================================

const extractBlogs = (response) => {
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

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
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

  // Already full URL
  if (/^https?:\/\//i.test(value)) {
    return {
      uri: value,
    };
  }

  const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");
  const imagePath = value.replace(/^\/+/, "");

  return {
    uri: `${baseUrl}/${imagePath}`,
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
    categoryObject?.id ??
    item?.category_id ??
    item?.blog_category_id ??
    item?.blogCategoryId ??
    "";

  return {
    id: String(item?.id ?? item?.blog_id ?? item?.slug ?? `blog-${index}`),

    slug: item?.slug ?? "",

    title:
      item?.title ??
      item?.name ??
      item?.blog_title ??
      item?.blogTitle ??
      "Food Story",

    // =====================================================
    // IMPORTANT:
    // Keep the complete content/description
    // =====================================================

    description:
      item?.description ??
      item?.short_description ??
      item?.shortDescription ??
      item?.excerpt ??
      item?.summary ??
      item?.content ??
      item?.blog_content ??
      item?.blogContent ??
      "",

    content:
      item?.content ??
      item?.blog_content ??
      item?.blogContent ??
      item?.description ??
      item?.short_description ??
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
// HTML / CONTENT CLEANER
// =========================================================

const cleanHtmlContent = (value) => {
  if (!value) {
    return "";
  }

  let text = String(value);

  // Convert common HTML line breaks
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n");

  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  // Remove excessive spaces
  text = text.replace(/[ \t]+/g, " ");

  // Keep paragraph breaks
  text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");

  return text.trim();
};

// =========================================================
// BLOG DETAILS SCREEN
// =========================================================

export default function BlogDetailsScreen() {
  const { colors, isDark } = useTheme();

  const params = useLocalSearchParams();

  // =======================================================
  // PARAMS
  // =======================================================

  const blogId = String(params?.id ?? "");

  const blogSlug = String(params?.slug ?? "");

  const paramTitle = String(params?.title ?? "");

  const paramDescription = String(params?.description ?? "");

  const paramDate = String(params?.date ?? "");

  const paramTime = String(params?.time ?? "");

  const paramCategory = String(params?.category ?? "Food");

  const paramCategoryId = String(params?.categoryId ?? "");

  // =======================================================
  // STATES
  // =======================================================

  const [blog, setBlog] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // =======================================================
  // FIND BLOG FROM API
  // =======================================================

  const loadBlog = useCallback(async () => {
    try {
      setError("");

      console.log("====================================");
      console.log("📖 BLOG DETAILS");
      console.log("====================================");

      console.log("🆔 BLOG ID:", blogId);
      console.log("🔗 BLOG SLUG:", blogSlug);

      const response = await getBlogs();

      console.log(
        "📖 BLOG DETAILS API RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      const list = extractBlogs(response);

      console.log("📚 TOTAL BLOGS:", list.length);

      const normalized = list.map(normalizeBlog);

      // =====================================================
      // FIND EXACT BLOG
      // =====================================================

      let foundBlog = null;

      // First search by ID
      if (blogId) {
        foundBlog = normalized.find(
          (item) =>
            String(item.id).toLowerCase() === String(blogId).toLowerCase(),
        );
      }

      // Then search by slug
      if (!foundBlog && blogSlug) {
        foundBlog = normalized.find(
          (item) =>
            String(item.slug).toLowerCase() === String(blogSlug).toLowerCase(),
        );
      }

      // =====================================================
      // FALLBACK TO PARAM DATA
      // =====================================================

      if (!foundBlog && paramTitle) {
        foundBlog = {
          id: blogId,
          slug: blogSlug,
          title: paramTitle,
          description: paramDescription,
          content: paramDescription,
          date: paramDate,
          time: paramTime || "5 min read",
          category: paramCategory,
          categoryId: paramCategoryId,
          image: null,
          isFeatured: false,
        };
      }

      if (!foundBlog) {
        setError("This blog could not be found.");
        setBlog(null);
      } else {
        setBlog(foundBlog);
      }

      if (!isApiSuccess(response) && normalized.length === 0 && !paramTitle) {
        setError(
          response?.message || response?.error || "Unable to load blog.",
        );
      }
    } catch (err) {
      console.log("❌ BLOG DETAILS ERROR:", err);

      // =====================================================
      // USE ROUTE PARAMS IF API FAILS
      // =====================================================

      if (paramTitle) {
        setBlog({
          id: blogId,
          slug: blogSlug,
          title: paramTitle,
          description: paramDescription,
          content: paramDescription,
          date: paramDate,
          time: paramTime || "5 min read",
          category: paramCategory,
          categoryId: paramCategoryId,
          image: null,
          isFeatured: false,
        });

        setError("");
      } else {
        setError(err?.message || "Unable to load blog. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    blogId,
    blogSlug,
    paramTitle,
    paramDescription,
    paramDate,
    paramTime,
    paramCategory,
    paramCategoryId,
  ]);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await loadBlog();
    } catch (err) {
      console.log("❌ REFRESH BLOG ERROR:", err);
    } finally {
      setRefreshing(false);
    }
  }, [loadBlog]);

  // =======================================================
  // BACK
  // =======================================================

  const handleBack = () => {
    router.back();
  };

  // =======================================================
  // OPEN CATEGORY
  // =======================================================

  const openCategory = () => {
    if (!blog) {
      router.back();
      return;
    }

    router.push({
      pathname: "/blogscategories-details",
      params: {
        categoryId: String(blog.categoryId || ""),
        categoryName: String(blog.category || "Food"),
      },
    });
  };

  // =======================================================
  // GET BLOG IMAGE
  // =======================================================

  const getBlogImage = () => {
    if (blog?.image) {
      return blog.image;
    }

    return FALLBACK_IMAGES[0];
  };

  // =======================================================
  // CLEAN COMPLETE CONTENT
  // =======================================================

  const fullContent = cleanHtmlContent(
    blog?.content || blog?.description || "",
  );

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
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
            Loading blog...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (!blog) {
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

        <View style={styles.errorScreen}>
          <View
            style={[
              styles.errorIcon,
              {
                backgroundColor: `${colors.primary}18`,
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
              styles.errorTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Blog Not Found
          </Text>

          <Text
            style={[
              styles.errorMessage,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {error || "The requested blog is not available."}
          </Text>

          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backButtonLarge,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />

            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
            TOP HEADER
        ================================================= */}

        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.8}
            style={[
              styles.headerBackButton,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerLabel,
              {
                color: colors.text,
              },
            ]}
          >
            Blog Details
          </Text>

          <TouchableOpacity
            onPress={handleRefresh}
            activeOpacity={0.8}
            style={[
              styles.headerRefreshButton,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* =================================================
            BLOG IMAGE
        ================================================= */}

        <View style={styles.heroContainer}>
          <Image
            source={getBlogImage()}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* IMAGE OVERLAY */}

          <View
            style={[
              styles.imageOverlay,
              {
                backgroundColor: "rgba(0,0,0,0.18)",
              },
            ]}
          />

          {/* CATEGORY BADGE */}

          <TouchableOpacity
            onPress={openCategory}
            activeOpacity={0.85}
            style={[
              styles.heroCategory,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="pricetag-outline" size={13} color="#FFFFFF" />

            <Text numberOfLines={1} style={styles.heroCategoryText}>
              {blog.category}
            </Text>
          </TouchableOpacity>
        </View>

        {/* =================================================
            ARTICLE CONTENT
        ================================================= */}

        <View style={styles.articleContainer}>
          {/* CATEGORY */}

          <TouchableOpacity
            onPress={openCategory}
            activeOpacity={0.8}
            style={[
              styles.categoryPill,
              {
                backgroundColor: `${colors.primary}18`,
              },
            ]}
          >
            <Ionicons name="grid-outline" size={14} color={colors.primary} />

            <Text
              style={[
                styles.categoryPillText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {blog.category}
            </Text>
          </TouchableOpacity>

          {/* TITLE */}

          <Text
            style={[
              styles.articleTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {blog.title}
          </Text>

          {/* META */}

          <View
            style={[
              styles.metaContainer,
              {
                borderColor: colors.border,
              },
            ]}
          >
            {blog.date ? (
              <View style={styles.metaItem}>
                <View
                  style={[
                    styles.metaIcon,
                    {
                      backgroundColor: `${colors.primary}15`,
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      styles.metaLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Published
                  </Text>

                  <Text
                    style={[
                      styles.metaValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {formatDate(blog.date)}
                  </Text>
                </View>
              </View>
            ) : null}

            {blog.time ? (
              <View style={styles.metaItem}>
                <View
                  style={[
                    styles.metaIcon,
                    {
                      backgroundColor: `${colors.primary}15`,
                    },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      styles.metaLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Reading Time
                  </Text>

                  <Text
                    style={[
                      styles.metaValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {blog.time}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* =================================================
              FULL DESCRIPTION / CONTENT
          ================================================= */}

          <View style={styles.contentSection}>
            <Text
              style={[
                styles.contentHeading,
                {
                  color: colors.text,
                },
              ]}
            >
              About This Story
            </Text>

            {fullContent ? (
              <Text
                style={[
                  styles.fullDescription,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {fullContent}
              </Text>
            ) : (
              <Text
                style={[
                  styles.noContentText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                No description is available for this blog.
              </Text>
            )}
          </View>

          {/* =================================================
              CATEGORY BUTTON
          ================================================= */}

          <TouchableOpacity
            onPress={openCategory}
            activeOpacity={0.85}
            style={[
              styles.categoryButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.categoryButtonIcon,
                {
                  backgroundColor: `${colors.primary}18`,
                },
              ]}
            >
              <Ionicons name="grid-outline" size={19} color={colors.primary} />
            </View>

            <View style={styles.categoryButtonContent}>
              <Text
                style={[
                  styles.categoryButtonTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                More from {blog.category}
              </Text>

              <Text
                style={[
                  styles.categoryButtonSubtitle,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Explore more blogs in this category
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* =================================================
              BOTTOM BACK BUTTON
          ================================================= */}

          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.85}
            style={[
              styles.backToBlogsButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />

            <Text style={styles.backToBlogsText}>Back to Blogs</Text>
          </TouchableOpacity>
        </View>

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
    marginTop: 12,
    fontSize: 15,
    fontFamily: Fonts?.medium,
  },

  // =======================================================
  // TOP HEADER
  // =======================================================

  topHeader: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  headerLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: Fonts?.bold,
  },

  headerRefreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  // =======================================================
  // HERO
  // =======================================================

  heroContainer: {
    marginHorizontal: 14,
    height: 245,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  heroCategory: {
    position: "absolute",
    left: 15,
    bottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "75%",
  },

  heroCategoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: Fonts?.semiBold,
  },

  // =======================================================
  // ARTICLE
  // =======================================================

  articleContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  categoryPillText: {
    fontSize: 12,
    fontFamily: Fonts?.semiBold,
  },

  articleTitle: {
    fontSize: 27,
    lineHeight: 35,
    fontFamily: Fonts?.bold,
    marginTop: 13,
  },

  // =======================================================
  // META
  // =======================================================

  metaContainer: {
    marginTop: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  metaLabel: {
    fontSize: 10,
    fontFamily: Fonts?.regular,
  },

  metaValue: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: Fonts?.semiBold,
  },

  // =======================================================
  // FULL CONTENT
  // =======================================================

  contentSection: {
    marginTop: 24,
  },

  contentHeading: {
    fontSize: 20,
    fontFamily: Fonts?.bold,
    marginBottom: 10,
  },

  fullDescription: {
    fontSize: 15,
    lineHeight: 26,
    fontFamily: Fonts?.regular,
    textAlign: "left",
  },

  noContentText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts?.regular,
  },

  // =======================================================
  // CATEGORY BUTTON
  // =======================================================

  categoryButton: {
    marginTop: 28,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  categoryButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryButtonContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  categoryButtonTitle: {
    fontSize: 14,
    fontFamily: Fonts?.bold,
  },

  categoryButtonSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
    fontFamily: Fonts?.regular,
  },

  // =======================================================
  // BACK BUTTON
  // =======================================================

  backToBlogsButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  backToBlogsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold,
  },

  // =======================================================
  // ERROR
  // =======================================================

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    fontSize: 21,
    fontFamily: Fonts?.bold,
    marginTop: 16,
  },

  errorMessage: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    fontFamily: Fonts?.regular,
  },

  backButtonLarge: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: Fonts?.bold,
  },

  bottomSpace: {
    height: 40,
  },
});
