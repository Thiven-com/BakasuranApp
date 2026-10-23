import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";
import { getProfile, logout } from "../../utils/Function";

export default function ProfileScreen() {
  const { isDark, toggleTheme, colors } = useTheme();

  const styles = useMemo(
    () => makeStyles(colors, isDark),
    [colors, isDark]
  );

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // =========================================
  // GET PROFILE API
  // =========================================

  const loadProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      setProfileError("");

      const response = await getProfile();

      console.log(
        "PROFILE API RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const profileData =
        response?.data?.data ??
        response?.data?.user ??
        response?.data ??
        response?.user ??
        response;

      if (
        response?.success === 0 ||
        response?.success === false
      ) {
        throw new Error(
          response?.message || "Unable to load profile."
        );
      }

      setProfile(profileData);
    } catch (error) {
      console.log(
        "PROFILE API ERROR:",
        error?.response?.data || error?.message
      );

      setProfileError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load profile."
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // =========================================
  // PROFILE VALUES
  // =========================================

  const profileName =
    profile?.name ||
    profile?.full_name ||
    profile?.fullname ||
    profile?.username ||
    "User";

  const profilePhone =
    profile?.mobile ||
    profile?.phone ||
    profile?.phone_number ||
    profile?.mobile_number ||
    "";

  const profileEmail =
    profile?.email ||
    profile?.email_address ||
    "";

  const profilePoints =
    profile?.points ??
    profile?.reward_points ??
    profile?.wallet_points ??
    profile?.loyalty_points ??
    0;

  const membership =
    profile?.membership ||
    profile?.membership_type ||
    profile?.member_type ||
    profile?.membership_name ||
    "Gold Member";

  // =========================================
  // POST LOGOUT API
  // =========================================

  const handleLogout = useCallback(() => {
    if (loggingOut) return;

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
          onPress: async () => {
            if (loggingOut) return;

            setLoggingOut(true);

            try {
              const result = await logout();

              console.log(
                "LOGOUT API RESULT:",
                JSON.stringify(result, null, 2)
              );

              if (result?.localLogout) {
                router.replace("/Loginscreen");
              } else {
                Alert.alert(
                  "Logout Failed",
                  result?.message ||
                    "Unable to logout. Please try again."
                );
              }
            } catch (error) {
              console.log(
                "LOGOUT API ERROR:",
                error?.response?.data || error?.message
              );

              Alert.alert(
                "Logout Failed",
                error?.response?.data?.message ||
                  error?.message ||
                  "Unable to logout. Please try again."
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [loggingOut]);

  // =========================================
  // PROFILE MENU ITEMS
  // =========================================

  const menuItems = [
    {
      title: "My Orders",
      subtitle: "View your order history",
      icon: "bag-handle",
      color: colors.primary,
      route: "/MyOrdersScreen",
    },
    {
      title: "Addresses",
      subtitle: "Manage your delivery addresses",
      icon: "location",
      color: colors.primary,
      route: "/addresses",
    },
    {
      title: "Payment Methods",
      subtitle: "Manage cards, UPI & wallets",
      icon: "card",
      color: colors.primary,
      route: "/payments",
    },
    {
      title: "Favourite Restaurants",
      subtitle: "Your saved restaurants",
      icon: "heart",
      color: colors.favourite || colors.primary,
      route: "/favourites",
    },
    {
      title: "Offers & Rewards",
      subtitle: "Exclusive offers and rewards",
      icon: "gift",
      color: colors.primary,
      route: "/Offers&DealsScreen",
    },
    {
      title: "Help & Support",
      subtitle: "Get help, FAQs and support",
      icon: "headset",
      color: colors.primary,
      route: "/help&support",
    },
    {
      title: "Settings",
      subtitle: "App preferences and notifications",
      icon: "settings",
      color: colors.primary,
      route: "/settings",
    },
    {
      title: "Blogs",
      subtitle: "Discover food stories, tips and trends",
      icon: "newspaper-outline",
      color: colors.primary,
      route: "/Blogs",
    },
    {
      title: "Cancellation & Refund",
      subtitle: "Cancellation and refund information",
      icon: "receipt-outline",
      color: colors.primary,
      route: "/cancellation-refund",
    },
  ];

  const handleMenuPress = useCallback((route) => {
    router.push(route);
  }, []);

  // =========================================
  // RENDER
  // =========================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Profile</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/settings")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="settings-outline"
              size={23}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={48}
                  color={colors.textPrimary}
                />
              </View>
            </View>

            <View style={styles.profileInformation}>
              {profileLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
                  <Text style={styles.loadingText}>
                    Loading profile...
                  </Text>
                </View>
              ) : (
                <>
                  <Text
                    style={styles.profileName}
                    numberOfLines={1}
                  >
                    {profileName}
                  </Text>

                  {!!profilePhone && (
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={styles.infoText}
                        numberOfLines={1}
                      >
                        {profilePhone}
                      </Text>
                    </View>
                  )}

                  {!!profileEmail && (
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={styles.infoText}
                        numberOfLines={1}
                      >
                        {profileEmail}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.profileArrow}
              activeOpacity={0.7}
              onPress={() => router.push("/editprofile")}
            >
              <Ionicons
                name="chevron-forward"
                size={27}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {!!profileError && (
            <View style={styles.profileErrorContainer}>
              <View style={styles.errorMessageContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.profileErrorText}>
                  {profileError}
                </Text>
              </View>

              <TouchableOpacity
                onPress={loadProfile}
                disabled={profileLoading}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* MEMBERSHIP */}

          <View style={styles.memberRow}>
            <View style={styles.bakasuranBadge}>
              <Ionicons
                name="trophy"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.bakasuranText}>
                BAKASURAN
              </Text>
            </View>

            <View style={styles.goldBadge}>
              <Ionicons
                name="star"
                size={16}
                color={colors.warning}
              />
              <Text
                style={styles.goldText}
                numberOfLines={1}
              >
                {membership}
              </Text>
            </View>

            <Text
              style={styles.pointsText}
              numberOfLines={1}
            >
              {profilePoints} Points
            </Text>
          </View>
        </View>

        {/* MENU */}

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 &&
                  styles.lastMenuItem,
              ]}
              activeOpacity={0.75}
              onPress={() => handleMenuPress(item.route)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isDark
                      ? "#241014"
                      : "#FFF0F1",
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.color}
                />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>
                  {item.title}
                </Text>

                <Text style={styles.menuSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* APPEARANCE */}

        <TouchableOpacity
          style={styles.themeItem}
          activeOpacity={0.8}
          onPress={toggleTheme}
        >
          <View style={styles.themeIconContainer}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.themeTextContainer}>
            <Text style={styles.themeTitle}>Appearance</Text>

            <Text style={styles.themeSubtitle}>
              {isDark
                ? "Dark mode enabled"
                : "Light mode enabled"}
            </Text>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: "#D1D5DB",
              true: colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </TouchableOpacity>

        {/* LOGOUT */}

        <TouchableOpacity
          style={[
            styles.logoutButton,
            loggingOut && styles.logoutButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.logoutText}>
                Logging out...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={26}
                color={colors.primary}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================
// STYLES
// =============================================

const makeStyles = (colors, isDark) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingHorizontal: 14,
      paddingBottom: 24,
    },

    header: {
      height: 82,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 4,
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

    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingTop: 16,
      paddingBottom: 14,
      marginBottom: 16,
    },

    profileTop: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 105,
    },

    avatarOuter: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primary,
      padding: 2,
    },

    avatar: {
      flex: 1,
      borderRadius: 42,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },

    profileInformation: {
      flex: 1,
      marginLeft: 15,
      minWidth: 0,
    },

    profileName: {
      color: colors.textPrimary,
      fontFamily: Fonts.extraBold,
      fontSize: Fonts.size.xxl,
      letterSpacing: -0.4,
      marginBottom: 8,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },

    infoText: {
      flex: 1,
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: Fonts.size.sm,
      marginLeft: 8,
    },

    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    loadingText: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: Fonts.size.sm,
      marginLeft: 8,
    },

    profileArrow: {
      width: 32,
      alignSelf: "center",
      alignItems: "flex-end",
      justifyContent: "center",
    },

    profileErrorContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    errorMessageContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    profileErrorText: {
      flex: 1,
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: Fonts.size.sm,
      marginLeft: 7,
    },

    retryText: {
      color: colors.primary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.sm,
      marginLeft: 10,
    },

    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },

    bakasuranBadge: {
      height: 37,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    bakasuranText: {
      color: "#FFFFFF",
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.xs,
      marginLeft: 6,
      letterSpacing: 0.1,
    },

    goldBadge: {
      height: 37,
      paddingHorizontal: 11,
      borderRadius: 20,
      backgroundColor: isDark ? "#241A11" : "#FFF4E0",
      borderWidth: 1,
      borderColor: isDark ? "#4A351D" : "#F5D9A8",
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
      maxWidth: 115,
    },

    goldText: {
      flexShrink: 1,
      color: colors.warning,
      fontFamily: Fonts.medium,
      fontSize: Fonts.size.xs,
      marginLeft: 5,
    },

    pointsText: {
      flex: 1,
      textAlign: "right",
      color: colors.primary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.xs,
      marginRight: 7,
    },

    menuContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 16,
    },

    menuItem: {
      minHeight: 83,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },

    lastMenuItem: {
      borderBottomWidth: 0,
    },

    iconContainer: {
      width: 54,
      height: 54,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },

    menuTextContainer: {
      flex: 1,
      justifyContent: "center",
    },

    menuTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.base,
      letterSpacing: -0.2,
      marginBottom: 4,
    },

    menuSubtitle: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: Fonts.size.sm,
    },

    themeItem: {
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      marginBottom: 16,
    },

    themeIconContainer: {
      width: 54,
      height: 54,
      borderRadius: 15,
      backgroundColor: isDark ? "#35151B" : "#FFE9EC",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },

    themeTextContainer: {
      flex: 1,
    },

    themeTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.base,
      marginBottom: 4,
    },

    themeSubtitle: {
      color: colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: Fonts.size.sm,
    },

    logoutButton: {
      minHeight: 64,
      borderRadius: 33,
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: isDark ? "#210B0E" : "#FFECEE",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    logoutButtonDisabled: {
      opacity: 0.7,
    },

    logoutText: {
      color: colors.primary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.lg,
      marginLeft: 10,
    },

    bottomSpace: {
      height: 20,
    },
  });