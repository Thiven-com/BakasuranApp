import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../hooks/use-theme";
import { createRestaurantTableBooking, getProfile } from "../utils/Function"; // adjust path if needed

const COLUMNS = 4;
const MAX_WIDTH = 480;
const BASE_WIDTH = 390; // width the design was drawn for

const chunk = (list, size) => {
  const rows = [];
  for (let i = 0; i < list.length; i += size)
    rows.push(list.slice(i, i + size));
  return rows;
};

const getTableList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  for (const key of ["tables", "available_tables", "availableTables", "data"]) {
    const list = getTableList(value[key]);
    if (list.length) return list;
  }

  return [];
};

const normalizeTables = (rawTables, guests) =>
  getTableList(rawTables)
    .map((item, index) => {
      const table = item?.table ?? item;
      // `id` is the database id sent as restaurant_table_id when booking.
      const id = table?.id ?? table?.table_id;
      // `label` is what the customer sees on the tile.
      const label =
        table?.table_number ??
        table?.table_no ??
        table?.number ??
        table?.name ??
        id;
      const key = id ?? label;
      if (key === undefined || key === null || String(key).trim() === "") {
        return null;
      }

      const capacity = Number(
        table?.seats ??
          table?.capacity ??
          table?.guest_capacity ??
          table?.seating_capacity ??
          table?.max_guests,
      );
      const rawStatus = String(
        table?.status ?? table?.availability ?? "",
      ).toLowerCase();
      const unavailable =
        table?.is_available === false ||
        table?.is_available === 0 ||
        table?.is_available === "false" ||
        table?.is_available === "0" ||
        table?.is_booked === true ||
        table?.is_booked === 1 ||
        ["booked", "unavailable", "reserved", "occupied"].includes(rawStatus);
      const section = String(
        table?.section_name ??
          table?.section ??
          table?.area ??
          table?.zone ??
          "",
      ).toLowerCase();

      return {
        id: String(key),
        label: String(label ?? key),
        seats: Number.isFinite(capacity) && capacity > 0 ? capacity : guests,
        status: unavailable ? "booked" : "available",
        isWindow: section.includes("window"),
        order: index,
      };
    })
    .filter(Boolean);

const isFailure = (result) =>
  !result ||
  result.success === 0 ||
  result.success === false ||
  result.success === "0";

/* Every size scales with screen width, so the layout works on a phone,
   a narrow web preview, and a desktop browser alike. */
function useScaledStyles() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const scale = Math.min(
    Math.max(Math.min(width, MAX_WIDTH) / BASE_WIDTH, 0.6),
    1,
  );
  const compact = scale < 0.85;
  const styles = useMemo(() => createStyles(scale, colors), [scale, colors]);
  return { styles, scale, compact, colors, isDark };
}

/* Defined outside the screen so it isn't re-created on every render. */
function TableTile({ table, selected, tooSmall, onPress }) {
  const { styles, scale, colors } = useScaledStyles();
  const booked = table.status === "booked";
  const disabled = booked || tooSmall;

  const seatColor = selected
    ? colors.white
    : disabled
      ? colors.textMuted
      : colors.textSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        !disabled && styles.tileAvailable,
        booked && styles.tileBooked,
        tooSmall && !booked && styles.tileTooSmall,
        selected && styles.tileSelected,
      ]}
      activeOpacity={0.85}
      disabled={disabled}
      onPress={() => onPress(table.id)}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`Table ${table.label}, ${table.seats} seats, ${
        booked
          ? "booked"
          : tooSmall
            ? "too small for your party"
            : selected
              ? "selected"
              : "available"
      }`}
    >
      <Text
        style={[
          styles.tileId,
          selected && { color: colors.white },
          disabled && styles.tileIdDisabled,
        ]}
      >
        {table.label}
      </Text>
      <View style={styles.tileSeats}>
        <Ionicons
          name="person-outline"
          size={Math.round(17 * scale)}
          color={seatColor}
        />
        <Text style={[styles.tileSeatsText, { color: seatColor }]}>
          {table.seats}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function TableRow({ row, selectedId, guests, onSelect }) {
  const { styles } = useScaledStyles();

  return (
    <View style={styles.tileRow}>
      {Array.from({ length: COLUMNS }).map((_, i) => {
        const table = row[i];
        if (!table)
          return <View key={`empty-${i}`} style={styles.tileSpacer} />;
        return (
          <TableTile
            key={table.id}
            table={table}
            selected={table.id === selectedId}
            tooSmall={table.seats < guests}
            onPress={onSelect}
          />
        );
      })}
    </View>
  );
}

function ScrollRail({ scrollRef, scrollY, contentH, layoutH }) {
  const { styles, scale, colors } = useScaledStyles();
  const [railH, setRailH] = useState(0);

  const scrollable = contentH > layoutH && layoutH > 0;
  const thumbH = scrollable
    ? Math.max(24, railH * (layoutH / contentH))
    : railH;
  const maxScroll = Math.max(1, contentH - layoutH);
  const thumbTop = scrollable
    ? (Math.min(Math.max(scrollY, 0), maxScroll) / maxScroll) * (railH - thumbH)
    : 0;

  const step = Math.max(layoutH * 0.6, 60);

  const scrollBy = (delta) => {
    const next = Math.min(Math.max(scrollY + delta, 0), maxScroll);
    scrollRef.current?.scrollTo({ y: next, animated: true });
  };

  return (
    <View style={styles.rail}>
      <TouchableOpacity
        hitSlop={10}
        onPress={() => scrollBy(-step)}
        accessibilityRole="button"
        accessibilityLabel="Scroll up"
      >
        <Ionicons
          name="chevron-up"
          size={Math.round(20 * scale)}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <View
        style={styles.railTrack}
        onLayout={(e) => setRailH(e.nativeEvent.layout.height)}
      >
        <View style={[styles.railThumb, { height: thumbH, top: thumbTop }]} />
      </View>

      <TouchableOpacity
        hitSlop={10}
        onPress={() => scrollBy(step)}
        accessibilityRole="button"
        accessibilityLabel="Scroll down"
      >
        <Ionicons
          name="chevron-down"
          size={Math.round(20 * scale)}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function SelectTableScreen() {
  const { styles, scale, compact, colors, isDark } = useScaledStyles();

  const params = useLocalSearchParams();
  const restaurant = params.restaurant ?? "Bakasuran Restaurant";
  const restaurantId = params.restaurant_id ?? params.restaurantId ?? 1;
  const bookingDate = String(params.booking_date ?? params.date ?? "");
  const bookingTime = String(params.booking_time ?? params.time ?? "");
  const endTime = String(params.end_time ?? "");
  const dateLabel = bookingDate || "Select date";
  const timeLabel = bookingTime || "Select time";
  const guests = Number(params.guest_count ?? params.guests ?? 2) || 2;
  const tablesParam = Array.isArray(params.tables)
    ? params.tables[0]
    : params.tables;
  let rawTables = [];
  try {
    rawTables = tablesParam ? JSON.parse(tablesParam) : [];
  } catch (error) {
    console.error("Unable to parse available tables:", error);
  }
  const allTables = useMemo(
    () => normalizeTables(rawTables, guests),
    [tablesParam, guests],
  );
  const guestLabel = `${guests} ${guests === 1 ? "Guest" : "Guests"}`;

  const [selectedId, setSelectedId] = useState(null);

  // Customer details sheet
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const scrollRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [layoutH, setLayoutH] = useState(0);

  // Pre-fill name / mobile / email from the logged-in customer's profile.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await getProfile();
        if (!active || isFailure(res) || res?.success === 9) return;

        const profile = res?.data?.user ?? res?.data ?? res?.user ?? {};
        const name = profile?.name ?? profile?.customer_name;
        const mobile =
          profile?.mobile ?? profile?.phone ?? profile?.customer_mobile;
        const email = profile?.email ?? profile?.customer_email;

        if (name) setCustomerName((current) => current || String(name));
        if (mobile) setCustomerMobile((current) => current || String(mobile));
        if (email) setCustomerEmail((current) => current || String(email));
      } catch (error) {
        console.log("PROFILE PREFILL ERROR:", error?.message);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const mainTables = allTables.filter((table) => !table.isWindow);
  const windowTables = allTables.filter((table) => table.isWindow);
  const canSelectTable = (table) =>
    table.status !== "booked" && table.seats >= guests;
  const effectiveSelectedId = allTables.some(
    (table) => table.id === selectedId && canSelectTable(table),
  )
    ? selectedId
    : allTables.find(canSelectTable)?.id;
  const selectedTable = allTables.find(
    (table) => table.id === effectiveSelectedId,
  );
  const mainRows = useMemo(() => chunk(mainTables, COLUMNS), [allTables]);
  const windowRows = useMemo(() => chunk(windowTables, COLUMNS), [allTables]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const openDetails = () => {
    if (!selectedTable) {
      Alert.alert("Select a table", "Please choose an available table first.");
      return;
    }

    if (!bookingDate || !bookingTime || !endTime) {
      Alert.alert(
        "Missing booking details",
        "Please go back and pick the date and time again.",
      );
      return;
    }

    setDetailsOpen(true);
  };

  const submitBooking = async () => {
    if (submitting || !selectedTable) return;

    const name = customerName.trim();
    const mobile = customerMobile.replace(/\D/g, "").slice(-10);
    const email = customerEmail.trim();

    if (!name) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert(
        "Invalid mobile number",
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    let result;
    try {
      result = await createRestaurantTableBooking({
        restaurant_id: restaurantId,
        restaurant_table_id: selectedTable.id,
        customer_name: name,
        customer_mobile: mobile,
        customer_email: email,
        booking_date: bookingDate,
        booking_time: bookingTime,
        end_time: endTime,
        guest_count: guests,
        special_requests: specialRequests,
      });
    } finally {
      setSubmitting(false);
    }

    if (result?.success === 9) {
      setDetailsOpen(false);
      router.push("/"); // adjust to your auth route
      return;
    }

    if (isFailure(result)) {
      Alert.alert(
        "Unable to book table",
        result?.message || "Please try again.",
      );
      return;
    }

    setDetailsOpen(false);
    router.replace("/my-bookings");
  };

  const Divider = () =>
    compact ? null : <View style={styles.summaryDivider} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={Math.round(29 * scale)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Table</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.subtitle}>
        {restaurant} • {dateLabel} • {timeLabel} • {guestLabel}
      </Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendBox, { backgroundColor: colors.textMuted }]}
          />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {/* Floor map */}
      <View style={styles.mapCard}>
        {allTables.length === 0 ? (
          <View style={styles.emptyTables}>
            <Text style={styles.emptyTablesText}>
              No available tables were returned for this booking.
            </Text>
          </View>
        ) : null}

        <View style={styles.mapScrollArea}>
          <ScrollRail
            scrollRef={scrollRef}
            scrollY={scrollY}
            contentH={contentH}
            layoutH={layoutH}
          />

          <ScrollView
            ref={scrollRef}
            style={styles.gridScroll}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
            onLayout={(e) => setLayoutH(e.nativeEvent.layout.height)}
            onContentSizeChange={(_, h) => setContentH(h)}
          >
            {mainRows.map((row, i) => (
              <TableRow
                key={`main-${i}`}
                row={row}
                selectedId={effectiveSelectedId}
                guests={guests}
                onSelect={setSelectedId}
              />
            ))}
          </ScrollView>

          <ScrollRail
            scrollRef={scrollRef}
            scrollY={scrollY}
            contentH={contentH}
            layoutH={layoutH}
          />
        </View>

        {/* Window view zone */}
        {windowRows.length ? (
          <View style={styles.windowZone}>
            <View style={styles.windowLabel}>
              <Ionicons
                name="grid-outline"
                size={Math.round(20 * scale)}
                color={colors.text}
              />
              <Text style={styles.windowLabelText}>Window View</Text>
            </View>

            {windowRows.map((row, i) => (
              <TableRow
                key={`window-${i}`}
                row={row}
                selectedId={effectiveSelectedId}
                guests={guests}
                onSelect={setSelectedId}
              />
            ))}
          </View>
        ) : null}
      </View>

      {/* Selected summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          {selectedTable
            ? `Selected Table: ${selectedTable.label} (${selectedTable.seats} Seats)`
            : "No table selected"}
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={Math.round(24 * scale)}
              color={colors.text}
            />
            <Text style={styles.summaryText}>{dateLabel}</Text>
          </View>

          <Divider />

          <View style={styles.summaryItem}>
            <Ionicons
              name="time-outline"
              size={Math.round(24 * scale)}
              color={colors.text}
            />
            <Text style={styles.summaryText}>{timeLabel}</Text>
          </View>

          <Divider />

          <View style={styles.summaryItem}>
            <Ionicons
              name="people-outline"
              size={Math.round(24 * scale)}
              color={colors.text}
            />
            <Text style={styles.summaryText}>{guestLabel}</Text>
          </View>
        </View>
      </View>

      {/* Confirm */}
      <TouchableOpacity
        style={[styles.confirmButton, !selectedTable && styles.confirmDisabled]}
        activeOpacity={0.85}
        onPress={openDetails}
        disabled={!selectedTable}
        accessibilityRole="button"
        accessibilityLabel="Confirm booking"
      >
        <MaterialCommunityIcons
          name="calendar-check-outline"
          size={Math.round(28 * scale)}
          color={colors.white}
        />
        <Text style={styles.confirmText}>Confirm Booking</Text>
        <Ionicons
          name="chevron-forward"
          size={Math.round(28 * scale)}
          color={colors.white}
        />
      </TouchableOpacity>

      {/* Customer details sheet */}
      <Modal
        visible={detailsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!submitting) setDetailsOpen(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalFlex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              if (!submitting) setDetailsOpen(false);
            }}
          >
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Your Details</Text>
              <Text style={styles.modalSubtitle}>
                {selectedTable
                  ? `Table ${selectedTable.label} • ${dateLabel} • ${timeLabel} • ${guestLabel}`
                  : ""}
              </Text>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Full name"
                  placeholderTextColor="#666666"
                  autoCapitalize="words"
                  editable={!submitting}
                />

                <Text style={styles.fieldLabel}>Mobile</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={customerMobile}
                  onChangeText={setCustomerMobile}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#666666"
                  keyboardType="phone-pad"
                  maxLength={13}
                  editable={!submitting}
                />

                <Text style={styles.fieldLabel}>Email (optional)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#666666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                />

                <Text style={styles.fieldLabel}>
                  Special requests (optional)
                </Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputMultiline]}
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  placeholder="e.g. Window seating"
                  placeholderTextColor="#666666"
                  multiline
                  editable={!submitting}
                />
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.sheetButton,
                  submitting && styles.confirmDisabled,
                ]}
                activeOpacity={0.85}
                onPress={submitBooking}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Book table"
              >
                <Text style={styles.sheetButtonText}>
                  {submitting ? "Booking..." : "Book Table"}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(k, colors) {
  const z = (n) => Math.round(n * k);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: z(16),
      width: "100%",
      maxWidth: MAX_WIDTH,
      alignSelf: "center",
    },

    header: {
      height: z(58),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    backButton: {
      width: z(43),
      height: z(43),
      borderRadius: z(22),
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      color: colors.text,
      fontSize: z(21),
      fontWeight: "800",
    },

    headerSpacer: { width: z(43) },

    subtitle: {
      color: colors.textSecondary,
      fontSize: Math.max(z(14), 11),
      lineHeight: Math.max(z(20), 16),
      textAlign: "center",
      paddingHorizontal: 4,
      marginBottom: z(16),
    },

    legend: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginBottom: z(14),
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: z(8),
    },

    legendBox: {
      width: z(24),
      height: z(24),
      borderRadius: z(7),
    },

    legendText: {
      color: colors.text,
      fontSize: Math.max(z(14), 10),
      fontWeight: "600",
    },

    mapCard: {
      flex: 1,
      minHeight: 230,
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: z(24),
      paddingHorizontal: z(10),
      paddingTop: z(14),
      paddingBottom: z(12),
      marginBottom: z(12),
    },

    emptyTables: {
      flex: 1,
      minHeight: 100,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: z(16),
    },

    emptyTablesText: {
      color: colors.textSecondary,
      fontSize: Math.max(z(15), 11),
      textAlign: "center",
    },

    mapScrollArea: {
      flex: 1,
      flexDirection: "row",
      alignItems: "stretch",
      minHeight: 90,
    },

    gridScroll: {
      flex: 1,
    },

    gridContent: {
      paddingVertical: 4,
      paddingHorizontal: 4,
    },

    /* Scroll rails */
    rail: {
      width: z(24),
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 2,
    },

    railTrack: {
      flex: 1,
      width: Math.max(z(8), 5),
      marginVertical: z(8),
      borderRadius: 4,
      backgroundColor: colors.backgroundElement,
      overflow: "hidden",
    },

    railThumb: {
      position: "absolute",
      left: 0,
      right: 0,
      borderRadius: 4,
      backgroundColor: colors.textMuted,
    },

    /* Tiles */
    tileRow: {
      flexDirection: "row",
      gap: z(10),
      marginBottom: z(10),
    },

    tileSpacer: { flex: 1 },

    tile: {
      flex: 1,
      minWidth: 0,
      aspectRatio: 1.05,
      borderRadius: z(14),
      backgroundColor: colors.backgroundElement,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    tileAvailable: {
      borderColor: "rgba(0,200,107,0.35)",
    },

    tileBooked: {
      backgroundColor: colors.backgroundElement,
      borderColor: colors.border,
    },

    tileTooSmall: {
      opacity: 0.4,
    },

    tileSelected: {
      backgroundColor: colors.primary,
      borderColor: "#FF5A62",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 12,
      elevation: 10,
    },

    tileId: {
      color: colors.text,
      fontSize: Math.max(z(20), 13),
      fontWeight: "800",
      marginBottom: z(5),
    },

    tileIdDisabled: {
      color: colors.textMuted,
    },

    tileSeats: {
      flexDirection: "row",
      alignItems: "center",
      gap: z(4),
    },

    tileSeatsText: {
      fontSize: Math.max(z(18), 12),
      fontWeight: "600",
    },

    /* Window zone */
    windowZone: {
      marginTop: z(22),
      paddingTop: z(22),
      paddingHorizontal: z(10),
      paddingBottom: 0,
      borderRadius: z(20),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundElement,
    },

    windowLabel: {
      position: "absolute",
      top: -z(16),
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: z(8),
      paddingHorizontal: z(14),
      paddingVertical: z(6),
      borderRadius: z(16),
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.border,
    },

    windowLabelText: {
      color: colors.text,
      fontSize: Math.max(z(15), 11),
      fontWeight: "600",
    },

    /* Summary */
    summaryCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: z(22),
      paddingHorizontal: z(16),
      paddingVertical: z(14),
      marginBottom: z(12),
    },

    summaryTitle: {
      color: colors.text,
      fontSize: Math.max(z(20), 13),
      fontWeight: "800",
      marginBottom: z(14),
    },

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      columnGap: z(8),
      rowGap: z(8),
    },

    summaryItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: z(6),
    },

    summaryText: {
      color: colors.textSecondary,
      fontSize: Math.max(z(15), 10),
      fontWeight: "500",
    },

    summaryDivider: {
      width: 1,
      height: z(26),
      backgroundColor: colors.border,
    },

    /* Confirm */
    confirmButton: {
      minHeight: Math.max(z(68), 48),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: z(22),
      backgroundColor: colors.primary,
      borderRadius: 999,
      marginBottom: z(8),
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 8,
    },

    confirmDisabled: {
      opacity: 0.45,
    },

    confirmText: {
      color: colors.white,
      fontSize: Math.max(z(22), 15),
      fontWeight: "800",
    },

    /* Details sheet */
    modalFlex: {
      flex: 1,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },

    modalSheet: {
      maxHeight: "90%",
      width: "100%",
      maxWidth: MAX_WIDTH,
      alignSelf: "center",
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: 28,
    },

    modalHandle: {
      alignSelf: "center",
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginBottom: 18,
    },

    modalTitle: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "800",
    },

    modalSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 5,
      marginBottom: 16,
    },

    fieldLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 6,
      marginTop: 12,
    },

    fieldInput: {
      minHeight: 46,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 16,
    },

    fieldInputMultiline: {
      minHeight: 76,
      textAlignVertical: "top",
    },

    sheetButton: {
      minHeight: 56,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 999,
      marginTop: 20,
    },

    sheetButtonText: {
      color: colors.white,
      fontSize: 18,
      fontWeight: "800",
    },
  });
}
