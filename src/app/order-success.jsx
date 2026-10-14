import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../hooks/use-theme";
import Fonts from "../constants/Fonts";

const OrderSuccessScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const params = useLocalSearchParams();

  const orderId = params.orderId || "BAKA10245";
  const itemName = params.itemName || "Chicken Biryani";
  const restaurant = params.restaurant || "Spice House";
  const items = params.items || "2 items";
  const price = params.price || "₹420";
  const date = params.date || "25 Oct 2026";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================
            SUCCESS ILLUSTRATION
        ===================================== */}

        <View style={styles.heroSection}>
          {/* Glow */}

          <View style={styles.glow} />

          {/* Food Bag */}

          <View style={styles.foodBagContainer}>
            <View style={styles.foodBag}>
              <View style={styles.foodBagTop}>
                <Ionicons name="restaurant" size={38} color="#FFFFFF" />
              </View>

              <View style={styles.foodBagLogo}>
                <Ionicons name="restaurant-outline" size={30} color="#FFFFFF" />
              </View>
            </View>

            {/* Burger */}

            <View style={styles.burgerContainer}>
              <View style={styles.burgerTop}></View>

              <View style={styles.lettuce} />

              <View style={styles.cheese} />

              <View style={styles.patty} />

              <View style={styles.burgerBottom} />
            </View>

            {/* Fries */}

            <View style={styles.friesContainer}>
              <View style={styles.friesBox} />

              <View style={styles.fries}>
                <View style={styles.friesOne} />
                <View style={styles.friesTwo} />
                <View style={styles.friesThree} />
                <View style={styles.friesFour} />
                <View style={styles.friesFive} />
              </View>
            </View>
          </View>

          {/* Success Check */}

          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={38} color={Colors.white} />
          </View>

          {/* Decorative Confetti */}

          <View style={[styles.confetti, styles.confettiOne]} />
          <View style={[styles.confetti, styles.confettiTwo]} />
          <View style={[styles.confetti, styles.confettiThree]} />
          <View style={[styles.confetti, styles.confettiFour]} />
          <View style={[styles.confetti, styles.confettiFive]} />
        </View>

        {/* =====================================
            SUCCESS TEXT
        ===================================== */}

        <View style={styles.successTextContainer}>
          <Text style={styles.successTitle}>Order Successful!</Text>

          <Text style={styles.successSubtitle}>
            Your delicious food is on the way ❤️
          </Text>
        </View>

        {/* =====================================
            ORDER ID
        ===================================== */}

        <View style={styles.orderIdContainer}>
          <View>
            <Text style={styles.orderIdLabel}>ORDER ID</Text>

            <Text style={styles.orderId}>#{orderId}</Text>
          </View>

          <View style={styles.confirmedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={Colors.success}
            />

            <Text style={styles.confirmedText}>Confirmed</Text>
          </View>
        </View>

        {/* =====================================
            ORDER CARD
        ===================================== */}

        <TouchableOpacity style={styles.orderCard} activeOpacity={0.9}>
          {/* FOOD IMAGE */}

          <Image
            source={require("../../assets/images/chicken_biryani.jpg")}
            style={styles.foodImage}
            resizeMode="cover"
          />

          {/* ORDER DETAILS */}

          <View style={styles.orderDetails}>
            <Text style={styles.itemName} numberOfLines={1}>
              {itemName}
            </Text>

            <Text style={styles.restaurantName} numberOfLines={1}>
              {restaurant}
            </Text>

            <Text style={styles.orderMeta}>
              {items}
              {"  •  "}
              {price}
              {"  •  "}
              {date}
            </Text>
          </View>

          {/* ARROW */}

          <View style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={21} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* =====================================
            DELIVERY MESSAGE
        ===================================== */}

        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <Ionicons name="bicycle" size={23} color={Colors.primary} />
          </View>

          <View style={styles.deliveryContent}>
            <Text style={styles.deliveryTitle}>
              Your order is being prepared
            </Text>

            <Text style={styles.deliveryText}>
              We'll notify you when your food is out for delivery.
            </Text>
          </View>
        </View>

        {/* =====================================
            TRACK ORDER
        ===================================== */}

        <TouchableOpacity
          style={styles.trackButton}
          activeOpacity={0.85}
          onPress={() => {
            router.push("/Track-OrderScreen");
          }}
        >
          <Text style={styles.trackButtonText}>Track Order</Text>

          <Ionicons name="arrow-forward" size={21} color={Colors.white} />
        </TouchableOpacity>

        {/* =====================================
            CONTINUE ORDERING
        ===================================== */}

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() => {
            router.replace("/MyOrdersScreen");
          }}
        >
          <Ionicons name="restaurant-outline" size={21} color={Colors.white} />

          <Text style={styles.continueButtonText}>View My Orders</Text>
        </TouchableOpacity>

        {/* =====================================
            FOOTER
        ===================================== */}

        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={Colors.textMuted}
          />

          <Text style={styles.footerText}>
            Safe & secure ordering with BAKASURAN
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderSuccessScreen;

const createStyles = (Colors) => StyleSheet.create({
  /* =====================================
     CONTAINER
  ===================================== */

  container: {
    flex: 1,

    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 18,

    paddingTop: 18,

    paddingBottom: 35,
  },

  /* =====================================
     HERO
  ===================================== */

  heroSection: {
    height: 320,

    position: "relative",

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    borderRadius: 30,

    backgroundColor: Colors.backgroundElement,
  },

  glow: {
    position: "absolute",

    width: 260,
    height: 260,

    borderRadius: 130,

    backgroundColor: "rgba(255,32,40,0.10)",
  },

  /* =====================================
     FOOD BAG
  ===================================== */

  foodBagContainer: {
    width: 240,
    height: 215,

    position: "relative",

    alignItems: "center",

    marginTop: 15,
  },

  foodBag: {
    position: "absolute",

    bottom: 12,

    width: 175,
    height: 150,

    borderRadius: 8,

    backgroundColor: Colors.primary,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.35,

    shadowRadius: 20,

    elevation: 10,
  },

  foodBagTop: {
    position: "absolute",

    top: -8,

    width: 175,
    height: 20,

    borderRadius: 10,

    backgroundColor: Colors.primaryDark,
  },

  foodBagLogo: {
    width: 72,
    height: 72,

    borderRadius: 36,

    borderWidth: 3,

    borderColor: "rgba(255,255,255,0.8)",

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================
     BURGER
  ===================================== */

  burgerContainer: {
    position: "absolute",

    top: -8,
    left: 32,

    width: 105,
    height: 80,

    alignItems: "center",

    zIndex: 5,
  },

  burgerTop: {
    width: 95,
    height: 32,

    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,

    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,

    backgroundColor: "#D98A25",

    position: "relative",
  },

  sesame: {
    position: "absolute",

    width: 4,
    height: 2,

    borderRadius: 2,

    backgroundColor: "#FFE9A8",
  },

  sesameOne: {
    left: 20,
    top: 10,
  },

  sesameTwo: {
    left: 44,
    top: 7,
  },

  sesameThree: {
    right: 22,
    top: 12,
  },

  sesameFour: {
    right: 40,
    top: 19,
  },

  lettuce: {
    width: 100,
    height: 7,

    backgroundColor: "#53A83A",

    borderRadius: 4,
  },

  cheese: {
    width: 94,
    height: 8,

    backgroundColor: "#FFC928",

    borderRadius: 2,
  },

  patty: {
    width: 94,
    height: 13,

    backgroundColor: "#542717",

    borderRadius: 6,
  },

  burgerBottom: {
    width: 94,
    height: 13,

    backgroundColor: "#C87821",

    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  /* =====================================
     FRIES
  ===================================== */

  friesContainer: {
    position: "absolute",

    top: -18,
    right: 27,

    width: 65,
    height: 85,

    alignItems: "center",

    zIndex: 5,
  },

  friesBox: {
    position: "absolute",

    bottom: 0,

    width: 58,
    height: 48,

    backgroundColor: "#E7271E",

    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  fries: {
    width: 55,
    height: 45,

    position: "absolute",

    top: 0,

    flexDirection: "row",

    justifyContent: "space-around",

    alignItems: "flex-end",
  },

  friesOne: {
    width: 8,
    height: 45,

    backgroundColor: "#FFC62A",

    borderRadius: 4,

    transform: [{ rotate: "-8deg" }],
  },

  friesTwo: {
    width: 8,
    height: 55,

    backgroundColor: "#FFD33D",

    borderRadius: 4,

    transform: [{ rotate: "-2deg" }],
  },

  friesThree: {
    width: 8,
    height: 50,

    backgroundColor: "#F5B91F",

    borderRadius: 4,
  },

  friesFour: {
    width: 8,
    height: 58,

    backgroundColor: "#FFD33D",

    borderRadius: 4,

    transform: [{ rotate: "5deg" }],
  },

  friesFive: {
    width: 8,
    height: 45,

    backgroundColor: "#F5B91F",

    borderRadius: 4,

    transform: [{ rotate: "10deg" }],
  },

  /* =====================================
     SUCCESS CHECK
  ===================================== */

  successCircle: {
    position: "absolute",

    right: 54,
    bottom: 40,

    width: 72,
    height: 72,

    borderRadius: 36,

    backgroundColor: Colors.success,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 4,

    borderColor: Colors.background,

    shadowColor: Colors.success,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.35,

    shadowRadius: 12,

    elevation: 10,
  },

  /* =====================================
     CONFETTI
  ===================================== */

  confetti: {
    position: "absolute",

    width: 8,
    height: 18,

    borderRadius: 4,

    transform: [{ rotate: "30deg" }],
  },

  confettiOne: {
    left: 28,
    top: 80,

    backgroundColor: "#FFB800",
  },

  confettiTwo: {
    right: 35,
    top: 65,

    backgroundColor: Colors.primary,
  },

  confettiThree: {
    left: 52,
    bottom: 60,

    backgroundColor: "#22C55E",

    transform: [{ rotate: "-30deg" }],
  },

  confettiFour: {
    right: 28,
    bottom: 95,

    backgroundColor: "#FFB800",

    transform: [{ rotate: "60deg" }],
  },

  confettiFive: {
    left: 78,
    top: 35,

    backgroundColor: "#FF4D53",

    transform: [{ rotate: "80deg" }],
  },

  heart: {
    position: "absolute",

    color: Colors.primary,

    fontSize: 20,
  },

  heartOne: {
    right: 70,
    top: 60,
  },

  heartTwo: {
    left: 42,
    bottom: 105,

    fontSize: 15,
  },

  /* =====================================
     SUCCESS TEXT
  ===================================== */

  successTextContainer: {
    alignItems: "center",

    paddingTop: 24,

    paddingBottom: 18,
  },

  successTitle: {
    color: Colors.textPrimary,

    fontFamily: Fonts.extraBold,

    fontSize: 30,

    textAlign: "center",
  },

  successSubtitle: {
    marginTop: 8,

    color: Colors.textSecondary,

    fontFamily: Fonts.medium,

    fontSize: Fonts.size.base,

    textAlign: "center",
  },

  /* =====================================
     ORDER ID
  ===================================== */

  orderIdContainer: {
    padding: 15,

    marginBottom: 12,

    borderRadius: 16,

    backgroundColor: Colors.surface,

    borderWidth: 1,

    borderColor: Colors.border,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  orderIdLabel: {
    color: Colors.textMuted,

    fontFamily: Fonts.medium,

    fontSize: Fonts.size.xs,

    letterSpacing: 1,
  },

  orderId: {
    marginTop: 3,

    color: Colors.textPrimary,

    fontFamily: Fonts.bold,

    fontSize: Fonts.size.base,
  },

  confirmedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 20,

    backgroundColor: "rgba(34,197,94,0.10)",

    flexDirection: "row",

    alignItems: "center",
  },

  confirmedText: {
    marginLeft: 5,

    color: Colors.success,

    fontFamily: Fonts.semiBold,

    fontSize: Fonts.size.xs,
  },

  /* =====================================
     ORDER CARD
  ===================================== */

  orderCard: {
    minHeight: 105,

    padding: 10,

    borderRadius: 20,

    backgroundColor: Colors.surface,

    borderWidth: 1,

    borderColor: Colors.border,

    flexDirection: "row",

    alignItems: "center",
  },

  foodImage: {
    width: 84,
    height: 84,

    borderRadius: 14,

    backgroundColor: Colors.card,
  },

  orderDetails: {
    flex: 1,

    marginLeft: 12,

    minWidth: 0,
  },

  itemName: {
    color: Colors.textPrimary,

    fontFamily: Fonts.bold,

    fontSize: Fonts.size.base,
  },

  restaurantName: {
    marginTop: 4,

    color: Colors.goldDark,

    fontFamily: Fonts.medium,

    fontSize: Fonts.size.base,
  },

  orderMeta: {
    marginTop: 8,

    color: Colors.textMuted,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.xs,
  },

  arrowButton: {
    width: 35,
    height: 35,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.card,
  },

  /* =====================================
     DELIVERY CARD
  ===================================== */

  deliveryCard: {
    marginTop: 12,

    padding: 14,

    borderRadius: 18,

    backgroundColor: "rgba(255,32,40,0.06)",

    borderWidth: 1,

    borderColor: "rgba(255,32,40,0.15)",

    flexDirection: "row",

    alignItems: "center",
  },

  deliveryIcon: {
    width: 46,
    height: 46,

    borderRadius: 23,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,32,40,0.12)",
  },

  deliveryContent: {
    flex: 1,

    marginLeft: 12,
  },

  deliveryTitle: {
    color: Colors.textPrimary,

    fontFamily: Fonts.semiBold,

    fontSize: Fonts.size.xs,
  },

  deliveryText: {
    marginTop: 4,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.md,

    lineHeight: 17,
  },

  /* =====================================
     TRACK BUTTON
  ===================================== */

  trackButton: {
    height: 55,

    marginTop: 18,

    borderRadius: 28,

    paddingHorizontal: 22,

    backgroundColor: Colors.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.28,

    shadowRadius: 12,

    elevation: 6,
  },

  trackButtonText: {
    color: Colors.white,

    fontFamily: Fonts.bold,

    fontSize: Fonts.size.base,

    marginRight: 10,
  },

  /* =====================================
     CONTINUE BUTTON
  ===================================== */

  continueButton: {
    height: 55,

    marginTop: 10,

    borderRadius: 28,

    paddingHorizontal: 22,

    backgroundColor: Colors.surface,

    borderWidth: 1,

    borderColor: Colors.border,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  continueButtonText: {
    marginLeft: 9,

    color: Colors.white,

    fontFamily: Fonts.semiBold,

    fontSize: Fonts.size.base,
  },

  /* =====================================
     FOOTER
  ===================================== */

  footer: {
    marginTop: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  footerText: {
    marginLeft: 6,

    color: Colors.textMuted,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.xs,
  },
});
