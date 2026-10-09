import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offers, setOffers] = useState(false);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  /* =====================================================
     CLEAR CACHE
  ===================================================== */

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: () => {
            Alert.alert(
              "Cache Cleared",
              "App cache has been cleared successfully."
            );
          },
        },
      ]
    );
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            router.replace("/(auth)/Loginscreen");
          },
        },
      ]
    );
  };

  /* =====================================================
     DELETE ACCOUNT
  ===================================================== */

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Account Deletion",
              "Account deletion request has been submitted."
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
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
          <Ionicons
            name="chevron-back"
            size={26}
            color={Colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Settings
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =================================================
            ACCOUNT
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.settingsCard}>
          {/* PROFILE */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push("/profile")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Profile
              </Text>

              <Text style={styles.settingSubtitle}>
                Manage your personal information
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* ADDRESSES */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push("/addresses")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Addresses
              </Text>

              <Text style={styles.settingSubtitle}>
                Manage your delivery addresses
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* PAYMENT */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push("/payments")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="card-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Payment Methods
              </Text>

              <Text style={styles.settingSubtitle}>
                Manage your saved payment methods
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Notifications
        </Text>

        <View style={styles.settingsCard}>
          {/* ALL NOTIFICATIONS */}

          <View style={styles.settingRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Notifications
              </Text>

              <Text style={styles.settingSubtitle}>
                Receive app notifications
              </Text>
            </View>

            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{
                false: Colors.border,
                true: Colors.primaryDark,
              }}
              thumbColor={
                notifications
                  ? Colors.primary
                  : Colors.textSecondary
              }
            />
          </View>

          {/* ORDER UPDATES */}

          <View style={styles.settingRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="bicycle-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Order Updates
              </Text>

              <Text style={styles.settingSubtitle}>
                Get updates about your orders
              </Text>
            </View>

            <Switch
              value={orderUpdates}
              onValueChange={setOrderUpdates}
              trackColor={{
                false: Colors.border,
                true: Colors.primaryDark,
              }}
              thumbColor={
                orderUpdates
                  ? Colors.primary
                  : Colors.textSecondary
              }
            />
          </View>

          {/* OFFERS */}

          <View style={styles.settingRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.offer}18`,
                },
              ]}
            >
              <Ionicons
                name="gift-outline"
                size={21}
                color={Colors.offer}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Offers & Promotions
              </Text>

              <Text style={styles.settingSubtitle}>
                Receive special offers and discounts
              </Text>
            </View>

            <Switch
              value={offers}
              onValueChange={setOffers}
              trackColor={{
                false: Colors.border,
                true: Colors.primaryDark,
              }}
              thumbColor={
                offers
                  ? Colors.primary
                  : Colors.textSecondary
              }
            />
          </View>
        </View>

        {/* =================================================
            APP PREFERENCES
        ================================================= */}

        <Text style={styles.sectionTitle}>
          App Preferences
        </Text>

        <View style={styles.settingsCard}>
          {/* SOUND */}

          <View style={styles.settingRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name={
                  sound
                    ? "volume-high-outline"
                    : "volume-mute-outline"
                }
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Sound
              </Text>

              <Text style={styles.settingSubtitle}>
                Play sounds for app actions
              </Text>
            </View>

            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{
                false: Colors.border,
                true: Colors.primaryDark,
              }}
              thumbColor={
                sound
                  ? Colors.primary
                  : Colors.textSecondary
              }
            />
          </View>

          {/* DARK MODE */}

          <View style={styles.settingRow}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="moon-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Dark Mode
              </Text>

              <Text style={styles.settingSubtitle}>
                Use the dark BAKASURAN theme
              </Text>
            </View>

            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{
                false: Colors.border,
                true: Colors.primaryDark,
              }}
              thumbColor={
                darkMode
                  ? Colors.primary
                  : Colors.textSecondary
              }
            />
          </View>
        </View>

        {/* =================================================
            SUPPORT
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Support
        </Text>

        <View style={styles.settingsCard}>
          {/* HELP */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push("/helpsupport")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Help & Support
              </Text>

              <Text style={styles.settingSubtitle}>
                Get help with your account and orders
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* PRIVACY */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() =>
              Alert.alert(
                "Privacy Policy",
                "Your privacy is important to us. Your personal information is handled securely."
              )
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Privacy Policy
              </Text>

              <Text style={styles.settingSubtitle}>
                Learn how we protect your information
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* TERMS */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() =>
              Alert.alert(
                "Terms & Conditions",
                "Please review the terms and conditions for using BAKASURAN."
              )
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Terms & Conditions
              </Text>

              <Text style={styles.settingSubtitle}>
                View our terms of service
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* CLEAR CACHE */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="trash-bin-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Clear Cache
              </Text>

              <Text style={styles.settingSubtitle}>
                Free up temporary app storage
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={Colors.primary}
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* =================================================
            DELETE ACCOUNT
        ================================================= */}

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteAccountText}>
            Delete Account
          </Text>
        </TouchableOpacity>

        {/* =================================================
            VERSION
        ================================================= */}

        <View style={styles.versionContainer}>
          <Text style={styles.brandText}>
            BAKASURAN
          </Text>

          <Text style={styles.versionText}>
            Version 1.0.0
          </Text>

          <Text style={styles.copyrightText}>
            Made with ❤️ for food lovers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 45,
  },

  /* ================= HEADER ================= */

  header: {
    height: 62,

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: Colors.card,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: Colors.border,
  },

  headerTitle: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
  },

  headerSpace: {
    width: 42,
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.lg,

    marginTop: 25,
    marginBottom: 12,
  },

  /* ================= CARD ================= */

  settingsCard: {
    backgroundColor: Colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,

    overflow: "hidden",
  },

  /* ================= ROW ================= */

  settingRow: {
    minHeight: 72,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  iconContainer: {
    width: 43,
    height: 43,

    borderRadius: 13,

    justifyContent: "center",
    alignItems: "center",
  },

  settingContent: {
    flex: 1,

    marginLeft: 12,
    marginRight: 10,
  },

  settingTitle: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xl,
  },

  settingSubtitle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    lineHeight: 16,

    marginTop: 4,
  },

  /* ================= LOGOUT ================= */

  logoutButton: {
    height: 55,

    borderRadius: 28,

    borderWidth: 1.5,
    borderColor: Colors.primary,

    backgroundColor: Colors.backgroundSecondary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 28,
  },

  logoutText: {
    color: Colors.primary,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.xl,

    marginLeft: 8,
  },

  /* ================= DELETE ================= */

  deleteAccountButton: {
    height: 48,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 8,
  },

  deleteAccountText: {
    color: Colors.textMuted,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
  },

  /* ================= VERSION ================= */

  versionContainer: {
    alignItems: "center",

    marginTop: 25,
  },

  brandText: {
    color: Colors.textMuted,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.xs,

    letterSpacing: 3,
  },

  versionText: {
    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,

    marginTop: 5,
  },

  copyrightText: {
    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,

    marginTop: 7,
  },
});