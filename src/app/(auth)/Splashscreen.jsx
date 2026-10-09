import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function SplashScreen() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Circular loader animation
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    // Go to onboarding after 10 seconds
    const timer = setTimeout(() => {
      router.replace("/(auth)/Onboardingscreen");
    }, 10000);

    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />

      {/* REAL SPLASH IMAGE */}
      <Image
        source={require("../../../assets/images/splash.png")}
        style={styles.splashImage}
        resizeMode="cover"
      />

      {/* CUSTOM LOADER */}
      <View style={styles.loadingContainer}>
        <View style={styles.loaderWrapper}>
          {/* Dark circular background */}
          <View style={styles.loaderBackground} />

          {/* Rotating red/orange arc */}
          <Animated.View
            style={[
              styles.loaderArc,
              {
                transform: [{ rotate }],
              },
            ]}
          />

          {/* Inner dark circle */}
          <View style={styles.loaderInner} />
        </View>

        <Text style={styles.loadingText}>
          Loading Deliciousness...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  splashImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    width: "100%",
    height: "100%",
  },

  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 38,

    alignItems: "center",
  },

  loaderWrapper: {
    width: 48,
    height: 48,

    justifyContent: "center",
    alignItems: "center",

    position: "relative",
  },

  loaderBackground: {
    position: "absolute",

    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: "#171717",
  },

  loaderArc: {
    position: "absolute",

    width: 44,
    height: 44,

    borderRadius: 22,

    borderWidth: 4,

    borderColor: "transparent",

    borderTopColor: "#FF2A00",
    borderRightColor: "#FF4D00",
  },

  loaderInner: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "#111111",

    position: "absolute",
  },

  loadingText: {
    color: "#FFFFFF",

    fontSize: 12,
    fontWeight: "500",

    marginTop: 10,

    letterSpacing: 0.2,
  },
});