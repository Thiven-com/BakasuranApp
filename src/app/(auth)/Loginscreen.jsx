import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
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
  View,
} from "react-native";

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // MOBILE NUMBER
  // =====================================================

  const handleMobileChange = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "");

    setMobile(cleaned.slice(0, 10));
  };

  // =====================================================
  // SEND OTP
  // =====================================================

  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * API WILL COME HERE
       *
       * Example:
       *
       * const response = await login(mobile);
       *
       * if (response?.success) {
       *   router.push({
       *     pathname: "/(auth)/Otpscreen",
       *     params: {
       *       mobile,
       *     },
       *   });
       * }
       */

      // Temporary navigation for UI testing
      setTimeout(() => {
        setLoading(false);

        router.push({
          pathname: "/(auth)/Otpscreen",
          params: {
            mobile,
          },
        });
      }, 800);
    } catch (error) {
      setLoading(false);

      Alert.alert(
        "Login Failed",
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* =====================================================
              HERO IMAGE
          ===================================================== */}

          <View style={styles.heroContainer}>
            <Image
              source={require("../../../assets/images/login.png")}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <View style={styles.heroFade} />
          </View>

          {/* =====================================================
              LOGIN PANEL
          ===================================================== */}

          <View style={styles.loginPanel}>
            {/* Decorative circles */}

            <View style={styles.decorativeCircleOne} />

            <View style={styles.decorativeCircleTwo} />

            {/* =================================================
                TITLE
            ================================================= */}

            <Text style={styles.loginTitle}>
              Login to{" "}
              <Text style={styles.redText}>
                Your Account
              </Text>
            </Text>

            {/* =================================================
                SUBTITLE
            ================================================= */}

            <Text style={styles.subtitle}>
              Manage your favourite food on the go.
            </Text>

            {/* =================================================
                MOBILE INPUT
            ================================================= */}

            <View style={styles.mobileInputContainer}>
              {/* India Flag */}

              <View style={styles.countrySection}>
                

                <Text style={styles.countryCode}>
                  +91
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={Fonts.size.xl}
                  color={Colors.white}
                />
              </View>

              {/* Divider */}

              <View style={styles.divider} />

              {/* Mobile Number */}

              <TextInput
                value={mobile}
                onChangeText={handleMobileChange}
                placeholder="Enter your mobile number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.mobileInput}
              />
            </View>

            {/* =================================================
                SEND OTP BUTTON
            ================================================= */}

            <Pressable
              onPress={handleSendOTP}
              disabled={loading}
              style={({ pressed }) => [
                styles.otpButton,

                pressed && styles.otpButtonPressed,

                loading && styles.otpButtonDisabled,
              ]}
            >
              <Text style={styles.otpButtonText}>
                {loading ? "Sending..." : "Send OTP"}
              </Text>

              {!loading && (
                <Text style={styles.arrow}>
                  →
                </Text>
              )}
            </Pressable>

            {/* =================================================
                SECURITY MESSAGE
            ================================================= */}

            <View style={styles.securityContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={Fonts.size.xl}
                color={Colors.textSecondary}
              />

              <Text style={styles.securityText}>
                We'll send a 6-digit OTP to your mobile number
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  // ===========================================================
  // MAIN
  // ===========================================================

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },

  // ===========================================================
  // HERO
  // ===========================================================

  heroContainer: {
    width: "100%",
    height: 520,
    position: "relative",
    overflow: "hidden",
  },

  heroImage: {
    position: "absolute",

    top: 0,
    left: 0,

    width: "100%",
    height: "100%",
  },

  heroFade: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: 80,

    backgroundColor: Colors.darkOverlay,
  },

  // ===========================================================
  // LOGIN PANEL
  // ===========================================================

  loginPanel: {
    marginTop: -15,

    minHeight: 430,

    backgroundColor: Colors.backgroundSecondary,

    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,

    paddingHorizontal: 32,
    paddingTop: 35,
    paddingBottom: 35,

    overflow: "hidden",
  },

  // ===========================================================
  // DECORATION
  // ===========================================================

  decorativeCircleOne: {
    position: "absolute",

    width: 180,
    height: 180,

    borderRadius: 90,

    left: -110,
    bottom: -80,

    borderWidth: 1,

    borderColor: "rgba(255,60,0,0.16)",
  },

  decorativeCircleTwo: {
    position: "absolute",

    width: 240,
    height: 240,

    borderRadius: 120,

    right: -160,
    top: 30,

    borderWidth: 1,

    borderColor: "rgba(255,60,0,0.08)",
  },

  // ===========================================================
  // TITLE
  // ===========================================================

  loginTitle: {
    color: Colors.textPrimary,

    fontSize: Fonts.size.heading,

    fontFamily: Fonts.regular,

    lineHeight: 38,

    marginBottom: 7,
  },

  redText: {
    color: Colors.primary,
    fontFamily: Fonts.regular,
  },

  // ===========================================================
  // SUBTITLE
  // ===========================================================

  subtitle: {
    color: Colors.textSecondary,

    fontSize: Fonts.size.xl,

    fontFamily: Fonts.regular,

    marginBottom: 30,
  },

  // ===========================================================
  // MOBILE INPUT
  // ===========================================================

  mobileInputContainer: {
    width: "103",

    height: 60,

    borderWidth: 1.8,

    borderColor: Colors.borderLight,

    borderRadius: 40,

    backgroundColor: Colors.surface,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 20,
  },

  countrySection: {
    flexDirection: "row",

    alignItems: "center",

    minWidth: 83,
  },

  indiaFlag: {
    fontSize: Fonts.size.lg,

    marginRight: 10,
  },

  countryCode: {
    color: Colors.textPrimary,

    fontSize: Fonts.size.xxl,

    fontFamily: Fonts.regular,

    marginRight: 8,
  },

  divider: {
    width: 1,

    height: 38,

    backgroundColor: Colors.borderLight,

    marginRight: 18,
  },

  mobileInput: {
    flex: 1,

    height: 40,
    width:50,
  

    color: Colors.textPrimary,

    fontSize: Fonts.size.xl,

    fontFamily: Fonts.regular,

    paddingVertical: 10,
  },

  // ===========================================================
  // OTP BUTTON
  // ===========================================================

  otpButton: {
    height: 60,

    marginTop: 28,

    borderRadius: 38,

    backgroundColor: Colors.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.25,

    shadowRadius: 15,

    elevation: 8,
  },

  otpButtonPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  otpButtonDisabled: {
    opacity: 0.6,
  },

  otpButtonText: {
    color: Colors.white,

    fontSize: Fonts.size.lg,

    fontFamily: Fonts.regular,
  },

  arrow: {
    color: Colors.white,

    fontSize: Fonts.size.display,

    fontFamily: Fonts.regular,

    marginLeft: 13,

    marginTop: -3,
  },

  // ===========================================================
  // SECURITY
  // ===========================================================

  securityContainer: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 27,

    paddingHorizontal: 5,
  },

  securityText: {
    color: Colors.textSecondary,

    fontSize: Fonts.size.base,

    fontFamily: Fonts.regular,

    marginLeft: 10,

    flexShrink: 1,

    textAlign: "center",

    lineHeight: 21,
  },
});