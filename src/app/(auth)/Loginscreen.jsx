
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
  View,
} from "react-native";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";
import { login } from "../../utils/Function";

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      "Please enter a valid 10-digit mobile number."
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
      Alert.alert(
        "Login Failed",
        response?.message || "Unable to send OTP."
      );
    }
  } catch (error) {
    console.log("Login error:", error);

    Alert.alert(
      "Login Failed",
      error?.message || "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
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
          {/* HERO IMAGE */}
          <View style={styles.heroContainer}>
            <Image
              source={require("../../../assets/images/login.png")}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroFade} />
          </View>

          {/* LOGIN PANEL */}
          <View style={styles.loginPanel}>
            <View style={styles.decorativeCircleOne} />
            <View style={styles.decorativeCircleTwo} />

            <Text style={styles.loginTitle}>
              Login to{" "}
              <Text style={styles.redText}>Your Account</Text>
            </Text>

            <Text style={styles.subtitle}>
              Manage your favourite food on the go.
            </Text>

            {/* MOBILE INPUT */}
            <View style={styles.mobileInputContainer}>
              <View style={styles.countrySection}>
                
                <Text style={styles.countryCode}>+91</Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.white}
                />
              </View>

              <View style={styles.divider} />

              <TextInput
                value={mobile}
                onChangeText={handleMobileChange}
                placeholder="Enter your mobile number"
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
                  <Text style={styles.arrow}>→</Text>
                </>
              )}
            </Pressable>

            {/* SECURITY MESSAGE */}
            <View style={styles.securityContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={styles.securityText}>
                We'll send a 6-digit OTP to your mobile number.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
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
      backgroundColor: colors.overlayDark,
    },
    loginPanel: {
      marginTop: -79,
      minHeight: 430,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 38,
      borderTopRightRadius: 38,
      paddingHorizontal: 32,
      paddingTop: 35,
      paddingBottom: 35,
      overflow: "hidden",
    },
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
    loginTitle: {
      color: colors.textPrimary,
      fontSize: Fonts.size.heading,
      fontFamily: Fonts.regular,
      lineHeight: 38,
      marginBottom: 7,
    },
    redText: {
      color: colors.primary,
      fontFamily: Fonts.regular,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: Fonts.size.xl,
      fontFamily: Fonts.regular,
      marginBottom: 30,
    },
    mobileInputContainer: {
      width: "100%",
      height: 60,
      borderWidth: 1.8,
      borderColor: colors.borderLight,
      borderRadius: 40,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
    },
    countrySection: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 60,
    },
    indiaFlag: {
      fontSize: 18,
      marginRight: 1,
    },
    countryCode: {
      color: colors.textPrimary,
      fontSize: Fonts.size.base,
      fontFamily: Fonts.regular,
      marginRight: 5,
    },
    divider: {
      width: 1,
      height: 38,
      backgroundColor: colors.borderLight,
      marginRight: 12,
    },
    mobileInput: {
      flex: 1,
      height: 45,
      color: colors.textPrimary,
      fontSize: Fonts.size.base,
      fontFamily: Fonts.regular,
      paddingVertical: 8,
    },
    otpButton: {
      height: 60,
      marginTop: 28,
      borderRadius: 38,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 15,
      elevation: 8,
    },
    otpButtonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    otpButtonDisabled: {
      opacity: 0.6,
    },
    otpButtonText: {
      color: colors.white,
      fontSize: Fonts.size.lg,
      fontFamily: Fonts.regular,
    },
    arrow: {
      color: colors.white,
      fontSize: Fonts.size.display,
      fontFamily: Fonts.regular,
      marginLeft: 13,
      marginTop: -3,
    },
    securityContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 27,
      paddingHorizontal: 5,
    },
    securityText: {
      color: colors.textSecondary,
      fontSize: Fonts.size.base,
      fontFamily: Fonts.regular,
      marginLeft: 10,
      flexShrink: 1,
      textAlign: "center",
      lineHeight: 21,
    },
  });
