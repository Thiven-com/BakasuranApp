import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import {
  cancelOrder,
  getOrderDetails,
  getProduct,
  submitProductRating,
} from "../utils/Function";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Self-contained font weights. Every weight shares one family and only
// fontWeight changes, so it works with the current Fonts.js.
const SANS = Fonts.regular;
const font = (weight) => ({ fontFamily: SANS, fontWeight: weight });
const W = {
  regular: font("400"),
  medium: font("500"),
  semiBold: font("600"),
  bold: font("700"),
};

const GOLD_FALLBACK = "#F5B323";
const GOLD_BG = "rgba(245,179,35,0.15)";
const GREEN_BG = "rgba(34,197,94,0.15)";
const RED_BG = "rgba(242,13,32,0.12)";
const GREY_BG = "rgba(160,160,160,0.16)";

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

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// "28 Oct 2024, 09:28 AM"
const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  const hours = date.getHours();
  const hour12 = String(hours % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${String(date.getDate()).padStart(2, "0")} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}, ${hour12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
};

const capitalize = (value) => {
  const text = String(value ?? "").trim();

  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};

const getReviewKey = (item) =>
  item.productId == null
    ? `item:${item.id}`
    : `product:${String(item.productId)}`;

/* ---------- product / variant id resolution ---------- */

const toValidId = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const PRODUCT_ID_KEYS = ["product_id", "productId", "food_id", "foodId"];

const PRODUCT_OBJECT_KEYS = [
  "product",
  "product_details",
  "productData",
  "product_data",
  "productDetail",
  "product_detail",
  "food",
  "food_item",
  "foodItem",
  "menu_item",
  "menuItem",
  "item",
];

const VARIANT_OBJECT_KEYS = [
  "variant",
  "product_variant",
  "productVariant",
  "variant_details",
  "variantData",
  "variant_data",
];

// Deep scan of one order item for its product id.
const findProductId = (node, depth = 0) => {
  if (!node || typeof node !== "object" || depth > 4) return null;

  for (const key of PRODUCT_ID_KEYS) {
    const id = toValidId(node[key]);
    if (id) return id;
  }

  for (const key of PRODUCT_OBJECT_KEYS) {
    const child = node[key];

    if (child && typeof child === "object") {
      const id = toValidId(child.id) ?? findProductId(child, depth + 1);
      if (id) return id;
    }
  }

  for (const key of VARIANT_OBJECT_KEYS) {
    const child = node[key];

    if (child && typeof child === "object") {
      const id = findProductId(child, depth + 1);
      if (id) return id;
    }
  }

  return null;
};

const getOrderItemProductId = (entry) => findProductId(entry);

const getOrderItemVariantId = (entry) =>
  toValidId(
    entry?.product_variant_id ??
      entry?.variant_id ??
      entry?.variant?.id ??
      entry?.product_variant?.id ??
      entry?.productVariant?.id,
  );

// Walks any product-list response and maps variantId -> productId.
const buildVariantProductMap = (node, map = {}, depth = 0) => {
  if (!node || typeof node !== "object" || depth > 6) return map;

  if (Array.isArray(node)) {
    node.forEach((child) => buildVariantProductMap(child, map, depth + 1));
    return map;
  }

  const productId = toValidId(node.id);

  if (productId && Array.isArray(node.variants)) {
    node.variants.forEach((variant) => {
      const variantId = toValidId(variant?.id);
      if (variantId) map[variantId] = productId;
    });
  }

  Object.values(node).forEach((child) =>
    buildVariantProductMap(child, map, depth + 1),
  );

  return map;
};

const getShipping = (order, params) => {
  const raw =
    order?.shipping_address ?? order?.delivery_address ?? order?.address;

  if (raw && typeof raw === "object") {
    const base = [raw.address, raw.address_2, raw.landmark, raw.city, raw.state]
      .filter(Boolean)
      .join(", ");

    const full = raw.pincode
      ? base
        ? `${base} - ${raw.pincode}`
        : String(raw.pincode)
      : base;

    return {
      name: raw.name ?? "",
      mobile: raw.mobile ?? raw.phone ?? "",
      address: full || "Address unavailable",
    };
  }

  return {
    name: "",
    mobile: "",
    address:
      typeof raw === "string" && raw
        ? raw
        : (params.address ?? "Address unavailable"),
  };
};

// Notifications that also work on web (Alert.alert is a no-op there)
const notify = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const confirmAction = (title, message, confirmText, onConfirm) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Keep Order", style: "cancel" },
      { text: confirmText, style: "destructive", onPress: onConfirm },
    ]);
  }
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function OrderDetailsScreen() {
  const { colors: Colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const RED = Colors.primary;
  const WHITE = Colors.textPrimary;
  const GREY = Colors.textSecondary;
  const GREEN = Colors.success;
  const GOLD = Colors.gold ?? GOLD_FALLBACK;

  const params = useLocalSearchParams();
  const orderId = params.orderId;

  // On narrow screens the date moves to its own row instead of being squeezed
  const { width: screenWidth } = useWindowDimensions();
  const compact = screenWidth < 430;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [cancelling, setCancelling] = useState(false);

  // variantId -> productId, filled only when the order API omits product_id
  const [variantProductMap, setVariantProductMap] = useState({});

  // Review popup state
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewPromptDismissed, setReviewPromptDismissed] = useState(false);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [submittedReviewIds, setSubmittedReviewIds] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) return undefined;

    let active = true;

    const loadOrder = async () => {
      const response = await getOrderDetails(orderId);

      if (!active) return;

      if (response?.success === 9) {
        router.replace("/login");
        return;
      }

      if (
        response?.success != null &&
        ![1, true, "1"].includes(response.success)
      ) {
        notify("Order", response?.message || "Unable to load order.");
        setLoading(false);
        return;
      }

      console.log("ORDER DETAILS RESPONSE:", JSON.stringify(response));

      let detail =
        response?.data?.order ??
        response?.data?.data ??
        response?.data ??
        response?.order ??
        response;

      // The API can return the order inside an array
      if (Array.isArray(detail)) {
        detail =
          detail.find((entry) => String(entry?.id) === String(orderId)) ??
          detail[0] ??
          null;
      }

      // TEMP DEBUG: remove once product ids are confirmed
      console.log(
        "ORDER ITEM SAMPLE:",
        JSON.stringify(
          (detail?.items ?? detail?.order_items ?? detail?.details)?.[0],
          null,
          2,
        ),
      );

      setOrderData(detail);
      setLoading(false);
    };

    loadOrder().catch((error) => {
      if (!active) return;

      setLoading(false);
      notify("Order", error?.message || "Unable to load order.");
    });

    return () => {
      active = false;
    };
  }, [orderId]);

  // Fallback: if items carry only a variant id, resolve the product id
  // from the product list.
  useEffect(() => {
    const rawList =
      orderData?.items ?? orderData?.order_items ?? orderData?.details;

    if (!Array.isArray(rawList) || rawList.length === 0) return undefined;

    const needsLookup = rawList.some(
      (entry) => !getOrderItemProductId(entry) && getOrderItemVariantId(entry),
    );

    if (!needsLookup) return undefined;

    let active = true;

    getProduct()
      .then((response) => {
        if (active) setVariantProductMap(buildVariantProductMap(response));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [orderData]);

  /* ---------- derived data ---------- */

  const order = orderData ?? {};

  const status = capitalize(
    order?.status ??
      order?.order_status ??
      order?.delivery_status ??
      params.status ??
      "Pending",
  );
  const statusLower = status.toLowerCase();

  const isDelivered = statusLower === "delivered";
  const isCancelled = statusLower.includes("cancel");

  const orderNumber = String(
    order?.invoice_id ??
      order?.order_number ??
      order?.order_id ??
      order?.id ??
      orderId ??
      "",
  ).replace(/^#/, "");

  const dateText = formatDate(order?.created_at ?? order?.order_date);

  const paymentMethod = capitalize(
    order?.payment_method ??
      order?.payment?.method ??
      params.paymentMethod ??
      "—",
  );

  const paymentStatus = capitalize(
    order?.payment_status ??
      order?.payment?.status ??
      (isDelivered ? "Paid" : "Pending"),
  );
  const paymentPaid = ["paid", "success", "completed"].includes(
    paymentStatus.toLowerCase(),
  );

  const shipping = getShipping(order, params);

  const rawItems = order?.items ?? order?.order_items ?? order?.details;

  const items = Array.isArray(rawItems)
    ? rawItems.map((entry, index) => {
        const product =
          entry?.product ??
          entry?.product_details ??
          entry?.productData ??
          entry?.product_data ??
          entry?.productDetail ??
          entry?.product_detail ??
          entry?.variant?.product ??
          entry?.product_variant?.product ??
          entry?.food ??
          entry?.item ??
          entry;

        const quantity = Number(entry?.quantity ?? entry?.qty ?? 1) || 1;

        const image =
          entry?.image ??
          product?.image ??
          product?.image_url ??
          product?.thumbnail ??
          product?.photo ??
          null;

        const variantId = getOrderItemVariantId(entry);

        return {
          id: String(entry?.id ?? index),
          productId:
            getOrderItemProductId(entry) ??
            (variantId ? variantProductMap[variantId] : null) ??
            null,
          name: product?.name ?? product?.title ?? entry?.name ?? "Order item",
          price: Number(
            entry?.unit_price ??
              entry?.price ??
              entry?.variant?.price ??
              product?.price ??
              0,
          ),
          quantity,
          imageUri:
            typeof image === "string" && /^https?:\/\//i.test(image)
              ? image
              : null,
        };
      })
    : [];

  const reviewItems = items.filter(
    (item, index) =>
      item.productId == null ||
      items.findIndex(
        (candidate) => String(candidate.productId) === String(item.productId),
      ) === index,
  );
  const reviewOrderId = order?.id ?? order?.order_id ?? orderId;
  const allReviewsSubmitted =
    reviewItems.length > 0 &&
    reviewItems.every(
      (item) =>
        item.productId != null && submittedReviewIds[getReviewKey(item)],
    );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const itemsSum = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const itemTotal = Number(order?.subtotal ?? itemsSum);

  const deliveryFee = Number(
    order?.delivery_total ??
      order?.shipping_total ??
      order?.delivery_fee ??
      order?.delivery_charge ??
      0,
  );
  const gst = Number(order?.tax_total ?? order?.tax ?? order?.gst ?? 0);
  const couponDiscount = Number(
    order?.discount_total ?? order?.discount ?? order?.coupon_discount ?? 0,
  );
  const calculatedTotal = itemTotal + deliveryFee + gst - couponDiscount;

  const grandTotal = Number(
    order?.grand_total ??
      order?.total_amount ??
      order?.total ??
      params.total ??
      calculatedTotal,
  );

  /* ---------- tracking steps ---------- */

  let completedSteps = 1;

  if (isDelivered) {
    completedSteps = 4;
  } else if (/(ship|dispatch|out for)/.test(statusLower)) {
    completedSteps = 3;
  } else if (/(confirm|accept|prepar|process)/.test(statusLower)) {
    completedSteps = 2;
  }

  const stepState = (index) => {
    if (index < completedSteps) return "completed";
    if (index === completedSteps && !isCancelled) return "in_progress";
    return "pending";
  };

  const steps = ["Order Placed", "Order Confirmed", "Shipped", "Delivered"].map(
    (title, index) => {
      const state = stepState(index);

      let subtitle = "Awaiting update";

      if (state === "completed") {
        subtitle = index === 0 && dateText ? dateText : "Completed";
      } else if (state === "in_progress") {
        subtitle = "In progress";
      }

      return { title, state, subtitle };
    },
  );

  const statusTone = isDelivered ? "green" : isCancelled ? "red" : "gold";

  const toneColor = { green: GREEN, red: RED, gold: GOLD };
  const toneBackground = { green: GREEN_BG, red: RED_BG, gold: GOLD_BG };

  /* ---------- actions ---------- */

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/orders");
    }
  };

  const handleTrackOrder = () => {
    router.push({
      pathname: "/track-order",
      params: { orderId: String(orderId) },
    });
  };

  const handleChangeAddress = () => {
    notify("Shipping Address", "Connect your change address flow here.");
  };

  const handlePrintInvoice = () => {
    if (Platform.OS === "web") {
      window.print();
    } else {
      notify("Print Invoice", "Connect your invoice API here.");
    }
  };

  const handleDownloadInvoice = () => {
    notify("Download Invoice", "Connect your invoice API here.");
  };

  const runCancel = async () => {
    setCancelling(true);

    try {
      const response = await cancelOrder(orderId);

      if (response?.success === 9) {
        router.replace("/login");
        return;
      }

      if (
        response?.success != null &&
        ![1, true, "1"].includes(response.success)
      ) {
        notify(
          "Cancel Order",
          response?.message || "Unable to cancel this order.",
        );
        return;
      }

      setOrderData((previous) => ({
        ...(previous ?? {}),
        ...(response?.data?.order ?? response?.data ?? {}),
        status: "Cancelled",
      }));

      notify("Order", response?.message || "Order cancelled.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelOrder = () => {
    confirmAction(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      "Cancel Order",
      runCancel,
    );
  };

  const dateBlock = (
    <View style={compact ? styles.dateCompact : styles.topMiddle}>
      <Text style={styles.eyebrow}>ORDER DATE</Text>

      <View style={styles.dateRow}>
        <Ionicons name="calendar" size={17} color={GOLD} />

        <Text style={styles.dateText}>{dateText || "—"}</Text>
      </View>
    </View>
  );

  const bannerText = isDelivered
    ? "Your order has been delivered. Enjoy your meal!"
    : isCancelled
      ? "This order has been cancelled."
      : null;

  const canChangeAddress = !isDelivered && !isCancelled;

  // Show the review popup once when the order reaches Delivered.
  useEffect(() => {
    if (isDelivered && !reviewPromptDismissed) {
      setReviewVisible(true);
    }
  }, [isDelivered, reviewPromptDismissed]);

  const handleReviewSubmit = async () => {
    if (reviewSubmitting) return;

    if (!reviewItems.length) {
      notify("Rate your order", "There are no products available to review.");
      return;
    }

    // Product ids may still be resolving through the fallback lookup
    if (reviewItems.some((item) => item.productId == null)) {
      notify(
        "Unable to rate products",
        "A valid product ID is missing from this order. Please contact support.",
      );
      return;
    }

    const unratedItem = reviewItems.find(
      (item) =>
        !submittedReviewIds[getReviewKey(item)] &&
        !reviewDrafts[getReviewKey(item)]?.rating,
    );
    if (unratedItem) {
      notify("Rate your order", `Please rate ${unratedItem.name} to continue.`);
      return;
    }

    if (reviewOrderId == null || String(reviewOrderId).trim() === "") {
      notify("Unable to submit review", "The order ID is missing.");
      return;
    }

    setReviewSubmitting(true);

    try {
      for (const item of reviewItems) {
        const reviewKey = getReviewKey(item);
        if (submittedReviewIds[reviewKey]) continue;

        const draft = reviewDrafts[reviewKey];
        const response = await submitProductRating({
          product_id: item.productId,
          order_id: reviewOrderId,
          rating: draft.rating,
          review: draft.review ?? "",
        });

        if (response?.success === 9) {
          router.replace("/login");
          return;
        }

        const responseFlag =
          response?.success !== undefined ? response.success : response?.status;
        if (
          responseFlag !== undefined &&
          ![1, true, "1", "true"].includes(responseFlag)
        ) {
          notify(
            "Review not fully submitted",
            response?.message ||
              `Unable to submit the review for ${item.name}. Your completed reviews are saved; please try again.`,
          );
          return;
        }

        setSubmittedReviewIds((current) => ({
          ...current,
          [reviewKey]: true,
        }));
      }

      setReviewVisible(false);
      setReviewPromptDismissed(true);
      notify("Thank you", "Your product ratings have been submitted.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const closeReviewPopup = () => {
    setReviewVisible(false);
    setReviewPromptDismissed(true);
  };

  const renderRating = (label, value, onChange) => (
    <View style={styles.reviewRatingBlock}>
      <Text style={styles.reviewRatingLabel}>{label}</Text>
      <View style={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={`${label}-${star}`}
            onPress={() => onChange(star)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${star} out of 5 stars for ${label}`}
            style={styles.reviewStarButton}
          >
            <Ionicons
              name={star <= value ? "star" : "star-outline"}
              size={30}
              color={star <= value ? GOLD : GREY}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={Colors.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.75}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={28} color={WHITE} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Order Details</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading && (
          <ActivityIndicator
            style={{ marginVertical: 24 }}
            size="large"
            color={RED}
          />
        )}

        {/* ORDER SUMMARY HEADER CARD */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              <Text style={styles.eyebrow}>ORDER ID</Text>

              <Text style={styles.orderNumber} numberOfLines={1}>
                #{orderNumber}
              </Text>

              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: toneBackground[statusTone] },
                ]}
              >
                <Ionicons
                  name={
                    isDelivered
                      ? "checkmark-circle"
                      : isCancelled
                        ? "close-circle"
                        : "time"
                  }
                  size={15}
                  color={toneColor[statusTone]}
                />

                <Text
                  style={[
                    styles.statusPillText,
                    { color: toneColor[statusTone] },
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>

            {!compact && dateBlock}

            <View style={[styles.topRight, compact && styles.topRightCompact]}>
              <Text style={styles.eyebrow}>TOTAL AMOUNT</Text>

              <Text style={styles.topTotal}>{formatMoney(grandTotal)}</Text>

              <Text style={styles.itemCountText}>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
            </View>
          </View>

          {compact && dateBlock}
        </View>

        {/* ORDER ITEMS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>

          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index === items.length - 1 && styles.lastItemRow,
              ]}
            >
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.itemImage}
                />
              ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                  <Ionicons name="fast-food-outline" size={28} color={RED} />
                </View>
              )}

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>

                <Text style={styles.itemMeta}>Quantity: {item.quantity}</Text>
              </View>

              <Text style={styles.itemPrice}>
                {formatMoney(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          {/* BILL BOX */}
          <View style={styles.billBox}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>{formatMoney(itemTotal)}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Shipping</Text>
              <Text style={styles.billValue}>
                {deliveryFee > 0 ? formatMoney(deliveryFee) : "Free"}
              </Text>
            </View>

            {gst > 0 && (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>GST</Text>
                <Text style={styles.billValue}>{formatMoney(gst)}</Text>
              </View>
            )}

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount</Text>
              <Text style={[styles.billValue, { color: GOLD }]}>
                - {formatMoney(couponDiscount)}
              </Text>
            </View>

            <View style={styles.dashedDivider} />

            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Total Amount</Text>
              <Text style={styles.billTotalValue}>
                {formatMoney(grandTotal)}
              </Text>
            </View>
          </View>

          {/* INFO BANNER */}
          <View style={styles.banner}>
            <Ionicons name="information-circle" size={22} color={GOLD} />

            <Text style={styles.bannerText}>
              {bannerText ?? (
                <>
                  Your order is currently{" "}
                  <Text style={styles.bannerHighlight}>{status}</Text>. You will
                  receive an update as your order progresses.
                </>
              )}
            </Text>
          </View>

          {isDelivered && !allReviewsSubmitted && (
            <TouchableOpacity
              style={styles.openReviewButton}
              activeOpacity={0.85}
              onPress={() => setReviewVisible(true)}
            >
              <Ionicons name="star" size={19} color="#FFFFFF" />
              <Text style={styles.openReviewButtonText}>
                Rate Your Experience
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* INVOICE BUTTONS */}
          <View style={styles.invoiceRow}>
            <TouchableOpacity
              style={styles.printButton}
              activeOpacity={0.8}
              onPress={handlePrintInvoice}
            >
              <Ionicons name="print" size={20} color={RED} />

              <Text style={styles.printButtonText}>Print Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadButton}
              activeOpacity={0.85}
              onPress={handleDownloadInvoice}
            >
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />

              <Text style={styles.downloadButtonText}>
                Download / Save Invoice
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ORDER TRACKING */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Tracking</Text>

          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            const circleColor =
              step.state === "completed"
                ? RED
                : step.state === "in_progress"
                  ? GOLD
                  : "#7A7A7A";

            const lineColor =
              step.state === "completed"
                ? RED
                : step.state === "in_progress"
                  ? GOLD
                  : "#4A4A4A";

            const pillTone =
              step.state === "completed"
                ? { bg: GREEN_BG, color: GREEN, label: "Completed" }
                : step.state === "in_progress"
                  ? { bg: GOLD_BG, color: GOLD, label: "In Progress" }
                  : { bg: GREY_BG, color: GREY, label: "Pending" };

            return (
              <View style={styles.stepRow} key={step.title}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepCircle,
                      { backgroundColor: circleColor },
                    ]}
                  >
                    {step.state === "completed" ? (
                      <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                    ) : step.state === "in_progress" ? (
                      <Ionicons name="time-outline" size={22} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    )}
                  </View>

                  {!isLast && (
                    <View
                      style={[styles.stepLine, { backgroundColor: lineColor }]}
                    />
                  )}
                </View>

                <View style={styles.stepContent}>
                  <View style={styles.stepTextBlock}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  </View>

                  <View
                    style={[styles.stepPill, { backgroundColor: pillTone.bg }]}
                  >
                    <Text
                      style={[styles.stepPillText, { color: pillTone.color }]}
                    >
                      {pillTone.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.deliveryRow}
            activeOpacity={0.8}
            onPress={handleTrackOrder}
            disabled={!orderId}
          >
            <Ionicons name="bicycle" size={22} color={GOLD} />

            <Text style={styles.deliveryText}>
              <Text style={styles.deliveryLabel}>Delivery Status: </Text>
              {status}
            </Text>

            <Ionicons name="chevron-forward" size={20} color={GREY} />
          </TouchableOpacity>
        </View>

        {/* SHIPPING ADDRESS */}
        <View style={styles.card}>
          <View style={styles.addressHeader}>
            <View style={styles.infoIconSmall}>
              <Ionicons name="location" size={24} color={RED} />
            </View>

            <Text
              style={[styles.infoTitle, styles.addressTitle]}
              numberOfLines={1}
            >
              Shipping Address
            </Text>

            {canChangeAddress && (
              <TouchableOpacity
                style={styles.changeButton}
                activeOpacity={0.8}
                onPress={handleChangeAddress}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.addressBody}>
            {Boolean(shipping.name) && (
              <Text style={styles.addressName}>{shipping.name}</Text>
            )}

            <Text style={styles.infoText}>{shipping.address}</Text>

            {Boolean(shipping.mobile) && (
              <View style={styles.mobileRow}>
                <Ionicons name="call-outline" size={16} color={GREY} />

                <Text style={styles.infoText}>{shipping.mobile}</Text>
              </View>
            )}
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <View style={[styles.card, styles.infoCard]}>
          <View style={styles.infoIcon}>
            <Ionicons name="card" size={26} color={RED} />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Payment Method</Text>

            <Text style={styles.addressName}>{paymentMethod}</Text>
          </View>

          <View
            style={[
              styles.stepPill,
              { backgroundColor: paymentPaid ? GREEN_BG : GOLD_BG },
            ]}
          >
            <Text
              style={[
                styles.stepPillText,
                { color: paymentPaid ? GREEN : GOLD },
              ]}
            >
              {paymentStatus}
            </Text>
          </View>
        </View>

        {/* CANCEL ORDER */}
        {!isDelivered && !isCancelled && Boolean(orderId) && (
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={handleCancelOrder}
            disabled={cancelling}
            accessibilityRole="button"
          >
            {cancelling ? (
              <ActivityIndicator color={RED} />
            ) : (
              <Ionicons name="close-circle-outline" size={22} color={RED} />
            )}

            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={reviewVisible && isDelivered}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeReviewPopup}
      >
        <View style={styles.reviewBackdrop}>
          <ScrollView
            style={styles.reviewModal}
            contentContainerStyle={styles.reviewModalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.reviewTopRow}>
              <View style={styles.reviewIconWrap}>
                <Ionicons name="chatbubble-ellipses" size={25} color={RED} />
              </View>
              <TouchableOpacity
                style={styles.reviewCloseButton}
                onPress={closeReviewPopup}
                disabled={reviewSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Close review popup"
              >
                <Ionicons name="close" size={23} color={GREY} />
              </TouchableOpacity>
            </View>

            <Text style={styles.reviewTitle}>Rate your products</Text>
            <Text style={styles.reviewSubtitle}>
              Share your feedback for each product in this order.
            </Text>

            {reviewItems.map((item) => {
              const reviewKey = getReviewKey(item);
              const draft = reviewDrafts[reviewKey] ?? {};
              const isSubmitted = Boolean(submittedReviewIds[reviewKey]);

              return (
                <View key={reviewKey} style={styles.reviewProductBlock}>
                  <Text style={styles.reviewRatingLabel}>{item.name}</Text>
                  {isSubmitted ? (
                    <Text style={styles.reviewSubmittedText}>
                      Review submitted
                    </Text>
                  ) : (
                    <>
                      {renderRating(
                        "Your rating",
                        draft.rating ?? 0,
                        (rating) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [reviewKey]: {
                              ...current[reviewKey],
                              rating,
                            },
                          })),
                      )}
                      <Text style={styles.reviewInputLabel}>
                        Write a review (optional)
                      </Text>
                      <TextInput
                        value={draft.review ?? ""}
                        onChangeText={(review) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [reviewKey]: {
                              ...current[reviewKey],
                              review,
                            },
                          }))
                        }
                        placeholder="Tell us what you liked or what we can improve..."
                        placeholderTextColor={GREY}
                        multiline
                        maxLength={500}
                        editable={!reviewSubmitting}
                        textAlignVertical="top"
                        style={styles.reviewInput}
                      />
                      <Text style={styles.reviewCharCount}>
                        {(draft.review ?? "").length}/500
                      </Text>
                    </>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={[
                styles.reviewSubmitButton,
                reviewSubmitting && styles.reviewSubmitButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleReviewSubmit}
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.reviewSubmitText}>Submit Ratings</Text>
                  <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reviewLaterButton}
              onPress={closeReviewPopup}
              disabled={reviewSubmitting}
              activeOpacity={0.75}
            >
              <Text style={styles.reviewLaterText}>Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const createStyles = (Colors) => {
  const RED = Colors.primary;
  const BG = Colors.background;
  const CARD = Colors.surface;
  const BORDER = Colors.border;
  const WHITE = Colors.textPrimary;
  const GREY = Colors.textSecondary;
  const GOLD = Colors.gold ?? GOLD_FALLBACK;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: BG,
    },

    // HEADER
    header: {
      height: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },

    backButton: {
      width: 40,
      height: 42,
      alignItems: "flex-start",
      justifyContent: "center",
    },

    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: WHITE,
      ...W.semiBold,
      fontSize: 18,
    },

    headerSpacer: {
      width: 40,
    },

    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 36,
    },

    // CARD
    card: {
      backgroundColor: CARD,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
    },

    cardTitle: {
      color: WHITE,
      ...W.bold,
      fontSize: 20,
      marginBottom: 14,
    },

    eyebrow: {
      color: GREY,
      ...W.medium,
      fontSize: 13,
      letterSpacing: 1.2,
    },

    // TOP CARD
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    topLeft: {
      flexShrink: 0,
    },

    orderNumber: {
      color: WHITE,
      ...W.bold,
      fontSize: 16,
      marginTop: 6,
      marginBottom: 10,
    },

    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
    },

    statusPillText: {
      ...W.semiBold,
      fontSize: 10,
    },

    topMiddle: {
      flex: 1,
      marginLeft: 22,
    },

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: 12,
    },

    dateText: {
      flex: 1,
      color: WHITE,
      ...W.regular,
      fontSize: 15,
    },

    topRight: {
      alignItems: "flex-end",
      marginLeft: 10,
    },

    // Compact layout: order ID on the left, total pushed to the right
    topRightCompact: {
      flex: 1,
    },

    dateCompact: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },

    topTotal: {
      color: RED,
      ...W.bold,
      fontSize: 18,
      marginTop: 8,
    },

    itemCountText: {
      color: GREY,
      ...W.regular,
      fontSize: 13,
      marginTop: 6,
    },

    // ITEMS
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: Colors.divider ?? BORDER,
    },

    lastItemRow: {
      marginBottom: 12,
    },

    itemImage: {
      width: 62,
      height: 56,
      borderRadius: 10,
    },

    itemImagePlaceholder: {
      backgroundColor: Colors.backgroundElement ?? BG,
      alignItems: "center",
      justifyContent: "center",
    },

    itemDetails: {
      flex: 1,
      marginLeft: 14,
    },

    itemName: {
      color: WHITE,
      ...W.semiBold,
      fontSize: 17,
      marginBottom: 4,
    },

    itemMeta: {
      color: GREY,
      ...W.regular,
      fontSize: 15,
      lineHeight: 18,
    },

    itemPrice: {
      color: RED,
      ...W.bold,
      fontSize: 18,
      marginLeft: 8,
    },

    // BILL BOX
    billBox: {
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 6,
      marginBottom: 10,
    },

    billRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    billLabel: {
      color: WHITE,
      ...W.regular,
      fontSize: 16,
    },

    billValue: {
      color: WHITE,
      ...W.medium,
      fontSize: 16,
    },

    dashedDivider: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: GREY,
      marginTop: 2,
      marginBottom: 10,
      opacity: 0.6,
    },

    billTotalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 8,
    },

    billTotalLabel: {
      color: WHITE,
      ...W.bold,
      fontSize: 16,
    },

    billTotalValue: {
      color: RED,
      ...W.bold,
      fontSize: 18,
    },

    // BANNER
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "rgba(245,179,35,0.08)",
      borderWidth: 1,
      borderColor: "rgba(245,179,35,0.55)",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 14,
    },

    bannerText: {
      flex: 1,
      color: WHITE,
      ...W.regular,
      fontSize: 15,
      lineHeight: 19,
    },

    bannerHighlight: {
      color: GOLD,
      ...W.semiBold,
    },

    // INVOICE BUTTONS
    invoiceRow: {
      flexDirection: "row",
      gap: 10,
    },

    printButton: {
      flex: 1,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1.5,
      borderColor: RED,
      borderRadius: 10,
    },

    printButtonText: {
      color: RED,
      ...W.semiBold,
      fontSize: 16,
    },

    downloadButton: {
      flex: 1.25,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: RED,
      borderRadius: 10,
    },

    downloadButtonText: {
      color: "#FFFFFF",
      ...W.semiBold,
      fontSize: 14,
    },

    // TRACKING
    stepRow: {
      flexDirection: "row",
    },

    stepLeft: {
      width: 44,
      alignItems: "center",
    },

    stepCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },

    stepNumber: {
      color: "#FFFFFF",
      ...W.semiBold,
      fontSize: 15,
    },

    stepLine: {
      width: 2,
      flex: 1,
      minHeight: 22,
    },

    stepContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginLeft: 14,
      paddingBottom: 18,
    },

    stepTextBlock: {
      flex: 1,
      paddingTop: 3,
    },

    stepTitle: {
      color: WHITE,
      ...W.semiBold,
      fontSize: 16,
      marginBottom: 3,
    },

    stepSubtitle: {
      color: GREY,
      ...W.regular,
      fontSize: 16,
    },

    stepPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      marginLeft: 8,
    },

    stepPillText: {
      ...W.semiBold,
      fontSize: 15,
    },

    deliveryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 52,
      marginTop: 2,
    },

    deliveryText: {
      flex: 1,
      color: GREY,
      ...W.regular,
      fontSize: 16,
    },

    deliveryLabel: {
      color: WHITE,
      ...W.semiBold,
    },

    // SHIPPING ADDRESS (header row + full-width body)
    addressHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    infoIconSmall: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: RED_BG,
      alignItems: "center",
      justifyContent: "center",
    },

    addressTitle: {
      flex: 1,
      marginBottom: 0,
    },

    addressBody: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: Colors.divider ?? BORDER,
    },

    mobileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: 8,
    },

    // PAYMENT
    infoCard: {
      flexDirection: "row",
      alignItems: "center",
    },

    infoIcon: {
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: RED_BG,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      color: WHITE,
      ...W.bold,
      fontSize: 20,
      marginBottom: 6,
    },

    addressName: {
      color: WHITE,
      ...W.semiBold,
      fontSize: 16,
      marginBottom: 4,
    },

    infoText: {
      color: GREY,
      ...W.regular,
      fontSize: 16,
      lineHeight: 22,
    },

    changeButton: {
      borderWidth: 1.5,
      borderColor: RED,
      borderRadius: 8,
      paddingHorizontal: 18,
      paddingVertical: 9,
    },

    changeButtonText: {
      color: RED,
      ...W.semiBold,
      fontSize: 14,
    },

    // REVIEW & RATINGS POPUP
    reviewBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.72)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 24,
    },
    reviewModal: {
      width: "100%",
      maxWidth: 460,
      maxHeight: "92%",
      backgroundColor: CARD,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: BORDER,
      overflow: "hidden",
    },
    reviewModalContent: {
      padding: 20,
    },
    reviewTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    reviewIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: RED_BG,
      alignItems: "center",
      justifyContent: "center",
    },
    reviewCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: BG,
      alignItems: "center",
      justifyContent: "center",
    },
    reviewTitle: {
      color: WHITE,
      ...W.bold,
      fontSize: 23,
      marginBottom: 7,
    },
    reviewSubtitle: {
      color: GREY,
      ...W.regular,
      fontSize: 14,
      lineHeight: 21,
      marginBottom: 15,
    },
    reviewRatingBlock: {
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    reviewRatingLabel: {
      color: WHITE,
      ...W.semiBold,
      fontSize: 15,
      marginBottom: 7,
    },
    reviewProductBlock: {
      paddingBottom: 12,
      marginBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    reviewSubmittedText: {
      color: Colors.success,
      ...W.medium,
      fontSize: 13,
    },
    reviewStars: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    reviewStarButton: {
      paddingVertical: 2,
      paddingHorizontal: 2,
    },
    reviewInputLabel: {
      color: WHITE,
      ...W.semiBold,
      fontSize: 15,
      marginTop: 15,
      marginBottom: 8,
    },
    reviewInput: {
      minHeight: 86,
      maxHeight: 120,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 13,
      backgroundColor: BG,
      color: WHITE,
      paddingHorizontal: 13,
      paddingVertical: 11,
      fontFamily: SANS,
      fontSize: 14,
      lineHeight: 20,
    },
    reviewCharCount: {
      color: GREY,
      ...W.regular,
      fontSize: 11,
      textAlign: "right",
      marginTop: 5,
    },
    reviewSubmitButton: {
      height: 52,
      backgroundColor: RED,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 14,
    },
    reviewSubmitButtonDisabled: {
      opacity: 0.65,
    },
    reviewSubmitText: {
      color: "#FFFFFF",
      ...W.bold,
      fontSize: 16,
    },
    reviewLaterButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      marginTop: 3,
    },
    reviewLaterText: {
      color: GREY,
      ...W.medium,
      fontSize: 14,
    },
    openReviewButton: {
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: RED,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      marginBottom: 14,
    },
    openReviewButtonText: {
      color: "#FFFFFF",
      ...W.semiBold,
      fontSize: 15,
    },

    // CANCEL
    cancelButton: {
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      borderWidth: 1.5,
      borderColor: RED,
      borderRadius: 12,
      marginTop: 2,
    },

    cancelButtonText: {
      color: RED,
      ...W.semiBold,
      fontSize: 15,
    },
  });
};
