import {
  ImageBackground,
  StyleSheet,
  Text,
  View
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const OfferBanner = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/cravings_offer.jpg")}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.overlay} />

        <View style={styles.content}>
          {/*<Text style={styles.eyebrow}>FEAST LIKE A</Text>
          <Text style={styles.title}>BAKASURAN</Text>
          <Text style={styles.subtitle}>Authentic flavours.{"\n"}Unbeatable offers.</Text>*/}
        </View>

        <View style={styles.offerCircle}>
          <Text style={styles.circleSmall}>UP TO</Text>
          <Text style={styles.circleValue}>50%</Text>
          <Text style={styles.circleOff}>OFF</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

export default OfferBanner;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 18,
    backgroundColor: "#060808",
  },

  banner: {
    width: "100%",
    height: 190,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  bannerImage: {
    borderRadius: 22,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 5, 5, 0.42)",
  },

  content: {
    position: "absolute",
    left: 18,
    top: 18,
    width: "62%",
    zIndex: 2,
  },

  eyebrow: {
    color: "#f3d2d2",
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  title: {
    color: Colors.white,
    fontFamily: Fonts.extraBold,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 40,
    textTransform: "uppercase",
  },

  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.9)",
    fontFamily: Fonts.medium,
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 20,
  },

  button: {
    marginTop: 18,
    alignSelf: "flex-start",
    height: 40,
    paddingHorizontal: 18,
    paddingRight: 14,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 13,
    letterSpacing: 0.6,
    marginRight: 7,
  },

  offerCircle: {
    position: "absolute",
    right: 16,
    top: 18,
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7d07b",
    borderWidth: 4,
    borderColor: "#382315",
    transform: [{ rotate: "8deg" }],
    zIndex: 2,
  },

  circleSmall: {
    color: "#5b2a08",
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },

  circleValue: {
    color: "#321b0e",
    fontFamily: Fonts.extraBold,
    fontSize: 32,
    lineHeight: 32,
  },

  circleOff: {
    color: "#321b0e",
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
});
