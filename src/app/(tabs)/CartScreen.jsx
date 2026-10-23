import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BASE_URL from "../../constants/AppUrls";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";
import { getCart } from "../../utils/Function";

// ============================================================
// LOCAL FALLBACK IMAGES
// ============================================================

const FALLBACK_IMAGE = require("../../../assets/images/chicken_biryani.jpg");

// ============================================================
// CART RESPONSE MAPPING
// ============================================================

const getCartArray = (response) => {
  const candidates = [
    response?.data?.items,
    response?.data?.cart_items,
    response?.data?.cart?.items,
    response?.data?.cart?.cart_items,
    response?.data?.cart,
    response?.items,
    response?.cart_items,
    response?.data,
  ];

  const result = candidates.find(Array.isArray);

  return result || [];
};

const formatCartItem = (item, index) => {
  const product = item?.product ?? item?.food ?? item?.menu_item ?? item;

  const rawPrice =
    item?.unit_price ??
    item?.price ??
    item?.product_price ??
    product?.selling_price ??
    product?.price ??
    0;

  const rawImage =
    product?.image_url ??
    product?.image ??
    product?.image_path ??
    item?.image_url ??
    item?.image ??
    null;

  return {
    id: String(item?.cart_item_id ?? item?.id ?? item?.cart_id ?? index),
    name:
      product?.name ??
      product?.product_name ??
      product?.food_name ??
      item?.name ??
      "Food Item",
    restaurant:
      item?.restaurant?.name ??
      product?.restaurant?.name ??
      item?.restaurant_name ??
      product?.restaurant_name ??
      "Bakasuran Restaurant",
    price: Math.max(0, Number(rawPrice) || 0),
    quantity: Math.max(
      1,
      Math.floor(Number(item?.quantity ?? item?.qty ?? 1) || 1),
    ),
    image: rawImage,
    isVeg: Boolean(product?.is_veg ?? product?.isVeg ?? item?.is_veg ?? false),
  };
};

// ============================================================
// CART SCREEN
// ============================================================

const CartScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartError, setCartError] = useState("");

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);

  // ==========================================================
  // FETCH CART
  // ==========================================================

  const fetchCart = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setCartError("");

    try {
      const response = await getCart();

      console.log("GET CART RESPONSE:", JSON.stringify(response, null, 2));

      // Change this mapping if your API response uses another structure.
      const items = getCartArray(response);

      const formattedItems = items.map(formatCartItem);

      setCartItems(formattedItems);
    } catch (error) {
      console.error("GET CART ERROR:", error.response?.data ?? error.message);

      setCartError(
        error.response?.data?.message ??
          error.message ??
          "Unable to load your cart.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh whenever the screen receives focus.
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const increaseQuantity = (id) => {
    setCartItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((previous) =>
      previous
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // ==========================================================
  // REMOVE ITEM
  // ==========================================================

  const removeItem = (id) => {
    Alert.alert("Remove Item", "Remove this item from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setCartItems((previous) => previous.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  // ==========================================================
  // CLEAR CART
  // ==========================================================

  const clearCart = () => {
    Alert.alert("Clear Cart", "Remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setCartItems([]);
          setCoupon("");
          setAppliedCoupon(false);
        },
      },
    ]);
  };

  // ==========================================================
  // TOTAL ITEMS
  // ==========================================================

  const totalItems = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  // ==========================================================
  // SUBTOTAL
  // ==========================================================

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  // ==========================================================
  // DELIVERY, TAX, DISCOUNT AND TOTAL
  // ==========================================================

  const deliveryFee = subtotal === 0 || subtotal >= 299 ? 0 : 30;
  const gst = Math.round(subtotal * 0.05);

  const couponDiscount = appliedCoupon
    ? Math.min(Math.round(subtotal * 0.1), 100)
    : 0;

  const grandTotal = Math.max(0, subtotal + deliveryFee + gst - couponDiscount);

  // ==========================================================
  // COUPON
  // ==========================================================

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      Alert.alert("Enter Coupon", "Please enter a coupon code.");
      return;
    }

    if (subtotal <= 0) {
      Alert.alert("Empty Cart", "Add items before applying a coupon.");
      return;
    }

    if (["BAKA50", "BAKA30", "BAKASURAN"].includes(code)) {
      setCoupon(code);
      setAppliedCoupon(true);
      Alert.alert("Coupon Applied", "You saved on your order!");
    } else {
      setAppliedCoupon(false);
      Alert.alert("Invalid Coupon", "Please enter a valid coupon code.");
    }
  };

  // ==========================================================
  // CHECKOUT
  // ==========================================================

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Add some delicious food first.");
      return;
    }

    router.push({
      pathname: "/CheckoutScreen",
      params: {
        subtotal: String(subtotal),
        deliveryFee: String(deliveryFee),
        gst: String(gst),
        couponDiscount: String(couponDiscount),
        grandTotal: String(grandTotal),
      },
    });
  };

  // ==========================================================
  // IMAGE SOURCE
  // ==========================================================

  const getImageSource = (image) => {
    if (typeof image === "number") {
      return image;
    }

    if (typeof image === "string" && image.trim()) {
      if (/^https?:\/\//i.test(image)) {
        return { uri: image };
      }

      // Assumes relative image paths are served from BASE_URL.
      const path = image.replace(/^\/+/, "");
      return { uri: `${BASE_URL}/${path}` };
    }

    return FALLBACK_IMAGE;
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  // ==========================================================
  // EMPTY CART OR API ERROR
  // ==========================================================

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={21} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerSubtitle}>0 items</Text>
          </View>

          <View style={styles.headerButton} />
        </View>

        <View style={styles.emptyContainer}>
          {cartError ? (
            <>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={52}
                  color={Colors.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>Unable to load cart</Text>

              <Text style={styles.emptyDescription}>{cartError}</Text>

              <TouchableOpacity
                style={styles.startOrderingButton}
                onPress={() => fetchCart()}
              >
                <Ionicons name="refresh" size={18} color={Colors.white} />
                <Text style={styles.startOrderingText}>RETRY</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="cart-outline"
                  size={60}
                  color={Colors.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>Your cart is empty</Text>

              <Text style={styles.emptyDescription}>
                Looks like you haven't added anything delicious yet.
              </Text>

              <TouchableOpacity
                style={styles.startOrderingButton}
                onPress={() => router.push("/explore")}
              >
                <Text style={styles.startOrderingText}>START ORDERING</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // ==========================================================
  // MAIN CART UI
  // ==========================================================

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={21} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSubtitle}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={clearCart}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={19} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {cartError ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => fetchCart(true)}
        >
          <Text style={styles.errorBannerText}>{cartError} Tap to retry.</Text>
        </TouchableOpacity>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* RESTAURANT */}

        <View style={styles.restaurantSection}>
          <View style={styles.restaurantIcon}>
            <Ionicons name="restaurant" size={20} color={Colors.white} />
          </View>

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>
              {cartItems[0]?.restaurant ?? "Bakasuran Restaurant"}
            </Text>

            <Text style={styles.restaurantLocation}>Restaurant order</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>

        {/* ITEMS HEADER */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Items</Text>
          <Text style={styles.itemCount}>{totalItems} items</Text>
        </View>

        {/* CART ITEMS */}

        <View style={styles.itemsContainer}>
          {cartItems.map((item, index) => (
            <View
              key={`${item.id}-${index}`}
              style={[
                styles.cartItem,
                index === cartItems.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <View style={styles.itemImageContainer}>
                <Image
                  source={getImageSource(item.image)}
                  style={styles.itemImage}
                  resizeMode="cover"
                />

                <View
                  style={[
                    styles.itemVegIndicator,
                    {
                      borderColor: item.isVeg ? Colors.success : Colors.primary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.itemVegDot,
                      {
                        backgroundColor: item.isVeg
                          ? Colors.success
                          : Colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>

                <Text style={styles.itemRestaurant} numberOfLines={1}>
                  {item.restaurant}
                </Text>

                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
              </View>

              <View style={styles.itemRight}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => decreaseQuantity(item.id)}
                    accessibilityLabel={`Decrease ${item.name} quantity`}
                  >
                    <Ionicons name="remove" size={15} color={Colors.white} />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => increaseQuantity(item.id)}
                    accessibilityLabel={`Increase ${item.name} quantity`}
                  >
                    <Ionicons name="add" size={15} color={Colors.white} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemTotal}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
                accessibilityLabel={`Remove ${item.name}`}
              >
                <Ionicons name="close" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ADD MORE */}

        <TouchableOpacity
          style={styles.addMoreButton}
          onPress={() => router.push("/explore")}
          activeOpacity={0.8}
        >
          <View style={styles.addMoreIcon}>
            <Ionicons name="add" size={18} color={Colors.primary} />
          </View>

          <Text style={styles.addMoreText}>Add more items</Text>

          <Ionicons name="chevron-forward" size={17} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* COUPON */}

        <View style={styles.couponSection}>
          <View style={styles.couponHeader}>
            <View style={styles.couponIcon}>
              <Ionicons
                name="pricetag-outline"
                size={18}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text style={styles.couponTitle}>Apply Coupon</Text>
              <Text style={styles.couponSubtitle}>Save more on your order</Text>
            </View>
          </View>

          <View style={styles.couponInputRow}>
            <TextInput
              value={coupon}
              onChangeText={(value) => {
                setCoupon(value);
                setAppliedCoupon(false);
              }}
              placeholder="Enter coupon code"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              editable={!appliedCoupon}
              style={styles.couponInput}
            />

            <TouchableOpacity
              style={[
                styles.applyButton,
                appliedCoupon && styles.appliedButton,
              ]}
              onPress={applyCoupon}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>
                {appliedCoupon ? "APPLIED" : "APPLY"}
              </Text>
            </TouchableOpacity>
          </View>

          {appliedCoupon && (
            <View style={styles.appliedCouponRow}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={Colors.success}
              />
              <Text style={styles.appliedCouponText}>
                Coupon applied successfully
              </Text>
            </View>
          )}
        </View>

        {/* OFFER */}

        <View style={styles.offerTip}>
          <View style={styles.offerTipIcon}>
            <Ionicons name="flash" size={16} color={Colors.rating} />
          </View>

          <View style={styles.offerTipContent}>
            <Text style={styles.offerTipTitle}>
              You are saving with BAKASURAN
            </Text>
            <Text style={styles.offerTipText}>
              Free delivery on orders above ₹299
            </Text>
          </View>
        </View>

        {/* BILL DETAILS */}

        <View style={styles.billSection}>
          <Text style={styles.billTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item total</Text>
            <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery fee</Text>
            {deliveryFee === 0 ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : (
              <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST & taxes</Text>
            <Text style={styles.billValue}>₹{gst.toFixed(2)}</Text>
          </View>

          {couponDiscount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon discount</Text>
              <Text style={styles.discountValue}>
                -₹{couponDiscount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>To Pay</Text>
              <Text style={styles.totalSubtext}>Inclusive of all taxes</Text>
            </View>

            <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* PAYMENT SAFETY */}

        <View style={styles.deliveryInfo}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={Colors.success}
          />

          <View style={styles.deliveryInfoContent}>
            <Text style={styles.deliveryInfoTitle}>Safe & secure payment</Text>
            <Text style={styles.deliveryInfoText}>
              Your payment information is encrypted and secure.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* CHECKOUT BAR */}

      <View style={styles.checkoutBar}>
        <View style={styles.checkoutPriceContainer}>
          <Text style={styles.checkoutLabel}>Total</Text>
          <Text style={styles.checkoutPrice}>₹{grandTotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutText}>CHECKOUT</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {refreshing && (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

export default CartScreen;

// ============================================================
// STYLES
// ============================================================

const makeStyles = (Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    centerContainer: {
      flex: 1,
      backgroundColor: Colors.background,
      justifyContent: "center",
      alignItems: "center",
    },

    loadingText: {
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      marginTop: 12,
    },

    header: {
      height: 64,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.background,
      borderBottomWidth: 1,
      borderBottomColor: Colors.divider,
    },

    headerButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.surface,
    },

    headerCenter: {
      alignItems: "center",
    },

    headerTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 18,
    },

    headerSubtitle: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 14,
      marginTop: 2,
    },

    scrollContent: {
      paddingBottom: 100,
    },

    errorBanner: {
      marginHorizontal: 15,
      marginTop: 10,
      padding: 10,
      borderRadius: 8,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.primary,
    },

    errorBannerText: {
      color: Colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 13,
    },

    restaurantSection: {
      marginHorizontal: 15,
      marginTop: 15,
      padding: 12,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      flexDirection: "row",
      alignItems: "center",
    },

    restaurantIcon: {
      width: 42,
      height: 42,
      borderRadius: 10,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    restaurantInfo: {
      flex: 1,
      marginLeft: 11,
    },

    restaurantName: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 18,
    },

    restaurantLocation: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 13,
      marginTop: 3,
    },

    sectionHeader: {
      marginTop: 20,
      marginHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    sectionTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.extraBold,
      fontSize: 18,
    },

    itemCount: {
      color: Colors.textMuted,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    itemsContainer: {
      marginHorizontal: 15,
      marginTop: 8,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: "hidden",
    },

    cartItem: {
      minHeight: 105,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: Colors.divider,
      position: "relative",
    },

    itemImageContainer: {
      width: 68,
      height: 76,
      position: "relative",
    },

    itemImage: {
      width: 68,
      height: 76,
      borderRadius: 10,
    },

    itemVegIndicator: {
      position: "absolute",
      top: 5,
      left: 5,
      width: 14,
      height: 14,
      borderRadius: 3,
      borderWidth: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      alignItems: "center",
      justifyContent: "center",
    },

    itemVegDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    itemDetails: {
      flex: 1,
      marginLeft: 9,
      paddingRight: 3,
    },

    itemName: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    itemRestaurant: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 12,
      marginTop: 3,
    },

    itemPrice: {
      color: Colors.gold,
      fontFamily: Fonts.medium,
      fontSize: 14,
      marginTop: 5,
    },

    itemRight: {
      alignItems: "flex-end",
      justifyContent: "center",
      marginLeft: 2,
      marginTop: 12,
    },

    quantityContainer: {
      height: 30,
      minWidth: 76,
      borderRadius: 7,
      backgroundColor: Colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 4,
    },

    quantityButton: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },

    quantityText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 14,
      minWidth: 15,
      textAlign: "center",
    },

    itemTotal: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 13,
      marginTop: 7,
    },

    removeButton: {
      position: "absolute",
      right: 3,
      top: 2,
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
    },

    addMoreButton: {
      marginHorizontal: 15,
      marginTop: 10,
      paddingHorizontal: 13,
      paddingVertical: 13,
      backgroundColor: Colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.border,
      flexDirection: "row",
      alignItems: "center",
    },

    addMoreIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(255,32,40,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },

    addMoreText: {
      flex: 1,
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      marginLeft: 9,
    },

    couponSection: {
      marginHorizontal: 15,
      marginTop: 15,
      padding: 13,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
    },

    couponHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    couponIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,32,40,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },

    couponTitle: {
      color: Colors.primary,
      fontFamily: Fonts.bold,
      fontSize: 17,
      marginLeft: 9,
    },

    couponSubtitle: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 13,
      marginLeft: 9,
      marginTop: 2,
    },

    couponInputRow: {
      height: 42,
      marginTop: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
    },

    couponInput: {
      flex: 1,
      height: "100%",
      paddingHorizontal: 11,
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    applyButton: {
      height: "100%",
      paddingHorizontal: 15,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    appliedButton: {
      backgroundColor: Colors.success,
    },

    applyButtonText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 12,
    },

    appliedCouponRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },

    appliedCouponText: {
      color: Colors.success,
      fontFamily: Fonts.regular,
      fontSize: 13,
      marginLeft: 5,
    },

    offerTip: {
      marginHorizontal: 15,
      marginTop: 12,
      padding: 11,
      borderRadius: 10,
      backgroundColor: "rgba(255,184,0,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,184,0,0.2)",
      flexDirection: "row",
      alignItems: "center",
    },

    offerTipIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "rgba(255,184,0,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },

    offerTipContent: {
      marginLeft: 9,
      flex: 1,
    },

    offerTipTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.medium,
      fontSize: 14,
    },

    offerTipText: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 12,
      marginTop: 2,
    },

    billSection: {
      marginHorizontal: 15,
      marginTop: 15,
      padding: 14,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
    },

    billTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 18,
      marginBottom: 12,
    },

    billRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 5,
    },

    billLabel: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    billValue: {
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    freeText: {
      color: Colors.success,
      fontFamily: Fonts.bold,
      fontSize: 13,
    },

    discountLabel: {
      color: Colors.success,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    discountValue: {
      color: Colors.success,
      fontFamily: Fonts.bold,
      fontSize: 14,
    },

    billDivider: {
      height: 1,
      backgroundColor: Colors.divider,
      marginVertical: 10,
    },

    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    totalLabel: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    totalSubtext: {
      color: Colors.textMuted,
      fontFamily: Fonts.regular,
      fontSize: 12,
      marginTop: 2,
    },

    totalValue: {
      color: Colors.primary,
      fontFamily: Fonts.extraBold,
      fontSize: 21,
    },

    deliveryInfo: {
      marginHorizontal: 15,
      marginTop: 12,
      padding: 12,
      backgroundColor: Colors.surface,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
    },

    deliveryInfoContent: {
      flex: 1,
      marginLeft: 9,
    },

    deliveryInfoTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.medium,
      fontSize: 14,
    },

    deliveryInfoText: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 12,
      marginTop: 2,
    },

    bottomSpace: {
      height: 20,
    },

    checkoutBar: {
      position: "absolute",
      left: 10,
      right: 10,
      bottom: 10,
      minHeight: 65,
      paddingHorizontal: 14,
      borderRadius: 15,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },

    checkoutPriceContainer: {
      paddingLeft: 3,
    },

    checkoutLabel: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 13,
    },

    checkoutPrice: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 19,
      marginTop: 2,
    },

    checkoutButton: {
      height: 44,
      minWidth: 135,
      paddingHorizontal: 15,
      borderRadius: 10,
      backgroundColor: Colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    checkoutText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 14,
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 35,
    },

    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255,32,40,0.10)",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.extraBold,
      fontSize: 22,
      marginTop: 20,
      textAlign: "center",
    },

    emptyDescription: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 19,
      marginTop: 7,
    },

    startOrderingButton: {
      marginTop: 22,
      minHeight: 46,
      paddingHorizontal: 22,
      borderRadius: 23,
      backgroundColor: Colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    startOrderingText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 12,
    },

    refreshOverlay: {
      position: "absolute",
      top: 70,
      right: 15,
      padding: 10,
      borderRadius: 20,
      backgroundColor: Colors.surface,
    },
  });
