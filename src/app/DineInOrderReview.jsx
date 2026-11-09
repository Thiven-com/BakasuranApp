import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { createDineInOrder } from "../utils/Function";

const RED = "#F9080C";
const SUCCESS_ROUTE = "/DineInOrderSuccess"; // file: app/DineInOrderSuccess.jsx

const isSuccessResponse = (response) => {
  if (!response || typeof response !== "object") return false;
  const flag =
    response.success !== undefined ? response.success : response.status;
  return [1, true, "1", "true"].includes(flag);
};

const parseItems = (raw) => {
  try {
    const parsed = JSON.parse(String(raw || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function DineInOrderReview() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();

  const restaurantName = String(params?.restaurantName || "Restaurant");
  const tableId = Number(params?.tableId);
  const tableNumber = String(params?.tableNumber || "");

  const [items, setItems] = useState(() => parseItems(params?.items));
  const [instructions, setInstructions] = useState("");
  const [placing, setPlacing] = useState(false);

  const textColor = colors?.text || (isDark ? "#FFFFFF" : "#171717");
  const mutedColor = colors?.textSecondary || (isDark ? "#A5A5A5" : "#777777");
  const cardColor =
    colors?.card || colors?.surface || (isDark ? "#151515" : "#FFFFFF");
  const borderColor = colors?.border || (isDark ? "#303030" : "#E5E5E5");

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [items],
  );

  const changeQuantity = (id, delta) => {
    setItems((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Number(item.quantity || 0) + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const placeOrder = async () => {
    if (placing) return;

    if (!items.length) {
      Alert.alert("Your order is empty", "Please add food items first.");
      return;
    }

    setPlacing(true);

    try {
      // Matches POST /api/customer/order
      const response = await createDineInOrder({
        restaurant_table_id: tableId,
        special_instructions: instructions.trim(),
        products: items.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
        })),
      });

      if (response?.success === 9) {
        Alert.alert(
          "Login required",
          response?.message || "Please login to place this order.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Login", onPress: () => router.push("/LoginScreen") },
          ],
        );
        return;
      }

      if (!isSuccessResponse(response)) {
        Alert.alert(
          "Unable to place order",
          response?.message || "Something went wrong. Please try again.",
        );
        return;
      }

      const order =
        response?.data?.order ??
        response?.data?.data ??
        response?.data ??
        response?.order ??
        response;

      // Success -> go to the success screen
      router.replace({
        pathname: SUCCESS_ROUTE,
        params: {
          restaurantName,
          tableNumber,
          totalItems: String(totalItems),
          totalPrice: String(totalPrice),
          orderId: String(
            order?.restaurant_food_order_id ??
              order?.id ??
              order?.order_id ??
              order?.order_number ??
              response?.restaurant_food_order_id ??
              response?.order_id ??
              response?.order_number ??
              "",
          ),
          message: response?.message || "Your dine-in order has been placed.",
        },
      });
    } catch (err) {
      Alert.alert(
        "Unable to place order",
        err?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>
            Review Order
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: mutedColor }]}
          >
            {restaurantName}
            {tableNumber ? ` • Table ${tableNumber}` : ""}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 14, paddingBottom: 130 }}
        >
          {items.length ? (
            items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={[styles.itemImage, styles.imagePlaceholder]}>
                    <Ionicons
                      name="restaurant-outline"
                      size={26}
                      color={mutedColor}
                    />
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text
                    numberOfLines={2}
                    style={[styles.itemName, { color: textColor }]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: mutedColor }]}>
                    ₹{Number(item.price || 0).toFixed(0)} each
                  </Text>
                  <Text style={[styles.lineTotal, { color: textColor }]}>
                    ₹{(Number(item.price || 0) * item.quantity).toFixed(0)}
                  </Text>
                </View>

                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => changeQuantity(item.id, -1)}
                  >
                    <Ionicons
                      name={item.quantity === 1 ? "trash-outline" : "remove"}
                      size={17}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => changeQuantity(item.id, 1)}
                  >
                    <Ionicons name="add" size={17} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="cart-outline" size={44} color={mutedColor} />
              <Text style={[styles.emptyText, { color: mutedColor }]}>
                Your order is empty.
              </Text>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.back()}
              >
                <Text style={styles.menuButtonText}>Back to menu</Text>
              </TouchableOpacity>
            </View>
          )}

          {items.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: textColor }]}>
                Special instructions
              </Text>
              <TextInput
                value={instructions}
                onChangeText={setInstructions}
                placeholder="e.g. Less spicy, please"
                placeholderTextColor={mutedColor}
                multiline
                maxLength={250}
                style={[
                  styles.instructionsInput,
                  { color: textColor, backgroundColor: cardColor, borderColor },
                ]}
              />

              <View
                style={[
                  styles.summary,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: mutedColor }]}>
                    Items
                  </Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {totalItems}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: mutedColor }]}>
                    Subtotal
                  </Text>
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    ₹{totalPrice.toFixed(0)}
                  </Text>
                </View>
                <Text style={[styles.note, { color: mutedColor }]}>
                  Taxes and final bill are calculated by the restaurant.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {items.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View>
            <Text style={[styles.summaryLabel, { color: mutedColor }]}>
              Total
            </Text>
            <Text style={[styles.totalPrice, { color: textColor }]}>
              ₹{totalPrice.toFixed(0)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.placeButton, placing && { opacity: 0.7 }]}
            onPress={placeOrder}
            disabled={placing}
          >
            {placing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.placeButtonText}>Place Order</Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
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
    fontSize: 24,
    fontFamily: Fonts?.regular || undefined,
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
    fontSize: 15,
    fontFamily: Fonts?.regular|| Fonts?.regular || undefined,
  },
  progressPending: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  progressNumberPending: { fontSize: 15, fontFamily: Fonts?.regular|| Fonts?.regular || undefined },
  progressLabel: {
    fontSize: 15,
    fontFamily: Fonts?.regular|| Fonts?.regular || undefined,
  },
  progressLine: { width: 58, height: 2, marginHorizontal: 8, marginBottom: 17 },
  pageHeading: { marginBottom: 17 },
  pageTitle: { fontSize: 25, fontFamily: Fonts?.bold || undefined },
  pageSubtitle: {
    fontSize: 17,
    marginTop: 4,
    fontFamily: Fonts?.regular || undefined,
  },
  itemCard: {
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
  restaurantName: { fontSize: 22, fontFamily: Fonts?.regular || undefined },
  tableCaption: {
    fontSize: 18,
    marginTop: 4,
    fontFamily: Fonts?.regular|| Fonts?.regular || undefined,
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
    fontSize: 14,
    fontFamily: Fonts?.regular|| Fonts?.regular || undefined,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 11,
  },
  sectionTitle: { fontSize: 20, fontFamily: Fonts?.regular|| Fonts?.regular || undefined },
  itemCount: { fontSize: 18, fontFamily: Fonts?.regular|| Fonts?.regular || undefined },
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
  foodName: { fontSize: 20, fontFamily: Fonts?.bold || undefined },
  foodPrice: {
    fontSize: 15,
    marginTop: 5,
    fontFamily: Fonts?.regular || undefined,
  },
  lineTotal: {
    fontSize: 17,
    marginTop: 5,
    fontFamily: Fonts?.bold || undefined,
  },
  quantityControl: {
    height: 36,
    minWidth: 82,
    borderRadius: 20,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityButton: {
    width: 28,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    color: RED,
    fontSize: 17,
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
    fontSize: 19,
    fontFamily: Fonts?.regular || undefined,
  },
  billCard: { borderWidth: 1, borderRadius: 15, padding: 15, marginTop: 7 },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  billLabel: { fontSize: 18, fontFamily: Fonts?.regular || undefined },
  billValue: {
    fontSize: 15,
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
  },
  billDivider: { height: 1, marginTop: 15 },
  grandTotalLabel: { fontSize: 15, fontFamily: Fonts?.regular || undefined },
  grandTotalValue: {
    color: RED,
    fontSize: 22,
    fontFamily: Fonts?.bold || undefined,
  },
  taxNote: {
    fontSize: 15,
    lineHeight: 18,
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
    fontSize: 16,
    lineHeight: 18,
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
    fontSize: 19,
    marginTop: 12,
    fontFamily: Fonts?.bold || undefined,
  },
  emptyDescription: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 6,
    lineHeight: 18,
    fontFamily: Fonts?.regular || undefined,
  },
  addMoreButton: {
    backgroundColor: RED,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  menuButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: Fonts?.bold || undefined,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 86,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  bottomCaption: { fontSize: 19, fontFamily: Fonts?.regular || undefined },
  bottomTotal: {
    fontSize: 18,
    marginTop: 3,
    fontFamily: Fonts?.bold || undefined,
  },
  placeButton: {
    flex: 1,
    maxWidth: 200,
    height: 50,
    borderRadius: 26,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: Fonts?.regular || undefined,
  },
});
