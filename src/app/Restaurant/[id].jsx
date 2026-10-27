import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BASE_URL from "../../constants/AppUrls";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";

import { getProductById, getRestaurantById } from "../../utils/Function";

// =========================================================
// FALLBACK IMAGES
// =========================================================

const FALLBACK_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";

// =========================================================
// FALLBACK RESTAURANTS
// =========================================================

const restaurants = {
  1: {
    id: "1",
    name: "Spice House",
    image: FALLBACK_RESTAURANT_IMAGE,
    rating: "4.5",
    reviews: "120",
    time: "30-40 mins",
    price: "₹400 for two",
    cuisine: "South Indian, Biryani",
    address: "Hitech City, Hyderabad",
    phone: "",
    offer: "50% OFF",
    offerText: "50% off up to ₹100",
    offerCode: "BAKA50",
    menu: {
      Recommended: [
        {
          id: "1",
          name: "Chicken Biryani",
          description: "Authentic Hyderabadi chicken biryani",
          price: 249,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.5",
        },
        {
          id: "2",
          name: "Paneer Special",
          description: "Soft paneer cooked with special spices",
          price: 199,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.4",
        },
      ],
      Biryani: [
        {
          id: "3",
          name: "Chicken Biryani",
          description: "Traditional Hyderabadi chicken biryani",
          price: 249,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.5",
        },
        {
          id: "4",
          name: "Mutton Biryani",
          description: "Slow cooked mutton biryani",
          price: 299,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.6",
        },
      ],
      Starters: [
        {
          id: "5",
          name: "Chicken 65",
          description: "Crispy spicy chicken starter",
          price: 219,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.3",
        },
        {
          id: "6",
          name: "Paneer Tikka",
          description: "Grilled paneer with Indian spices",
          price: 189,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.4",
        },
      ],
    },
  },

  2: {
    id: "2",
    name: "Pizza Planet",
    image: FALLBACK_RESTAURANT_IMAGE,
    rating: "4.4",
    reviews: "98",
    time: "25-35 mins",
    price: "₹500 for two",
    cuisine: "Pizza, Italian",
    address: "Madhapur, Hyderabad",
    phone: "",
    offer: "30% OFF",
    offerText: "30% off up to ₹150",
    offerCode: "BAKA30",
    menu: {
      Recommended: [
        {
          id: "10",
          name: "Chicken Pizza",
          description: "Loaded chicken pizza",
          price: 299,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.5",
        },
      ],
    },
  },

  3: {
    id: "3",
    name: "Burger Mania",
    image: FALLBACK_RESTAURANT_IMAGE,
    rating: "4.3",
    reviews: "87",
    time: "20-30 mins",
    price: "₹350 for two",
    cuisine: "Burgers, Fast Food",
    address: "Kondapur, Hyderabad",
    phone: "",
    offer: "20% OFF",
    offerText: "20% off up to ₹100",
    offerCode: "BAKASURAN",
    menu: {
      Recommended: [
        {
          id: "20",
          name: "Chicken Burger",
          description: "Juicy chicken burger",
          price: 199,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.4",
        },
      ],
    },
  },

  4: {
    id: "4",
    name: "Crispy Bowl",
    image: FALLBACK_RESTAURANT_IMAGE,
    rating: "4.2",
    reviews: "72",
    time: "25-35 mins",
    price: "₹300 for two",
    cuisine: "Chinese, Fast Food",
    address: "Gachibowli, Hyderabad",
    phone: "",
    offer: "",
    offerText: "",
    offerCode: "",
    menu: {
      Recommended: [
        {
          id: "30",
          name: "Chicken Fried Rice",
          description: "Chinese style chicken fried rice",
          price: 189,
          image: FALLBACK_FOOD_IMAGE,
          rating: "4.3",
        },
      ],
    },
  },
};

// =========================================================
// HELPERS
// =========================================================

const isSuccessResponse = (response) => {
  if (!response) {
    return false;
  }

  if (response.success === undefined) {
    return true;
  }

  return [1, true, "1"].includes(response.success);
};

const getFirstValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

// =========================================================
// IMAGE HELPER
// =========================================================

const getImageSource = (image) => {
  if (!image) {
    return {
      uri: FALLBACK_RESTAURANT_IMAGE,
    };
  }

  if (typeof image === "object") {
    if (image.uri) {
      return image;
    }

    if (image.url) {
      image = image.url;
    }
  }

  if (typeof image !== "string") {
    return {
      uri: FALLBACK_RESTAURANT_IMAGE,
    };
  }

  const cleanImage = image.trim();

  if (!cleanImage) {
    return {
      uri: FALLBACK_RESTAURANT_IMAGE,
    };
  }

  if (/^https?:\/\//i.test(cleanImage)) {
    return {
      uri: cleanImage,
    };
  }

  return {
    uri: `${BASE_URL}/${cleanImage.replace(/^\/+/, "")}`,
  };
};

// =========================================================
// FOOD IMAGE
// =========================================================

const getFoodImage = (item) => {
  const image = getFirstValue(
    item?.image_url,
    item?.product_image_url,
    item?.thumbnail_url,
    item?.thumbnail,
    item?.image,
    item?.product_image,
    item?.product?.image_url,
    item?.product?.image,
    item?.images?.[0]?.image_url,
    item?.images?.[0]?.url,
    item?.images?.[0]?.image,
  );

  if (!image) {
    return {
      uri: FALLBACK_FOOD_IMAGE,
    };
  }

  if (typeof image === "string" && /^https?:\/\//i.test(image.trim())) {
    return {
      uri: image.trim(),
    };
  }

  if (typeof image === "string" && image.trim()) {
    return {
      uri: `${BASE_URL}/${image.trim().replace(/^\/+/, "")}`,
    };
  }

  return {
    uri: FALLBACK_FOOD_IMAGE,
  };
};

// =========================================================
// NORMALIZE FOOD
// =========================================================

const normalizeFoodItem = (item, index = 0) => {
  const product = item?.product || item;

  return {
    id: String(
      getFirstValue(
        product?.id,
        product?.product_id,
        item?.id,
        item?.product_id,
        index + 1,
      ),
    ),

    name:
      getFirstValue(
        product?.name,
        product?.product_name,
        item?.name,
        item?.product_name,
      ) || "Food Item",

    description:
      getFirstValue(
        product?.description,
        item?.description,
        product?.short_description,
        item?.short_description,
      ) || "Delicious food prepared fresh.",

    price: Number(
      getFirstValue(
        product?.price,
        product?.selling_price,
        product?.final_price,
        item?.price,
        item?.selling_price,
        item?.final_price,
        0,
      ),
    ),

    image: getFoodImage(product),

    rating:
      getFirstValue(
        product?.rating,
        product?.avg_rating,
        product?.average_rating,
        item?.rating,
        item?.avg_rating,
      ) || "4.5",
  };
};

// =========================================================
// NORMALIZE MENU
// =========================================================

const normalizeMenu = (restaurantData, fallbackMenu = {}) => {
  const menuSource =
    restaurantData?.menu ||
    restaurantData?.menus ||
    restaurantData?.menu_items ||
    restaurantData?.menuItems ||
    restaurantData?.products ||
    restaurantData?.items;

  if (
    menuSource &&
    typeof menuSource === "object" &&
    !Array.isArray(menuSource)
  ) {
    const result = {};

    Object.keys(menuSource).forEach((categoryName) => {
      const categoryItems = menuSource[categoryName];

      if (Array.isArray(categoryItems)) {
        result[categoryName] = categoryItems.map((item, index) =>
          normalizeFoodItem(item, index),
        );
      }
    });

    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  if (Array.isArray(menuSource)) {
    const result = {};

    menuSource.forEach((item, index) => {
      const categoryName =
        getFirstValue(
          item?.category_name,
          item?.categoryName,
          item?.category?.name,
          typeof item?.category === "string" ? item.category : "",
          item?.menu_category,
          item?.type,
        ) || "Recommended";

      if (!result[categoryName]) {
        result[categoryName] = [];
      }

      result[categoryName].push(normalizeFoodItem(item, index));
    });

    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  if (Array.isArray(restaurantData?.products)) {
    return {
      Recommended: restaurantData.products.map((item, index) =>
        normalizeFoodItem(item, index),
      ),
    };
  }

  return fallbackMenu || {};
};

// =========================================================
// COMPONENT
// =========================================================

export default function RestaurantDetails() {
  const { colors, isDark } = useTheme();

  const params = useLocalSearchParams();

  const restaurantId = String(params?.restaurantId || params?.id || "");

  const fallbackRestaurant = restaurants[restaurantId] || null;

  // =======================================================
  // RESTAURANT STATE
  // =======================================================

  const [restaurant, setRestaurant] = useState(fallbackRestaurant);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [apiError, setApiError] = useState("");

  const [favorite, setFavorite] = useState(false);

  const [quantities, setQuantities] = useState({});

  // =======================================================
  // PRODUCT STATE
  // =======================================================

  const [productLoading, setProductLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const [productModalVisible, setProductModalVisible] = useState(false);

  // =======================================================
  // LOAD RESTAURANT
  // =======================================================

  const loadRestaurant = useCallback(
    async (isRefresh = false) => {
      if (!restaurantId) {
        setLoading(false);
        setApiError("Restaurant ID is missing.");
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setApiError("");

        console.log("Loading restaurant:", restaurantId);

        const response = await getRestaurantById(restaurantId);

        console.log("RESTAURANT RESPONSE:", JSON.stringify(response, null, 2));

        if (!isSuccessResponse(response)) {
          throw new Error(
            response?.message ||
              response?.error ||
              "Unable to load restaurant.",
          );
        }

        const apiRestaurant =
          response?.data?.restaurant ||
          response?.data?.data ||
          response?.data ||
          response?.restaurant ||
          response;

        if (!apiRestaurant || typeof apiRestaurant !== "object") {
          throw new Error("Invalid restaurant data received.");
        }

        const mergedRestaurant = {
          ...(fallbackRestaurant || {}),
          ...apiRestaurant,

          id: String(
            getFirstValue(
              apiRestaurant?.id,
              apiRestaurant?.restaurant_id,
              restaurantId,
            ),
          ),

          name:
            getFirstValue(
              apiRestaurant?.name,
              apiRestaurant?.restaurant_name,
              apiRestaurant?.title,
              fallbackRestaurant?.name,
            ) || "Restaurant",

          image:
            getFirstValue(
              apiRestaurant?.image_url,
              apiRestaurant?.restaurant_image_url,
              apiRestaurant?.image,
              apiRestaurant?.thumbnail,
              apiRestaurant?.logo,
              apiRestaurant?.restaurant_image,
              fallbackRestaurant?.image,
            ) || FALLBACK_RESTAURANT_IMAGE,

          rating:
            getFirstValue(
              apiRestaurant?.rating,
              apiRestaurant?.avg_rating,
              apiRestaurant?.average_rating,
              fallbackRestaurant?.rating,
            ) || "4.5",

          reviews:
            getFirstValue(
              apiRestaurant?.reviews,
              apiRestaurant?.review_count,
              apiRestaurant?.reviews_count,
              apiRestaurant?.ratings_count,
              fallbackRestaurant?.reviews,
            ) || "0",

          time:
            getFirstValue(
              apiRestaurant?.delivery_time,
              apiRestaurant?.deliveryTime,
              apiRestaurant?.time,
              apiRestaurant?.estimated_time,
              fallbackRestaurant?.time,
            ) || "30-40 mins",

          price:
            getFirstValue(
              apiRestaurant?.price,
              apiRestaurant?.price_for_two,
              apiRestaurant?.cost_for_two,
              apiRestaurant?.average_cost,
              fallbackRestaurant?.price,
            ) || "₹200 for two",

          cuisine:
            getFirstValue(
              apiRestaurant?.cuisine,
              apiRestaurant?.cuisine_name,
              apiRestaurant?.category_name,
              apiRestaurant?.food_type,
              fallbackRestaurant?.cuisine,
            ) || "Multi Cuisine",

          address:
            getFirstValue(
              apiRestaurant?.address,
              apiRestaurant?.location,
              apiRestaurant?.full_address,
              apiRestaurant?.area,
              apiRestaurant?.city,
              fallbackRestaurant?.address,
            ) || "Location unavailable",

          phone:
            getFirstValue(
              apiRestaurant?.phone,
              apiRestaurant?.mobile,
              apiRestaurant?.mobile_number,
              apiRestaurant?.contact_number,
              apiRestaurant?.phone_number,
              fallbackRestaurant?.phone,
            ) || "",

          offer:
            getFirstValue(
              apiRestaurant?.offer,
              apiRestaurant?.offer_title,
              apiRestaurant?.offer_percentage,
              fallbackRestaurant?.offer,
            ) || "",

          offerText:
            getFirstValue(
              apiRestaurant?.offerText,
              apiRestaurant?.offer_text,
              apiRestaurant?.offer_description,
              fallbackRestaurant?.offerText,
            ) || "",

          offerCode:
            getFirstValue(
              apiRestaurant?.offerCode,
              apiRestaurant?.offer_code,
              apiRestaurant?.coupon_code,
              fallbackRestaurant?.offerCode,
            ) || "",
        };

        mergedRestaurant.menu = normalizeMenu(
          apiRestaurant,
          fallbackRestaurant?.menu || {},
        );

        setRestaurant(mergedRestaurant);
      } catch (error) {
        console.log("RESTAURANT ERROR:", error?.message);

        setApiError(error?.message || "Unable to load restaurant.");

        if (fallbackRestaurant) {
          setRestaurant(fallbackRestaurant);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [restaurantId, fallbackRestaurant],
  );

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  // =======================================================
  // GET PRODUCT BY ID
  // =======================================================

  const loadProductById = useCallback(async (productId, menuItem = null) => {
    if (
      productId === undefined ||
      productId === null ||
      String(productId).trim() === ""
    ) {
      Alert.alert("Product", "Product ID is not available.");

      return;
    }

    try {
      setProductLoading(true);

      setSelectedMenuItem(menuItem);
      setSelectedProduct(null);

      console.log("====================================");
      console.log("CALLING PRODUCT API");
      console.log("METHOD: GET");
      console.log("PRODUCT ID:", productId);
      console.log("====================================");

      const response = await getProductById(productId);

      console.log("PRODUCT RESPONSE:", JSON.stringify(response, null, 2));

      if (!isSuccessResponse(response)) {
        throw new Error(
          response?.message ||
            response?.error ||
            "Unable to load product details.",
        );
      }

      const productData =
        response?.data?.product ||
        response?.data?.data ||
        response?.data ||
        response?.product ||
        response;

      if (!productData || typeof productData !== "object") {
        throw new Error("Invalid product data received.");
      }

      console.log("FINAL PRODUCT:", JSON.stringify(productData, null, 2));

      setSelectedProduct(productData);

      setProductModalVisible(true);
    } catch (error) {
      console.log("PRODUCT ERROR:", error?.message);

      Alert.alert(
        "Product",
        error?.message || "Unable to load product details.",
      );
    } finally {
      setProductLoading(false);
    }
  }, []);

  // =======================================================
  // OPEN PRODUCT
  // =======================================================

  const openProduct = useCallback(
    (item) => {
      const productId = getFirstValue(
        item?.id,
        item?.product_id,
        item?.productId,
        item?.product?.id,
      );

      if (!productId) {
        Alert.alert("Product", "Product ID is not available.");
        return;
      }

      router.push({
        pathname: "/Food-Details",
        params: {
          itemId: String(productId),
          restaurantId: String(restaurantId),
        },
      });
    },
    [restaurantId],
  );

  // =======================================================
  // RESTAURANT IMAGE
  // =======================================================

  const restaurantImage = useMemo(() => {
    return getImageSource(
      restaurant?.image ||
        restaurant?.image_url ||
        restaurant?.restaurant_image,
    );
  }, [restaurant]);

  // =======================================================
  // MENU
  // =======================================================

  const menuCategories = useMemo(() => {
    if (!restaurant?.menu) {
      return [];
    }

    return Object.entries(restaurant.menu).filter(
      ([, items]) => Array.isArray(items) && items.length > 0,
    );
  }, [restaurant]);

  // =======================================================
  // QUANTITY
  // =======================================================

  const increaseQuantity = useCallback((itemId) => {
    const id = String(itemId);

    setQuantities((previous) => ({
      ...previous,
      [id]: (previous[id] || 0) + 1,
    }));
  }, []);

  const decreaseQuantity = useCallback((itemId) => {
    const id = String(itemId);

    setQuantities((previous) => {
      const current = previous[id] || 0;

      if (current <= 1) {
        const updated = {
          ...previous,
        };

        delete updated[id];

        return updated;
      }

      return {
        ...previous,
        [id]: current - 1,
      };
    });
  }, []);

  // =======================================================
  // TOTAL ITEMS
  // =======================================================

  const totalItems = useMemo(() => {
    return Object.values(quantities).reduce(
      (sum, quantity) => sum + Number(quantity || 0),
      0,
    );
  }, [quantities]);

  // =======================================================
  // TOTAL PRICE
  // =======================================================

  const totalPrice = useMemo(() => {
    let total = 0;

    menuCategories.forEach(([, items]) => {
      items.forEach((item) => {
        const quantity = quantities[String(item.id)] || 0;

        total += Number(item.price || 0) * Number(quantity);
      });
    });

    return total;
  }, [menuCategories, quantities]);

  // =======================================================
  // CALL RESTAURANT
  // =======================================================

  const callRestaurant = async () => {
    const phone = restaurant?.phone;

    if (!phone) {
      Alert.alert(
        "Phone number unavailable",
        "This restaurant has not provided a phone number.",
      );

      return;
    }

    try {
      const url = `tel:${phone}`;

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Unable to call",
          "Calling is not available on this device.",
        );
      }
    } catch {
      Alert.alert("Error", "Unable to open the phone dialer.");
    }
  };

  // =======================================================
  // OFFER
  // =======================================================

  const showOffer = () => {
    if (!restaurant?.offerCode) {
      return;
    }

    Alert.alert(
      "Offer Available",
      `${
        restaurant.offerText || restaurant.offer || ""
      }\n\nCoupon: ${restaurant.offerCode}`,
    );
  };

  // =======================================================
  // CART
  // =======================================================

  const goToCart = () => {
    if (totalItems <= 0) {
      Alert.alert("Your cart is empty", "Please add at least one item.");

      return;
    }

    router.push({
      pathname: "/CartScreen",
      params: {
        restaurantId,
      },
    });
  };

  // =======================================================
  // CLOSE PRODUCT MODAL
  // =======================================================

  const closeProductModal = () => {
    setProductModalVisible(false);
    setSelectedProduct(null);
    setSelectedMenuItem(null);
  };

  // =======================================================
  // PRODUCT DATA
  // =======================================================

  const selectedProductImage = getFoodImage(
    selectedProduct || selectedMenuItem,
  );

  const selectedProductName =
    getFirstValue(
      selectedProduct?.name,
      selectedProduct?.product_name,
      selectedProduct?.title,
      selectedProduct?.product?.name,
      selectedMenuItem?.name,
    ) || "Product";

  const selectedProductDescription =
    getFirstValue(
      selectedProduct?.description,
      selectedProduct?.short_description,
      selectedProduct?.product?.description,
      selectedMenuItem?.description,
    ) || "Delicious food prepared fresh.";

  const selectedProductPrice = Number(
    getFirstValue(
      selectedProduct?.price,
      selectedProduct?.selling_price,
      selectedProduct?.final_price,
      selectedProduct?.product?.price,
      selectedMenuItem?.price,
      0,
    ),
  );

  const selectedProductId = getFirstValue(
    selectedProduct?.id,
    selectedProduct?.product_id,
    selectedMenuItem?.id,
    selectedMenuItem?.product_id,
  );

  // =======================================================
  // LOADING
  // =======================================================

  if (loading && !restaurant) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#F9080C"} />

          <Text
            style={[
              styles.loadingText,
              {
                color: colors.text,
              },
            ]}
          >
            Loading restaurant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // NO RESTAURANT
  // =======================================================

  if (!restaurant) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.emptyContainer}>
          <Ionicons
            name="restaurant-outline"
            size={60}
            color={colors.textSecondary || "#8F8F8F"}
          />

          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Restaurant not found
          </Text>

          <Text
            style={[
              styles.emptyMessage,
              {
                color: colors.textSecondary || "#8F8F8F",
              },
            ]}
          >
            Unable to find restaurant details.
          </Text>

          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor: colors.primary || "#F9080C",
              },
            ]}
            onPress={() => loadRestaurant()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =======================================================
  // MAIN UI
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
      {/* ===================================================
          HEADER
      =================================================== */}

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,

            borderBottomColor: colors.divider || colors.border || "#2A2A2A",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          style={[
            styles.headerTitle,
            {
              color: colors.text,

              fontFamily: Fonts?.bold || undefined,
            },
          ]}
        >
          {restaurant.name}
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setFavorite((previous) => !previous)}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={24}
            color={favorite ? "#F9080C" : colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRestaurant(true)}
            tintColor={colors.primary || "#F9080C"}
          />
        }
        contentContainerStyle={{
          paddingBottom: totalItems > 0 ? 110 : 30,
        }}
      >
        {/* ERROR */}

        {apiError ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: isDark ? "#2A1515" : "#FFF0F0",
              },
            ]}
          >
            <Ionicons name="warning-outline" size={20} color="#F9080C" />

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.errorTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Couldn't refresh restaurant
              </Text>

              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                {apiError}
              </Text>
            </View>

            <TouchableOpacity onPress={() => loadRestaurant()}>
              <Text
                style={[
                  styles.retrySmall,
                  {
                    color: colors.primary || "#F9080C",
                  },
                ]}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* HERO */}

        <View style={styles.heroContainer}>
          <Image
            source={restaurantImage}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.imageOverlay} />

          {restaurant.offer ? (
            <TouchableOpacity style={styles.offerBadge} onPress={showOffer}>
              <Ionicons name="pricetag" size={15} color="#FFFFFF" />

              <Text style={styles.offerBadgeText}>{restaurant.offer}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* RESTAURANT INFO */}

        <View
          style={[
            styles.restaurantInfo,
            {
              backgroundColor: colors.card || colors.surface || "#202020",
            },
          ]}
        >
          <Text
            style={[
              styles.restaurantName,
              {
                color: colors.text,

                fontFamily: Fonts?.bold || undefined,
              },
            ]}
          >
            {restaurant.name}
          </Text>

          <Text
            style={[
              styles.cuisine,
              {
                color: colors.textSecondary || "#8F8F8F",
              },
            ]}
          >
            {restaurant.cuisine}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={13} color="#FFFFFF" />

                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>

              <Text
                style={[
                  styles.infoText,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                {restaurant.reviews} reviews
              </Text>
            </View>

            <View style={styles.dot} />

            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={17}
                color={colors.textSecondary || "#8F8F8F"}
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                {restaurant.time}
              </Text>
            </View>

            <View style={styles.dot} />

            <View style={styles.infoItem}>
              <Ionicons
                name="wallet-outline"
                size={17}
                color={colors.textSecondary || "#8F8F8F"}
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                {restaurant.price}
              </Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons
              name="location-outline"
              size={19}
              color={colors.primary || "#F9080C"}
            />

            <Text
              style={[
                styles.addressText,
                {
                  color: colors.textSecondary || "#8F8F8F",
                },
              ]}
            >
              {restaurant.address}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderColor: colors.border || "#333333",
                },
              ]}
              onPress={callRestaurant}
            >
              <Ionicons
                name="call-outline"
                size={18}
                color={colors.primary || "#F9080C"}
              />

              <Text
                style={[
                  styles.actionText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Call
              </Text>
            </TouchableOpacity>

            {restaurant.offerCode ? (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    borderColor: colors.border || "#333333",
                  },
                ]}
                onPress={showOffer}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={colors.primary || "#F9080C"}
                />

                <Text
                  style={[
                    styles.actionText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Offers
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* OFFER */}

        {restaurant.offerCode ? (
          <TouchableOpacity
            style={[
              styles.offerCard,
              {
                backgroundColor: isDark ? "#261B0B" : "#FFF7E6",
              },
            ]}
            onPress={showOffer}
          >
            <View style={styles.offerIcon}>
              <Ionicons name="pricetag" size={21} color="#F5B51B" />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.offerTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {restaurant.offer || "Special Offer"}
              </Text>

              <Text
                style={[
                  styles.offerDescription,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                {restaurant.offerText || "Special offer available."}
              </Text>

              <Text
                style={[
                  styles.offerCode,
                  {
                    color: colors.primary || "#F9080C",
                  },
                ]}
              >
                CODE: {restaurant.offerCode}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* MENU HEADER */}

        <View style={styles.menuHeader}>
          <Text
            style={[
              styles.menuTitle,
              {
                color: colors.text,

                fontFamily: Fonts?.bold || undefined,
              },
            ]}
          >
            Menu
          </Text>

          <Text
            style={[
              styles.menuCount,
              {
                color: colors.textSecondary || "#8F8F8F",
              },
            ]}
          >
            {menuCategories.reduce(
              (total, [, items]) => total + items.length,
              0,
            )}{" "}
            items
          </Text>
        </View>

        {/* MENU */}

        {menuCategories.length > 0 ? (
          menuCategories.map(([categoryName, items]) => (
            <View key={categoryName} style={styles.categoryContainer}>
              <Text
                style={[
                  styles.categoryTitle,
                  {
                    color: colors.text,

                    fontFamily: Fonts?.bold || undefined,
                  },
                ]}
              >
                {categoryName}
              </Text>

              {items.map((item) => {
                const itemId = String(item.id);

                const quantity = quantities[itemId] || 0;

                return (
                  <TouchableOpacity
                    key={itemId}
                    activeOpacity={0.9}
                    onPress={() => openProduct(item)}
                  >
                    <View
                      style={[
                        styles.foodCard,
                        {
                          backgroundColor:
                            colors.card || colors.surface || "#202020",

                          borderColor: colors.border || "#2A2A2A",
                        },
                      ]}
                    >
                      <View style={styles.foodDetails}>
                        <Text
                          style={[
                            styles.foodName,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>

                        <Text
                          style={[
                            styles.foodPrice,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          ₹{Number(item.price || 0).toFixed(0)}
                        </Text>

                        <View style={styles.foodRating}>
                          <Ionicons name="star" size={12} color="#F5B51B" />

                          <Text
                            style={[
                              styles.foodRatingText,
                              {
                                color: colors.textSecondary || "#8F8F8F",
                              },
                            ]}
                          >
                            {item.rating}
                          </Text>
                        </View>

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.foodDescription,
                            {
                              color: colors.textSecondary || "#8F8F8F",
                            },
                          ]}
                        >
                          {item.description}
                        </Text>
                      </View>

                      <View style={styles.foodImageContainer}>
                        <Image
                          source={getImageSource(item.image)}
                          style={styles.foodImage}
                          resizeMode="cover"
                        />

                        {quantity === 0 ? (
                          <TouchableOpacity
                            style={[
                              styles.addButton,
                              {
                                backgroundColor: colors.background || "#050505",

                                borderColor: colors.primary || "#F9080C",
                              },
                            ]}
                            onPress={(event) => {
                              event?.stopPropagation?.();

                              increaseQuantity(itemId);
                            }}
                          >
                            <Text
                              style={[
                                styles.addButtonText,
                                {
                                  color: colors.primary || "#F9080C",
                                },
                              ]}
                            >
                              ADD
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View
                            style={[
                              styles.quantityContainer,
                              {
                                backgroundColor: colors.primary || "#F9080C",
                              },
                            ]}
                          >
                            <TouchableOpacity
                              onPress={() => decreaseQuantity(itemId)}
                              style={styles.quantityButton}
                            >
                              <Ionicons
                                name="remove"
                                size={17}
                                color="#FFFFFF"
                              />
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>{quantity}</Text>

                            <TouchableOpacity
                              onPress={() => increaseQuantity(itemId)}
                              style={styles.quantityButton}
                            >
                              <Ionicons name="add" size={17} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        ) : (
          <View
            style={[
              styles.noMenuContainer,
              {
                backgroundColor: colors.card || colors.surface || "#202020",
              },
            ]}
          >
            <Ionicons
              name="restaurant-outline"
              size={45}
              color={colors.textSecondary || "#8F8F8F"}
            />

            <Text
              style={[
                styles.noMenuTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Menu unavailable
            </Text>

            <Text
              style={[
                styles.noMenuText,
                {
                  color: colors.textSecondary || "#8F8F8F",
                },
              ]}
            >
              No menu items are available for this restaurant.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ===================================================
          CART BAR
      =================================================== */}

      {totalItems > 0 ? (
        <View
          style={[
            styles.cartBar,
            {
              backgroundColor: colors.card || colors.surface || "#202020",

              borderTopColor: colors.border || "#2A2A2A",
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.cartItems,
                {
                  color: colors.textSecondary || "#8F8F8F",
                },
              ]}
            >
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Text>

            <Text
              style={[
                styles.cartTotal,
                {
                  color: colors.text,
                },
              ]}
            >
              ₹{totalPrice.toFixed(0)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.viewCartButton,
              {
                backgroundColor: colors.primary || "#F9080C",
              },
            ]}
            onPress={goToCart}
          >
            <Text style={styles.viewCartText}>View Cart</Text>

            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ===================================================
          PRODUCT DETAILS MODAL
          
          IMPORTANT:
          productLoading is NOT rendered here.
          The modal opens only after the GET API succeeds.
      =================================================== */}

      <Modal
        visible={productModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeProductModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.productModal,
              {
                backgroundColor: colors.card || colors.surface || "#202020",
              },
            ]}
          >
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Product Details
              </Text>

              <TouchableOpacity onPress={closeProductModal} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={colors.textSecondary || "#8F8F8F"}
                />
              </TouchableOpacity>
            </View>

            {/* PRODUCT CONTENT */}

            {selectedProduct ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
              >
                <Image
                  source={selectedProductImage}
                  style={styles.productModalImage}
                  resizeMode="cover"
                />

                <Text
                  style={[
                    styles.productModalName,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {selectedProductName}
                </Text>

                <View style={styles.productModalRating}>
                  <Ionicons name="star" size={16} color="#F5B51B" />

                  <Text
                    style={[
                      styles.productModalRatingText,
                      {
                        color: colors.textSecondary || "#8F8F8F",
                      },
                    ]}
                  >
                    {getFirstValue(
                      selectedProduct?.rating,
                      selectedProduct?.avg_rating,
                      selectedProduct?.average_rating,
                      selectedMenuItem?.rating,
                      "4.5",
                    )}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.productModalPrice,
                    {
                      color: colors.primary || "#F9080C",
                    },
                  ]}
                >
                  ₹{selectedProductPrice.toFixed(0)}
                </Text>

                <Text
                  style={[
                    styles.productModalDescription,
                    {
                      color: colors.textSecondary || "#8F8F8F",
                    },
                  ]}
                >
                  {selectedProductDescription}
                </Text>

                {/* CATEGORY */}

                {getFirstValue(
                  selectedProduct?.category?.name,
                  selectedProduct?.category_name,
                  typeof selectedProduct?.category === "string"
                    ? selectedProduct.category
                    : "",
                ) ? (
                  <View style={styles.productInfoRow}>
                    <Ionicons
                      name="restaurant-outline"
                      size={18}
                      color={colors.primary || "#F9080C"}
                    />

                    <Text
                      style={[
                        styles.productInfoText,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {getFirstValue(
                        selectedProduct?.category?.name,
                        selectedProduct?.category_name,
                        typeof selectedProduct?.category === "string"
                          ? selectedProduct.category
                          : "",
                      )}
                    </Text>
                  </View>
                ) : null}

                {/* PRODUCT ID */}

                {selectedProductId ? (
                  <View style={styles.productInfoRow}>
                    <Ionicons
                      name="barcode-outline"
                      size={18}
                      color={colors.primary || "#F9080C"}
                    />

                    <Text
                      style={[
                        styles.productInfoText,
                        {
                          color: colors.textSecondary || "#8F8F8F",
                        },
                      ]}
                    >
                      Product ID: {selectedProductId}
                    </Text>
                  </View>
                ) : null}

                {/* ADD TO CART */}

                <TouchableOpacity
                  style={[
                    styles.modalAddButton,
                    {
                      backgroundColor: colors.primary || "#F9080C",
                    },
                  ]}
                  onPress={() => {
                    if (
                      selectedProductId === undefined ||
                      selectedProductId === null ||
                      selectedProductId === ""
                    ) {
                      Alert.alert("Cart", "Product ID is missing.");

                      return;
                    }

                    /*
                     * Use the menu item ID first.
                     * This keeps the quantity/cart total
                     * connected to the menu item that
                     * the user clicked.
                     */
                    const cartItemId =
                      selectedMenuItem?.id ||
                      selectedMenuItem?.product_id ||
                      selectedProductId;

                    increaseQuantity(String(cartItemId));

                    closeProductModal();
                  }}
                >
                  <Ionicons name="cart-outline" size={20} color="#FFFFFF" />

                  <Text style={styles.modalAddButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.productEmpty}>
                <Ionicons
                  name="fast-food-outline"
                  size={50}
                  color={colors.textSecondary || "#8F8F8F"}
                />

                <Text
                  style={[
                    styles.productEmptyText,
                    {
                      color: colors.textSecondary || "#8F8F8F",
                    },
                  ]}
                >
                  Product details unavailable.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ===================================================
          PRODUCT API LOADING OVERLAY

          ONLY ONE LOADING OVERLAY
      =================================================== */}

      {productLoading && (
        <View style={styles.productLoadingOverlay}>
          <View
            style={[
              styles.productLoadingBox,
              {
                backgroundColor: colors.card || colors.surface || "#202020",
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={colors.primary || "#F9080C"}
            />

            <Text
              style={[
                styles.productLoadingOverlayText,
                {
                  color: colors.text,
                },
              ]}
            >
              Loading product...
            </Text>
          </View>
        </View>
      )}
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

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 8,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 15,
  },

  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  errorBox: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  errorText: {
    fontSize: 12,
    marginTop: 3,
  },

  retrySmall: {
    fontSize: 13,
    fontWeight: "700",
  },

  heroContainer: {
    height: 230,
    width: "100%",
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  offerBadge: {
    position: "absolute",
    bottom: 15,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9080C",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  offerBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  restaurantInfo: {
    margin: 12,
    padding: 16,
    borderRadius: 16,
  },

  restaurantName: {
    fontSize: 24,
  },

  cuisine: {
    marginTop: 5,
    fontSize: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
    gap: 8,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    gap: 3,
    backgroundColor: "#15803D",
  },

  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  infoText: {
    fontSize: 12,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#777777",
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 15,
    gap: 8,
  },

  addressText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  offerCard: {
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  offerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(245,181,27,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  offerTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  offerDescription: {
    fontSize: 12,
    marginTop: 3,
  },

  offerCode: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 8,
  },

  menuTitle: {
    fontSize: 23,
  },

  menuCount: {
    fontSize: 13,
  },

  categoryContainer: {
    marginTop: 7,
  },

  categoryTitle: {
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  foodCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 145,
  },

  foodDetails: {
    flex: 1,
    paddingRight: 12,
  },

  foodName: {
    fontSize: 16,
    fontWeight: "700",
  },

  foodPrice: {
    marginTop: 7,
    fontSize: 15,
    fontWeight: "700",
  },

  foodRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 4,
  },

  foodRatingText: {
    fontSize: 11,
  },

  foodDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },

  foodImageContainer: {
    width: 125,
    height: 125,
    position: "relative",
  },

  foodImage: {
    width: 125,
    height: 105,
    borderRadius: 12,
  },

  addButton: {
    position: "absolute",
    bottom: 0,
    left: 18,
    right: 18,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: "900",
  },

  quantityContainer: {
    position: "absolute",
    bottom: 0,
    left: 4,
    right: 4,
    height: 38,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  quantityButton: {
    width: 35,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  noMenuContainer: {
    margin: 12,
    minHeight: 180,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  noMenuTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 10,
  },

  noMenuText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },

  cartBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 78,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cartItems: {
    fontSize: 12,
  },

  cartTotal: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  viewCartButton: {
    minWidth: 145,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  viewCartText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  // =======================================================
  // PRODUCT MODAL
  // =======================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },

  productModal: {
    width: "100%",
    maxHeight: "85%",
    minHeight: 300,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  productModalImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },

  productModalName: {
    fontSize: 23,
    fontWeight: "800",
    marginTop: 16,
  },

  productModalRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },

  productModalRatingText: {
    fontSize: 13,
  },

  productModalPrice: {
    fontSize: 21,
    fontWeight: "800",
    marginTop: 12,
  },

  productModalDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  productInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },

  productInfoText: {
    flex: 1,
    fontSize: 13,
  },

  modalAddButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 22,
    marginBottom: 20,
  },

  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  productEmpty: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },

  productEmptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },

  // =======================================================
  // PRODUCT API LOADING
  // =======================================================

  productLoadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  productLoadingBox: {
    minWidth: 180,
    paddingHorizontal: 25,
    paddingVertical: 22,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  productLoadingOverlayText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
