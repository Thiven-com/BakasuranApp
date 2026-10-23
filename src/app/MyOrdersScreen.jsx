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

import { useTheme } from "../hooks/use-theme";
import Fonts from "../constants/Fonts";
import { getOrders } from "../utils/Function";

const FALLBACK_IMAGE = require("../../assets/images/chicken_biryani.jpg");

const extractOrders = (response) => {
  const data = response?.data;
  const orders = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : data?.orders ?? data?.items ?? response?.orders ?? [];

  return Array.isArray(orders) ? orders : [];
};

const toOrderImage = (value) => {
  const image =
    typeof value === "string"
      ? value
      : value?.url ?? value?.image_url ?? value?.path;

  return typeof image === "string" && image.trim()
    ? { uri: image }
    : FALLBACK_IMAGE;
};

const formatOrder = (order) => {
  const items = order?.items ?? order?.order_items ?? order?.details ?? [];
  const firstItem = Array.isArray(items) ? items[0] : null;
  const product =
    firstItem?.product ??
    firstItem?.variant?.product ??
    firstItem?.food ??
    firstItem;
  const rawStatus = String(
    order?.status ?? order?.order_status ?? order?.delivery_status ?? "pending",
  );
  const normalizedStatus = rawStatus.toLowerCase().replace(/[_-]/g, " ");
  const statusType =
    normalizedStatus.includes("cancel")
      ? "cancelled"
      : ["delivered", "complete", "completed"].some((status) =>
            normalizedStatus.includes(status),
          )
        ? "delivered"
        : "preparing";
  const orderDate = order?.created_at ?? order?.order_date ?? order?.date;
  const parsedDate = orderDate ? new Date(orderDate) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  return {
    id: String(order?.id ?? order?.order_id ?? ""),
    name:
      product?.name ??
      product?.title ??
      firstItem?.name ??
      "Order",
    restaurant:
      order?.restaurant?.name ??
      order?.restaurant_name ??
      product?.restaurant?.name ??
      "",
    image: toOrderImage(
      product?.image_url ??
        product?.image ??
        firstItem?.image_url ??
        firstItem?.image,
    ),
    items: `${Array.isArray(items) ? items.length : 0} ${
      Array.isArray(items) && items.length === 1 ? "item" : "items"
    }`,
    price: `₹${Number(
      order?.grand_total ?? order?.total_amount ?? order?.total ?? order?.amount ?? 0,
    ).toLocaleString("en-IN")}`,
    date: formattedDate,
    status: rawStatus.replace(/[_-]/g, " "),
    statusType,
    action: statusType === "preparing" ? "Track" : "View",
  };
};

const filters = ["All Orders", "Ongoing", "Completed", "Cancelled"];

const OrdersScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const [activeFilter, setActiveFilter] = useState("All Orders");
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
        Alert.alert("Orders", response?.message || "Unable to load orders.");
        return;
      }

      setOrders(extractOrders(response).map(formatOrder).filter((order) => order.id));
    } catch (error) {
      Alert.alert("Orders", error?.message || "Unable to load orders.");
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

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "All Orders") {
      return true;
    }

    if (activeFilter === "Ongoing") {
      return order.statusType === "preparing";
    }

    if (activeFilter === "Completed") {
      return order.statusType === "delivered";
    }

    if (activeFilter === "Cancelled") {
      return order.statusType === "cancelled";
    }

    return true;
  });

  const getStatusColor = (type) => {
    switch (type) {
      case "delivered":
        return Colors.success;

      case "preparing":
        return Colors.warning;

      case "cancelled":
        return "#8B95A7";

      default:
        return Colors.textSecondary;
    }
  };

  const handleAction = (item) => {
    if (item.action === "Track") {
      router.push({
        pathname: "/Order-Details",
        params: { orderId: item.id, status: item.status },
      });
      return;
    }

    if (item.action === "Reorder") {
      // Add reorder functionality later
      return;
    }

    if (item.action === "View") {
      router.push({
        pathname: "/Order-Details",
        params: { orderId: item.id, status: item.status },
      });
      return;
    }
  };

  const renderOrder = ({ item }) => {
    const statusColor = getStatusColor(item.statusType);

    return (
      <TouchableOpacity style={styles.orderCard} activeOpacity={0.92}>
        {/* FOOD IMAGE */}

        <Image
          source={item.image}
          style={styles.foodImage}
          resizeMode="cover"
        />

        {/* ORDER CONTENT */}

        <View style={styles.orderContent}>
          {/* NAME */}

          <Text style={styles.orderName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* RESTAURANT */}

          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurant}
          </Text>

          {/* ORDER INFO */}

          <Text style={styles.orderInfo} numberOfLines={1}>
            {item.items}
            {"  •  "}
            {item.price}
            {"  •  "}
            {item.date}
          </Text>
        </View>

        {/* RIGHT SIDE */}

        <View style={styles.rightSection}>
          {/* STATUS */}

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusColor,
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: statusColor,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>

          {/* ACTION */}

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={() => handleAction(item)}
          >
            <Text style={styles.actionText}>{item.action}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={25} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Orders</Text>

        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
          <Ionicons
            name="notifications-outline"
            size={23}
            color={Colors.textPrimary}
          />

          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* FILTERS */}

      <View style={styles.filterWrapper}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = activeFilter === item;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.filterButton,
                  active && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(item)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ORDERS */}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
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
              You don't have any {activeFilter.toLowerCase()} yet.
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

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    height: 70,

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.surface,
  },

  headerTitle: {
    flex: 1,

    marginLeft: 12,

    color: Colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
  },

  notificationButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.surface,

    position: "relative",
  },

  notificationDot: {
    position: "absolute",

    top: 8,
    right: 9,

    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: Colors.primary,

    borderWidth: 1,
    borderColor: Colors.background,
  },

  /* =========================
     FILTER
  ========================= */

  filterWrapper: {
    marginTop: 16,
  },

  filterList: {
    paddingHorizontal: 18,
  },

  filterButton: {
    height: 42,

    paddingHorizontal: 20,

    marginRight: 10,

    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  filterButtonActive: {
    backgroundColor: Colors.primary,

    borderColor: Colors.primary,

    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,

    elevation: 5,
  },

  filterText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.sm,
  },

  filterTextActive: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
  },

  /* =========================
     ORDERS LIST
  ========================= */

  ordersList: {
    paddingHorizontal: 18,

    paddingTop: 18,
    paddingBottom: 30,
  },

  /* =========================
     ORDER CARD
  ========================= */

  orderCard: {
    minHeight: 150,

    marginBottom: 14,

    padding: 10,

    borderRadius: 20,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,

    overflow: "hidden",
  },

  /* =========================
     FOOD IMAGE
  ========================= */

  foodImage: {
    width: 105,
    height: 128,

    borderRadius: 14,

    backgroundColor: Colors.card,
  },

  /* =========================
     CONTENT
  ========================= */

  orderContent: {
    flex: 1,

    minWidth: 0,

    marginLeft: 12,

    justifyContent: "center",
  },

  orderName: {
    color: Colors.textPrimary,

    fontFamily: Fonts.medium,
    fontSize: 13,

    marginBottom: 5,
  },

  restaurantName: {
    color: Colors.textSecondary,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.sm,

    marginBottom: 10,
  },

  orderInfo: {
    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,

    lineHeight: 17,
  },

  /* =========================
     RIGHT SECTION
  ========================= */

  rightSection: {
    width: 88,

    marginLeft: 8,

    alignItems: "flex-end",
    justifyContent: "space-between",

    alignSelf: "stretch",

    paddingVertical: 4,
  },

  statusRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "flex-end",

    maxWidth: 88,
  },

  statusDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    marginRight: 6,
  },

  statusText: {
    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xs,
  },

  /* =========================
     ACTION BUTTON
  ========================= */

  actionButton: {
    minWidth: 78,

    height: 36,

    paddingHorizontal: 12,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.primary,

    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 4,
  },

  actionText: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
  },

  /* =========================
     EMPTY STATE
  ========================= */

  emptyContainer: {
    alignItems: "center",

    paddingTop: 90,

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
    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
  },
});
