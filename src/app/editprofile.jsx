import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
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

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState("Raju Kumar");
  const [mobile, setMobile] = useState("+91 98765 43210");
  const [email, setEmail] = useState("raju.kumar@email.com");
  const [location, setLocation] = useState("Hyderabad");
  const [saving, setSaving] = useState(false);

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }

    if (!mobile.trim()) {
      Alert.alert("Required", "Please enter your mobile number.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }

    setSaving(true);

    setTimeout(() => {
      setSaving(false);

      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }, 700);
  };

  /* =========================================================
     SCREEN
  ========================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={Colors.white}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Edit Profile
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* ===================================================
              PROFILE PHOTO
          =================================================== */}

          <View style={styles.photoSection}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={62}
                color={Colors.white}
              />
            </View>

            <TouchableOpacity
              style={styles.cameraButton}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  "Profile Photo",
                  "Photo selection can be connected here."
                )
              }
            >
              <Ionicons
                name="camera"
                size={18}
                color={Colors.white}
              />
            </TouchableOpacity>

            <Text style={styles.changePhotoText}>
              Change Profile Photo
            </Text>
          </View>

          {/* ===================================================
              PERSONAL INFORMATION
          =================================================== */}

          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          {/* FULL NAME */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name
            </Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  {
                    backgroundColor:
                      `${Colors.primary}20`,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={25}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* MOBILE */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mobile Number
            </Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  {
                    backgroundColor:
                      `${Colors.primary}20`,
                  },
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={25}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={mobile}
                onChangeText={setMobile}
                placeholder="+91 Mobile Number"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* EMAIL */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  {
                    backgroundColor:
                      `${Colors.primary}20`,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={25}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* LOCATION */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Location
            </Text>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputIcon,
                  {
                    backgroundColor:
                      `${Colors.primary}20`,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={25}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your location"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* ===================================================
              ACCOUNT INFORMATION
          =================================================== */}

          <Text style={styles.sectionTitle}>
            Account Information
          </Text>

          <View style={styles.infoCard}>
            <View
              style={[
                styles.infoIcon,
                {
                  backgroundColor:
                    `${Colors.primary}20`,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Account Verified
              </Text>

              <Text style={styles.infoText}>
                Your mobile number is verified.
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={22}
              color={Colors.success}
            />
          </View>

          {/* ===================================================
              SAVE BUTTON
          =================================================== */}

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
              <Text style={styles.saveText}>
                Saving...
              </Text>
            ) : (
              <>
                <Text style={styles.saveText}>
                  Save Changes
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={23}
                  color={Colors.white}
                />
              </>
            )}
          </TouchableOpacity>

          {/* ===================================================
              CANCEL
          =================================================== */}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     SCREEN
  ======================================================= */

  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: 64,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 18,

    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,

    backgroundColor: Colors.background,
  },

  headerButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,

    justifyContent: "center",
    alignItems: "center",
  },

  headerPlaceholder: {
    width: 42,
    height: 42,
  },

  headerTitle: {
    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,

    letterSpacing: 0.2,

    textAlign: "center",
  },

  /* =======================================================
     PROFILE PHOTO
  ======================================================= */

  photoSection: {
    alignItems: "center",

    marginTop: 24,
    marginBottom: 28,
  },

  avatar: {
    width: 108,
    height: 108,

    borderRadius: 54,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 4,
    borderColor: Colors.primaryDark,
  },

  cameraButton: {
    position: "absolute",

    right: "34%",
    bottom: 29,

    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 3,
    borderColor: Colors.background,
  },

  changePhotoText: {
    color: Colors.primary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,

    marginTop: 12,
  },

  /* =======================================================
     SECTION TITLE
  ======================================================= */

  sectionTitle: {
    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.lg,

    marginBottom: 14,
    marginTop: 4,
  },

  /* =======================================================
     INPUT GROUP
  ======================================================= */

  inputGroup: {
    marginBottom: 17,
  },

  label: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,

    marginBottom: 8,
    marginLeft: 2,
  },

  /* =======================================================
     INPUT
  ======================================================= */

  inputContainer: {
    height: 58,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.surface,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: Colors.border,

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

    height: 35,

    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,

    paddingHorizontal: 2,
  },

  /* =======================================================
     ACCOUNT CARD
  ======================================================= */

  infoCard: {
    minHeight: 72,

    backgroundColor: Colors.card,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: Colors.border,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,

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
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,

    marginBottom: 3,
  },

  infoText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,
  },

  /* =======================================================
     SAVE BUTTON
  ======================================================= */

  saveButton: {
    height: 56,

    borderRadius: 28,

    backgroundColor: Colors.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 5,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,

    marginRight: 10,
  },

  /* =======================================================
     CANCEL
  ======================================================= */

  cancelButton: {
    height: 52,

    borderRadius: 26,

    borderWidth: 1,
    borderColor: Colors.border,

    backgroundColor: Colors.backgroundSecondary,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 12,
  },

  cancelText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,
  },

  /* =======================================================
     BOTTOM
  ======================================================= */

  bottomSpace: {
    height: 25,
  },
});