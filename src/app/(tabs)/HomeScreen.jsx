
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BannersScreen from "../../components/BannersScreen";
import HomeHeader from "../../components/HomeHeader";
import HomeSearchResults from "../../components/HomeSearchResults";
import RestaurantCard from "../../components/RestaurantCard";
import SearchBar from "../../components/SearchBar";
import { useTheme } from "../../hooks/use-theme";

import {
  getBanners,
  getCategories,

  getHome,
  getNotifications,
  getProduct,
} from "../../utils/Function";

// =====================================================
// LOCAL CATEGORY FALLBACK IMAGES
// =====================================================

const CATEGORY_IMAGES = {
  all: require("../../../assets/images/all.png"),
  dosa: require("../../../assets/images/dosa.png"),
  "south indian": require("../../../assets/images/south_indian.png"),
  biryani: require("../../../assets/images/biryani.png"),
  idli: require("../../../assets/images/idli.png"),
  pizza: require("../../../assets/images/pizza.png"),
  burgers: require("../../../assets/images/burgers.png"),
  chinese: require("../../../assets/images/chinese.png"),
  chicken: require("../../../assets/images/fried_chicken.jpg"),
  desserts: require("../../../assets/images/desserts.png"),
  drinks: require("../../../assets/images/drinks.png"),
};

// =====================================================
// NORMALIZE API LIST
// =====================================================

const extractList = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }

    if (Array.isArray(payload?.data?.[key])) {
      return payload.data[key];
    }

    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  return [];
};

// =====================================================
// API SUCCESS CHECK
// =====================================================

const isApiSuccess = (response) =>
  [1, true, "1"].includes(response?.success);

// =====================================================
// CATEGORY HELPERS
// =====================================================

const getCategoryName = (item) =>
  item?.name ||
  item?.title ||
  item?.category_name ||
  "Category";

const getCategoryId = (item) =>
  item?.id ??
  item?.category_id ??
  item?.categoryId ??
  "";

// =====================================================
// PRODUCT HELPERS
// =====================================================

const getProductName = (item) =>
  item?.name ||
  item?.product_name ||
  item?.title ||
  item?.product?.name ||
  "Product";

const getProductId = (item, index) =>
  item?.id ??
  item?.product_id ??
  item?.productId ??
  item?.product?.id ??
  index;

const getProductPrice = (item) => {
  const price =
    item?.selling_price ??
    item?.discount_price ??
    item?.sale_price ??
    item?.price ??
    item?.product_price ??
    item?.product?.selling_price ??
    item?.product?.price;

  if (price === undefined || price === null || price === "") {
    return null;
  }

  const numericPrice = Number(price);

  return Number.isFinite(numericPrice)
    ? `₹${numericPrice.toFixed(2)}`
    : `₹${price}`;
};

const getProductImage = (item) => {
  const possibleImage =
    item?.image_url ||
    item?.product_image_url ||
    item?.thumbnail_url ||
    item?.thumbnail ||
    item?.image ||
    item?.product_image ||
    item?.product?.image_url ||
    item?.product?.image ||
    item?.images?.[0]?.image_url ||
    item?.images?.[0]?.url ||
    item?.images?.[0]?.image ||
    item?.image?.url;

  if (
    typeof possibleImage === "string" &&
    /^https?:\/\//i.test(possibleImage)
  ) {
    return { uri: possibleImage };
  }

  if (
    possibleImage &&
    typeof possibleImage === "object" &&
    typeof possibleImage.uri === "string"
  ) {
    return { uri: possibleImage.uri };
  }

  // Fallback for missing images or relative image paths.
  return CATEGORY_IMAGES.all;
};

// =====================================================
// HOME SCREEN
// =====================================================

const HomeScreen = () => {
  const { colors } = useTheme();

  const styles = useMemo(
    () => makeStyles(colors),
    [colors]
  );

  // ===================================================
  // SEARCH
  // ===================================================

  const [searchText, setSearchText] = useState("");

  const hasSearchQuery = searchText.trim().length > 0;

  // ===================================================
  // HOME API STATE
  // ===================================================

  const [homeData, setHomeData] = useState(null);
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeError, setHomeError] = useState("");
  const [homeRetry, setHomeRetry] = useState(0);

  // ===================================================
  // CATEGORIES API STATE
  // ===================================================

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoriesRetry, setCategoriesRetry] = useState(0);

  
  // ===================================================
  // BANNERS API STATE
  // ===================================================

  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [bannersError, setBannersError] = useState("");
  const [bannersRetry, setBannersRetry] = useState(0);

  // ===================================================
  // NOTIFICATIONS API STATE
  // ===================================================

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationsRetry, setNotificationsRetry] = useState(0);

  // ===================================================
  // PRODUCTS API STATE
  // ===================================================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productsRetry, setProductsRetry] = useState(0);

  // ===================================================
  // GET HOME API
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchHome = async () => {
        try {
          setHomeLoading(true);
          setHomeError("");

          const response = await getHome();

          console.log(
            "HOME API RESPONSE:",
            JSON.stringify(response, null, 2)
          );

          if (!isActive) return;

          if (response?.success != null && !isApiSuccess(response)) {
            setHomeError(
              response?.message || "Unable to load home data."
            );
            return;
          }

          setHomeData(response?.data ?? response);
        } catch (error) {
          if (!isActive) return;

          console.log(
            "HOME API ERROR:",
            error?.response?.data || error?.message
          );

          setHomeError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load home data."
          );
        } finally {
          if (isActive) setHomeLoading(false);
        }
      };

      fetchHome();

      return () => {
        isActive = false;
      };
    }, [homeRetry])
  );

  // ===================================================
  // GET CATEGORIES API
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCategories = async () => {
        try {
          setCategoriesLoading(true);
          setCategoriesError("");

          const response = await getCategories();

          console.log(
            "CATEGORIES API RESPONSE:",
            JSON.stringify(response, null, 2)
          );

          if (!isActive) return;

          if (
            response?.success != null &&
            !isApiSuccess(response)
          ) {
            setCategoriesError(
              response?.message || "Unable to load categories."
            );
            return;
          }

          const list = extractList(response, ["categories"]);

          const visibleCategories = list.filter((item) => {
            if (item?.status == null) return true;

            return ["show", "active", "1"].includes(
              String(item.status).toLowerCase()
            );
          });

          setCategories(visibleCategories);
        } catch (error) {
          if (!isActive) return;

          console.log(
            "CATEGORIES API ERROR:",
            error?.response?.data || error?.message
          );

          setCategoriesError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load categories."
          );
        } finally {
          if (isActive) setCategoriesLoading(false);
        }
      };

      fetchCategories();

      return () => {
        isActive = false;
      };
    }, [categoriesRetry])
  );

 
  // ===================================================
  // GET BANNERS API
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchBanners = async () => {
        try {
          setBannersLoading(true);
          setBannersError("");

          const response = await getBanners();

          console.log(
            "BANNERS API RESPONSE:",
            JSON.stringify(response, null, 2)
          );

          if (!isActive) return;

          const list = extractList(response, [
            "banners",
            "banner",
          ]);

          if (
            response?.success != null &&
            !isApiSuccess(response)
          ) {
            setBannersError(
              response?.message || "Unable to load banners."
            );
            return;
          }

          setBanners(list);
        } catch (error) {
          if (!isActive) return;

          console.log(
            "BANNERS API ERROR:",
            error?.response?.data || error?.message
          );

          setBannersError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load banners."
          );
        } finally {
          if (isActive) setBannersLoading(false);
        }
      };

      fetchBanners();

      return () => {
        isActive = false;
      };
    }, [bannersRetry])
  );

  // ===================================================
  // GET NOTIFICATIONS API
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchNotifications = async () => {
        try {
          setNotificationsLoading(true);
          setNotificationsError("");

          const response = await getNotifications();

          console.log(
            "NOTIFICATIONS API RESPONSE:",
            JSON.stringify(response, null, 2)
          );

          if (!isActive) return;

          if (
            response?.success != null &&
            !isApiSuccess(response)
          ) {
            setNotificationsError(
              response?.message || "Unable to load notifications."
            );
            setNotifications([]);
            return;
          }

          const list = extractList(response, [
            "notifications",
            "notification",
          ]);

          setNotifications(list);
        } catch (error) {
          if (!isActive) return;

          console.log(
            "NOTIFICATIONS API ERROR:",
            error?.response?.data || error?.message
          );

          setNotificationsError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load notifications."
          );

          setNotifications([]);
        } finally {
          if (isActive) setNotificationsLoading(false);
        }
      };

      fetchNotifications();

      return () => {
        isActive = false;
      };
    }, [notificationsRetry])
  );

  // ===================================================
  // GET PRODUCTS API
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProducts = async () => {
        try {
          setProductsLoading(true);
          setProductsError("");

          const response = await getProduct();

          console.log(
            "PRODUCT API RESPONSE:",
            JSON.stringify(response, null, 2)
          );

          if (!isActive) return;

          if (
            response?.success != null &&
            !isApiSuccess(response)
          ) {
            setProductsError(
              response?.message || "Unable to load products."
            );
            setProducts([]);
            return;
          }

          const list = extractList(response, [
            "products",
            "product",
          ]);

          console.log(
            "PRODUCT LIST:",
            JSON.stringify(list, null, 2)
          );

          setProducts(list);
        } catch (error) {
          if (!isActive) return;

          console.log(
            "PRODUCT API ERROR:",
            error?.response?.status,
            error?.response?.data || error?.message
          );

          setProductsError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load products."
          );

          setProducts([]);
        } finally {
          if (isActive) setProductsLoading(false);
        }
      };

      fetchProducts();

      return () => {
        isActive = false;
      };
    }, [productsRetry])
  );

  // ===================================================
  // CATEGORY IMAGE
  // ===================================================

  const getCategoryImage = (item) => {
    const imageUrl =
      item?.image_url ||
      item?.image ||
      item?.icon ||
      item?.category_image;

    if (
      typeof imageUrl === "string" &&
      /^https?:\/\//i.test(imageUrl)
    ) {
      return { uri: imageUrl };
    }

    const name = String(getCategoryName(item))
      .trim()
      .toLowerCase();

    return CATEGORY_IMAGES[name] || CATEGORY_IMAGES.all;
  };

  // ===================================================
  // NAVIGATION
  // ===================================================

  const openCategory = (item) => {
    router.push({
      pathname: "/(tabs)/ExploreScreen",
      params: {
        search: getCategoryName(item),
        categoryId: String(getCategoryId(item)),
      },
    });
  };

  const openNotifications = () => {
    router.push("/notifications");
  };

  const openProduct = (item) => {
    const productId = getProductId(item, 0);
    const productName = getProductName(item);

    // Replace this route if your app has a dedicated product-details screen.
    router.push({
      pathname: "/(tabs)/ExploreScreen",
      params: {
        search: productName,
        productId: String(productId),
      },
    });
  };

  // ===================================================
  // UNREAD NOTIFICATION COUNT
  // ===================================================

  const unreadNotificationCount = notifications.filter((item) => {
    const readValue =
      item?.is_read ??
      item?.isRead ??
      item?.read;

    return !(
      readValue === true ||
      readValue === 1 ||
      readValue === "1"
    );
  }).length;

  // ===================================================
  // RETRY HANDLERS
  // ===================================================

  const retryHome = () => setHomeRetry((previous) => previous + 1);
  const retryCategories = () =>
    setCategoriesRetry((previous) => previous + 1);
 
  const retryBanners = () =>
    setBannersRetry((previous) => previous + 1);
  const retryNotifications = () =>
    setNotificationsRetry((previous) => previous + 1);
  const retryProducts = () =>
    setProductsRetry((previous) => previous + 1);

  // ===================================================
  // CATEGORY LIST
  // ===================================================

  const renderCategoryList = (list, featured = false) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={
        featured ? styles.featuredList : styles.cuisineTopList
      }
    >
      {list.map((item, index) => {
        const id = getCategoryId(item);
        const name = getCategoryName(item);

        return (
          <TouchableOpacity
            key={String(id || `${name}-${index}`)}
            style={
              featured ? styles.featuredItem : styles.cuisineTopItem
            }
            activeOpacity={0.8}
            onPress={() => openCategory(item)}
          >
            <Image
              source={getCategoryImage(item)}
              style={
                featured ? styles.featuredImage : styles.cuisineTopImage
              }
              resizeMode={featured ? "cover" : "contain"}
            />

            <Text
              style={
                featured ? styles.featuredName : styles.cuisineTopText
              }
              numberOfLines={2}
            >
              {name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ===================================================
  // CATEGORY STATUS
  // ===================================================

  const renderCategoryStatus = (
    loading,
    error,
    list,
    retry,
    emptyMessage
  ) => {
    if (loading && list.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusText}>Loading...</Text>
        </View>
      );
    }

    if (error && list.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={retry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (list.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{emptyMessage}</Text>
        </View>
      );
    }

    return null;
  };

  // ===================================================
  // PRODUCTS SECTION
  // ===================================================

  const renderProductsSection = () => {
    if (productsLoading && products.length === 0) {
      return (
        <View style={styles.productStatus}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusText}>Loading products...</Text>
        </View>
      );
    }

    if (productsError && products.length === 0) {
      return (
        <View style={styles.productStatus}>
          <Text style={styles.errorText}>{productsError}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={retryProducts}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (products.length === 0) {
      return (
        <View style={styles.productStatus}>
          <Text style={styles.statusText}>
            No products available.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
      >
        {products.map((item, index) => {
          const productId = getProductId(item, index);
          const productName = getProductName(item);
          const productPrice = getProductPrice(item);

          const oldPrice =
            item?.original_price ??
            item?.regular_price ??
            item?.mrp;

          return (
            <TouchableOpacity
              key={String(productId)}
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => openProduct(item)}
            >
              <View style={styles.productImageContainer}>
                <Image
                  source={getProductImage(item)}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                {Number(item?.discount_percentage) > 0 && (
                  <View style={styles.productDiscount}>
                    <Text style={styles.productDiscountText}>
                      {item.discount_percentage}% OFF
                    </Text>
                  </View>
                )}

                <View style={styles.productImageIcon}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.productDetails}>
                <Text
                  style={styles.productName}
                  numberOfLines={2}
                >
                  {productName}
                </Text>

                {(item?.category?.name || item?.category_name) && (
                  <Text
                    style={styles.productCategory}
                    numberOfLines={1}
                  >
                    {item?.category?.name || item?.category_name}
                  </Text>
                )}

                <View style={styles.productPriceRow}>
                  {productPrice !== null && (
                    <Text style={styles.productPrice}>
                      {productPrice}
                    </Text>
                  )}

                  {oldPrice != null &&
                    Number(oldPrice) > 0 &&
                    Number(oldPrice) >
                      Number(
                        item?.selling_price ??
                          item?.discount_price ??
                          item?.sale_price ??
                          item?.price ??
                          item?.product_price ??
                          item?.product?.price
                      ) && (
                      <Text style={styles.productOldPrice}>
                        ₹{Number(oldPrice).toFixed(2)}
                      </Text>
                    )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  // ===================================================
  // HOME SCREEN UI
  // ===================================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.headerWrapper}>
        <HomeHeader />

        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.8}
          onPress={openNotifications}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={27}
            color="#FFFFFF"
          />

          {unreadNotificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotificationCount > 99
                  ? "99+"
                  : unreadNotificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* NOTIFICATIONS LOADING */}

        {notificationsLoading && (
          <View style={styles.notificationLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.notificationLoadingText}>
              Loading notifications...
            </Text>
          </View>
        )}

        {/* NOTIFICATIONS ERROR */}

        {!notificationsLoading && notificationsError !== "" && (
          <View style={styles.notificationError}>
            <Text style={styles.notificationErrorText}>
              {notificationsError}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryNotifications}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HOME LOADING */}

        {homeLoading && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.statusText}>Loading home...</Text>
          </View>
        )}

        {/* HOME ERROR */}

        {!homeLoading && homeError !== "" && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              Unable to load home data
            </Text>

            <Text style={styles.errorText}>{homeError}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryHome}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SEARCH */}

        <View style={styles.searchWrap}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        {/* BANNERS */}

        {!hasSearchQuery && (
          <View>
            {bannersLoading && banners.length === 0 && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginVertical: 15 }}
              />
            )}

            {bannersError !== "" && banners.length === 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{bannersError}</Text>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={retryBanners}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {banners.length > 0 && (
              <BannersScreen banners={banners} />
            )}
          </View>
        )}

        {/* CATEGORIES */}

        {!hasSearchQuery && (
          <View style={styles.cuisineTopSection}>
            <Text style={styles.categoriesTitle}>
                  Categories
                </Text>

            {renderCategoryStatus(
              categoriesLoading,
              categoriesError,
              categories,
              retryCategories,
              "No categories available."
            )}

            {categories.length > 0 &&
              renderCategoryList(categories)}
          </View>
        )}

       

        {/* PRODUCTS */}

        {!hasSearchQuery && (
          <View style={styles.productsSection}>
            <View style={styles.productsHeader}>
              <View style={styles.productsHeadingText}>
                <Text style={styles.productsTitle}>
                  Popular Products
                </Text>

                <Text style={styles.productsSubtitle}>
                  Discover something delicious
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push("/(tabs)/ExploreScreen")
                }
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {renderProductsSection()}
          </View>
        )}

        {/* RESTAURANTS / SEARCH RESULTS */}

        <View style={styles.restaurantSection}>
          {hasSearchQuery ? (
            <HomeSearchResults
              searchText={searchText.trim()}
            />
          ) : (
            <RestaurantCard />
          )}
        </View>

        {/* TABLE BOOKING */}

        {!hasSearchQuery && (
          <View style={styles.bookingCard}>
            <Image
              source={require("../../../assets/images/book_table.jpg")}
              style={styles.bookingImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.findTableButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Find a table"
              onPress={() => router.push("/table-booking")}
            />
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    // HEADER

    headerWrapper: {
      position: "relative",
    },

    notificationButton: {
      position: "absolute",
      right: 16,
      top: 12,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    },

    notificationBadge: {
      position: "absolute",
      top: 1,
      right: 1,
      minWidth: 19,
      height: 19,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.background,
    },

    notificationBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },

    notificationLoading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 8,
    },

    notificationLoadingText: {
      color: colors.textSecondary,
      fontSize: 12,
    },

    notificationError: {
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 5,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.surface,
      alignItems: "center",
    },

    notificationErrorText: {
      color: colors.primary,
      fontSize: 12,
      textAlign: "center",
    },

    // STATUS

    statusContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      gap: 8,
    },

    statusText: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: "center",
    },

    // ERROR

    errorContainer: {
      marginHorizontal: 16,
      marginVertical: 10,
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.surface,
      alignItems: "center",
    },

    errorTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 6,
    },

    errorText: {
      color: colors.primary,
      fontSize: 13,
      textAlign: "center",
    },

    retryButton: {
      marginTop: 12,
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },

    // SEARCH

    searchWrap: {
      marginTop: 4,
    },

    // CATEGORIES

    cuisineTopSection: {
      backgroundColor: colors.background,
      marginTop: 4,
      paddingVertical: 5,
    },

    cuisineTopList: {
      paddingHorizontal: 2,
    },

    cuisineTopItem: {
      width: 115,
      alignItems: "center",
      justifyContent: "flex-start",
      marginRight: 5,
    },

    cuisineTopImage: {
      width: 110,
      height: 100,
      marginBottom: 3,
    },

    cuisineTopText: {
      width: 115,
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "500",
      textAlign: "center",
    },

    // FEATURED CATEGORIES

    featuredSection: {
      marginTop: 16,
      paddingVertical: 8,
    },

    featuredTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
      marginHorizontal: 16,
      marginBottom: 12,
    },

    featuredList: {
      paddingHorizontal: 16,
      gap: 12,
    },

    featuredItem: {
      width: 130,
      alignItems: "center",
    },

    featuredImage: {
      width: 125,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },

    featuredName: {
      marginTop: 8,
      width: 125,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },

    // PRODUCTS

    productsSection: {
      marginTop: 20,
      marginBottom: 12,
    },

    productsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 14,
    },

    productsHeadingText: {
      flex: 1,
    },

    productsTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
    },

    productsSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },

    viewAllText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
      paddingLeft: 10,
    },

    productsList: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 12,
    },

    productCard: {
      width: 165,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border || "#292929",
    },

    productImageContainer: {
      width: "100%",
      height: 130,
      backgroundColor: colors.card || "#202020",
      position: "relative",
    },

    productImage: {
      width: "100%",
      height: "100%",
    },

    productDiscount: {
      position: "absolute",
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },

    productDiscountText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },

    productImageIcon: {
      position: "absolute",
      right: 8,
      bottom: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    productDetails: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      minHeight: 88,
    },

    productName: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    },

    productCategory: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },

    productPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 8,
      gap: 6,
    },

    productPrice: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },

    productOldPrice: {
      color: colors.textSecondary,
      fontSize: 11,
      textDecorationLine: "line-through",
    },

    productStatus: {
      marginHorizontal: 16,
      paddingVertical: 20,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    // RESTAURANTS

    restaurantSection: {
      marginTop: 2,
    },

    // TABLE BOOKING

    bookingCard: {
      marginHorizontal: 16,
      height: 180,
      borderRadius: 22,
      overflow: "hidden",
      position: "relative",
    },

    bookingImage: {
      width: "100%",
      height: "100%",
      borderRadius: 22,
    },

    findTableButton: {
      position: "absolute",
      left: 20,
      bottom: 18,
      width: 145,
      height: 42,
      backgroundColor: "transparent",
      borderRadius: 22,
    },

    // BOTTOM SPACING

    bottomSpacing: {
      height: 40,
    },
  });

export default HomeScreen;
