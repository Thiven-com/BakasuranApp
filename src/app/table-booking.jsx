import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#050505",
  card: "#101010",
  tile: "#141414",
  border: "#292929",
  red: "#FF101C",
  white: "#FFFFFF",
  gray: "#A0A0A0",
  booked: "#6B6B6B",
  green: "#00C86B",
};

/* Replace with data from your API.
   status: "available" | "booked"  (selected is handled by state) */
const MAIN_TABLES = [
  { id: "T1", seats: 4, status: "available" },
  { id: "T2", seats: 2, status: "available" },
  { id: "T3", seats: 4, status: "available" },
  { id: "T4", seats: 6, status: "available" },
  { id: "T5", seats: 4, status: "available" },
  { id: "T6", seats: 4, status: "available" },
  { id: "T7", seats: 2, status: "available" },
  { id: "T8", seats: 4, status: "available" },
  { id: "T9", seats: 6, status: "available" },
  { id: "T10", seats: 4, status: "available" },
  { id: "T11", seats: 4, status: "available" },
  { id: "T12", seats: 2, status: "available" },
];

const WINDOW_TABLES = [
  { id: "T13", seats: 2, status: "available" },
  { id: "T14", seats: 4, status: "available" },
  { id: "T15", seats: 4, status: "available" },
  { id: "T16", seats: 6, status: "available" },
];

const COLUMNS = 4;
const MAX_WIDTH = 480;
const BASE_WIDTH = 390; // width the design was drawn for

const chunk = (list, size) => {
  const rows = [];
  for (let i = 0; i < list.length; i += size)
    rows.push(list.slice(i, i + size));
  return rows;
};

/* Every size scales with screen width, so the layout works on a phone,
   a narrow web preview, and a desktop browser alike. */
function useScaledStyles() {
  const { width } = useWindowDimensions();
  const scale = Math.min(
    Math.max(Math.min(width, MAX_WIDTH) / BASE_WIDTH, 0.6),
    1,
  );
  const compact = scale < 0.85;
  const styles = useMemo(() => createStyles(scale), [scale]);
  return { styles, scale, compact };
}

/* Defined outside the screen so it isn't re-created on every render. */
function TableTile({ table, selected, tooSmall, onPress }) {
  const { styles, scale } = useScaledStyles();
  const booked = table.status === "booked";
  const disabled = booked || tooSmall;

  const seatColor = selected
    ? COLORS.white
    : disabled
      ? COLORS.booked
      : COLORS.gray;

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
      accessibilityLabel={`Table ${table.id}, ${table.seats} seats, ${
        booked
          ? "booked"
          : tooSmall
            ? "too small for your party"
            : selected
              ? "selected"
              : "available"
      }`}
    >
      <Text style={[styles.tileId, disabled && styles.tileIdDisabled]}>
        {table.id}
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
  const { styles, scale } = useScaledStyles();
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
          color={COLORS.gray}
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
          color={COLORS.gray}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function SelectTableScreen() {
  const { styles, scale, compact } = useScaledStyles();

  const params = useLocalSearchParams();
  const restaurant = params.restaurant ?? "Bakasuran Restaurant";
  const dateLabel = params.date ?? "26 Oct 2026";
  const timeLabel = params.time ?? "08:00 PM";
  const guests = Number(params.guests ?? 2) || 2;
  const guestLabel = `${guests} ${guests === 1 ? "Guest" : "Guests"}`;

  const [selectedId, setSelectedId] = useState("T6");

  const scrollRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [layoutH, setLayoutH] = useState(0);

  const allTables = useMemo(() => [...MAIN_TABLES, ...WINDOW_TABLES], []);
  const selectedTable = allTables.find((t) => t.id === selectedId);

  const mainRows = useMemo(() => chunk(MAIN_TABLES, COLUMNS), []);
  const windowRows = useMemo(() => chunk(WINDOW_TABLES, COLUMNS), []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const confirmBooking = () => {
    if (!selectedTable) {
      Alert.alert("Select a table", "Please choose an available table first.");
      return;
    }

    Alert.alert(
      "Confirm Booking",
      `${restaurant}\nTable ${selectedTable.id} (${selectedTable.seats} seats)\n${dateLabel} • ${timeLabel}\n${guestLabel}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // Call your booking API here, e.g.:
            // createBooking({ restaurant, tableId: selectedTable.id, date: dateLabel, time: timeLabel, guests });
          },
        },
      ],
    );
  };

  const Divider = () =>
    compact ? null : <View style={styles.summaryDivider} />;

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
          <Ionicons
            name="chevron-back"
            size={Math.round(29 * scale)}
            color={COLORS.white}
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
          <View style={[styles.legendBox, { backgroundColor: COLORS.green }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.red }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendBox, { backgroundColor: COLORS.booked }]}
          />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {/* Floor map */}
      <View style={styles.mapCard}>
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
                selectedId={selectedId}
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
        <View style={styles.windowZone}>
          <View style={styles.windowLabel}>
            <Ionicons
              name="grid-outline"
              size={Math.round(20 * scale)}
              color={COLORS.white}
            />
            <Text style={styles.windowLabelText}>Window View</Text>
          </View>

          {windowRows.map((row, i) => (
            <TableRow
              key={`window-${i}`}
              row={row}
              selectedId={selectedId}
              guests={guests}
              onSelect={setSelectedId}
            />
          ))}
        </View>
      </View>

      {/* Selected summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          {selectedTable
            ? `Selected Table: ${selectedTable.id} (${selectedTable.seats} Seats)`
            : "No table selected"}
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={Math.round(24 * scale)}
              color={COLORS.white}
            />
            <Text style={styles.summaryText}>{dateLabel}</Text>
          </View>

          <Divider />

          <View style={styles.summaryItem}>
            <Ionicons
              name="time-outline"
              size={Math.round(24 * scale)}
              color={COLORS.white}
            />
            <Text style={styles.summaryText}>{timeLabel}</Text>
          </View>

          <Divider />

          <View style={styles.summaryItem}>
            <Ionicons
              name="people-outline"
              size={Math.round(24 * scale)}
              color={COLORS.white}
            />
            <Text style={styles.summaryText}>{guestLabel}</Text>
          </View>
        </View>
      </View>

      {/* Confirm */}
      <TouchableOpacity
        style={[styles.confirmButton, !selectedTable && styles.confirmDisabled]}
        activeOpacity={0.85}
        onPress={confirmBooking}
        disabled={!selectedTable}
        accessibilityRole="button"
        accessibilityLabel="Confirm booking"
      >
        <MaterialCommunityIcons
          name="calendar-check-outline"
          size={Math.round(28 * scale)}
          color={COLORS.white}
        />
        <Text style={styles.confirmText}>Confirm Booking</Text>
        <Ionicons
          name="chevron-forward"
          size={Math.round(28 * scale)}
          color={COLORS.white}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function createStyles(k) {
  const z = (n) => Math.round(n * k);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
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
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      color: COLORS.white,
      fontSize: z(21),
      fontWeight: "800",
    },

    headerSpacer: { width: z(43) },

    subtitle: {
      color: COLORS.gray,
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
      color: COLORS.white,
      fontSize: Math.max(z(14), 10),
      fontWeight: "600",
    },

    mapCard: {
      flex: 1,
      minHeight: 230,
      backgroundColor: "#0A0A0A",
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: z(24),
      paddingHorizontal: z(10),
      paddingTop: z(14),
      paddingBottom: z(12),
      marginBottom: z(12),
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
      backgroundColor: "#1C1C1C",
      overflow: "hidden",
    },

    railThumb: {
      position: "absolute",
      left: 0,
      right: 0,
      borderRadius: 4,
      backgroundColor: "#5A5A5A",
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
      backgroundColor: COLORS.tile,
      borderWidth: 1.5,
      borderColor: COLORS.border,
      alignItems: "center",
      justifyContent: "center",
    },

    tileAvailable: {
      borderColor: "rgba(0,200,107,0.35)",
    },

    tileBooked: {
      backgroundColor: "#232323",
      borderColor: "#333333",
    },

    tileTooSmall: {
      opacity: 0.4,
    },

    tileSelected: {
      backgroundColor: COLORS.red,
      borderColor: "#FF5A62",
      shadowColor: COLORS.red,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 12,
      elevation: 10,
    },

    tileId: {
      color: COLORS.white,
      fontSize: Math.max(z(20), 13),
      fontWeight: "800",
      marginBottom: z(5),
    },

    tileIdDisabled: {
      color: COLORS.booked,
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
      borderColor: COLORS.border,
      backgroundColor: "#111111",
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
      backgroundColor: "#141414",
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    windowLabelText: {
      color: COLORS.white,
      fontSize: Math.max(z(15), 11),
      fontWeight: "600",
    },

    /* Summary */
    summaryCard: {
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: z(22),
      paddingHorizontal: z(16),
      paddingVertical: z(14),
      marginBottom: z(12),
    },

    summaryTitle: {
      color: COLORS.white,
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
      color: COLORS.gray,
      fontSize: Math.max(z(15), 10),
      fontWeight: "500",
    },

    summaryDivider: {
      width: 1,
      height: z(26),
      backgroundColor: "#3A3A3A",
    },

    /* Confirm */
    confirmButton: {
      minHeight: Math.max(z(68), 48),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: z(22),
      backgroundColor: COLORS.red,
      borderRadius: 999,
      marginBottom: z(8),
      shadowColor: COLORS.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 8,
    },

    confirmDisabled: {
      opacity: 0.45,
    },

    confirmText: {
      color: COLORS.white,
      fontSize: Math.max(z(22), 15),
      fontWeight: "800",
    },
  });
}
