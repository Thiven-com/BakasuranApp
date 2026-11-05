import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const RED = "#F9080C";

const parseItems = (value) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, index) => ({
      // Unique key: variant id first (product_id repeats across variants)
      id: String(
        item?.product_variant_id ??
          item?.variant_id ??
          item?.id ??
          item?.product_id ??
          index + 1,
      ),
      product_id: item?.product_id ?? item?.id ?? null,
      product_variant_id: item?.product_variant_id ?? item?.variant_id ?? null,
      name: item?.name || item?.product_name || "Food Item",
      price: Number(item?.price ?? item?.selling_price ?? 0),
      quantity: Math.max(1, Number(item?.quantity ?? 1)),
      image: item?.image || item?.image_url || "",
    }));
  } catch (error) {
    console.log("DINE-IN REVIEW ITEMS PARSE ERROR:", error?.message);
    return [];
  }
};

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

export default function DineInOrderReviewScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();

  const [items, setItems] = useState(() => parseItems(params?.items));
  const [specialInstructions, setSpecialInstructions] = useState("");

  const restaurantId = String(params?.restaurantId || "");
  const restaurantName = String(params?.restaurantName || "Restaurant");
  const tableId = String(params?.tableId || "");
  const tableNumber = String(params?.tableNumber || "");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const textColor = colors?.text || (isDark ? "#FFFFFF" : "#171717");
  const mutedColor = colors?.textSecondary || (isDark ? "#A5A5A5" : "#777777");
  const cardColor =
    colors?.card || colors?.surface || (isDark ? "#151515" : "#FFFFFF");
  const borderColor = colors?.border || (isDark ? "#303030" : "#E5E5E5");
  const backgroundColor =
    colors?.background || (isDark ? "#090909" : "#F7F7F7");

  const updateQuantity = (id, delta) => {
    setItems((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const goBackToMenu = () => {
    router.back();
  };

  const placeDineInOrder = () => {
    if (!items.length) {
      Alert.alert("Order is empty", "Add at least one food item to continue.");
      return;
    }

    const restaurantTableId = Number(tableId);
    if (!Number.isSafeInteger(restaurantTableId) || restaurantTableId <= 0) {
      console.log("PLACE ORDER: invalid tableId param:", params?.tableId);
      Alert.alert(
        "Table booking required",
        "Reserve a table before placing a dine-in food order.",
      );
      return;
    }

    if (
      items.some((item) => {
        const variantId = Number(item.product_variant_id);
        return !Number.isSafeInteger(variantId) || variantId <= 0;
      })
    ) {
      console.log(
        "PLACE ORDER: invalid variant in items:",
        JSON.stringify(items),
      );
      Alert.alert(
        "Menu item unavailable",
        "One or more items are missing a valid product variant. Please return to the menu and choose your items again.",
      );
      return;
    }

    router.replace({
      pathname: "/DineInOrderSuccess",
      params: {
        pendingOrder: JSON.stringify({
          restaurant_table_id: restaurantTableId,
          special_instructions: specialInstructions.trim(),
          products: items.map((item) => ({
            product_variant_id: Number(item.product_variant_id),
            quantity: item.quantity,
          })),
        }),
        restaurantId,
        restaurantName,
        tableId,
        tableNumber,
        totalItems: String(totalItems),
        totalAmount: String(subtotal),
        items: JSON.stringify(
          items.map((item) => ({
            id: item.product_variant_id,
            product_variant_id: item.product_variant_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        ),
      },
    });
  };

  const itemImage = (uri) =>
    uri
      ? { uri }
      : {
          uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80",
        };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={goBackToMenu}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Review Order
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.progressRow}>
          <View style={styles.progressStep}>
            <View style={styles.progressDone}>
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
            </View>
            <Text style={[styles.progressLabel, { color: mutedColor }]}>
              Menu
            </Text>
          </View>
          <View style={[styles.progressLine, { backgroundColor: RED }]} />
          <View style={styles.progressStep}>
            <View style={styles.progressCurrent}>
              <Text style={styles.progressNumber}>2</Text>
            </View>
            <Text style={[styles.progressLabel, { color: textColor }]}>
              Review
            </Text>
          </View>
          <View
            style={[styles.progressLine, { backgroundColor: borderColor }]}
          />
          <View style={styles.progressStep}>
            <View style={[styles.progressPending, { borderColor }]}>
              <Text
                style={[styles.progressNumberPending, { color: mutedColor }]}
              >
                3
              </Text>
            </View>
            <Text style={[styles.progressLabel, { color: mutedColor }]}>
              Confirm
            </Text>
          </View>
        </View>

        <View style={styles.pageHeading}>
          <Text style={[styles.pageTitle, { color: textColor }]}>
            Your Order
          </Text>
          <Text style={[styles.pageSubtitle, { color: mutedColor }]}>
            Check your items before placing the order.
          </Text>
        </View>

        <View
          style={[
            styles.tableCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View style={styles.tableIcon}>
            <Ionicons name="restaurant-outline" size={23} color="#FFFFFF" />
          </View>
          <View style={styles.tableInfo}>
            <Text style={[styles.restaurantName, { color: textColor }]}>
              {restaurantName}
            </Text>
            <Text style={[styles.tableCaption, { color: mutedColor }]}>
              {tableNumber
                ? `Dine-In · Table ${tableNumber}`
                : "A confirmed table booking is required"}
            </Text>
          </View>
          <View style={styles.dineBadge}>
            <View style={styles.dineDot} />
            <Text style={styles.dineBadgeText}>DINE-IN</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Order Items
          </Text>
          <Text style={[styles.itemCount, { color: mutedColor }]}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Text>
        </View>

        {items.length ? (
          <View
            style={[
              styles.itemsCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            {items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.orderItem}>
                  <Image
                    source={itemImage(item.image)}
                    style={styles.foodImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text
                      numberOfLines={2}
                      style={[styles.foodName, { color: textColor }]}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.foodPrice, { color: mutedColor }]}>
                      {formatCurrency(item.price)}
                    </Text>
                    <Text style={[styles.lineTotal, { color: textColor }]}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, -1)}
                      style={styles.quantityButton}
                    >
                      <Ionicons name="remove" size={17} color={RED} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
                      style={styles.quantityButton}
                    >
                      <Ionicons name="add" size={17} color={RED} />
                    </TouchableOpacity>
                  </View>
                </View>
                {index !== items.length - 1 && (
                  <View
                    style={[
                      styles.itemDivider,
                      { backgroundColor: borderColor },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <Ionicons name="cart-outline" size={42} color={mutedColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No items in your order
            </Text>
            <Text style={[styles.emptyDescription, { color: mutedColor }]}>
              Go back to the menu and add your favourite food.
            </Text>
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={goBackToMenu}
            >
              <Text style={styles.addMoreText}>Add Food Items</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.addMoreRow} onPress={goBackToMenu}>
          <Ionicons name="add-circle-outline" size={20} color={RED} />
          <Text style={styles.addMoreRowText}>Add more items</Text>
        </TouchableOpacity>

        <View
          style={[styles.billCard, { backgroundColor: cardColor, borderColor }]}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Bill Summary
          </Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: mutedColor }]}>
              Item total
            </Text>
            <Text style={[styles.billValue, { color: textColor }]}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <View
            style={[styles.billDivider, { backgroundColor: borderColor }]}
          />
          <View style={styles.billRow}>
            <Text style={[styles.grandTotalLabel, { color: textColor }]}>
              Total
            </Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <Text style={[styles.taxNote, { color: mutedColor }]}>
            Taxes and restaurant charges, if applicable, will be calculated by
            the restaurant at checkout.
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#D99A13"
          />
          <Text style={styles.noteText}>
            {tableNumber
              ? `This order is for dine-in at Table ${tableNumber}. Please confirm your table details before placing the order.`
              : "A confirmed table booking is required before placing this order."}
          </Text>
        </View>

        <View
          style={[
            styles.instructionsCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Special instructions
          </Text>
          <TextInput
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            accessibilityLabel="Special instructions"
            placeholder="e.g. Less spicy, please"
            placeholderTextColor={mutedColor}
            multiline
            maxLength={500}
            textAlignVertical="top"
            style={[
              styles.instructionsInput,
              { color: textColor, borderColor },
            ]}
          />
        </View>
      </ScrollView>

      <View
        style={[styles.bottomBar, { backgroundColor: cardColor, borderColor }]}
      >
        <View>
          <Text style={[styles.bottomCaption, { color: mutedColor }]}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Text>
          <Text style={[styles.bottomTotal, { color: textColor }]}>
            {formatCurrency(subtotal)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            !items.length && styles.disabledButton,
          ]}
          onPress={placeDineInOrder}
          disabled={!items.length}
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 12,
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
    fontSize: 18,
    fontFamily: Fonts?.bold || undefined,
  },
  headerRight: { width: 42 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 125 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  progressStep: { alignItems: "center", gap: 5 },
  progressDone: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCurrent: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  progressNumber: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: Fonts?.bold || undefined,
  },
  progressPending: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  progressNumberPending: { fontSize: 12, fontFamily: Fonts?.bold || undefined },
  progressLabel: {
    fontSize: 11,
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
  },
  progressLine: { width: 58, height: 2, marginHorizontal: 8, marginBottom: 17 },
  pageHeading: { marginBottom: 17 },
  pageTitle: { fontSize: 25, fontFamily: Fonts?.bold || undefined },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
    fontFamily: Fonts?.regular || undefined,
  },
  tableCard: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  tableIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  tableInfo: { flex: 1 },
  restaurantName: { fontSize: 15, fontFamily: Fonts?.bold || undefined },
  tableCaption: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts?.regular || undefined,
  },
  dineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(22,163,74,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 15,
  },
  dineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16A34A" },
  dineBadgeText: {
    color: "#16A34A",
    fontSize: 9,
    fontFamily: Fonts?.bold || undefined,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 11,
  },
  sectionTitle: { fontSize: 17, fontFamily: Fonts?.bold || undefined },
  itemCount: { fontSize: 12, fontFamily: Fonts?.regular || undefined },
  itemsCard: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 12 },
  orderItem: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 11,
  },
  foodImage: {
    width: 76,
    height: 78,
    borderRadius: 11,
    backgroundColor: "#252525",
  },
  itemDetails: { flex: 1, justifyContent: "center" },
  foodName: { fontSize: 14, fontFamily: Fonts?.bold || undefined },
  foodPrice: {
    fontSize: 12,
    marginTop: 5,
    fontFamily: Fonts?.regular || undefined,
  },
  lineTotal: {
    fontSize: 13,
    marginTop: 5,
    fontFamily: Fonts?.bold || undefined,
  },
  quantityControl: {
    height: 34,
    minWidth: 84,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityButton: {
    width: 27,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    color: RED,
    fontSize: 13,
    fontFamily: Fonts?.bold || undefined,
  },
  itemDivider: { height: 1, marginLeft: 87 },
  addMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    paddingVertical: 16,
  },
  addMoreRowText: {
    color: RED,
    fontSize: 13,
    fontFamily: Fonts?.bold || undefined,
  },
  billCard: { borderWidth: 1, borderRadius: 15, padding: 15, marginTop: 7 },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  billLabel: { fontSize: 13, fontFamily: Fonts?.regular || undefined },
  billValue: {
    fontSize: 13,
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
  },
  billDivider: { height: 1, marginTop: 15 },
  grandTotalLabel: { fontSize: 15, fontFamily: Fonts?.bold || undefined },
  grandTotalValue: {
    color: RED,
    fontSize: 19,
    fontFamily: Fonts?.bold || undefined,
  },
  taxNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 11,
    fontFamily: Fonts?.regular || undefined,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "rgba(217,154,19,0.10)",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  noteText: {
    flex: 1,
    color: "#B8860B",
    fontSize: 11,
    lineHeight: 17,
    fontFamily: Fonts?.regular || undefined,
  },
  instructionsCard: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  instructionsInput: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts?.regular || undefined,
  },
  emptyCard: {
    minHeight: 230,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 16,
    marginTop: 12,
    fontFamily: Fonts?.bold || undefined,
  },
  emptyDescription: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
    fontFamily: Fonts?.regular || undefined,
  },
  addMoreButton: {
    backgroundColor: RED,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 15,
  },
  addMoreText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: Fonts?.bold || undefined,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 83,
    borderTopWidth: 1,
    paddingHorizontal: 17,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  bottomCaption: { fontSize: 11, fontFamily: Fonts?.regular || undefined },
  bottomTotal: {
    fontSize: 18,
    marginTop: 3,
    fontFamily: Fonts?.bold || undefined,
  },
  placeOrderButton: {
    flex: 1,
    maxWidth: 205,
    height: 49,
    borderRadius: 25,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  disabledButton: { opacity: 0.45 },
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold || undefined,
  },
});
