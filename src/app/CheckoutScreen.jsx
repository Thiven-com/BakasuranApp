import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

import {
  checkoutOrder,
  checkoutPreview,
  deleteCartItem,
  getCart,
  getLocations,
  updateCartQuantity,
} from "../utils/Function";

// ============================================================
// CONSTANTS
// ============================================================

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    title: "Razorpay",
    description: "UPI, cards, wallets & more",
    icon: "card-outline",
  },
];

const ORDER_TYPES = [
  { id: "order", label: "Order Now", icon: "flash-outline" },
];

const FALLBACK_DELIVERY_FEE = 30;

// ============================================================
// ALERT HELPERS
// ============================================================

const notify = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const confirmAction = (title, message, onConfirm) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: onConfirm },
    ]);
  }
};

// ============================================================
// API RESPONSE HELPERS
// ============================================================

const unwrapResponse = (response) => {
  let result = response;

  // Axios response -> response.data
  if (result?.data !== undefined) {
    result = result.data;
  }

  return result;
};

const isFailure = (response) => {
  const data = unwrapResponse(response);

  return (
    !response ||
    data?.success === 0 ||
    data?.success === false ||
    data?.success === "0"
  );
};

const getErrorMessage = (response, fallback) => {
  const data = unwrapResponse(response);

  return (
    data?.message || response?.message || response?.data?.message || fallback
  );
};

const toNumber = (object, keys) => {
  for (const key of keys) {
    const value = object?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
};

// ============================================================
// CART RESPONSE NORMALIZATION
// ============================================================

const extractCartItems = (response) => {
  const root = unwrapResponse(response);
  const data = root?.data ?? root;

  const possibleLists = [
    data?.cart,
    data?.items,
    data?.cart_items,
    data?.cartItems,
    data?.products,
    root?.cart,
    root?.items,
    root?.cart_items,
    Array.isArray(data) ? data : null,
    Array.isArray(root) ? root : null,
  ];

  return possibleLists.find((list) => Array.isArray(list)) ?? [];
};

const normalizeCartItem = (raw) => {
  const cartItem = raw?.cart_item ?? raw?.cartItem ?? raw;

  const product =
    cartItem?.product ??
    cartItem?.product_details ??
    cartItem?.productDetail ??
    {};

  const variant =
    cartItem?.variant ??
    cartItem?.product_variant ??
    cartItem?.productVariant ??
    {};

  // Cart row ID
  const id =
    cartItem?.cart_item_id ??
    cartItem?.cartItemId ??
    cartItem?.cart_id ??
    cartItem?.id;

  const price =
    toNumber(cartItem, [
      "price",
      "sale_price",
      "unit_price",
      "selling_price",
      "variant_price",
    ]) ??
    toNumber(variant, ["price", "sale_price", "selling_price"]) ??
    toNumber(product, ["price", "sale_price", "selling_price"]) ??
    0;

  const quantity = toNumber(cartItem, ["quantity", "qty"]) ?? 1;

  // ============================================================
  // IMAGE
  // API gives image inside variant.image
  // ============================================================
  const image =
    variant?.image ??
    cartItem?.variant_image ??
    cartItem?.image ??
    product?.image ??
    product?.thumbnail ??
    null;

  // ============================================================
  // PRODUCT NAME
  // ============================================================
  const name =
    cartItem?.name ??
    cartItem?.product_title ??
    product?.title ??
    product?.product_title ??
    "Food Item";

  // ============================================================
  // DESCRIPTION
  // ============================================================
  const description =
    cartItem?.description ??
    product?.description ??
    variant?.description ??
    cartItem?.variant_name ??
    cartItem?.variantName ??
    variant?.name ??
    variant?.variant_name ??
    cartItem?.size ??
    "";

  const vegValue =
    cartItem?.is_veg ??
    cartItem?.veg ??
    product?.is_veg ??
    product?.veg ??
    false;

  return {
    id,
    productId: product?.id ?? null,
    variantId: variant?.id ?? null,

    name,
    description,

    image,

    price: Number.isFinite(price) ? price : 0,

    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,

    veg: vegValue === true || vegValue === 1 || vegValue === "1",
  };
};

// ============================================================
// PREVIEW RESPONSE NORMALIZATION
// ============================================================

const normalizePreview = (response) => {
  const root = unwrapResponse(response);
  const data = root?.data ?? root;
  const summary = data?.summary ?? data?.totals ?? data;

  return {
    itemTotal: toNumber(summary, ["item_total", "subtotal", "sub_total"]),

    deliveryFee: toNumber(summary, [
      "delivery_fee",
      "delivery_charge",
      "shipping_charge",
      "shipping",
    ]),

    gst: toNumber(summary, ["gst", "tax", "tax_amount"]),

    discount: toNumber(summary, [
      "discount",
      "discount_amount",
      "coupon_discount",
    ]),

    total: toNumber(summary, [
      "total",
      "grand_total",
      "total_amount",
      "payable",
    ]),

    deliveryCharges:
      data?.delivery_charges && typeof data.delivery_charges === "object"
        ? data.delivery_charges
        : {},
  };
};

// ============================================================
// ADDRESS HELPERS
// ============================================================

const normalizeAddress = (raw) => ({
  id: raw?.id,
  name: raw?.address_type || raw?.type || raw?.name || "Address",

  address: [raw?.address, raw?.address_2, raw?.landmark]
    .filter(Boolean)
    .join(", "),

  city: [raw?.city, raw?.state, raw?.pincode].filter(Boolean).join(" "),

  mobile: raw?.mobile || "",

  isDefault: Boolean(raw?.default ?? raw?.is_default),
});

const extractAddresses = (response) => {
  const root = unwrapResponse(response);
  const data = root?.data ?? root;

  const list = Array.isArray(data)
    ? data
    : (data?.locations ?? data?.addresses ?? data?.data ?? []);

  return Array.isArray(list)
    ? list.filter((item) => item?.id !== undefined).map(normalizeAddress)
    : [];
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

const SectionTitle = ({ number, title, styles }) => (
  <View style={styles.sectionTitle}>
    <View style={styles.numberCircle}>
      <Text style={styles.numberText}>{number}</Text>
    </View>

    <Text style={styles.sectionHeading}>{title}</Text>
  </View>
);

const Card = ({ children, style, styles }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const PriceRow = ({ label, value, valueStyle, styles }) => (
  <View style={styles.priceRow}>
    <Text style={styles.priceLabel}>{label}</Text>

    <Text style={[styles.priceValue, valueStyle]}>{value}</Text>
  </View>
);

// ============================================================
// CHECKOUT SCREEN
// ============================================================

export default function CheckoutScreen() {
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  // Cart items are loaded from the API.
  const [items, setItems] = useState([]);

  const [cartLoading, setCartLoading] = useState(true);
  const [cartActionId, setCartActionId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [addressPickerVisible, setAddressPickerVisible] = useState(false);

  const [email, setEmail] = useState("raju.kumar@gmail.com");
  const [mobile, setMobile] = useState("8686742779");

  const [payment, setPayment] = useState("razorpay");
  const [orderType, setOrderType] = useState("order");

  // Saved addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Discount code
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);

  // Server-calculated prices
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const address =
    addresses.find((item) => item.id === selectedAddressId) ?? null;

  const successColor = colors.success || "#22C55E";
  const radioOff = colors.textSecondary;

  // Used to refresh the price preview when cart quantities change.
  const cartSignature = items
    .map((item) => `${item.id}:${item.quantity}:${item.price}`)
    .join("|");

  // ==========================================================
  // LOAD CART API
  // ==========================================================

  const loadCart = useCallback(async () => {
    setCartLoading(true);

    try {
      const response = await getCart();

      console.log("CHECKOUT CART RESPONSE:", JSON.stringify(response, null, 2));

      if (isFailure(response)) {
        throw new Error(
          getErrorMessage(response, "Unable to load cart items."),
        );
      }

      const cartRows = extractCartItems(response);

      const formattedItems = cartRows
        .map(normalizeCartItem)
        .filter((item) => item.id !== undefined && item.id !== null);

      setItems(formattedItems);
    } catch (error) {
      console.log("CHECKOUT CART ERROR:", error);

      setItems([]);

      notify("Cart Error", error?.message || "Unable to load cart items.");
    } finally {
      setCartLoading(false);
    }
  }, []);

  // ==========================================================
  // LOAD ADDRESSES API
  // ==========================================================

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true);

    try {
      const response = await getLocations();

      console.log(
        "CHECKOUT ADDRESSES RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      if (isFailure(response)) {
        throw new Error(getErrorMessage(response, "Unable to load addresses."));
      }

      const list = extractAddresses(response);

      setAddresses(list);

      setSelectedAddressId((current) => {
        if (current && list.some((item) => item.id === current)) {
          return current;
        }

        const preferred = list.find((item) => item.isDefault) ?? list[0];

        return preferred ? preferred.id : null;
      });
    } catch (error) {
      console.log("LOAD ADDRESSES ERROR:", error);

      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  // Refresh cart and addresses whenever the Checkout screen
  // becomes active, including when returning from Add Address.
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
      loadCart();
    }, [loadAddresses, loadCart]),
  );

  // ============================================================
  // CHECKOUT PREVIEW PAYLOAD
  // ============================================================

  const buildPreviewPayload = useCallback(
    (code) => ({
      order_type: orderType,
      address_id: Number(address?.id),
      ...(code ? { code } : {}),
    }),
    [orderType, address?.id],
  );

  // ============================================================
  // CHECKOUT PREVIEW API
  // ============================================================

  useEffect(() => {
    if (!address?.id || items.length === 0) {
      setPreview(null);
      setPreviewLoading(false);
      setPreviewError("");
      return undefined;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError("");
      setPreview(null);

      try {
        const payload = buildPreviewPayload(appliedCode);

        console.log(
          "CHECKOUT PREVIEW PAYLOAD:",
          JSON.stringify(payload, null, 2),
        );

        const response = await checkoutPreview(payload);

        console.log(
          "CHECKOUT PREVIEW RESPONSE:",
          JSON.stringify(response, null, 2),
        );

        if (isFailure(response)) {
          throw new Error(
            getErrorMessage(response, "Unable to load price details."),
          );
        }

        if (!cancelled) {
          setPreview(normalizePreview(response));
        }
      } catch (error) {
        if (!cancelled) {
          console.log("CHECKOUT PREVIEW ERROR:", error);

          setPreview(null);
          setPreviewError(error?.message || "Unable to load price details.");
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [orderType, address?.id, appliedCode, cartSignature, buildPreviewPayload]);
  // ==========================================================
  // PRICE CALCULATIONS
  // SAME BILL CALCULATION AS CART SCREEN
  // ==========================================================

  const itemTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;

      return total + price * quantity;
    }, 0);
  });

  // Same CartScreen rule:
  // Subtotal >= ₹299 -> FREE delivery
  // Subtotal < ₹299  -> ₹30 delivery
  const deliveryFee = useMemo(() => {
    if (itemTotal <= 0) {
      return 0;
    }

    return itemTotal >= 299 ? 0 : 30;
  }, [itemTotal]);

  // Same CartScreen rule:
  // GST = 5% of subtotal
  const gst = useMemo(() => {
    return itemTotal * 0.05;
  }, [itemTotal]);

  // Coupon discount comes from checkout preview API.
  const discount = Number(preview?.discount || 0);

  // Same CartScreen total calculation,
  // with coupon discount applied.
  const total = useMemo(() => {
    return Math.max(itemTotal + deliveryFee + gst - discount, 0);
  }, [itemTotal, deliveryFee, gst, discount]);

  const itemCount = useMemo(() => {
    return items.reduce(
      (count, item) => count + (Number(item.quantity) || 0),
      0,
    );
  }, [items]);

  // ==========================================================
  // UPDATE CART QUANTITY API
  // ==========================================================

  const updateQuantity = async (item, change) => {
    if (!item?.id || cartActionId !== null) {
      return;
    }

    const newQuantity = item.quantity + change;

    // Save current cart in case the API request fails.
    const previousItems = items;

    setCartActionId(item.id);

    // Optimistically update the screen so the amount changes
    // immediately while the API request is running.
    if (newQuantity <= 0) {
      setItems((previous) =>
        previous.filter((cartItem) => cartItem.id !== item.id),
      );
    } else {
      setItems((previous) =>
        previous.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: newQuantity,
              }
            : cartItem,
        ),
      );
    }

    setPreview(null);

    try {
      let response;

      if (newQuantity <= 0) {
        // Quantity is zero: remove the cart item.
        response = await deleteCartItem(item.id);

        console.log(
          "DELETE CART ITEM RESPONSE:",
          JSON.stringify(response, null, 2),
        );
      } else {
        // Quantity is greater than zero: update quantity.
        response = await updateCartQuantity(item.id, newQuantity);

        console.log(
          "UPDATE CART QUANTITY RESPONSE:",
          JSON.stringify(response, null, 2),
        );
      }

      if (isFailure(response)) {
        throw new Error(getErrorMessage(response, "Unable to update cart."));
      }

      // Fetch the latest cart values from the server.
      await loadCart();
    } catch (error) {
      console.log("CART UPDATE ERROR:", error);

      // Restore the previous cart if the API fails.
      setItems(previousItems);

      notify("Cart Update Failed", error?.message || "Unable to update cart.");
    } finally {
      setCartActionId(null);
    }
  };

  // ==========================================================
  // APPLY DISCOUNT
  // ==========================================================

  const applyDiscount = async () => {
    const code = discountCode.trim().toUpperCase();

    if (!code) {
      notify("Discount", "Please enter a discount code.");
      return;
    }

    if (!address?.id) {
      notify("Delivery Address", "Please select a delivery address first.");
      return;
    }

    setApplyingCode(true);

    try {
      const payload = buildPreviewPayload(code);

      console.log("DISCOUNT PREVIEW PAYLOAD:", JSON.stringify(payload));

      const response = await checkoutPreview(payload);

      console.log(
        "DISCOUNT PREVIEW RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      if (isFailure(response)) {
        throw new Error(getErrorMessage(response, "Invalid discount code."));
      }

      setDiscountCode(code);
      setAppliedCode(code);

      notify("Success", getErrorMessage(response, "Discount code applied."));
    } catch (error) {
      setAppliedCode("");

      notify("Invalid Code", error?.message || "Invalid discount code.");
    } finally {
      setApplyingCode(false);
    }
  };

  const removeDiscount = () => {
    setAppliedCode("");
    setDiscountCode("");
    setPreview(null);
  };

  // ==========================================================
  // PLACE ORDER API
  // ==========================================================

  const submitOrder = async () => {
    if (!address?.id) {
      notify("Delivery Address", "Please select a delivery address.");
      return;
    }

    const payload = {
      shipping_address_id: address.id,
      payment_method: payment,
      order_type: orderType,

      ...(appliedCode ? { code: appliedCode } : {}),

      delivery_charges: preview?.deliveryCharges ?? {},
    };

    console.log("CHECKOUT PAYLOAD:", JSON.stringify(payload, null, 2));

    setSubmitting(true);

    try {
      const response = await checkoutOrder(payload);

      console.log("CHECKOUT RESPONSE:", JSON.stringify(response, null, 2));

      if (isFailure(response)) {
        throw new Error(
          getErrorMessage(response, "Unable to place your order."),
        );
      }

      const result = unwrapResponse(response);
      const order =
        result?.data?.order ??
        result?.data ??
        result?.order ??
        result;
      const orderId =
        order?.restaurant_food_order_id ??
        order?.order_id ??
        order?.id ??
        order?.order_number;

      if (orderId === undefined || orderId === null || String(orderId) === "") {
        notify(
          "Order placed",
          "Your order was placed, but the server did not return an order ID to load its details.",
        );
        return;
      }

      router.replace({
        pathname: "/order-success",
        params: { orderId: String(orderId) },
      });
    } catch (error) {
      console.log("CHECKOUT ORDER ERROR:", error);

      notify(
        "Checkout failed",
        error?.message || "Unable to place your order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const placeOrder = () => {
    if (items.length === 0) {
      notify("Empty Cart", "Please add items to your cart.");
      return;
    }

    if (!email.trim() || !mobile.trim()) {
      notify(
        "Contact Information",
        "Please enter your email and mobile number.",
      );
      return;
    }

    if (!address) {
      notify("Delivery Address", "Please select a delivery address.");
      return;
    }

    if (cartLoading || cartActionId !== null) {
      notify("Please wait", "Your cart is still being updated.");
      return;
    }

    confirmAction(
      "Place Order",
      `Total: ₹${total.toFixed(2)}\nPayment: ${payment.toUpperCase()}`,
      submitOrder,
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => (router.canGoBack() ? router.back() : null)}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Checkout</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push("/CartScreen")}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={23} color={colors.textPrimary} />

          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* PAGE TITLE
        <View style={styles.pageHeading}>
          <Text style={styles.brandText}>BAKASURAN FOOD</Text>

          <Text style={styles.pageTitle}>Checkout</Text>

          <Text style={styles.pageSubtitle}>
            You're just a few steps away from enjoying your favourite food.
          </Text>
        </View> */}

        {/* ORDER TYPE 
        <View style={styles.orderTypeRow}>
          {ORDER_TYPES.map((type) => {
            const selected = orderType === type.id;

            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.orderTypeButton,
                  selected && styles.orderTypeButtonActive,
                ]}
                onPress={() => setOrderType(type.id)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={type.icon}
                  size={18}
                  color={selected ? colors.primary : colors.textSecondary}
                />

                <Text
                  style={[
                    styles.orderTypeText,
                    selected && styles.orderTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View> */}

        {/* 01 CONTACT INFORMATION */}
        <Card styles={styles}>
          <SectionTitle
            number="01"
            title="Contact Information"
            styles={styles}
          />

          <Text style={styles.label}>Email Address</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Mobile Number</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter mobile number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </Card>

        {/* 02 DELIVERY ADDRESS */}
        <Card styles={styles}>
          <SectionTitle number="02" title="Delivery Address" styles={styles} />

          {addressesLoading ? (
            <View style={styles.emptyAddress}>
              <ActivityIndicator color={colors.primary} />

              <Text style={styles.emptyAddressText}>Loading addresses...</Text>
            </View>
          ) : address ? (
            <View style={styles.addressBox}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={25} color={colors.primary} />
              </View>

              <View style={styles.addressDetails}>
                <Text style={styles.addressTitle}>{address.name}</Text>

                <Text style={styles.addressText}>{address.address}</Text>

                <Text style={styles.addressText}>{address.city}</Text>
              </View>

              <TouchableOpacity onPress={() => setAddressPickerVisible(true)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyAddress}>
              <Ionicons
                name="location-outline"
                size={35}
                color={colors.textSecondary}
              />

              <Text style={styles.emptyAddressText}>
                No saved delivery address found.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => router.push("/addresses")}
          >
            <Ionicons name="add" size={20} color={colors.primary} />

            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </Card>

        {/* 03 PAYMENT METHOD */}
        <Card styles={styles}>
          <SectionTitle number="03" title="Payment Method" styles={styles} />

          {PAYMENT_METHODS.map((method) => {
            const selected = payment === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  selected && styles.paymentSelected,
                ]}
                onPress={() => setPayment(method.id)}
              >
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={23}
                  color={selected ? colors.primary : radioOff}
                />

                <View style={styles.paymentIcon}>
                  <Ionicons
                    name={method.icon}
                    size={26}
                    color={selected ? colors.primary : colors.textPrimary}
                  />
                </View>

                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>{method.title}</Text>

                  <Text style={styles.paymentDescription}>
                    {method.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* ORDER SUMMARY */}
        <Card styles={styles}>
          <Text style={styles.summaryEyebrow}>YOUR SELECTION</Text>

          <View style={styles.summaryHeading}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <Text style={styles.itemCountText}>{itemCount} Items</Text>
          </View>

          {/* CART LOADING */}
          {cartLoading ? (
            <View style={styles.emptyAddress}>
              <ActivityIndicator color={colors.primary} />

              <Text style={styles.emptyAddressText}>Loading cart items...</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyAddress}>
              <Ionicons
                name="cart-outline"
                size={30}
                color={colors.textSecondary}
              />

              <Text style={styles.emptyAddressText}>
                Your cart is empty. Please add food items.
              </Text>
            </View>
          ) : (
            /* FOOD ITEMS */
            items.map((item) => {
              const isUpdating = cartActionId === item.id;

              return (
                <View style={styles.foodItem} key={item.id}>
                  <View style={styles.foodImage}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.foodImageActual}
                        resizeMode="cover"
                        onError={(error) => {
                          console.log(
                            "FOOD IMAGE ERROR:",
                            item.image,
                            error?.nativeEvent,
                          );
                        }}
                      />
                    ) : (
                      <View style={styles.foodImageFallback}>
                        <Text style={styles.foodEmoji}>🍽️</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.foodDetails}>
                    <Text style={styles.foodName}>{item.name}</Text>

                    <View style={styles.foodTypeRow}>
                      <View
                        style={[
                          styles.vegDot,
                          {
                            backgroundColor: item.veg
                              ? successColor
                              : colors.primary,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.foodType,
                          {
                            color: item.veg ? successColor : colors.primary,
                          },
                        ]}
                      >
                        {item.veg ? "Veg" : "Non Veg"}
                      </Text>
                    </View>

                    {!!item.description && (
                      <Text style={styles.foodDescription}>
                        {item.description}
                      </Text>
                    )}

                    <Text style={styles.foodUnitPrice}>
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </Text>

                    {/* QUANTITY */}
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item, -1)}
                        disabled={isUpdating || cartActionId !== null}
                      >
                        {isUpdating ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <Ionicons
                            name={
                              item.quantity === 1 ? "trash-outline" : "remove"
                            }
                            size={17}
                            color={colors.textSecondary}
                          />
                        )}
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item, 1)}
                        disabled={isUpdating || cartActionId !== null}
                      >
                        <Ionicons
                          name="add"
                          size={19}
                          color={colors.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.foodPrice}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}

          {/* DISCOUNT CODE */}
          <View style={styles.discountContainer}>
            <View style={styles.discountInputContainer}>
              <Ionicons
                name="ticket-outline"
                size={20}
                color={colors.textSecondary}
              />

              <TextInput
                style={styles.discountInput}
                placeholder="Discount code"
                placeholderTextColor={colors.textSecondary}
                value={discountCode}
                onChangeText={setDiscountCode}
                autoCapitalize="characters"
                editable={!appliedCode}
              />
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={appliedCode ? removeDiscount : applyDiscount}
              disabled={applyingCode}
            >
              {applyingCode ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.applyButtonText}>
                  {appliedCode ? "REMOVE" : "APPLY"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* PRICE BREAKDOWN */}
          <PriceRow
            label="Item Total"
            value={`₹${itemTotal.toFixed(2)}`}
            styles={styles}
          />

          <PriceRow
            label="Delivery Fee"
            value={`₹${deliveryFee.toFixed(2)}`}
            styles={styles}
          />

          <PriceRow label="GST" value={`₹${gst.toFixed(2)}`} styles={styles} />

          <PriceRow
            label="Coupon Discount"
            value={`- ₹${discount.toFixed(2)}`}
            valueStyle={styles.discountValue}
            styles={styles}
          />

          {previewLoading && (
            <Text style={styles.previewNote}>Updating prices...</Text>
          )}

          {!!previewError && (
            <Text style={styles.previewError}>{previewError}</Text>
          )}

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>

          {/* PLACE ORDER */}
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              (submitting ||
                previewLoading ||
                cartLoading ||
                cartActionId !== null ||
                items.length === 0) &&
                styles.placeOrderButtonDisabled,
            ]}
            onPress={placeOrder}
            disabled={
              submitting ||
              previewLoading ||
              cartLoading ||
              cartActionId !== null ||
              items.length === 0
            }
            activeOpacity={0.85}
          >
            <Text style={styles.placeOrderText}>
              {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
            </Text>
          </TouchableOpacity>

          <View style={styles.secureCheckout}>
            <Ionicons name="lock-closed" size={14} color={colors.warning} />

            <Text style={styles.secureText}>Secure & encrypted checkout</Text>
          </View>
        </Card>

        {/* FOOTER FEATURES */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={colors.warning}
            />

            <Text style={styles.featureText}>Secure Payment</Text>
          </View>

          <View style={styles.featureDivider} />

          <View style={styles.feature}>
            <Ionicons
              name="restaurant-outline"
              size={25}
              color={colors.warning}
            />

            <Text style={styles.featureText}>Freshly Prepared Food</Text>
          </View>

          <View style={styles.featureDivider} />

          <View style={styles.feature}>
            <Ionicons name="car-outline" size={25} color={colors.warning} />

            <Text style={styles.featureText}>Easy Order Tracking</Text>
          </View>
        </View>

        <View style={{ height: 25 }} />
      </ScrollView>

      {/* ADDRESS PICKER */}
      {addressPickerVisible && (
        <View style={styles.addressPickerOverlay}>
          <TouchableOpacity
            style={styles.addressPickerBackdrop}
            activeOpacity={1}
            onPress={() => setAddressPickerVisible(false)}
          />

          <View style={styles.addressPicker}>
            <View style={styles.addressPickerHeader}>
              <Text style={styles.addressPickerTitle}>Select Address</Text>

              <TouchableOpacity
                onPress={() => setAddressPickerVisible(false)}
                hitSlop={12}
              >
                <Ionicons name="close" size={21} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.addressPickerList}
              showsVerticalScrollIndicator={false}
            >
              {addresses.map((item) => {
                const selected = item.id === selectedAddressId;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.savedAddressOption,
                      selected && styles.savedAddressOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedAddressId(item.id);
                      setAddressPickerVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={selected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={selected ? successColor : radioOff}
                    />

                    <View style={styles.savedAddressDetails}>
                      <Text style={styles.savedAddressName}>{item.name}</Text>

                      <Text style={styles.savedAddressText}>
                        {item.address}
                      </Text>

                      <Text style={styles.savedAddressText}>{item.city}</Text>

                      {!!item.mobile && (
                        <Text style={styles.savedAddressText}>
                          {item.mobile}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {addresses.length === 0 && (
                <Text style={styles.addressPickerEmpty}>
                  You have no saved addresses yet.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.pickerAddAddressButton}
              onPress={() => {
                setAddressPickerVisible(false);
                router.push("/addresses");
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={19} color="#FFFFFF" />

              <Text style={styles.pickerAddAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// =============================================
// STYLES (theme aware)
// =============================================

const makeStyles = (colors, isDark) => {
  const success = colors.success || "#22C55E";
  const inputBg = colors.input || colors.surface;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ADDRESS PICKER
    addressPickerOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-end",
      zIndex: 10,
    },

    addressPickerBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.68)",
    },

    addressPicker: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 20,
    },

    addressPickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    addressPickerTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 16,
    },

    addressPickerList: {
      maxHeight: 320,
    },

    addressPickerEmpty: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 12,
      marginBottom: 12,
    },

    savedAddressOption: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "flex-start",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      marginBottom: 12,
    },

    savedAddressOptionSelected: {
      borderColor: success,
    },

    savedAddressDetails: {
      flex: 1,
      marginLeft: 9,
    },

    savedAddressName: {
      color: colors.textPrimary,
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      marginBottom: 3,
    },

    savedAddressText: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 11,
      lineHeight: 16,
    },

    pickerAddAddressButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: success,
      borderRadius: 12,
    },

    pickerAddAddressText: {
      color: "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: 13,
      marginLeft: 5,
    },

    // HEADER (same pattern as Profile)
    header: {
      height: 82,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      backgroundColor: colors.background,
    },

    headerButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xxl,
      letterSpacing: -0.3,
    },

    cartBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    cartBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "800",
    },

    // PAGE
    scrollContent: {
      paddingHorizontal: 14,
      paddingBottom: 20,
    },

    pageHeading: {
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 22,
    },

    brandText: {
      color: colors.warning,
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 3,
    },

    pageTitle: {
      color: colors.textPrimary,
      fontSize: 36,
      fontFamily: Fonts.regular,
      fontWeight: "800",
      marginTop: 7,
    },

    pageSubtitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.medium,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
      marginTop: 8,
    },

    // ORDER TYPE
    orderTypeRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 13,
    },

    orderTypeButton: {
      flex: 1,
      height: 46,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
    },

    orderTypeButtonActive: {
      backgroundColor: isDark ? "#23090D" : "#FFF0F1",
      borderColor: colors.primary,
    },

    orderTypeText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 18,
      marginLeft: 7,
    },

    orderTypeTextActive: {
      color: colors.textPrimary,
    },

    // CARD
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 15,
      marginBottom: 13,
    },

    sectionTitle: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 19,
    },

    numberCircle: {
      width: 34,
      height: 34,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },

    numberText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "900",
    },

    sectionHeading: {
      color: colors.textPrimary,
      fontSize: 20,
      fontFamily: Fonts.regular,
      flex: 1,
    },

    // CONTACT
    label: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 19,
      marginBottom: 8,
    },

    inputContainer: {
      height: 49,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      marginBottom: 16,
    },

    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 19,
      marginLeft: 11,
    },

    // ADDRESS
    addressBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      padding: 12,
      marginBottom: 10,
    },

    locationIcon: {
      width: 42,
      alignItems: "center",
      justifyContent: "center",
    },

    addressDetails: {
      flex: 1,
      marginLeft: 5,
    },

    addressTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 17,
      marginBottom: 5,
    },

    addressText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 17,
      lineHeight: 18,
    },

    changeText: {
      color: colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      paddingLeft: 8,
    },

    emptyAddress: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },

    emptyAddressText: {
      flex: 1,
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      lineHeight: 19,
      marginLeft: 12,
    },

    addAddressButton: {
      height: 45,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    addAddressText: {
      color: colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 19,
      marginLeft: 6,
    },

    // PAYMENT
    paymentOption: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      paddingHorizontal: 11,
      paddingVertical: 10,
      marginBottom: 9,
    },

    paymentSelected: {
      borderColor: colors.primary,
    },

    paymentIcon: {
      width: 38,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 8,
    },

    paymentContent: {
      flex: 1,
    },

    paymentTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 19,
    },

    paymentDescription: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      lineHeight: 15,
      marginTop: 4,
    },

    // ORDER SUMMARY
    summaryEyebrow: {
      color: colors.warning,
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: 2,
    },

    summaryHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
      marginBottom: 20,
    },

    summaryTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 19,
    },

    itemCountText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 16,
    },

    foodItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
    },

    foodImage: {
      width: 65,
      height: 65,
      borderRadius: 11,
      backgroundColor: isDark ? "#242424" : "#F2F2F2",
      overflow: "hidden",
    },

    foodImageActual: {
      width: "100%",
      height: "100%",
      borderRadius: 11,
    },

    foodImageFallback: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    foodEmoji: {
      fontSize: 30,
    },
    foodDetails: {
      flex: 1,
      marginLeft: 11,
    },

    foodName: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 17,
    },

    foodTypeRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    vegDot: {
      width: 7,
      height: 7,
      borderRadius: 5,
      marginRight: 5,
    },

    foodType: {
      fontSize: 16,
      fontWeight: "600",
    },

    foodDescription: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      marginTop: 5,
    },

    foodUnitPrice: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      marginTop: 4,
    },

    foodPrice: {
      color: colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 17,
      marginLeft: 5,
      marginTop: 5,
    },

    // QUANTITY
    quantityContainer: {
      height: 31,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      marginTop: 8,
    },

    quantityButton: {
      width: 31,
      height: 29,
      alignItems: "center",
      justifyContent: "center",
    },

    quantityText: {
      minWidth: 29,
      textAlign: "center",
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 14,
    },

    // DISCOUNT
    discountContainer: {
      flexDirection: "row",
      marginTop: 2,
      marginBottom: 20,
    },

    discountInputContainer: {
      flex: 1,
      height: 45,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 9,
      paddingHorizontal: 10,
    },

    discountInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 16,
      marginLeft: 8,
    },

    applyButton: {
      minWidth: 78,
      backgroundColor: colors.primary,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },

    applyButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },

    // PRICE
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 11,
    },

    priceLabel: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 17,
    },

    priceValue: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 17,
    },

    discountValue: {
      color: colors.warning,
    },

    previewNote: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 13,
      marginBottom: 6,
    },

    previewError: {
      color: colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 13,
      marginBottom: 6,
    },

    totalDivider: {
      height: 1,
      backgroundColor: colors.divider || colors.border,
      marginVertical: 9,
    },

    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    totalLabel: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 18,
    },

    totalValue: {
      color: colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 22,
      fontWeight: "900",
    },

    // PLACE ORDER
    placeOrderButton: {
      height: 53,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 17,
    },

    placeOrderButtonDisabled: {
      opacity: 0.65,
    },

    placeOrderText: {
      color: "#FFFFFF",
      fontSize: 19,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    secureCheckout: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 15,
    },

    secureText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 14,
      marginLeft: 7,
    },

    // FOOTER
    featuresContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 17,
      paddingHorizontal: 5,
    },

    feature: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    featureText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 12,
      textAlign: "center",
      marginTop: 7,
    },

    featureDivider: {
      width: 1,
      height: 35,
      backgroundColor: colors.divider || colors.border,
    },
  });
};
