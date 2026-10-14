import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const CheckoutScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  // ==========================================================
  // STATE
  // ==========================================================

  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [instructions, setInstructions] = useState("");

  const [address, setAddress] = useState({
    type: "Home",
    line1: "Hitech City, Hyderabad",
    line2: "Telangana 500081",
  });

  // ==========================================================
  // ORDER DATA
  // ==========================================================

  const orderItems = [
    {
      id: "1",
      name: "Chicken Biryani",
      quantity: 1,
      price: 249,
    },
    {
      id: "2",
      name: "Paneer Special",
      quantity: 1,
      price: 199,
    },
    {
      id: "3",
      name: "Fried Chicken",
      quantity: 1,
      price: 60,
    },
  ];

  // ==========================================================
  // BILL CALCULATION
  // ==========================================================

  const itemTotal = useMemo(() => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, []);

  const deliveryFee = 30;

  const gst = Math.round(itemTotal * 0.05);

  const couponDiscount = 50;

  const grandTotal = itemTotal + deliveryFee + gst - couponDiscount;

  // ==========================================================
  // PAYMENT DATA
  // ==========================================================

  const paymentMethods = [
    {
      id: "card",
      title: "Credit/Debit Card",
      subtitle: "Visa, Mastercard, Rupay & more",
      icon: "card-outline",
      iconColor: Colors.info,
    },
    {
      id: "upi",
      title: "UPI",
      subtitle: "Google Pay, PhonePe, Paytm & more",
      icon: "phone-portrait-outline",
      iconColor: Colors.primary,
    },
    {
      id: "wallet",
      title: "Wallet",
      subtitle: "Amazon Pay, Mobikwik & more",
      icon: "wallet-outline",
      iconColor: Colors.textPrimary,
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      subtitle: "Pay when you receive your order",
      icon: "cash-outline",
      iconColor: Colors.success,
    },
  ];

  // ==========================================================
  // CHANGE ADDRESS
  // ==========================================================

  const handleChangeAddress = () => {
    Alert.alert("Change Address", "Choose delivery address", [
      {
        text: "Home",
        onPress: () => {
          setAddress({
            type: "Home",
            line1: "Hitech City, Hyderabad",
            line2: "Telangana 500081",
          });
        },
      },
      {
        text: "Work",
        onPress: () => {
          setAddress({
            type: "Work",
            line1: "Madhapur, Hyderabad",
            line2: "Telangana 500081",
          });
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // ==========================================================
  // PAYMENT SELECTION
  // ==========================================================

  const handlePaymentSelect = (id) => {
    setPaymentMethod(id);
  };

  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  // File must exist at: app/order-success.jsx
  const goToSuccess = () => {
    router.replace("/order-success");
  };

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      if (Platform.OS === "web") {
        window.alert("Please select a payment method.");
      } else {
        Alert.alert("Select Payment", "Please select a payment method.");
      }
      return;
    }

    // Alert.alert buttons do not work on web, so use window.confirm there
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Place your order for ₹${grandTotal}?`);
      if (confirmed) goToSuccess();
      return;
    }

    Alert.alert("Confirm Order", `Place your order for ₹${grandTotal}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Place Order",
        onPress: goToSuccess,
      },
    ]);
  };

  // ==========================================================
  // PAYMENT ICON
  // ==========================================================

  const renderPaymentIcon = (item) => {
    if (item.id === "upi") {
      return (
        <View style={styles.upiIcon}>
          <View style={styles.upiShapeOne} />
          <View style={styles.upiShapeTwo} />
        </View>
      );
    }

    if (item.id === "cod") {
      return (
        <View style={styles.cashIcon}>
          <Ionicons name="cash-outline" size={24} color={Colors.success} />
        </View>
      );
    }

    return (
      <View style={styles.paymentIcon}>
        <Ionicons name={item.icon} size={24} color={item.iconColor} />
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

        <Text style={styles.headerTitle}>Checkout</Text>

        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==================================================
            CHECKOUT STEPS
        ================================================== */}

        <View style={styles.stepsContainer}>
          <View style={styles.stepActive}>
            <Text style={styles.stepActiveText}>1. Delivery</Text>
          </View>

          <View style={styles.stepLineActive} />

          <View style={styles.stepInactive}>
            <Text style={styles.stepInactiveText}>2. Payment</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepInactive}>
            <Text style={styles.stepInactiveText}>3. Review</Text>
          </View>
        </View>

        {/* ==================================================
            ADDRESS CARD
        ================================================== */}

        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={27} color={Colors.white} />
          </View>

          <View style={styles.addressContent}>
            <Text style={styles.addressType}>{address.type}</Text>

            <Text style={styles.addressLine1}>{address.line1}</Text>

            <Text style={styles.addressLine2}>{address.line2}</Text>
          </View>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangeAddress}
            activeOpacity={0.7}
          >
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* ==================================================
            DELIVERY INSTRUCTIONS
        ================================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Delivery Instructions
            <Text style={styles.optionalText}> (Optional)</Text>
          </Text>

          <View style={styles.instructionInputContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={21}
              color={Colors.textMuted}
            />

            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g. Leave at the door"
              placeholderTextColor={Colors.textMuted}
              style={styles.instructionInput}
              multiline={false}
            />
          </View>
        </View>

        {/* ==================================================
            PAYMENT METHOD
        ================================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.paymentContainer}>
            {paymentMethods.map((item, index) => {
              const selected = paymentMethod === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.paymentRow,
                    selected && styles.paymentRowSelected,
                    index === paymentMethods.length - 1 &&
                      styles.paymentRowLast,
                  ]}
                  onPress={() => handlePaymentSelect(item.id)}
                  activeOpacity={0.8}
                >
                  {/* RADIO */}

                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>

                  {/* ICON */}

                  {renderPaymentIcon(item)}

                  {/* CONTENT */}

                  <View style={styles.paymentContent}>
                    <Text style={styles.paymentTitle}>{item.title}</Text>

                    <Text style={styles.paymentSubtitle}>{item.subtitle}</Text>
                  </View>

                  {/* ARROW */}

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ==================================================
            ORDER SUMMARY
        ================================================== */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <Text style={styles.itemCount}>{orderItems.length} items</Text>
          </View>

          {/* ITEM TOTAL */}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Total</Text>

            <Text style={styles.summaryValue}>₹{itemTotal}</Text>
          </View>

          {/* DELIVERY */}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>

            <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
          </View>

          {/* GST */}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST & Taxes (5%)</Text>

            <Text style={styles.summaryValue}>₹{gst}</Text>
          </View>

          {/* COUPON */}

          <View style={styles.summaryRow}>
            <Text style={styles.discountLabel}>Coupon Discount</Text>

            <Text style={styles.discountValue}>-₹{couponDiscount}</Text>
          </View>

          {/* DIVIDER */}

          <View style={styles.summaryDivider} />

          {/* TOTAL */}

          <View style={styles.toPayRow}>
            <Text style={styles.toPayLabel}>To Pay</Text>

            <Text style={styles.toPayValue}>₹{grandTotal}</Text>
          </View>
        </View>

        {/* ==================================================
            SECURITY
        ================================================== */}

        <View style={styles.securityContainer}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark"
              size={17}
              color={Colors.success}
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Safe & Secure Payment</Text>

            <Text style={styles.securityText}>
              Your payment information is encrypted and secure.
            </Text>
          </View>
        </View>

        {/* SPACE FOR BOTTOM BUTTON */}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ====================================================
          PLACE ORDER BUTTON
      ==================================================== */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          activeOpacity={0.85}
        >
          <Text style={styles.placeOrderText}>Place Order</Text>

          <Text style={styles.placeOrderAmount}>₹{grandTotal}</Text>

          <Ionicons name="arrow-forward" size={21} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutScreen;

// ============================================================
// STYLES
// ============================================================

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    height: 64,
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

  headerTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 25,
  },

  headerRightSpace: {
    width: 40,
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 105,
  },

  // ==========================================================
  // STEPS
  // ==========================================================

  stepsContainer: {
    height: 48,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  stepActive: {
    height: 44,
    paddingHorizontal: 17,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  stepActiveText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  stepInactive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  stepInactiveText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  stepLineActive: {
    width: 25,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  stepLine: {
    width: 25,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.divider,
  },

  // ==========================================================
  // ADDRESS
  // ==========================================================

  addressCard: {
    marginTop: 15,
    padding: 15,
    minHeight: 110,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  addressIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  addressContent: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 8,
  },

  addressType: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 19,
  },

  addressLine1: {
    color: Colors.textPrimary,
    fontFamily: Fonts.medium,
    fontSize: 17,
    marginTop: 4,
  },

  addressLine2: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 19,
    marginTop: 2,
  },

  changeButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: Colors.primaryDark,
  },

  changeText: {
    color: "#ffffff",
    fontFamily: Fonts.bold,
    fontSize: 14,
    textTransform: "uppercase",
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  section: {
    marginTop: 17,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 20,
    marginBottom: 9,
  },

  optionalText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  // ==========================================================
  // INSTRUCTIONS
  // ==========================================================

  instructionInputContainer: {
    height: 52,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  instructionInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 19,
  },

  // ==========================================================
  // PAYMENT
  // ==========================================================

  paymentContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: "hidden",
  },

  paymentRow: {
    minHeight: 78,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentRowSelected: {
    backgroundColor: "rgba(255,32,40,0.06)",
  },

  paymentRowLast: {
    borderBottomWidth: 0,
  },

  // ==========================================================
  // RADIO
  // ==========================================================

  radioOuter: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: Colors.primary,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  // ==========================================================
  // PAYMENT ICON
  // ==========================================================

  paymentIcon: {
    width: 42,
    height: 42,
    marginLeft: 12,
    borderRadius: 9,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  cashIcon: {
    width: 42,
    height: 42,
    marginLeft: 12,
    borderRadius: 9,
    backgroundColor: "rgba(34,197,94,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  upiIcon: {
    width: 42,
    height: 42,
    marginLeft: 12,
    borderRadius: 9,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  upiShapeOne: {
    width: 8,
    height: 26,
    backgroundColor: "#FF8A00",
    transform: [
      {
        skewY: "-18deg",
      },
    ],
  },

  upiShapeTwo: {
    width: 8,
    height: 26,
    marginLeft: 2,
    backgroundColor: "#00A86B",
    transform: [
      {
        skewY: "18deg",
      },
    ],
  },

  paymentContent: {
    flex: 1,
    marginLeft: 10,
  },

  paymentTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 17,
  },

  paymentSubtitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 18,
    marginTop: 4,
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryCard: {
    marginTop: 17,
    padding: 15,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  summaryTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 19,
  },

  itemCount: {
    color: Colors.primary,
    fontFamily: Fonts.regular,
    fontSize: 19,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },

  summaryLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },

  summaryValue: {
    color: Colors.textPrimary,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },

  discountLabel: {
    color: Colors.success,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },

  discountValue: {
    color: Colors.success,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },

  summaryDivider: {
    height: 1,
    borderTopWidth: 1,
    borderTopColor: Colors.textMuted,
    borderStyle: "dashed",
    marginTop: 12,
    marginBottom: 13,
  },

  toPayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toPayLabel: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 18,
  },

  toPayValue: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 22,
  },

  // ==========================================================
  // SECURITY
  // ==========================================================

  securityContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  securityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(34,197,94,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  securityContent: {
    flex: 1,
    marginLeft: 9,
  },

  securityTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 17,
  },

  securityText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 17,
    marginTop: 2,
  },

  bottomSpace: {
    height: 20,
  },

  // ==========================================================
  // BOTTOM BAR
  // ==========================================================

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  placeOrderButton: {
    height: 52,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  placeOrderText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: 20,
  },

  placeOrderAmount: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: 19,
    marginLeft: 5,
    marginRight: 10,
  },
});
