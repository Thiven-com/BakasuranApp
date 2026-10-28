import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#050505",
  card: "#101010",
  input: "#151515",
  border: "#292929",
  red: "#FF101C",
  white: "#FFFFFF",
  gray: "#A0A0A0",
  gold: "#FFC52F",
  green: "#00C86B",
};

const FOOD_IMAGE = require("../../assets/images/chicken_biryani.jpg");

// Move this to your API / store later.
const DISH = {
  nameLine1: "Hyderabadi",
  nameLine2: "Mutton Biryani",
  rating: 4.8,
  reviews: "2,341",
  price: "₹320",
  isVeg: false, // Mutton is non-veg. Set true only for veg dishes.
};

const MAX_GUESTS = 10;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const isSameDay = (a, b) =>
  a instanceof Date &&
  b instanceof Date &&
  !Number.isNaN(a.getTime()) &&
  !Number.isNaN(b.getTime()) &&
  a.toDateString() === b.toDateString();

const formatDate = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "Select date";
  }

  const day = String(value.getDate()).padStart(2, "0");
  return `${day} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
};

const formatTime = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "Select time";
  }

  const hour = value.getHours();
  const hour12 = hour % 12 || 12;
  const minute = String(value.getMinutes()).padStart(2, "0");
  const period = hour < 12 ? "AM" : "PM";

  return `${String(hour12).padStart(2, "0")}:${minute} ${period}`;
};

const toInputDate = (value) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

const toInputTime = (value) =>
  `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

const getDateSubtitle = (value) => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(value, now)) return "Today";
  if (isSameDay(value, tomorrow)) return "Tomorrow";
  return WEEKDAYS[value.getDay()];
};

/* Defined OUTSIDE the screen so it isn't re-created on every render. */
function SelectionCard({ icon, label, value, subtitle, onPress }) {
  return (
    <TouchableOpacity
      style={styles.selectionCard}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}${subtitle ? `, ${subtitle}` : ""}`}
    >
      <View style={styles.selectionIcon}>
        <Ionicons name={icon} size={25} color={COLORS.white} />
      </View>

      <View style={styles.selectionContent}>
        <Text style={styles.selectionLabel}>{label}</Text>
        <Text style={styles.selectionValue} numberOfLines={1}>
          {String(value || "")}
        </Text>
        {subtitle ? (
          <Text style={styles.selectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Ionicons name="chevron-down" size={23} color={COLORS.white} />
    </TouchableOpacity>
  );
}

export default function DineInScreen() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    return d;
  });
  const [guests, setGuests] = useState(2);
  const [picker, setPicker] = useState(null); // "date" | "time" | null
  const [guestModal, setGuestModal] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const guestOptions = useMemo(
    () => Array.from({ length: MAX_GUESTS }, (_, i) => i + 1),
    [],
  );

  const handleDateTimeChange = (event, selectedValue) => {
    if (Platform.OS === "android") setPicker(null);
    if (event.type === "dismissed" || !selectedValue) return;

    if (picker === "date") setDate(selectedValue);
    else if (picker === "time") setTime(selectedValue);
  };

  const handleWebDateTimeChange = (event) => {
    const value = event.target.value;
    if (!value) return;

    if (picker === "date") {
      const [year, month, day] = value.split("-").map(Number);
      setDate(new Date(year, month - 1, day));
    } else if (picker === "time") {
      const [hours, minutes] = value.split(":").map(Number);
      setTime((current) => {
        const updated = new Date(current);
        updated.setHours(hours, minutes, 0, 0);
        return updated;
      });
    }
  };

  const togglePicker = (type) =>
    setPicker((current) => (current === type ? null : type));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const findTable = () => {
    // Combine the chosen date and time into one booking timestamp.
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (bookingDateTime.getTime() <= Date.now()) {
      Alert.alert(
        "Choose a later time",
        "The selected time has already passed. Please pick a future time.",
      );
      return;
    }

    Alert.alert(
      "Find a Table",
      `Date: ${formatDate(date)}\nTime: ${formatTime(time)}\nGuests: ${guests}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            // Call your table-availability API here, e.g.:
            // checkAvailability({ dateTime: bookingDateTime.toISOString(), guests });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={29} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Dine In</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Food card */}
        <View style={styles.foodCard}>
          <View style={styles.foodImageContainer}>
            <Image
              source={FOOD_IMAGE}
              style={styles.foodImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => setFavorite((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={
                favorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={25}
                color={favorite ? COLORS.red : COLORS.white}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{DISH.nameLine1}</Text>
            <Text style={styles.foodName}>{DISH.nameLine2}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={23} color={COLORS.gold} />
              <Text style={styles.rating}>{DISH.rating}</Text>
              <View style={styles.ratingDivider} />
              <Text style={styles.reviewCount}>({DISH.reviews})</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.foodPrice}>{DISH.price}</Text>

              <View
                style={[
                  styles.vegBadge,
                  { borderColor: DISH.isVeg ? COLORS.green : COLORS.red },
                ]}
              >
                <View
                  style={[
                    styles.vegDot,
                    { backgroundColor: DISH.isVeg ? COLORS.green : COLORS.red },
                  ]}
                />
                <Text
                  style={[
                    styles.vegText,
                    { color: DISH.isVeg ? COLORS.green : COLORS.red },
                  ]}
                >
                  {DISH.isVeg ? "Veg" : "Non-Veg"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking heading */}
        <View style={styles.bookingHeading}>
          <View style={styles.bookingHeadingIcon}>
            <Ionicons name="restaurant-outline" size={35} color={COLORS.red} />
          </View>

          <View style={styles.bookingHeadingContent}>
            <Text style={styles.bookingTitle}>Book Your Table</Text>
            <Text style={styles.bookingSubtitle}>
              Enjoy your favorite food at our restaurant
            </Text>
          </View>
        </View>

        <SelectionCard
          icon="calendar-outline"
          label="Date"
          value={formatDate(date)}
          subtitle={getDateSubtitle(date)}
          onPress={() => togglePicker("date")}
        />

        <SelectionCard
          icon="time-outline"
          label="Time"
          value={formatTime(time)}
          onPress={() => togglePicker("time")}
        />

        <SelectionCard
          icon="people-outline"
          label="Guests"
          value={`${guests} ${guests === 1 ? "Person" : "People"}`}
          onPress={() => setGuestModal(true)}
        />

        {/* Date / time picker */}
        {picker &&
          (Platform.OS === "web" ? (
            <View style={styles.pickerContainer}>
              <Text style={styles.selectionLabel}>
                Select {picker === "date" ? "date" : "time"}
              </Text>
              {React.createElement("input", {
                type: picker,
                value:
                  picker === "date" ? toInputDate(date) : toInputTime(time),
                min: picker === "date" ? toInputDate(new Date()) : undefined,
                onChange: handleWebDateTimeChange,
                "aria-label": `Select ${picker}`,
                style: {
                  boxSizing: "border-box",
                  width: "100%",
                  minHeight: 44,
                  marginTop: 10,
                  padding: "8px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  backgroundColor: COLORS.input,
                  color: COLORS.white,
                  colorScheme: "dark",
                  fontSize: 16,
                },
              })}
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setPicker(null)}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : Platform.OS === "ios" ? (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={picker === "date" ? date : time}
                mode={picker}
                display="spinner"
                minimumDate={picker === "date" ? new Date() : undefined}
                onChange={handleDateTimeChange}
                themeVariant="dark"
                textColor={COLORS.white}
              />
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setPicker(null)}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DateTimePicker
              value={picker === "date" ? date : time}
              mode={picker}
              display="default"
              minimumDate={picker === "date" ? new Date() : undefined}
              onChange={handleDateTimeChange}
            />
          ))}

        {/* Find table */}
        <TouchableOpacity
          style={styles.findTableButton}
          activeOpacity={0.85}
          onPress={() => router.push("/table-booking")}
          accessibilityRole="button"
          accessibilityLabel="Find table"
        >
          <Ionicons name="calendar" size={27} color={COLORS.white} />
          <Text style={styles.findTableText}>Find Table</Text>
          <Ionicons name="chevron-forward" size={28} color={COLORS.white} />
        </TouchableOpacity>

        <View style={{ height: 28 }} />
      </ScrollView>

      {/* Guests bottom sheet (Alert is limited to 3 buttons on Android) */}
      <Modal
        visible={guestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setGuestModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setGuestModal(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Guests</Text>
            <Text style={styles.modalSubtitle}>
              Choose the number of guests
            </Text>

            <View style={styles.chipGrid}>
              {guestOptions.map((n) => {
                const active = n === guests;
                return (
                  <TouchableOpacity
                    key={n}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setGuests(n);
                      setGuestModal(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${n} ${n === 1 ? "person" : "people"}`}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
  },

  headerSpacer: {
    width: 43,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  foodCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 23,
    padding: 12,
    marginBottom: 27,
  },

  foodImageContainer: {
    width: "47%",
    aspectRatio: 0.94,
    position: "relative",
  },

  foodImage: {
    width: "100%",
    height: "100%",
    borderRadius: 17,
  },

  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 43,
    height: 43,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "#555555",
    alignItems: "center",
    justifyContent: "center",
  },

  foodInfo: {
    flex: 1,
    paddingLeft: 15,
    paddingVertical: 8,
    justifyContent: "center",
  },

  foodName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 25,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  rating: {
    color: COLORS.gold,
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 7,
  },

  ratingDivider: {
    height: 24,
    width: 1,
    backgroundColor: "#555555",
    marginHorizontal: 11,
  },

  reviewCount: {
    color: COLORS.gray,
    fontSize: 13,
  },

  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },

  foodPrice: {
    color: COLORS.red,
    fontSize: 24,
    fontWeight: "900",
  },

  vegBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  vegDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  vegText: {
    fontSize: 13,
    fontWeight: "800",
  },

  bookingHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
    paddingHorizontal: 2,
  },

  bookingHeadingIcon: {
    width: 55,
    alignItems: "center",
  },

  bookingHeadingContent: {
    flex: 1,
    marginLeft: 12,
  },

  bookingTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
  },

  bookingSubtitle: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  selectionCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
  },

  selectionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  selectionContent: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },

  selectionLabel: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 7,
  },

  selectionValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
  },

  selectionSubtitle: {
    color: COLORS.gray,
    fontSize: 13,
    marginTop: 5,
  },

  pickerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
  },

  pickerDoneButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  pickerDoneText: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: "800",
  },

  findTableButton: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: COLORS.red,
    borderRadius: 24,
    marginTop: 7,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 7,
  },

  findTableText: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
  },

  /* Guests modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
  },

  modalHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3A3A3A",
    marginBottom: 18,
  },

  modalTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: COLORS.gray,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 20,
  },

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  chip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  chipActive: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  chipText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },

  chipTextActive: {
    color: COLORS.white,
  },
});
