import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

export default function Addresses() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showForm, setShowForm] = useState(false);

  const [addressType, setAddressType] = useState("Home");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      name: "Raju Kumar",
      mobile: "+91 98765 43210",
      address: "12-4-56, Main Road",
      landmark: "Near City Center",
      city: "Hyderabad",
      pincode: "500001",
      color: colors.info,
      icon: "home-outline",
    },
    {
      id: 2,
      type: "Work",
      name: "Raju Kumar",
      mobile: "+91 98765 43210",
      address: "Tech Park, Block A",
      landmark: "Near Metro Station",
      city: "Hyderabad",
      pincode: "500081",
      color: "#A855F7",
      icon: "briefcase-outline",
    },
  ]);

  /* =====================================================
     ADD ADDRESS
  ===================================================== */

  const handleAddAddress = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }

    if (!mobile.trim()) {
      Alert.alert("Required", "Please enter your mobile number.");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Required", "Please enter your address.");
      return;
    }

    if (!city.trim()) {
      Alert.alert("Required", "Please enter your city.");
      return;
    }

    if (!pincode.trim()) {
      Alert.alert("Required", "Please enter your pincode.");
      return;
    }

    const typeColor =
      addressType === "Home"
        ? colors.info
        : addressType === "Work"
          ? "#A855F7"
          : colors.warning;

    const typeIcon =
      addressType === "Home"
        ? "home-outline"
        : addressType === "Work"
          ? "briefcase-outline"
          : "location-outline";

    const newAddress = {
      id: Date.now(),
      type: addressType,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      color: typeColor,
      icon: typeIcon,
    };

    setAddresses((previous) => [...previous, newAddress]);

    clearForm();

    Alert.alert("Address Added", "Your address has been added successfully.");
  };

  /* =====================================================
     CLEAR FORM
  ===================================================== */

  const clearForm = () => {
    setName("");
    setMobile("");
    setAddress("");
    setLandmark("");
    setCity("");
    setPincode("");
    setAddressType("Home");
    setShowForm(false);
  };

  /* =====================================================
     DELETE ADDRESS
  ===================================================== */

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setAddresses((previous) =>
              previous.filter((item) => item.id !== id),
            );
          },
        },
      ],
    );
  };

  /* =====================================================
     EDIT ADDRESS
  ===================================================== */

  const handleEdit = (item) => {
    setAddressType(item.type);
    setName(item.name);
    setMobile(item.mobile);
    setAddress(item.address);
    setLandmark(item.landmark);
    setCity(item.city);
    setPincode(item.pincode);

    setShowForm(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Addresses</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Delivery Addresses</Text>

          <Text style={styles.subtitle}>
            Manage your saved delivery locations
          </Text>
        </View>

        {/* =================================================
            SAVED ADDRESSES
        ================================================= */}

        {addresses.length > 0 && (
          <View style={styles.addressList}>
            {addresses.map((item) => (
              <View key={item.id} style={styles.addressCard}>
                {/* TOP */}

                <View style={styles.addressTop}>
                  <View
                    style={[
                      styles.addressIcon,
                      {
                        backgroundColor: `${item.color}18`,
                      },
                    ]}
                  >
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>

                  <View style={styles.addressTitleContainer}>
                    <Text style={styles.addressType}>{item.type}</Text>

                    <Text style={styles.addressName}>{item.name}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={styles.editButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="create-outline"
                      size={19}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                {/* ADDRESS DETAILS */}

                <View style={styles.addressDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="call-outline"
                      size={16}
                      color={colors.textSecondary}
                    />

                    <Text style={styles.detailText}>{item.mobile}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.textSecondary}
                    />

                    <Text style={styles.detailText}>{item.address}</Text>
                  </View>

                  {item.landmark ? (
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="navigate-outline"
                        size={16}
                        color={colors.textSecondary}
                      />

                      <Text style={styles.detailText}>{item.landmark}</Text>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color={colors.textSecondary}
                    />

                    <Text style={styles.detailText}>
                      {item.city} - {item.pincode}
                    </Text>
                  </View>
                </View>

                {/* DELETE */}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={colors.error}
                  />

                  <Text style={styles.deleteText}>Remove Address</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* =================================================
            ADD ADDRESS BUTTON
        ================================================= */}

        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={25} color={colors.white} />

            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        )}

        {/* =================================================
            ADD ADDRESS FORM
        ================================================= */}

        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add New Address</Text>

              <TouchableOpacity onPress={clearForm} activeOpacity={0.7}>
                <Ionicons name="close" size={25} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* ADDRESS TYPE */}

            <Text style={styles.inputLabel}>Address Type</Text>

            <View style={styles.typeContainer}>
              {["Home", "Work", "Other"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    addressType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setAddressType(type)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      type === "Home"
                        ? "home-outline"
                        : type === "Work"
                          ? "briefcase-outline"
                          : "location-outline"
                    }
                    size={18}
                    color={
                      addressType === type ? colors.white : colors.textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.typeText,
                      addressType === type && styles.typeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* NAME */}

            <Text style={styles.inputLabel}>Full Name</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            {/* MOBILE */}

            <Text style={styles.inputLabel}>Mobile Number</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={mobile}
                onChangeText={setMobile}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* ADDRESS */}

            <Text style={styles.inputLabel}>Complete Address</Text>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons
                name="location-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="House no, street, area"
                placeholderTextColor={colors.textMuted}
                multiline
                style={[styles.input, styles.textArea]}
              />
            </View>

            {/* LANDMARK */}

            <Text style={styles.inputLabel}>Landmark</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="navigate-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={landmark}
                onChangeText={setLandmark}
                placeholder="Nearby landmark"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            {/* CITY */}

            <Text style={styles.inputLabel}>City</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="business-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            {/* PINCODE */}

            <Text style={styles.inputLabel}>Pincode</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="map-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={pincode}
                onChangeText={setPincode}
                placeholder="Enter pincode"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
              />
            </View>

            {/* SAVE */}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddAddress}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color={colors.white}
              />

              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={clearForm}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {addresses.length === 0 && !showForm && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="location-outline"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>No Addresses Yet</Text>

            <Text style={styles.emptyText}>
              Add your delivery address to order delicious food.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* ================= HEADER ================= */

  header: {
    height: 62,
    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: colors.card,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: colors.border,
  },

  headerTitle: {
    color: colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
  },

  headerSpace: {
    width: 42,
  },

  /* ================= TITLE ================= */

  titleContainer: {
    marginTop: 22,
    marginBottom: 18,
  },

  title: {
    color: colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xxl,
  },

  subtitle: {
    color: colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,

    marginTop: 6,
  },

  /* ================= ADDRESS ================= */

  addressList: {
    gap: 14,
  },

  addressCard: {
    backgroundColor: colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: colors.border,

    padding: 15,
  },

  addressTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressIcon: {
    width: 45,
    height: 45,

    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",
  },

  addressTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  addressType: {
    color: colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  addressName: {
    color: colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,

    marginTop: 3,
  },

  editButton: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: colors.backgroundElement,

    justifyContent: "center",
    alignItems: "center",
  },

  addressDetails: {
    marginTop: 16,

    paddingTop: 13,

    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 10,
  },

  detailText: {
    flex: 1,

    color: colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    marginLeft: 10,

    lineHeight: 19,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 5,
    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  deleteText: {
    color: colors.error,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,

    marginLeft: 7,
  },

  /* ================= ADD ================= */

  addButton: {
    height: 56,

    borderRadius: 28,

    backgroundColor: colors.primary,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 18,
  },

  addButtonText: {
    color: colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,

    marginLeft: 8,
  },

  /* ================= FORM ================= */

  formCard: {
    backgroundColor: colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: colors.border,

    padding: 16,

    marginTop: 18,
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 20,
  },

  formTitle: {
    color: colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
  },

  inputLabel: {
    color: colors.textSecondary,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,

    marginBottom: 8,
    marginTop: 13,
  },

  typeContainer: {
    flexDirection: "row",
    gap: 8,
  },

  typeButton: {
    flex: 1,

    height: 44,

    borderRadius: 12,

    backgroundColor: colors.backgroundElement,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  typeButtonActive: {
    backgroundColor: colors.primary,

    borderColor: colors.primary,
  },

  typeText: {
    color: colors.textSecondary,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,

    marginLeft: 6,
  },

  typeTextActive: {
    color: colors.white,
  },

  inputContainer: {
    minHeight: 52,

    borderRadius: 13,

    backgroundColor: colors.backgroundElement,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
  },

  input: {
    flex: 1,

    color: colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    marginLeft: 10,

    paddingVertical: 10,
  },

  textAreaContainer: {
    alignItems: "flex-start",

    paddingTop: 13,
  },

  textArea: {
    minHeight: 75,

    textAlignVertical: "top",
  },

  saveButton: {
    height: 56,

    borderRadius: 28,

    backgroundColor: colors.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 25,
  },

  saveButtonText: {
    color: colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,

    marginLeft: 8,
  },

  cancelButton: {
    height: 48,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 4,
  },

  cancelText: {
    color: colors.textSecondary,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.md,
  },

  /* ================= EMPTY ================= */

  emptyContainer: {
    alignItems: "center",

    paddingVertical: 70,
  },

  emptyIcon: {
    width: 90,
    height: 90,

    borderRadius: 45,

    backgroundColor: colors.surface,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 18,
  },

  emptyTitle: {
    color: colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.lg,
  },

  emptyText: {
    color: colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,

    textAlign: "center",

    lineHeight: 20,

    marginTop: 8,

    paddingHorizontal: 40,
  },
});
