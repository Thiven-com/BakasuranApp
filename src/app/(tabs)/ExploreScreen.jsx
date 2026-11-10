import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BASE_URL } from "../../constants/AppUrls";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";

import {
  getCategoryRestaurants,
  getProductsByCategoryAndRestaurant,
  getRestaurantCategories,
  getRestaurants,
} from "../../utils/Function";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL = String(BASE_URL || "").replace(/\/+$/, "");

// ============================================================
// FALLBACK CATEGORY IMAGES
// ============================================================

const FALLBACK_CATEGORY_IMAGES = {
  all: require("../../../assets/images/all.png"),
  dosa: require("../../../assets/images/dosa.png"),
  "south indian": require("../../../assets/images/south_indian.png"),
  "south-indian": require("../../../assets/images/south_indian.png"),
  biryani: require("../../../assets/images/biryani.png"),
  idli: require("../../../assets/images/idli.png"),
  pizza: require("../../../assets/images/pizza.png"),
  burgers: require("../../../assets/images/burgers.png"),
  burger: require("../../../assets/images/burgers.png"),
  chinese: require("../../../assets/images/chinese.png"),
  chicken: require("../../../assets/images/fried_chicken.jpg"),
  "fried chicken": require("../../../assets/images/fried_chicken.jpg"),
  desserts: require("../../../assets/images/desserts.png"),
  dessert: require("../../../assets/images/desserts.png"),
  drinks: require("../../../assets/images/drinks.png"),
  drink: require("../../../assets/images/drinks.png"),
};

// ============================================================
// DEFAULT CATEGORIES
// ============================================================

const DEFAULT_CATEGORIES = [
  {
    id: "all",
    name: "All",
    image: FALLBACK_CATEGORY_IMAGES.all,
  },
  {
    id: "1",
    name: "Dosa",
    image: FALLBACK_CATEGORY_IMAGES.dosa,
  },
  {
    id: "2",
    name: "South Indian",
    image: FALLBACK_CATEGORY_IMAGES["south indian"],
  },
  {
    id: "3",
    name: "Biryani",
    image: FALLBACK_CATEGORY_IMAGES.biryani,
  },
  {
    id: "4",
    name: "Idli",
    image: FALLBACK_CATEGORY_IMAGES.idli,
  },
  {
    id: "5",
    name: "Pizza",
    image: FALLBACK_CATEGORY_IMAGES.pizza,
  },
  {
    id: "6",
    name: "Burgers",
    image: FALLBACK_CATEGORY_IMAGES.burgers,
  },
  {
    id: "7",
    name: "Chinese",
    image: FALLBACK_CATEGORY_IMAGES.chinese,
  },
  {
    id: "8",
    name: "Chicken",
    image: FALLBACK_CATEGORY_IMAGES.chicken,
  },
  {
    id: "9",
    name: "Desserts",
    image: FALLBACK_CATEGORY_IMAGES.desserts,
  },
  {
    id: "10",
    name: "Drinks",
    image: FALLBACK_CATEGORY_IMAGES.drinks,
  },
];

// ============================================================
// HELPERS
// ============================================================

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

const isAll = (value) => normalize(value) === "all";

const getFirstMinutes = (time) => {
  const match = String(time ?? "").match(/\d+/);
  return match ? Number(match[0]) : 999;
};

const getPrice = (price) => {
  const match = String(price ?? "")
    .replace(/,/g, "")
    .match(/\d+/);

  return match ? Number(match[0]) : 0;
};

const isTruthy = (value) => {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    normalize(value) === "true" ||
    normalize(value) === "yes"
  );
};

// ============================================================
// IMAGE URL
// ============================================================

const getImageSource = (imageValue, fallback = null) => {
  if (!imageValue) {
    return fallback;
  }

  if (typeof imageValue === "object" && imageValue?.uri) {
    return imageValue;
  }

  if (typeof imageValue !== "string") {
    return fallback;
  }

  const cleanValue = imageValue.trim();

  if (!cleanValue) {
    return fallback;
  }

  if (/^https?:\/\//i.test(cleanValue)) {
    return {
      uri: cleanValue,
    };
  }

  if (!API_BASE_URL) {
    return fallback;
  }

  return {
    uri: `${API_BASE_URL}/${cleanValue.replace(/^\/+/, "")}`,
  };
};

// ============================================================
// EXTRACT ARRAY
// ============================================================

const extractArray = (response) => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  const possibleArrays = [
    response?.data,
    response?.data?.data,
    response?.data?.items,
    response?.data?.restaurants,
    response?.data?.products,
    response?.restaurants,
    response?.products,
    response?.items,
    response?.result,
    response?.data?.result,
    response?.menu,
    response?.menus,
    response?.menu_items,
    response?.menuItems,
    response?.data?.menu,
    response?.data?.menus,
    response?.data?.menu_items,
    response?.data?.menuItems,
    response?.data?.data?.menu,
    response?.data?.data?.menus,
    response?.data?.data?.menu_items,
    response?.data?.data?.menuItems,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  const groupedMenu =
    response?.data?.data?.menu ??
    response?.data?.data?.menus ??
    response?.data?.data?.menu_items ??
    response?.data?.data?.menuItems ??
    response?.data?.menu ??
    response?.data?.menus ??
    response?.data?.menu_items ??
    response?.data?.menuItems ??
    response?.menu ??
    response?.menus ??
    response?.menu_items ??
    response?.menuItems;

  if (groupedMenu && typeof groupedMenu === "object") {
    const groupedItems = Object.values(groupedMenu).filter(Array.isArray);
    if (groupedItems.length > 0) {
      return groupedItems.flat();
    }
  }

  return [];
};

// ============================================================
// CATEGORY IMAGE
// ============================================================

const getCategoryImage = (category) => {
  if (!category) {
    return FALLBACK_CATEGORY_IMAGES.all;
  }

  const categoryName = normalize(
    category?.name ||
      category?.category_name ||
      category?.categoryName ||
      category?.title ||
      category?.slug,
  );

  const apiImage =
    category?.image_url ||
    category?.imageUrl ||
    category?.image ||
    category?.icon ||
    category?.category_image ||
    category?.categoryImage ||
    category?.photo ||
    category?.thumbnail;

  const image = getImageSource(apiImage);

  if (image) {
    return image;
  }

  if (FALLBACK_CATEGORY_IMAGES[categoryName]) {
    return FALLBACK_CATEGORY_IMAGES[categoryName];
  }

  const fallbackKey = Object.keys(FALLBACK_CATEGORY_IMAGES).find(
    (key) => categoryName.includes(key) || key.includes(categoryName),
  );

  if (fallbackKey) {
    return FALLBACK_CATEGORY_IMAGES[fallbackKey];
  }

  return FALLBACK_CATEGORY_IMAGES.all;
};

// ============================================================
// NORMALIZE CATEGORIES
// ============================================================

const normalizeCategories = (response) => {
  const apiCategories = extractArray(response);

  const validCategories = apiCategories.filter(Boolean).map((item, index) => {
    const id =
      item?.id ??
      item?.category_id ??
      item?.categoryId ??
      item?.slug ??
      index + 1;

    const name =
      item?.name ||
      item?.category_name ||
      item?.categoryName ||
      item?.title ||
      item?.slug ||
      `Category ${index + 1}`;

    return {
      id: String(id),
      name: String(name),
      image: getCategoryImage(item),
      original: item,
    };
  });

  return [
    {
      id: "all",
      name: "All",
      image: FALLBACK_CATEGORY_IMAGES.all,
    },
    ...validCategories.filter((item) => !isAll(item.name)),
  ];
};

// ============================================================
// NORMALIZE RESTAURANT
// ============================================================

const normalizeRestaurant = (item, index) => {
  const restaurant = item?.restaurant || item;

  const id =
    restaurant?.id ??
    restaurant?.restaurant_id ??
    restaurant?.restaurantId ??
    index + 1;

  const name =
    restaurant?.name ||
    restaurant?.restaurant_name ||
    restaurant?.restaurantName ||
    "Restaurant";

  const imageValue =
    restaurant?.logo_url ||
    restaurant?.logoUrl ||
    restaurant?.logo ||
    restaurant?.restaurant_logo ||
    restaurant?.restaurantLogo ||
    restaurant?.photo ||
    restaurant?.thumbnail;

  const image = getImageSource(imageValue, FALLBACK_CATEGORY_IMAGES.all);

  const cuisine =
    restaurant?.cuisine ||
    restaurant?.cuisines ||
    restaurant?.category_name ||
    restaurant?.category ||
    "Various cuisines";

  const rating =
    restaurant?.rating ??
    restaurant?.average_rating ??
    restaurant?.avg_rating ??
    restaurant?.ratings ??
    0;

  const reviews =
    restaurant?.reviews ??
    restaurant?.review_count ??
    restaurant?.ratings_count ??
    0;

  const time =
    restaurant?.time ||
    restaurant?.delivery_time ||
    restaurant?.deliveryTime ||
    "30-40 min";

  const price =
    restaurant?.price ||
    restaurant?.price_for_two ||
    restaurant?.cost_for_two ||
    "₹200 for two";

  const offer =
    restaurant?.offer || restaurant?.offer_text || restaurant?.discount || "";

  const isVeg = isTruthy(
    restaurant?.isVeg ??
      restaurant?.is_veg ??
      restaurant?.pure_veg ??
      restaurant?.is_pure_veg,
  );

  return {
    ...restaurant,

    id: String(id),
    name: String(name),
    image,

    cuisine: Array.isArray(cuisine) ? cuisine.join(" • ") : String(cuisine),

    rating,
    reviews,
    time,
    price,
    offer,
    isVeg,

    original: restaurant,
  };
};

// ============================================================
// NORMALIZE PRODUCT
// ============================================================

const normalizeProduct = (item, index) => {
  const product = item?.product || item?.item || item;

  const id =
    product?.id ?? product?.product_id ?? product?.productId ?? index + 1;

  const name =
    product?.name ||
    product?.product_name ||
    product?.productName ||
    product?.title ||
    "Product";

  const imageValue =
    product?.image_url ||
    product?.imageUrl ||
    product?.image ||
    product?.product_image ||
    product?.productImage ||
    product?.photo ||
    product?.thumbnail;

  return {
    ...product,

    id: String(id),

    name: String(name),

    image: getImageSource(imageValue),

    price:
      product?.price ??
      product?.selling_price ??
      product?.sale_price ??
      product?.amount ??
      0,

    description: product?.description || product?.short_description || "",

    isVeg: isTruthy(product?.isVeg ?? product?.is_veg),

    original: product,
  };
};

// ============================================================
// SCREEN
// ============================================================

export default function ExploreScreen() {
  const params = useLocalSearchParams();

  const { colors: Colors, isDark } = useTheme();

  const styles = useMemo(() => makeStyles(Colors, isDark), [Colors, isDark]);

  // ==========================================================
  // ROUTE PARAMS
  // ==========================================================

  const incomingSearch = typeof params.search === "string" ? params.search : "";

  const incomingCategory =
    typeof params.category === "string" ? params.category : "All";

  const incomingCategoryId =
    typeof params.categoryId === "string" ? params.categoryId : "all";

  // ==========================================================
  // STATE
  // ==========================================================

  const [searchText, setSearchText] = useState(incomingSearch);

  const [selectedCategory, setSelectedCategory] = useState(incomingCategory);

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    incomingCategoryId || "all",
  );

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [categoriesError, setCategoriesError] = useState("");

  const [restaurants, setRestaurants] = useState([]);

  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  const [restaurantsError, setRestaurantsError] = useState("");

  const [restaurantProducts, setRestaurantProducts] = useState({});

  const [favorites, setFavorites] = useState([]);

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [selectedFilter, setSelectedFilter] = useState("All");

  const [sortBy, setSortBy] = useState("default");

  const [showFilterModal, setShowFilterModal] = useState(false);

  const [tempFilter, setTempFilter] = useState("All");

  const [tempSort, setTempSort] = useState("default");

  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");

      console.log("====================================");
      console.log("RESTAURANT CATEGORIES API");
      console.log("GET /api/customer/restaurant-categories");

      const response = await getRestaurantCategories();

      console.log("CATEGORY RESPONSE:", JSON.stringify(response, null, 2));

      const normalized = normalizeCategories(response);

      if (normalized.length > 0) {
        setCategories(normalized);

        const routeCategoryId = incomingCategoryId;

        if (routeCategoryId) {
          const matched = normalized.find(
            (category) => String(category.id) === String(routeCategoryId),
          );

          if (matched) {
            setSelectedCategory(matched.name);

            setSelectedCategoryId(String(matched.id));
          }
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.log("CATEGORY ERROR:", error?.message);

      setCategoriesError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load categories.",
      );

      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  const loadProductsForRestaurants = async (categoryId, restaurantList) => {
    if (
      !categoryId ||
      !Array.isArray(restaurantList) ||
      restaurantList.length === 0
    ) {
      return;
    }

    console.log("====================================");
    console.log("LOADING RESTAURANT PRODUCTS");
    console.log("CATEGORY:", categoryId);
    console.log("RESTAURANTS:", restaurantList.length);
    console.log("====================================");

    setRestaurantProducts((previous) => {
      const next = {
        ...previous,
      };

      restaurantList.forEach((restaurant) => {
        next[String(restaurant.id)] = {
          loading: true,
          error: "",
          products: [],
        };
      });

      return next;
    });

    await Promise.all(
      restaurantList.map(async (restaurant) => {
        const restaurantId = restaurant?.id;

        if (!restaurantId) {
          return;
        }

        try {
          console.log("------------------------------------");

          console.log("PRODUCT API CALL");

          console.log("CATEGORY ID:", categoryId);

          console.log("RESTAURANT ID:", restaurantId);

          const response = await getProductsByCategoryAndRestaurant(
            categoryId,
            restaurantId,
          );

          console.log("PRODUCT RESPONSE:", JSON.stringify(response, null, 2));

          const apiProducts = extractArray(response);

          const products = apiProducts.map(normalizeProduct);

          console.log("PRODUCT COUNT:", products.length);

          setRestaurantProducts((previous) => ({
            ...previous,

            [String(restaurantId)]: {
              loading: false,
              error: "",
              products,
            },
          }));
        } catch (error) {
          console.log("PRODUCT API ERROR:", error?.message);

          setRestaurantProducts((previous) => ({
            ...previous,

            [String(restaurantId)]: {
              loading: false,

              error:
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load menu.",

              products: [],
            },
          }));
        }
      }),
    );
  };

  // ==========================================================
  // LOAD RESTAURANTS
  // ==========================================================

  const loadCategoryRestaurants = async (categoryId) => {
    const safeCategoryId = String(categoryId || "all");

    try {
      setRestaurantsLoading(true);
      setRestaurantsError("");
      setRestaurantProducts({});

      console.log("====================================");

      console.log("LOAD RESTAURANTS");

      console.log("CATEGORY ID:", safeCategoryId);

      let response;

      // ------------------------------------------------------
      // ALL
      // ------------------------------------------------------

      if (isAll(safeCategoryId)) {
        console.log("ALL CATEGORY SELECTED");

        console.log("GET /api/customer/restaurants");

        response = await getRestaurants();
      }

      // ------------------------------------------------------
      // SPECIFIC CATEGORY
      // ------------------------------------------------------
      else {
        console.log(
          `GET /api/customer/categories/${safeCategoryId}/restaurants`,
        );

        response = await getCategoryRestaurants(safeCategoryId);
      }

      console.log("RESTAURANT RESPONSE:", JSON.stringify(response, null, 2));

      const apiRestaurants = extractArray(response);

      console.log("RESTAURANT COUNT:", apiRestaurants.length);

      const normalizedRestaurants = apiRestaurants.map(normalizeRestaurant);

      setRestaurants(normalizedRestaurants);

      // ------------------------------------------------------
      // LOAD PRODUCTS FOR EVERY RESTAURANT
      // ------------------------------------------------------

      if (normalizedRestaurants.length > 0) {
        loadProductsForRestaurants(safeCategoryId, normalizedRestaurants);
      }
    } catch (error) {
      console.log("====================================");

      console.log("RESTAURANT API ERROR");

      console.log("MESSAGE:", error?.message);

      console.log("STATUS:", error?.response?.status);

      console.log(
        "RESPONSE:",
        JSON.stringify(error?.response?.data || {}, null, 2),
      );

      setRestaurantsError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load restaurants.",
      );

      setRestaurants([]);
      setRestaurantProducts({});
    } finally {
      setRestaurantsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadCategories();
  }, []);

  // ==========================================================
  // CATEGORY CHANGE
  // ==========================================================

  useEffect(() => {
    if (!selectedCategoryId) {
      return;
    }

    loadCategoryRestaurants(selectedCategoryId);
  }, [selectedCategoryId]);

  // ==========================================================
  // ROUTE PARAM UPDATE
  // ==========================================================

  useEffect(() => {
    if (typeof params.search === "string") {
      setSearchText(params.search);
    }

    if (typeof params.category === "string") {
      setSelectedCategory(params.category);
    }

    if (typeof params.categoryId === "string") {
      setSelectedCategoryId(params.categoryId || "all");
    }
  }, [params.search, params.category, params.categoryId]);

  // ==========================================================
  // SELECT CATEGORY
  // ==========================================================

  const selectCategory = (categoryName, categoryId) => {
    const id = String(categoryId || "all");

    console.log("====================================");

    console.log("SELECTED CATEGORY:", categoryName);

    console.log("SELECTED CATEGORY ID:", id);

    setSelectedCategory(categoryName);

    setSelectedCategoryId(id);
    setSearchText("");
  };

  // ==========================================================
  // FAVORITE
  // ==========================================================

  const toggleFavorite = (id) => {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // ------------------------------------------------------
    // SEARCH
    // ------------------------------------------------------

    const search = normalize(searchText);

    if (search) {
      result = result.filter((restaurant) => {
        const name = normalize(restaurant?.name);

        const cuisine = normalize(restaurant?.cuisine);

        const address = normalize(restaurant?.address);

        return (
          name.includes(search) ||
          cuisine.includes(search) ||
          address.includes(search)
        );
      });
    }

    // ------------------------------------------------------
    // PURE VEG
    // ------------------------------------------------------

    if (selectedFilter === "Pure Veg") {
      result = result.filter((restaurant) => restaurant?.isVeg === true);
    }

    // ------------------------------------------------------
    // RATING
    // ------------------------------------------------------

    if (selectedFilter === "Rating 4.0+") {
      result = result.filter(
        (restaurant) => Number(restaurant?.rating || 0) >= 4,
      );
    }

    // ------------------------------------------------------
    // FAST DELIVERY
    // ------------------------------------------------------

    if (selectedFilter === "Fast Delivery") {
      result = result.filter(
        (restaurant) => getFirstMinutes(restaurant?.time) <= 30,
      );
    }

    // ------------------------------------------------------
    // OFFERS
    // ------------------------------------------------------

    if (selectedFilter === "Offers") {
      result = result.filter((restaurant) => Boolean(restaurant?.offer));
    }

    // ------------------------------------------------------
    // SORT
    // ------------------------------------------------------

    if (sortBy === "rating") {
      result.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0));
    }

    if (sortBy === "delivery") {
      result.sort(
        (a, b) => getFirstMinutes(a?.time) - getFirstMinutes(b?.time),
      );
    }

    if (sortBy === "priceLow") {
      result.sort((a, b) => getPrice(a?.price) - getPrice(b?.price));
    }

    if (sortBy === "priceHigh") {
      result.sort((a, b) => getPrice(b?.price) - getPrice(a?.price));
    }

    return result;
  }, [restaurants, searchText, selectedFilter, sortBy]);

  // ==========================================================
  // CLEAR ALL FILTERS
  // ==========================================================

  const clearAll = () => {
    setSearchText("");

    setSelectedCategory("All");

    setSelectedCategoryId("all");

    setSelectedFilter("All");

    setSortBy("default");

    setRestaurantsError("");

    setShowFilterModal(false);
  };

  // ==========================================================
  // OPEN FILTER
  // ==========================================================

  const openFilter = () => {
    setTempFilter(selectedFilter);

    setTempSort(sortBy);

    setShowFilterModal(true);
  };

  // ==========================================================
  // APPLY FILTER
  // ==========================================================

  const applyFilter = () => {
    setSelectedFilter(tempFilter);

    setSortBy(tempSort);

    setShowFilterModal(false);
  };

  // ==========================================================
  // OPEN RESTAURANT
  // ==========================================================

  const openRestaurant = (restaurant) => {
    if (!restaurant?.id) {
      return;
    }

    router.push({
      pathname: "/Restaurant/[id]",

      params: {
        id: String(restaurant.id),

        categoryId: String(selectedCategoryId || "all"),
      },
    });
  };

  // ==========================================================
  // PRODUCT INFO
  // ==========================================================

  const renderProductInfo = (restaurant) => {
    const restaurantId = String(restaurant?.id);

    const productState = restaurantProducts[restaurantId];

    if (!productState) {
      return null;
    }

    if (productState.loading) {
      return (
        <View style={styles.productInfo}>
          <ActivityIndicator size="small" color={Colors.primary || "#F9080C"} />

          <Text style={styles.productInfoText}>Loading menu...</Text>
        </View>
      );
    }

    if (productState.error) {
      return <View style={styles.productInfo}></View>;
    }

    if (productState.products?.length > 0) {
      return (
        <View style={styles.productInfo}>
          <Ionicons
            name="fast-food-outline"
            size={14}
            color={Colors.primary || "#F9080C"}
          />

          <Text style={styles.productInfoText}>
            {productState.products.length} menu items
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.productInfo}>
        <Ionicons
          name="fast-food-outline"
          size={14}
          color={Colors.textSecondary}
        />

        <Text style={styles.productInfoText}>No menu items</Text>
      </View>
    );
  };

  // ==========================================================
  // RESTAURANT CARD
  // ==========================================================

  const renderRestaurant = (restaurant) => {
    const favorite = favorites.includes(restaurant.id);

    return (
      <TouchableOpacity
        key={String(restaurant.id)}
        activeOpacity={0.92}
        style={styles.restaurantCard}
        onPress={() => openRestaurant(restaurant)}
      >
        {/* IMAGE */}

        <View style={styles.imageContainer}>
          <Image
            source={restaurant.image || FALLBACK_CATEGORY_IMAGES.all}
            style={styles.restaurantImage}
            resizeMode="cover"
          />

          {restaurant.offer ? (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{restaurant.offer}</Text>
            </View>
          ) : null}
        </View>

        {/* DETAILS */}

        <View style={styles.restaurantDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {restaurant.name}
            </Text>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color="#FFFFFF" />

              <Text style={styles.ratingText}>{restaurant.rating || "0"}</Text>
            </View>
          </View>

          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textSecondary}
              />

              <Text style={styles.infoText}>{restaurant.time}</Text>
            </View>

            <View style={styles.dot} />

            <Text style={styles.infoText}>{restaurant.price}</Text>
          </View>

          {renderProductInfo(restaurant)}

          <View style={styles.cardBottom}>
            <View style={styles.delivery}>
              <Ionicons
                name="bicycle-outline"
                size={15}
                color={Colors.textSecondary}
              />

              <Text style={styles.deliveryText}>Free delivery</Text>
            </View>

            <Text style={styles.reviews}>
              {restaurant.reviews || 0} ratings
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================================
  // EMPTY / LOADING
  // ==========================================================

  const renderEmpty = () => {
    if (restaurantsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary || "#F9080C"} />

          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      );
    }

    if (restaurantsError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={45}
            color={Colors.textMuted}
          />

          <Text style={styles.emptyTitle}>Unable to load restaurants</Text>

          <Text style={styles.emptyDescription}>{restaurantsError}</Text>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => loadCategoryRestaurants(selectedCategoryId || "all")}
          >
            <Text style={styles.clearButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (restaurants.length > 0 && filteredRestaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={45} color={Colors.textMuted} />

          <Text style={styles.emptyTitle}>No matching restaurants</Text>

          <Text style={styles.emptyDescription}>
            Try another search or clear your filters.
          </Text>

          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="restaurant-outline"
          size={45}
          color={Colors.textMuted}
        />

        <Text style={styles.emptyTitle}>No restaurants found</Text>

        <Text style={styles.emptyDescription}>
          No restaurants are available for this category.
        </Text>

        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.clearButtonText}>View All Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={Colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.locationWrapper}>
            <View style={styles.locationIcon}>
              <Ionicons
                name="location"
                size={18}
                color={Colors.primary || "#F9080C"}
              />
            </View>

            <View>
              <Text style={styles.deliverText}>Delivering to</Text>

              <Text style={styles.location}>Hitech City</Text>

              <Text style={styles.city}>Hyderabad</Text>
            </View>
          </View>
        </View>

        {/* TITLE */}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Explore</Text>

          <Text style={styles.subtitle}>Discover the best food near you</Text>
        </View>

        {/* SEARCH */}

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search restaurants or food"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
            />

            {searchText.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={openFilter}>
            <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* CATEGORIES */}

        <View style={styles.sectionHeader}>
          <View style={styles.categoryTitleRow}>
            <Text style={styles.sectionTitle}>Eat what makes you happy</Text>

            {categoriesLoading ? (
              <ActivityIndicator
                size="small"
                color={Colors.primary || "#F9080C"}
              />
            ) : null}
          </View>

          {categoriesError ? (
            <TouchableOpacity onPress={loadCategories}>
              <Text style={styles.retryCategoryText}>
                Unable to load categories. Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = String(selectedCategoryId) === String(category.id);

            return (
              <TouchableOpacity
                key={String(category.id)}
                activeOpacity={0.85}
                style={styles.categoryItem}
                onPress={() => selectCategory(category.name, category.id)}
              >
                <View
                  style={[
                    styles.categoryImageBox,
                    active && styles.categoryImageBoxActive,
                  ]}
                >
                  <Image
                    source={category.image}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                </View>

                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* RESTAURANT HEADER */}

        <View style={styles.restaurantHeader}>
          <View>
            <Text style={styles.restaurantTitle}>Restaurants</Text>

            <Text style={styles.resultText}>
              {filteredRestaurants.length} restaurants
            </Text>
          </View>

          {selectedFilter !== "All" || sortBy !== "default" ? (
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* RESTAURANTS LOADING / ERROR */}

        {restaurantsLoading && (
          <ActivityIndicator
            size="small"
            style={styles.restaurantLoader}
            color={Colors.primary || "#E85D04"}
          />
        )}

        {restaurantsError ? (
          <TouchableOpacity
            onPress={() => loadCategoryRestaurants(selectedCategoryId)}
            style={styles.retryRestaurants}
          >
            <Text style={styles.retryCategoryText}>
              Unable to load restaurants. Tap to retry.
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* RESTAURANTS */}

        <View style={styles.restaurantList}>
          {restaurantsLoading || filteredRestaurants.length === 0
            ? renderEmpty()
            : filteredRestaurants.map(renderRestaurant)}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FILTER MODAL */}

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>

              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={25} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* FILTER */}

            <Text style={styles.modalHeading}>Filter by</Text>

            {["All", "Pure Veg", "Rating 4.0+", "Fast Delivery", "Offers"].map(
              (filter) => {
                const active = tempFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={styles.modalOption}
                    onPress={() => setTempFilter(filter)}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>

                    <Text
                      style={[
                        styles.modalOptionText,
                        active && styles.modalOptionTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}

            {/* SORT */}

            <Text
              style={[
                styles.modalHeading,
                {
                  marginTop: 16,
                },
              ]}
            >
              Sort by
            </Text>

            {[
              {
                value: "default",
                label: "Recommended",
              },
              {
                value: "rating",
                label: "Rating",
              },
              {
                value: "delivery",
                label: "Fastest Delivery",
              },
              {
                value: "priceLow",
                label: "Price: Low to High",
              },
              {
                value: "priceHigh",
                label: "Price: High to Low",
              },
            ].map((sort) => {
              const active = tempSort === sort.value;

              return (
                <TouchableOpacity
                  key={sort.value}
                  style={styles.modalOption}
                  onPress={() => setTempSort(sort.value)}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>

                  <Text
                    style={[
                      styles.modalOptionText,
                      active && styles.modalOptionTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* BUTTONS */}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.clearModalButton}
                onPress={() => {
                  setTempFilter("All");

                  setTempSort("default");
                }}
              >
                <Text style={styles.clearModalText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyModalButton}
                onPress={applyFilter}
              >
                <Text style={styles.applyModalText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const makeStyles = (Colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    header: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 8,
    },

    locationWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },

    locationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? Colors.surface : Colors.backgroundElement,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    deliverText: {
      fontFamily: Fonts.regular,
      fontSize: 17,
      color: Colors.textSecondary,
    },

    location: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: Colors.textPrimary,
    },

    city: {
      fontFamily: Fonts.regular,
      fontSize: 17,
      color: Colors.textSecondary,
    },

    titleContainer: {
      paddingHorizontal: 18,
      marginTop: 14,
    },

    title: {
      fontFamily: Fonts.regular,
      fontSize: 30,
      color: Colors.textPrimary,
    },

    subtitle: {
      fontFamily: Fonts.regular,
      fontSize: 17,
      color: Colors.textSecondary,
      marginTop: 4,
    },

    searchRow: {
      paddingHorizontal: 18,
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    searchBox: {
      flex: 1,
      height: 52,
      backgroundColor: Colors.surface,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: Colors.border,
    },

    searchInput: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 16,
      color: Colors.textPrimary,
      marginLeft: 9,
    },

    filterButton: {
      width: 52,
      height: 52,
      borderRadius: 15,
      backgroundColor: Colors.primary || "#F9080C",
      justifyContent: "center",
      alignItems: "center",
    },

    sectionHeader: {
      paddingHorizontal: 18,
      marginTop: 26,
      marginBottom: 14,
    },

    categoryTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    sectionTitle: {
      fontFamily: Fonts.regular,
      fontSize: 22,
      color: Colors.textPrimary,
    },

    retryCategoryText: {
      marginTop: 7,
      fontFamily: Fonts.medium,
      fontSize: 11,
      color: Colors.primary || "#F9080C",
    },

    categoryList: {
      paddingHorizontal: 18,
      gap: 15,
    },

    categoryItem: {
      width: 82,
      alignItems: "center",
    },

    categoryImageBox: {
      width: 68,
      height: 68,
      borderRadius: 34,
      overflow: "hidden",
      backgroundColor: isDark ? Colors.surface : Colors.backgroundElement,
      borderWidth: 2,
      borderColor: "transparent",
    },

    categoryImageBoxActive: {
      borderColor: Colors.primary || "#F9080C",
      transform: [
        {
          scale: 1.04,
        },
      ],
    },

    categoryImage: {
      width: "100%",
      height: "100%",
    },

    categoryText: {
      marginTop: 8,
      fontFamily: Fonts.medium,
      fontSize: 17,
      color: Colors.textPrimary,
      textAlign: "center",
    },

    categoryTextActive: {
      color: Colors.primary || "#F9080C",
      fontFamily: Fonts.bold,
    },

    restaurantHeader: {
      marginTop: 27,
      paddingHorizontal: 18,
      marginBottom: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    restaurantTitle: {
      fontFamily: Fonts.regular,
      fontSize: 24,
      color: Colors.textPrimary,
    },

    resultText: {
      fontFamily: Fonts.regular,
      fontSize: 17,
      color: Colors.textSecondary,
      marginTop: 4,
    },

    clearFilterText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: Colors.primary || "#F9080C",
    },

    restaurantList: {
      paddingHorizontal: 18,
    },

    restaurantCard: {
      backgroundColor: Colors.card,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: 18,
      elevation: 5,
    },

    imageContainer: {
      height: 195,
      width: "100%",
      position: "relative",
      backgroundColor: Colors.card,
    },

    restaurantImage: {
      width: "100%",
      height: "100%",
    },

    offerBadge: {
      position: "absolute",
      left: 12,
      bottom: 12,
      backgroundColor: "#D84315",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
    },

    offerText: {
      color: "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: 10,
    },

    favoriteButton: {
      position: "absolute",
      right: 12,
      top: 12,
      width: 39,
      height: 39,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.96)",
      alignItems: "center",
      justifyContent: "center",
    },

    restaurantDetails: {
      paddingHorizontal: 14,
      paddingTop: 13,
      paddingBottom: 14,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    restaurantName: {
      flex: 1,
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: Colors.textPrimary,
      marginRight: 8,
    },

    ratingBadge: {
      backgroundColor: "#2E7D32",
      borderRadius: 7,
      paddingHorizontal: 7,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },

    ratingText: {
      color: "#FFFFFF",
      fontFamily: Fonts.regular,
      fontSize: 11,
    },

    cuisine: {
      fontFamily: Fonts.regular,
      fontSize: 17,
      color: Colors.textSecondary,
      marginTop: 5,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 9,
    },

    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    infoText: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: Colors.textSecondary,
    },

    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.textMuted,
      marginHorizontal: 8,
    },

    productInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      gap: 5,
    },

    productInfoText: {
      fontFamily: Fonts.medium,
      fontSize: 11,
      color: Colors.textSecondary,
    },

    productErrorText: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 11,
      color: Colors.error || "#E53935",
    },

    cardBottom: {
      marginTop: 11,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    delivery: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    deliveryText: {
      fontFamily: Fonts.regular,
      fontSize: 17,
      color: Colors.textSecondary,
    },

    reviews: {
      fontFamily: Fonts.regular,
      fontSize: 11,
      color: Colors.textSecondary,
    },

    loadingContainer: {
      minHeight: 180,
      justifyContent: "center",
      alignItems: "center",
    },

    loadingText: {
      marginTop: 12,
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: Colors.textSecondary,
    },

    emptyContainer: {
      minHeight: 220,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
    },

    emptyTitle: {
      marginTop: 12,
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: Colors.textPrimary,
      textAlign: "center",
    },

    emptyDescription: {
      marginTop: 7,
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 19,
    },

    clearButton: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: Colors.primary || "#F9080C",
    },

    clearButtonText: {
      color: Colors.white || "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: 13,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },

    modal: {
      backgroundColor: Colors.background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 20,
      paddingBottom: 30,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },

    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: Colors.textPrimary,
    },

    modalHeading: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: Colors.textPrimary,
      marginBottom: 8,
    },

    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },

    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: Colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    radioActive: {
      borderColor: Colors.primary || "#F9080C",
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Colors.primary || "#F9080C",
    },

    modalOptionText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: Colors.textSecondary,
    },

    modalOptionTextActive: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
    },

    modalButtons: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },

    clearModalButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    clearModalText: {
      fontFamily: Fonts.bold,
      color: Colors.textPrimary,
    },

    applyModalButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: Colors.primary || "#F9080C",
      justifyContent: "center",
      alignItems: "center",
    },

    applyModalText: {
      fontFamily: Fonts.bold,
      color: Colors.white || "#FFFFFF",
    },
  });
