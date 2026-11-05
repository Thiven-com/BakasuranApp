import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BASE_URL from "../constants/AppUrls";
import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import {
  cancelRestaurantTableBooking,
  getRestaurantTableBookings,
} from "../utils/Function";

const getBookingRecords = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  for (const key of [
    "bookings",
    "table_bookings",
    "restaurant_table_bookings",
    "items",
    "results",
    "data",
  ]) {
    const records = getBookingRecords(response[key]);
    if (records.length > 0) return records;
  }

  return [];
};

const getRestaurantLogoUri = (logo) => {
  if (typeof logo !== "string" || !logo.trim()) return null;

  const cleanLogo = logo.trim();
  if (/^https?:\/\//i.test(cleanLogo)) return cleanLogo;

  return `${String(BASE_URL).replace(/\/+$/, "")}/${cleanLogo.replace(/^\/+/, "")}`;
};

const normalizeBooking = (booking, index) => {
  const rawRestaurant =
    booking?.restaurant?.name ??
    booking?.restaurant_name ??
    booking?.restaurant ??
    "Restaurant";
  const rawStatus = String(
    booking?.status ?? booking?.booking_status ?? "upcoming",
  ).toLowerCase();
  const status = rawStatus.includes("cancel")
    ? "cancelled"
    : ["completed", "complete", "past", "visited"].includes(rawStatus)
      ? "completed"
      : "upcoming";

  return {
    id: String(
      booking?.booking_id ??
        booking?.id ??
        booking?.reference_number ??
        index + 1,
    ),
    restaurantId: String(
      booking?.restaurant_id ??
        booking?.restaurantId ??
        booking?.restaurant?.id ??
        booking?.restaurant?.restaurant_id ??
        "",
    ),
    restaurantTableId: String(
      booking?.restaurant_table_id ??
        booking?.table_id ??
        booking?.tableId ??
        booking?.table?.id ??
        booking?.table?.table_id ??
        booking?.restaurant_table?.id ??
        booking?.restaurant_table?.table_id ??
        "",
    ),
    restaurant:
      typeof rawRestaurant === "string"
        ? rawRestaurant
        : (rawRestaurant?.name ?? "Restaurant"),
    restaurantLogo:
      booking?.restaurant?.logo ??
      booking?.restaurant_logo ??
      booking?.logo ??
      null,
    cuisine:
      booking?.cuisine ??
      booking?.cuisine_name ??
      booking?.restaurant?.cuisine ??
      "",
    date: String(
      booking?.booking_date ?? booking?.date ?? booking?.reservation_date ?? "",
    ),
    time: String(
      booking?.booking_time ?? booking?.time ?? booking?.reservation_time ?? "",
    ),
    guests: Number(
      booking?.guest_count ?? booking?.guests ?? booking?.number_of_guests ?? 0,
    ),
    table: String(
      booking?.table?.table_number ??
        booking?.restaurant_table?.table_number ??
        booking?.table_number ??
        booking?.table_no ??
        booking?.table?.id ??
        "-",
    ),
    capacity: Number(
      booking?.table?.capacity ??
        booking?.table_capacity ??
        booking?.capacity ??
        0,
    ),
    status,
    rating: String(booking?.rating ?? ""),
    location:
      booking?.restaurant?.address ??
      booking?.restaurant_address ??
      booking?.location ??
      "",
    specialRequest: booking?.special_request ?? booking?.specialRequest ?? "",
  };
};

const filters = [
  { id: "all", label: "All", icon: "calendar-outline" },
  { id: "upcoming", label: "Upcoming", icon: "time-outline" },
  { id: "completed", label: "Past", icon: "checkmark-circle-outline" },
];

export default function MyBookingsScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelConfirmationId, setCancelConfirmationId] = useState(null);
  const [cancelFeedback, setCancelFeedback] = useState(null);
  const [failedLogoIds, setFailedLogoIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;

    const loadBookings = async () => {
      try {
        const response = await getRestaurantTableBookings();
        if (!active) return;

        if (
          response?.success === 0 ||
          response?.success === false ||
          response?.success === "0" ||
          response?.success === 9
        ) {
          setLoadError(response?.message || "Unable to load your bookings.");
          return;
        }

        setBookings(getBookingRecords(response).map(normalizeBooking));
      } catch (error) {
        if (active) {
          setLoadError(error?.message || "Unable to load your bookings.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      active = false;
    };
  }, []);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;

    return bookings.filter((booking) => booking.status === activeFilter);
  }, [bookings, activeFilter]);

  const upcomingBookings = filteredBookings.filter(
    (booking) => booking.status === "upcoming",
  );

  const pastBookings = filteredBookings.filter(
    (booking) => booking.status === "completed",
  );

  const cancelledBookings = filteredBookings.filter(
    (booking) => booking.status === "cancelled",
  );

  const openBookingDetails = (booking) => {
    Alert.alert(
      booking.restaurant,
      `Booking ID: ${booking.id}\n\n` +
        `Date: ${booking.date}\n` +
        `Time: ${booking.time}\n` +
        `Guests: ${booking.guests}\n` +
        `Table: ${booking.table} (${booking.capacity} seats)\n` +
        `Location: ${booking.location}\n` +
        `Status: ${booking.status.toUpperCase()}` +
        (booking.specialRequest
          ? `\nSpecial request: ${booking.specialRequest}`
          : ""),
      [{ text: "Close" }],
    );
  };

  const handleModify = (booking) => {
    if (booking.status !== "upcoming") {
      Alert.alert(
        "Modification unavailable",
        "Only upcoming bookings can be modified.",
      );
      return;
    }

    Alert.alert(
      "Modify Booking",
      `Would you like to change your reservation at ${booking.restaurant}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            router.push({
              pathname: "/table-booking",
              params: {
                bookingId: booking.id,
                restaurant: booking.restaurant,
                date: booking.date,
                time: booking.time,
                guests: String(booking.guests),
                tableNumber: booking.table,
                specialRequest: booking.specialRequest || "",
              },
            });
          },
        },
      ],
    );
  };

  const handleCancel = (booking) => {
    if (booking.status !== "upcoming") {
      setCancelFeedback({
        bookingId: booking.id,
        message: "This booking is no longer upcoming.",
        success: false,
      });
      return;
    }

    setCancelFeedback(null);
    setCancelConfirmationId(booking.id);
  };

  const confirmCancel = async (booking) => {
    if (cancellingId !== null) return;
    setCancellingId(booking.id);
    setCancelFeedback(null);

    try {
      const response = await cancelRestaurantTableBooking(booking.id);
      const succeeded =
        response?.success === 1 ||
        response?.success === true ||
        response?.success === "1";

      if (!succeeded) {
        setCancelFeedback({
          bookingId: booking.id,
          message: response?.message || "Unable to cancel your booking.",
          success: false,
        });
        return;
      }

      setBookings((currentBookings) =>
        currentBookings.map((item) =>
          item.id === booking.id ? { ...item, status: "cancelled" } : item,
        ),
      );
      setCancelConfirmationId(null);
      setCancelFeedback({
        bookingId: booking.id,
        message:
          response?.message || `Your booking ${booking.id} has been cancelled.`,
        success: true,
      });
    } catch (error) {
      setCancelFeedback({
        bookingId: booking.id,
        message: error?.message || "Unable to cancel your booking.",
        success: false,
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleRebook = (booking) => {
    Alert.alert(
      "Book Again",
      `Would you like to reserve a table at ${booking.restaurant} again?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            router.push({
              pathname: "/table-booking",
              params: {
                restaurant: booking.restaurant,
                guests: String(booking.guests),
              },
            });
          },
        },
      ],
    );
  };

  const handleNewBooking = () => {
    router.push("/table-booking");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    if (status === "upcoming") return colors.success;
    if (status === "completed") return colors.textSecondary;
    return colors.error;
  };

  const renderBookingCard = (booking) => {
    const isUpcoming = booking.status === "upcoming";
    const isConfirmingCancel = cancelConfirmationId === booking.id;
    const restaurantLogoUri = getRestaurantLogoUri(booking.restaurantLogo);
    const showRestaurantLogo =
      restaurantLogoUri && !failedLogoIds.has(booking.id);
    const feedback =
      cancelFeedback?.bookingId === booking.id ? cancelFeedback : null;
    const statusColor = getStatusColor(booking.status);

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.restaurantImage}>
          {showRestaurantLogo ? (
            <Image
              source={{ uri: restaurantLogoUri }}
              style={styles.restaurantLogo}
              resizeMode="contain"
              onError={() =>
                setFailedLogoIds((currentIds) => {
                  const nextIds = new Set(currentIds);
                  nextIds.add(booking.id);
                  return nextIds;
                })
              }
            />
          ) : (
            <>
              <Ionicons name="restaurant" size={38} color={colors.primary} />
              <Text style={styles.imageBrand}>BAKASURAN</Text>
            </>
          )}
        </View>

        <View style={styles.bookingContent}>
          {/* Restaurant name and status */}
          <View style={styles.restaurantHeader}>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {booking.restaurant}
              </Text>

              <Text style={styles.cuisine} numberOfLines={2}>
                {booking.cuisine}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { borderColor: `${statusColor}55` },
                {
                  backgroundColor:
                    booking.status === "upcoming"
                      ? `${colors.success}18`
                      : booking.status === "completed"
                        ? colors.backgroundElement
                        : `${colors.error}18`,
                },
              ]}
            >
              <Ionicons
                name={
                  booking.status === "upcoming"
                    ? "time-outline"
                    : booking.status === "completed"
                      ? "checkmark-circle"
                      : "close-circle-outline"
                }
                size={14}
                color={statusColor}
              />

              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(booking.status)}
              </Text>
            </View>
          </View>

          {/* Reservation information */}
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.metadataText}>{booking.date}</Text>
            </View>

            <View style={styles.metadataItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.metadataText}>{booking.time}</Text>
            </View>

            <View style={styles.metadataItem}>
              <Ionicons
                name="people-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.metadataText}>{booking.guests} Guests</Text>
            </View>

            <View style={styles.metadataItem}>
              <Ionicons
                name="grid-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.metadataText}>
                Table {booking.table} ({booking.capacity} seats)
              </Text>
            </View>
          </View>

          {isConfirmingCancel && isUpcoming && (
            <View style={styles.cancelConfirmation}>
              <Text style={styles.cancelConfirmationText}>
                Cancel this reservation at {booking.restaurant}?
              </Text>
              {feedback && !feedback.success && (
                <Text style={styles.cancelErrorText}>{feedback.message}</Text>
              )}
              <View style={styles.cancelConfirmationActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.keepBookingButton]}
                  activeOpacity={0.8}
                  disabled={cancellingId !== null}
                  onPress={() => {
                    setCancelConfirmationId(null);
                    setCancelFeedback(null);
                  }}
                >
                  <Text style={styles.keepBookingText}>Keep Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmCancelButton]}
                  activeOpacity={0.8}
                  disabled={cancellingId !== null}
                  onPress={() => confirmCancel(booking)}
                >
                  <Text style={styles.confirmCancelText}>
                    {cancellingId === booking.id
                      ? "Cancelling..."
                      : "Confirm Cancel"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {feedback?.success && (
            <Text style={styles.cancelSuccessText}>{feedback.message}</Text>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.detailsButton,
                isUpcoming && styles.upcomingDetailsButton,
              ]}
              activeOpacity={0.8}
              onPress={() => openBookingDetails(booking)}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>

            {isUpcoming ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.modifyButton]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (!booking.restaurantId || !booking.restaurantTableId) {
                      Alert.alert(
                        "Table details unavailable",
                        "This booking does not include the restaurant and table IDs needed to place a food order. Refresh your bookings or contact the restaurant.",
                      );
                      return;
                    }

                    router.push({
                      pathname: "/TableFoodMenu",
                      params: {
                        restaurantId: booking.restaurantId,
                        restaurantName: booking.restaurant,
                        tableId: booking.restaurantTableId,
                        tableNumber: booking.table,
                      },
                    });
                  }}
                >
                  <Ionicons
                    name="create-outline"
                    size={19}
                    color={colors.white}
                  />
                  <Text style={styles.modifyButtonText}>FoodOrder</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.cancelButton,
                    cancellingId === booking.id && { opacity: 0.6 },
                  ]}
                  activeOpacity={0.8}
                  disabled={cancellingId !== null}
                  onPress={() => handleCancel(booking)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.white}
                  />
                  <Text style={styles.cancelButtonText}>
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.rebookButton]}
                activeOpacity={0.8}
                onPress={() => handleRebook(booking)}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color={colors.white}
                />
                <Text style={styles.modifyButtonText}>Rebook</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderSection = (title, items, count) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>
            {count} {count === 1 ? "Booking" : "Bookings"}
          </Text>
        </View>

        {items.map(renderBookingCard)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/ProfileScreen");
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your table reservations
          </Text>
        </View>

        {/*<View style={styles.headerLogo}>
          <Ionicons name="restaurant" size={25} color={colors.primary} />
          <Text style={styles.logoText}>BAKA</Text>
        </View>*/}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const selected = activeFilter === filter.id;

          const count =
            filter.id === "all"
              ? bookings.length
              : bookings.filter((booking) => booking.status === filter.id)
                  .length;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selected && styles.filterButtonSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon}
                size={18}
                color={selected ? colors.white : colors.textSecondary}
              />

              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {filter.label}
              </Text>

              <Text
                style={[
                  styles.filterCount,
                  selected && styles.filterCountSelected,
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Booking list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <Text style={styles.emptyDescription}>Loading your bookings...</Text>
        ) : loadError ? (
          <Text style={styles.emptyDescription}>{loadError}</Text>
        ) : activeFilter === "all" ? (
          <>
            {renderSection(
              "Upcoming Bookings",
              upcomingBookings,
              upcomingBookings.length,
            )}

            {renderSection("Past Bookings", pastBookings, pastBookings.length)}

            {renderSection(
              "Cancelled Bookings",
              cancelledBookings,
              cancelledBookings.length,
            )}
          </>
        ) : (
          renderSection(
            activeFilter === "upcoming" ? "Upcoming Bookings" : "Past Bookings",
            filteredBookings,
            filteredBookings.length,
          )
        )}

        {!loading && !loadError && filteredBookings.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>No bookings found</Text>

            <Text style={styles.emptyDescription}>
              Your reservations will appear here once you book a table.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={handleNewBooking}
            >
              <Text style={styles.emptyButtonText}>Book a Table</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.newBookingButton}
          activeOpacity={0.85}
          onPress={handleNewBooking}
        >
          <Ionicons name="calendar-outline" size={23} color={colors.white} />

          <Text style={styles.newBookingText}>Book a New Table</Text>

          <Ionicons name="arrow-forward" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 11,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTextContainer: {
      flex: 1,
    },

    headerTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 25,
    },

    headerSubtitle: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      marginTop: 4,
    },

    headerLogo: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 48,
    },

    logoText: {
      color: colors.textPrimary,
      fontFamily: Fonts.extraBold,
      fontSize: 12,
      letterSpacing: 1,
    },

    filterContainer: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginBottom: 20,
      padding: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundElement,
    },

    filterButton: {
      flex: 1,
      minHeight: 43,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: 12,
      paddingHorizontal: 5,
    },

    filterButtonSelected: {
      backgroundColor: colors.primary,
    },

    filterText: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 13,
    },

    filterTextSelected: {
      color: colors.white,
      fontFamily: Fonts.regular,
    },

    filterCount: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 13,
    },

    filterCountSelected: {
      color: colors.white,
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 15,
    },

    section: {
      marginBottom: 20,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingHorizontal: 2,
    },

    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 22,
    },

    sectionCount: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 15,
    },

    bookingCard: {
      backgroundColor: colors.card,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 13,
    },

    restaurantImage: {
      height: 125,
      width: "100%",
      borderRadius: 12,
      backgroundColor: `${colors.primary}18`,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 13,
      overflow: "hidden",
    },

    restaurantLogo: {
      width: "100%",
      height: "100%",
    },

    imageBrand: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 13,
      letterSpacing: 2,
      marginTop: 5,
    },

    bookingContent: {
      flex: 1,
    },

    restaurantHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 13,
    },

    restaurantInfo: {
      flex: 1,
    },

    restaurantName: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 22,
      marginBottom: 5,
    },

    cuisine: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 17,
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
    },

    statusText: {
      fontFamily: Fonts.regular,
      fontSize: 12,
    },

    metadataGrid: {
      gap: 11,
      marginBottom: 15,
    },

    metadataItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    metadataText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 16,
      flexShrink: 1,
    },

    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    actionButton: {
      minHeight: 43,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 10,
      borderRadius: 24,
      borderWidth: 1,
    },

    detailsButton: {
      flex: 1,
      borderColor: colors.primary,
    },

    upcomingDetailsButton: {
      flexBasis: "100%",
    },

    detailsButtonText: {
      color: colors.primary,
      fontFamily: Fonts.regular,
      fontSize: 17,
    },

    modifyButton: {
      flex: 1,
      borderColor: colors.borderLight,
    },

    modifyButtonText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 16,
    },

    cancelButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    cancelButtonText: {
      color: colors.white,
      fontFamily: Fonts.regular,
      fontSize: 15,
    },

    cancelConfirmation: {
      gap: 10,
      marginBottom: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.backgroundElement,
    },

    cancelConfirmationText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 17,
    },

    cancelConfirmationActions: {
      flexDirection: "row",
      gap: 8,
    },

    keepBookingButton: {
      flex: 1,
      borderColor: colors.border,
    },

    keepBookingText: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 15,
    },

    confirmCancelButton: {
      flex: 1,
      backgroundColor: colors.error,
      borderColor: colors.error,
    },

    confirmCancelText: {
      color: colors.white,
      fontFamily: Fonts.regular,
      fontSize: 15,
    },

    cancelErrorText: {
      color: colors.error,
      fontFamily: Fonts.regular,
      fontSize: 13,
    },

    cancelSuccessText: {
      color: colors.success,
      fontFamily: Fonts.regular,
      fontSize: 13,
      marginBottom: 15,
    },

    rebookButton: {
      flex: 1,
      borderColor: colors.borderLight,
    },

    emptyState: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 50,
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    emptyIcon: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: `${colors.primary}18`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },

    emptyTitle: {
      color: colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: 22,
      marginBottom: 9,
    },

    emptyDescription: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 19,
      marginBottom: 20,
    },

    emptyButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 13,
    },

    emptyButtonText: {
      color: colors.white,
      fontFamily: Fonts.regular,
      fontSize: 15,
    },

    bottomSpacing: {
      height: 15,
    },

    bottomContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    newBookingButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 19,
      borderRadius: 28,
      backgroundColor: colors.primary,
    },

    newBookingText: {
      flex: 1,
      textAlign: "center",
      color: colors.white,
      fontFamily: Fonts.regular,
      fontSize: 20,
      marginHorizontal: 10,
    },
  });
