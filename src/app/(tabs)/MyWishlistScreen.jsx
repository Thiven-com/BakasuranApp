import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BASE_URL from "../../constants/AppUrls";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";
import {
  getProduct,
  getWishlist,
  removeFromWishlist,
} from "../../utils/Function";

// ============================================================
// RESPONSE MAPPERS
//
// The backend wishlist stores product VARIANTS (dishes).
// The mappers below accept the common Laravel shapes:
//   { success: 1, data: [ ... ] }
//   { success: 1, data: { wishlist: [ ... ] } }
//   { success: 1, data: { items | dishes | products: [ ... ] } }
// and items shaped like { id, variant: {...}, product: {...} }
// or flat objects.
//
// If your dishes show blank fields, open the "wishlist" request in
// the Network tab, copy one item, and adjust mapDish() below.
// ============================================================

const FALLBACK_IMAGE = require("../../../assets/images/Restaurant1.png");

const normalizeImageUri = (image) => {
  const value =
    typeof image === "string"
      ? image
      : (image?.url ?? image?.path ?? image?.image_url ?? image?.image);
  if (typeof value !== "string" || !value.trim()) return null;

  const uri = value.trim();
  if (/^https?:\/\//i.test(uri)) {
    try {
      const parsed = new URL(uri);
      return parsed.pathname !== "/" ? uri : null;
    } catch {
      return null;
    }
  }

  return `${BASE_URL.replace(/\/+$/, "")}/${uri.replace(/^\/+/, "")}`;
};

const formatPrice = (value) =>
  value === undefined || value === null || value === ""
    ? ""
    : `₹${String(value).replace(/^₹/, "")}`;

const extractList = (res, keys) => {
  const data = res?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    if (Array.isArray(data?.data?.[key])) {
      return data.data[key];
    }
  }

  return [];
};

const extractProducts = (res) => {
  const data = res?.data;
  const products = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : (data?.products ??
        data?.product ??
        data?.data?.products ??
        data?.data?.product ??
        res?.products ??
        res?.product ??
        []);

  return Array.isArray(products) ? products : [];
};

const getProductImage = (product, variantId) => {
  if (!product) return null;

  const variants = [
    ...(Array.isArray(product?.variants) ? product.variants : []),
    ...(Array.isArray(product?.product_variants)
      ? product.product_variants
      : []),
  ];
  const matchingVariant = variants.find(
    (variant) =>
      String(variant?.id ?? variant?.variant_id ?? "") === String(variantId),
  );
  const candidates = [
    matchingVariant?.image,
    matchingVariant?.image_url,
    product?.image,
    product?.image_url,
    product?.product_image,
    product?.product_image_url,
    product?.thumbnail,
    product?.thumbnail_url,
    product?.images?.[0]?.image_url,
    product?.images?.[0]?.url,
    product?.images?.[0]?.image,
  ];

  return candidates.map(normalizeImageUri).find(Boolean) ?? null;
};

const mapDish = (entry, products = []) => {
  const variant = entry?.variant ?? entry;
  const product = entry?.product ?? variant?.product ?? entry;

  // id sent to DELETE wishlist/{item}
  const variantId = variant?.id ?? entry?.variant_id ?? entry?.id;
  const matchingProduct = products.find(
    (item) =>
      String(item?.id ?? item?.product_id ?? "") ===
      String(product?.id ?? entry?.product_id ?? ""),
  );
  const imageUri =
    [product?.image, product?.image_url, variant?.image, entry?.image]
      .map(normalizeImageUri)
      .find(Boolean) ?? getProductImage(matchingProduct, variantId);

  return {
    id: String(variantId),
    name:
      product?.name ??
      product?.title ??
      variant?.name ??
      entry?.name ??
      entry?.title ??
      "",
    restaurant:
      product?.restaurant?.name ??
      product?.restaurant_name ??
      product?.vendor?.name ??
      entry?.restaurant_name ??
      product?.category ??
      "",
    image: imageUri ? { uri: imageUri } : FALLBACK_IMAGE,
    rating: String(product?.rating ?? entry?.rating ?? "0.0"),
    price: formatPrice(
      variant?.price ?? variant?.selling_price ?? product?.price,
    ),
    oldPrice: formatPrice(
      variant?.mrp ?? variant?.old_price ?? product?.old_price,
    ),
    time: product?.time ?? product?.delivery_time ?? "",
    isVeg:
      product?.is_veg === 1 ||
      product?.is_veg === true ||
      product?.veg === 1 ||
      product?.veg_type === "veg",
  };
};

// ============================================================
// WISHLIST SCREEN (dishes only)
// ============================================================

const Wishlist = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // LOAD WISHLIST (GET /api/customer/wishlist)
  // ==========================================================

  const loadWishlist = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [wishlistResult, productsResult] = await Promise.allSettled([
        getWishlist(),
        getProduct(),
      ]);

      if (wishlistResult.status === "rejected") {
        throw wishlistResult.reason;
      }

      const res = wishlistResult.value;
      const products =
        productsResult.status === "fulfilled"
          ? extractProducts(productsResult.value)
          : [];

      // No token -> send to login
      if (res?.success === 9) {
        router.replace("/login"); // change to your login route
        return;
      }

      const hasSuccessFlag = res?.success != null;
      const requestSucceeded =
        [1, true, "1"].includes(res?.success) ||
        (!hasSuccessFlag &&
          (Array.isArray(res?.data) || Array.isArray(res?.data?.data)));

      if (requestSucceeded) {
        setDishes(
          extractList(res, ["wishlist", "items", "dishes", "products"]).map(
            (entry) => mapDish(entry, products),
          ),
        );
      } else {
        Alert.alert("Wishlist", res?.message || "Unable to load wishlist.");
      }
    } catch (error) {
      Alert.alert("Wishlist", error?.message || "Unable to load wishlist.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist]),
  );

  // ==========================================================
  // REMOVE DISH (DELETE /api/customer/wishlist/{item})
  // ==========================================================

  const removeDish = async (id) => {
    const previous = dishes;

    // optimistic update
    setDishes((prev) => prev.filter((item) => item.id !== id));

    const res = await removeFromWishlist(id);

    if (res?.success === 9) {
      router.replace("/login"); // change to your login route
      return;
    }

    if (res?.success !== 1) {
      setDishes(previous); // rollback
      Alert.alert("Wishlist", res?.message || "Unable to remove dish.");
    }
  };

  // ==========================================================
  // CLEAR ALL
  // ==========================================================

  const clearAll = () => {
    if (dishes.length === 0) {
      return;
    }

    Alert.alert("Clear Wishlist", "Remove all saved dishes?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          const results = await Promise.all(
            dishes.map((item) => removeFromWishlist(item.id)),
          );

          const failed = results.filter((r) => r?.success !== 1).length;

          if (failed > 0) {
            Alert.alert("Wishlist", `${failed} item(s) could not be removed.`);
          }

          // reload so the screen matches the backend
          loadWishlist();
        },
      },
    ]);
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

          {!!item.restaurant && (
            <Text style={styles.dishRestaurant} numberOfLines={1}>
              {item.restaurant}
            </Text>
          )}

          <View style={styles.dishInfoRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={Colors.white} />

              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            {!!item.time && <Text style={styles.dishTime}>• {item.time}</Text>}
          </View>

          <View style={styles.dishBottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.dishPrice}>{item.price}</Text>

              {!!item.oldPrice && (
                <Text style={styles.dishOldPrice}>{item.oldPrice}</Text>
              )}
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
  // EMPTY / LOADING STATE
  // ==========================================================

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="fast-food-outline" size={55} color={Colors.primary} />
        </View>

        <Text style={styles.emptyTitle}>No saved dishes</Text>

        <Text style={styles.emptyDescription}>
          Save delicious dishes here and order them whenever your cravings hit.
        </Text>

        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/ExploreScreen")} // change to your explore route
          activeOpacity={0.85}
        >
          <Text style={styles.exploreButtonText}>EXPLORE FOOD</Text>

          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

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
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Wishlist</Text>

          <Text style={styles.headerSubtitle}>
            {dishes.length} saved {dishes.length === 1 ? "dish" : "dishes"}
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
          LIST
      ==================================================== */}

      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id}
        renderItem={renderDish}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadWishlist(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          dishes.length === 0 && styles.emptyListContent,
        ]}
      />
    </View>
  );
};

export default Wishlist;

// ============================================================
// STYLES
// ============================================================

const makeStyles = (Colors) =>
  StyleSheet.create({
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
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 27,
    },

    headerSubtitle: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 18,
      marginTop: 3,
    },

    clearButton: {
      paddingVertical: 8,
      paddingHorizontal: 3,
    },

    clearText: {
      color: Colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 17,
    },

    // ==========================================================
    // LIST
    // ==========================================================

    listContent: {
      paddingHorizontal: 15,
      paddingTop: 14,
      paddingBottom: 30,
    },

    heartButton: {
      width: 35,
      height: 35,
      alignItems: "center",
      justifyContent: "center",
    },

    ratingBadge: {
      minWidth: 48,
      height: 25,
      paddingHorizontal: 7,
      borderRadius: 6,
      backgroundColor: "#168A3A",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    ratingText: {
      color: Colors.white,
      fontFamily: Fonts.regular,
      fontSize: 15,
      marginLeft: 4,
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
      color: Colors.goldDark,
      fontFamily: Fonts.regular,
      fontSize: 25,
    },

    dishRestaurant: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 17,
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
      fontSize: 15,
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
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 18,
    },

    dishOldPrice: {
      color: Colors.textMuted,
      fontFamily: Fonts.regular,
      fontSize: 13,
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
      fontFamily: Fonts.regular,
      fontSize: 15,
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
      color: Colors.textPrimary,
      fontFamily: Fonts.extraBold,
      fontSize: 20,
      marginTop: 18,
    },

    emptyDescription: {
      color: Colors.textMuted,
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 20,
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
      fontSize: 14,
      marginRight: 7,
    },
  });
