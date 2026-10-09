import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
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

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

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
    image: require("../../../assets/images/biryani.png"),
  },
  {
    id: "2",
    name: "South Indian",
    places: "150+ places",
    image: require("../../../assets/images/south_indian.png"),
  },
  {
    id: "3",
    name: "Dosa",
    places: "100+ places",
    image: require("../../../assets/images/dosa.png"),
  },
  {
    id: "4",
    name: "Pizza",
    places: "90+ places",
    image: require("../../../assets/images/pizza.png"),
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

/* ============================================================
   SCREEN
============================================================ */

export default function ExploreScreen() {
  const params = useLocalSearchParams();

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

  const [favorites, setFavorites] = useState([]);

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
     CATEGORY
  ========================================================== */

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSearchText("");
  };

  /* ==========================================================
     FAVORITE
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
     FILTERED RESTAURANTS
  ========================================================== */

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurantList];

    /* --------------------------------------------------------
       SEARCH
    -------------------------------------------------------- */

    const search = normalize(searchText);

    if (search) {
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
              color={favorite ? "#E53935" : "#222"}
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
              <Ionicons name="star" size={11} color="#fff" />

              <Text style={styles.ratingText}>{restaurant.rating || "—"}</Text>
            </View>
          </View>

          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine || "Various cuisines"}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color="#777" />

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
              <Ionicons name="bicycle-outline" size={15} color="#555" />

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
          <Ionicons name="restaurant-outline" size={42} color="#999" />
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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

                <Ionicons name="chevron-down" size={14} color="#222" />
              </View>

              <Text style={styles.city}>Hyderabad</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
            <Ionicons name="person-outline" size={20} color="#222" />
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
            <Ionicons name="search" size={20} color="#777" />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search restaurants or food"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />

            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={19} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={openFilter}
          >
            <Ionicons name="options-outline" size={22} color="#fff" />
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
                      color={active ? "#fff" : "#FFB000"}
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
            <Ionicons name="swap-vertical-outline" size={17} color="#444" />

            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* RESTAURANTS */}

        <View style={styles.restaurantList}>
          {filteredRestaurants.length > 0
            ? filteredRestaurants.map(renderRestaurant)
            : renderEmpty()}
        </View>

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
                <Ionicons name="close" size={25} color="#222" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060808",
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
    backgroundColor: "#FFF3ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  deliverText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: "#f1eded",
    marginBottom: 2,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  location: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "#f5f5f5",
  },

  city: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#f7f7f7",
    marginTop: 2,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  /* TITLE */

  titleContainer: {
    paddingHorizontal: 18,
    marginTop: 14,
  },

  title: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    color: "#ffeaea",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#ffffff",
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
    backgroundColor: "#F7F7F7",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#222222",
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
    color: "#ffffff",
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
    backgroundColor: "#060808",
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
    color: "#f7eded",
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
    borderColor: "#E1E1E1",
    backgroundColor: "#060808",
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
    color: "#ffffff",
  },

  activeChipText: {
    color: "#FFFFFF",
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
    color: "#ffffff",
    letterSpacing: -0.2,
  },

  resultText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
  },

  sortButton: {
    height: 35,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  sortText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: "#444444",
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
    color: "#ffffff",
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
    color: "#ffffff",
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
    color: "#1cf808",
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#999999",
    marginHorizontal: 8,
  },

  cardBottom: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
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
    color: "#ffffff",
  },

  reviews: {
    marginLeft: "auto",
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#999999",
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
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: "#333333",
    marginTop: 16,
  },

  emptyDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#888888",
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
    backgroundColor: "#080606",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
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
    color: "#ffffff",
    paddingHorizontal: 10,
    marginTop: 9,
  },

  popularPlaces: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#ffffff",
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
    backgroundColor: "#FFFFFF",
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
    color: "#f8f5f5",
  },

  modalHeading: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: "#333333",
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
    borderColor: "#AAAAAA",
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
    color: "#555555",
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
    borderColor: "#DDDDDD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  clearModalText: {
    color: "#444444",
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
