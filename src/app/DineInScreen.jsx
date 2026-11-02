import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BASE_URL from "../constants/AppUrls";
import { getAvailableTables, getRestaurantById } from "../utils/Function";

const COLORS = {
  background: "#050505",
  card: "#101010",
  surface: "#161616",
  input: "#151515",
  border: "#262626",
  red: "#FF101C",
  redSoft: "rgba(255,16,28,0.14)",
  white: "#FFFFFF",
  gray: "#A0A0A0",
  muted: "#6F6F6F",
  gold: "#FFC52F",
};

const FOOD_IMAGE = require("../../assets/images/chicken_biryani.jpg");

const MAX_GUESTS = 10;
const DAYS_AHEAD = 7;
const HERO_HEIGHT = 260;

// The availability API needs an end_time, so we assume a fixed stay.
const BOOKING_DURATION_HOURS = 2;

// Quick-pick time slots (24h "HH:mm"). Keep every slot at least
// BOOKING_DURATION_HOURS before midnight.
const TIME_SLOTS = [
  { label: "Lunch", times: ["12:00", "12:30", "13:00", "13:30", "14:00"] },
  {
    label: "Dinner",
    times: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"],
  },
];

const getRestaurantImageSource = (image) => {
  const imageUri =
    typeof image === "string"
      ? image
      : (image?.uri ?? image?.url ?? image?.image_url);

  if (!imageUri) return FOOD_IMAGE;
  if (/^https?:\/\//i.test(imageUri)) return { uri: imageUri };

  return {
    uri: `${String(BASE_URL).replace(/\/+$/, "")}/${String(imageUri).replace(/^\/+/, "")}`,
  };
};

const getRestaurantDetails = (response) =>
  response?.data?.restaurant ||
  response?.data?.data ||
  response?.data ||
  response?.restaurant ||
  response;

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
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

const slotLabel = (slot) => {
  const [h, m] = slot.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return formatTime(d);
};

const slotHasPassed = (slot, day) => {
  if (!isSameDay(day, new Date())) return false;
  const [h, m] = slot.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d.getTime() <= Date.now();
};

const getDayChipLabel = (value) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(value, today)) return "Today";
  if (isSameDay(value, tomorrow)) return "Tomorrow";
  return WEEKDAYS_SHORT[value.getDay()];
};

/* Defined OUTSIDE the screen so they aren't re-created on every render. */
function SectionHeader({ icon, title, hint }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={17} color={COLORS.red} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

function Chip({ label, active, disabled, onPress, icon }) {
  return (
    <TouchableOpacity
      style={[
        styles.timeChip,
        active && styles.chipActive,
        disabled && styles.chipDisabled,
      ]}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      accessibilityLabel={label}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={active ? COLORS.white : COLORS.gray}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text
        style={[
          styles.timeChipText,
          active && styles.chipTextActive,
          disabled && styles.chipTextDisabled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function DineInScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const restaurantId = Array.isArray(params.restaurantId)
    ? params.restaurantId[0]
    : params.restaurantId;
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    return d;
  });
  const [guests, setGuests] = useState(2);
  const [picker, setPicker] = useState(null); // "date" | "time" | null
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const dayOptions = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [],
  );

  const dateIsQuickDay = dayOptions.some((d) => isSameDay(d, date));
  const timeIsSlot = TIME_SLOTS.some((group) =>
    group.times.includes(toInputTime(time)),
  );

  useEffect(() => {
    let active = true;

    const loadRestaurant = async () => {
      if (!restaurantId) {
        setRestaurantError("Restaurant ID is missing.");
        setRestaurantLoading(false);
        return;
      }

      try {
        const response = await getRestaurantById(restaurantId);
        if (!active) return;

        if (
          response?.success === 0 ||
          response?.success === false ||
          response?.success === "0" ||
          response?.success === 9
        ) {
          throw new Error(
            response?.message || "Unable to load restaurant details.",
          );
        }

        const details = getRestaurantDetails(response);
        if (!details || typeof details !== "object") {
          throw new Error("Invalid restaurant details received.");
        }

        setRestaurant({
          id: details.id ?? details.restaurant_id ?? restaurantId,
          name:
            details.name ??
            details.restaurant_name ??
            details.title ??
            "Restaurant",
          image:
            details.image_url ??
            details.restaurant_image_url ??
            details.image ??
            details.thumbnail ??
            details.logo ??
            details.restaurant_image,
          rating:
            details.rating ??
            details.avg_rating ??
            details.average_rating ??
            "—",
          reviews:
            details.reviews ??
            details.review_count ??
            details.reviews_count ??
            details.ratings_count ??
            "0",
          price:
            details.price_for_two ??
            details.cost_for_two ??
            details.average_cost ??
            details.price ??
            "",
          cuisine:
            details.cuisine ??
            details.cuisine_name ??
            details.category_name ??
            details.food_type ??
            "",
        });
        setRestaurantError("");
      } catch (error) {
        if (active) {
          setRestaurantError(
            error?.message || "Unable to load restaurant details.",
          );
        }
      } finally {
        if (active) setRestaurantLoading(false);
      }
    };

    loadRestaurant();
    return () => {
      active = false;
    };
  }, [restaurantId]);

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

  const selectDay = (day) => {
    setDate(new Date(day));
    setPicker(null);
  };

  const selectSlot = (slot) => {
    const [h, m] = slot.split(":").map(Number);
    setTime((current) => {
      const updated = new Date(current);
      updated.setHours(h, m, 0, 0);
      return updated;
    });
    setPicker(null);
  };

  const changeGuests = (delta) =>
    setGuests((current) => Math.min(MAX_GUESTS, Math.max(1, current + delta)));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const findTable = async () => {
    if (!restaurantId) {
      Alert.alert(
        "Restaurant unavailable",
        "Please reopen a restaurant and try again.",
      );
      return;
    }

    // Combine the chosen date and time into one booking timestamp.
    const start = new Date(date);
    start.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (start.getTime() <= Date.now()) {
      Alert.alert(
        "Choose a later time",
        "The selected time has already passed. Please pick a future time.",
      );
      return;
    }

    const end = new Date(start);
    end.setHours(end.getHours() + BOOKING_DURATION_HOURS);

    // The API takes a single booking_date, so don't allow stays crossing midnight.
    if (!isSameDay(start, end)) {
      Alert.alert("Choose an earlier time", "Bookings must end by midnight.");
      return;
    }

    setLoading(true);
    let result;
    try {
      result = await getAvailableTables({
        restaurantId,
        bookingDate: toInputDate(start),
        bookingTime: toInputTime(start),
        endTime: toInputTime(end),
        guestCount: guests,
      });
    } finally {
      setLoading(false);
    }

    if (result?.success === 9) {
      router.push("/HomeScreen"); // adjust to your auth route
      return;
    }

    if (
      result?.success === 0 ||
      result?.success === false ||
      result?.success === "0"
    ) {
      Alert.alert("Unable to find tables", result?.message || "Try again.");
      return;
    }

    router.push({
      pathname: "/table-booking",
      params: {
        restaurant_id: String(restaurantId),
        restaurant: restaurant?.name ?? "",
        booking_date: toInputDate(start),
        booking_time: toInputTime(start),
        end_time: toInputTime(end),
        guest_count: String(guests),
        tables: JSON.stringify(
          result.data ?? result.tables ?? result.available_tables ?? result,
        ),
      },
    });
  };

  const summaryDay = `${getDayChipLabel(date)}, ${formatDate(date)}`;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={getRestaurantImageSource(restaurant?.image)}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroShadeTop} />
          <View style={styles.heroShadeBottom} />

          <View style={[styles.heroActions, { top: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.roundButton}
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <Text style={styles.brandMark}>BAKASURAN</Text>

            <TouchableOpacity
              style={styles.roundButton}
              onPress={() => setFavorite((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={
                favorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={22}
                color={favorite ? COLORS.red : COLORS.white}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.dineBadge}>
                <Ionicons name="restaurant" size={12} color={COLORS.white} />
                <Text style={styles.dineBadgeText}>DINE IN</Text>
              </View>
              {restaurant?.cuisine ? (
                <View style={styles.cuisineBadge}>
                  <Text style={styles.cuisineBadgeText} numberOfLines={1}>
                    {restaurant.cuisine}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.heroTitle} numberOfLines={2}>
              {restaurantLoading
                ? "Loading restaurant..."
                : restaurant?.name || "Restaurant"}
            </Text>

            <View style={styles.heroMetaRow}>
              <Ionicons name="star" size={16} color={COLORS.gold} />
              <Text style={styles.heroRating}>{restaurant?.rating ?? "—"}</Text>
              <Text style={styles.heroReviews}>
                ({restaurant?.reviews ?? "0"} reviews)
              </Text>
            </View>

            {restaurantError ? (
              <Text style={styles.errorText} numberOfLines={2}>
                {restaurantError}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Booking panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Reserve your table</Text>
          <Text style={styles.panelSubtitle}>
            {restaurant?.name
              ? `Pick a date, time and party size at ${restaurant.name}`
              : "Pick a date, time and party size"}
          </Text>

          {/* Date */}
          <SectionHeader icon="calendar-outline" title="Date" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayRow}
          >
            {dayOptions.map((day) => {
              const active = isSameDay(day, date);
              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[styles.dayChip, active && styles.chipActive]}
                  activeOpacity={0.8}
                  onPress={() => selectDay(day)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${getDayChipLabel(day)} ${formatDate(day)}`}
                >
                  <Text
                    style={[styles.dayName, active && styles.dayTextActive]}
                  >
                    {getDayChipLabel(day)}
                  </Text>
                  <Text
                    style={[styles.dayNumber, active && styles.dayTextActive]}
                  >
                    {String(day.getDate()).padStart(2, "0")}
                  </Text>
                  <Text
                    style={[styles.dayMonth, active && styles.dayTextActive]}
                  >
                    {MONTHS[day.getMonth()]}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.dayChip,
                (!dateIsQuickDay || picker === "date") && styles.chipActive,
              ]}
              activeOpacity={0.8}
              onPress={() => togglePicker("date")}
              accessibilityRole="button"
              accessibilityLabel="Pick another date"
            >
              <Ionicons
                name="calendar"
                size={22}
                color={COLORS.white}
                style={{ marginBottom: 4 }}
              />
              <Text style={[styles.dayMonth, styles.dayTextActive]}>
                {dateIsQuickDay ? "More" : formatDate(date).slice(0, 6)}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {picker === "date" ? renderPicker() : null}

          {/* Time */}
          <SectionHeader
            icon="time-outline"
            title="Time"
            hint={`${BOOKING_DURATION_HOURS} hr stay`}
          />
          {TIME_SLOTS.map((group) => (
            <View key={group.label} style={styles.slotGroup}>
              <Text style={styles.slotGroupLabel}>{group.label}</Text>
              <View style={styles.slotWrap}>
                {group.times.map((slot) => (
                  <Chip
                    key={slot}
                    label={slotLabel(slot)}
                    active={toInputTime(time) === slot}
                    disabled={slotHasPassed(slot, date)}
                    onPress={() => selectSlot(slot)}
                  />
                ))}
              </View>
            </View>
          ))}

          <View style={styles.slotWrap}>
            <Chip
              label={timeIsSlot ? "Custom time" : formatTime(time)}
              icon="time"
              active={!timeIsSlot || picker === "time"}
              onPress={() => togglePicker("time")}
            />
          </View>

          {picker === "time" ? renderPicker() : null}

          {/* Guests */}
          <SectionHeader icon="people-outline" title="Guests" />
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[styles.stepButton, guests <= 1 && styles.chipDisabled]}
              onPress={() => changeGuests(-1)}
              disabled={guests <= 1}
              accessibilityRole="button"
              accessibilityLabel="Decrease guests"
            >
              <Ionicons name="remove" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.stepValue}>
              <Text style={styles.stepNumber}>{guests}</Text>
              <Text style={styles.stepLabel}>
                {guests === 1 ? "Person" : "People"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.stepButton,
                guests >= MAX_GUESTS && styles.chipDisabled,
              ]}
              onPress={() => changeGuests(1)}
              disabled={guests >= MAX_GUESTS}
              accessibilityRole="button"
              accessibilityLabel="Increase guests"
            >
              <Ionicons name="add" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.stepHint}>
            Up to {MAX_GUESTS} guests per booking
          </Text>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
            <Text style={styles.summaryText} numberOfLines={1}>
              {summaryDay}
            </Text>
          </View>
          <View style={styles.summaryDot} />
          <View style={styles.summaryBlock}>
            <Ionicons name="time-outline" size={16} color={COLORS.gray} />
            <Text style={styles.summaryText}>{formatTime(time)}</Text>
          </View>
          <View style={styles.summaryDot} />
          <View style={styles.summaryBlock}>
            <Ionicons name="people-outline" size={16} color={COLORS.gray} />
            <Text style={styles.summaryText}>{guests}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.findTableButton, loading && { opacity: 0.6 }]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={findTable}
          accessibilityRole="button"
          accessibilityLabel="Find table"
        >
          <Text style={styles.findTableText}>
            {loading ? "Searching..." : "Find a Table"}
          </Text>
          <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  /* Date / time picker, rendered inline under its section. */
  function renderPicker() {
    if (Platform.OS === "web") {
      return (
        <View style={styles.pickerContainer}>
          {React.createElement("input", {
            type: picker,
            value: picker === "date" ? toInputDate(date) : toInputTime(time),
            min: picker === "date" ? toInputDate(new Date()) : undefined,
            onChange: handleWebDateTimeChange,
            "aria-label": `Select ${picker}`,
            style: {
              boxSizing: "border-box",
              width: "100%",
              minHeight: 44,
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
      );
    }

    if (Platform.OS === "ios") {
      return (
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
      );
    }

    return (
      <DateTimePicker
        value={picker === "date" ? date : time}
        mode={picker}
        display="default"
        minimumDate={picker === "date" ? new Date() : undefined}
        onChange={handleDateTimeChange}
      />
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Hero */
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: COLORS.card,
  },

  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  heroShadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: "rgba(0,0,0,0.38)",
  },

  heroShadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 170,
    backgroundColor: "rgba(5,5,5,0.82)",
  },

  heroActions: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandMark: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 4,
  },

  heroInfo: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 22,
  },

  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  dineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.red,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  dineBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  cuisineBadge: {
    maxWidth: "60%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  cuisineBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 33,
  },

  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },

  heroRating: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: "800",
  },

  heroReviews: {
    color: COLORS.gray,
    fontSize: 13,
  },

  errorText: {
    color: "#FF6B72",
    fontSize: 12,
    marginTop: 6,
  },

  /* Booking panel */
  panel: {
    marginTop: -16,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  panelTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
  },

  panelSubtitle: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 12,
  },

  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.redSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },

  sectionHint: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  /* Date chips */
  dayRow: {
    gap: 10,
    paddingRight: 6,
  },

  dayChip: {
    minWidth: 74,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  dayName: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: "700",
  },

  dayNumber: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginVertical: 2,
  },

  dayMonth: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: "600",
  },

  dayTextActive: {
    color: COLORS.white,
  },

  chipActive: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  chipDisabled: {
    opacity: 0.35,
  },

  chipTextActive: {
    color: COLORS.white,
  },

  chipTextDisabled: {
    color: COLORS.muted,
  },

  /* Time chips */
  slotGroup: {
    marginBottom: 10,
  },

  slotGroupLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  slotWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  timeChipText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  /* Guests stepper */
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 10,
  },

  stepButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  stepValue: {
    alignItems: "center",
  },

  stepNumber: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "900",
  },

  stepLabel: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 1,
  },

  stepHint: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },

  /* Picker */
  pickerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 12,
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

  /* Bottom bar */
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0B0B0B",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  summaryBlock: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  summaryText: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  summaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.muted,
    marginHorizontal: 10,
  },

  findTableButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: 18,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },

  findTableText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
});
