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

import { getWishlist, removeFromWishlist } from "../../utils/Function";

import { postMethod } from "../../utils/APIServices";

const FALLBACK_IMAGE = require("../../../assets/images/Restaurant1.png");

// ============================================================
// RESPONSE HELPERS
// ============================================================

const isSuccess = (response) => {
  const result = response?.success ?? response?.data?.success;
  return [1, "1", true].includes(result);
};

const isLoginRequired = (response) => {
  const result = response?.success ?? response?.data?.success;
  return [9, "9"].includes(result);
};

// ============================================================
// IMAGE HELPER
// ============================================================

const normalizeImageUri = (image) => {
  if (!image) return null;

  let value = image;

  if (typeof image === "object") {
    value =
      image?.url ??
      image?.path ??
      image?.image_url ??
      image?.image ??
      image?.src ??
      null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const uri = value.trim();

  if (/^https?:\/\//i.test(uri)) {
    return uri;
  }

  return `${String(BASE_URL).replace(/\/+$/, "")}/${uri.replace(/^\/+/, "")}`;
};

// ============================================================
// PRICE HELPER
// ============================================================

const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const stringValue = String(value).replace(/^₹/, "");
  return `₹${stringValue}`;
};

// ============================================================
// ID HELPER
// ============================================================

const getValidId = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
};

// ============================================================
// EXTRACT WISHLIST ARRAY
// ============================================================

const extractWishlistArray = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  const possibleArrays = [
    response?.data,
    response?.wishlist,
    response?.items,
    response?.products,

    response?.data?.data,
    response?.data?.wishlist,
    response?.data?.items,
    response?.data?.products,

    response?.data?.data?.wishlist,
    response?.data?.data?.items,
    response?.data?.data?.products,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

// ============================================================
// DISH IMAGE
// ============================================================

const getDishImage = (entry, variant, product) => {
  const candidates = [
    entry?.image_url,
    entry?.image,
    entry?.product_image,
    entry?.product_image_url,
    entry?.thumbnail,
    entry?.thumbnail_url,

    variant?.image_url,
    variant?.image,
    variant?.product_image,
    variant?.product_image_url,
    variant?.thumbnail,
    variant?.thumbnail_url,

    product?.image_url,
    product?.image,
    product?.product_image,
    product?.product_image_url,
    product?.thumbnail,
    product?.thumbnail_url,

    product?.images?.[0]?.image_url,
    product?.images?.[0]?.url,
    product?.images?.[0]?.image,

    variant?.images?.[0]?.image_url,
    variant?.images?.[0]?.url,
    variant?.images?.[0]?.image,
  ];

  for (const candidate of candidates) {
    const imageUri = normalizeImageUri(candidate);

    if (imageUri) {
      return { uri: imageUri };
    }
  }

  return FALLBACK_IMAGE;
};

// ============================================================
// MAP WISHLIST ITEM
// ============================================================

const mapWishlistItem = (entry) => {
  if (!entry) return null;

  const variant =
    entry?.variant ?? entry?.product_variant ?? entry?.productVariant ?? {};

  const product = entry?.product ?? variant?.product ?? entry?.item ?? {};

  // IMPORTANT:
  // This must be the wishlist record ID.
  // Do not use product ID or variant ID for DELETE.

  const wishlistId = getValidId(
    entry?.wishlist_id,
    entry?.wishlistId,
    entry?.wishlist_item_id,
    entry?.wishlist_itemId,
    entry?.wishlist?.id,
    entry?.wishlist_item?.id,
    entry?.id,
  );

  const variantId = getValidId(
    entry?.variant_id,
    entry?.variantId,
    variant?.id,
    product?.variant_id,
    product?.variantId,
  );

  const productId = getValidId(
    entry?.product_id,
    entry?.productId,
    product?.id,
    variant?.product_id,
    variant?.productId,
  );

  const name =
    product?.name ??
    product?.product_name ??
    product?.productName ??
    product?.title ??
    variant?.name ??
    variant?.variant_name ??
    entry?.name ??
    entry?.product_name ??
    entry?.title ??
    "Dish";

  const restaurant =
    product?.restaurant?.name ??
    product?.restaurant_name ??
    product?.restaurantName ??
    product?.vendor?.name ??
    entry?.restaurant_name ??
    entry?.restaurantName ??
    variant?.restaurant?.name ??
    "";

  const rating =
    product?.rating ??
    product?.average_rating ??
    product?.averageRating ??
    entry?.rating ??
    "0.0";

  const price =
    variant?.price ??
    variant?.selling_price ??
    variant?.sale_price ??
    product?.selling_price ??
    product?.sale_price ??
    product?.price ??
    entry?.price ??
    0;

  const oldPrice =
    variant?.mrp ??
    variant?.old_price ??
    variant?.oldPrice ??
    product?.mrp ??
    product?.old_price ??
    product?.oldPrice ??
    entry?.old_price ??
    entry?.oldPrice ??
    "";

  const time =
    product?.time ??
    product?.delivery_time ??
    product?.deliveryTime ??
    entry?.time ??
    entry?.delivery_time ??
    entry?.deliveryTime ??
    "";

  const isVeg =
    product?.is_veg === 1 ||
    product?.is_veg === true ||
    product?.veg === 1 ||
    product?.veg === true ||
    product?.veg_type === "veg" ||
    variant?.is_veg === 1 ||
    variant?.is_veg === true ||
    entry?.is_veg === 1 ||
    entry?.is_veg === true;

  return {
    wishlistId,
    variantId,
    productId,
    name: String(name),
    restaurant: String(restaurant || ""),
    image: getDishImage(entry, variant, product),
    rating: String(rating ?? "0.0"),
    price: formatPrice(price),
    oldPrice: oldPrice !== "" ? formatPrice(oldPrice) : "",
    time: String(time || ""),
    isVeg,
    original: entry,
  };
};

// ============================================================
// SCREEN
// ============================================================

const WishlistScreen = () => {
  const { colors: Colors } = useTheme();

  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [removingId, setRemovingId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);
  const [clearing, setClearing] = useState(false);

  // ==========================================================
  // LOAD WISHLIST
  // ==========================================================

  const loadWishlist = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("====================================");
      console.log("GET WISHLIST API");
      console.log("GET /api/customer/wishlist");
      console.log("====================================");

      const response = await getWishlist();

      console.log("WISHLIST RESPONSE:", JSON.stringify(response, null, 2));

      if (isLoginRequired(response)) {
        setDishes([]);

        if (!isRefresh) {
          Alert.alert("Login Required", "Please login to view your wishlist.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () => router.replace("/(auth)/Loginscreen"),
            },
          ]);
        }

        return;
      }

      if (response?.success !== undefined && !isSuccess(response)) {
        throw new Error(response?.message || "Unable to load wishlist.");
      }

      const wishlistArray = extractWishlistArray(response);

      console.log("WISHLIST ARRAY:", JSON.stringify(wishlistArray, null, 2));

      wishlistArray.forEach((item, index) => {
        console.log(`WISHLIST ITEM ${index + 1} IDS:`, {
          id: item?.id,
          wishlist_id: item?.wishlist_id,
          wishlist_item_id: item?.wishlist_item_id,
          product_id: item?.product_id,
          variant_id: item?.variant_id,
        });
      });

      const mapped = wishlistArray.map(mapWishlistItem).filter(Boolean);

      console.log("MAPPED WISHLIST:", JSON.stringify(mapped, null, 2));

      setDishes(mapped);
    } catch (error) {
      console.log("GET WISHLIST ERROR:", error?.message);
      console.log(
        "SERVER RESPONSE:",
        JSON.stringify(error?.response?.data ?? {}, null, 2),
      );

      if (!isRefresh) {
        Alert.alert(
          "Wishlist",
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load wishlist.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // SCREEN FOCUS
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      loadWishlist(false);
    }, [loadWishlist]),
  );

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = useCallback(() => {
    loadWishlist(true);
  }, [loadWishlist]);

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart = async (item) => {
    const cartKey = String(item?.variantId || item?.productId || "");

    try {
      const productId = Number(item?.productId);
      const variantId = Number(item?.variantId);

      if (!Number.isFinite(productId) || productId <= 0) {
        Alert.alert("Add to Cart", "Product ID is missing.");
        return;
      }

      if (!Number.isFinite(variantId) || variantId <= 0) {
        Alert.alert("Add to Cart", "Variant ID is missing.");
        return;
      }

      const requestData = {
        product_id: productId,
        variant_id: variantId,
        quantity: 1,
      };

      console.log("====================================");
      console.log("ADD TO CART API");
      console.log("REQUEST:", JSON.stringify(requestData, null, 2));
      console.log("====================================");

      setAddingCartId(cartKey);

      const response = await postMethod("api/customer/cart/add", requestData);

      console.log("ADD CART RESPONSE:", JSON.stringify(response, null, 2));

      // LOGIN REQUIRED
      if (isLoginRequired(response)) {
        Alert.alert(
          "Login Required",
          "Please login to add items to your cart.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Login",
              onPress: () => router.replace("/(auth)/Loginscreen"),
            },
          ],
        );

        return;
      }

      // SUCCESS
      if (isSuccess(response)) {
        console.log("PRODUCT ADDED TO CART SUCCESSFULLY");

        // Open CartScreen directly
        router.push("/CartScreen");

        return;
      }

      // API FAILURE
      Alert.alert(
        "Add to Cart",
        response?.message ||
          response?.data?.message ||
          "Unable to add item to cart.",
      );
    } catch (error) {
      console.log("====================================");
      console.log("ADD CART ERROR");
      console.log("MESSAGE:", error?.message);
      console.log(
        "SERVER:",
        JSON.stringify(error?.response?.data ?? {}, null, 2),
      );
      console.log("====================================");

      Alert.alert(
        "Add to Cart",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to add item to cart.",
      );
    } finally {
      setAddingCartId(null);
    }
  };

  // ==========================================================
  // REMOVE ONE WISHLIST ITEM
  // ==========================================================

  const removeDish = async (item) => {
    const wishlistId = getValidId(item?.wishlistId);

    console.log("====================================");
    console.log("REMOVE WISHLIST ITEM");
    console.log("Wishlist ID:", wishlistId);
    console.log("Product ID:", item?.productId);
    console.log("Variant ID:", item?.variantId);
    console.log("====================================");

    if (!wishlistId) {
      Alert.alert(
        "Remove Wishlist",
        "Wishlist ID is missing. Check the GET wishlist response.",
      );
      return;
    }

    if (removingId || clearing) {
      return;
    }

    try {
      setRemovingId(wishlistId);
      const response = await removeFromWishlist(wishlistId);

      console.log(
        "DELETE WISHLIST RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      if (isLoginRequired(response)) {
        Alert.alert("Login Required", "Please login to continue.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () => router.replace("/(auth)/Loginscreen"),
          },
        ]);
        return;
      }

      if (isSuccess(response)) {
        setDishes((current) =>
          current.filter(
            (dish) => String(dish?.wishlistId) !== String(wishlistId),
          ),
        );

        Alert.alert(
          "Success",
          response?.message ||
            response?.data?.message ||
            "Item removed from wishlist.",
        );

        await loadWishlist(true);
        return;
      }

      Alert.alert(
        "Remove Wishlist",
        response?.message ||
          response?.data?.message ||
          "Unable to remove wishlist item.",
      );
    } catch (error) {
      console.log("====================================");
      console.log("DELETE WISHLIST ERROR");
      console.log("MESSAGE:", error?.message);
      console.log("STATUS:", error?.response?.status);
      console.log(
        "SERVER:",
        JSON.stringify(error?.response?.data ?? {}, null, 2),
      );
      console.log("====================================");

      Alert.alert(
        "Delete Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to remove wishlist item.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  // ==========================================================
  // CLEAR ALL WISHLIST ITEMS
  // ==========================================================

  const clearWishlist = () => {
    if (!dishes.length || clearing || removingId) {
      return;
    }

    Alert.alert(
      "Clear Wishlist",
      "Are you sure you want to remove all wishlist items?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            const previousDishes = [...dishes];

            try {
              setClearing(true);

              const validItems = previousDishes.filter(
                (item) => !!getValidId(item?.wishlistId),
              );

              if (validItems.length !== previousDishes.length) {
                Alert.alert(
                  "Wishlist",
                  "One or more wishlist items are missing a wishlist ID. No items were removed.",
                );
                return;
              }

              for (const item of validItems) {
                const wishlistId = getValidId(item?.wishlistId);

                console.log("CLEAR WISHLIST - DELETING ID:", wishlistId);

                const response = await removeFromWishlist(wishlistId);

                console.log(
                  "CLEAR DELETE RESPONSE:",
                  JSON.stringify(response, null, 2),
                );

                if (isLoginRequired(response)) {
                  await loadWishlist(true);

                  Alert.alert("Login Required", "Please login to continue.");

                  router.replace("/(auth)/Loginscreen");
                  return;
                }

                if (!isSuccess(response)) {
                  await loadWishlist(true);

                  Alert.alert(
                    "Clear Wishlist",
                    response?.message ||
                      response?.data?.message ||
                      `Unable to remove wishlist item ${wishlistId}.`,
                  );
                  return;
                }
              }

              setDishes([]);

              Alert.alert(
                "Success",
                "All wishlist items removed successfully.",
              );

              await loadWishlist(true);
            } catch (error) {
              console.log("CLEAR WISHLIST ERROR:", error?.message);
              console.log(
                "SERVER:",
                JSON.stringify(error?.response?.data ?? {}, null, 2),
              );

              await loadWishlist(true);

              Alert.alert(
                "Clear Wishlist",
                error?.response?.data?.message ||
                  error?.message ||
                  "Unable to clear wishlist.",
              );
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // OPEN PRODUCT
  // ==========================================================
  const openProduct = (item) => {
    const productId = getValidId(
      item?.productId,
      item?.original?.product_id,
      item?.original?.product?.id,
    );

    const variantId = getValidId(
      item?.variantId,
      item?.original?.variant_id,
      item?.original?.variant?.id,
    );

    if (!productId) {
      Alert.alert("Product", "Product ID is missing.");
      return;
    }

    console.log("====================================");
    console.log("OPEN FOOD DETAILS");
    console.log("Product ID:", productId);
    console.log("Variant ID:", variantId);
    console.log("====================================");

    router.push({
      pathname: "/Food-Details",
      params: {
        itemId: String(productId),
        restaurantId: item?.original?.restaurant_id
          ? String(item.original.restaurant_id)
          : "",
        variantId: variantId || "",
      },
    });
  };

  // ==========================================================
  // RENDER ITEM
  // ==========================================================

  const renderItem = ({ item }) => {
    const removing = String(removingId) === String(item?.wishlistId);

    const adding =
      String(addingCartId) === String(item?.variantId || item?.productId || "");

    return (
      <View style={styles.card}>
        {/* IMAGE */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openProduct(item)}
          style={styles.imageContainer}
        >
          <Image
            source={item?.image || FALLBACK_IMAGE}
            style={styles.productImage}
            resizeMode="cover"
          />

          {item?.isVeg && (
            <View style={styles.vegBadge}>
              <View style={styles.vegDot} />
            </View>
          )}
        </TouchableOpacity>

        {/* CONTENT */}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openProduct(item)}
              style={styles.titleContainer}
            >
              <Text numberOfLines={2} style={styles.productName}>
                {item?.name}
              </Text>
            </TouchableOpacity>

            {/* DELETE / HEART BUTTON */}

            <TouchableOpacity
              disabled={removing || clearing}
              onPress={() => removeDish(item)}
              style={styles.heartButton}
            >
              {removing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="heart" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {!!item?.restaurant && (
            <Text numberOfLines={1} style={styles.restaurant}>
              {item.restaurant}
            </Text>
          )}

          <View style={styles.metaRow}>
            {!!item?.rating && item.rating !== "0.0" && (
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}

            {!!item?.time && (
              <View style={styles.timeContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            {!!item?.price && <Text style={styles.price}>{item.price}</Text>}

            {!!item?.oldPrice && item.oldPrice !== item.price && (
              <Text style={styles.oldPrice}>{item.oldPrice}</Text>
            )}
          </View>

          {/* ADD TO CART */}

          <TouchableOpacity
            disabled={adding || removing || clearing}
            onPress={() => handleAddToCart(item)}
            style={[
              styles.addButton,
              {
                opacity: adding || removing || clearing ? 0.6 : 1,
              },
            ]}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={17} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==========================================================
  // EMPTY WISHLIST
  // ==========================================================

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="heart-outline" size={58} color={Colors.primary} />
        </View>

        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>

        <Text style={styles.emptyText}>
          Save your favourite dishes here and order them whenever you want.
        </Text>

        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/(tabs)/ExploreScreen")}
        >
          <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Wishlist</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />

          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      </View>
    );
  }

  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Wishlist</Text>

          {dishes.length > 0 && (
            <Text style={styles.countText}>
              {dishes.length} {dishes.length === 1 ? "item" : "items"}
            </Text>
          )}
        </View>

        {dishes.length > 0 ? (
          <TouchableOpacity
            disabled={clearing || !!removingId}
            onPress={clearWishlist}
            style={styles.clearButton}
          >
            {clearing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.clearButtonText}>Clear</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      {/* WISHLIST LIST */}

      <FlatList
        data={dishes}
        keyExtractor={(item, index) =>
          String(
            item?.wishlistId || `${item?.productId || "wishlist"}-${index}`,
          )
        }
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          dishes.length === 0 ? styles.emptyList : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    </View>
  );
};

// ============================================================
// STYLES
// ============================================================

const makeStyles = (Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    header: {
      minHeight: 64,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.border || Colors.divider || "#333333",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      color: Colors.text,
      fontSize: 20,
      fontFamily: Fonts?.bold || Fonts?.semiBold || undefined,
      fontWeight: "700",
    },

    countText: {
      marginTop: 2,
      color: Colors.textSecondary || "#999999",
      fontSize: 12,
      fontFamily: Fonts?.regular || undefined,
    },

    clearButton: {
      minWidth: 50,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },

    clearButtonText: {
      color: Colors.primary,
      fontSize: 14,
      fontWeight: "700",
      fontFamily: Fonts?.semiBold || undefined,
    },

    headerRight: {
      width: 50,
    },

    listContent: {
      padding: 14,
      paddingBottom: 30,
    },

    card: {
      flexDirection: "row",
      backgroundColor: Colors.card || Colors.surface || "#202020",
      borderRadius: 16,
      marginBottom: 14,
      padding: 10,
      borderWidth: 1,
      borderColor: Colors.border || "#2B2B2B",
    },

    imageContainer: {
      width: 125,
      height: 145,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: Colors.surface || "#181818",
      position: "relative",
    },

    productImage: {
      width: "100%",
      height: "100%",
    },

    vegBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#168A37",
    },

    vegDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: "#168A37",
    },

    content: {
      flex: 1,
      marginLeft: 12,
      paddingVertical: 2,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    titleContainer: {
      flex: 1,
      paddingRight: 4,
    },

    productName: {
      color: Colors.text,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "700",
      fontFamily: Fonts?.semiBold || undefined,
    },

    heartButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      marginTop: -4,
      marginRight: -4,
    },

    restaurant: {
      marginTop: 3,
      color: Colors.textSecondary || "#999999",
      fontSize: 12,
      lineHeight: 17,
      fontFamily: Fonts?.regular || undefined,
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
      gap: 10,
    },

    ratingBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#168A37",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 5,
      gap: 3,
    },

    ratingText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "700",
    },

    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    timeText: {
      color: Colors.textSecondary || "#999999",
      fontSize: 11,
    },

    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
      gap: 8,
    },

    price: {
      color: Colors.text,
      fontSize: 16,
      fontWeight: "800",
      fontFamily: Fonts?.bold || undefined,
    },

    oldPrice: {
      color: Colors.textSecondary || "#888888",
      fontSize: 12,
      textDecorationLine: "line-through",
    },

    addButton: {
      height: 36,
      marginTop: 9,
      borderRadius: 9,
      backgroundColor: Colors.primary || "#F9080C",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      gap: 6,
      alignSelf: "flex-start",
    },

    addButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
      fontFamily: Fonts?.semiBold || undefined,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 12,
      color: Colors.textSecondary || "#999999",
      fontSize: 14,
      fontFamily: Fonts?.regular || undefined,
    },

    emptyList: {
      flexGrow: 1,
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
      paddingBottom: 80,
    },

    emptyIcon: {
      width: 110,
      height: 110,
      borderRadius: 55,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.primary ? `${Colors.primary}18` : "#F9080C18",
      marginBottom: 22,
    },

    emptyTitle: {
      color: Colors.text,
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
      fontFamily: Fonts?.bold || undefined,
    },

    emptyText: {
      marginTop: 9,
      color: Colors.textSecondary || "#999999",
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      maxWidth: 310,
      fontFamily: Fonts?.regular || undefined,
    },

    exploreButton: {
      marginTop: 24,
      minHeight: 45,
      paddingHorizontal: 22,
      borderRadius: 10,
      backgroundColor: Colors.primary || "#F9080C",
      alignItems: "center",
      justifyContent: "center",
    },

    exploreButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
      fontFamily: Fonts?.semiBold || undefined,
    },
  });

export default WishlistScreen;
