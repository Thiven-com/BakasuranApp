import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const HomeHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="wifi" size={14} color={Colors.white} />
          <Ionicons name="cellular" size={14} color={Colors.white} />
          <Ionicons name="battery-full" size={18} color={Colors.white} />
        </View>
      </View>

      <View style={styles.headerRow}>
        <View style={styles.brandWrap}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.locationPanel}>
          <View style={styles.pinDot} />
          <Text style={styles.locationName}>Jakkasandra</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.white} />
        </View>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons
            name="notifications-outline"
            size={18}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="location-sharp" size={16} color={Colors.primary} />
        <Text style={styles.addressText}>Sector V, Koramangala, Bengaluru</Text>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: "#060808",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  time: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 20,
    letterSpacing: -0.5,
  },

  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  brandWrap: {
    flex: 1,
  },

  brandText: {
    color: Colors.white,
    fontFamily: Fonts.extraBold,
    fontSize: 30,
    letterSpacing: -1.5,
    lineHeight: 32,
    textTransform: "uppercase",
  },

  brandMeta: {
    marginTop: 2,
  },

  brandMetaText: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontSize: 9,
    letterSpacing: 1.1,
  },

  locationPanel: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 170,
  },
  logo: {
    width: 150,
    height: 58,
  },

  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    marginRight: 7,
    shadowColor: Colors.primary,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  locationName: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    marginRight: 3,
  },

  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: 8,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 2,
    paddingBottom: 10,
  },

  addressText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginLeft: 6,
  },
});
