import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../../hooks/use-theme";

const TOKEN_KEYS = ["access_token", "accessToken", "authToken", "token"];

export default function SplashScreen() {
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    let navigationStarted = false;

    // Native driver is supported on iOS and Android.
    // Use the JS driver on web to avoid the native-module warning.
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      }),
    );

    animation.start();

    const checkLoginStatus = async () => {
      try {
        // Keep the splash screen visible for 3 seconds.
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!mounted || navigationStarted) return;

        let token = null;

        // Check supported token keys.
        for (const key of TOKEN_KEYS) {
          const storedToken = await AsyncStorage.getItem(key);

          if (storedToken && storedToken.trim() !== "") {
            token = storedToken;
            break;
          }
        }

        if (!mounted || navigationStarted) return;

        console.log("Splash token found:", token ? "YES" : "NO");

        navigationStarted = true;

        if (token) {
          console.log("Splash token found: YES");
          router.replace("/(tabs)/HomeScreen");
        } else {
          console.log("Splash token found: NO");
          router.replace("/(auth)/Onboardingscreen");
        }
      } catch (error) {
        console.error("Splash login check error:", error);

        if (!mounted || navigationStarted) return;

        navigationStarted = true;
        router.replace("/(auth)/Onboardingscreen");
      }
    };

    checkLoginStatus();

    return () => {
      mounted = false;
      animation.stop();
    };
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* SPLASH BACKGROUND IMAGE */}
      <Image
        source={require("../../../assets/images/splash.png")}
        style={styles.splashImage}
        resizeMode="cover"
      />

      {/* LOADING INDICATOR */}
      <View style={styles.loadingContainer}>
        <View style={styles.loaderWrapper}>
          <View style={styles.loaderBackground} />

          <Animated.View
            style={[
              styles.loaderArc,
              {
                transform: [{ rotate }],
              },
            ]}
          />

          <View style={styles.loaderInner}>
            <ActivityIndicator size="small" color="#FF2A00" />
          </View>
        </View>

        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      justifyContent: "center",
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
      backgroundColor: colors.surface,
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
      backgroundColor: colors.background,
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      color: colors.white ?? "#FFFFFF",
      fontSize: 13,
      fontWeight: "500",
      marginTop: 10,
      letterSpacing: 0.3,
    },
  });
