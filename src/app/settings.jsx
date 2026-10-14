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
  TouchableOpacity,
  View,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

/* =====================================================
   CUSTOM SWITCH
   Consistent red and white colors on Web and Mobile
===================================================== */

function SettingSwitch({ value, onValueChange, styles, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      style={styles.switchTouchArea}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={value ? "On" : "Off"}
    >
      <View
        style={[
          styles.switchTrack,
          {
            backgroundColor: value ? colors.primary : colors.borderLight,
          },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            {
              left: value ? 24 : 3,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const RED = colors.primary;
  const MUTED = colors.textMuted;
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offers, setOffers] = useState(false);
  const [sound, setSound] = useState(true);

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
              "App cache has been cleared successfully.",
            );
          },
        },
      ],
    );
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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
    ]);
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
              "Account deletion request has been submitted.",
            );
          },
        },
      ],
    );
  };

  /* =====================================================
     MENU ROW
  ===================================================== */

  const renderMenuRow = (icon, title, subtitle, onPress, last = false) => (
    <TouchableOpacity
      key={title}
      style={[styles.settingRow, last && styles.lastRow]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={RED} />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={MUTED} />
    </TouchableOpacity>
  );

  /* =====================================================
     TOGGLE ROW
  ===================================================== */

  const renderToggleRow = (
    icon,
    title,
    subtitle,
    value,
    onValueChange,
    last = false,
  ) => (
    <View key={title} style={[styles.settingRow, last && styles.lastRow]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={RED} />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      <SettingSwitch
        value={value}
        onValueChange={onValueChange}
        styles={styles}
        colors={colors}
      />
    </View>
  );

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
          onPress={() => router.back()}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ACCOUNT */}

        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.settingsCard}>
          {renderMenuRow(
            "person-outline",
            "Profile",
            "Manage your personal information",
            () => router.push("/profile"),
          )}

          {renderMenuRow(
            "location-outline",
            "Addresses",
            "Manage your delivery addresses",
            () => router.push("/addresses"),
          )}

          {renderMenuRow(
            "card-outline",
            "Payment Methods",
            "Manage your saved payment methods",
            () => router.push("/payments"),
            true,
          )}
        </View>

        {/* NOTIFICATIONS */}

        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingsCard}>
          {renderToggleRow(
            "notifications-outline",
            "Notifications",
            "Receive app notifications",
            notifications,
            setNotifications,
          )}

          {renderToggleRow(
            "bicycle-outline",
            "Order Updates",
            "Get updates about your orders",
            orderUpdates,
            setOrderUpdates,
          )}

          {renderToggleRow(
            "gift-outline",
            "Offers & Promotions",
            "Receive special offers and discounts",
            offers,
            setOffers,
            true,
          )}
        </View>

        {/* APP PREFERENCES */}

        <Text style={styles.sectionTitle}>App Preferences</Text>

        <View style={styles.settingsCard}>
          {renderToggleRow(
            sound ? "volume-high-outline" : "volume-mute-outline",
            "Sound",
            "Play sounds for app actions",
            sound,
            setSound,
          )}

          {renderToggleRow(
            isDark ? "moon-outline" : "sunny-outline",
            "Dark Mode",
            isDark
              ? "Use the light BAKASURAN theme"
              : "Use the dark BAKASURAN theme",
            isDark,
            toggleTheme,
            true,
          )}
        </View>

        {/* SUPPORT */}

        <Text style={styles.sectionTitle}>Support</Text>

        <View style={styles.settingsCard}>
          {renderMenuRow(
            "help-circle-outline",
            "Help & Support",
            "Get help with your account and orders",
            () => router.push("/help&support"),
          )}

          {renderMenuRow(
            "shield-checkmark-outline",
            "Privacy Policy",
            "Learn how we protect your information",
            () => router.push("/privacypolicy"),
          )}

          {renderMenuRow(
            "document-text-outline",
            "Terms & Conditions",
            "View our terms of service",
            () => router.push("/terms&conditions"),
          )}

          {renderMenuRow(
            "trash-bin-outline",
            "Clear Cache",
            "Free up temporary app storage",
            handleClearCache,
            true,
          )}
        </View>

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={24} color={RED} />

          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* DELETE ACCOUNT */}

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.75}
        >
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </TouchableOpacity>

        {/* APP VERSION */}

        <View style={styles.versionContainer}>
          <Text style={styles.brandText}>BAKASURAN</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>Made with ❤️ for food lovers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },

  /* HEADER */

  header: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 25,
    lineHeight: 23,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },

  headerSpace: {
    width: 40,
  },

  /* SECTION */

  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 25,
    lineHeight: 26,
    marginTop: 20,
    marginBottom: 9,
    includeFontPadding: false,
  },

  /* CARD */

  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  /* ROW */

  settingRow: {
    minHeight: 68,
    paddingHorizontal: 9,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: `${colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
  },

  settingContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    marginRight: 5,
  },

  settingTitle: {
    color: colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 23,
    lineHeight: 28,
    letterSpacing: 0.1,
    includeFontPadding: false,
  },

  settingSubtitle: {
    color: colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 15,
    letterSpacing: 0.05,
    marginTop: 2,
    includeFontPadding: false,
  },

  /* CUSTOM SWITCH */

  switchTouchArea: {
    width: 49,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },

  switchTrack: {
    width: 46,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    position: "relative",
  },

  switchThumb: {
    position: "absolute",
    top: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
  },

  /* LOGOUT */

  logoutButton: {
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  logoutText: {
    color: colors.primary,
    fontFamily: Fonts.regular,
    fontSize: 25,
    lineHeight: 23,
    marginLeft: 8,
    includeFontPadding: false,
  },

  /* DELETE ACCOUNT */

  deleteAccountButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  deleteAccountText: {
    color: colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 19,
    lineHeight: 20,
    includeFontPadding: false,
  },

  /* VERSION */

  versionContainer: {
    alignItems: "center",
    marginTop: 20,
  },

  brandText: {
    color: colors.textSecondary,
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 17,
    letterSpacing: 2,
    includeFontPadding: false,
  },

  versionText: {
    color: colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 16,
    marginTop: 4,
    includeFontPadding: false,
  },

  copyrightText: {
    color: colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 19,
    lineHeight: 18,
    marginTop: 6,
    includeFontPadding: false,
  },
});
