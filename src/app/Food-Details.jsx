import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { restaurants } from "./Restaurant/[id]";

const SPICE_LEVELS = ["Mild", "Medium", "Spicy"];

export default function FoodDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { itemId, restaurantId } = useLocalSearchParams();
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [quantity, setQuantity] = useState(1);
  const [isFavourite, setIsFavourite] = useState(false);

  const restaurant = restaurants[String(restaurantId)];
  const food = restaurant
    ? Object.values(restaurant.menu)
        .flat()
        .find((item) => item.id === String(itemId))
    : undefined;

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const foodPrice = food?.price ?? 0;
  const totalPrice = foodPrice * quantity;
  const originalPrice = Math.round(foodPrice * 1.27);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const handleAddToCart = () => {
    if (!food) return;
    Alert.alert(
      "Added to Cart",
      `${quantity} × ${food.name}\nSpice Level: ${spiceLevel}\nTotal: ₹${totalPrice}`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/(tabs)/cart") },
      ],
    );
  };

  const handleShare = () => {
    if (!food) return;
    Alert.alert(
      "Share Food",
      `${food.name} - ₹${foodPrice}\n${food.description}`,
    );
  };

  if (!food) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="restaurant-outline"
          size={54}
          color={styles.primaryColor.color}
        />
        <Text style={styles.foodName}>Food item not found</Text>
        <Text style={styles.description}>
          Go back to the restaurant menu and select a food item again.
        </Text>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleBack}>
          <Text style={styles.addToCartText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={isDark === false ? "dark-content" : "light-content"}
        backgroundColor={colors?.background ?? "#080808"}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroContainer}>
          <Image
            source={food.image}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <TouchableOpacity
            style={[styles.roundButton, styles.backButton]}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={27} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roundButton, styles.favouriteButton]}
            onPress={() => setIsFavourite((previous) => !previous)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavourite ? "heart" : "heart-outline"}
              size={27}
              color={isFavourite ? "#FF2028" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.foodName}>{food.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={21} color="#FFC107" />
                <Text style={styles.rating}>{restaurant?.rating ?? "4.5"}</Text>
                <Text style={styles.reviews}>
                  ({restaurant?.reviews ?? "1.2K"} reviews)
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{foodPrice}</Text>
            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>20% OFF</Text>
            </View>
          </View>

          <Text style={styles.description}>{food.description}</Text>

          <View style={styles.customizeCard}>
            <Text style={styles.sectionTitle}>Customize</Text>
            <Text style={styles.optionLabel}>Spice Level</Text>
            <View style={styles.spiceOptions}>
              {SPICE_LEVELS.map((level) => {
                const selected = spiceLevel === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.spiceButton,
                      selected && styles.spiceButtonSelected,
                    ]}
                    onPress={() => setSpiceLevel(level)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.spiceText,
                        selected && styles.spiceTextSelected,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Ionicons name="remove" size={25} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.quantityValueContainer}>
              <Text style={styles.quantityValue}>{quantity}</Text>
            </View>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((value) => value + 1)}
            >
              <Ionicons name="add" size={27} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
            <Text style={styles.addToCartPrice}>₹{totalPrice}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, isDark) => {
  const background = colors?.background ?? "#080808";
  const card = colors?.card ?? "#101010";
  const surface = colors?.surface ?? "#171717";
  const text = colors?.textPrimary ?? colors?.text ?? "#FFFFFF";
  const secondaryText =
    colors?.textSecondary ?? colors?.secondaryText ?? "#B0B0B0";
  const border = colors?.border ?? "#252525";
  const primary = colors?.primary ?? "#FF2028";

  return StyleSheet.create({
    primaryColor: { color: primary },
    screen: { flex: 1, backgroundColor: background },
    scrollContent: { paddingBottom: 24 },
    errorContainer: {
      flex: 1,
      backgroundColor: background,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    heroContainer: {
      width: "100%",
      height: 350,
      position: "relative",
      backgroundColor: "#111111",
    },
    heroImage: { width: "100%", height: "100%" },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.08)",
    },
    roundButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "rgba(12,12,12,0.82)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 48,
    },
    backButton: { left: 18 },
    favouriteButton: { right: 18 },
    detailsCard: {
      marginTop: -2,
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 24,
      backgroundColor: background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      borderWidth: 1,
      borderColor: border,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    titleContainer: { flex: 1, paddingRight: 10 },
    foodName: {
      color: text,
      fontFamily: Fonts.bold,
      fontSize: 27,
      lineHeight: 35,
      textAlign: "left",
      marginTop: 8,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
      gap: 7,
    },
    rating: { color: "#FFC107", fontFamily: Fonts.bold, fontSize: 17 },
    reviews: { color: secondaryText, fontFamily: Fonts.regular, fontSize: 14 },
    shareButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: border,
      alignItems: "center",
      justifyContent: "center",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 22,
      gap: 14,
    },
    currentPrice: { color: text, fontFamily: Fonts.bold, fontSize: 33 },
    originalPrice: {
      color: secondaryText,
      fontFamily: Fonts.medium,
      fontSize: 20,
      textDecorationLine: "line-through",
      marginLeft: 2,
    },
    discountBadge: {
      backgroundColor: primary,
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: 9,
      marginLeft: 2,
    },
    discountText: { color: "#FFFFFF", fontFamily: Fonts.bold, fontSize: 14 },
    description: {
      color: secondaryText,
      fontFamily: Fonts.regular,
      fontSize: 15,
      lineHeight: 24,
      marginTop: 20,
      marginBottom: 22,
      textAlign: "left",
    },
    customizeCard: {
      backgroundColor: card,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: border,
    },
    sectionTitle: {
      color: text,
      fontFamily: Fonts.bold,
      fontSize: 23,
      marginBottom: 17,
    },
    optionLabel: {
      color: secondaryText,
      fontFamily: Fonts.medium,
      fontSize: 16,
      marginBottom: 12,
    },
    spiceOptions: { flexDirection: "row", alignItems: "center", gap: 9 },
    spiceButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 26,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: border,
    },
    spiceButtonSelected: { backgroundColor: primary, borderColor: primary },
    spiceText: { color: text, fontFamily: Fonts.semiBold, fontSize: 15 },
    spiceTextSelected: { color: "#FFFFFF" },
    quantityContainer: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 25,
      marginBottom: 25,
      backgroundColor: surface,
      borderRadius: 35,
      borderWidth: 1,
      borderColor: border,
      overflow: "hidden",
    },
    quantityButton: {
      width: 55,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    quantityValueContainer: {
      width: 58,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark === false ? "#F0F0F0" : "#202020",
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
    },
    quantityValue: { color: text, fontFamily: Fonts.bold, fontSize: 20 },
    addToCartButton: {
      minHeight: 58,
      width: "100%",
      borderRadius: 32,
      backgroundColor: primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      gap: 16,
      elevation: 5,
      shadowColor: primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    addToCartText: { color: "#FFFFFF", fontFamily: Fonts.bold, fontSize: 18 },
    addToCartPrice: { color: "#FFFFFF", fontFamily: Fonts.bold, fontSize: 18 },
  });
};
