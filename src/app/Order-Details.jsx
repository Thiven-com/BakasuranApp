import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useTheme } from "../hooks/use-theme";
import Fonts from "../constants/Fonts";

const defaultItems = [
  {
    id: "1",
    name: "Chicken Biryani",
    description: "Regular | Spicy",
    price: 249,
    quantity: 1,
    icon: "fast-food-outline",
  },
  {
    id: "2",
    name: "Paneer Special",
    description: "Full Portion",
    price: 199,
    quantity: 1,
    icon: "restaurant-outline",
  },
  {
    id: "3",
    name: "Fried Chicken",
    description: "4 Pieces",
    price: 60,
    quantity: 1,
    icon: "flame-outline",
  },
];

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function OrderDetailsScreen() {
  const { colors: Colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const RED = Colors.primary;
  const WHITE = Colors.textPrimary;
  const GREY = Colors.textSecondary;
  const GREEN = Colors.success;
  const params = useLocalSearchParams();

  const orderId = params.orderId || "BAKA123456";
  const status = String(params.status || "Delivered");
  const paymentMethod = String(params.paymentMethod || "UPI");
  const address = String(
    params.address || "Home • Hitech City, Hyderabad, Telangana 500081",
  );

  // Default example data matches the reference UI.
  const items = defaultItems;

  const itemTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const deliveryFee = 30;
  const gst = Math.round(itemTotal * 0.05);
  const couponDiscount = 50;
  const calculatedTotal = itemTotal + deliveryFee + gst - couponDiscount;

  const grandTotal = params.total ? Number(params.total) : calculatedTotal;

  const isDelivered = status.toLowerCase() === "delivered";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/orders");
    }
  };

  const handleReorder = () => {
    Alert.alert("Reorder", "Would you like to order these items again?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        onPress: () => {
          // Connect this action to your cart logic when available.
          router.push("/(tabs)/cart");
        },
      },
    ]);
  };

  const handleHelp = () => {
    Alert.alert("Order Help", `How can we help you with order #${orderId}?`, [
      { text: "Close", style: "cancel" },
      {
        text: "Contact Support",
        onPress: () => {
          Alert.alert(
            "Support",
            "Connect your customer support screen or API here.",
          );
        },
      },
    ]);
  };

  const handleRateOrder = () => {
    Alert.alert("Rate Your Order", "How was your BAKASURAN experience?", [
      { text: "Cancel", style: "cancel" },
      { text: "⭐ 1", onPress: () => submitRating(1) },
      { text: "⭐⭐⭐ 3", onPress: () => submitRating(3) },
      { text: "⭐⭐⭐⭐⭐ 5", onPress: () => submitRating(5) },
    ]);
  };

  const submitRating = (rating) => {
    Alert.alert("Thank You!", `You rated your order ${rating} out of 5 stars.`);
  };

  const handleViewMap = () => {
    Alert.alert("Delivery Address", address, [{ text: "OK" }]);
  };

  const handleTrackOrder = () => {
    router.push({
      pathname: "/track-order",
      params: { orderId: String(orderId) },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={Colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Order Details</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Order information */}
        <View style={styles.orderInfo}>
          <View style={styles.orderInfoLeft}>
            <Text style={styles.orderNumber}>
              Order <Text style={styles.redText}>#{String(orderId)}</Text>
            </Text>

            <Text style={styles.orderDate}>12 Oct 2026, 12:32 PM</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isDelivered ? styles.deliveredBadge : styles.activeBadge,
            ]}
          >
            <Ionicons
              name={isDelivered ? "checkmark-circle" : "time-outline"}
              size={18}
              color={isDelivered ? GREEN : RED}
            />
            <Text
              style={[styles.statusText, { color: isDelivered ? GREEN : RED }]}
            >
              {status}
            </Text>
          </View>
        </View>

        {/* Order progress timeline */}
        <View style={styles.timeline}>
          {[
            {
              icon: "receipt-outline",
              title: "Order Placed",
              time: "12:32 PM",
              completed: true,
            },
            {
              icon: "restaurant-outline",
              title: "Preparing",
              time: "12:40 PM",
              completed: true,
            },
            {
              icon: "bicycle-outline",
              title: "Out for Delivery",
              time: "01:05 PM",
              completed: true,
            },
            {
              icon: "home-outline",
              title: "Delivered",
              time: "01:20 PM",
              completed: isDelivered,
            },
          ].map((step, index, array) => (
            <View style={styles.timelineStep} key={step.title}>
              <View
                style={[
                  styles.timelineCircle,
                  step.completed
                    ? styles.timelineCircleCompleted
                    : styles.timelineCirclePending,
                ]}
              >
                <Ionicons
                  name={step.icon}
                  size={23}
                  color={step.completed ? WHITE : GREY}
                />
              </View>

              <Text style={styles.timelineTitle}>{step.title}</Text>
              <Text style={styles.timelineTime}>{step.time}</Text>

              {index < array.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    step.completed
                      ? styles.timelineLineCompleted
                      : styles.timelineLinePending,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Address */}
        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="location" size={26} color={RED} />
          </View>

          <View style={styles.addressContent}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.secondaryText}>{address}</Text>
          </View>

          <TouchableOpacity
            style={styles.mapButton}
            activeOpacity={0.75}
            onPress={handleViewMap}
          >
            <Ionicons name="map-outline" size={19} color={RED} />
            <Text style={styles.mapButtonText}>Map</Text>
          </TouchableOpacity>
        </View>

        {/* Payment details */}
        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="wallet-outline" size={25} color={RED} />
          </View>

          <View style={styles.paymentContent}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <Text style={styles.secondaryText}>Paid via {paymentMethod}</Text>

            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={14} color={GREEN} />
              <Text style={styles.paidText}>
                {isDelivered ? "Paid Successfully" : "Payment Status"}
              </Text>
            </View>
          </View>

          <Text style={styles.paymentAmount}>{formatMoney(grandTotal)}</Text>
        </View>

        {/* Order items */}
        <View style={styles.itemsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={22} color={RED} />
            <Text style={styles.sectionTitle}>
              Order Items ({items.length})
            </Text>
          </View>

          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index === items.length - 1 && styles.lastItemRow,
              ]}
            >
              <View style={styles.foodPlaceholder}>
                <Ionicons name={item.icon} size={30} color={RED} />
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>

              <Text style={styles.quantityText}>Qty: {item.quantity}</Text>

              <Text style={styles.itemPrice}>
                {formatMoney(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Bill summary */}
        <View style={styles.summaryCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={22} color={RED} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>{formatMoney(itemTotal)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>{formatMoney(deliveryFee)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST (5%)</Text>
            <Text style={styles.billValue}>{formatMoney(gst)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Coupon Discount</Text>
            <Text style={styles.discountValue}>
              -{formatMoney(couponDiscount)}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalAmount}>
              {formatMoney(grandTotal)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.reorderButton}
          activeOpacity={0.8}
          onPress={handleReorder}
          accessibilityRole="button"
        >
          <Ionicons name="refresh-outline" size={24} color={WHITE} />

          <View style={styles.actionTextContainer}>
            <Text style={styles.reorderTitle}>Reorder</Text>
            <Text style={styles.reorderSubtitle}>Order these items again</Text>
          </View>

          <Ionicons name="chevron-forward" size={23} color={WHITE} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineAction}
          activeOpacity={0.75}
          onPress={handleHelp}
          accessibilityRole="button"
        >
          <Ionicons name="headset-outline" size={25} color={RED} />

          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Get Help</Text>
            <Text style={styles.actionSubtitle}>
              Need help with this order?
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={23} color={RED} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineAction}
          activeOpacity={0.75}
          onPress={handleRateOrder}
          accessibilityRole="button"
        >
          <Ionicons name="star" size={25} color={RED} />

          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Rate Your Order</Text>
            <Text style={styles.actionSubtitle}>Share your experience</Text>
          </View>

          <Ionicons name="chevron-forward" size={23} color={RED} />
        </TouchableOpacity>

        {!isDelivered && (
          <TouchableOpacity
            style={styles.trackButton}
            activeOpacity={0.8}
            onPress={handleTrackOrder}
          >
            <Ionicons name="bicycle-outline" size={21} color={WHITE} />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          activeOpacity={0.8}
          onPress={() => router.replace("/(tabs)")}
        >
          <Ionicons name="home-outline" size={20} color={RED} />
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>FEAST LIKE A BAKASURAN</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (Colors) => {
  const RED = Colors.primary;
  const BG = Colors.background;
  const CARD = Colors.surface;
  const BORDER = Colors.border;
  const WHITE = Colors.textPrimary;
  const GREY = Colors.textSecondary;
  const GREEN = Colors.success;
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTitle: {
    flex: 1,
    color: WHITE,
    fontFamily: Fonts.bold,
    fontSize: 25,
  },

  headerSpacer: {
    width: 8,
  },

  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },

  orderInfoLeft: {
    flex: 1,
  },

  orderNumber: {
    fontFamily: Fonts.semiBold,
    fontSize: 22,
    color: WHITE,
    marginBottom: 7,
  },

  redText: {
    color: RED,
  },

  orderDate: {
    color: GREY,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 22,
  },

  deliveredBadge: {
    backgroundColor: "rgba(34,197,94,0.10)",
    borderColor: GREEN,
    borderWidth: 1,
  },

  activeBadge: {
    backgroundColor: "rgba(255,32,40,0.10)",
    borderColor: RED,
    borderWidth: 1,
  },

  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },

  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
    paddingHorizontal: 1,
  },

  timelineStep: {
    width: "25%",
    alignItems: "center",
    position: "relative",
  },

  timelineCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 2,
  },

  timelineCircleCompleted: {
    backgroundColor: RED,
    borderColor: RED,
  },

  timelineCirclePending: {
    backgroundColor: Colors.backgroundElement,
    borderColor: Colors.border,
  },

  timelineTitle: {
    fontFamily: Fonts.semiBold,
    color: Colors.goldDark,
    fontSize: 14,
    textAlign: "center",
    minHeight: 28,
  },

  timelineTime: {
    fontFamily: Fonts.regular,
    color: GREY,
    fontSize: 13,
    marginTop: 3,
  },

  timelineLine: {
    position: "absolute",
    height: 3,
    width: "43%",
    left: "78%",
    top: 25,
    borderRadius: 2,
  },

  timelineLineCompleted: {
    backgroundColor: RED,
  },

  timelineLinePending: {
    backgroundColor: Colors.divider,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    marginBottom: 13,
    gap: 12,
  },

  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  addressContent: {
    flex: 1,
  },

  paymentContent: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: WHITE,
    marginBottom: 6,
  },

  secondaryText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: GREY,
    lineHeight: 19,
  },

  mapButton: {
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  mapButtonText: {
    color: RED,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },

  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 7,
  },

  paidText: {
    color: GREEN,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },

  paymentAmount: {
    fontFamily: Fonts.bold,
    color: WHITE,
    fontSize: 23,
  },

  itemsCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    marginBottom: 13,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 14,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 9,
  },

  lastItemRow: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  foodPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  itemDetails: {
    flex: 1,
  },

  itemName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: WHITE,
    marginBottom: 5,
  },

  itemDescription: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.goldDark,
  },

  quantityText: {
    color: GREY,
    fontFamily: Fonts.regular,
    fontSize: 12,
  },

  itemPrice: {
    color: Colors.goldDark,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    minWidth: 48,
    textAlign: "right",
  },

  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
    marginBottom: 15,
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  billLabel: {
    fontFamily: Fonts.regular,
    fontSize: 17,
    color: GREY,
  },

  billValue: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: WHITE,
  },

  discountValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: GREEN,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 6,
  },

  grandTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 7,
  },

  grandTotalLabel: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: WHITE,
  },

  grandTotalAmount: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: RED,
  },

  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: RED,
    minHeight: 76,
    borderRadius: 17,
    paddingHorizontal: 18,
    gap: 14,
    marginBottom: 12,
  },

  actionTextContainer: {
    flex: 1,
  },

  reorderTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: WHITE,
    marginBottom: 4,
  },

  reorderSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: WHITE,
  },

  outlineAction: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 17,
    paddingHorizontal: 18,
    gap: 14,
    marginBottom: 12,
    backgroundColor: Colors.surface,
  },

  actionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: WHITE,
    marginBottom: 4,
  },

  actionSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: GREY,
  },

  trackButton: {
    backgroundColor: RED,
    borderRadius: 14,
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 10,
  },

  trackButtonText: {
    color: WHITE,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },

  homeButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  homeButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: RED,
  },

  footerText: {
    textAlign: "center",
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    letterSpacing: 2,
    color: "#777777",
    marginTop: 15,
  },
  });
};
