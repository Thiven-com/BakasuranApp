import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Fonts from "../constants/Fonts";

const RED = "#FF2028";
const BG = "#050505";

export default function EnableLocationScreen() {
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/HomeScreen");
    }
  };

  const continueHome = () => {
    router.replace("/(tabs)/HomeScreen");
  };

  const allowLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Enable location permission in your device settings to find nearby restaurants.",
          [
            { text: "Maybe Later", onPress: continueHome },
            {
              text: "Try Again",
              onPress: () => {
                setLoading(false);
                allowLocation();
              },
            },
          ],
        );
        return;
      }

      // Permission granted. Continue to the home screen.
      // You can retrieve the coordinates here when needed.
      continueHome();
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "We couldn't request location permission. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.time}>9:41</Text>

          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={19} color="#FFFFFF" />
            <Ionicons name="wifi" size={21} color="#FFFFFF" />
            <Ionicons name="battery-full-outline" size={25} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Map illustration */}
          <View style={styles.mapContainer}>
            <View style={styles.mapBackground} />

            {/* Abstract city streets */}
            <View style={[styles.road, styles.roadOne]} />
            <View style={[styles.road, styles.roadTwo]} />
            <View style={[styles.road, styles.roadThree]} />
            <View style={[styles.road, styles.roadFour]} />
            <View style={[styles.road, styles.roadFive]} />
            <View style={[styles.road, styles.roadSix]} />
            <View style={[styles.road, styles.roadSeven]} />
            <View style={[styles.road, styles.roadEight]} />
            <View style={[styles.road, styles.roadNine]} />
            <View style={[styles.road, styles.roadTen]} />

            {/* City blocks */}
            <View style={[styles.cityBlock, styles.blockOne]} />
            <View style={[styles.cityBlock, styles.blockTwo]} />
            <View style={[styles.cityBlock, styles.blockThree]} />
            <View style={[styles.cityBlock, styles.blockFour]} />
            <View style={[styles.cityBlock, styles.blockFive]} />
            <View style={[styles.cityBlock, styles.blockSix]} />

            {/* Location glow */}
            <View style={styles.locationGlowOuter} />
            <View style={styles.locationGlowInner} />

            {/* Pin */}
            <View style={styles.pinWrapper}>
              <LinearGradient
                colors={["#FF3038", "#F00009"]}
                style={styles.pin}
              >
                <View style={styles.pinCenter}>
                  <View style={styles.pinCenterDot} />
                </View>
              </LinearGradient>
            </View>

            {/* Pin location point */}
            <View style={styles.locationPointOuter}>
              <View style={styles.locationPointInner} />
            </View>

            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
              activeOpacity={0.75}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            <LinearGradient
              colors={["rgba(5,5,5,0)", "rgba(5,5,5,0.2)", BG]}
              style={styles.mapFade}
              pointerEvents="none"
            />
          </View>

          {/* Text content */}
          <View style={styles.content}>
            <Text style={styles.title}>Enable Location</Text>

            <Text style={styles.description}>
              Allow BAKASURAN to use your location to find nearby restaurants
              and faster delivery.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.allowButton}
              onPress={allowLocation}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#FF1521", "#FF0010"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.allowGradient}
              >
                <Ionicons name="navigate" size={26} color="#FFFFFF" />

                <Text style={styles.allowText}>
                  {loading ? "Please wait..." : "Allow Location"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={continueHome}
              activeOpacity={0.75}
            >
              <Text style={styles.laterText}>Maybe Later</Text>
            </TouchableOpacity>

            <Text style={styles.privacyText}>
              Your location helps us discover food near you.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    height: 58,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },

  time: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  mapContainer: {
    height: 440,
    width: "100%",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#101010",
  },

  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111111",
  },

  road: {
    position: "absolute",
    backgroundColor: "#303030",
    borderColor: "#242424",
    borderWidth: 1,
  },

  roadOne: {
    width: 1200,
    height: 18,
    top: 80,
    left: -100,
    transform: [{ rotate: "-37deg" }],
  },

  roadTwo: {
    width: 1100,
    height: 22,
    top: 210,
    left: -100,
    transform: [{ rotate: "35deg" }],
  },

  roadThree: {
    width: 950,
    height: 15,
    top: 300,
    left: -100,
    transform: [{ rotate: "-25deg" }],
  },

  roadFour: {
    width: 800,
    height: 18,
    top: 140,
    left: -100,
    transform: [{ rotate: "55deg" }],
  },

  roadFive: {
    width: 850,
    height: 14,
    top: 250,
    left: -100,
    transform: [{ rotate: "-58deg" }],
  },

  roadSix: {
    width: 700,
    height: 12,
    top: 30,
    left: 100,
    transform: [{ rotate: "68deg" }],
  },

  roadSeven: {
    width: 900,
    height: 14,
    top: 350,
    left: -150,
    transform: [{ rotate: "15deg" }],
  },

  roadEight: {
    width: 700,
    height: 12,
    top: 170,
    left: 70,
    transform: [{ rotate: "-70deg" }],
  },

  roadNine: {
    width: 700,
    height: 10,
    top: 100,
    left: 80,
    transform: [{ rotate: "18deg" }],
  },

  roadTen: {
    width: 800,
    height: 12,
    top: 280,
    left: -120,
    transform: [{ rotate: "75deg" }],
  },

  cityBlock: {
    position: "absolute",
    backgroundColor: "#191919",
    borderWidth: 1,
    borderColor: "#242424",
  },

  blockOne: {
    width: 75,
    height: 65,
    top: 70,
    left: 40,
    transform: [{ rotate: "-37deg" }],
  },

  blockTwo: {
    width: 90,
    height: 75,
    top: 160,
    right: 45,
    transform: [{ rotate: "35deg" }],
  },

  blockThree: {
    width: 70,
    height: 80,
    top: 290,
    left: 40,
    transform: [{ rotate: "-25deg" }],
  },

  blockFour: {
    width: 85,
    height: 70,
    top: 40,
    right: 80,
    transform: [{ rotate: "35deg" }],
  },

  blockFive: {
    width: 90,
    height: 65,
    top: 300,
    right: 30,
    transform: [{ rotate: "-30deg" }],
  },

  blockSix: {
    width: 70,
    height: 80,
    top: 210,
    left: 15,
    transform: [{ rotate: "35deg" }],
  },

  locationGlowOuter: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255, 0, 16, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 32, 40, 0.12)",
    alignSelf: "center",
    top: 130,
  },

  locationGlowInner: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 0, 16, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 32, 40, 0.2)",
    alignSelf: "center",
    top: 175,
  },

  pinWrapper: {
    position: "absolute",
    alignSelf: "center",
    top: 130,
    zIndex: 5,
  },

  pin: {
    width: 145,
    height: 145,
    borderRadius: 73,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
    borderWidth: 2,
    borderColor: "#FF4850",
    transform: [{ rotate: "45deg" }],
    borderBottomRightRadius: 8,
    elevation: 18,
    shadowColor: RED,
    shadowOpacity: 0.55,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
  },

  pinCenter: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#8F0008",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-45deg" }],
    borderWidth: 3,
    borderColor: "#5B0005",
  },

  pinCenterDot: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EEEEEE",
  },

  locationPointOuter: {
    position: "absolute",
    alignSelf: "center",
    top: 340,
    width: 44,
    height: 28,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF2028",
    zIndex: 4,
  },

  locationPointInner: {
    width: 18,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    position: "absolute",
    top: 22,
    left: 22,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(20,20,20,0.9)",
    borderWidth: 1,
    borderColor: "#383838",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
  },

  mapFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 125,
  },

  content: {
    paddingHorizontal: 24,
    marginTop: -2,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontFamily: Fonts.bold,
    fontSize: 36,
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: -0.8,
  },

  description: {
    color: "#B8B8B8",
    fontFamily: Fonts.regular,
    fontSize: 18,
    lineHeight: 30,
    textAlign: "center",
    maxWidth: 360,
  },

  actions: {
    paddingHorizontal: 24,
    marginTop: 34,
  },

  allowButton: {
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 18,
  },

  allowGradient: {
    minHeight: 78,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 18,
  },

  allowText: {
    color: "#FFFFFF",
    fontFamily: Fonts.semiBold,
    fontSize: 21,
  },

  laterButton: {
    minHeight: 76,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#858585",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  laterText: {
    color: "#FFFFFF",
    fontFamily: Fonts.semiBold,
    fontSize: 21,
  },

  privacyText: {
    marginTop: 20,
    textAlign: "center",
    color: "#777777",
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
