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

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";

import {
  getCategories,
} from "../../utils/Function";

// IMPORTANT:
// Restaurant data stays inside ../Restaurant/[id].jsx
import { restaurants } from "../Restaurant/[id]";

/* ============================================================
   FALLBACK CATEGORY IMAGES
============================================================ */

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

/* ============================================================
   DEFAULT / FALLBACK CATEGORIES
============================================================ */

const DEFAULT_CATEGORIES = [
  {
    id: "all",
    name: "All",
    image: FALLBACK_CATEGORY_IMAGES.all,
  },
  {
    id: "dosa",
    name: "Dosa",
    image: FALLBACK_CATEGORY_IMAGES.dosa,
  },
  {
    id: "south-indian",
    name: "South Indian",
    image: FALLBACK_CATEGORY_IMAGES["south indian"],
  },
  {
    id: "biryani",
    name: "Biryani",
    image: FALLBACK_CATEGORY_IMAGES.biryani,
  },
  {
    id: "idli",
    name: "Idli",
    image: FALLBACK_CATEGORY_IMAGES.idli,
  },
  {
    id: "pizza",
    name: "Pizza",
    image: FALLBACK_CATEGORY_IMAGES.pizza,
  },
  {
    id: "burgers",
    name: "Burgers",
    image: FALLBACK_CATEGORY_IMAGES.burgers,
  },
  {
    id: "chinese",
    name: "Chinese",
    image: FALLBACK_CATEGORY_IMAGES.chinese,
  },
  {
    id: "chicken",
    name: "Chicken",
    image: FALLBACK_CATEGORY_IMAGES.chicken,
  },
  {
    id: "desserts",
    name: "Desserts",
    image: FALLBACK_CATEGORY_IMAGES.desserts,
  },
  {
    id: "drinks",
    name: "Drinks",
    image: FALLBACK_CATEGORY_IMAGES.drinks,
  },
];

/* ============================================================
   POPULAR CUISINES
============================================================ */

const popularCuisines = [
  {
    id: "1",
    name: "Biryani",
    places: "120+ places",
    image: require("../../../assets/images/Customer1.png"),
  },
  {
    id: "2",
    name: "South Indian",
    places: "150+ places",
    image: require("../../../assets/images/Customer2.png"),
  },
  {
    id: "3",
    name: "Dosa",
    places: "100+ places",
    image: require("../../../assets/images/Customer3.png"),
  },
  {
    id: "4",
    name: "Pizza",
    places: "90+ places",
    image: require("../../../assets/images/Customer4.png"),
  },
  {
    id: "5",
    name: "Burgers",
    places: "80+ places",
    image: require("../../../assets/images/burgers.png"),
  },
  {
    id: "6",
    name: "Chinese",
    places: "110+ places",
    image: require("../../../assets/images/chinese.png"),
  },
  {
    id: "7",
    name: "Desserts",
    places: "70+ places",
    image: require("../../../assets/images/desserts.png"),
  },
];

/* ============================================================
   HELPERS
============================================================ */

const normalize = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim();
};

const getFirstMinutes = (time) => {
  const match = String(time || "").match(/\d+/);

  return match ? Number(match[0]) : 999;
};

const getPrice = (price) => {
  const match = String(price || "")
    .replace(/,/g, "")
    .match(/\d+/);

  return match ? Number(match[0]) : 0;
};

/* ============================================================
   EXTRACT CATEGORY LIST
============================================================ */

const extractCategoryList = (response) => {
  if (!response) {
    return [];
  }

  // Response itself is array
  if (Array.isArray(response)) {
    return response;
  }

  // { data: [] }
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  // { data: { data: [] } }
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  // { categories: [] }
  if (Array.isArray(response?.categories)) {
    return response.categories;
  }

  // { data: { categories: [] } }
  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }

  // { result: [] }
  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
};

/* ============================================================
   GET IMAGE URL
============================================================ */

const getCategoryImage = (category) => {
  if (!category) {
    return FALLBACK_CATEGORY_IMAGES.all;
  }

  const categoryName = normalize(
    category?.name ||
      category?.category_name ||
      category?.title ||
      category?.slug ||
      "",
  );

  const apiImage =
    category?.image_url ||
    category?.imageUrl ||
    category?.image ||
    category?.icon ||
    category?.category_image ||
    category?.categoryImage ||
    category?.photo ||
    category?.thumbnail ||
    "";

  /* ----------------------------------------------------------
     ABSOLUTE IMAGE URL
  ---------------------------------------------------------- */

  if (
    typeof apiImage === "string" &&
    /^https?:\/\//i.test(apiImage)
  ) {
    return {
      uri: apiImage,
    };
  }

  /* ----------------------------------------------------------
     RELATIVE IMAGE URL
  ---------------------------------------------------------- */

  if (
    typeof apiImage === "string" &&
    apiImage.trim().length > 0
  ) {
    let cleanPath = apiImage
      .trim()
      .replace(/^\/+/, "");

    /*
     * APP_URL:
     *
     * http://192.168.x.x:8001/api/customer/
     *
     * We need only the base URL.
     */

    const baseUrl = String(APP_URL || "").replace(
      /\/api\/customer\/?$/,
      "",
    );

    if (cleanPath.startsWith("storage/")) {
      return {
        uri: `${baseUrl}/${cleanPath}`,
      };
    }

    return {
      uri: `${baseUrl}/${cleanPath}`,
    };
  }

  /* ----------------------------------------------------------
     LOCAL FALLBACK
  ---------------------------------------------------------- */

  if (FALLBACK_CATEGORY_IMAGES[categoryName]) {
    return FALLBACK_CATEGORY_IMAGES[categoryName];
  }

  const fallbackKey = Object.keys(
    FALLBACK_CATEGORY_IMAGES,
  ).find(
    (key) =>
      categoryName.includes(key) ||
      key.includes(categoryName),
  );

  if (fallbackKey) {
    return FALLBACK_CATEGORY_IMAGES[fallbackKey];
  }

  return FALLBACK_CATEGORY_IMAGES.all;
};

/* ============================================================
   NORMALIZE API CATEGORIES
============================================================ */

const normalizeCategories = (response) => {
  const apiCategories = extractCategoryList(response);

  console.log(
    "CATEGORY ARRAY LENGTH:",
    apiCategories.length,
  );

  const validCategories = apiCategories
    .filter((item) => item)
    .filter((item) => {
      const name =
        item?.name ||
        item?.category_name ||
        item?.title ||
        item?.slug;

      return Boolean(name);
    })
    .map((item, index) => {
      const id =
        item?.id ??
        item?.category_id ??
        item?.categoryId ??
        item?.slug ??
        index + 1;

      const name =
        item?.name ||
        item?.category_name ||
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
    ...validCategories,
  ];
};

/* ============================================================
   RESTAURANT DATA
============================================================ */

const restaurantList = Object.values(
  restaurants || {},
).map((restaurant) => {
  const menu =
    restaurant?.menu &&
    typeof restaurant.menu === "object"
      ? restaurant.menu
      : {};

  const menuItems = Object.values(menu).flat();

  const allVeg =
    typeof restaurant?.isVeg === "boolean"
      ? restaurant.isVeg
      : menuItems.length > 0 &&
        menuItems.every(
          (item) => item?.isVeg === true,
        );

  return {
    ...restaurant,

    isVeg: allVeg,

    categories:
      typeof restaurant?.cuisine === "string"
        ? restaurant.cuisine
            .split("•")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
  };
});

/* ============================================================
   SCREEN
============================================================ */

export default function ExploreScreen() {
  const params = useLocalSearchParams();

  const { colors: Colors, isDark } = useTheme();

  const styles = useMemo(
    () => makeStyles(Colors, isDark),
    [Colors, isDark],
  );

  /* ==========================================================
     PARAMS
  ========================================================== */

  const incomingSearch =
    typeof params.search === "string"
      ? params.search
      : "";

  const incomingCategory =
    typeof params.category === "string"
      ? params.category
      : "All";

  const incomingCategoryId =
    typeof params.categoryId === "string"
      ? params.categoryId
      : "";

  /* ==========================================================
     STATE
  ========================================================== */

  const [searchText, setSearchText] =
    useState(incomingSearch);

  const [selectedCategory, setSelectedCategory] =
    useState(incomingCategory);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState(incomingCategoryId);

  const [categories, setCategories] =
    useState(DEFAULT_CATEGORIES);

  const [categoriesLoading, setCategoriesLoading] =
    useState(false);

  const [categoriesError, setCategoriesError] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("default");

  const [favorites, setFavorites] =
    useState([]);

  const [showFilterModal, setShowFilterModal] =
    useState(false);

  const [tempFilter, setTempFilter] =
    useState("All");

  const [tempSort, setTempSort] =
    useState("default");

  /* ==========================================================
     CATEGORIES GET API
  ========================================================== */

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");

      console.log(
        "====================================",
      );
      console.log(
        "EXPLORE SCREEN - CATEGORIES API",
      );
      console.log(
        "METHOD: GET",
      );
      console.log(
        "FUNCTION: getCategories()",
      );
      console.log(
        "====================================",
      );

      const response = await getCategories();

      console.log(
        "====================================",
      );
      console.log(
        "CATEGORIES API RESPONSE",
      );
      console.log(
        JSON.stringify(response, null, 2),
      );
      console.log(
        "====================================",
      );

      const apiCategories =
        normalizeCategories(response);

      if (apiCategories.length > 1) {
        console.log(
          "API CATEGORIES USED:",
          apiCategories.length,
        );

        setCategories(apiCategories);

        /*
         * Match incoming categoryId from HomeScreen.
         */

        if (incomingCategoryId) {
          const matchedCategory =
            apiCategories.find(
              (item) =>
                String(item.id) ===
                String(incomingCategoryId),
            );

          if (matchedCategory) {
            setSelectedCategory(
              matchedCategory.name,
            );

            setSelectedCategoryId(
              String(matchedCategory.id),
            );
          }
        }
      } else {
        console.log(
          "No API categories found.",
        );

        console.log(
          "Using fallback categories.",
        );

        setCategories(
          DEFAULT_CATEGORIES,
        );
      }
    } catch (error) {
      console.log(
        "====================================",
      );
      console.log(
        "CATEGORIES API ERROR",
      );
      console.log(
        "MESSAGE:",
        error?.message,
      );
      console.log(
        "====================================",
      );

      setCategoriesError(
        error?.message ||
          "Unable to load categories.",
      );

      setCategories(
        DEFAULT_CATEGORIES,
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  /* ==========================================================
     CALL CATEGORY API
  ========================================================== */

  useEffect(() => {
    loadCategories();
  }, []);

  /* ==========================================================
     UPDATE ROUTE PARAMS
  ========================================================== */

  useEffect(() => {
    if (typeof params.search === "string") {
      setSearchText(params.search);
    }

    if (typeof params.category === "string") {
      setSelectedCategory(params.category);
    }

    if (
      typeof params.categoryId === "string"
    ) {
      setSelectedCategoryId(
        params.categoryId,
      );
    }
  }, [
    params.search,
    params.category,
    params.categoryId,
  ]);

  /* ==========================================================
     SELECT CATEGORY
  ========================================================== */

  const selectCategory = (
    categoryName,
    categoryId = "",
  ) => {
    setSelectedCategory(categoryName);

    setSelectedCategoryId(
      String(categoryId || ""),
    );

    setSearchText("");
  };

  /* ==========================================================
     FAVORITE
  ========================================================== */

  const toggleFavorite = (id) => {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (item) => item !== id,
        );
      }

      return [...previous, id];
    });
  };

  /* ==========================================================
     FILTER RESTAURANTS
  ========================================================== */

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurantList];

    /* --------------------------------------------------------
       SEARCH
    -------------------------------------------------------- */

    const search = normalize(searchText);

    const isRestaurantBrowseQuery =
      search === "restaurant" ||
      search === "restaurants";

    if (
      search &&
      !isRestaurantBrowseQuery
    ) {
      result = result.filter(
        (restaurant) => {
          const name = normalize(
            restaurant?.name,
          );

          const cuisine = normalize(
            restaurant?.cuisine,
          );

          const address = normalize(
            restaurant?.address,
          );

          const categoryText = (
            restaurant?.categories || []
          )
            .map(normalize)
            .join(" ");

          const menu =
            restaurant?.menu &&
            typeof restaurant.menu === "object"
              ? restaurant.menu
              : {};

          const foodNames =
            Object.values(menu)
              .flat()
              .map((item) =>
                normalize(item?.name),
              )
              .join(" ");

          const foodDescriptions =
            Object.values(menu)
              .flat()
              .map((item) =>
                normalize(
                  item?.description,
                ),
              )
              .join(" ");

          return (
            name.includes(search) ||
            cuisine.includes(search) ||
            address.includes(search) ||
            categoryText.includes(search) ||
            foodNames.includes(search) ||
            foodDescriptions.includes(search)
          );
        },
      );
    }

    /* --------------------------------------------------------
       CATEGORY
    -------------------------------------------------------- */

    if (
      selectedCategory &&
      normalize(selectedCategory) !== "all"
    ) {
      const category =
        normalize(selectedCategory);

      result = result.filter(
        (restaurant) => {
          const cuisineMatch = (
            restaurant?.categories || []
          ).some((item) => {
            const current =
              normalize(item);

            return (
              current === category ||
              current.includes(category) ||
              category.includes(current)
            );
          });

          const menu =
            restaurant?.menu &&
            typeof restaurant.menu === "object"
              ? restaurant.menu
              : {};

          const foodMatch =
            Object.values(menu)
              .flat()
              .some((item) => {
                const itemName =
                  normalize(item?.name);

                const description =
                  normalize(
                    item?.description,
                  );

                return (
                  itemName.includes(category) ||
                  description.includes(category)
                );
              });

          return (
            cuisineMatch ||
            foodMatch
          );
        },
      );
    }

    /* --------------------------------------------------------
       FILTER
    -------------------------------------------------------- */

    if (
      selectedFilter === "Pure Veg"
    ) {
      result = result.filter(
        (restaurant) =>
          restaurant?.isVeg === true,
      );
    }

    if (
      selectedFilter === "Rating 4.0+"
    ) {
      result = result.filter(
        (restaurant) =>
          Number(restaurant?.rating) >= 4,
      );
    }

    if (
      selectedFilter === "Fast Delivery"
    ) {
      result = result.filter(
        (restaurant) =>
          getFirstMinutes(
            restaurant?.time,
          ) <= 30,
      );
    }

    if (
      selectedFilter === "Offers"
    ) {
      result = result.filter(
        (restaurant) =>
          Boolean(restaurant?.offer),
      );
    }

    /* --------------------------------------------------------
       SORT
    -------------------------------------------------------- */

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b?.rating || 0) -
          Number(a?.rating || 0),
      );
    }

    if (sortBy === "delivery") {
      result.sort(
        (a, b) =>
          getFirstMinutes(a?.time) -
          getFirstMinutes(b?.time),
      );
    }

    if (sortBy === "priceLow") {
      result.sort(
        (a, b) =>
          getPrice(a?.price) -
          getPrice(b?.price),
      );
    }

    if (sortBy === "priceHigh") {
      result.sort(
        (a, b) =>
          getPrice(b?.price) -
          getPrice(a?.price),
      );
    }

    return result;
  }, [
    searchText,
    selectedCategory,
    selectedFilter,
    sortBy,
  ]);

  /* ==========================================================
     CLEAR ALL
  ========================================================== */

  const clearAll = () => {
    setSearchText("");

    setSelectedCategory("All");

    setSelectedCategoryId("");

    setSelectedFilter("All");

    setSortBy("default");
  };

  /* ==========================================================
     OPEN FILTER
  ========================================================== */

  const openFilter = () => {
    setTempFilter(selectedFilter);

    setTempSort(sortBy);

    setShowFilterModal(true);
  };

  /* ==========================================================
     APPLY FILTER
  ========================================================== */

  const applyFilter = () => {
    setSelectedFilter(tempFilter);

    setSortBy(tempSort);

    setShowFilterModal(false);
  };

  /* ==========================================================
     OPEN RESTAURANT
  ========================================================== */

  const openRestaurant = (restaurant) => {
    if (!restaurant?.id) {
      return;
    }

    router.push({
      pathname: "/Restaurant/[id]",
      params: {
        id: String(restaurant.id),
      },
    });
  };

  /* ==========================================================
     RESTAURANT CARD
  ========================================================== */

  const renderRestaurant = (restaurant) => {
    const favorite = favorites.includes(
      restaurant.id,
    );

    return (
      <TouchableOpacity
        key={String(restaurant.id)}
        activeOpacity={0.92}
        style={styles.restaurantCard}
        onPress={() =>
          openRestaurant(restaurant)
        }
      >
        {/* IMAGE */}

        <View style={styles.imageContainer}>
          <Image
            source={restaurant.image}
            style={styles.restaurantImage}
            resizeMode="cover"
          />

          {/* OFFER */}

          {restaurant.offer && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>
                {restaurant.offer}
              </Text>
            </View>
          )}

          {/* FAVORITE */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.favoriteButton}
            onPress={(event) => {
              event.stopPropagation?.();

              toggleFavorite(
                restaurant.id,
              );
            }}
          >
            <Ionicons
              name={
                favorite
                  ? "heart"
                  : "heart-outline"
              }
              size={21}
              color={
                favorite
                  ? Colors.error
                  : Colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        {/* DETAILS */}

        <View style={styles.restaurantDetails}>
          <View style={styles.nameRow}>
            <Text
              style={styles.restaurantName}
              numberOfLines={1}
            >
              {restaurant.name}
            </Text>

            <View style={styles.ratingBadge}>
              <Ionicons
                name="star"
                size={11}
                color={Colors.white}
              />

              <Text style={styles.ratingText}>
                {restaurant.rating || "—"}
              </Text>
            </View>
          </View>

          <Text
            style={styles.cuisine}
            numberOfLines={1}
          >
            {restaurant.cuisine ||
              "Various cuisines"}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textSecondary}
              />

              <Text style={styles.infoText}>
                {restaurant.time ||
                  "30-40 min"}
              </Text>
            </View>

            <View style={styles.dot} />

            <Text style={styles.infoText}>
              {restaurant.price ||
                "₹200 for two"}
            </Text>
          </View>

          <View style={styles.cardBottom}>
            <View style={styles.delivery}>
              <Ionicons
                name="bicycle-outline"
                size={15}
                color={Colors.textSecondary}
              />

              <Text style={styles.deliveryText}>
                Free delivery
              </Text>
            </View>

            <Text style={styles.reviews}>
              {restaurant.reviews || 0} ratings
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ==========================================================
     EMPTY
  ========================================================== */

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="restaurant-outline"
            size={42}
            color={Colors.textMuted}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No restaurants found
        </Text>

        <Text style={styles.emptyDescription}>
          We couldn't find restaurants
          matching your search or filters.
        </Text>

        <TouchableOpacity
          style={styles.clearButton}
          activeOpacity={0.85}
          onPress={clearAll}
        >
          <Text style={styles.clearButtonText}>
            Clear Filters
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          Colors.background
        }
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
                color={
                  Colors.primary ||
                  "#E85D04"
                }
              />
            </View>

            <View>
              <Text style={styles.deliverText}>
                Delivering to
              </Text>

              <View style={styles.locationRow}>
                <Text style={styles.location}>
                  Hitech City
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={
                    Colors.textPrimary
                  }
                />
              </View>

              <Text style={styles.city}>
                Hyderabad
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/Profile")
            }
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={
                Colors.textPrimary
              }
            />
          </TouchableOpacity>
        </View>

        {/* TITLE */}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Explore
          </Text>

          <Text style={styles.subtitle}>
            Discover the best food near you
          </Text>
        </View>

        {/* SEARCH */}

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={20}
              color={
                Colors.textSecondary
              }
            />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search restaurants or food"
              placeholderTextColor={
                Colors.textMuted
              }
              style={styles.searchInput}
            />

            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  setSearchText("")
                }
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={
                    Colors.textMuted
                  }
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={openFilter}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* ====================================================
            CATEGORIES
        ==================================================== */}

        <View style={styles.sectionHeader}>
          <View style={styles.categoryTitleRow}>
            <Text style={styles.sectionTitle}>
              Eat what makes you happy
            </Text>

            {categoriesLoading && (
              <ActivityIndicator
                size="small"
                color={
                  Colors.primary ||
                  "#E85D04"
                }
              />
            )}
          </View>

          {categoriesError ? (
            <TouchableOpacity
              onPress={loadCategories}
              style={styles.retryCategory}
            >
              <Text style={styles.retryCategoryText}>
                Unable to load categories. Tap to retry.
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.categoryList
          }
        >
          {categories.map((category) => {
            const active =
              normalize(
                selectedCategory,
              ) ===
              normalize(
                category.name,
              );

            return (
              <TouchableOpacity
                key={String(category.id)}
                activeOpacity={0.85}
                style={styles.categoryItem}
                onPress={() =>
                  selectCategory(
                    category.name,
                    category.id,
                  )
                }
              >
                <View
                  style={[
                    styles.categoryImageBox,
                    active &&
                      styles.categoryImageBoxActive,
                  ]}
                >
                  <Image
                    source={
                      category.image
                    }
                    style={
                      styles.categoryImage
                    }
                    resizeMode="cover"
                  />
                </View>

                <Text
                  style={[
                    styles.categoryText,
                    active &&
                      styles.categoryTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FILTER CHIPS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.chipsContainer
          }
        >
          {[
            "All",
            "Pure Veg",
            "Rating 4.0+",
            "Fast Delivery",
            "Offers",
          ].map((filter) => {
            const active =
              selectedFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.85}
                style={[
                  styles.chip,
                  active &&
                    styles.activeChip,
                ]}
                onPress={() =>
                  setSelectedFilter(
                    filter,
                  )
                }
              >
                {filter !== "All" && (
                  <Ionicons
                    name={
                      filter ===
                      "Pure Veg"
                        ? "leaf-outline"
                        : filter ===
                            "Rating 4.0+"
                          ? "star-outline"
                          : filter ===
                              "Fast Delivery"
                            ? "flash-outline"
                            : "pricetag-outline"
                    }
                    size={14}
                    color={
                      active
                        ? Colors.white
                        : Colors.gold
                    }
                  />
                )}

                <Text
                  style={[
                    styles.chipText,
                    active &&
                      styles.activeChipText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* RESTAURANT HEADER */}

        <View style={styles.restaurantHeader}>
          <View>
            <Text style={styles.restaurantTitle}>
              Top restaurants near you
            </Text>

            <Text style={styles.resultText}>
              {filteredRestaurants.length} restaurants
            </Text>
          </View>

          <TouchableOpacity
            style={styles.sortButton}
            activeOpacity={0.8}
            onPress={openFilter}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={17}
              color={
                Colors.textSecondary
              }
            />

            <Text style={styles.sortText}>
              Sort
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESTAURANTS */}

        <View style={styles.restaurantList}>
          {filteredRestaurants.length > 0
            ? filteredRestaurants.map(
                renderRestaurant,
              )
            : renderEmpty()}
        </View>

        {/* POPULAR CUISINES */}

        <View style={styles.popularHeader}>
          <Text style={styles.sectionTitle}>
            Popular cuisines
          </Text>

          <TouchableOpacity
            onPress={() =>
              selectCategory("All")
            }
          >
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.popularList
          }
        >
          {popularCuisines.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.popularCard}
              onPress={() =>
                selectCategory(
                  item.name,
                )
              }
            >
              <Image
                source={item.image}
                style={
                  styles.popularImage
                }
                resizeMode="cover"
              />

              <Text
                style={
                  styles.popularName
                }
              >
                {item.name}
              </Text>

              <Text
                style={
                  styles.popularPlaces
                }
              >
                {item.places}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ====================================================
          FILTER MODAL
      ==================================================== */}

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowFilterModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Filters & Sort
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowFilterModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={
                    Colors.textPrimary
                  }
                />
              </TouchableOpacity>
            </View>

            {/* FILTER */}

            <Text style={styles.modalHeading}>
              Filter by
            </Text>

            {[
              "All",
              "Pure Veg",
              "Rating 4.0+",
              "Fast Delivery",
              "Offers",
            ].map((filter) => {
              const active =
                tempFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  style={styles.modalOption}
                  onPress={() =>
                    setTempFilter(
                      filter,
                    )
                  }
                >
                  <View
                    style={[
                      styles.radio,
                      active &&
                        styles.radioActive,
                    ]}
                  >
                    {active && (
                      <View
                        style={
                          styles.radioDot
                        }
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.modalOptionText,
                      active &&
                        styles.modalOptionTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}

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
              const active =
                tempSort ===
                sort.value;

              return (
                <TouchableOpacity
                  key={sort.value}
                  style={styles.modalOption}
                  onPress={() =>
                    setTempSort(
                      sort.value,
                    )
                  }
                >
                  <View
                    style={[
                      styles.radio,
                      active &&
                        styles.radioActive,
                    ]}
                  >
                    {active && (
                      <View
                        style={
                          styles.radioDot
                        }
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.modalOptionText,
                      active &&
                        styles.modalOptionTextActive,
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
                style={
                  styles.clearModalButton
                }
                onPress={() => {
                  setTempFilter("All");
                  setTempSort("default");
                }}
              >
                <Text
                  style={
                    styles.clearModalText
                  }
                >
                  Clear
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.applyModalButton
                }
                onPress={
                  applyFilter
                }
              >
                <Text
                  style={
                    styles.applyModalText
                  }
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const makeStyles = (Colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    /* HEADER */

    header: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    locationWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },

    locationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        isDark
          ? Colors.surface
          : Colors.backgroundElement,
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 10,
    },

    deliverText: {
      fontFamily:
        Fonts.regular,
      fontSize: 10,
      color:
        Colors.textSecondary,
      marginBottom: 2,
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    location: {
      fontFamily:
        Fonts.bold,
      fontSize: 15,
      color:
        Colors.textPrimary,
    },

    city: {
      fontFamily:
        Fonts.regular,
      fontSize: 14,
      color:
        Colors.textSecondary,
      marginTop: 2,
    },

    profileButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        Colors.surface,
      justifyContent:
        "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        Colors.border,
    },

    /* TITLE */

    titleContainer: {
      paddingHorizontal: 18,
      marginTop: 14,
    },

    title: {
      fontFamily:
        Fonts.bold,
      fontSize: 30,
      color:
        Colors.textPrimary,
      letterSpacing: -0.5,
    },

    subtitle: {
      fontFamily:
        Fonts.regular,
      fontSize: 14,
      color:
        Colors.textSecondary,
      marginTop: 4,
    },

    /* SEARCH */

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
      backgroundColor:
        Colors.surface,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        Colors.border,
    },

    searchInput: {
      flex: 1,
      fontFamily:
        Fonts.regular,
      fontSize: 13,
      color:
        Colors.textPrimary,
      marginLeft: 9,
      paddingVertical: 0,
    },

    filterButton: {
      width: 52,
      height: 52,
      borderRadius: 15,
      backgroundColor:
        Colors.primary ||
        "#E85D04",
      justifyContent:
        "center",
      alignItems: "center",
      elevation: 3,
    },

    /* SECTION */

    sectionHeader: {
      paddingHorizontal: 18,
      marginTop: 26,
      marginBottom: 14,
    },

    categoryTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    sectionTitle: {
      fontFamily:
        Fonts.bold,
      fontSize: 24,
      color:
        Colors.textPrimary,
      letterSpacing: -0.2,
    },

    retryCategory: {
      marginTop: 6,
    },

    retryCategoryText: {
      fontFamily:
        Fonts.medium,
      fontSize: 11,
      color:
        Colors.primary ||
        "#E85D04",
    },

    /* CATEGORY */

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
      backgroundColor:
        isDark
          ? Colors.surface
          : Colors.backgroundElement,
      borderWidth: 2,
      borderColor:
        "transparent",
    },

    categoryImageBoxActive: {
      borderColor:
        Colors.primary ||
        "#E85D04",
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
      fontFamily:
        Fonts.medium,
      fontSize: 14,
      color:
        Colors.textPrimary,
      textAlign: "center",
    },

    categoryTextActive: {
      color:
        Colors.primary ||
        "#E85D04",
      fontFamily:
        Fonts.bold,
    },

    /* FILTER CHIPS */

    chipsContainer: {
      paddingHorizontal: 18,
      paddingTop: 21,
      gap: 8,
    },

    chip: {
      height: 36,
      paddingHorizontal: 13,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        Colors.border,
      backgroundColor:
        Colors.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 5,
    },

    activeChip: {
      backgroundColor:
        Colors.primary ||
        "#E85D04",
      borderColor:
        Colors.primary ||
        "#E85D04",
    },

    chipText: {
      fontFamily:
        Fonts.bold,
      fontSize: 14,
      color:
        Colors.textPrimary,
    },

    activeChipText: {
      color:
        Colors.white,
      fontFamily:
        Fonts.semiBold,
    },

    /* RESTAURANT HEADER */

    restaurantHeader: {
      marginTop: 27,
      paddingHorizontal: 18,
      marginBottom: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    restaurantTitle: {
      fontFamily:
        Fonts.bold,
      fontSize: 24,
      color:
        Colors.textPrimary,
      letterSpacing: -0.2,
    },

    resultText: {
      fontFamily:
        Fonts.regular,
      fontSize: 12,
      color:
        Colors.textSecondary,
      marginTop: 4,
    },

    sortButton: {
      height: 35,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor:
        Colors.surface,
      borderWidth: 1,
      borderColor:
        Colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 5,
    },

    sortText: {
      fontFamily:
        Fonts.semiBold,
      fontSize: 11,
      color:
        Colors.textSecondary,
    },

    /* RESTAURANT LIST */

    restaurantList: {
      paddingHorizontal: 18,
    },

    /* RESTAURANT CARD */

    restaurantCard: {
      backgroundColor:
        Colors.card,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        Colors.border,
      marginBottom: 18,
      elevation: 5,
    },

    imageContainer: {
      height: 195,
      width: "100%",
      position: "relative",
      backgroundColor:
        Colors.card,
    },

    restaurantImage: {
      width: "100%",
      height: "100%",
    },

    offerBadge: {
      position: "absolute",
      left: 12,
      bottom: 12,
      backgroundColor:
        "#D84315",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
    },

    offerText: {
      color: "#FFFFFF",
      fontFamily:
        Fonts.bold,
      fontSize: 10,
      letterSpacing: 0.2,
    },

    favoriteButton: {
      position: "absolute",
      right: 12,
      top: 12,
      width: 39,
      height: 39,
      borderRadius: 20,
      backgroundColor:
        "rgba(255,255,255,0.96)",
      alignItems: "center",
      justifyContent:
        "center",
      elevation: 2,
    },

    /* DETAILS */

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
      fontFamily:
        Fonts.bold,
      fontSize: 20,
      color:
        Colors.textPrimary,
      letterSpacing: -0.2,
      marginRight: 8,
    },

    ratingBadge: {
      backgroundColor:
        "#00420f",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 3,
    },

    ratingText: {
      color: "#FFFFFF",
      fontFamily:
        Fonts.bold,
      fontSize: 15,
    },

    cuisine: {
      marginTop: 6,
      fontFamily:
        Fonts.regular,
      fontSize: 17,
      color:
        Colors.logoGold,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },

    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    infoText: {
      fontFamily:
        Fonts.bold,
      fontSize: 15,
      color:
        Colors.success,
    },

    dot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor:
        Colors.divider,
      marginHorizontal: 8,
    },

    cardBottom: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor:
        Colors.divider,
      flexDirection: "row",
      alignItems: "center",
    },

    delivery: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    deliveryText: {
      fontFamily:
        Fonts.medium,
      fontSize: 14,
      color:
        Colors.textPrimary,
    },

    reviews: {
      marginLeft: "auto",
      fontFamily:
        Fonts.regular,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },

    /* EMPTY */

    emptyContainer: {
      alignItems: "center",
      justifyContent:
        "center",
      paddingVertical: 55,
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        Colors.backgroundElement,
      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      fontFamily:
        Fonts.bold,
      fontSize: 18,
      color:
        Colors.textPrimary,
      marginTop: 16,
    },

    emptyDescription: {
      fontFamily:
        Fonts.regular,
      fontSize: 12,
      color:
        Colors.textSecondary,
      textAlign: "center",
      marginTop: 7,
      lineHeight: 19,
    },

    clearButton: {
      marginTop: 18,
      backgroundColor:
        Colors.primary ||
        "#E85D04",
      paddingHorizontal: 23,
      paddingVertical: 11,
      borderRadius: 11,
    },

    clearButtonText: {
      color: "#FFFFFF",
      fontFamily:
        Fonts.bold,
      fontSize: 12,
    },

    /* POPULAR CUISINES */

    popularHeader: {
      paddingHorizontal: 18,
      marginTop: 12,
      marginBottom: 14,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    viewAll: {
      fontFamily:
        Fonts.bold,
      fontSize: 14,
      color:
        Colors.primary ||
        "#E85D04",
    },

    popularList: {
      paddingHorizontal: 18,
      gap: 12,
    },

    popularCard: {
      width: 145,
      borderRadius: 15,
      backgroundColor:
        Colors.card,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        Colors.border,
      paddingBottom: 11,
      elevation: 2,
    },

    popularImage: {
      width: "100%",
      height: 100,
    },

    popularName: {
      fontFamily:
        Fonts.bold,
      fontSize: 14,
      color:
        Colors.textPrimary,
      paddingHorizontal: 10,
      marginTop: 9,
    },

    popularPlaces: {
      fontFamily:
        Fonts.regular,
      fontSize: 13,
      color:
        Colors.textSecondary,
      paddingHorizontal: 10,
      marginTop: 3,
    },

    /* MODAL */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "flex-end",
    },

    modal: {
      backgroundColor:
        Colors.surface,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 20,
    },

    modalTitle: {
      fontFamily:
        Fonts.bold,
      fontSize: 21,
      color:
        Colors.textPrimary,
    },

    modalHeading: {
      fontFamily:
        Fonts.bold,
      fontSize: 14,
      color:
        Colors.textPrimary,
      marginBottom: 8,
    },

    modalOption: {
      minHeight: 43,
      flexDirection: "row",
      alignItems: "center",
    },

    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor:
        Colors.border,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    radioActive: {
      borderColor:
        Colors.primary ||
        "#E85D04",
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor:
        Colors.primary ||
        "#E85D04",
    },

    modalOptionText: {
      fontFamily:
        Fonts.regular,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },

    modalOptionTextActive: {
      color:
        Colors.primary ||
        "#E85D04",
      fontFamily:
        Fonts.semiBold,
    },

    modalButtons: {
      flexDirection: "row",
      gap: 10,
      marginTop: 22,
    },

    clearModalButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        Colors.border,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        Colors.surface,
    },

    clearModalText: {
      color:
        Colors.textPrimary,
      fontFamily:
        Fonts.bold,
      fontSize: 13,
    },

    applyModalButton: {
      flex: 2,
      height: 48,
      borderRadius: 12,
      backgroundColor:
        Colors.primary ||
        "#E85D04",
      alignItems: "center",
      justifyContent:
        "center",
    },

    applyModalText: {
      color: "#FFFFFF",
      fontFamily:
        Fonts.bold,
      fontSize: 13,
    },
  });