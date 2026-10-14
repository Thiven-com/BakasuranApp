import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../hooks/use-theme";
import Fonts from "../constants/Fonts";

const BookingSuccessScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const params = useLocalSearchParams();

  const bookingId = params.bookingId || "BAKA284921";
  const restaurant = params.restaurant || "Spice House";
  const date = params.date || "Mon, 12 Oct";
  const time = params.time || "08:00 PM";
  const guests = params.guests || "4";
  const tableNumber = params.tableNumber || "03";
  const tableCapacity = params.tableCapacity || "4";

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `BAKASURAN Table Booking\n\n` +
          `Restaurant: ${restaurant}\n` +
          `Date: ${date}\n` +
          `Time: ${time}\n` +
          `Guests: ${guests}\n` +
          `Table: ${tableNumber}\n` +
          `Booking ID: ${bookingId}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleViewBookings = () => {
    router.replace("/my-bookings");
  };

  const handleBackHome = () => {
    router.replace("/(tabs)/HomeScreen");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP HEADER */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleBackHome}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Booking Confirmed</Text>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={21} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* SUCCESS ICON */}
        <View style={styles.successArea}>
          <View style={styles.outerCircle}>
            <View style={styles.middleCircle}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={52} color={Colors.white} />
              </View>
            </View>
          </View>

          <Text style={styles.successTitle}>Table Booked!</Text>

          <Text style={styles.successSubtitle}>
            Your table has been successfully reserved.
          </Text>

          <View style={styles.bookingIdContainer}>
            <Text style={styles.bookingIdLabel}>BOOKING ID</Text>

            <Text style={styles.bookingId}>{bookingId}</Text>

            <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={17} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* RESTAURANT CARD */}
        <View style={styles.restaurantCard}>
          <View style={styles.restaurantIcon}>
            <Ionicons name="restaurant" size={28} color={Colors.primary} />
          </View>

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantLabel}>RESTAURANT</Text>

            <Text style={styles.restaurantName}>{restaurant}</Text>

            <View style={styles.restaurantLocation}>
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.textMuted}
              />

              <Text style={styles.locationText}>Your reserved table</Text>
            </View>
          </View>

          <View style={styles.confirmedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={Colors.success}
            />

            <Text style={styles.confirmedText}>CONFIRMED</Text>
          </View>
        </View>

        {/* BOOKING DETAILS */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Booking Details</Text>

          <View style={styles.divider} />

          {/* DATE */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>

              <Text style={styles.detailValue}>{date}</Text>
            </View>
          </View>

          {/* TIME */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={21} color={Colors.primary} />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>

              <Text style={styles.detailValue}>{time}</Text>
            </View>
          </View>

          {/* GUESTS */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="people-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Guests</Text>

              <Text style={styles.detailValue}>
                {guests} {Number(guests) === 1 ? "Guest" : "Guests"}
              </Text>
            </View>
          </View>

          {/* TABLE */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="restaurant-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Table</Text>

              <View style={styles.tableValueRow}>
                <Text style={styles.detailValue}>Table {tableNumber}</Text>

                <View style={styles.capacityBadge}>
                  <Ionicons
                    name="people-outline"
                    size={12}
                    color={Colors.textSecondary}
                  />

                  <Text style={styles.capacityText}>{tableCapacity} seats</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ARRIVAL INFORMATION */}
        <View style={styles.arrivalCard}>
          <View style={styles.arrivalIcon}>
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={Colors.info}
            />
          </View>

          <View style={styles.arrivalContent}>
            <Text style={styles.arrivalTitle}>Before you arrive</Text>

            <Text style={styles.arrivalText}>
              Please arrive within 15 minutes of your reservation time. Your
              table will be held for you during this period.
            </Text>
          </View>
        </View>

        {/* SPECIAL REQUEST */}
        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Ionicons name="heart-outline" size={20} color={Colors.primary} />
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Dining tip</Text>

            <Text style={styles.noteText}>
              Let the restaurant staff know about any special requests when you
              arrive.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackHome}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={19} color={Colors.white} />

          <Text style={styles.secondaryButtonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewBookings}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>My Bookings</Text>

          <Ionicons name="arrow-forward" size={19} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookingSuccessScreen;

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 115,
  },

  /* HEADER */

  topHeader: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  shareButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  headerTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  /* SUCCESS */

  successArea: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 25,
  },

  outerCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 32, 40, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 32, 40, 0.12)",
  },

  middleCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 32, 40, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 32, 40, 0.18)",
  },

  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  successTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.heading,
    marginTop: 20,
  },

  successSubtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    textAlign: "center",
    marginTop: 5,
  },

  bookingIdContainer: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  bookingIdLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 9,
    marginRight: 9,
  },

  bookingId: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.sm,
    letterSpacing: 0.5,
    marginRight: 9,
  },

  /* RESTAURANT */

  restaurantCard: {
    minHeight: 105,
    padding: 14,
    borderRadius: 17,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 15,
  },

  restaurantIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 32, 40, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 32, 40, 0.2)",
    marginRight: 13,
  },

  restaurantInfo: {
    flex: 1,
  },

  restaurantLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  restaurantName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  restaurantLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  locationText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginLeft: 4,
  },

  confirmedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  confirmedText: {
    color: Colors.success,
    fontFamily: Fonts.bold,
    fontSize: 8,
    marginLeft: 4,
  },

  /* DETAILS */

  detailsCard: {
    padding: 17,
    borderRadius: 17,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 15,
  },

  detailsTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 15,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  detailRowLast: {
    marginBottom: 0,
  },

  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 32, 40, 0.08)",
    marginRight: 12,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginBottom: 3,
  },

  detailValue: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
  },

  tableValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  capacityBadge: {
    marginLeft: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },

  capacityText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginLeft: 3,
  },

  /* ARRIVAL */

  arrivalCard: {
    padding: 14,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    marginBottom: 12,
  },

  arrivalIcon: {
    marginRight: 10,
  },

  arrivalContent: {
    flex: 1,
  },

  arrivalTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
    marginBottom: 4,
  },

  arrivalText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    lineHeight: 18,
  },

  /* NOTE */

  noteCard: {
    padding: 14,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 32, 40, 0.08)",
    marginRight: 10,
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
    marginBottom: 3,
  },

  noteText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    lineHeight: 17,
  },

  bottomSpace: {
    height: 10,
  },

  /* BOTTOM */

  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  secondaryButton: {
    height: 52,
    width: 90,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },

  secondaryButtonText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
    marginLeft: 5,
  },

  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: Colors.primary,
  },

  primaryButtonText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.sm,
    marginRight: 9,
  },
});
