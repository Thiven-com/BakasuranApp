import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { getLocations, storeLocation } from "../utils/Function";

const ADDRESS_TYPES = [
  { label: "Home", icon: "home" },
  { label: "Work", icon: "briefcase-outline" },
  { label: "Other", icon: "location-outline" },
];

// Alert.alert does nothing on web, so fall back to window.alert there.
const notify = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

/* ------------------------------------------------------------------ */
/* Components are defined OUTSIDE the screen so they keep a stable     */
/* identity between renders (otherwise TextInput remounts on each key). */
/* They receive `styles` and `colors` so they still follow the theme.  */
/* ------------------------------------------------------------------ */

const InputField = ({
  label,
  field,
  value,
  error,
  onChange,
  placeholder,
  icon,
  styles,
  colors,
  required = false,
  keyboardType = "default",
  multiline = false,
  maxLength,
  autoCapitalize = "sentences",
  children,
}) => {
  const hasError = Boolean(error);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          hasError && styles.inputError,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={hasError ? colors.primary : colors.textSecondary}
          style={multiline ? styles.multilineIcon : undefined}
        />

        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={(text) => onChange(field, text)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
      {children}
    </View>
  );
};

const SectionTitle = ({ title, subtitle, styles }) => (
  <View style={styles.sectionTitleContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function AddAddressScreen() {
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [addressType, setAddressType] = useState("Home");
  const [locations, setLocations] = useState([]);
  const [locationsMessage, setLocationsMessage] = useState("");
  const [locationsLoadError, setLocationsLoadError] = useState(false);
  const [status, setStatus] = useState(null); // { type: "error" | "success", text }
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    alternate_mobile: "",
    address: "",
    address_2: "",
    landmark: "",
    city: "",
    state: "",
    state_id: null,
    pincode: "",
    email: "",
    gst: "",
    default: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadLocations = async () => {
      try {
        const response = await getLocations();
        const records = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.locations)
              ? response.locations
              : Array.isArray(response?.data?.locations)
                ? response.data.locations
                : null;

        if (response?.success === 0) {
          if (active) {
            setLocations([]);
            setLocationsMessage(
              response.message || "No locations are available.",
            );
          }
          return;
        }

        if (!records) {
          throw new Error("The locations response has an unexpected format.");
        }

        const validLocations = records
          .filter(
            (location) =>
              location?.id !== undefined &&
              location?.id !== null &&
              typeof location?.name === "string" &&
              location.name.trim(),
          )
          .map((location) => ({
            id: location.id,
            name: location.name.trim(),
          }));

        if (active) {
          setLocations(validLocations);
          setLocationsMessage(
            validLocations.length === 0 ? "No locations are available." : "",
          );
        }
      } catch (error) {
        if (active) {
          setLocations([]);
          setLocationsMessage(error.message || "Unable to load locations.");
          setLocationsLoadError(true);
        }
      }
    };

    loadLocations();

    return () => {
      active = false;
    };
  }, []);

  const matchingLocations = form.state.trim()
    ? locations
        .filter((location) =>
          location.name.toLowerCase().includes(form.state.trim().toLowerCase()),
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    if (!form.state.trim() || form.state_id !== null) {
      return;
    }

    const exactMatch = locations.find(
      (location) =>
        location.name.toLowerCase() === form.state.trim().toLowerCase(),
    );

    if (exactMatch) {
      setForm((previous) =>
        previous.state_id === null && previous.state === form.state
          ? { ...previous, state_id: exactMatch.id }
          : previous,
      );
    }
  }, [form.state, form.state_id, locations]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "state"
        ? {
            state_id:
              locations.find(
                (location) =>
                  location.name.toLowerCase() === value.trim().toLowerCase(),
              )?.id ?? null,
          }
        : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const selectLocation = (location) => {
    setForm((previous) => ({
      ...previous,
      state: location.name,
      state_id: location.id,
    }));
    setErrors((previous) => ({ ...previous, state: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (form.alternate_mobile.trim()) {
      if (!/^[6-9]\d{9}$/.test(form.alternate_mobile.trim())) {
        newErrors.alternate_mobile = "Enter a valid alternate mobile number";
      }
    }

    if (!form.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!form.state.trim()) {
      newErrors.state = "Please select a state";
    }

    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    if (form.gst.trim()) {
      const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z0-9]$/;

      if (!gstRegex.test(form.gst.trim().toUpperCase())) {
        newErrors.gst = "Enter a valid GST number";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveAddress = async () => {
    setStatus(null);

    if (!validateForm()) {
      setStatus({
        type: "error",
        text: "Please check the highlighted fields and try again.",
      });
      return;
    }

    const payload = {
      address_type: addressType,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      alternate_mobile: form.alternate_mobile.trim(),
      address: form.address.trim(),
      address_2: form.address_2.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      state: form.state,
      state_id: form.state_id,
      pincode: form.pincode.trim(),
      email: form.email.trim(),
      gst: form.gst.trim().toUpperCase(),
      default: form.default,
    };

    console.log("Address Payload:", payload);

    setSaving(true);

    try {
      const response = await storeLocation(payload);

      if (response?.success === 0 || response?.success === false) {
        throw new Error(response.message || "Could not save address.");
      }

      setStatus({
        type: "success",
        text: response?.message || "Address saved successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Shared props for every InputField
  const fieldProps = (field) => ({
    field,
    value: form[field],
    error: errors[field],
    onChange: updateField,
    styles,
    colors,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : null)}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Address</Text>

        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* ADDRESS TYPE */}
          <View style={styles.card}>
            <SectionTitle title="Address Type" styles={styles} />

            <View style={styles.addressTypeContainer}>
              {ADDRESS_TYPES.map((type) => {
                const selected = addressType === type.label;

                return (
                  <TouchableOpacity
                    key={type.label}
                    style={[
                      styles.addressTypeButton,
                      selected && styles.addressTypeSelected,
                    ]}
                    onPress={() => setAddressType(type.label)}
                  >
                    {selected && (
                      <View style={styles.selectedCheck}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}

                    <Ionicons
                      name={type.icon}
                      size={26}
                      color={selected ? colors.primary : colors.textPrimary}
                    />

                    <Text
                      style={[
                        styles.addressTypeText,
                        selected && styles.addressTypeTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* CONTACT INFORMATION */}
          <View style={styles.card}>
            <SectionTitle
              title="Contact Information"
              subtitle="Enter your contact details"
              styles={styles}
            />

            <InputField
              {...fieldProps("name")}
              label="Full Name"
              placeholder="Enter your full name"
              icon="person-outline"
              required
              autoCapitalize="words"
            />

            <InputField
              {...fieldProps("mobile")}
              label="Mobile Number"
              placeholder="Enter mobile number"
              icon="phone-portrait-outline"
              keyboardType="phone-pad"
              required
              maxLength={10}
            />

            <InputField
              {...fieldProps("alternate_mobile")}
              label="Alternate Mobile Number"
              placeholder="Enter alternate mobile number"
              icon="phone-portrait-outline"
              keyboardType="phone-pad"
              maxLength={10}
            />

            <InputField
              {...fieldProps("email")}
              label="Email Address"
              placeholder="Enter your email address"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />
          </View>

          {/* ADDRESS DETAILS */}
          <View style={styles.card}>
            <SectionTitle
              title="Address Details"
              subtitle="Where should we deliver your order?"
              styles={styles}
            />

            <InputField
              {...fieldProps("address")}
              label="Address Line 1"
              placeholder="House number, street name"
              icon="location-outline"
              required
            />

            <InputField
              {...fieldProps("address_2")}
              label="Address Line 2"
              placeholder="Apartment, area, near bus stand"
              icon="navigate-outline"
            />

            <InputField
              {...fieldProps("landmark")}
              label="Landmark"
              placeholder="Nearby landmark"
              icon="business-outline"
            />

            <InputField
              {...fieldProps("city")}
              label="City"
              placeholder="Enter city"
              icon="business-outline"
              required
              autoCapitalize="words"
            />

            {/* STATE */}
            <InputField
              {...fieldProps("state")}
              label="State"
              placeholder="Enter state"
              icon="map-outline"
              required
              autoCapitalize="words"
            >
              {matchingLocations.length > 0 && (
                <View style={styles.locationSuggestions}>
                  {matchingLocations.map((location) => (
                    <TouchableOpacity
                      key={String(location.id)}
                      style={styles.locationSuggestion}
                      onPress={() => selectLocation(location)}
                    >
                      <Text style={styles.locationSuggestionText}>
                        {location.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {locationsMessage ? (
                <Text
                  style={[
                    styles.locationHint,
                    locationsLoadError && styles.locationHintError,
                  ]}
                >
                  {locationsMessage}
                </Text>
              ) : null}
            </InputField>

            <InputField
              {...fieldProps("pincode")}
              label="Pincode"
              placeholder="Enter 6-digit pincode"
              icon="location-outline"
              keyboardType="number-pad"
              required
              maxLength={6}
            />

            <InputField
              {...fieldProps("gst")}
              label="GST Number"
              placeholder="Enter GST number (optional)"
              icon="document-text-outline"
              autoCapitalize="characters"
              maxLength={15}
            />
          </View>

          {/* DEFAULT ADDRESS */}
          <View style={styles.defaultAddressCard}>
            <View style={styles.defaultAddressContent}>
              <View style={styles.defaultIcon}>
                <Ionicons
                  name="bookmark-outline"
                  size={22}
                  color={colors.warning}
                />
              </View>

              <View style={styles.defaultAddressTextContainer}>
                <Text style={styles.defaultAddressTitle}>
                  Set as default address
                </Text>

                <Text style={styles.defaultAddressSubtitle}>
                  Use this address for future orders
                </Text>
              </View>

              <Switch
                value={form.default}
                onValueChange={(value) => updateField("default", value)}
                trackColor={{
                  false: isDark ? "#383838" : "#D1D5DB",
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? "#383838" : "#D1D5DB"}
              />
            </View>
          </View>

          {/* STATUS MESSAGE */}
          {status && (
            <View
              style={[
                styles.statusBanner,
                status.type === "error"
                  ? styles.statusBannerError
                  : styles.statusBannerSuccess,
              ]}
            >
              <Ionicons
                name={
                  status.type === "error"
                    ? "alert-circle-outline"
                    : "checkmark-circle-outline"
                }
                size={18}
                color={
                  status.type === "error" ? colors.primary : colors.warning
                }
              />
              <Text style={styles.statusBannerText}>{status.text}</Text>
            </View>
          )}

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveAddress}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Address"}
            </Text>
          </TouchableOpacity>

          <View style={styles.secureTextContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color={colors.warning}
            />

            <Text style={styles.secureText}>
              Your address information is securely stored
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =============================================
// STYLES (theme aware)
// =============================================

const makeStyles = (colors, isDark) => {
  const inputBg = colors.input || colors.surface;
  const redTint = isDark ? "#23090D" : "#FFF0F1";
  const goldTint = isDark ? "#282216" : "#FFF4E0";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // HEADER (same pattern as Profile)
    header: {
      height: 82,
      backgroundColor: colors.background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
    },

    backButton: {
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

    headerRight: {
      width: 48,
    },

    // SCROLL
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 20,
    },

    // CARD
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 15,
      marginBottom: 14,
    },

    sectionTitleContainer: {
      marginBottom: 17,
    },

    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 19,
      fontFamily: Fonts.semiBold,
    },

    sectionSubtitle: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 15,
      marginTop: 5,
    },

    // ADDRESS TYPE
    addressTypeContainer: {
      flexDirection: "row",
      gap: 9,
    },

    addressTypeButton: {
      flex: 1,
      height: 90,
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },

    addressTypeSelected: {
      backgroundColor: redTint,
      borderColor: colors.primary,
      borderWidth: 1.5,
    },

    selectedCheck: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    addressTypeText: {
      color: colors.textSecondary,
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      marginTop: 8,
    },

    addressTypeTextSelected: {
      color: colors.textPrimary,
    },

    // INPUT FIELDS
    fieldContainer: {
      marginBottom: 15,
    },

    label: {
      color: colors.textSecondary,
      fontSize: 15,
      fontFamily: Fonts.medium,
      marginBottom: 8,
    },

    required: {
      color: colors.primary,
      fontWeight: "800",
    },

    inputContainer: {
      minHeight: 51,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 11,
      paddingHorizontal: 13,
    },

    multilineContainer: {
      alignItems: "flex-start",
      paddingTop: 12,
    },

    multilineIcon: {
      marginTop: 2,
    },

    input: {
      flex: 1,
      minHeight: 49,
      color: colors.textPrimary,
      fontSize: 15,
      marginLeft: 12,
      paddingVertical: 10,
    },

    multilineInput: {
      minHeight: 80,
      textAlignVertical: "top",
      paddingTop: 0,
    },

    inputError: {
      borderColor: colors.primary,
    },

    errorText: {
      color: colors.primary,
      fontFamily: Fonts.medium,
      fontSize: 11,
      marginTop: 5,
    },

    locationSuggestions: {
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginTop: 6,
      overflow: "hidden",
    },

    locationSuggestion: {
      minHeight: 42,
      justifyContent: "center",
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider || colors.border,
    },

    locationSuggestionText: {
      color: colors.textPrimary,
      fontFamily: Fonts.medium,
      fontSize: 15,
    },

    locationHint: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 13,
      marginTop: 6,
    },

    locationHintError: {
      color: colors.primary,
    },

    // DEFAULT ADDRESS
    defaultAddressCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 15,
      marginBottom: 15,
    },

    defaultAddressContent: {
      flexDirection: "row",
      alignItems: "center",
    },

    defaultIcon: {
      width: 37,
      height: 37,
      borderRadius: 10,
      backgroundColor: goldTint,
      alignItems: "center",
      justifyContent: "center",
    },

    defaultAddressTextContainer: {
      flex: 1,
      marginLeft: 11,
    },

    defaultAddressTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    defaultAddressSubtitle: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 13,
      marginTop: 5,
    },

    // STATUS BANNER
    statusBanner: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },

    statusBannerError: {
      backgroundColor: redTint,
      borderColor: colors.primary,
    },

    statusBannerSuccess: {
      backgroundColor: goldTint,
      borderColor: colors.warning,
    },

    statusBannerText: {
      flex: 1,
      color: colors.textPrimary,
      fontFamily: Fonts.medium,
      fontSize: 15,
      marginLeft: 9,
    },

    // SAVE BUTTON
    saveButton: {
      height: 54,
      backgroundColor: colors.primary,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },

    saveButtonDisabled: {
      opacity: 0.65,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: 15,
      marginLeft: 9,
    },

    secureTextContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 14,
    },

    secureText: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 15,
      marginLeft: 6,
    },
  });
};
