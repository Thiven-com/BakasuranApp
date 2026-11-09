import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const RED = "#F9080C";
const DARK_RED = "#D70005";
const GOLD = "#FFB300";
const GREEN = "#1FA64A";

const HOME_ROUTE = "/"; // "Continue Ordering" destination
const TRACK_ROUTE = "/OrdersScreen"; // change to your orders / tracking screen

const formatCurrency = (value) => {
  const amount = Number(value);
  return `₹${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

const formatOrderTime = (date) => {
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
  return `${day}, ${time}`;
};

export default function DineInOrderSuccess() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();

  const textColor =
    colors?.textPrimary ?? colors?.text ?? (isDark ? "#FFFFFF" : "#171717");
  const mutedColor = colors?.textSecondary ?? (isDark ? "#A5A5A5" : "#5F5F5F");
  const cardColor =
    colors?.surface ?? colors?.card ?? (isDark ? "#151515" : "#F6F6F6");
  const borderColor = colors?.border ?? (isDark ? "#303030" : "#E5E5E5");
  const backgroundColor =
    colors?.background ?? (isDark ? "#090909" : "#FFFFFF");
  const tintColor = isDark ? "#2A1212" : "#FDECEC";
  const circleColor = isDark ? "#2A1212" : "#FDE9E9";

  const restaurantName = String(params?.restaurantName || "Restaurant");
  const tableNumber = String(params?.tableNumber || "");
  const guests = Number(params?.guests) || 0;
  const orderId = String(params?.orderId || "");
  const totalItems = Number(params?.totalItems) || 0;
  const totalAmount = params?.totalAmount ?? params?.totalPrice ?? 0;

  const [orderTime] = useState(() =>
    params?.orderTime ? String(params.orderTime) : formatOrderTime(new Date()),
  );

  const tableLine = [
    tableNumber ? `Table ${tableNumber}` : null,
    guests ? `${guests} Guest${guests > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join("  •  ");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace(HOME_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Dine-In Order
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <View style={[styles.circle, { backgroundColor: circleColor }]} />

          <MaterialCommunityIcons
            name="star-four-points"
            size={16}
            color={RED}
            style={{ position: "absolute", top: 18, left: 78 }}
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={10}
            color={RED}
            style={{ position: "absolute", top: 98, left: 74 }}
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={14}
            color={RED}
            style={{ position: "absolute", top: 12, right: 128 }}
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={16}
            color={RED}
            style={{ position: "absolute", top: 72, right: 96 }}
          />
          <MaterialCommunityIcons
            name="star-four-points"
            size={18}
            color={RED}
            style={{ position: "absolute", top: 108, right: 70 }}
          />

          <MaterialCommunityIcons
            name="silverware-fork"
            size={64}
            color={RED}
            style={{ position: "absolute", top: 78, left: 98 }}
          />
          <MaterialCommunityIcons
            name="knife"
            size={64}
            color={RED}
            style={{ position: "absolute", top: 78, right: 98 }}
          />

          <MaterialCommunityIcons name="room-service" size={132} color={GOLD} />

          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={26} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={[styles.subtitle, { color: mutedColor }]}>
          Your dine-in order has been placed successfully.
        </Text>

        {/* Restaurant card */}
        <View style={[styles.restaurantCard, { backgroundColor: tintColor }]}>
          <View
            style={[
              styles.restaurantIcon,
              { backgroundColor: isDark ? "#3A1818" : "#FBD9D9" },
            ]}
          >
            <MaterialCommunityIcons
              name="table-furniture"
              size={30}
              color={RED}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={[styles.restaurantName, { color: textColor }]}
            >
              {restaurantName}
            </Text>
            {tableLine ? (
              <View style={styles.tableRow}>
                <Ionicons name="location-outline" size={18} color={textColor} />
                <Text style={[styles.tableText, { color: mutedColor }]}>
                  {tableLine}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Order details */}
        <View
          style={[
            styles.detailsCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          {orderId ? (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={28}
                color={textColor}
                style={styles.detailIcon}
              />
              <View>
                <Text style={[styles.detailLabel, { color: mutedColor }]}>
                  Order ID
                </Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  #{orderId}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Ionicons
              name="time-outline"
              size={28}
              color={textColor}
              style={styles.detailIcon}
            />
            <View>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>
                Order Time
              </Text>
              <Text style={[styles.detailValue, { color: textColor }]}>
                {orderTime}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={[styles.detailRow, { marginBottom: 0 }]}>
            <MaterialCommunityIcons
              name="room-service-outline"
              size={28}
              color={textColor}
              style={styles.detailIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>
                Total Items
              </Text>
              <Text style={[styles.detailValueLarge, { color: textColor }]}>
                {totalItems} Item{totalItems === 1 ? "" : "s"}
              </Text>
            </View>
            <View
              style={[styles.verticalDivider, { backgroundColor: borderColor }]}
            />
            <View style={{ flex: 1, paddingLeft: 18 }}>
              <Text style={[styles.detailLabel, { color: mutedColor }]}>
                Total Amount
              </Text>
              <Text style={[styles.detailValueLarge, { color: RED }]}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.trackButton}
          activeOpacity={0.85}
          onPress={() => router.push(TRACK_ROUTE)}
          accessibilityRole="button"
        >
          <Ionicons name="location" size={22} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>Track Dine-In Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor }]}
          activeOpacity={0.85}
          onPress={() => router.replace(HOME_ROUTE)}
          accessibilityRole="button"
        >
          <Ionicons name="cart-outline" size={24} color={RED} />
          <Text style={styles.continueButtonText}>Continue Ordering</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontFamily: Fonts?.bold || undefined },
  content: { paddingHorizontal: 20, paddingBottom: 30 },

  illustrationWrap: {
    height: 230,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  circle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  checkBadge: {
    position: "absolute",
    top: 108,
    right: 112,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: DARK_RED,
    fontSize: 36,
    textAlign: "center",
    marginTop: -6,
    fontFamily: Fonts?.bold || undefined,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
    fontFamily: Fonts?.regular || undefined,
  },

  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    marginTop: 22,
    gap: 14,
  },
  restaurantIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantName: { fontSize: 20, fontFamily: Fonts?.bold || undefined },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  tableText: { fontSize: 15, fontFamily: Fonts?.regular || undefined },

  detailsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIcon: { width: 44 },
  detailLabel: { fontSize: 14, fontFamily: Fonts?.regular || undefined },
  detailValue: {
    fontSize: 17,
    marginTop: 2,
    fontFamily: Fonts?.bold || undefined,
  },
  detailValueLarge: {
    fontSize: 22,
    marginTop: 2,
    fontFamily: Fonts?.bold || undefined,
  },
  divider: { height: 1, marginBottom: 16 },
  verticalDivider: { width: 1, alignSelf: "stretch" },

  trackButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 22,
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: Fonts?.bold || undefined,
  },
  continueButton: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
  },
  continueButtonText: {
    color: RED,
    fontSize: 18,
    fontFamily: Fonts?.bold || undefined,
  },
});
