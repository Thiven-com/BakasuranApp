import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { restaurants } from "../app/Restaurant/[id]";

const appScreens = [
  {
    name: "Home",
    description: "Home page restaurants and offers",
    route: "/(tabs)/HomeScreen",
    keywords: "main start",
  },
  {
    name: "Explore",
    description: "Browse restaurants, cuisines, and food",
    route: "/(tabs)/ExploreScreen",
    keywords: "browse search food foods dish dishes product products restaurant restaurants",
  },
  {
    name: "Cart",
    description: "Review items before checkout",
    route: "/(tabs)/CartScreen",
    keywords: "basket checkout order",
  },
  {
    name: "Wishlist",
    description: "Your saved restaurants and items",
    route: "/(tabs)/MyWishlistScreen",
    keywords: "saved favorite favourites",
  },
  {
    name: "Profile",
    description: "Your account and personal details",
    route: "/(tabs)/profile",
    keywords: "account user",
  },
  {
    name: "My Orders",
    description: "View your past and current orders",
    route: "/MyOrdersScreen",
    keywords: "order history delivery",
  },
  {
    name: "Offers & Deals",
    description: "Browse available discounts and deals",
    route: "/Offers&DealsScreen",
    keywords: "discount coupon promotion",
  },
  {
    name: "Table Booking",
    description: "Book a table at a restaurant",
    route: "/table-booking",
    keywords: "reservation reserve",
  },
  {
    name: "My Bookings",
    description: "View your restaurant table bookings",
    route: "/my-bookings",
    keywords: "reservation table",
  },
  {
    name: "Addresses",
    description: "Manage your delivery addresses",
    route: "/addresses",
    keywords: "location delivery",
  },
  {
    name: "Payments",
    description: "Manage your payment methods",
    route: "/payments",
    keywords: "payment methods card",
  },
  {
    name: "Notifications",
    description: "View app and order notifications",
    route: "/notifications",
    keywords: "alerts updates",
  },
  {
    name: "Settings",
    description: "Manage your app preferences",
    route: "/settings",
    keywords: "preferences configuration",
  },
  {
    name: "Help & Support",
    description: "Get help with the app or your order",
    route: "/help&support",
    keywords: "help contact assistance",
  },
  {
    name: "Edit Profile",
    description: "Update your account details",
    route: "/editprofile",
    keywords: "account personal information",
  },
  {
    name: "Checkout",
    description: "Review your order and complete checkout",
    route: "/CheckoutScreen",
    keywords: "place order payment",
  },
  {
    name: "Track Order",
    description: "Follow the status of a food delivery",
    route: "/Track-OrderScreen",
    keywords: "delivery tracking status",
  },
  ...[
    "Dosa",
    "South Indian",
    "Biryani",
    "Idli",
    "Pizza",
    "Burgers",
    "Chinese",
    "Chicken",
    "Desserts",
    "Drinks",
  ].map((category) => ({
    name: `${category} Category`,
    description: `Explore restaurants and food in ${category}`,
    route: {
      pathname: "/(tabs)/ExploreScreen",
      params: { category },
    },
    keywords: category,
  })),
];

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const matchesSearch = (query, values) => {
  const searchableText = values.map(normalize).join(" ");
  return query.split(/\s+/).every((word) => searchableText.includes(word));
};

const HomeSearchResults = ({ searchText }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const query = normalize(searchText);

  const { matchedRestaurants, matchedDishes, matchedScreens } = useMemo(() => {
    const allRestaurants = Object.values(restaurants);
    const dishes = allRestaurants.flatMap((restaurant) =>
      Object.values(restaurant.menu ?? {})
        .flat()
        .map((dish) => ({ ...dish, restaurant })),
    );
    const browseAllRestaurants = /^restaurants?$/.test(query);
    const browseAllDishes = /^(food|foods|dish|dishes|product|products)$/.test(
      query,
    );

    const matchedDishes = dishes.filter(
      (dish) =>
        browseAllDishes ||
        matchesSearch(query, [
          dish.name,
          dish.description,
          dish.restaurant.name,
          dish.restaurant.cuisine,
        ]),
    );
    const restaurantsWithMatchingDishes = new Set(
      matchedDishes.map((dish) => dish.restaurant.id),
    );
    const matchedRestaurants = allRestaurants.filter(
      (restaurant) =>
        browseAllRestaurants ||
        matchesSearch(query, [
          restaurant.name,
          restaurant.cuisine,
          restaurant.address,
        ]) ||
        restaurantsWithMatchingDishes.has(restaurant.id),
    );
    const matchedScreens = appScreens.filter((screen) =>
      matchesSearch(query, [screen.name, screen.description, screen.keywords]),
    );

    return { matchedRestaurants, matchedDishes, matchedScreens };
  }, [query]);

  const hasResults =
    matchedRestaurants.length > 0 ||
    matchedDishes.length > 0 ||
    matchedScreens.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Results</Text>

      {!hasResults && (
        <Text style={styles.emptyMessage}>
          No restaurants, dishes, or app pages found for "{searchText.trim()}".
        </Text>
      )}

      {matchedRestaurants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants</Text>
          {matchedRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantRow}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/Restaurant/[id]",
                  params: { id: restaurant.id },
                })
              }
            >
              <Image source={restaurant.image} style={styles.thumbnail} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{restaurant.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {restaurant.cuisine}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {matchedDishes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dishes</Text>
          {matchedDishes.map((dish) => (
            <TouchableOpacity
              key={`${dish.restaurant.id}-${dish.id}`}
              style={styles.restaurantRow}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/Food-Details",
                  params: {
                    itemId: dish.id,
                    restaurantId: dish.restaurant.id,
                  },
                })
              }
            >
              <Image
                source={dish.image ?? dish.restaurant.image}
                style={styles.thumbnail}
              />
              <View style={styles.rowText}>
                <Text style={styles.name}>{dish.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {dish.restaurant.name} · ₹{dish.price}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {matchedScreens.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Pages</Text>
          {matchedScreens.map((screen) => (
            <TouchableOpacity
              key={screen.name}
              style={styles.screenRow}
              activeOpacity={0.8}
              onPress={() => router.push(screen.route)}
            >
              <View style={styles.screenIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.name}>{screen.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {screen.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default HomeSearchResults;

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 10,
    },
    title: {
      color: colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.xxl,
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.semiBold,
      fontSize: Fonts.size.base,
      marginBottom: 10,
    },
    restaurantRow: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 10,
      padding: 10,
    },
    thumbnail: {
      width: 56,
      height: 56,
      borderRadius: 10,
      backgroundColor: colors.surface,
    },
    rowText: {
      flex: 1,
      marginHorizontal: 12,
    },
    name: {
      color: colors.textPrimary,
      fontFamily: Fonts.semiBold,
      fontSize: Fonts.size.md,
      marginBottom: 4,
    },
    description: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.sm,
    },
    screenRow: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: 10,
    },
    screenIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    emptyMessage: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.md,
      lineHeight: 22,
    },
  });
