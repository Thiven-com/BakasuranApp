import { useMemo, useState } from "react";

import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const { width } = Dimensions.get("window");

/* =========================================================
   RESPONSIVE SIZE
========================================================= */

const scale = (value) => {
  return (width / 390) * value;
};

/* =========================================================
   NOTIFICATION DATA
========================================================= */

const notifications = [
  {
    id: "1",
    category: "Orders",
    title: "Your order is on the way!",
    description:
      "Rohan is on his way with your\nChicken Biryani from Spice House.",
    time: "5 min ago",
    unread: true,
    image: require("../../assets/images/onboardingimage1.png"),
    type: "image",
  },

  {
    id: "2",
    category: "Orders",
    title: "Order Confirmed",
    description:
      "Your order #BAKA10245 from\nSpice House has been confirmed.",
    time: "15 min ago",
    unread: true,
    type: "icon",
    icon: "bag-handle",
    iconColor: Colors.primary,
    badgeIcon: "checkmark",
    badgeColor: Colors.success,
  },

  {
    id: "3",
    category: "Offers",
    title: "Special Offer Just for You! 🎉",
    description:
      "Get 40% OFF on all burgers\nthis weekend. Use code:",
    coupon: " BURGER40",
    time: "2 hours ago",
    unread: false,
    image: require("../../assets/images/onboardingimage1.png"),
    type: "image",
  },

  {
    id: "4",
    category: "Orders",
    title: "Your order is being prepared",
    description:
      "Spice House is preparing your\nMargherita Pizza.",
    time: "3 hours ago",
    unread: false,
    image: require("../../assets/images/onboardingimage1.png"),
    type: "image",
    badgeIcon: "flame",
    badgeColor: Colors.primary,
  },

  {
    id: "5",
    category: "Offers",
    title: "Flat ₹100 OFF",
    description:
      "On orders above ₹399.\nValid till 31st Oct 2024.",
    time: "1 day ago",
    unread: false,
    type: "icon",
    icon: "pricetag",
    iconColor: Colors.primary,
  },

  {
    id: "6",
    category: "System",
    title: "Stay Updated",
    description:
      "Turn on notifications to get real-time\norder updates and exclusive offers.",
    time: "2 days ago",
    unread: false,
    type: "icon",
    icon: "notifications",
    iconColor: Colors.warning,
    badgeIcon: "ellipse",
    badgeColor: Colors.primary,
  },

  {
    id: "7",
    category: "Orders",
    title: "Order Delivered",
    description:
      "Your Hakka Noodles from\nThe Grand Bowl has been delivered.",
    time: "3 days ago",
    unread: false,
    image: require("../../assets/images/onboardingimage1.png"),
    type: "image",
    badgeIcon: "checkmark",
    badgeColor: Colors.success,
  },

  {
    id: "8",
    category: "Offers",
    title: "Welcome to BAKASURAN! ❤️",
    description:
      "Get amazing offers, track orders\nand enjoy delicious food.",
    time: "5 days ago",
    unread: false,
    type: "icon",
    icon: "gift",
    iconColor: Colors.primary,
  },
];

/* =========================================================
   TABS
========================================================= */

const tabs = [
  "All",
  "Orders",
  "Offers",
  "Updates",
  "System",
];

/* =========================================================
   SCREEN
========================================================= */

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("All");
  const [items, setItems] = useState(notifications);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredNotifications = useMemo(() => {
    if (activeTab === "All") {
      return items;
    }

    if (activeTab === "Updates") {
      return items.filter(
        (item) =>
          item.category === "System" ||
          item.category === "Orders"
      );
    }

    return items.filter(
      (item) => item.category === activeTab
    );
  }, [activeTab, items]);

  /* =======================================================
     DELETE ALL
  ======================================================= */

  const handleDeleteAll = () => {
    setItems([]);
  };

  /* =======================================================
     NOTIFICATION PRESS
  ======================================================= */

  const handleNotificationPress = (item) => {
    setItems((previous) =>
      previous.map((notification) =>
        notification.id === item.id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );

    if (item.category === "Orders") {
      router.push("/orders");
    }
  };

  /* =======================================================
     IMAGE / ICON TILE
  ======================================================= */

  const renderNotificationVisual = (item) => {
    return (
      <View style={styles.imageContainer}>
        {item.type === "image" ? (
          <Image
            source={item.image}
            style={styles.notificationImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.iconBackground,
              {
                backgroundColor:
                  item.iconColor === Colors.warning
                    ? "#39270B"
                    : "#321010",
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={scale(48)}
              color={item.iconColor}
            />
          </View>
        )}

        {/* STATUS BADGE */}

        {item.badgeIcon && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.badgeColor || Colors.primary,
              },
            ]}
          >
            <Ionicons
              name={
                item.badgeIcon === "ellipse"
                  ? "notifications"
                  : item.badgeIcon
              }
              size={scale(19)}
              color={Colors.white}
            />
          </View>
        )}
      </View>
    );
  };

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons
            name="notifications-off-outline"
            size={scale(48)}
            color={Colors.textMuted}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Notifications
        </Text>

        <Text style={styles.emptyDescription}>
          You're all caught up!
        </Text>
      </View>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      {/* =================================================
          OUTER SCREEN
      ================================================= */}

      <View style={styles.screenBorder}>
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
              size={scale(39)}
              color={Colors.white}
            />
          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          {/* DELETE */}

          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.8}
            onPress={handleDeleteAll}
          >
            <Ionicons
              name="trash-outline"
              size={scale(31)}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            FILTER TABS
        ================================================= */}

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const active = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  active && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    active && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* =================================================
            NOTIFICATION LIST
        ================================================= */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            filteredNotifications.length === 0 &&
              styles.emptyScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {filteredNotifications.length === 0
            ? renderEmptyState()
            : filteredNotifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() =>
                    handleNotificationPress(item)
                  }
                  style={[
                    styles.notificationCard,
                    item.unread &&
                      styles.unreadNotificationCard,
                  ]}
                >
                  {/* IMAGE / ICON */}

                  {renderNotificationVisual(item)}

                  {/* CONTENT */}

                  <View style={styles.notificationContent}>
                    {/* TOP ROW */}

                    <View style={styles.titleRow}>
                      <Text
                        style={styles.notificationTitle}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>

                      <Text style={styles.timeText}>
                        {item.time}
                      </Text>
                    </View>

                    {/* DESCRIPTION */}

                    <View style={styles.descriptionRow}>
                      <View
                        style={
                          styles.descriptionContainer
                        }
                      >
                        <Text
                          style={styles.descriptionText}
                          numberOfLines={2}
                        >
                          {item.description}

                          {item.coupon && (
                            <Text
                              style={styles.couponText}
                            >
                              {item.coupon}
                            </Text>
                          )}
                        </Text>
                      </View>

                      {/* ARROW */}

                      <Ionicons
                        name="chevron-forward"
                        size={scale(29)}
                        color={Colors.textSecondary}
                        style={styles.arrow}
                      />
                    </View>
                  </View>

                  {/* UNREAD DOT */}

                  {item.unread && (
                    <View style={styles.unreadDot} />
                  )}
                </TouchableOpacity>
              ))}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     SCREEN
  ======================================================= */

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  screenBorder: {
    flex: 1,

    marginHorizontal: scale(1),
    marginVertical: scale(1),

    borderWidth: 1.5,
    borderColor: "#202933",

    borderRadius: scale(38),

    overflow: "hidden",

    backgroundColor: Colors.background,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: scale(100),

    paddingHorizontal: scale(28),

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: scale(58),
    height: scale(58),

    borderRadius: scale(20),

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: "#242C36",

    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: Colors.white,

    fontFamily: Fonts.bold,

    fontSize: scale(28),

    lineHeight: scale(35),

    flex: 1,

    textAlign: "center",

    marginHorizontal: scale(10),
  },

  /* =======================================================
     TABS
  ======================================================= */

  tabsContainer: {
    flexDirection: "row",

    paddingHorizontal: scale(14),

    marginBottom: scale(18),

    gap: scale(8),
  },

  tab: {
    flex: 1,

    height: scale(58),

    borderRadius: scale(30),

    backgroundColor: "#0F141D",

    borderWidth: 1,
    borderColor: "#222A35",

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: scale(5),
  },

  activeTab: {
    backgroundColor: Colors.primary,

    borderColor: Colors.primary,

    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.45,

    shadowRadius: 12,

    elevation: 8,
  },

  tabText: {
    color: "#A4A9BA",

    fontFamily: Fonts.medium,

    fontSize: scale(15),
  },

  activeTabText: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
  },

  /* =======================================================
     SCROLL
  ======================================================= */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(1),
  },

  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  /* =======================================================
     NOTIFICATION CARD
  ======================================================= */

  notificationCard: {
    minHeight: scale(142),

    width: "100%",

    borderRadius: scale(25),

    backgroundColor: "#10151D",

    borderWidth: 1.3,
    borderColor: "#252E39",

    marginBottom: scale(12),

    padding: scale(13),

    flexDirection: "row",

    position: "relative",

    overflow: "hidden",
  },

  unreadNotificationCard: {
    backgroundColor: "#260D12",

    borderColor: "#7E1A22",

    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.32,

    shadowRadius: 10,

    elevation: 5,
  },

  /* =======================================================
     IMAGE
  ======================================================= */

  imageContainer: {
    width: scale(137),
    height: scale(112),

    borderRadius: scale(19),

    overflow: "hidden",

    backgroundColor: "#191D22",

    marginRight: scale(15),

    position: "relative",

    alignSelf: "center",
  },

  notificationImage: {
    width: "100%",
    height: "100%",
  },

  /* =======================================================
     ICON TILE
  ======================================================= */

  iconBackground: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
  },

  /* =======================================================
     STATUS BADGE
  ======================================================= */

  statusBadge: {
    position: "absolute",

    right: scale(6),
    bottom: scale(6),

    width: scale(39),
    height: scale(39),

    borderRadius: scale(20),

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#10151D",
  },

  /* =======================================================
     CONTENT
  ======================================================= */

  notificationContent: {
    flex: 1,

    paddingTop: scale(3),

    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    paddingRight: scale(10),
  },

  notificationTitle: {
    flex: 1,

    color: Colors.white,

    fontFamily: Fonts.bold,

    fontSize: scale(19),

    lineHeight: scale(25),

    marginRight: scale(7),
  },

  timeText: {
    color: "#A5A9B6",

    fontFamily: Fonts.medium,

    fontSize: scale(13),

    lineHeight: scale(20),

    marginTop: scale(2),

    minWidth: scale(65),

    textAlign: "right",
  },

  /* =======================================================
     DESCRIPTION
  ======================================================= */

  descriptionRow: {
    flex: 1,

    flexDirection: "row",

    alignItems: "flex-end",

    marginTop: scale(4),
  },

  descriptionContainer: {
    flex: 1,

    paddingRight: scale(2),
  },

  descriptionText: {
    color: "#AEB2BF",

    fontFamily: Fonts.regular,

    fontSize: scale(15),

    lineHeight: scale(23),
  },

  couponText: {
    color: Colors.primary,

    fontFamily: Fonts.bold,

    fontSize: scale(15),
  },

  /* =======================================================
     ARROW
  ======================================================= */

  arrow: {
    alignSelf: "center",

    marginLeft: scale(4),

    marginRight: scale(-2),
  },

  /* =======================================================
     UNREAD DOT
  ======================================================= */

  unreadDot: {
    position: "absolute",

    right: scale(16),
    top: scale(25),

    width: scale(12),
    height: scale(12),

    borderRadius: scale(6),

    backgroundColor: Colors.primary,

    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.8,

    shadowRadius: 7,

    elevation: 5,
  },

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  emptyContainer: {
    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: scale(30),
  },

  emptyIconCircle: {
    width: scale(90),
    height: scale(90),

    borderRadius: scale(45),

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: scale(18),
  },

  emptyTitle: {
    color: Colors.white,

    fontFamily: Fonts.bold,

    fontSize: scale(22),

    marginBottom: scale(6),
  },

  emptyDescription: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,

    fontSize: scale(15),
  },

  /* =======================================================
     BOTTOM
  ======================================================= */

  bottomSpace: {
    height: scale(25),
  },
});