import { router } from "expo-router";
import { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const restaurants = [
  {
    id: "1",
    name: "Spice House",
    image: require("../../assets/images/Restaurant1.png"),
    cuisine: "South Indian • Biryani",
    rating: "4.5",
    time: "25–30 min",
  },
  {
    id: "4",
    name: "Crispy Bowl",
    image: require("../../assets/images/Restaurant4.png"),
    cuisine: "Chinese • Fast Food",
    rating: "4.3",
    time: "20–25 min",
  },
  {
    id: "2",
    name: "Pizza Planet",
    image: require("../../assets/images/Restaurant3.png"),
    cuisine: "Pizza • Italian",
    rating: "4.6",
    time: "30–35 min",
  },
];

const RestaurantCard = ({ searchText = "" }) => {
  const { colors } = useTheme();

  const styles = useMemo(() => makeStyles(colors), [colors]);
  const normalizedSearch = searchText.trim().toLowerCase();
  const isRestaurantBrowseQuery =
    normalizedSearch === "restaurant" || normalizedSearch === "restaurants";
  const filteredRestaurants =
    normalizedSearch && !isRestaurantBrowseQuery
      ? restaurants.filter(
          (item) =>
            item.name.toLowerCase().includes(normalizedSearch) ||
            item.cuisine.toLowerCase().includes(normalizedSearch),
        )
      : restaurants;

  const handleRestaurantPress = (item) => {
    router.push({
      pathname: "/Restaurant/[id]",
      params: {
        id: item.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {normalizedSearch ? "Search Results" : "Restaurants Near You"}
      </Text>

      {filteredRestaurants.length === 0 ? (
        <Text style={styles.emptyMessage}>
          No restaurants found for "{searchText.trim()}".
        </Text>
      ) : (
        filteredRestaurants.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleRestaurantPress(item)}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.details}>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.cuisine}>{item.cuisine}</Text>

              <View style={styles.bottomRow}>
                <View style={styles.ratingBox}>
                  <Text style={styles.rating}>★ {item.rating}</Text>
                </View>

                <View style={styles.deliveryTime}>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default RestaurantCard;

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      marginTop: 20,
    },

    title: {
      color: colors.textPrimary ?? colors.text,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.xxl,
      marginBottom: 14,
    },

    emptyMessage: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.md,
      marginBottom: 16,
    },

    card: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border ?? "#333333",
    },

    image: {
      width: "100%",
      height: 190,
    },

    details: {
      padding: 14,
    },

    name: {
      color: colors.textPrimary ?? colors.text,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.xl,
      marginBottom: 5,
    },

    cuisine: {
      color: colors.gold ?? "#FFB800",
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.md,
      marginBottom: 12,
    },

    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    ratingBox: {
      backgroundColor: "#168A3A",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 6,
    },

    rating: {
      color: "#FFFFFF",
      fontFamily: Fonts.semiBold,
      fontSize: Fonts.size.xs,
    },

    deliveryTime: {
      backgroundColor: colors.surface ?? colors.card,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },

    time: {
      color: colors.success ?? "#22C55E",
      fontFamily: Fonts.medium,
      fontSize: Fonts.size.sm,
    },
  });
