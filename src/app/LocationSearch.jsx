import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { getLocations, storeSelectedAddress } from "../utils/Function";

// TODO: point these at your real assets
const LOGO = require("../../assets/images/logo.png");
const ILLUSTRATION = require("../../assets/images/city.png");

const SANS = Fonts.regular;
const font = (weight) => ({ fontFamily: SANS, fontWeight: weight });
const W = {
  regular: font("400"),
  medium: font("500"),
  semiBold: font("600"),
  bold: font("700"),
};

// This screen is a light "sheet" on a red header, so it uses its own fixed
// light palette instead of the theme's dark surfaces/borders.
const UI = {
  headerFallback: "#A30000",
  primaryFallback: "#E5202A",
  sheet: "#FFFFFF",
  title: "#0F1B2D",
  text: "#1E2633",
  muted: "#6B7688",
  placeholder: "#8A94A6",
  border: "#DDE1E8",
  pinkBg: "#FDECEC",
  pinkEdge: "#F6C9CC",
};

// Alert.alert does nothing on web
const notify = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// "Block 1a, 1st Block Koramangala, Koramangala, Bengaluru, Karnataka 560034, India"
const formatAddress = (place) => {
  if (!place) return "";

  const parts = [
    place.name,
    place.street,
    place.district,
    place.city ?? place.subregion,
    [place.region, place.postalCode].filter(Boolean).join(" "),
    place.country,
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean);

  // drop consecutive duplicates (name often equals street)
  return parts
    .filter(
      (part, index) => part.toLowerCase() !== parts[index - 1]?.toLowerCase(),
    )
    .join(", ");
};

const findAddressRecords = (value, depth = 0) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object" || depth > 4) return [];

  for (const key of ["addresses", "locations", "data", "items", "results"]) {
    const records = findAddressRecords(value[key], depth + 1);
    if (records.length > 0) return records;
  }

  return [];
};

const extractSavedAddresses = (response) => {
  const list = findAddressRecords(response);

  return list
    .filter((address) => address?.id !== undefined && address?.id !== null)
    .map((address) => ({
      ...address,
      label: address?.address_type || address?.type || "Address",
      street: [address?.address, address?.address_2, address?.landmark]
        .filter(Boolean)
        .join(", "),
      area: [address?.city, address?.state, address?.pincode]
        .filter(Boolean)
        .join(", "),
      isDefault: [true, 1, "1"].includes(
        address?.default ?? address?.is_default,
      ),
    }));
};

const SelectLocationScreen = () => {
  const { colors: Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(Colors, insets), [Colors, insets]);

  const PRIMARY = Colors.primary ?? UI.primaryFallback;

  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [locating, setLocating] = useState(true);
  const [current, setCurrent] = useState(null); // { address, latitude, longitude }
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");

  const loadSavedAddresses = useCallback(async () => {
    setAddressesLoading(true);
    setAddressesError("");

    try {
      const response = await getLocations();

      if (
        response?.success === 0 ||
        response?.success === false ||
        response?.success === "0" ||
        response?.success === 9 ||
        response?.success === "9"
      ) {
        throw new Error(response.message || "Unable to load saved addresses.");
      }

      setSavedAddresses(extractSavedAddresses(response));
    } catch (error) {
      setSavedAddresses([]);
      setAddressesError(error?.message || "Unable to load saved addresses.");
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedAddresses();
    }, [loadSavedAddresses]),
  );

  const detectLocation = useCallback(async () => {
    setLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setCurrent(null);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setCurrent({ address: formatAddress(place), latitude, longitude });
    } catch (error) {
      setCurrent(null);
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSearch = () => {
    const text = query.trim();

    if (!text) return;

    Keyboard.dismiss();

    router.push({
      pathname: "/enable-location", // TODO: your route
      params: { query: text },
    });
  };

  const handleUseCurrent = () => {
    if (locating) return;

    if (!current) {
      notify(
        "Location",
        "We couldn't get your location. Please allow location access and try again.",
      );
      detectLocation();
      return;
    }

    router.push({
      pathname: "/enable-location", // TODO: your route
      params: {
        address: current.address,
        latitude: String(current.latitude),
        longitude: String(current.longitude),
      },
    });
  };

  const handleAddNew = () => {
    router.push("/addresses"); // TODO: your route
  };

  const handleSelectAddress = async (address) => {
    try {
      await storeSelectedAddress(address);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/HomeScreen");
      }
    } catch (error) {
      notify(
        "Address",
        error?.message || "Unable to select this delivery address.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.logoBadge}>
          <Image source={LOGO} style={styles.logo} resizeMode="cover" />
        </View>
      </View>

      {/* SHEET (fills the rest of the screen) */}
      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Enter your area or apartment name</Text>

          {/* SEARCH */}
          <View style={[styles.searchBox, focused && styles.searchBoxFocused]}>
            <Ionicons name="search" size={22} color={UI.muted} />

            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search for area, street name"
              placeholderTextColor={UI.placeholder}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCorrect={false}
              selectionColor={PRIMARY}
            />

            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={UI.placeholder}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* CURRENT LOCATION */}
          <TouchableOpacity
            style={styles.currentCard}
            activeOpacity={0.85}
            onPress={handleUseCurrent}
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
          >
            <View style={styles.currentIconWrap}>
              <Ionicons name="locate" size={26} color={PRIMARY} />
            </View>

            <View style={styles.currentTextBlock}>
              <Text style={styles.currentTitle}>Use my current location</Text>

              {locating ? (
                <View style={styles.locatingRow}>
                  <ActivityIndicator size="small" color={PRIMARY} />
                  <Text style={styles.currentAddress}>
                    Detecting your location...
                  </Text>
                </View>
              ) : (
                <Text style={styles.currentAddress} numberOfLines={3}>
                  {current?.address ||
                    "Tap to allow location access and detect your address"}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.savedAddressesSection}>
            <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>

            {addressesLoading ? (
              <View style={styles.addressesMessage}>
                <ActivityIndicator size="small" color={PRIMARY} />
                <Text style={styles.addressesMessageText}>
                  Loading your addresses...
                </Text>
              </View>
            ) : addressesError ? (
              <TouchableOpacity
                style={styles.addressesMessage}
                onPress={loadSavedAddresses}
                accessibilityRole="button"
              >
                <Text style={styles.addressesErrorText}>{addressesError}</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            ) : savedAddresses.length === 0 ? (
              <Text style={styles.addressesMessageText}>
                No saved addresses yet.
              </Text>
            ) : (
              savedAddresses.map((address) => (
                <TouchableOpacity
                  key={String(address.id)}
                  style={styles.savedAddressCard}
                  onPress={() => handleSelectAddress(address)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Deliver to ${address.label}`}
                >
                  <View style={styles.savedAddressIcon}>
                    <Ionicons
                      name={
                        address.label.toLowerCase() === "home"
                          ? "home-outline"
                          : address.label.toLowerCase() === "work"
                            ? "briefcase-outline"
                            : "location-outline"
                      }
                      size={20}
                      color={PRIMARY}
                    />
                  </View>

                  <View style={styles.savedAddressDetails}>
                    <View style={styles.savedAddressTitleRow}>
                      <Text style={styles.savedAddressLabel}>
                        {address.label}
                      </Text>
                      {address.isDefault && (
                        <Text style={styles.defaultBadge}>DEFAULT</Text>
                      )}
                    </View>
                    {!!address.street && (
                      <Text style={styles.savedAddressText} numberOfLines={2}>
                        {address.street}
                      </Text>
                    )}
                    {!!address.area && (
                      <Text style={styles.savedAddressText} numberOfLines={1}>
                        {address.area}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={UI.placeholder}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* ADD NEW ADDRESS */}
          <TouchableOpacity
            style={styles.addCard}
            activeOpacity={0.85}
            onPress={handleAddNew}
            accessibilityRole="button"
            accessibilityLabel="Add new address"
          >
            <View style={styles.plusBox}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </View>

            <Text style={styles.addText}>Add new address</Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={UI.placeholder}
              style={styles.addChevron}
            />
          </TouchableOpacity>

          {/* ILLUSTRATION (pinned to the bottom of the sheet) */}
          <View style={styles.illustrationWrap}>
            <Image
              source={ILLUSTRATION}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default SelectLocationScreen;

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const createStyles = (Colors, insets) => {
  const PRIMARY = Colors.primary ?? UI.primaryFallback;
  const HEADER_BG = Colors.primaryDark ?? UI.headerFallback;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: HEADER_BG,
    },

    // HEADER
    header: {
      paddingTop: insets.top + 8,
      paddingBottom: 18,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: HEADER_BG,
    },

    backButton: {
      position: "absolute",
      left: 16,
      bottom: 24,
      width: 40,
      height: 40,
      alignItems: "flex-start",
      justifyContent: "center",
      zIndex: 2,
    },

    logoBadge: {
      width: 64,
      height: 64,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.9)",
      backgroundColor: "#000000",
    },

    logo: {
      width: "100%",
      height: "100%",
    },

    // SHEET
    sheet: {
      flex: 1,
      backgroundColor: UI.sheet,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: "hidden",
    },

    sheetContent: {
      flexGrow: 1,
      paddingTop: 24,
      paddingHorizontal: 18,
      paddingBottom: insets.bottom + 8,
    },

    title: {
      color: UI.title,
      ...W.bold,
      fontSize: 22,
      lineHeight: 30,
      marginBottom: 18,
    },

    // SEARCH
    searchBox: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 16,
      borderRadius: 27,
      borderWidth: 1.5,
      borderColor: UI.border,
      backgroundColor: "#FFFFFF",
      marginBottom: 16,
    },

    searchBoxFocused: {
      borderColor: PRIMARY,
    },

    searchInput: {
      flex: 1,
      height: "100%",
      color: UI.title,
      ...W.regular,
      fontSize: 16,
      paddingVertical: 0,
      ...(Platform.OS === "web" ? { outlineStyle: "none" } : null),
    },

    // CURRENT LOCATION
    currentCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: UI.pinkEdge,
      backgroundColor: UI.pinkBg,
      marginBottom: 14,
    },

    currentIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: UI.pinkEdge,
    },

    currentTextBlock: {
      flex: 1,
    },

    currentTitle: {
      color: PRIMARY,
      ...W.bold,
      fontSize: 17,
    },

    currentAddress: {
      color: UI.text,
      ...W.regular,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 3,
    },

    locatingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },

    // SAVED ADDRESSES
    savedAddressesSection: {
      marginTop: 22,
    },

    savedAddressesTitle: {
      color: UI.title,
      ...W.bold,
      fontSize: 18,
      marginBottom: 10,
    },

    savedAddressCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: UI.border,
      backgroundColor: "#FFFFFF",
      marginBottom: 10,
    },

    savedAddressIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: UI.pinkBg,
    },

    savedAddressDetails: {
      flex: 1,
    },

    savedAddressTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 3,
    },

    savedAddressLabel: {
      color: UI.title,
      ...W.semiBold,
      fontSize: 15,
    },

    defaultBadge: {
      color: PRIMARY,
      ...W.bold,
      fontSize: 9,
      letterSpacing: 0.6,
    },

    savedAddressText: {
      color: UI.muted,
      ...W.regular,
      fontSize: 13,
      lineHeight: 18,
    },

    addressesMessage: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
    },

    addressesMessageText: {
      color: UI.muted,
      ...W.regular,
      fontSize: 14,
    },

    addressesErrorText: {
      flex: 1,
      color: PRIMARY,
      ...W.regular,
      fontSize: 14,
    },

    retryText: {
      color: PRIMARY,
      ...W.bold,
      fontSize: 13,
    },

    addCard: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
      borderRadius: 30,
      borderWidth: 1.5,
      borderColor: UI.border,
      backgroundColor: "#FFFFFF",
    },

    plusBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: PRIMARY,
    },

    addText: {
      flex: 1,
      color: PRIMARY,
      ...W.bold,
      fontSize: 17,
    },

    addChevron: {
      marginLeft: "auto",
    },

    // ILLUSTRATION
    illustrationWrap: {
      flex: 1,
      justifyContent: "flex-end",
      paddingTop: 28,
      minHeight: 190,
    },

    illustration: {
      width: "100%",
      height: 160,
    },
  });
};
