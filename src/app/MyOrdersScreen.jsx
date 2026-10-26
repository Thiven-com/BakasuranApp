import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { getOrders } from "../utils/Function";

const FALLBACK_IMAGE = require("../../assets/images/chicken_biryani.jpg");

const SERIF = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, 'Times New Roman', serif",
});

const GOLD_TEXT_FALLBACK = "#B7791F";
const GOLD_BG = "rgba(229,168,42,0.16)";
const GOLD_BORDER = "#E5A82A";
const GREEN_BG = "rgba(34,197,94,0.15)";
const GREY_BG = "rgba(139,149,167,0.18)";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Alert.alert does nothing on web
const notify = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const money = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// "26 Oct 2026, 09:29 AM"
const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  const hours = date.getHours();
  const hour12 = String(hours % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${date.getDate()} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}, ${hour12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
};

const capitalize = (value) => {
  const text = String(value ?? "").trim();

  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};

const extractOrders = (response) => {
  const data = response?.data;
  const orders = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : (data?.orders ?? data?.items ?? response?.orders ?? []);

  return Array.isArray(orders) ? orders : [];
};

const toOrderImage = (value) => {
  const image =
    typeof value === "string"
      ? value
      : (value?.url ?? value?.image_url ?? value?.path);

  return typeof image === "string" && image.trim()
    ? { uri: image }
    : FALLBACK_IMAGE;
};

const formatOrder = (order) => {
  const rawItems = order?.items ?? order?.order_items ?? order?.details ?? [];
  const list = Array.isArray(rawItems) ? rawItems : [];

  const lineItems = list.map((entry, index) => {
    const product =
      entry?.product ?? entry?.variant?.product ?? entry?.food ?? entry;

    return {
      id: String(entry?.id ?? index),
      name: product?.name ?? product?.title ?? entry?.name ?? "Item",
      quantity: Number(entry?.quantity ?? entry?.qty ?? 1) || 1,
      image: toOrderImage(
        product?.image_url ??
          product?.image ??
          entry?.image_url ??
          entry?.image,
      ),
    };
  });

  const quantitySum = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount =
    Number(order?.items_count ?? order?.item_count) || quantitySum;

  const rawStatus = String(
    order?.status ?? order?.order_status ?? order?.delivery_status ?? "pending",
  ).replace(/[_-]/g, " ");

  const normalizedStatus = rawStatus.toLowerCase();

  const statusType = normalizedStatus.includes("cancel")
    ? "cancelled"
    : ["delivered", "complete", "completed"].some((status) =>
          normalizedStatus.includes(status),
        )
      ? "delivered"
      : "preparing";

  const grandTotal = Number(
    order?.grand_total ??
      order?.total_amount ??
      order?.total ??
      order?.amount ??
      0,
  );

  const paymentStatus = capitalize(
    order?.payment_status ?? order?.payment?.status ?? "pending",
  );

  return {
    id: String(order?.id ?? order?.order_id ?? ""),
    number: String(
      order?.invoice_id ??
        order?.order_number ??
        order?.id ??
        order?.order_id ??
        "",
    ).replace(/^#/, ""),
    date: formatDate(order?.created_at ?? order?.order_date ?? order?.date),
    status: capitalize(rawStatus),
    statusType,
    lineItems: lineItems.slice(0, 3),
    extraItems: Math.max(lineItems.length - 3, 0),
    itemCount,
    subtotal: Number(order?.subtotal ?? grandTotal),
    shipping: Number(
      order?.delivery_total ??
        order?.shipping_total ??
        order?.delivery_fee ??
        0,
    ),
    tax: Number(order?.tax_total ?? order?.tax ?? 0),
    discount: Number(order?.discount_total ?? order?.discount ?? 0),
    total: grandTotal,
    paymentMethod: capitalize(
      order?.payment_method ?? order?.payment?.method ?? "—",
    ),
    paymentStatus,
    paymentPaid: ["paid", "success", "completed"].includes(
      paymentStatus.toLowerCase(),
    ),
  };
};

const getBannerText = (order) => {
  if (order.statusType === "delivered") {
    return "Your order was delivered successfully.";
  }

  if (order.statusType === "cancelled") {
    return "This order was cancelled.";
  }

  if (order.status.toLowerCase() === "pending") {
    return "Your order has been received and is awaiting confirmation.";
  }

  return `Your order is currently ${order.status}. We'll keep you updated.`;
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

const OrdersScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const GOLD = Colors.goldDark ?? GOLD_TEXT_FALLBACK;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getOrders();

      if (response?.success === 9) {
        router.replace("/login");
        return;
      }

      if (
        response?.success != null &&
        ![1, true, "1"].includes(response.success)
      ) {
        notify("Orders", response?.message || "Unable to load orders.");
        return;
      }

      setOrders(
        extractOrders(response)
          .map(formatOrder)
          .filter((order) => order.id),
      );
    } catch (error) {
      notify("Orders", error?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const openOrder = (order) => {
    router.push({
      pathname: "/Order-Details",
      params: { orderId: order.id, status: order.status },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const statusStyle = (order) => {
    if (order.statusType === "delivered") {
      return { bg: GREEN_BG, color: Colors.success, icon: "checkmark-circle" };
    }

    if (order.statusType === "cancelled") {
      return { bg: GREY_BG, color: "#8B95A7", icon: "close-circle" };
    }

    return { bg: GOLD_BG, color: GOLD, icon: "time" };
  };

  const renderHeader = () => (
    <View style={styles.hero}>
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowLine} />

        <Text style={styles.eyebrow}>BAKASURAN FOOD</Text>

        <View style={styles.eyebrowLine} />
      </View>

      <Text style={styles.heroTitle}>My Orders</Text>

      <Text style={styles.heroSubtitle}>
        View your recent food orders and track your deliveries, all in one
        place.
      </Text>
    </View>
  );

  const renderOrder = ({ item }) => {
    const tone = statusStyle(item);

    return (
      <View style={styles.orderCard}>
        {/* TOP ACCENT BAR */}
        <View style={styles.accentBar}>
          <View
            style={[styles.accentSegment, { backgroundColor: Colors.primary }]}
          />
          <View
            style={[styles.accentSegment, { backgroundColor: "#B8791B" }]}
          />
          <View
            style={[styles.accentSegment, { backgroundColor: GOLD_BORDER }]}
          />
        </View>

        <View style={styles.cardBody}>
          {/* NUMBER + TOTAL */}
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              <Text style={styles.eyebrowSmall}>ORDER NUMBER</Text>

              <Text style={styles.orderNumber} numberOfLines={1}>
                {item.number}
              </Text>

              <View style={[styles.statusPill, { backgroundColor: tone.bg }]}>
                <Ionicons name={tone.icon} size={15} color={tone.color} />

                <Text style={[styles.statusPillText, { color: tone.color }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.topRight}>
              <Text style={styles.eyebrowSmall}>TOTAL</Text>

              <Text style={styles.topTotal}>{money(item.total)}</Text>

              <Text style={styles.itemCount}>
                {item.itemCount} {item.itemCount === 1 ? "Item" : "Items"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* DATE */}
          <View style={styles.dateRow}>
            <View style={styles.dateIcon}>
              <Ionicons name="calendar" size={17} color={GOLD} />
            </View>

            <Text style={styles.dateText}>{item.date || "—"}</Text>
          </View>

          {/* ITEMS */}
          {item.lineItems.length > 0 && (
            <>
              <View style={styles.itemsRow}>
                {item.lineItems.map((line) => (
                  <View style={styles.itemCell} key={line.id}>
                    <Image
                      source={line.image}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />

                    <View style={styles.itemTextBlock}>
                      <Text style={styles.itemName} numberOfLines={3}>
                        {line.name}
                      </Text>

                      <Text style={styles.itemQty}>x{line.quantity}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {item.extraItems > 0 && (
                <Text style={styles.moreItems}>
                  +{item.extraItems} more{" "}
                  {item.extraItems === 1 ? "item" : "items"}
                </Text>
              )}
            </>
          )}

          {/* BILL BOX */}
          <View style={styles.billBox}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>{money(item.subtotal)}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Shipping</Text>
              <Text style={styles.billValue}>
                {item.shipping > 0 ? money(item.shipping) : "Free"}
              </Text>
            </View>

            {item.tax > 0 && (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>GST</Text>
                <Text style={styles.billValue}>{money(item.tax)}</Text>
              </View>
            )}

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount</Text>
              <Text style={styles.billValue}>- {money(item.discount)}</Text>
            </View>

            <View style={styles.dashedDivider} />

            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Total Amount</Text>
              <Text style={styles.billTotalValue}>{money(item.total)}</Text>
            </View>
          </View>

          {/* BANNER */}
          <View style={styles.banner}>
            <Ionicons name="alert-circle" size={22} color={GOLD} />

            <Text style={styles.bannerText}>{getBannerText(item)}</Text>
          </View>

          {/* PAYMENT */}
          <View style={styles.paymentRow}>
            <View>
              <Text style={styles.eyebrowSmall}>PAYMENT METHOD</Text>

              <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
            </View>

            <View style={styles.paymentRight}>
              <Text style={styles.eyebrowSmall}>PAYMENT STATUS</Text>

              <View
                style={[
                  styles.paymentPill,
                  { backgroundColor: item.paymentPaid ? GREEN_BG : GOLD_BG },
                ]}
              >
                <Text
                  style={[
                    styles.paymentPillText,
                    { color: item.paymentPaid ? Colors.success : GOLD },
                  ]}
                >
                  {item.paymentStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* ACTION */}
          <TouchableOpacity
            style={styles.viewButton}
            activeOpacity={0.85}
            onPress={() => openOrder(item)}
          >
            <Ionicons name="eye" size={22} color="#FFFFFF" />

            <Text style={styles.viewButtonText}>View Order Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Orders</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* ORDERS */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadOrders(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : (
                <Ionicons
                  name="receipt-outline"
                  size={42}
                  color={Colors.primary}
                />
              )}
            </View>

            <Text style={styles.emptyTitle}>
              {loading ? "Loading orders..." : "No Orders Found"}
            </Text>

            <Text style={styles.emptyText}>
              You haven't placed any orders yet.
            </Text>

            <TouchableOpacity
              style={styles.exploreButton}
              activeOpacity={0.85}
              onPress={() => router.push("/explore")}
            >
              <Text style={styles.exploreButtonText}>Explore Food</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default OrdersScreen;

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const createStyles = (Colors) => {
  const GOLD = Colors.goldDark ?? GOLD_TEXT_FALLBACK;
  const DIVIDER = Colors.divider ?? Colors.border;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    // HEADER
    header: {
      height: 60,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    backButton: {
      width: 42,
      height: 42,
      alignItems: "flex-start",
      justifyContent: "center",
    },

    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: Colors.primary,
      fontFamily: Fonts.semiBold,
      fontSize: 18,
    },

    headerSpacer: {
      width: 42,
    },

    // HERO
    hero: {
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 22,
    },

    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    eyebrowLine: {
      width: 34,
      height: 1.5,
      backgroundColor: GOLD,
    },

    eyebrow: {
      color: GOLD,
      fontFamily: Fonts.semiBold,
      fontSize: 12,
      letterSpacing: 3,
    },

    heroTitle: {
      color: Colors.primary,
      fontFamily: SERIF,
      fontWeight: "700",
      fontSize: 40,
      marginTop: 6,
    },

    heroSubtitle: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      marginTop: 10,
      paddingHorizontal: 14,
    },

    // LIST
    ordersList: {
      paddingHorizontal: 16,
      paddingBottom: 30,
    },

    // CARD
    orderCard: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: 18,
      overflow: "hidden",
    },

    accentBar: {
      flexDirection: "row",
      height: 3,
    },

    accentSegment: {
      flex: 1,
    },

    cardBody: {
      padding: 16,
    },

    eyebrowSmall: {
      color: Colors.textMuted ?? Colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 11,
      letterSpacing: 1.5,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    topLeft: {
      flexShrink: 1,
    },

    orderNumber: {
      color: Colors.primary,
      fontFamily: SERIF,
      fontWeight: "700",
      fontSize: 28,
      marginTop: 4,
      marginBottom: 10,
    },

    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
    },

    statusPillText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
    },

    topRight: {
      alignItems: "flex-end",
      marginLeft: 12,
    },

    topTotal: {
      color: Colors.primary,
      fontFamily: SERIF,
      fontWeight: "700",
      fontSize: 28,
      marginTop: 8,
    },

    itemCount: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 14,
      marginTop: 6,
    },

    divider: {
      height: 1,
      backgroundColor: DIVIDER,
      marginVertical: 14,
    },

    // DATE
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },

    dateIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: GOLD_BG,
      alignItems: "center",
      justifyContent: "center",
    },

    dateText: {
      flex: 1,
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    // ITEMS
    itemsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },

    itemCell: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    itemImage: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: Colors.card ?? Colors.background,
    },

    itemTextBlock: {
      flex: 1,
      marginLeft: 7,
    },

    itemName: {
      color: Colors.textPrimary,
      fontFamily: Fonts.semiBold,
      fontSize: 10.5,
      lineHeight: 14,
    },

    itemQty: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 10.5,
      marginTop: 2,
    },

    moreItems: {
      color: Colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 12,
      marginTop: -6,
      marginBottom: 14,
    },

    // BILL
    billBox: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
      marginBottom: 14,
    },

    billRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    billLabel: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    billValue: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    dashedDivider: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: Colors.textMuted ?? Colors.border,
      opacity: 0.6,
      marginTop: 2,
      marginBottom: 12,
    },

    billTotalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 6,
    },

    billTotalLabel: {
      color: Colors.primary,
      fontFamily: Fonts.bold,
      fontSize: 16,
    },

    billTotalValue: {
      color: Colors.primary,
      fontFamily: Fonts.bold,
      fontSize: 20,
    },

    // BANNER
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "rgba(229,168,42,0.12)",
      borderLeftWidth: 3,
      borderLeftColor: GOLD_BORDER,
      borderRadius: 6,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 16,
    },

    bannerText: {
      flex: 1,
      color: GOLD,
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 19,
    },

    // PAYMENT
    paymentRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 14,
    },

    paymentMethod: {
      color: Colors.primary,
      fontFamily: Fonts.bold,
      fontSize: 18,
      marginTop: 6,
    },

    paymentRight: {
      alignItems: "flex-end",
    },

    paymentPill: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 16,
      marginTop: 6,
    },

    paymentPillText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
    },

    // BUTTON
    viewButton: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: Colors.primary,
      borderRadius: 10,
    },

    viewButtonText: {
      color: "#FFFFFF",
      fontFamily: Fonts.semiBold,
      fontSize: 16,
    },

    // EMPTY STATE
    emptyContainer: {
      alignItems: "center",
      paddingTop: 50,
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,32,40,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,32,40,0.25)",
    },

    emptyTitle: {
      marginTop: 20,
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.xl,
    },

    emptyText: {
      marginTop: 8,
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.sm,
      textAlign: "center",
    },

    exploreButton: {
      marginTop: 22,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: Colors.primary,
    },

    exploreButtonText: {
      color: "#FFFFFF",
      fontFamily: Fonts.semiBold,
      fontSize: Fonts.size.sm,
    },
  });
};
