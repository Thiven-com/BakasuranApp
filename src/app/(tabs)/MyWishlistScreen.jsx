import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

// ============================================================
// RESTAURANT DATA
// ============================================================

const initialRestaurants = [
  {
    id: "1",
    name: "Spice House",
    image: require("../../../assets/images/spice_house.jpg"),
    cuisine: "Biryani • North Indian • Chinese",
    rating: "4.5",
    time: "30-40 mins",
    location: "Hitech City, Hyderabad",
    offer: "20% OFF",
    price: "₹250 for two",
  },
  {
    id: "2",
    name: "Pizza Planet",
    image: require("../../../assets/images/pizza_planet.jpg"),
    cuisine: "Pizza • Italian • Fast Food",
    rating: "4.2",
    time: "25-35 mins",
    location: "Madhapur, Hyderabad",
    offer: "15% OFF",
    price: "₹300 for two",
  },
  {
    id: "3",
    name: "Burger Mania",
    image: require("../../../assets/images/burger_mania.jpg"),
    cuisine: "Burgers • Fast Food • Beverages",
    rating: "4.3",
    time: "20-30 mins",
    location: "Kondapur, Hyderabad",
    offer: "10% OFF",
    price: "₹250 for two",
  },
  {
    id: "4",
    name: "Udupi Ruchi",
    image: require("../../../assets/images/south_indian.png"),
    cuisine: "South Indian • Breakfast • Fast Food",
    rating: "4.4",
    time: "15-25 mins",
    location: "Gachibowli, Hyderabad",
    offer: "25% OFF",
    price: "₹180 for two",
  },
  {
    id: "5",
    name: "China Town",
    image: require("../../../assets/images/chinese.png"),
    cuisine: "Chinese • Asian • Thai",
    rating: "4.1",
    time: "25-35 mins",
    location: "KPHB, Hyderabad",
    offer: "30% OFF",
    price: "₹220 for two",
  },
];

// ============================================================
// DISH DATA
// ============================================================

const initialDishes = [
  {
    id: "1",
    name: "Chicken Biryani",
    restaurant: "Spice House",
    image: require("../../../assets/images/chicken_biryani.jpg"),
    rating: "4.8",
    price: "₹249",
    oldPrice: "₹299",
    time: "25 min",
    isVeg: false,
  },
  {
    id: "2",
    name: "Paneer Special",
    restaurant: "Spice House",
    image: require("../../../assets/images/paneer.jpg"),
    rating: "4.6",
    price: "₹199",
    oldPrice: "₹249",
    time: "25 min",
    isVeg: true,
  },
  {
    id: "3",
    name: "Fried Chicken",
    restaurant: "Crispy Bowl",
    image: require("../../../assets/images/fried_chicken.jpg"),
    rating: "4.7",
    price: "₹279",
    oldPrice: "₹329",
    time: "30 min",
    isVeg: false,
  },
  {
    id: "4",
    name: "Veg Special",
    restaurant: "Food Paradise",
    image: require("../../../assets/images/veg_specials.jpg"),
    rating: "4.5",
    price: "₹179",
    oldPrice: "₹219",
    time: "20 min",
    isVeg: true,
  },
  {
    id: "5",
    name: "Ice Cream",
    restaurant: "Sweet Corner",
    image: require("../../../assets/images/ice_cream.jpg"),
    rating: "4.8",
    price: "₹149",
    oldPrice: "₹179",
    time: "15 min",
    isVeg: true,
  },
];

// ============================================================
// WISHLIST SCREEN
// ============================================================

const Wishlist = () => {
  const [activeTab, setActiveTab] = useState("restaurants");

  const [restaurants, setRestaurants] = useState(initialRestaurants);

  const [dishes, setDishes] = useState(initialDishes);

  // ==========================================================
  // REMOVE RESTAURANT
  // ==========================================================

  const removeRestaurant = (id) => {
    setRestaurants((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================================
  // REMOVE DISH
  // ==========================================================

  const removeDish = (id) => {
    setDishes((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================================
  // CLEAR ALL
  // ==========================================================

  const clearAll = () => {
    const count =
      activeTab === "restaurants" ? restaurants.length : dishes.length;

    if (count === 0) {
      return;
    }

    Alert.alert(
      "Clear Wishlist",
      `Remove all saved ${
        activeTab === "restaurants" ? "restaurants" : "dishes"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            if (activeTab === "restaurants") {
              setRestaurants([]);
            } else {
              setDishes([]);
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // RESTAURANT CARD
  // ==========================================================

  const renderRestaurant = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/restaurant/${item.id}`)}
      >
        {/* IMAGE */}

        <View style={styles.restaurantImageContainer}>
          <Image
            source={item.image}
            style={styles.restaurantImage}
            resizeMode="cover"
          />

          {/* OFFER */}

          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>{item.offer}</Text>
          </View>
        </View>

        {/* DETAILS */}

        <View style={styles.restaurantDetails}>
          <View style={styles.restaurantTopRow}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.name}
            </Text>

            <TouchableOpacity
              style={styles.heartButton}
              onPress={(event) => {
                event.stopPropagation();
                removeRestaurant(item.id);
              }}
            >
              <Ionicons name="heart" size={23} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.cuisine} numberOfLines={1}>
            {item.cuisine}
          </Text>

          {/* RATING + TIME */}

          <View style={styles.ratingTimeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={Colors.white} />

              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            <View style={styles.dot}>
              <View style={styles.dotCircle} />
            </View>

            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          {/* LOCATION */}

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.textSecondary} />

            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* PRICE */}

          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================================
  // DISH CARD
  // ==========================================================

  const renderDish = ({ item }) => {
    return (
      <TouchableOpacity style={styles.dishCard} activeOpacity={0.9}>
        {/* IMAGE */}

        <View style={styles.dishImageContainer}>
          <Image
            source={item.image}
            style={styles.dishImage}
            resizeMode="cover"
          />

          {/* VEG INDICATOR */}

          <View
            style={[
              styles.vegIndicator,
              {
                borderColor: item.isVeg ? Colors.success : Colors.primary,
              },
            ]}
          >
            <View
              style={[
                styles.vegDot,
                {
                  backgroundColor: item.isVeg ? Colors.success : Colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* DISH DETAILS */}

        <View style={styles.dishDetails}>
          <View style={styles.dishTopRow}>
            <Text style={styles.dishName} numberOfLines={1}>
              {item.name}
            </Text>

            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => removeDish(item.id)}
            >
              <Ionicons name="heart" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.dishRestaurant} numberOfLines={1}>
            {item.restaurant}
          </Text>

          <View style={styles.dishInfoRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={Colors.white} />

              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            <Text style={styles.dishTime}>• {item.time}</Text>
          </View>

          <View style={styles.dishBottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.dishPrice}>{item.price}</Text>

              <Text style={styles.dishOldPrice}>{item.oldPrice}</Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => Alert.alert("Added", `${item.name} added to cart`)}
            >
              <Ionicons name="add" size={18} color={Colors.white} />

              <Text style={styles.addText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  const renderEmpty = () => {
    const isRestaurant = activeTab === "restaurants";

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name={isRestaurant ? "heart-outline" : "fast-food-outline"}
            size={55}
            color={Colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {isRestaurant ? "No saved restaurants" : "No saved dishes"}
        </Text>

        <Text style={styles.emptyDescription}>
          {isRestaurant
            ? "Save your favorite restaurants here and find them quickly whenever you are hungry."
            : "Save delicious dishes here and order them whenever your cravings hit."}
        </Text>

        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/explore")}
          activeOpacity={0.85}
        >
          <Text style={styles.exploreButtonText}>EXPLORE FOOD</Text>

          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  // ==========================================================
  // CURRENT COUNT
  // ==========================================================

  const currentCount =
    activeTab === "restaurants" ? restaurants.length : dishes.length;

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <View style={styles.container}>
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Wishlist</Text>

          <Text style={styles.headerSubtitle}>
            {currentCount} saved {currentCount === 1 ? "item" : "items"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAll}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* ====================================================
          TABS
      ==================================================== */}

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "restaurants" && styles.activeTab]}
          onPress={() => setActiveTab("restaurants")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "restaurants" && styles.activeTabText,
            ]}
          >
            Restaurants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "dishes" && styles.activeTab]}
          onPress={() => setActiveTab("dishes")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "dishes" && styles.activeTabText,
            ]}
          >
            Dishes
          </Text>
        </TouchableOpacity>
      </View>

      {/* ====================================================
          LIST
      ==================================================== */}

      {activeTab === "restaurants" ? (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            restaurants.length === 0 && styles.emptyListContent,
          ]}
        />
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id}
          renderItem={renderDish}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            dishes.length === 0 && styles.emptyListContent,
          ]}
        />
      )}
    </View>
  );
};

export default Wishlist;

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    height: 82,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    color: Colors.white,
    fontFamily: Fonts.extraBold,
    fontSize: 20,
  },

  headerSubtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 10,
    marginTop: 3,
  },

  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 3,
  },

  clearText: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontSize: 10,
  },

  // ==========================================================
  // TABS
  // ==========================================================

  tabsContainer: {
    height: 52,
    marginHorizontal: 15,
    marginTop: 14,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    overflow: "hidden",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
  },

  activeTab: {
    backgroundColor: Colors.primary,
  },

  tabText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },

  activeTabText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
  },

  // ==========================================================
  // LIST
  // ==========================================================

  listContent: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 30,
  },

  // ==========================================================
  // RESTAURANT CARD
  // ==========================================================

  restaurantCard: {
    minHeight: 190,
    marginBottom: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    overflow: "hidden",
  },

  restaurantImageContainer: {
    width: 125,
    height: 168,
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
  },

  restaurantImage: {
    width: "100%",
    height: "100%",
  },

  offerBadge: {
    position: "absolute",
    left: 7,
    bottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },

  offerText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 9,
  },

  restaurantDetails: {
    flex: 1,
    paddingLeft: 11,
    paddingTop: 4,
  },

  restaurantTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  restaurantName: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },

  heartButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  cuisine: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 10,
    marginTop: 5,
  },

  ratingTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  ratingBadge: {
    minWidth: 48,
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: "rgba(34,197,94,0.18)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  ratingText: {
    color: Colors.success,
    fontFamily: Fonts.bold,
    fontSize: 10,
    marginLeft: 4,
  },

  dot: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  dotCircle: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },

  timeText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
  },

  locationText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginLeft: 5,
  },

  priceText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginTop: 9,
  },

  // ==========================================================
  // DISH CARD
  // ==========================================================

  dishCard: {
    minHeight: 145,
    marginBottom: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
  },

  dishImageContainer: {
    width: 125,
    height: 125,
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
  },

  dishImage: {
    width: "100%",
    height: "100%",
  },

  vegIndicator: {
    position: "absolute",
    left: 7,
    top: 7,
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  dishDetails: {
    flex: 1,
    paddingLeft: 11,
  },

  dishTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dishName: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },

  dishRestaurant: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginTop: 4,
  },

  dishInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  dishTime: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginLeft: 7,
  },

  dishBottomRow: {
    flex: 1,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  dishPrice: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },

  dishOldPrice: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 9,
    textDecorationLine: "line-through",
    marginLeft: 6,
  },

  addButton: {
    height: 32,
    minWidth: 62,
    paddingHorizontal: 9,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 9,
    marginLeft: 3,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingBottom: 80,
  },

  emptyIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,32,40,0.10)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,32,40,0.18)",
  },

  emptyTitle: {
    color: Colors.white,
    fontFamily: Fonts.extraBold,
    fontSize: 20,
    marginTop: 18,
  },

  emptyDescription: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
  },

  exploreButton: {
    height: 45,
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  exploreButtonText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 10,
    marginRight: 7,
  },
});
