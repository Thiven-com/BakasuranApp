import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const HomeHeader = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Location and Notification */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.locationPanel}
          activeOpacity={0.8}
          onPress={() => router.push("/enable-location")}
        >
          <Ionicons name="location-sharp" size={17} color={colors.primary} />

          <View style={styles.locationTextWrap}>
            <Text style={styles.locationLabel}>DELIVERING TO</Text>

            <View style={styles.locationNameRow}>
              <Text style={styles.locationName}>Jakkasandra</Text>

              <Ionicons
                name="chevron-down"
                size={14}
                color={colors.textPrimary}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Notification Button on Right */}
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.8}
          onPress={() => router.push("/notifications")}
          accessibilityLabel="Notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Full Address */}
      <View style={styles.addressRow}>
        <Text style={styles.addressText}>Sector V, Koramangala, Bengaluru</Text>
      </View>
    </View>
  );
};

export default HomeHeader;

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: 16,
      paddingTop: 8,
      backgroundColor: colors.background,
    },

    topRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    locationPanel: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingVertical: 5,
      gap: 8,
      marginRight: 12,
    },

    locationTextWrap: {
      flex: 1,
      justifyContent: "center",
    },

    locationLabel: {
      color: colors.textMuted,
      fontFamily: Fonts.medium,
      fontSize: 9,
      letterSpacing: 1,
      marginBottom: 2,
    },

    locationNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    locationName: {
      color: colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 19,
    },

    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card ?? "#201f1f",
    },

    addressRow: {
      paddingLeft: 25,
      paddingBottom: 12,
      marginTop: 2,
    },

    addressText: {
      color: colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 15,
    },
  });
