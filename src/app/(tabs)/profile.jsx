import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

/* =========================================================
   PROFILE SCREEN
========================================================= */

export default function ProfileScreen() {
  /* =======================================================
     MENU ITEMS
  ======================================================= */

  const menuItems = [
    {
      title: "My Orders",
      subtitle: "View your order history",
      icon: "bag-handle",
      color: "#f82408",
      background: "#0c0909",
      route: "/MyOrdersScreen",
    },
    {
      title: "Addresses",
      subtitle: "Manage your delivery addresses",
      icon: "location",
      color: "#f82408",
      background: "#0c0909",
      route: "/addresses",
    },
    {
      title: "Payment Methods",
      subtitle: "Manage cards, UPI & wallets",
      icon: "card",
      color: "#f82408",
      background: "#0c0909",
      route: "/payments",
    },
    {
      title: "Favourite Restaurants",
      subtitle: "Your saved restaurants",
      icon: "heart",
      color: "#f82408",
      background: "#0c0909",
      route: "/Offers&DealsScreen",
    },
    {
      title: "Offers & Rewards",
      subtitle: "Exclusive offers and rewards",
      icon: "gift",
      color: "#f82408",
      background: "#0c0909",
      route: "/notifications",
    },
    {
      title: "Help & Support",
      subtitle: "Get help, FAQs and support",
      icon: "headset",
      color: "#f82408",
      background: "#0c0909",
      route: "/help&support",
    },
    {
      title: "Settings",
      subtitle: "App preferences and notifications",
      icon: "cog",
      color: "#f82408",
      background: "#0c0909",
      route: "/settings",
    },

    {
      title: "Blogs",
      subtitle: " Discover food stories, tips and trends",
      icon: "newspaper-outline",
      color: "#f82408",
      background: "#0c0909",
      route: "/Blogs",
    },

    {
      title: "Cancellation-refund",
      icon: "receipt-outline",
      color: "#f82408",
      background: "#0c0909",
      route: "/cancellation-refund",
    },
  ];

  /* =======================================================
     LOGOUT
  ======================================================= */

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

  /* =======================================================
     MENU NAVIGATION
  ======================================================= */

  const handleMenuPress = (route) => {
    router.push(route);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          {/* BACK */}

          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.headerTitle}>
            My Profile
          </Text>

          {/* SETTINGS */}

          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.8}
            onPress={() => router.push("/settings")}
          >
            <Ionicons
              name="settings-outline"
              size={23}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <View style={styles.profileCard}>

          {/* PROFILE TOP */}

          <View style={styles.profileTop}>

            {/* AVATAR */}

            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={48}
                  color={Colors.white}
                />
              </View>
            </View>

            {/* INFORMATION */}

            <View style={styles.profileInformation}>

              <Text style={styles.profileName}>
                Raju Kumar
              </Text>

              {/* PHONE */}

              <View style={styles.infoRow}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={Colors.textSecondary}
                />

                <Text style={styles.infoText}>
                  +91 98765 43210
                </Text>
              </View>

              {/* EMAIL */}

              <View style={styles.infoRow}>
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={Colors.textSecondary}
                />

                <Text style={styles.infoText}>
                  raju.kumar@email.com
                </Text>
              </View>
            </View>

            {/* EDIT PROFILE */}

            <TouchableOpacity
              style={styles.profileArrow}
              activeOpacity={0.7}
              onPress={() => router.push("/editprofile")}
            >
              <Ionicons
                name="chevron-forward"
                size={27}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* =================================================
              MEMBER INFORMATION
          ================================================= */}

          <View style={styles.memberRow}>

            {/* BAKASURAN */}

            <View style={styles.bakasuranBadge}>
              <Ionicons
                name="trophy"
                size={16}
                color={Colors.white}
              />

              <Text style={styles.bakasuranText}>
                BAKASURAN
              </Text>
            </View>

            {/* GOLD MEMBER */}

            <View style={styles.goldBadge}>
              <Ionicons
                name="star"
                size={16}
                color={Colors.warning}
              />

              <Text style={styles.goldText}>
                Gold Member
              </Text>
            </View>

            {/* POINTS */}

            <Text style={styles.pointsText}>
              500 Points
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textMuted}
            />
          </View>
        </View>

        {/* =================================================
            MENU
        ================================================= */}

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

              {/* ICON */}

              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: item.background,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.color}
                />
              </View>

              {/* TEXT */}

              <View style={styles.menuTextContainer}>

                <Text style={styles.menuTitle}>
                  {item.title}
                </Text>

                <Text style={styles.menuSubtitle}>
                  {item.subtitle}
                </Text>

              </View>

              {/* ARROW */}

              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPressIn={() => router.push("/(auth)/Loginscreen")}
        >


          <Ionicons
            name="log-out-outline"
            size={26}
            color={Colors.primary}
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
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

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },

  /* =======================================================
     HEADER
  ======================================================= */

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

    backgroundColor: Colors.surface,

    borderWidth: 1,

    borderColor: Colors.border,

    alignItems: "center",

    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,

    textAlign: "center",

    color: Colors.textPrimary,

    fontFamily: Fonts.bold,

    fontSize: Fonts.size.xxl,

    letterSpacing: -0.3,
  },

  /* =======================================================
     PROFILE CARD
  ======================================================= */

  profileCard: {
    backgroundColor: Colors.card,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: Colors.border,

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

  /* =======================================================
     AVATAR
  ======================================================= */

  avatarOuter: {
    width: 88,
    height: 88,

    borderRadius: 44,

    backgroundColor: Colors.primary,

    padding: 2,
  },

  avatar: {
    flex: 1,

    borderRadius: 42,

    backgroundColor: Colors.surface,

    justifyContent: "center",

    alignItems: "center",

    overflow: "hidden",
  },

  /* =======================================================
     PROFILE INFORMATION
  ======================================================= */

  profileInformation: {
    flex: 1,

    marginLeft: 15,
  },

  profileName: {
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,

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
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.base,

    marginLeft: 8,
  },

  profileArrow: {
    width: 32,

    alignSelf: "center",

    alignItems: "flex-end",

    justifyContent: "center",
  },

  /* =======================================================
     MEMBER ROW
  ======================================================= */

  memberRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 12,
  },

  /* =======================================================
     BAKASURAN BADGE
  ======================================================= */

  bakasuranBadge: {
    height: 37,

    paddingHorizontal: 12,

    borderRadius: 20,

    backgroundColor: Colors.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  bakasuranText: {
    color: Colors.white,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.md,

    marginLeft: 6,

    letterSpacing: 0.1,
  },

  /* =======================================================
     GOLD BADGE
  ======================================================= */

  goldBadge: {
    height: 37,

    paddingHorizontal: 11,

    borderRadius: 20,

    backgroundColor: "#0e0804",

    borderWidth: 1,

    borderColor: "#4A351D",

    flexDirection: "row",

    alignItems: "center",

    marginLeft: 8,
  },

  goldText: {
    color: Colors.warning,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.md,

    marginLeft: 5,
  },

  /* =======================================================
     POINTS
  ======================================================= */

  pointsText: {
    flex: 1,

    textAlign: "right",

    color: Colors.primary,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.base,

    marginRight: 9,
  },

  /* =======================================================
     MENU CONTAINER
  ======================================================= */

  menuContainer: {
    backgroundColor: Colors.backgroundSecondary,

    borderRadius: 19,

    borderWidth: 1,

    borderColor: Colors.border,

    overflow: "hidden",

    marginBottom: 16,
  },

  /* =======================================================
     MENU ITEM
  ======================================================= */

  menuItem: {
    minHeight: 83,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

    borderBottomWidth: 1,

    borderBottomColor: Colors.divider,
  },

  lastMenuItem: {
    borderBottomWidth: 0,
  },

  /* =======================================================
     ICON
  ======================================================= */

  iconContainer: {
    width: 54,
    height: 54,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 14,
  },

  /* =======================================================
     MENU TEXT
  ======================================================= */

  menuTextContainer: {
    flex: 1,

    justifyContent: "center",
  },

  menuTitle: {
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.xl,

    letterSpacing: -0.2,

    marginBottom: 4,
  },

  menuSubtitle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.base,
  },

  /* =======================================================
     LOGOUT
  ======================================================= */

  logoutButton: {
    height: 64,

    borderRadius: 33,

    borderWidth: 2,

    borderColor: Colors.primary,

    backgroundColor: "#210B0E",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  logoutText: {
    color: Colors.primary,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.lg,

    marginLeft: 10,
  },

  /* =======================================================
     BOTTOM SPACE
  ======================================================= */

  bottomSpace: {
    height: 20,
  },
});