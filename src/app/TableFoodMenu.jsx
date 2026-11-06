import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BASE_URL from "../constants/AppUrls";
import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { getRestaurantMenu } from "../utils/Function";

const RED = "#F9080C";
const FALLBACK_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";

const getFirstValue = (...values) =>
  values.find(
    (value) => value !== undefined && value !== null && value !== "",
  ) ?? "";

// API returns `status: true`, older APIs return `success: 1`. Support both.
const isSuccessResponse = (response) => {
  if (!response || typeof response !== "object") return true;
  const flag =
    response.success !== undefined ? response.success : response.status;
  if (flag === undefined) return true;
  return [1, true, "1", "true"].includes(flag);
};

const imageUri = (value, fallback = FALLBACK_FOOD_IMAGE) => {
  if (!value) return { uri: fallback };
  if (typeof value === "object" && value.uri) return value;
  if (typeof value === "object" && value.url) value = value.url;
  if (typeof value !== "string" || !value.trim()) return { uri: fallback };
  const clean = value.trim();
  if (/^https?:\/\//i.test(clean)) return { uri: clean };
  return { uri: `${BASE_URL}/${clean.replace(/^\/+/, "")}` };
};

const normalizeFood = (item, index) => {
  const product = item?.product || item;
  const image = getFirstValue(
    product?.image_url,
    product?.product_image_url,
    product?.thumbnail_url,
    product?.thumbnail,
    product?.image,
    product?.product_image,
    product?.images?.[0]?.image_url,
    product?.images?.[0]?.url,
    item?.image_url,
    item?.image,
  );

  const productVariantId = getFirstValue(
    item?.product_variant_id,
    item?.variant_id,
    item?.variant?.id,
    item?.product_variant?.id,
    product?.product_variant_id,
    product?.variant_id,
    product?.variant?.id,
    product?.product_variant?.id,
    item?.variants?.[0]?.id,
    product?.variants?.[0]?.id,
  );

  const productId = getFirstValue(
    product?.id,
    product?.product_id,
    item?.id,
    item?.product_id,
    index + 1,
  );

  // Handles true/false, 1/0, "1"/"0", "true"/"false" and food_type === "veg".
  const rawVeg = getFirstValue(
    product?.is_veg,
    item?.is_veg,
    product?.food_type === "veg" ? true : "",
  );

  return {
    // Unique id: the variant id. product_id repeats across variants in your API.
    id: String(getFirstValue(productVariantId, productId)),
    productId: String(productId),
    productVariantId,
    name:
      getFirstValue(
        product?.name,
        product?.product_name,
        item?.name,
        item?.product_name,
      ) || "Food Item",
    description:
      getFirstValue(
        product?.description,
        item?.description,
        product?.short_description,
        item?.short_description,
      ) || "Delicious food prepared fresh.",
    price:
      Number(
        getFirstValue(
          product?.selling_price,
          product?.final_price,
          product?.price,
          item?.selling_price,
          item?.final_price,
          item?.price,
          0,
        ),
      ) || 0,
    actualPrice:
      Number(
        getFirstValue(
          product?.actual_price,
          item?.actual_price,
          product?.mrp,
          item?.mrp,
          0,
        ),
      ) || 0,
    image: imageUri(image),
    isVeg: [true, 1, "1", "true", "veg"].includes(rawVeg),
  };
};

// Avoid duplicate API rows without collapsing distinct variants at the same price.
const dedupeItems = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const normalizeMenu = (data) => {
  const source =
    data?.menu ||
    data?.menus ||
    data?.menu_items ||
    data?.menuItems ||
    data?.products ||
    data?.items;

  if (source && !Array.isArray(source) && typeof source === "object") {
    const result = {};
    Object.entries(source).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        result[category] = dedupeItems(
          items.map((item, index) => normalizeFood(item, index)),
        );
      }
    });
    if (Object.keys(result).length) return result;
  }

  if (Array.isArray(source)) {
    const result = {};
    source.forEach((item, index) => {
      const category =
        getFirstValue(
          item?.category_name,
          item?.categoryName,
          item?.category?.name,
          typeof item?.category === "string" ? item.category : "",
          item?.menu_category,
          item?.type,
        ) || "Recommended";
      if (!result[category]) result[category] = [];
      result[category].push(normalizeFood(item, index));
    });
    Object.keys(result).forEach((category) => {
      result[category] = dedupeItems(result[category]);
    });
    return result;
  }

  return {};
};

export default function TableFoodMenuScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();

  const restaurantId = String(params?.restaurantId || params?.id || "");
  const tableId = String(params?.tableId || params?.selectedTableId || "");
  const menuId = tableId || restaurantId;
  const tableNumber = String(
    params?.tableNumber || params?.tableNo || params?.table || "",
  );

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState({});

  const loadMenu = useCallback(
    async (refresh = false) => {
      if (!menuId) {
        setError("Restaurant or table ID is missing.");
        setLoading(false);
        return;
      }

      try {
        refresh ? setRefreshing(true) : setLoading(true);
        setError("");
        const response = await getRestaurantMenu(menuId);
        if (!isSuccessResponse(response)) {
          throw new Error(
            response?.message ||
              response?.error ||
              "Unable to load restaurant menu.",
          );
        }

        // `root` is the object that holds BOTH `restaurant` and `products`.
        // Works whether getRestaurantMenu returns the raw body or an axios-style { data }.
        const root =
          response?.data && typeof response.data === "object"
            ? response.data
            : response;

        if (!root || typeof root !== "object") {
          throw new Error("Invalid restaurant menu response.");
        }

        const restaurantData =
          root?.restaurant && typeof root.restaurant === "object"
            ? root.restaurant
            : {};

        setRestaurant({
          ...restaurantData,
          id: String(
            restaurantData?.id || restaurantData?.restaurant_id || restaurantId,
          ),
          name:
            getFirstValue(
              restaurantData?.name,
              restaurantData?.restaurant_name,
              restaurantData?.title,
              params?.restaurantName,
            ) || "Restaurant",
          image: imageUri(
            getFirstValue(
              restaurantData?.image_url,
              restaurantData?.restaurant_image_url,
              restaurantData?.image,
              restaurantData?.thumbnail,
              restaurantData?.logo,
              restaurantData?.restaurant_image,
              params?.restaurantImage,
            ),
            FALLBACK_RESTAURANT_IMAGE,
          ),
        });

        // Pass the whole root so normalizeMenu can find `products`.
        setMenu(normalizeMenu(root));
      } catch (err) {
        console.log("TABLE FOOD MENU ERROR:", err?.message);
        setError(err?.message || "Unable to load menu.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [menuId, restaurantId, params?.restaurantName],
  );

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const categories = useMemo(
    () => [
      "All",
      ...Object.keys(menu).filter((name) => (menu[name] || []).length),
    ],
    [menu],
  );

  const visibleItems = useMemo(() => {
    const entries =
      activeCategory === "All"
        ? Object.entries(menu)
        : [[activeCategory, menu[activeCategory] || []]];

    return entries.flatMap(([category, items]) =>
      (items || [])
        .filter((item) => {
          const query = search.trim().toLowerCase();
          return (
            !query ||
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
          );
        })
        .map((item) => ({ ...item, category })),
    );
  }, [menu, activeCategory, search]);

  const totalItems = useMemo(
    () =>
      Object.values(quantities).reduce((sum, qty) => sum + Number(qty || 0), 0),
    [quantities],
  );

  const allItems = useMemo(
    () => Object.values(menu).flat().filter(Boolean),
    [menu],
  );

  const totalPrice = useMemo(
    () =>
      allItems.reduce(
        (sum, item) => sum + item.price * (quantities[item.id] || 0),
        0,
      ),
    [quantities, allItems],
  );

  const changeQuantity = (id, delta) => {
    setQuantities((previous) => {
      const next = Math.max(0, (previous[id] || 0) + delta);
      const updated = { ...previous };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  };

  const reviewOrder = () => {
    if (!totalItems) {
      Alert.alert("Your order is empty", "Please add food items first.");
      return;
    }

    const parsedTableId = Number(tableId);
    if (!Number.isSafeInteger(parsedTableId) || parsedTableId <= 0) {
      Alert.alert(
        "Table booking required",
        "Reserve a table before placing a dine-in food order.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reserve Table",
            onPress: () =>
              router.push({
                pathname: "/DineInOrderReview",
                params: { restaurantId },
              }),
          },
        ],
      );
      return;
    }

    const selectedItems = allItems
      .filter((item) => quantities[item.id] > 0)
      .map((item) => ({
        id: item.id,
        product_id: item.productId,
        product_variant_id: item.productVariantId,
        name: item.name,
        price: item.price,
        quantity: quantities[item.id],
        image: item.image?.uri || "",
      }));

    router.push({
      pathname: "/DineInOrderReview",
      params: {
        restaurantId,
        restaurantName: restaurant?.name || "",
        tableId,
        tableNumber,
        items: JSON.stringify(selectedItems),
        totalItems: String(totalItems),
        totalPrice: String(totalPrice),
        orderType: "dine_in",
      },
    });
  };

  const textColor = colors?.text || (isDark ? "#FFFFFF" : "#171717");
  const mutedColor = colors?.textSecondary || (isDark ? "#A5A5A5" : "#777777");
  const cardColor =
    colors?.card || colors?.surface || (isDark ? "#151515" : "#FFFFFF");
  const borderColor = colors?.border || (isDark ? "#303030" : "#E5E5E5");

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary || RED} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading food menu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.center}>
          <Ionicons name="restaurant-outline" size={48} color={mutedColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            Menu unavailable
          </Text>
          <Text style={[styles.emptyText, { color: mutedColor }]}>
            {error || "Unable to load this restaurant."}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadMenu()}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMenu(true)}
            tintColor={colors.primary || RED}
          />
        }
        contentContainerStyle={{ paddingBottom: totalItems ? 125 : 28 }}
      >
        <View style={styles.hero}>
          <Image
            source={restaurant.image}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroShade} />
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.brand} />
            <TouchableOpacity style={styles.iconButton} onPress={reviewOrder}>
              <Ionicons name="cart-outline" size={27} color="#FFFFFF" />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.heroBottom}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.dineTitle}>
                {restaurant.name}
              </Text>
              <Text numberOfLines={1} style={styles.restaurantCaption}>
                {tableNumber
                  ? `Table ${tableNumber}`
                  : "Table booking required"}
              </Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: cardColor }]}>
            <Text style={[styles.errorText, { color: mutedColor }]}>
              {error}
            </Text>
            <TouchableOpacity onPress={() => loadMenu(true)}>
              <Text style={styles.retryInline}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View
          style={[
            styles.searchBox,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <Ionicons name="search-outline" size={23} color={mutedColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search food items..."
            placeholderTextColor={mutedColor}
            style={[styles.searchInput, { color: textColor }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={mutedColor} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const selected = activeCategory === category;
            const lower = category.toLowerCase();
            const icon =
              category === "All"
                ? "restaurant-outline"
                : lower.includes("starter")
                  ? "leaf-outline"
                  : lower.includes("biryani")
                    ? "fast-food-outline"
                    : lower.includes("beverage")
                      ? "cafe-outline"
                      : "restaurant-outline";

            return (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selected ? RED : cardColor,
                    borderColor: selected ? RED : borderColor,
                  },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={18}
                  color={selected ? "#FFFFFF" : textColor}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: selected ? "#FFFFFF" : textColor },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.menuHeading}>
          <Text style={[styles.menuTitle, { color: textColor }]}>
            {activeCategory === "All" ? "Our Menu" : activeCategory}
          </Text>
          <Text style={[styles.menuCount, { color: mutedColor }]}>
            {visibleItems.length} items
          </Text>
        </View>

        {visibleItems.length ? (
          visibleItems.map((item) => {
            const qty = quantities[item.id] || 0;
            const hasDiscount = item.actualPrice > item.price;
            return (
              <View
                key={`${item.category}-${item.id}`}
                style={[
                  styles.foodCard,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <Image source={item.image} style={styles.foodImage} />
                <View style={styles.foodContent}>
                  <View style={styles.foodTitleRow}>
                    <View
                      style={[
                        styles.vegMark,
                        { borderColor: item.isVeg ? "#16A34A" : RED },
                      ]}
                    >
                      <View
                        style={[
                          styles.vegDot,
                          { backgroundColor: item.isVeg ? "#16A34A" : RED },
                        ]}
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      style={[styles.foodName, { color: textColor }]}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[styles.foodDescription, { color: mutedColor }]}
                  >
                    {item.description}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.foodPrice, { color: textColor }]}>
                      ₹{item.price.toFixed(0)}
                    </Text>
                    {hasDiscount && (
                      <Text style={[styles.strikePrice, { color: mutedColor }]}>
                        ₹{item.actualPrice.toFixed(0)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.foodCategory, { color: mutedColor }]}>
                    {item.category}
                  </Text>
                </View>

                <View style={styles.foodActions}>
                  {qty === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => changeQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={19} color={RED} />
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => changeQuantity(item.id, -1)}
                        style={styles.quantityButton}
                      >
                        <Ionicons name="remove" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{qty}</Text>
                      <TouchableOpacity
                        onPress={() => changeQuantity(item.id, 1)}
                        style={styles.quantityButton}
                      >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noItems}>
            <Ionicons name="search-outline" size={38} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>
              No food items found.
            </Text>
          </View>
        )}
      </ScrollView>

      {totalItems > 0 && (
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View style={styles.totalBlock}>
            <View style={styles.bottomCartIcon}>
              <Ionicons name="cart-outline" size={28} color="#FFFFFF" />
              <View style={styles.bottomBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.totalItems, { color: mutedColor }]}>
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </Text>
              <Text style={[styles.totalPrice, { color: textColor }]}>
                ₹{totalPrice.toFixed(0)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.reviewButton} onPress={reviewOrder}>
            <Text style={styles.reviewButtonText}>Review Order</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: Fonts?.regular || undefined,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontFamily: Fonts?.bold || undefined,
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts?.regular || undefined,
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: RED,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold || undefined,
  },
  hero: { height: 270, overflow: "hidden", backgroundColor: "#111111" },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  topRow: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  brand: { alignItems: "center" },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: Fonts?.bold || undefined,
  },
  heroBottom: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  dineTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: Fonts?.bold || undefined,
  },
  restaurantCaption: {
    color: "#E0E0E0",
    fontSize: 13,
    marginTop: 6,
    fontFamily: Fonts?.regular || undefined,
  },
  errorBox: {
    marginHorizontal: 15,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 12, fontFamily: Fonts?.regular || undefined },
  retryInline: {
    color: RED,
    fontSize: 12,
    fontFamily: Fonts?.bold || undefined,
  },
  searchBox: {
    minHeight: 54,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    fontFamily: Fonts?.regular || undefined,
  },
  categoryList: { paddingHorizontal: 16, paddingVertical: 17, gap: 10 },
  categoryChip: {
    minHeight: 43,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
  },
  menuHeading: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuTitle: { fontSize: 21, fontFamily: Fonts?.bold || undefined },
  menuCount: { fontSize: 12, fontFamily: Fonts?.regular || undefined },
  foodCard: {
    marginHorizontal: 14,
    marginBottom: 12,
    minHeight: 136,
    borderRadius: 17,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  foodImage: {
    width: 105,
    height: 112,
    borderRadius: 13,
    backgroundColor: "#252525",
  },
  foodContent: { flex: 1, alignSelf: "stretch", justifyContent: "center" },
  foodTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  vegMark: {
    width: 15,
    height: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  foodName: { flex: 1, fontSize: 15, fontFamily: Fonts?.bold || undefined },
  foodDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    fontFamily: Fonts?.regular || undefined,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 7,
  },
  foodPrice: {
    fontSize: 17,
    fontFamily: Fonts?.bold || undefined,
  },
  strikePrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    fontFamily: Fonts?.regular || undefined,
  },
  foodCategory: {
    fontSize: 10,
    marginTop: 3,
    fontFamily: Fonts?.regular || undefined,
  },
  foodActions: {
    height: "100%",
    minWidth: 74,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingVertical: 2,
  },
  addButton: {
    height: 36,
    minWidth: 70,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: RED,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addText: { color: RED, fontSize: 13, fontFamily: Fonts?.bold || undefined },
  quantityControl: {
    height: 36,
    minWidth: 78,
    borderRadius: 20,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityButton: {
    width: 26,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold || undefined,
  },
  noItems: { minHeight: 170, alignItems: "center", justifyContent: "center" },
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
  totalBlock: { flexDirection: "row", alignItems: "center", gap: 12 },
  bottomCartIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  totalItems: { fontSize: 11, fontFamily: Fonts?.regular || undefined },
  totalPrice: {
    fontSize: 17,
    marginTop: 2,
    fontFamily: Fonts?.bold || undefined,
  },
  reviewButton: {
    flex: 1,
    maxWidth: 190,
    height: 48,
    borderRadius: 26,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.bold || undefined,
  },
});
