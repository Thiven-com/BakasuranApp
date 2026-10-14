import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";

// ============================================================
// INITIAL CART DATA
// ============================================================

const initialCart = [
  {
    id: "1",
    name: "Chicken Biryani",
    restaurant: "Spice House",
    price: 249,
    quantity: 1,
    image: require("../../../assets/images/chicken_biryani.jpg"),
    isVeg: false,
  },
  {
    id: "2",
    name: "Paneer Special",
    restaurant: "Spice House",
    price: 199,
    quantity: 1,
    image: require("../../../assets/images/paneer.jpg"),
    isVeg: true,
  },
  {
    id: "3",
    name: "Fried Chicken",
    restaurant: "Spice House",
    price: 279,
    quantity: 1,
    image: require("../../../assets/images/fried_chicken.jpg"),
    isVeg: false,
  },
];

// ============================================================
// CART SCREEN
// ============================================================

const CartScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const [cartItems, setCartItems] = useState(initialCart);

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // ==========================================================
  // REMOVE
  // ==========================================================

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================================
  // TOTAL ITEMS
  // ==========================================================

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // ==========================================================
  // SUBTOTAL
  // ==========================================================

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [cartItems]);

  // ==========================================================
  // DELIVERY
  // ==========================================================

  const deliveryFee = subtotal >= 299 ? 0 : 30;

  // ==========================================================
  // GST
  // ==========================================================

  const gst = Math.round(subtotal * 0.05);

  // ==========================================================
  // COUPON DISCOUNT
  // ==========================================================

  const couponDiscount = appliedCoupon
    ? Math.min(Math.round(subtotal * 0.1), 100)
    : 0;

  // ==========================================================
  // TOTAL
  // ==========================================================

  const grandTotal = subtotal + deliveryFee + gst - couponDiscount;

  // ==========================================================
  // APPLY COUPON
  // ==========================================================

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      Alert.alert("Enter Coupon", "Please enter a coupon code.");
      return;
    }

    if (code === "BAKA50" || code === "BAKA30" || code === "BAKASURAN") {
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

    // Checkout screen will be created next.
    router.push("/CheckoutScreen");
  };

  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={21} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Your Cart</Text>

          <View style={styles.headerButton} />
        </View>

        {/* EMPTY */}

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={60} color={Colors.primary} />
          </View>

          <Text style={styles.emptyTitle}>Your cart is empty</Text>

          <Text style={styles.emptyDescription}>
            Looks like you haven't added anything delicious yet.
          </Text>

          <TouchableOpacity
            style={styles.startOrderingButton}
            onPress={() => router.push("/explore")}
            activeOpacity={0.85}
          >
            <Text style={styles.startOrderingText}>START ORDERING</Text>

            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          onPress={() => {
            Alert.alert("Clear Cart", "Remove all items from your cart?", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Clear",
                style: "destructive",
                onPress: () => setCartItems([]),
              },
            ]);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={19} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==================================================
            RESTAURANT
        ================================================== */}

        <View style={styles.restaurantSection}>
          <View style={styles.restaurantIcon}>
            <Ionicons name="restaurant" size={20} color={Colors.white} />
          </View>

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>Spice House</Text>

            <Text style={styles.restaurantLocation}>
              Hitech City, Hyderabad
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>

        {/* ==================================================
            CART ITEMS
        ================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Items</Text>

          <Text style={styles.itemCount}>{totalItems} items</Text>
        </View>

        <View style={styles.itemsContainer}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              {/* IMAGE */}

              <View style={styles.itemImageContainer}>
                <Image
                  source={item.image}
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

              {/* DETAILS */}

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>

                <Text style={styles.itemRestaurant}>{item.restaurant}</Text>

                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>

              {/* QUANTITY */}

              <View style={styles.itemRight}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => decreaseQuantity(item.id)}
                  >
                    <Ionicons name="remove" size={15} color={Colors.white} />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => increaseQuantity(item.id)}
                  >
                    <Ionicons name="add" size={15} color={Colors.white} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemTotal}>
                  ₹{item.price * item.quantity}
                </Text>
              </View>

              {/* REMOVE */}

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Ionicons name="close" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ==================================================
            ADD MORE
        ================================================== */}

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

        {/* ==================================================
            COUPON
        ================================================== */}

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
              onChangeText={setCoupon}
              placeholder="Enter coupon code"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
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

        {/* ==================================================
            OFFERS
        ================================================== */}

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

        {/* ==================================================
            BILL DETAILS
        ================================================== */}

        <View style={styles.billSection}>
          <Text style={styles.billTitle}>Bill Details</Text>

          {/* SUBTOTAL */}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item total</Text>

            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          {/* DELIVERY */}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery fee</Text>

            {deliveryFee === 0 ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : (
              <Text style={styles.billValue}>₹{deliveryFee}</Text>
            )}
          </View>

          {/* GST */}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST & taxes</Text>

            <Text style={styles.billValue}>₹{gst}</Text>
          </View>

          {/* DISCOUNT */}

          {couponDiscount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon discount</Text>

              <Text style={styles.discountValue}>-₹{couponDiscount}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          {/* TOTAL */}

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>To Pay</Text>

              <Text style={styles.totalSubtext}>Inclusive of all taxes</Text>
            </View>

            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        {/* ==================================================
            DELIVERY INFORMATION
        ================================================== */}

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

      {/* ====================================================
          CHECKOUT BAR
      ==================================================== */}

      <View style={styles.checkoutBar}>
        <View style={styles.checkoutPriceContainer}>
          <Text style={styles.checkoutLabel}>Total</Text>

          <Text style={styles.checkoutPrice}>₹{grandTotal}</Text>
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
    </View>
  );
};

export default CartScreen;

// ============================================================
// STYLES
// ============================================================

const makeStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

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
    fontSize: 16,
    marginTop: 2,
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollContent: {
    paddingBottom: 100,
  },

  // ==========================================================
  // RESTAURANT
  // ==========================================================

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
    fontSize: 20,
  },

  restaurantLocation: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 17,
    marginTop: 3,
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

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

  // ==========================================================
  // ITEMS
  // ==========================================================

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
    width: 76,
    height: 76,
    position: "relative",
  },

  itemImage: {
    width: 76,
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
    marginLeft: 10,
    paddingRight: 5,
  },

  itemName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 20,
    lineHeight: 19,
  },

  itemRestaurant: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 19,
    marginTop: 3,
  },

  itemPrice: {
    color: Colors.gold,
    fontFamily: Fonts.regular,
    fontSize: 18,
    marginTop: 5,
  },

  itemRight: {
    alignItems: "flex-end",
    justifyContent: "center",
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
    fontFamily: Fonts.regular,
    fontSize: 16,
    minWidth: 15,
    textAlign: "center",
  },

  itemTotal: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 15,
    marginTop: 7,
  },

  removeButton: {
    position: "absolute",
    right: 5,
    top: 4,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // ADD MORE
  // ==========================================================

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
    fontSize: 17,
    marginLeft: 9,
  },

  // ==========================================================
  // COUPON
  // ==========================================================

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
    fontFamily: Fonts.regular,
    fontSize: 20,
    marginLeft: 9,
  },

  couponSubtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
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
    fontSize: 15,
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
    fontFamily: Fonts.regular,
    fontSize: 13,
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

  // ==========================================================
  // OFFER TIP
  // ==========================================================

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
    fontFamily: Fonts.regular,
    fontSize: 17,
  },

  offerTipText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 15,
    marginTop: 2,
  },

  // ==========================================================
  // BILL
  // ==========================================================

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
    fontFamily: Fonts.regular,
    fontSize: 20,
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
    fontSize: 19,
  },

  billValue: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 18,
  },

  freeText: {
    color: Colors.success,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  discountLabel: {
    color: Colors.success,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  discountValue: {
    color: Colors.success,
    fontFamily: Fonts.regular,
    fontSize: 15,
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
    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  totalSubtext: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginTop: 2,
  },

  totalValue: {
    color: Colors.primary,
    fontFamily: Fonts.extraBold,
    fontSize: 20,
  },

  // ==========================================================
  // DELIVERY INFO
  // ==========================================================

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
    fontSize: 17,
    marginTop: 2,
  },

  bottomSpace: {
    height: 20,
  },

  // ==========================================================
  // CHECKOUT BAR
  // ==========================================================

  checkoutBar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    height: 65,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  checkoutPriceContainer: {
    paddingLeft: 3,
  },

  checkoutLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  checkoutPrice: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 20,
    marginTop: 2,
  },

  checkoutButton: {
    height: 44,
    minWidth: 145,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  checkoutText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: 18,
  },

  // ==========================================================
  // EMPTY CART
  // ==========================================================

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
  },

  emptyDescription: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 7,
  },

  startOrderingButton: {
    marginTop: 22,
    height: 46,
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
    fontSize: 11,
  },
});
