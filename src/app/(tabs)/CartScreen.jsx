import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import BASE_URL from "../../constants/AppUrls";
import Fonts from "../../constants/Fonts";

import {
  deleteCartItem,
  getCart,
  updateCartQuantity,
} from "../../utils/Function";

import { useTheme } from "../../hooks/use-theme";

/* =========================================================
   API SUCCESS
========================================================= */

const isApiSuccess = (response) => {
  if (!response) {
    return false;
  }

  if (response.success === undefined) {
    return true;
  }

  return [1, true, "1", "success", "SUCCESS"].includes(response.success);
};

/* =========================================================
   GET CART ARRAY
========================================================= */

const getCartArray = (response) => {
  if (!response) {
    return [];
  }

  console.log("========== GET CART RESPONSE ==========");

  console.log(JSON.stringify(response, null, 2));

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.cart)) {
    return response.data.cart;
  }

  if (Array.isArray(response.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response.data?.cart_items)) {
    return response.data.cart_items;
  }

  if (Array.isArray(response.data?.cartItems)) {
    return response.data.cartItems;
  }

  if (Array.isArray(response.data?.data?.cart)) {
    return response.data.data.cart;
  }

  if (Array.isArray(response.data?.data?.items)) {
    return response.data.data.items;
  }

  if (Array.isArray(response.data?.data?.cart_items)) {
    return response.data.data.cart_items;
  }

  if (Array.isArray(response.data?.data?.cartItems)) {
    return response.data.data.cartItems;
  }

  if (Array.isArray(response.cart)) {
    return response.cart;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.cart_items)) {
    return response.cart_items;
  }

  if (Array.isArray(response.cartItems)) {
    return response.cartItems;
  }

  if (Array.isArray(response.data?.cart?.data)) {
    return response.data.cart.data;
  }

  console.log("NO CART ARRAY FOUND");

  return [];
};

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === "object") {
    return (
      getImageUrl(image?.uri) ||
      getImageUrl(image?.url) ||
      getImageUrl(image?.image_url) ||
      getImageUrl(image?.imageUrl) ||
      getImageUrl(image?.image_path) ||
      getImageUrl(image?.imagePath) ||
      getImageUrl(image?.path) ||
      getImageUrl(image?.src)
    );
  }

  if (typeof image !== "string") {
    return null;
  }

  let cleanImage = image.trim();

  if (!cleanImage) {
    return null;
  }

  if (cleanImage.startsWith("data:image")) {
    return cleanImage;
  }

  if (cleanImage.startsWith("http://") || cleanImage.startsWith("https://")) {
    return cleanImage;
  }

  if (cleanImage.startsWith("//")) {
    return `http:${cleanImage}`;
  }

  const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");

  if (!baseUrl) {
    return null;
  }

  cleanImage = cleanImage.replace(/^\/+/, "");

  return `${baseUrl}/${cleanImage}`;
};

/* =========================================================
   FIND IMAGE
========================================================= */

const getCartItemImage = (item, product, variant) => {
  const possibleImages = [
    item?.image_url,
    item?.imageUrl,
    item?.image_path,
    item?.imagePath,
    item?.image,
    item?.thumbnail,
    item?.thumbnail_url,
    item?.thumbnailUrl,
    item?.product_image,
    item?.product_image_url,
    item?.productImage,
    item?.productImageUrl,
    item?.photo,
    item?.photo_url,
    item?.photoUrl,
    item?.media_url,
    item?.mediaUrl,
    item?.media,

    product?.image_url,
    product?.imageUrl,
    product?.image_path,
    product?.imagePath,
    product?.image,
    product?.thumbnail,
    product?.thumbnail_url,
    product?.thumbnailUrl,
    product?.photo,
    product?.photo_url,
    product?.photoUrl,
    product?.media_url,
    product?.mediaUrl,
    product?.media,

    variant?.image_url,
    variant?.imageUrl,
    variant?.image_path,
    variant?.imagePath,
    variant?.image,
    variant?.thumbnail,
    variant?.thumbnail_url,
    variant?.thumbnailUrl,
    variant?.photo,
    variant?.photo_url,
    variant?.photoUrl,
    variant?.media_url,
    variant?.mediaUrl,
    variant?.media,
  ];

  for (const image of possibleImages) {
    const imageUrl = getImageUrl(image);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return null;
};

/* =========================================================
   FORMAT CART ITEM
========================================================= */

const formatCartItem = (item, index) => {
  const product =
    item?.product ||
    item?.product_details ||
    item?.productData ||
    item?.product_data ||
    item?.productDetail ||
    {};

  const variant =
    item?.variant ||
    item?.product_variant ||
    item?.variant_details ||
    item?.variantData ||
    item?.variant_data ||
    {};

  const restaurant =
    item?.restaurant || item?.restaurant_details || item?.restaurantData || {};

  const cartItemId =
    item?.cart_item_id ??
    item?.cartItemId ??
    item?.cart_item?.id ??
    item?.cartItem?.id ??
    item?.cartItem?.cart_item_id ??
    item?.id ??
    item?.cart_id ??
    null;

  const productId =
    item?.product_id ??
    item?.productId ??
    product?.id ??
    product?.product_id ??
    null;

  const variantId =
    item?.variant_id ??
    item?.variantId ??
    variant?.id ??
    variant?.variant_id ??
    null;

  const restaurantId =
    item?.restaurant_id ?? item?.restaurantId ?? restaurant?.id ?? null;

  const rawQuantity = item?.quantity ?? item?.qty ?? item?.count ?? 1;

  const quantityNumber = Number(rawQuantity);

  const quantity =
    Number.isFinite(quantityNumber) && quantityNumber > 0
      ? Math.floor(quantityNumber)
      : 1;

  const rawPrice =
    item?.price ??
    item?.unit_price ??
    item?.unitPrice ??
    item?.selling_price ??
    item?.sellingPrice ??
    item?.sale_price ??
    item?.amount ??
    variant?.price ??
    variant?.selling_price ??
    product?.price ??
    product?.selling_price ??
    product?.sale_price ??
    0;

  const priceNumber = Number(rawPrice);

  const price =
    Number.isFinite(priceNumber) && priceNumber >= 0 ? priceNumber : 0;

  const rawOriginalPrice =
    item?.original_price ??
    item?.originalPrice ??
    item?.mrp ??
    item?.regular_price ??
    variant?.mrp ??
    variant?.original_price ??
    product?.mrp ??
    product?.original_price ??
    product?.regular_price ??
    price;

  const originalPriceNumber = Number(rawOriginalPrice);

  const originalPrice = Number.isFinite(originalPriceNumber)
    ? originalPriceNumber
    : price;

  const name =
    item?.name ||
    item?.product_name ||
    item?.food_name ||
    item?.title ||
    product?.name ||
    product?.product_name ||
    product?.food_name ||
    product?.title ||
    "Food Item";

  const variantName =
    item?.variant_name ||
    item?.variantName ||
    item?.variant_title ||
    item?.variantTitle ||
    item?.size_name ||
    item?.sizeName ||
    variant?.name ||
    variant?.title ||
    variant?.variant_name ||
    variant?.size ||
    "";

  const restaurantName =
    item?.restaurant_name ||
    item?.restaurantName ||
    item?.restaurant_title ||
    restaurant?.name ||
    restaurant?.restaurant_name ||
    restaurant?.title ||
    product?.restaurant_name ||
    product?.restaurantName ||
    product?.restaurant?.name ||
    "Bakasuran Restaurant";

  const image = getCartItemImage(item, product, variant);

  return {
    id:
      cartItemId !== null && cartItemId !== undefined
        ? String(cartItemId)
        : `cart-${index}`,

    cartItemId:
      cartItemId !== null && cartItemId !== undefined
        ? String(cartItemId)
        : null,

    productId:
      productId !== null && productId !== undefined ? String(productId) : null,

    variantId:
      variantId !== null && variantId !== undefined ? String(variantId) : null,

    restaurantId:
      restaurantId !== null && restaurantId !== undefined
        ? String(restaurantId)
        : null,

    name: String(name),

    variantName:
      variantName !== null && variantName !== undefined
        ? String(variantName)
        : "",

    restaurantName:
      restaurantName !== null && restaurantName !== undefined
        ? String(restaurantName)
        : "",

    quantity,
    price,
    originalPrice,
    image,
    rawItem: item,
  };
};

/* =========================================================
   CART SCREEN
========================================================= */

export default function CartScreen() {
  const { colors, isDark } = useTheme();

  const [cartItems, setCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [updatingQuantityId, setUpdatingQuantityId] = useState(null);

  const [deletingCartItemId, setDeletingCartItemId] = useState(null);

  /* =======================================================
     FETCH CART
  ======================================================= */

  const fetchCart = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      setError("");

      console.log("========== GET CART API ==========");

      const response = await getCart();

      console.log("GET CART RESPONSE:", JSON.stringify(response, null, 2));

      if (
        response &&
        response.success !== undefined &&
        !isApiSuccess(response)
      ) {
        throw new Error(response?.message || "Unable to load cart.");
      }

      const list = getCartArray(response);

      console.log("CART ITEMS FOUND:", list.length);

      const formattedItems = list.map((item, index) =>
        formatCartItem(item, index),
      );

      setCartItems(formattedItems);
    } catch (err) {
      console.log("========== GET CART ERROR ==========");

      console.log(err?.response?.data || err?.message || err);

      setCartItems([]);

      setError(
        err?.response?.data?.message || err?.message || "Unable to load cart.",
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     SCREEN FOCUS
  ======================================================= */

  useFocusEffect(
    useCallback(() => {
      fetchCart(false);
    }, [fetchCart]),
  );

  /* =======================================================
     REFRESH
  ======================================================= */

  const onRefresh = useCallback(() => {
    fetchCart(true);
  }, [fetchCart]);

  /* =======================================================
     RETRY
  ======================================================= */

  const handleRetry = useCallback(() => {
    fetchCart(false);
  }, [fetchCart]);

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = useCallback(
    async (cartItemId, newQuantity) => {
      if (
        cartItemId === null ||
        cartItemId === undefined ||
        String(cartItemId).trim() === ""
      ) {
        Alert.alert(
          "Cart Error",
          "Cart item ID is missing from the API response.",
        );

        return;
      }

      const quantity = Number(newQuantity);

      if (!Number.isFinite(quantity) || quantity < 1) {
        return;
      }

      const id = String(cartItemId).trim();

      try {
        setUpdatingQuantityId(id);

        console.log("========== UPDATE CART QUANTITY ==========");

        console.log("CART ITEM ID:", id);
        console.log("QUANTITY:", quantity);

        const response = await updateCartQuantity(id, quantity);

        console.log(
          "UPDATE QUANTITY RESPONSE:",
          JSON.stringify(response, null, 2),
        );

        if (
          response &&
          response.success !== undefined &&
          !isApiSuccess(response)
        ) {
          throw new Error(response?.message || "Unable to update quantity.");
        }

        setCartItems((previous) =>
          previous.map((item) =>
            item.cartItemId === id
              ? {
                  ...item,
                  quantity,
                }
              : item,
          ),
        );

        await fetchCart(false);
      } catch (err) {
        console.log(
          "UPDATE QUANTITY ERROR:",
          err?.response?.data || err?.message || err,
        );

        Alert.alert(
          "Unable to update",
          err?.response?.data?.message ||
            err?.message ||
            "Unable to update quantity.",
        );
      } finally {
        setUpdatingQuantityId(null);
      }
    },
    [fetchCart],
  );

  /* =======================================================
     INCREASE
  ======================================================= */

  const increaseQuantity = useCallback(
    (item) => {
      if (!item?.cartItemId) {
        Alert.alert(
          "Cart Error",
          "Cart item ID is missing from the API response.",
        );

        return;
      }

      const currentQuantity = Number(item.quantity) || 1;

      updateQuantity(item.cartItemId, currentQuantity + 1);
    },
    [updateQuantity],
  );

  /* =======================================================
     DELETE CART ITEM API
  ======================================================= */
  const removeItem = async (item) => {
    try {
      const cartItemId = item?.cartItemId || item?.cart_item_id || item?.id;

      if (!cartItemId) {
        Alert.alert("Error", "Cart item ID is missing.");
        return;
      }

      setUpdatingQuantityId(cartItemId);

      const response = await deleteCartItem(cartItemId);

      console.log("DELETE RESPONSE:", JSON.stringify(response, null, 2));

      if (
        response?.success === 1 ||
        response?.success === true ||
        response?.success === "1"
      ) {
        Alert.alert(
          "Success",
          response?.message || "Item removed successfully.",
        );

        // Refresh cart from server
        await fetchCart();
      } else {
        Alert.alert(
          "Delete Failed",
          response?.message || "Unable to remove item.",
        );
      }
    } catch (error) {
      console.log("REMOVE ITEM ERROR:", error?.message);

      Alert.alert("Error", error?.message || "Unable to remove item.");
    } finally {
      setUpdatingQuantityId(null);
    }
  };
  /* =======================================================
     DECREASE
  ======================================================= */

  const decreaseQuantity = useCallback(
    (item) => {
      if (!item?.cartItemId) {
        Alert.alert(
          "Cart Error",
          "Cart item ID is missing from the API response.",
        );

        return;
      }

      const currentQuantity = Number(item.quantity) || 1;

      if (currentQuantity <= 1) {
        removeItem(item);
        return;
      }

      updateQuantity(item.cartItemId, currentQuantity - 1);
    },
    [updateQuantity, removeItem],
  );

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart = useCallback(() => {
    if (cartItems.length === 0) {
      return;
    }

    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setCartItems([]);
        },
      },
    ]);
  }, [cartItems.length]);

  /* =======================================================
     PRICE CALCULATIONS
  ======================================================= */

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;

      const quantity = Number(item.quantity) || 0;

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    if (subtotal <= 0) {
      return 0;
    }

    return subtotal >= 299 ? 0 : 30;
  }, [subtotal]);

  const gst = useMemo(() => {
    return subtotal * 0.05;
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + deliveryFee + gst;
  }, [subtotal, deliveryFee, gst]);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    );
  }, [cartItems]);

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Please add some items to your cart.");

      return;
    }

    router.push("/CheckoutScreen");
  }, [cartItems.length]);

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border || colors.divider || "#333333",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            My Cart
          </Text>

          {cartItems.length > 0 ? (
            <Text
              style={[
                styles.headerSubtitle,
                {
                  color:
                    colors.textSecondary || colors.secondaryText || "#8F8F8F",
                },
              ]}
            >
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Text>
          ) : null}
        </View>

        {cartItems.length > 0 ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearCart}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.clearText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Clear
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>

      {/* ERROR */}

      {error && cartItems.length === 0 ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={50}
            color={colors.primary}
          />

          <Text
            style={[
              styles.errorTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Unable to load cart
          </Text>

          <Text
            style={[
              styles.errorMessage,
              {
                color: colors.textSecondary || "#8F8F8F",
              },
            ]}
          >
            {String(error)}
          </Text>

          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />

            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* EMPTY CART */}

      {!error && cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconContainer,
              {
                backgroundColor: colors.card || "#202020",
              },
            ]}
          >
            <Ionicons name="cart-outline" size={70} color={colors.primary} />
          </View>

          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Your Cart is Empty
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              {
                color: colors.textSecondary || "#8F8F8F",
              },
            ]}
          >
            Looks like you haven't added anything to your cart yet.
          </Text>

          <TouchableOpacity
            style={[
              styles.shopButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => router.push("/(tabs)/ExploreScreen")}
            activeOpacity={0.85}
          >
            <Ionicons name="restaurant-outline" size={20} color="#FFFFFF" />

            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* CART CONTENT */}

      {cartItems.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.itemsSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Your Items
            </Text>

            {cartItems.map((item) => {
              const isUpdating = updatingQuantityId === item.cartItemId;

              const isDeleting = deletingCartItemId === item.cartItemId;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.cartCard,
                    {
                      backgroundColor: colors.card || "#202020",
                      borderColor: colors.border || colors.divider || "#333333",
                    },
                  ]}
                >
                  {/* IMAGE */}

                  <View style={styles.imageContainer}>
                    {item.image ? (
                      <Image
                        source={{
                          uri: item.image,
                        }}
                        style={styles.productImage}
                        resizeMode="cover"
                        onLoad={() =>
                          console.log("CART IMAGE LOADED:", item.image)
                        }
                        onError={(event) =>
                          console.log(
                            "CART IMAGE ERROR:",
                            item.image,
                            event?.nativeEvent?.error,
                          )
                        }
                      />
                    ) : (
                      <View
                        style={[
                          styles.imagePlaceholder,
                          {
                            backgroundColor: colors.surface || "#181818",
                          },
                        ]}
                      >
                        <Ionicons
                          name="restaurant-outline"
                          size={36}
                          color={colors.primary}
                        />
                      </View>
                    )}
                  </View>

                  {/* DETAILS */}

                  <View style={styles.itemDetails}>
                    <View style={styles.itemTopRow}>
                      <View style={styles.itemNameContainer}>
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.itemName,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          {String(item.name || "")}
                        </Text>

                        {item.restaurantName ? (
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.restaurantText,
                              {
                                color: colors.textSecondary || "#8F8F8F",
                              },
                            ]}
                          >
                            {String(item.restaurantName)}
                          </Text>
                        ) : null}

                        {item.variantName ? (
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.variantText,
                              {
                                color: colors.textSecondary || "#8F8F8F",
                              },
                            ]}
                          >
                            {String(item.variantName)}
                          </Text>
                        ) : null}
                      </View>

                      {/* DELETE */}

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeItem(item)}
                        disabled={isUpdating || isDeleting}
                        activeOpacity={0.7}
                      >
                        {isDeleting ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* PRICE + QUANTITY */}

                    <View style={styles.bottomRow}>
                      <View>
                        <Text
                          style={[
                            styles.price,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          ₹
                          {(
                            (Number(item.price) || 0) *
                            (Number(item.quantity) || 0)
                          ).toFixed(2)}
                        </Text>

                        {item.quantity > 1 ? (
                          <Text
                            style={[
                              styles.unitPrice,
                              {
                                color: colors.textSecondary || "#8F8F8F",
                              },
                            ]}
                          >
                            ₹{(Number(item.price) || 0).toFixed(2)} each
                          </Text>
                        ) : null}
                      </View>

                      {/* QUANTITY */}

                      <View
                        style={[
                          styles.quantityContainer,
                          {
                            borderColor:
                              colors.border || colors.divider || "#444444",
                            backgroundColor: colors.surface || "#181818",
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => decreaseQuantity(item)}
                          disabled={isUpdating || isDeleting}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={colors.text}
                          />
                        </TouchableOpacity>

                        <View style={styles.quantityValueContainer}>
                          {isUpdating ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.primary}
                            />
                          ) : (
                            <Text
                              style={[
                                styles.quantityText,
                                {
                                  color: colors.text,
                                },
                              ]}
                            >
                              {item.quantity}
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => increaseQuantity(item)}
                          disabled={isUpdating || isDeleting}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={18} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* DELIVERY MESSAGE */}

          {subtotal > 0 && subtotal < 299 ? (
            <View
              style={[
                styles.deliveryMessage,
                {
                  backgroundColor: colors.card || "#202020",
                  borderColor: colors.primary,
                },
              ]}
            >
              <Ionicons
                name="bicycle-outline"
                size={22}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.deliveryMessageText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Add ₹{(299 - subtotal).toFixed(2)} more to get{" "}
                <Text
                  style={{
                    fontFamily: Fonts?.bold || undefined,
                  }}
                >
                  FREE delivery
                </Text>
              </Text>
            </View>
          ) : null}

          {subtotal >= 299 ? (
            <View
              style={[
                styles.deliveryMessage,
                {
                  backgroundColor: colors.card || "#202020",
                  borderColor: colors.success || "#22C55E",
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.success || "#22C55E"}
              />

              <Text
                style={[
                  styles.deliveryMessageText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Congratulations! You have FREE delivery.
              </Text>
            </View>
          ) : null}

          {/* BILL SUMMARY */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.card || "#202020",
                borderColor: colors.border || colors.divider || "#333333",
              },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Bill Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                Subtotal
              </Text>

              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: colors.text,
                  },
                ]}
              >
                ₹{subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                Delivery Fee
              </Text>

              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      deliveryFee === 0
                        ? colors.success || "#22C55E"
                        : colors.text,
                  },
                ]}
              >
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: colors.textSecondary || "#8F8F8F",
                  },
                ]}
              >
                GST (5%)
              </Text>

              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: colors.text,
                  },
                ]}
              >
                ₹{gst.toFixed(2)}
              </Text>
            </View>

            <View
              style={[
                styles.summaryDivider,
                {
                  backgroundColor: colors.border || colors.divider || "#333333",
                },
              ]}
            />

            <View style={styles.totalRow}>
              <Text
                style={[
                  styles.totalLabel,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Total
              </Text>

              <Text
                style={[
                  styles.totalValue,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                ₹{grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      ) : null}

      {/* CHECKOUT */}

      {cartItems.length > 0 ? (
        <View
          style={[
            styles.checkoutContainer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border || colors.divider || "#333333",
            },
          ]}
        >
          <View style={styles.checkoutPrice}>
            <Text
              style={[
                styles.checkoutLabel,
                {
                  color: colors.textSecondary || "#8F8F8F",
                },
              ]}
            >
              Total
            </Text>

            <Text
              style={[
                styles.checkoutTotal,
                {
                  color: colors.text,
                },
              ]}
            >
              ₹{grandTotal.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleCheckout}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>

            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 6,
  },

  headerTitle: {
    fontSize: 21,
    fontFamily: Fonts?.bold || undefined,
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: Fonts?.regular || undefined,
  },

  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  clearText: {
    fontSize: 14,
    fontFamily: Fonts?.semiBold || undefined,
  },

  headerRightPlaceholder: {
    width: 42,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 19,
    fontFamily: Fonts?.bold || undefined,
  },

  errorMessage: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts?.regular || undefined,
  },

  retryButton: {
    marginTop: 20,
    minWidth: 120,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.semiBold || undefined,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  emptyTitle: {
    fontSize: 23,
    fontFamily: Fonts?.bold || undefined,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 300,
    fontFamily: Fonts?.regular || undefined,
  },

  shopButton: {
    marginTop: 25,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: Fonts?.semiBold || undefined,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  itemsSection: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: Fonts?.bold || undefined,
  },

  cartCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },

  imageContainer: {
    width: 92,
    height: 92,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#181818",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  itemDetails: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  itemTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  itemNameContainer: {
    flex: 1,
    paddingRight: 8,
  },

  itemName: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts?.semiBold || undefined,
  },

  restaurantText: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: Fonts?.regular || undefined,
  },

  variantText: {
    fontSize: 12,
    marginTop: 3,
    fontFamily: Fonts?.regular || undefined,
  },

  removeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  price: {
    fontSize: 16,
    fontFamily: Fonts?.bold || undefined,
  },

  unitPrice: {
    fontSize: 10,
    marginTop: 3,
    fontFamily: Fonts?.regular || undefined,
  },

  quantityContainer: {
    minWidth: 108,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  quantityButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityValueContainer: {
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    fontSize: 15,
    fontFamily: Fonts?.bold || undefined,
  },

  deliveryMessage: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
  },

  deliveryMessageText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts?.regular || undefined,
  },

  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
  },

  summaryTitle: {
    fontSize: 17,
    marginBottom: 16,
    fontFamily: Fonts?.bold || undefined,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 14,
    fontFamily: Fonts?.regular || undefined,
  },

  summaryValue: {
    fontSize: 14,
    fontFamily: Fonts?.semiBold || undefined,
  },

  summaryDivider: {
    height: 1,
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 17,
    fontFamily: Fonts?.bold || undefined,
  },

  totalValue: {
    fontSize: 20,
    fontFamily: Fonts?.bold || undefined,
  },

  checkoutContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
  },

  checkoutPrice: {
    marginRight: 14,
  },

  checkoutLabel: {
    fontSize: 11,
    marginBottom: 2,
    fontFamily: Fonts?.regular || undefined,
  },

  checkoutTotal: {
    fontSize: 18,
    fontFamily: Fonts?.bold || undefined,
  },

  checkoutButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold || undefined,
  },
});
