import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  getLocations,
} from "../utils/Function";

const INITIAL_ITEMS = [
  {
    id: 1,
    name: "Chicken Biryani",
    description: "500g • Full",
    price: 249,
    quantity: 1,
    veg: false,
    image: "🍛",
  },
  {
    id: 2,
    name: "Paneer Special",
    description: "300g • Regular",
    price: 199,
    quantity: 1,
    veg: true,
    image: "🍲",
  },
  {
    id: 3,
    name: "Fried Chicken",
    description: "1 Piece",
    price: 60,
    quantity: 1,
    veg: false,
    image: "🍗",
  },
];

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
  { id: "preorder", label: "Pre-order", icon: "calendar-outline" },
];

// Used only until the preview API responds
const FALLBACK_DELIVERY_FEE = 30;

/* ------------------------------------------------------------------ */
/* Alert.alert does nothing on web, so use window.alert / confirm there */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* API response helpers                                                */
/* ------------------------------------------------------------------ */

const isFailure = (response) =>
  !response || response.success === 0 || response.success === false;

const toNumber = (object, keys) => {
  for (const key of keys) {
    const value = object?.[key];

    if (value !== undefined && value !== null && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
};

const normalizePreview = (response) => {
  const data = response?.data ?? response ?? {};
  const summary = data.summary ?? data.totals ?? data;

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
      data.delivery_charges && typeof data.delivery_charges === "object"
        ? data.delivery_charges
        : {},
  };
};

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
  const data = response?.data ?? response;
  const list = Array.isArray(data)
    ? data
    : (data?.locations ?? data?.addresses ?? data?.data ?? []);

  return Array.isArray(list)
    ? list.filter((item) => item?.id !== undefined).map(normalizeAddress)
    : [];
};

/* ------------------------------------------------------------------ */
/* Small components. They receive `styles` so they stay outside the    */
/* screen (stable identity) but still follow the active theme.         */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function CheckoutScreen() {
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [submitting, setSubmitting] = useState(false);
  const [addressPickerVisible, setAddressPickerVisible] = useState(false);

  const [email, setEmail] = useState("raju.kumar@gmail.com");
  const [mobile, setMobile] = useState("8686742779");

  const [payment, setPayment] = useState("razorpay");
  const [orderType, setOrderType] = useState("order");

  // Saved addresses from the API
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

  // Theme shortcuts
  const successColor = colors.success || "#22C55E";
  const radioOff = colors.textSecondary;

  /* ---------- load saved addresses (also when returning from Add Address) ---------- */

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true);

    try {
      const response = await getLocations();
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
      console.log("LOAD ADDRESSES ERROR:", error.message);
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses]),
  );

  /* ---------- checkout/preview ---------- */

  const buildPreviewPayload = (code) => ({
    order_type: orderType,
    address_id: address?.id,
    ...(code ? { code } : {}),
  });

  useEffect(() => {
    if (!address?.id) {
      setPreview(null);
      return undefined;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError("");

      try {
        const response = await checkoutPreview({
          order_type: orderType,
          address_id: address.id,
          ...(appliedCode ? { code: appliedCode } : {}),
        });

        console.log("CHECKOUT PREVIEW RESPONSE:", JSON.stringify(response));

        if (isFailure(response)) {
          throw new Error(response?.message || "Unable to load price details.");
        }

        if (!cancelled) {
          setPreview(normalizePreview(response));
        }
      } catch (error) {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(error.message || "Unable to load price details.");
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
  }, [orderType, address?.id, appliedCode]);

  /* ---------- prices (server values win, local values are the fallback) ---------- */

  const localItemTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const itemTotal = preview?.itemTotal ?? localItemTotal;
  const deliveryFee = preview?.deliveryFee ?? FALLBACK_DELIVERY_FEE;
  const gst = preview?.gst ?? Math.round(localItemTotal * 0.05);
  const discount = preview?.discount ?? 0;
  const total =
    preview?.total ?? Math.max(itemTotal + deliveryFee + gst - discount, 0);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  /* ---------- actions ---------- */

  const updateQuantity = (id, change) => {
    setItems((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + change,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

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
      // Validate the code with the preview API before applying it
      const response = await checkoutPreview(buildPreviewPayload(code));

      if (isFailure(response)) {
        throw new Error(response?.message || "Invalid discount code.");
      }

      setDiscountCode(code);
      setAppliedCode(code);
      notify("Success", response?.message || "Discount code applied.");
    } catch (error) {
      setAppliedCode("");
      notify("Invalid Code", error.message || "Invalid discount code.");
    } finally {
      setApplyingCode(false);
    }
  };

  const removeDiscount = () => {
    setAppliedCode("");
    setDiscountCode("");
  };

  const submitOrder = async () => {
    const payload = {
      shipping_address_id: address.id,
      payment_method: payment,
      order_type: orderType,
      ...(appliedCode ? { code: appliedCode } : {}),
      delivery_charges: preview?.deliveryCharges ?? {},
    };

    console.log("CHECKOUT PAYLOAD:", JSON.stringify(payload));

    setSubmitting(true);
    try {
      const response = await checkoutOrder(payload);

      console.log("CHECKOUT RESPONSE:", JSON.stringify(response));

      if (isFailure(response)) {
        throw new Error(response?.message || "Unable to place your order.");
      }

      notify(
        "Order placed",
        response?.message || "Your order has been placed successfully.",
      );
    } catch (error) {
      notify("Checkout failed", error.message || "Unable to place your order.");
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

    confirmAction(
      "Place Order",
      `Total: ₹${total.toFixed(2)}\nPayment: ${payment.toUpperCase()}`,
      submitOrder,
    );
  };

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
          onPress={() => notify("Cart", "Connect your cart screen.")}
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
        {/* PAGE TITLE */}
        <View style={styles.pageHeading}>
          <Text style={styles.brandText}>BAKASURAN FOOD</Text>

          <Text style={styles.pageTitle}>Checkout</Text>

          <Text style={styles.pageSubtitle}>
            You're just a few steps away from enjoying your favourite food.
          </Text>
        </View>

        {/* ORDER TYPE */}
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
        </View>

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

          {/* FOOD ITEMS */}
          {items.map((item) => (
            <View style={styles.foodItem} key={item.id}>
              <View style={styles.foodImage}>
                <Text style={styles.foodEmoji}>{item.image}</Text>
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

                <Text style={styles.foodDescription}>{item.description}</Text>

                <Text style={styles.foodUnitPrice}>
                  {item.quantity} × ₹{item.price.toFixed(2)}
                </Text>

                {/* QUANTITY */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Ionicons
                      name={item.quantity === 1 ? "trash-outline" : "remove"}
                      size={17}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Ionicons name="add" size={19} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.foodPrice}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

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

          {Boolean(previewError) && (
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
              (submitting || previewLoading) && styles.placeOrderButtonDisabled,
            ]}
            onPress={placeOrder}
            disabled={submitting || previewLoading}
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

                      {Boolean(item.mobile) && (
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
      fontFamily: Fonts.bold,
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
      fontFamily: Fonts.bold,
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
      fontSize: 32,
      fontFamily: Fonts.bold,
      fontWeight: "800",
      marginTop: 7,
    },

    pageSubtitle: {
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      fontFamily: Fonts.bold,
      fontSize: 13,
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
      fontSize: 17,
      fontFamily: Fonts.semiBold,
      flex: 1,
    },

    // CONTACT
    label: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 17,
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
      fontSize: 15,
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
      fontFamily: Fonts.bold,
      fontSize: 15,
      marginBottom: 5,
    },

    addressText: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 15,
      lineHeight: 18,
    },

    changeText: {
      color: colors.primary,
      fontFamily: Fonts.bold,
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
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
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
      fontFamily: Fonts.bold,
      fontSize: 15,
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
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    paymentDescription: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 15,
      lineHeight: 15,
      marginTop: 4,
    },

    // ORDER SUMMARY
    summaryEyebrow: {
      color: colors.warning,
      fontSize: 15,
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
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    itemCountText: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 15,
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
      alignItems: "center",
      justifyContent: "center",
    },

    foodEmoji: {
      fontSize: 32,
    },

    foodDetails: {
      flex: 1,
      marginLeft: 11,
    },

    foodName: {
      color: colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 15,
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
      fontSize: 15,
      fontWeight: "600",
    },

    foodDescription: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 15,
      marginTop: 5,
    },

    foodUnitPrice: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 13,
      marginTop: 4,
    },

    foodPrice: {
      color: colors.primary,
      fontFamily: Fonts.bold,
      fontSize: 15,
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
      fontFamily: Fonts.bold,
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
      fontSize: 14,
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
      fontSize: 14,
      fontWeight: "900",
    },

    // PRICE
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 11,
    },

    priceLabel: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 15,
    },

    priceValue: {
      color: colors.textPrimary,
      fontFamily: Fonts.semiBold,
      fontSize: 15,
    },

    discountValue: {
      color: colors.warning,
    },

    previewNote: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 13,
      marginBottom: 6,
    },

    previewError: {
      color: colors.primary,
      fontFamily: Fonts.medium,
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
      fontFamily: Fonts.bold,
      fontSize: 18,
    },

    totalValue: {
      color: colors.primary,
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
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 0.5,
    },

    secureCheckout: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 15,
    },

    secureText: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 11,
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
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 9,
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
