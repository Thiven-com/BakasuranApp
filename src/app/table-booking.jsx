import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const restaurants = [
  {
    id: "1",
    name: "Spice House",
    cuisine: "Biryani • North Indian • Mughlai",
    rating: "4.7",
    location: "Hitech City",
  },
  {
    id: "2",
    name: "Burger Mania",
    cuisine: "Burgers • Fast Food",
    rating: "4.5",
    location: "Madhapur",
  },
  {
    id: "3",
    name: "Pizza Planet",
    cuisine: "Pizza • Italian • Fast Food",
    rating: "4.6",
    location: "Gachibowli",
  },
  {
    id: "4",
    name: "Crispy Bowl",
    cuisine: "Chinese • Asian",
    rating: "4.4",
    location: "Kondapur",
  },
];

const timeSlots = [
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
];

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8];

const tables = [
  {
    id: "T01",
    number: "01",
    capacity: 2,
    type: "Couple",
    status: "available",
  },
  {
    id: "T02",
    number: "02",
    capacity: 2,
    type: "Couple",
    status: "available",
  },
  {
    id: "T03",
    number: "03",
    capacity: 4,
    type: "Family",
    status: "available",
  },
  {
    id: "T04",
    number: "04",
    capacity: 4,
    type: "Family",
    status: "booked",
  },
  {
    id: "T05",
    number: "05",
    capacity: 6,
    type: "Large",
    status: "available",
  },
  {
    id: "T06",
    number: "06",
    capacity: 6,
    type: "Large",
    status: "booked",
  },
  {
    id: "T07",
    number: "07",
    capacity: 8,
    type: "Party",
    status: "available",
  },
  {
    id: "T08",
    number: "08",
    capacity: 8,
    type: "Party",
    status: "available",
  },
];

const getDates = () => {
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();

    date.setDate(date.getDate() + i);

    dates.push({
      id: i,
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", {
        month: "short",
      }),
    });
  }

  return dates;
};

const TableBookingScreen = () => {
  const dates = useMemo(() => getDates(), []);

  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);

  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const [selectedTime, setSelectedTime] = useState(null);

  const [guests, setGuests] = useState(2);

  const [selectedTable, setSelectedTable] = useState(null);

  const [specialRequest, setSpecialRequest] = useState("");

  /*
   * Only show tables that can accommodate
   * the selected number of guests.
   */
  const availableTables = useMemo(() => {
    return tables.filter((table) => {
      return table.capacity >= guests && table.status === "available";
    });
  }, [guests]);

  /*
   * When guest count changes, clear the previously
   * selected table if it cannot accommodate the new count.
   */
  const handleGuestChange = (number) => {
    setGuests(number);

    if (selectedTable && selectedTable.capacity < number) {
      setSelectedTable(null);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedRestaurant) {
      Alert.alert("Select Restaurant", "Please select a restaurant.");
      return;
    }

    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a table time.");
      return;
    }

    if (!selectedTable) {
      Alert.alert("Select Table", "Please select an available table.");
      return;
    }

    const bookingId = `BAKA${Date.now().toString().slice(-6)}`;

    router.push({
      pathname: "/Booking-SuccessScreen",
      params: {
        bookingId,
        restaurant: selectedRestaurant.name,
        date: `${selectedDate.day}, ${selectedDate.date} ${selectedDate.month}`,
        time: selectedTime,
        guests: guests.toString(),
        tableNumber: selectedTable.number,
        tableCapacity: selectedTable.capacity.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={23} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Book a Table</Text>

        <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
          <Ionicons name="help-circle-outline" size={23} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="restaurant-outline"
              size={30}
              color={Colors.primary}
            />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Dine like a BAKASURAN</Text>

            <Text style={styles.heroSubtitle}>
              Reserve your table and enjoy an unforgettable meal.
            </Text>
          </View>
        </View>

        {/* RESTAURANT */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Select Restaurant</Text>

              <Text style={styles.sectionSubtitle}>
                Choose where you want to dine
              </Text>
            </View>

            <Text style={styles.stepText}>1/6</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantList}
          >
            {restaurants.map((restaurant) => {
              const isSelected = selectedRestaurant.id === restaurant.id;

              return (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[
                    styles.restaurantCard,
                    isSelected && styles.restaurantCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedRestaurant(restaurant);
                    setSelectedTable(null);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.restaurantIcon}>
                    <Ionicons
                      name="restaurant"
                      size={24}
                      color={isSelected ? Colors.white : Colors.primary}
                    />
                  </View>

                  <View style={styles.restaurantInfo}>
                    <Text
                      style={[
                        styles.restaurantName,
                        isSelected && styles.restaurantNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {restaurant.name}
                    </Text>

                    <Text style={styles.restaurantCuisine} numberOfLines={1}>
                      {restaurant.cuisine}
                    </Text>

                    <View style={styles.restaurantBottom}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color={Colors.rating} />

                        <Text style={styles.ratingText}>
                          {restaurant.rating}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.locationText,
                          isSelected && styles.locationTextSelected,
                        ]}
                      >
                        {restaurant.location}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={Colors.white}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* DATE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Select Date</Text>

              <Text style={styles.sectionSubtitle}>
                When are you planning to visit?
              </Text>
            </View>

            <Text style={styles.stepText}>2/6</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          >
            {dates.map((item) => {
              const isSelected = selectedDate.id === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedDate(item);
                    setSelectedTable(null);
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {item.day}
                  </Text>

                  <Text
                    style={[
                      styles.dateNumber,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {item.date}
                  </Text>

                  <Text
                    style={[
                      styles.dateMonth,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* TIME */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Select Time</Text>

              <Text style={styles.sectionSubtitle}>Available dining slots</Text>
            </View>

            <Text style={styles.stepText}>3/6</Text>
          </View>

          <View style={styles.timeGrid}>
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;

              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    isSelected && styles.timeSlotSelected,
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setSelectedTable(null);
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isSelected ? Colors.white : Colors.textSecondary}
                  />

                  <Text
                    style={[
                      styles.timeText,
                      isSelected && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* GUESTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Number of Guests</Text>

              <Text style={styles.sectionSubtitle}>
                How many people are dining?
              </Text>
            </View>

            <Text style={styles.stepText}>4/6</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guestList}
          >
            {guestOptions.map((number) => {
              const isSelected = guests === number;

              return (
                <TouchableOpacity
                  key={number}
                  style={[
                    styles.guestCard,
                    isSelected && styles.guestCardSelected,
                  ]}
                  onPress={() => handleGuestChange(number)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={isSelected ? Colors.white : Colors.textSecondary}
                  />

                  <Text
                    style={[
                      styles.guestText,
                      isSelected && styles.guestTextSelected,
                    ]}
                  >
                    {number}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* TABLE SELECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Select Your Table</Text>

              <Text style={styles.sectionSubtitle}>
                Tables available for {guests}{" "}
                {guests === 1 ? "guest" : "guests"}
              </Text>
            </View>

            <Text style={styles.stepText}>5/6</Text>
          </View>

          {/* TABLE LEGEND */}
          <View style={styles.tableLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.availableDot]} />

              <Text style={styles.legendText}>Available</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.selectedDot]} />

              <Text style={styles.legendText}>Selected</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.bookedDot]} />

              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>

          {/* TABLE GRID */}
          <View style={styles.tableGrid}>
            {tables.map((table) => {
              const isBooked = table.status === "booked";

              const cannotFit = table.capacity < guests;

              const isSelected = selectedTable?.id === table.id;

              const isDisabled = isBooked || cannotFit;

              return (
                <TouchableOpacity
                  key={table.id}
                  disabled={isDisabled}
                  style={[
                    styles.tableCard,

                    isBooked && styles.tableCardBooked,

                    cannotFit && !isBooked && styles.tableCardDisabled,

                    isSelected && styles.tableCardSelected,
                  ]}
                  onPress={() => setSelectedTable(table)}
                  activeOpacity={0.85}
                >
                  {/* TABLE TOP */}
                  <View style={styles.tableTop}>
                    <View
                      style={[
                        styles.tableNumberCircle,

                        isSelected && styles.tableNumberCircleSelected,

                        isBooked && styles.tableNumberCircleBooked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tableNumber,

                          isSelected && styles.tableNumberSelected,

                          isBooked && styles.tableNumberBooked,
                        ]}
                      >
                        {table.number}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={styles.tableCheck}>
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={Colors.white}
                        />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.tableLabel,
                      isSelected && styles.tableLabelSelected,
                      isBooked && styles.tableLabelBooked,
                    ]}
                  >
                    Table {table.number}
                  </Text>

                  <View style={styles.capacityRow}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={isSelected ? Colors.white : Colors.textMuted}
                    />

                    <Text
                      style={[
                        styles.capacityText,
                        isSelected && styles.capacityTextSelected,
                      ]}
                    >
                      {table.capacity} seats
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.tableType,
                      isSelected && styles.tableTypeSelected,
                    ]}
                  >
                    {table.type}
                  </Text>

                  {isBooked && (
                    <View style={styles.bookedBadge}>
                      <Text style={styles.bookedBadgeText}>BOOKED</Text>
                    </View>
                  )}

                  {!isBooked && cannotFit && (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableBadgeText}>TOO SMALL</Text>
                    </View>
                  )}

                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>SELECTED</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {availableTables.length === 0 && (
            <View style={styles.noTableCard}>
              <Ionicons
                name="restaurant-outline"
                size={28}
                color={Colors.textMuted}
              />

              <Text style={styles.noTableTitle}>
                No suitable tables available
              </Text>

              <Text style={styles.noTableText}>
                Try selecting fewer guests or another time slot.
              </Text>
            </View>
          )}
        </View>

        {/* SPECIAL REQUEST */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Special Request</Text>

              <Text style={styles.sectionSubtitle}>
                Anything we should know?
              </Text>
            </View>

            <Text style={styles.optionalText}>Optional</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />

            <TextInput
              value={specialRequest}
              onChangeText={setSpecialRequest}
              placeholder="Birthday, anniversary, window seat..."
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={250}
            />
          </View>

          <Text style={styles.characterCount}>{specialRequest.length}/250</Text>
        </View>

        {/* BOOKING SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="receipt-outline" size={20} color={Colors.primary} />

            <Text style={styles.summaryTitle}>Booking Summary</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Restaurant</Text>

            <Text style={styles.summaryValue} numberOfLines={1}>
              {selectedRestaurant.name}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>

            <Text style={styles.summaryValue}>
              {selectedDate.day}, {selectedDate.date} {selectedDate.month}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>

            <Text style={styles.summaryValue}>
              {selectedTime || "Select time"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>

            <Text style={styles.summaryValue}>
              {guests} {guests === 1 ? "Guest" : "Guests"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Table</Text>

            <Text
              style={[
                styles.summaryValue,
                selectedTable ? styles.summaryHighlight : null,
              ]}
            >
              {selectedTable ? `Table ${selectedTable.number}` : "Select table"}
            </Text>
          </View>

          {selectedTable && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Capacity</Text>

              <Text style={styles.summaryValue}>
                {selectedTable.capacity} seats
              </Text>
            </View>
          )}
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={Colors.info}
          />

          <Text style={styles.infoText}>
            Your table will be held for 15 minutes after the selected time.
            Please arrive on time.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* BOTTOM CONFIRM BUTTON */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomLabel}>Selected Table</Text>

          <Text style={styles.bottomGuests}>
            {selectedTable ? `Table ${selectedTable.number}` : "Not selected"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>

          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TableBookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  headerButton: {
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
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    marginBottom: 24,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 32, 40, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 32, 40, 0.25)",
    marginRight: 14,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.lg,
    marginBottom: 5,
  },

  heroSubtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    lineHeight: 18,
  },

  section: {
    marginBottom: 25,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 13,
  },

  sectionTitle: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  sectionSubtitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginTop: 3,
  },

  stepText: {
    color: Colors.primary,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
    marginTop: 2,
  },

  optionalText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginTop: 3,
  },

  /* RESTAURANTS */

  restaurantList: {
    paddingRight: 10,
  },

  restaurantCard: {
    width: 285,
    minHeight: 108,
    padding: 13,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    position: "relative",
  },

  restaurantCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(255, 32, 40, 0.08)",
  },

  restaurantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  restaurantInfo: {
    flex: 1,
    justifyContent: "center",
  },

  restaurantName: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    marginBottom: 3,
    paddingRight: 18,
  },

  restaurantNameSelected: {
    color: Colors.primary,
  },

  restaurantCuisine: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginBottom: 8,
  },

  restaurantBottom: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: Colors.surface,
  },

  ratingText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xs,
    marginLeft: 3,
  },

  locationText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginLeft: 8,
  },

  locationTextSelected: {
    color: Colors.textSecondary,
  },

  selectedCheck: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  /* DATE */

  dateList: {
    paddingRight: 10,
  },

  dateCard: {
    width: 68,
    height: 82,
    marginRight: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  dateDay: {
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xs,
  },

  dateNumber: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xxl,
    marginVertical: 2,
  },

  dateMonth: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  dateTextSelected: {
    color: Colors.white,
  },

  /* TIME */

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  timeSlot: {
    width: "30.8%",
    minHeight: 45,
    paddingHorizontal: 7,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  timeText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xs,
    marginLeft: 5,
  },

  timeTextSelected: {
    color: Colors.white,
  },

  /* GUESTS */

  guestList: {
    paddingRight: 10,
  },

  guestCard: {
    width: 60,
    height: 48,
    marginRight: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  guestCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  guestText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    marginLeft: 5,
  },

  guestTextSelected: {
    color: Colors.white,
  },

  /* TABLE LEGEND */

  tableLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    marginBottom: 5,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  availableDot: {
    backgroundColor: Colors.success,
  },

  selectedDot: {
    backgroundColor: Colors.primary,
  },

  bookedDot: {
    backgroundColor: Colors.error,
  },

  legendText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  /* TABLE GRID */

  tableGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  tableCard: {
    width: "48.3%",
    minHeight: 150,
    padding: 13,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },

  tableCardSelected: {
    backgroundColor: "rgba(255, 32, 40, 0.1)",
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },

  tableCardBooked: {
    backgroundColor: Colors.surface,
    borderColor: "rgba(239, 68, 68, 0.3)",
    opacity: 0.65,
  },

  tableCardDisabled: {
    opacity: 0.42,
  },

  tableTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tableNumberCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },

  tableNumberCircleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  tableNumberCircleBooked: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },

  tableNumber: {
    color: Colors.success,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
  },

  tableNumberSelected: {
    color: Colors.white,
  },

  tableNumberBooked: {
    color: Colors.error,
  },

  tableCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  tableLabel: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    marginTop: 12,
  },

  tableLabelSelected: {
    color: Colors.primary,
  },

  tableLabelBooked: {
    color: Colors.textMuted,
  },

  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  capacityText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginLeft: 5,
  },

  capacityTextSelected: {
    color: Colors.textSecondary,
  },

  tableType: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginTop: 5,
  },

  tableTypeSelected: {
    color: Colors.textSecondary,
  },

  bookedBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },

  bookedBadgeText: {
    color: Colors.error,
    fontFamily: Fonts.bold,
    fontSize: 8,
  },

  unavailableBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: Colors.surface,
  },

  unavailableBadgeText: {
    color: Colors.textMuted,
    fontFamily: Fonts.bold,
    fontSize: 8,
  },

  selectedBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: "rgba(255, 32, 40, 0.15)",
  },

  selectedBadgeText: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontSize: 8,
  },

  noTableCard: {
    marginTop: 14,
    padding: 22,
    borderRadius: 15,
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  noTableTitle: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    marginTop: 9,
  },

  noTableText: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    textAlign: "center",
    marginTop: 5,
  },

  /* SPECIAL REQUEST */

  inputContainer: {
    minHeight: 110,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: "row",
  },

  inputIcon: {
    marginTop: 2,
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    lineHeight: 20,
  },

  characterCount: {
    textAlign: "right",
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    marginTop: 5,
  },

  /* SUMMARY */

  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryTitle: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.base,
    marginLeft: 9,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
  },

  summaryValue: {
    maxWidth: "58%",
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: Fonts.size.sm,
    textAlign: "right",
  },

  summaryHighlight: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },

  /* INFO */

  infoCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    lineHeight: 18,
    marginLeft: 9,
  },

  bottomSpacing: {
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
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  bottomPrice: {
    flex: 1,
  },

  bottomLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  bottomGuests: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    marginTop: 2,
  },

  confirmButton: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.sm,
    marginRight: 9,
  },
});
