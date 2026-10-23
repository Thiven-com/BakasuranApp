import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
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
  getProduct,
  getWishlist,
  toggleWishlist,
} from "../../utils/Function";

// IMPORTANT:
// Restaurant data stays inside ../Restaurant/[id].jsx
import { restaurants } from "../Restaurant/[id]";

/* ============================================================
   CATEGORIES
============================================================ */

const categories = [
  {
    id: "all",
    name: "All",
    image: require("../../../assets/images/all.png"),
  },
  {
    id: "dosa",
    name: "Dosa",
    image: require("../../../assets/images/dosa.png"),
  },
  {
    id: "south-indian",
    name: "South Indian",
    image: require("../../../assets/images/south_indian.png"),
  },
  {
    id: "biryani",
    name: "Biryani",
    image: require("../../../assets/images/biryani.png"),
  },
  {
    id: "idli",
    name: "Idli",
    image: require("../../../assets/images/idli.png"),
  },
  {
    id: "pizza",
    name: "Pizza",
    image: require("../../../assets/images/pizza.png"),
  },
  {
    id: "burgers",
    name: "Burgers",
    image: require("../../../assets/images/burgers.png"),
  },
  {
    id: "chinese",
    name: "Chinese",
    image: require("../../../assets/images/chinese.png"),
  },
  {
    id: "chicken",
    name: "Chicken",
    image: require("../../../assets/images/fried_chicken.jpg"),
  },
  {
    id: "desserts",
    name: "Desserts",
    image: require("../../../assets/images/desserts.png"),
  },
  {
    id: "drinks",
    name: "Drinks",
    image: require("../../../assets/images/drinks.png"),
  },
];

// ============================================================
// POPULAR CUISINES
// ============================================================

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

// Local dish IDs are not backend variant IDs and must not be sent to the API.
const getVariantId = (dish) => {
  const value = dish?.variant_id ?? dish?.variantId;
  const variantId =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : NaN;

  return Number.isSafeInteger(variantId) && variantId > 0 ? variantId : null;
};

// Pulls the saved variant ids out of the GET wishlist response.
// Accepts { data: [...] } or { data: { wishlist | items | dishes | products: [...] } }.
const extractSavedVariantIds = (res) => {
  const data = res?.data;

  const list = Array.isArray(data)
    ? data
    : (data?.wishlist ?? data?.items ?? data?.dishes ?? data?.products ?? []);

  return (Array.isArray(list) ? list : []).map((entry) =>
    String(entry?.variant?.id ?? entry?.variant_id ?? entry?.id),
  );
};

/* ============================================================
   RESTAURANT DATA
============================================================ */

/*
  IMPORTANT:

  restaurants comes directly from:
  app/Restaurant/[id].jsx

  We are NOT creating another restaurant data file.
  We are NOT duplicating restaurant names.
*/

const restaurantList = Object.values(restaurants || {}).map((restaurant) => {
  const menu =
    restaurant?.menu && typeof restaurant.menu === "object"
      ? restaurant.menu
      : {};

  const menuItems = Object.values(menu).flat();

  const allVeg =
    typeof restaurant?.isVeg === "boolean"
      ? restaurant.isVeg
      : menuItems.length > 0 && menuItems.every((item) => item?.isVeg === true);

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

const getProductList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  const products =
    data?.products ??
    data?.product ??
    data?.data?.products ??
    data?.data?.product ??
    data?.data?.data?.products ??
    response?.products ??
    response?.product ??
    [];

  if (Array.isArray(products)) return products;
  return products && typeof products === "object" ? [products] : [];
};

const getProductVariants = (product) => {
  if (Array.isArray(product?.variants)) return product.variants;
  if (product?.variants && typeof product.variants === "object") {
    return [product.variants];
  }
  if (Array.isArray(product?.product_variants)) return product.product_variants;
  if (Array.isArray(product?.variant)) return product.variant;
  if (product?.variant && typeof product.variant === "object") {
    return [product.variant];
  }
  return product?.variant_id != null || product?.variantId != null
    ? [product]
    : [];
};

const getWishlistDishes = (products) => {
  const dishes = [];

  for (const product of products) {
    for (const variant of getProductVariants(product)) {
      const variantId =
        variant?.variant_id ??
        variant?.variantId ??
        (variant !== product ? variant?.id : undefined);
      const id = getVariantId({ variant_id: variantId });

      if (id === null) continue;

      const details = variant?.product ?? product?.product ?? product;
      const image =
        variant?.image_url ??
        variant?.image ??
        details?.image_url ??
        details?.image;

      dishes.push({
        id: String(id),
        variant_id: id,
        name:
          variant?.name ??
          details?.name ??
          details?.product_name ??
          "Food item",
        restaurantName:
          details?.restaurant?.name ??
          details?.restaurant_name ??
          details?.vendor?.name ??
          "Restaurant",
        price:
          variant?.selling_price ??
          variant?.price ??
          details?.selling_price ??
          details?.price,
        image:
          typeof image === "string"
            ? { uri: image }
            : image?.url
              ? { uri: image.url }
              : image,
        isVeg: Boolean(details?.is_veg ?? details?.isVeg ?? details?.veg),
      });
    }
  }

  return dishes;
};

/* ============================================================
   SCREEN
============================================================ */

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const { colors: Colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(Colors, isDark), [Colors, isDark]);

  /* ==========================================================
     PARAMS
  ========================================================== */

  const incomingSearch = typeof params.search === "string" ? params.search : "";

  const incomingCategory =
    typeof params.category === "string" ? params.category : "All";

  /* ==========================================================
     STATE
  ========================================================== */

  const [searchText, setSearchText] = useState(incomingSearch);

  const [selectedCategory, setSelectedCategory] = useState(incomingCategory);

  const [selectedFilter, setSelectedFilter] = useState("All");

  const [sortBy, setSortBy] = useState("default");

  // Restaurant hearts: local only (backend wishlist saves dishes).
  const [favorites, setFavorites] = useState([]);

  // Dish hearts: saved variant ids, synced with the wishlist API.
  const [dishWishlist, setDishWishlist] = useState([]);
  const [wishlistDishes, setWishlistDishes] = useState([]);
  const [pendingWishlistIds, setPendingWishlistIds] = useState([]);
  const [wishlistLoadError, setWishlistLoadError] = useState("");

  const [showFilterModal, setShowFilterModal] = useState(false);

  const [tempFilter, setTempFilter] = useState("All");

  const [tempSort, setTempSort] = useState("default");

  /* ==========================================================
     UPDATE PARAMS
  ========================================================== */

  useEffect(() => {
    if (typeof params.search === "string") {
      setSearchText(params.search);
    }

    if (typeof params.category === "string") {
      setSelectedCategory(params.category);
    }
  }, [params.search, params.category]);

  /* ==========================================================
     LOAD SAVED DISHES FROM WISHLIST API
  ========================================================== */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadWishlistData = async () => {
        const [wishlistResult, productsResult] = await Promise.allSettled([
          getWishlist(),
          getProduct(),
        ]);

        if (!active) return;

        if (wishlistResult.status === "fulfilled") {
          const response = wishlistResult.value;
          const hasSuccessFlag = response?.success != null;
          const requestSucceeded =
            [1, true, "1"].includes(response?.success) ||
            (!hasSuccessFlag &&
              (Array.isArray(response?.data) ||
                Array.isArray(response?.data?.data)));

          if (requestSucceeded) {
            setDishWishlist(extractSavedVariantIds(response));
            setWishlistLoadError("");
          } else if (response?.success !== 9) {
            setWishlistLoadError(
              response?.message || "Unable to load your saved items.",
            );
          }
        } else {
          setWishlistLoadError(
            wishlistResult.reason?.message ||
              "Unable to load your saved items.",
          );
        }

        if (productsResult.status === "fulfilled") {
          const response = productsResult.value;
          if (
            response?.success != null &&
            ![1, true, "1"].includes(response.success)
          ) {
            console.error(
              "EXPLORE PRODUCT LOAD ERROR:",
              response?.message || "Unable to load products.",
            );
            setWishlistDishes([]);
          } else {
            setWishlistDishes(getWishlistDishes(getProductList(response)));
          }
        } else {
          console.error(
            "EXPLORE PRODUCT LOAD ERROR:",
            productsResult.reason?.message || productsResult.reason,
          );
          setWishlistDishes([]);
        }
      };

      loadWishlistData();

      return () => {
        active = false;
      };
    }, []),
  );

  /* ==========================================================
     CATEGORY
  ========================================================== */

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSearchText("");
  };

  /* ==========================================================
     FAVORITE (restaurants, local only)
  ========================================================== */

  const toggleFavorite = (id) => {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  /* ==========================================================
     DISH WISHLIST (POST /api/customer/wishlist/toggle)
  ========================================================== */

  const toggleDishWishlist = async (dish) => {
    const variantId = getVariantId(dish);

    if (variantId === null) {
      Alert.alert(
        "Wishlist",
        "This menu item is not linked to a valid backend variant yet.",
      );
      return;
    }

    const savedVariantId = String(variantId);
    if (pendingWishlistIds.includes(savedVariantId)) return;

    const wasSaved = dishWishlist.includes(savedVariantId);

    const setSavedState = (saved) => {
      setDishWishlist((previous) => {
        const without = previous.filter((item) => item !== savedVariantId);
        return saved ? [...without, savedVariantId] : without;
      });
    };

    // optimistic update
    setSavedState(!wasSaved);
    setPendingWishlistIds((previous) => [...previous, savedVariantId]);

    try {
      const res = await toggleWishlist(variantId);

      if (res?.success === 9) {
        setSavedState(wasSaved);
        router.push("/login");
        return;
      }

      if (![1, true, "1"].includes(res?.success)) {
        setSavedState(wasSaved);
        Alert.alert("Wishlist", res?.message || "Unable to update wishlist.");
      }
    } catch (error) {
      setSavedState(wasSaved);
      Alert.alert("Wishlist", error?.message || "Unable to update wishlist.");
    } finally {
      setPendingWishlistIds((previous) =>
        previous.filter((item) => item !== savedVariantId),
      );
    }
  };

  /* ==========================================================
     FILTERED RESTAURANTS
  ========================================================== */

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurantList];

    /* --------------------------------------------------------
       SEARCH
    -------------------------------------------------------- */

    const search = normalize(searchText);
    const isRestaurantBrowseQuery =
      search === "restaurant" || search === "restaurants";

    if (search && !isRestaurantBrowseQuery) {
      result = result.filter((restaurant) => {
        const name = normalize(restaurant?.name);

        const cuisine = normalize(restaurant?.cuisine);

        const address = normalize(restaurant?.address);

        const categoryText = (restaurant?.categories || [])
          .map(normalize)
          .join(" ");

        const menu =
          restaurant?.menu && typeof restaurant.menu === "object"
            ? restaurant.menu
            : {};

        const foodNames = Object.values(menu)
          .flat()
          .map((item) => normalize(item?.name))
          .join(" ");

        const foodDescriptions = Object.values(menu)
          .flat()
          .map((item) => normalize(item?.description))
          .join(" ");

        return (
          name.includes(search) ||
          cuisine.includes(search) ||
          address.includes(search) ||
          categoryText.includes(search) ||
          foodNames.includes(search) ||
          foodDescriptions.includes(search)
        );
      });
    }

    /* --------------------------------------------------------
       CATEGORY
    -------------------------------------------------------- */

    if (selectedCategory && normalize(selectedCategory) !== "all") {
      const category = normalize(selectedCategory);

      result = result.filter((restaurant) => {
        const cuisineMatch = (restaurant?.categories || []).some((item) => {
          const current = normalize(item);

          return (
            current === category ||
            current.includes(category) ||
            category.includes(current)
          );
        });

        const menu =
          restaurant?.menu && typeof restaurant.menu === "object"
            ? restaurant.menu
            : {};

        const foodMatch = Object.values(menu)
          .flat()
          .some((item) => {
            const itemName = normalize(item?.name);

            const description = normalize(item?.description);

            return (
              itemName.includes(category) || description.includes(category)
            );
          });

        return cuisineMatch || foodMatch;
      });
    }

    /* --------------------------------------------------------
       FILTER
    -------------------------------------------------------- */

    if (selectedFilter === "Pure Veg") {
      result = result.filter((restaurant) => restaurant?.isVeg === true);
    }

    if (selectedFilter === "Rating 4.0+") {
      result = result.filter((restaurant) => Number(restaurant?.rating) >= 4);
    }

    if (selectedFilter === "Fast Delivery") {
      result = result.filter(
        (restaurant) => getFirstMinutes(restaurant?.time) <= 30,
      );
    }

    if (selectedFilter === "Offers") {
      result = result.filter((restaurant) => Boolean(restaurant?.offer));
    }

    /* --------------------------------------------------------
       SORT
    -------------------------------------------------------- */

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
  }, [searchText, selectedCategory, selectedFilter, sortBy]);

  /* ==========================================================
     CLEAR ALL
  ========================================================== */

  const clearAll = () => {
    setSearchText("");
    setSelectedCategory("All");
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
            source={restaurant.image}
            style={styles.restaurantImage}
            resizeMode="cover"
          />

          {/* OFFER */}

          {restaurant.offer && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{restaurant.offer}</Text>
            </View>
          )}

          {/* FAVORITE */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.favoriteButton}
            onPress={(event) => {
              event.stopPropagation?.();
              toggleFavorite(restaurant.id);
            }}
          >
            <Ionicons
              name={favorite ? "heart" : "heart-outline"}
              size={21}
              color={favorite ? Colors.error : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* DETAILS */}

        <View style={styles.restaurantDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {restaurant.name}
            </Text>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={Colors.white} />

              <Text style={styles.ratingText}>{restaurant.rating || "—"}</Text>
            </View>
          </View>

          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine || "Various cuisines"}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textSecondary}
              />

              <Text style={styles.infoText}>
                {restaurant.time || "30-40 min"}
              </Text>
            </View>

            <View style={styles.dot} />

            <Text style={styles.infoText}>
              {restaurant.price || "₹200 for two"}
            </Text>
          </View>

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

        <Text style={styles.emptyTitle}>No restaurants found</Text>

        <Text style={styles.emptyDescription}>
          We couldn't find restaurants matching your search or filters.
        </Text>

        <TouchableOpacity
          style={styles.clearButton}
          activeOpacity={0.85}
          onPress={clearAll}
        >
          <Text style={styles.clearButtonText}>Clear Filters</Text>
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
                color={Colors.primary || "#E85D04"}
              />
            </View>

            <View>
              <Text style={styles.deliverText}>Delivering to</Text>

              <View style={styles.locationRow}>
                <Text style={styles.location}>Hitech City</Text>

                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={Colors.textPrimary}
                />
              </View>

              <Text style={styles.city}>Hyderabad</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
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

            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={openFilter}
          >
            <Ionicons name="options-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* CATEGORIES */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Eat what makes you happy</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active =
              normalize(selectedCategory) === normalize(category.name);

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.85}
                style={styles.categoryItem}
                onPress={() => selectCategory(category.name)}
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
          contentContainerStyle={styles.chipsContainer}
        >
          {["All", "Pure Veg", "Rating 4.0+", "Fast Delivery", "Offers"].map(
            (filter) => {
              const active = selectedFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.85}
                  style={[styles.chip, active && styles.activeChip]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  {filter !== "All" && (
                    <Ionicons
                      name={
                        filter === "Pure Veg"
                          ? "leaf-outline"
                          : filter === "Rating 4.0+"
                            ? "star-outline"
                            : filter === "Fast Delivery"
                              ? "flash-outline"
                              : "pricetag-outline"
                      }
                      size={14}
                      color={active ? Colors.white : Colors.gold}
                    />
                  )}

                  <Text
                    style={[styles.chipText, active && styles.activeChipText]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </ScrollView>

        {/* RESTAURANT HEADER */}

        <View style={styles.restaurantHeader}>
          <View>
            <Text style={styles.restaurantTitle}>Top restaurants near you</Text>

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
              color={Colors.textSecondary}
            />

            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* RESTAURANTS */}

        <View style={styles.restaurantList}>
          {filteredRestaurants.length > 0
            ? filteredRestaurants.map(renderRestaurant)
            : renderEmpty()}
        </View>

        {/* POPULAR DISHES */}

        <View style={styles.dishesHeader}>
          <View>
            <Text style={styles.restaurantTitle}>Popular dishes</Text>
            <Text style={styles.resultText}>
              Explore dishes from our restaurants
            </Text>
            {wishlistLoadError ? (
              <Text style={[styles.resultText, { color: Colors.error }]}>
                Saved items unavailable: {wishlistLoadError}
              </Text>
            ) : null}
          </View>
        </View>

        {wishlistDishes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dishesList}
          >
            {wishlistDishes.map((dish) => {
              const variantId = getVariantId(dish);
              const saved =
                variantId !== null &&
                dishWishlist.includes(String(variantId));

              return (
                <View key={dish.id} style={styles.dishCard}>
                  <View style={styles.dishImageContainer}>
                    {dish.image ? (
                      <Image
                        source={dish.image}
                        style={styles.dishImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.dishImageFallback}>
                        <Ionicons
                          name="fast-food-outline"
                          size={32}
                          color={Colors.textMuted}
                        />
                      </View>
                    )}
                    <View style={styles.dishVegMark}>
                      <View
                        style={[
                          styles.dishVegDot,
                          {
                            backgroundColor: dish.isVeg ? "#16803C" : "#C62828",
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.dishWishlistButton}
                      activeOpacity={0.8}
                      onPress={() => toggleDishWishlist(dish)}
                      disabled={pendingWishlistIds.includes(String(variantId))}
                      accessibilityState={{
                        disabled: pendingWishlistIds.includes(
                          String(variantId),
                        ),
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={
                        saved
                          ? "Remove dish from wishlist"
                          : "Add dish to wishlist"
                      }
                    >
                      <Ionicons
                        name={saved ? "heart" : "heart-outline"}
                        size={21}
                        color={
                          saved
                            ? Colors.error || "#E53935"
                            : Colors.textSecondary || "#777777"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dishDetails}>
                    <Text style={styles.dishName} numberOfLines={1}>
                      {dish.name || "Food item"}
                    </Text>
                    <Text style={styles.dishRestaurant} numberOfLines={1}>
                      {dish.restaurantName}
                    </Text>
                    <View style={styles.dishBottomRow}>
                      <Text style={styles.dishPrice}>
                        {dish.price != null
                          ? `₹${dish.price}`
                          : "Price unavailable"}
                      </Text>
                      <Ionicons
                        name="arrow-forward-circle"
                        size={22}
                        color={Colors.primary || "#E85D04"}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.dishesEmpty}>
            <Text style={styles.resultText}>
              No products with a valid variant are available for wishlist yet.
            </Text>
          </View>
        )}

        {/* POPULAR CUISINES */}

        <View style={styles.popularHeader}>
          <Text style={styles.sectionTitle}>Popular cuisines</Text>

          <TouchableOpacity onPress={() => selectCategory("All")}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularList}
        >
          {popularCuisines.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.popularCard}
              onPress={() => selectCategory(item.name)}
            >
              <Image
                source={item.image}
                style={styles.popularImage}
                resizeMode="cover"
              />

              <Text style={styles.popularName}>{item.name}</Text>

              <Text style={styles.popularPlaces}>{item.places}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>

              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={25} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

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
                      {active && <View style={styles.radioDot} />}
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

            <Text style={[styles.modalHeading, { marginTop: 16 }]}>
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
                    {active && <View style={styles.radioDot} />}
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

/* ============================================================
   STYLES
============================================================ */

const makeStyles = (Colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    /* HEADER */

    header: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
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
      backgroundColor: isDark ? Colors.surface : Colors.backgroundElement,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    deliverText: {
      fontFamily: Fonts.regular,
      fontSize: 10,
      color: Colors.textSecondary,
      marginBottom: 2,
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    location: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: Colors.textPrimary,
    },

    city: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: Colors.textSecondary,
      marginTop: 2,
    },

    profileButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: Colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.border,
    },

    /* TITLE */

    titleContainer: {
      paddingHorizontal: 18,
      marginTop: 14,
    },

    title: {
      fontFamily: Fonts.bold,
      fontSize: 30,
      color: Colors.textPrimary,
      letterSpacing: -0.5,
    },

    subtitle: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: Colors.textSecondary,
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
      fontSize: 13,
      color: Colors.textPrimary,
      marginLeft: 9,
      paddingVertical: 0,
    },

    filterButton: {
      width: 52,
      height: 52,
      borderRadius: 15,
      backgroundColor: Colors.primary || "#E85D04",
      justifyContent: "center",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },

    /* SECTION */

    sectionHeader: {
      paddingHorizontal: 18,
      marginTop: 26,
      marginBottom: 14,
    },

    sectionTitle: {
      fontFamily: Fonts.bold,
      fontSize: 24,
      color: Colors.textPrimary,
      letterSpacing: -0.2,
    },

    /* CATEGORY */

    categoryList: {
      paddingHorizontal: 18,
      gap: 15,
    },

    categoryItem: {
      width: 72,
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
      borderColor: Colors.primary || "#E85D04",
      transform: [{ scale: 1.04 }],
    },

    categoryImage: {
      width: "100%",
      height: "100%",
    },

    categoryText: {
      marginTop: 8,
      fontFamily: Fonts.medium,
      fontSize: 18,
      color: Colors.textPrimary,
      textAlign: "center",
    },

    categoryTextActive: {
      color: Colors.primary || "#E85D04",
      fontFamily: Fonts.bold,
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
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    activeChip: {
      backgroundColor: Colors.primary || "#E85D04",
      borderColor: Colors.primary || "#E85D04",
    },

    chipText: {
      fontFamily: Fonts.bold,
      fontSize: 14,
      color: Colors.textPrimary,
    },

    activeChipText: {
      color: Colors.white,
      fontFamily: Fonts.semiBold,
    },

    /* RESTAURANT HEADER */

    restaurantHeader: {
      marginTop: 27,
      paddingHorizontal: 18,
      marginBottom: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    restaurantTitle: {
      fontFamily: Fonts.bold,
      fontSize: 24,
      color: Colors.textPrimary,
      letterSpacing: -0.2,
    },

    resultText: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: Colors.textSecondary,
      marginTop: 4,
    },

    sortButton: {
      height: 35,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    sortText: {
      fontFamily: Fonts.semiBold,
      fontSize: 11,
      color: Colors.textSecondary,
    },

    /* RESTAURANT LIST */

    restaurantList: {
      paddingHorizontal: 18,
    },

    /* RESTAURANT CARD */

    restaurantCard: {
      backgroundColor: Colors.card,
      borderRadius: 20,
      overflow: "hidden",

      borderWidth: 1,
      borderColor: Colors.border,

      marginBottom: 18,

      elevation: 5,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.35,
      shadowRadius: 8,
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
      letterSpacing: 0.2,
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
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.12,
      shadowRadius: 3,
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
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: Colors.textPrimary,
      letterSpacing: -0.2,
      marginRight: 8,
    },

    ratingBadge: {
      backgroundColor: "#00420f",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },

    ratingText: {
      color: "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    cuisine: {
      marginTop: 6,
      fontFamily: Fonts.regular,
      fontSize: 17,
      color: Colors.logoGold,
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
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: Colors.success,
    },

    dot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: Colors.divider,
      marginHorizontal: 8,
    },

    cardBottom: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: Colors.divider,
      flexDirection: "row",
      alignItems: "center",
    },

    delivery: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    deliveryText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: Colors.textPrimary,
    },

    reviews: {
      marginLeft: "auto",
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: Colors.textSecondary,
    },

    /* EMPTY */

    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 55,
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: Colors.backgroundElement,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: Colors.textPrimary,
      marginTop: 16,
    },

    emptyDescription: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: Colors.textSecondary,
      textAlign: "center",
      marginTop: 7,
      lineHeight: 19,
    },

    clearButton: {
      marginTop: 18,
      backgroundColor: Colors.primary || "#E85D04",
      paddingHorizontal: 23,
      paddingVertical: 11,
      borderRadius: 11,
    },

    clearButtonText: {
      color: "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: 12,
    },

    /* POPULAR DISHES */

    dishesHeader: {
      paddingHorizontal: 18,
      marginTop: 26,
      marginBottom: 13,
    },

    dishesList: {
      paddingHorizontal: 18,
      gap: 12,
    },

    dishCard: {
      width: 205,
      borderRadius: 17,
      overflow: "hidden",
      backgroundColor: Colors.card,
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: 3,
    },

    dishImageContainer: {
      height: 132,
      width: "100%",
      position: "relative",
      backgroundColor: Colors.backgroundElement,
    },

    dishImage: {
      width: "100%",
      height: "100%",
    },

    dishImageFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    dishVegMark: {
      position: "absolute",
      top: 9,
      right: 9,
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#FFFFFF",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    dishVegDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    dishWishlistButton: {
      position: "absolute",
      top: 9,
      right: 36,
      width: 35,
      height: 35,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.96)",
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },

    dishDetails: {
      paddingHorizontal: 11,
      paddingTop: 10,
      paddingBottom: 11,
    },

    dishName: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: Colors.textPrimary,
    },

    dishRestaurant: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: Colors.textSecondary,
      marginTop: 4,
    },

    dishBottomRow: {
      marginTop: 9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    dishPrice: {
      fontFamily: Fonts.bold,
      fontSize: 14,
      color: Colors.success,
    },

    dishesEmpty: {
      paddingHorizontal: 18,
      paddingVertical: 14,
    },

    /* POPULAR CUISINES */

    popularHeader: {
      paddingHorizontal: 18,
      marginTop: 12,
      marginBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    viewAll: {
      fontFamily: Fonts.bold,
      fontSize: 14,
      color: Colors.primary || "#E85D04",
    },

    popularList: {
      paddingHorizontal: 18,
      gap: 12,
    },

    popularCard: {
      width: 145,
      borderRadius: 15,
      backgroundColor: Colors.card,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: Colors.border,
      paddingBottom: 11,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },

    popularImage: {
      width: "100%",
      height: 100,
    },

    popularName: {
      fontFamily: Fonts.bold,
      fontSize: 14,
      color: Colors.textPrimary,
      paddingHorizontal: 10,
      marginTop: 9,
    },

    popularPlaces: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: Colors.textSecondary,
      paddingHorizontal: 10,
      marginTop: 3,
    },

    /* MODAL */

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },

    modal: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },

    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 21,
      color: Colors.textPrimary,
    },

    modalHeading: {
      fontFamily: Fonts.bold,
      fontSize: 14,
      color: Colors.textPrimary,
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
      borderColor: Colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    radioActive: {
      borderColor: Colors.primary || "#E85D04",
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Colors.primary || "#E85D04",
    },

    modalOptionText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: Colors.textSecondary,
    },

    modalOptionTextActive: {
      color: Colors.primary || "#E85D04",
      fontFamily: Fonts.semiBold,
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
      borderColor: Colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.surface,
    },

    clearModalText: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 13,
    },

    applyModalButton: {
      flex: 2,
      height: 48,
      borderRadius: 12,
      backgroundColor: Colors.primary || "#E85D04",
      alignItems: "center",
      justifyContent: "center",
    },

    applyModalText: {
      color: "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: 13,
    },
  });
