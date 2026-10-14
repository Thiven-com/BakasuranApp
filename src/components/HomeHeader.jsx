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
      {/* Centered logo */}
      {/*<View style={styles.headerRow}>
        <View style={styles.sideSpace} />

        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>*/}

      {/* Location */}
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

      {/* Full address */}
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

    headerRow: {
      height: 66,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      marginBottom: 8,
    },

    sideSpace: {
      width: 40,
    },

    logo: {
      position: "absolute",
      width: 180,
      height: 64,
      alignSelf: "center",
      left: 0,
      right: 0,
      marginHorizontal: "auto",
    },

    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    locationPanel: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingVertical: 5,
      gap: 8,
    },

    locationTextWrap: {
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
