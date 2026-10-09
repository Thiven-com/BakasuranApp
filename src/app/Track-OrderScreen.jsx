import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const TrackOrderScreen = () => {
  const params = useLocalSearchParams();

  const orderId = params.orderId || "BAKA10245";
  const restaurant = params.restaurant || "Spice House";
  const itemName = params.itemName || "Chicken Biryani";
  const price = params.price || "₹420";

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Track Order</Text>

        <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
          <Ionicons name="help-circle-outline" size={23} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ORDER STATUS */}

        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View>
              <Text style={styles.statusLabel}>ORDER ID</Text>

              <Text style={styles.orderId}>#{orderId}</Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <Text style={styles.statusTitle}>Your order is being prepared</Text>

          <Text style={styles.statusSubtitle}>
            Spice House is preparing your food
          </Text>

          {/* PROGRESS */}

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground} />

            <View style={styles.progressActive} />

            <View style={styles.progressSteps}>
              <ProgressStep icon="checkmark" title="Order" active completed />

              <ProgressStep
                icon="restaurant-outline"
                title="Preparing"
                active
              />

              <ProgressStep icon="bicycle-outline" title="On the way" />

              <ProgressStep icon="home-outline" title="Delivered" />
            </View>
          </View>
        </View>

        {/* MAP */}

        <View style={styles.mapCard}>
          {/* MAP BACKGROUND */}

          <View style={styles.mapBackground}>
            {/* ROADS */}

            <View style={[styles.road, styles.roadOne]} />

            <View style={[styles.road, styles.roadTwo]} />

            <View style={[styles.road, styles.roadThree]} />

            <View style={[styles.road, styles.roadFour]} />

            {/* LOCATION GRID */}

            <View style={styles.mapGridOne} />
            <View style={styles.mapGridTwo} />
            <View style={styles.mapGridThree} />

            {/* RESTAURANT */}

            <View style={styles.restaurantMarker}>
              <View style={styles.markerCircle}>
                <Ionicons name="restaurant" size={18} color={Colors.white} />
              </View>

              <View style={styles.markerTriangle} />
            </View>

            {/* DELIVERY */}

            <View style={styles.deliveryMarker}>
              <View style={styles.deliveryCircle}>
                <Ionicons name="bicycle" size={20} color={Colors.white} />
              </View>

              <View style={styles.markerTriangleRed} />
            </View>

            {/* DESTINATION */}

            <View style={styles.destinationMarker}>
              <View style={styles.destinationCircle}>
                <Ionicons name="home" size={17} color={Colors.white} />
              </View>
            </View>

            {/* ROUTE */}

            <View style={styles.routeLineOne} />
            <View style={styles.routeLineTwo} />
            <View style={styles.routeLineThree} />
          </View>

          {/* MAP LABEL */}

          <View style={styles.mapLabel}>
            <Ionicons name="navigate" size={16} color={Colors.primary} />

            <Text style={styles.mapLabelText}>Delivery in 22–28 min</Text>
          </View>

          {/* RECENTER */}

          <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
            <Ionicons name="locate-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* DELIVERY PARTNER */}

        <View style={styles.partnerCard}>
          <View style={styles.partnerAvatar}>
            <Ionicons name="person" size={26} color={Colors.white} />
          </View>

          <View style={styles.partnerDetails}>
            <Text style={styles.partnerLabel}>YOUR DELIVERY PARTNER</Text>

            <Text style={styles.partnerName}>Rahul</Text>

            <View style={styles.partnerRating}>
              <Ionicons name="star" size={13} color={Colors.rating} />

              <Text style={styles.partnerRatingText}>4.8</Text>

              <Text style={styles.partnerDot}>•</Text>

              <Text style={styles.partnerVehicle}>Bike • TS 09 AB 4521</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.callButton} activeOpacity={0.8}>
            <Ionicons name="call" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ORDER DETAILS */}

        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Order Details</Text>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          </View>

          {/* RESTAURANT */}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="restaurant-outline"
                size={18}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Restaurant</Text>

              <Text style={styles.detailValue}>{restaurant}</Text>
            </View>
          </View>

          {/* ITEM */}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="fast-food-outline"
                size={18}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Items</Text>

              <Text style={styles.detailValue} numberOfLines={1}>
                {itemName}
              </Text>
            </View>
          </View>

          {/* PAYMENT */}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="card-outline" size={18} color={Colors.primary} />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Total Paid</Text>

              <Text style={styles.detailValue}>{price}</Text>
            </View>
          </View>
        </View>

        {/* DELIVERY ADDRESS */}

        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={20} color={Colors.primary} />
          </View>

          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>DELIVERING TO</Text>

            <Text style={styles.addressTitle}>Home</Text>

            <Text style={styles.addressText} numberOfLines={2}>
              Hitech City, Hyderabad, Telangana
            </Text>
          </View>
        </View>

        {/* HELP */}

        <TouchableOpacity style={styles.helpCard} activeOpacity={0.85}>
          <View style={styles.helpIcon}>
            <Ionicons name="headset-outline" size={22} color={Colors.white} />
          </View>

          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need help with your order?</Text>

            <Text style={styles.helpText}>Contact BAKASURAN support</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        {/* CANCEL */}

        <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Cancel Order</Text>
        </TouchableOpacity>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={Colors.textMuted}
          />

          <Text style={styles.footerText}>
            Your order is safely tracked by BAKASURAN
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

/* =========================================
   PROGRESS STEP
========================================= */

const ProgressStep = ({ icon, title, active, completed }) => {
  return (
    <View style={styles.progressStep}>
      <View
        style={[
          styles.progressIcon,
          active && styles.progressIconActive,
          completed && styles.progressIconCompleted,
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={active || completed ? Colors.white : Colors.textMuted}
        />
      </View>

      <Text
        style={[styles.progressTitle, active && styles.progressTitleActive]}
      >
        {title}
      </Text>
    </View>
  );
};

export default TrackOrderScreen;

const styles = StyleSheet.create({
  /* =========================================
     MAIN
  ========================================= */

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },

  /* =========================================
     HEADER
  ========================================= */

  header: {
    height: 70,

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.surface,
  },

  headerTitle: {
    flex: 1,

    marginLeft: 12,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
  },

  /* =========================================
     STATUS CARD
  ========================================= */

  statusCard: {
    marginTop: 18,

    padding: 18,

    borderRadius: 22,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  statusTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusLabel: {
    color: Colors.textMuted,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xs,

    letterSpacing: 1,
  },

  orderId: {
    marginTop: 3,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 15,

    backgroundColor: "rgba(34,197,94,0.10)",

    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 7,
    height: 7,

    marginRight: 6,

    borderRadius: 4,

    backgroundColor: Colors.success,
  },

  liveText: {
    color: Colors.success,

    fontFamily: Fonts.bold,
    fontSize: 10,

    letterSpacing: 0.8,
  },

  statusTitle: {
    marginTop: 18,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.lg,
  },

  statusSubtitle: {
    marginTop: 5,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
  },

  /* =========================================
     PROGRESS
  ========================================= */

  progressContainer: {
    marginTop: 24,

    height: 78,

    position: "relative",
  },

  progressBackground: {
    position: "absolute",

    left: 25,
    right: 25,
    top: 16,

    height: 3,

    borderRadius: 2,

    backgroundColor: Colors.border,
  },

  progressActive: {
    position: "absolute",

    left: 25,

    width: "32%",

    top: 16,

    height: 3,

    borderRadius: 2,

    backgroundColor: Colors.primary,
  },

  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressStep: {
    width: 65,

    alignItems: "center",
  },

  progressIcon: {
    width: 34,
    height: 34,

    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.card,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  progressIconActive: {
    backgroundColor: Colors.primary,

    borderColor: Colors.primary,
  },

  progressIconCompleted: {
    backgroundColor: Colors.success,

    borderColor: Colors.success,
  },

  progressTitle: {
    marginTop: 7,

    color: Colors.textMuted,

    fontFamily: Fonts.medium,
    fontSize: 9,

    textAlign: "center",
  },

  progressTitleActive: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
  },

  /* =========================================
     MAP
  ========================================= */

  mapCard: {
    height: 270,

    marginTop: 14,

    borderRadius: 22,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: Colors.border,

    position: "relative",

    backgroundColor: "#151A1A",
  },

  mapBackground: {
    flex: 1,

    backgroundColor: "#141919",

    overflow: "hidden",
  },

  road: {
    position: "absolute",

    backgroundColor: "#272D2D",

    borderRadius: 20,
  },

  roadOne: {
    width: 360,
    height: 18,

    top: 65,
    left: -30,

    transform: [
      {
        rotate: "22deg",
      },
    ],
  },

  roadTwo: {
    width: 400,
    height: 14,

    top: 155,
    left: -45,

    transform: [
      {
        rotate: "-17deg",
      },
    ],
  },

  roadThree: {
    width: 300,
    height: 13,

    top: 215,
    left: 40,

    transform: [
      {
        rotate: "35deg",
      },
    ],
  },

  roadFour: {
    width: 320,
    height: 12,

    top: 115,
    left: 100,

    transform: [
      {
        rotate: "70deg",
      },
    ],
  },

  mapGridOne: {
    position: "absolute",

    width: 120,
    height: 80,

    top: 15,
    left: 20,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.035)",

    transform: [
      {
        rotate: "12deg",
      },
    ],
  },

  mapGridTwo: {
    position: "absolute",

    width: 150,
    height: 90,

    top: 100,
    right: -30,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.035)",

    transform: [
      {
        rotate: "-10deg",
      },
    ],
  },

  mapGridThree: {
    position: "absolute",

    width: 130,
    height: 100,

    bottom: -20,
    left: 70,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.035)",
  },

  /* ROUTE */

  routeLineOne: {
    position: "absolute",

    width: 125,
    height: 4,

    top: 118,
    left: 80,

    backgroundColor: Colors.primary,

    borderRadius: 3,

    transform: [
      {
        rotate: "-18deg",
      },
    ],
  },

  routeLineTwo: {
    position: "absolute",

    width: 80,
    height: 4,

    top: 105,
    left: 185,

    backgroundColor: Colors.primary,

    borderRadius: 3,

    transform: [
      {
        rotate: "40deg",
      },
    ],
  },

  routeLineThree: {
    position: "absolute",

    width: 90,
    height: 4,

    top: 150,
    right: 55,

    backgroundColor: Colors.primary,

    borderRadius: 3,

    transform: [
      {
        rotate: "-35deg",
      },
    ],
  },

  /* RESTAURANT MARKER */

  restaurantMarker: {
    position: "absolute",

    top: 70,
    left: 48,

    alignItems: "center",
  },

  markerCircle: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#202525",

    borderWidth: 2,
    borderColor: Colors.white,

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,

    elevation: 5,
  },

  markerTriangle: {
    width: 0,
    height: 0,

    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,

    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#202525",
  },

  /* DELIVERY MARKER */

  deliveryMarker: {
    position: "absolute",

    top: 110,
    left: 175,

    alignItems: "center",
  },

  deliveryCircle: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.primary,

    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",

    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,

    elevation: 8,
  },

  markerTriangleRed: {
    width: 0,
    height: 0,

    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,

    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.primary,
  },

  /* DESTINATION */

  destinationMarker: {
    position: "absolute",

    right: 42,
    bottom: 48,
  },

  destinationCircle: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.success,

    borderWidth: 2,
    borderColor: Colors.white,
  },

  /* MAP LABEL */

  mapLabel: {
    position: "absolute",

    left: 14,
    top: 14,

    paddingHorizontal: 11,
    paddingVertical: 8,

    borderRadius: 18,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(8,8,8,0.88)",
  },

  mapLabelText: {
    marginLeft: 6,

    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
  },

  locationButton: {
    position: "absolute",

    right: 14,
    bottom: 14,

    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(8,8,8,0.88)",

    borderWidth: 1,
    borderColor: Colors.border,
  },

  /* =========================================
     PARTNER
  ========================================= */

  partnerCard: {
    marginTop: 14,

    padding: 14,

    borderRadius: 20,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,

    flexDirection: "row",
    alignItems: "center",
  },

  partnerAvatar: {
    width: 52,
    height: 52,

    borderRadius: 26,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.card,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  partnerDetails: {
    flex: 1,

    marginLeft: 12,
  },

  partnerLabel: {
    color: Colors.textMuted,

    fontFamily: Fonts.medium,
    fontSize: 9,

    letterSpacing: 0.8,
  },

  partnerName: {
    marginTop: 3,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  partnerRating: {
    marginTop: 4,

    flexDirection: "row",
    alignItems: "center",
  },

  partnerRatingText: {
    marginLeft: 4,

    color: Colors.white,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xs,
  },

  partnerDot: {
    marginHorizontal: 6,

    color: Colors.textMuted,
  },

  partnerVehicle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 10,
  },

  callButton: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.primary,
  },

  /* =========================================
     ORDER DETAILS
  ========================================= */

  detailsCard: {
    marginTop: 14,

    padding: 16,

    borderRadius: 20,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  detailsHeader: {
    marginBottom: 8,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailsTitle: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  viewText: {
    color: Colors.primary,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
  },

  detailRow: {
    paddingVertical: 11,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  detailIcon: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,32,40,0.09)",
  },

  detailContent: {
    flex: 1,

    marginLeft: 11,
  },

  detailLabel: {
    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  detailValue: {
    marginTop: 2,

    color: Colors.white,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.sm,
  },

  /* =========================================
     ADDRESS
  ========================================= */

  addressCard: {
    marginTop: 14,

    padding: 15,

    borderRadius: 20,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,

    flexDirection: "row",
    alignItems: "center",
  },

  addressIcon: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,32,40,0.09)",
  },

  addressContent: {
    flex: 1,

    marginLeft: 12,
  },

  addressLabel: {
    color: Colors.textMuted,

    fontFamily: Fonts.medium,
    fontSize: 9,

    letterSpacing: 0.8,
  },

  addressTitle: {
    marginTop: 3,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.sm,
  },

  addressText: {
    marginTop: 3,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,

    lineHeight: 17,
  },

  /* =========================================
     HELP
  ========================================= */

  helpCard: {
    marginTop: 14,

    padding: 15,

    borderRadius: 20,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,

    flexDirection: "row",
    alignItems: "center",
  },

  helpIcon: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.card,
  },

  helpContent: {
    flex: 1,

    marginLeft: 12,
  },

  helpTitle: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
  },

  helpText: {
    marginTop: 3,

    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  /* =========================================
     CANCEL
  ========================================= */

  cancelButton: {
    marginTop: 20,

    alignItems: "center",
    justifyContent: "center",

    height: 45,
  },

  cancelText: {
    color: Colors.error,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.sm,
  },

  /* =========================================
     FOOTER
  ========================================= */

  footer: {
    marginTop: 8,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    marginLeft: 6,

    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: 9,
  },
});
