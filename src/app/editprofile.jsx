
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { updateProfile } from "../utils/Function";

// =========================================================
// API CONFIGURATION
// =========================================================


export default function EditProfileScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // =======================================================
  // FORM STATE
  // =======================================================

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  // =======================================================
  // UPDATE PROFILE API
  // POST /api/customer/profile/update
  // =======================================================

  
const handleSave = async () => {
  if (!fullName.trim()) {
    Alert.alert("Required", "Please enter your full name.");
    return;
  }

  if (email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    Alert.alert("Invalid Email", "Please enter a valid email address.");
    return;
  }

  if (saving) return;

  setSaving(true);

  try {
    const result = await updateProfile({
      name: fullName,
      email: email,
    });

    if (Number(result?.success) === 1) {
      Alert.alert(
        "Profile Updated",
        result.message || "Your profile has been updated successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else if (Number(result?.success) === 9) {
      Alert.alert(
        "Login Required",
        result.message || "Please login again."
      );
    } else {
      const errorMessage = result?.errors
        ? Object.values(result.errors).flat().join("\n")
        : result?.message || "Unable to update your profile.";

      Alert.alert("Update Failed", errorMessage);
    }
  } catch (error) {
    Alert.alert(
      "Error",
      error?.message || "Unable to update your profile."
    );
  } finally {
    setSaving(false);
  }
};


  // =======================================================
  // SCREEN
  // =======================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        {/* CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* PROFILE PHOTO */}

          <View style={styles.photoSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={62} color={colors.white} />
            </View>

            <TouchableOpacity
              style={styles.cameraButton}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  "Profile Photo",
                  "Connect an image picker to upload your profile photo."
                )
              }
            >
              <Ionicons name="camera" size={18} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.changePhotoText}>
              Change Profile Photo
            </Text>
          </View>

          {/* PERSONAL INFORMATION */}

          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          {/* FULL NAME */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!saving}
                returnKeyType="next"
                maxLength={100}
              />
            </View>
          </View>

          {/* MOBILE NUMBER */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <TextInput
                value={mobile}
                onChangeText={setMobile}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>

            <Text style={styles.helperText}>
              Mobile number updates are not supported by this API yet.
            </Text>
          </View>

          {/* EMAIL */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
            </View>
          </View>

          {/* LOCATION */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your location"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
                editable={!saving}
              />
            </View>

            <Text style={styles.helperText}>
              Location updates are not supported by this API yet.
            </Text>
          </View>

          {/* ACCOUNT INFORMATION */}

          <Text style={styles.sectionTitle}>
            Account Information
          </Text>

          <View style={styles.infoCard}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Account Verification
              </Text>

              <Text style={styles.infoText}>
                Your mobile number verification status is managed by your
                account.
              </Text>
            </View>

            <Ionicons
              name="shield-checkmark"
              size={22}
              color={colors.success}
            />
          </View>

          {/* SAVE BUTTON */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={colors.white}
                />
                <Text style={styles.saveText}>Saving...</Text>
              </>
            ) : (
              <>
                <Text style={styles.saveText}>Save Changes</Text>
                <Ionicons
                  name="arrow-forward"
                  size={23}
                  color={colors.white}
                />
              </>
            )}
          </TouchableOpacity>

          {/* CANCEL */}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    keyboardView: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingHorizontal: 18,
      paddingBottom: 30,
    },

    header: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    },

    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    headerPlaceholder: {
      width: 42,
      height: 42,
    },

    headerTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xxl,
      letterSpacing: 0.2,
      textAlign: "center",
    },

    photoSection: {
      alignItems: "center",
      marginTop: 24,
      marginBottom: 28,
    },

    avatar: {
      width: 108,
      height: 108,
      borderRadius: 54,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: colors.primaryDark,
    },

    cameraButton: {
      position: "absolute",
      right: "34%",
      bottom: 29,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.background,
    },

    changePhotoText: {
      color: colors.primary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
      marginTop: 12,
    },

    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.lg,
      marginBottom: 14,
      marginTop: 4,
    },

    inputGroup: {
      marginBottom: 17,
    },

    label: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
      marginBottom: 8,
      marginLeft: 2,
    },

    inputContainer: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
    },

    inputIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 11,
    },

    input: {
      flex: 1,
      minHeight: 45,
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
      paddingHorizontal: 2,
      paddingVertical: 8,
    },

    helperText: {
      color: colors.textMuted,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.base,
      marginTop: 6,
      marginLeft: 2,
    },

    infoCard: {
      minHeight: 72,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 13,
      paddingVertical: 12,
      marginBottom: 25,
    },

    infoIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
      marginBottom: 3,
    },

    infoText: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.base,
    },

    saveButton: {
      minHeight: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 5,
      paddingHorizontal: 16,
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveText: {
      color: colors.white,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xxl,
      marginHorizontal: 10,
    },

    cancelButton: {
      height: 52,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundElement,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
    },

    cancelText: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
    },

    bottomSpace: {
      height: 25,
    },
  });
