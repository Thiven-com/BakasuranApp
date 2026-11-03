import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";
import { login } from "../../utils/Function";

const MAX_WIDTH = 480;
const BASE_WIDTH = 390;

// Soft glow made from stacked translucent circles (no extra packages needed)
const Glow = ({ size, style, alpha = 0.07, layers = 7 }) => (
  <View pointerEvents="none" style={[{ position: "absolute" }, style]}>
    {Array.from({ length: layers }).map((_, i) => {
      const d = size * (1 - i / layers);
      return (
        <View
          key={i}
          style={{
            position: "absolute",
            width: d,
            height: d,
            borderRadius: d / 2,
            left: (size - d) / 2,
            top: (size - d) / 2,
            backgroundColor: `rgba(255,20,0,${alpha})`,
          }}
        />
      );
    })}
  </View>
);

export default function LoginScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const s = Math.min(width, MAX_WIDTH) / BASE_WIDTH; // responsive scale
  const styles = useMemo(() => createStyles(colors, s), [colors, s]);

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMobileChange = (value) => {
    setMobile(value.replace(/\D/g, "").slice(0, 10));
  };

  // ==========================================
  // LOGIN API - POST
  // ==========================================
  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await login(mobile);

      console.log("Login response:", response);

      // API success condition
      if (response?.success === 1) {
        router.push({
          pathname: "/(auth)/Otpscreen",
          params: {
            mobile: mobile,
          },
        });
      } else {
        Alert.alert("Login Failed", response?.message || "Unable to send OTP.");
      }
    } catch (error) {
      console.log("Login error:", error);

      Alert.alert("Login Failed", error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert("Coming Soon", `${provider} login will be available soon.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* FOOD PHOTO BACKGROUND AT THE BOTTOM */}
      <Image
        source={require("../../../assets/images/food-bg.jpg")}
        resizeMode="cover"
        style={styles.foodBackground}
        pointerEvents="none"
      />

      {/* FLAME GLOW BACKGROUND */}
      <View pointerEvents="none" style={styles.glowLayer}>
        <Glow
          size={420 * s}
          alpha={0.05}
          style={{ bottom: -200 * s, left: -190 * s }}
        />
        <Glow
          size={460 * s}
          alpha={0.05}
          style={{ bottom: -230 * s, right: -200 * s }}
        />
        <Glow
          size={380 * s}
          alpha={0.03}
          style={{ top: 40 * s, left: "50%", marginLeft: -190 * s }}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* LOGO / HERO */}
            <View style={styles.heroContainer}>
              <Image
                source={require("../../../assets/images/logo.png")}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            {/* TITLE */}
            <View style={styles.titleContainer}>
              <Text style={styles.loginTitle}>Login with OTP</Text>
              <Text
                style={styles.subtitle}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Enter your mobile number{" "}
                <Text style={styles.subtitleAccent}>to continue</Text>
              </Text>
            </View>

            {/* FORM */}
            <View style={styles.formContainer}>
              {/* MOBILE INPUT */}
              <View style={styles.mobileInputContainer}>
                <View style={styles.countrySection}>
                  <View style={styles.flag}>
                    <View style={[styles.flagStripe, styles.flagSaffron]} />
                    <View style={[styles.flagStripe, styles.flagWhite]}>
                      <View style={styles.flagChakra} />
                    </View>
                    <View style={[styles.flagStripe, styles.flagGreen]} />
                  </View>
                  <Text style={styles.countryCode}>+91</Text>
                  <Ionicons
                    name="chevron-down"
                    size={16 * s}
                    color={colors.textSecondary}
                  />
                </View>

                <View style={styles.divider} />

                <TextInput
                  value={mobile}
                  onChangeText={handleMobileChange}
                  placeholder="Mobile Number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.mobileInput}
                  editable={!loading}
                />
              </View>

              {/* SEND OTP BUTTON */}
              <Pressable
                onPress={handleSendOTP}
                disabled={loading}
                style={({ pressed }) => [
                  styles.otpButton,
                  pressed && styles.otpButtonPressed,
                  loading && styles.otpButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.otpButtonText}>Send OTP</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={22 * s}
                      color={colors.white}
                      style={styles.arrow}
                    />
                  </>
                )}
              </Pressable>

              {/* OR DIVIDER */}
              {/*<View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>*/}

              {/* GOOGLE */}
              {/*<Pressable
                onPress={() => handleSocialLogin("Google")}
                disabled={loading}
                style={({ pressed }) => [
                  styles.socialButton,
                  pressed && styles.socialButtonPressed,
                ]}
              >
                <Ionicons name="logo-google" size={24 * s} color="#4285F4" />
                <Text style={styles.socialText}>Continue with Google</Text>
              </Pressable>*/}

              {/* APPLE */}
              {/*<Pressable
                onPress={() => handleSocialLogin("Apple")}
                disabled={loading}
                style={({ pressed }) => [
                  styles.socialButton,
                  pressed && styles.socialButtonPressed,
                ]}
              >
                <Ionicons
                  name="logo-apple"
                  size={26 * s}
                  color={colors.white}
                />
                <Text style={styles.socialText}>Continue with Apple</Text>
              </Pressable>*/}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors, s) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
      overflow: "hidden",
    },
    foodBackground: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: 230 * s,
      opacity: 0.95,
    },
    glowLayer: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
    },
    keyboardContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center",
      paddingBottom: 30 * s,
    },
    content: {
      width: "100%",
      maxWidth: MAX_WIDTH,
      zIndex: 1,
    },

    // Hero
    heroContainer: {
      width: "100%",
      height: 310 * s,
      marginTop: 24 * s,
      alignItems: "center",
      justifyContent: "center",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },

    // Title
    titleContainer: {
      alignItems: "center",
      paddingHorizontal: 20 * s,
      marginTop: 6 * s,
    },
    loginTitle: {
      color: "#FFFFFF",
      fontSize: 26 * s,
      fontFamily: Fonts.regular,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 6 * s,
    },
    subtitle: {
      color: "#D9D9D9",
      fontSize: 15.5 * s,
      fontFamily: Fonts.regular,
      textAlign: "center",
    },
    subtitleAccent: {
      color: "#8BDDF2",
      fontFamily: Fonts.regular,
    },

    // Form
    formContainer: {
      paddingHorizontal: 22 * s,
      marginTop: 26 * s,
    },
    mobileInputContainer: {
      width: "100%",
      height: 54 * s,
      borderWidth: 1,
      borderColor: "#2A2A2A",
      borderRadius: 30 * s,
      backgroundColor: "#0C0C0C",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14 * s,
    },
    countrySection: {
      flexDirection: "row",
      alignItems: "center",
    },
    flag: {
      width: 28 * s,
      height: 22 * s,
      borderRadius: 3,
      overflow: "hidden",
      marginRight: 12 * s,
    },
    flagStripe: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    flagSaffron: { backgroundColor: "#FF9933" },
    flagWhite: { backgroundColor: "#FFFFFF" },
    flagGreen: { backgroundColor: "#138808" },
    flagChakra: {
      width: 6 * s,
      height: 6 * s,
      borderRadius: 3 * s,
      borderWidth: 1,
      borderColor: "#000080",
    },
    countryCode: {
      color: "#FFFFFF",
      fontSize: 18 * s,
      fontFamily: Fonts.regular,
      fontWeight: "600",
      marginRight: 8 * s,
    },
    divider: {
      width: 1,
      height: 30 * s,
      backgroundColor: "#333333",
      marginHorizontal: 12 * s,
    },
    mobileInput: {
      flex: 1,
      height: 46 * s,
      color: "#FFFFFF",
      fontSize: 16 * s,
      fontFamily: Fonts.regular,
      paddingVertical: 0,
      outlineStyle: "none",
    },

    // Send OTP
    otpButton: {
      height: 48 * s,
      marginTop: 10 * s,
      borderRadius: 30 * s,
      backgroundColor: "#FF0E0E",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#FF0E0E",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 10,
    },
    otpButtonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    otpButtonDisabled: {
      opacity: 0.6,
    },
    otpButtonText: {
      color: "#FFFFFF",
      fontSize: 19 * s,
      fontFamily: Fonts.regular,
      fontWeight: "700",
    },
    arrow: {
      marginLeft: 14 * s,
    },

    // OR
    orContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 14 * s,
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#333333",
    },
    orText: {
      color: "#9A9A9A",
      fontSize: 15 * s,
      fontFamily: Fonts.regular,
      marginHorizontal: 18 * s,
    },

    // Social
    socialButton: {
      height: 46 * s,
      borderRadius: 30 * s,
      borderWidth: 1,
      borderColor: "#2A2A2A",
      backgroundColor: "#0C0C0C",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10 * s,
      gap: 14 * s,
    },
    socialButtonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    socialText: {
      color: "#FFFFFF",
      fontSize: 17 * s,
      fontFamily: Fonts.regular,
      fontWeight: "600",
    },
  });
