import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";
import { login, verifyMobile } from "../../utils/Function";

const { width } = Dimensions.get("window");
const OTP_LENGTH = 4; // Kept as 4 because the existing verification function validates 4 digits.

export default function OTPScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams();

  const mobile = Array.isArray(params.mobile)
    ? params.mobile[0]
    : params.mobile;

  const mobileNumber = mobile ? String(mobile) : "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  // OTP countdown
  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const formattedMobile =
    mobileNumber.length === 10
      ? `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`
      : `+91 ${mobileNumber}`;

  // OTP input handling
  const handleOTPChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, "");

    if (!cleaned) {
      const updatedOTP = [...otp];
      updatedOTP[index] = "";
      setOtp(updatedOTP);
      return;
    }

    const updatedOTP = [...otp];
    const digits = cleaned.slice(0, OTP_LENGTH - index).split("");

    digits.forEach((digit, i) => {
      updatedOTP[index + i] = digit;
    });

    setOtp(updatedOTP);

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  // Backspace handling
  const handleKeyPress = (event, index) => {
    if (
      event.nativeEvent.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // VERIFY OTP API - unchanged
  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join("").trim();

    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please return to the login screen and enter a valid mobile number.",
      );
      return;
    }

    if (enteredOTP.length !== OTP_LENGTH) {
      Alert.alert("Invalid OTP", "Please enter the complete 4-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      console.log("Verifying OTP...");
      console.log("Mobile:", mobileNumber);

      const response = await verifyMobile(mobileNumber, enteredOTP);

      console.log("OTP API RESPONSE:", response);

      const isSuccess =
        response?.success === 1 ||
        response?.success === true ||
        response?.success === "1";

      if (isSuccess) {
        console.log("OTP verified. Opening Home screen.");
        router.replace("/HomeScreen");
      } else {
        Alert.alert(
          "Verification Failed",
          response?.message || "OTP verification failed. Please try again.",
        );
      }
    } catch (error) {
      console.log("OTP API ERROR:", error?.message || error);

      Alert.alert(
        "API Error",
        error?.message || "Unable to verify OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP using the existing login API - unchanged
  const handleResendOTP = async () => {
    if (seconds > 0 || resending || loading) return;

    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert("Error", "Mobile number is missing.");
      return;
    }

    try {
      setResending(true);

      const response = await login(mobileNumber);

      console.log("Resend OTP response:", response);

      const isSuccess =
        response?.success === 1 ||
        response?.success === true ||
        response?.success === "1";

      if (isSuccess) {
        setOtp(["", "", "", ""]);
        setSeconds(30);

        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);

        Alert.alert(
          "OTP Sent",
          response?.message || "A new OTP has been sent.",
        );
      } else {
        Alert.alert(
          "Resend Failed",
          response?.message || "Unable to resend OTP.",
        );
      }
    } catch (error) {
      console.log("Resend OTP error:", error);

      Alert.alert(
        "Resend Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to resend OTP.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleEditMobile = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Food photograph sits behind the lower part of the OTP screen. */}
      <Image
        source={require("../../../assets/images/food-bg.jpg")}
        style={styles.foodBackground}
        resizeMode="cover"
      />
      <View style={styles.darkOverlay} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* BACK BUTTON */}
          <Pressable style={styles.backButton} onPress={handleEditMobile}>
            <Ionicons name="arrow-back" size={25} color={colors.white} />
          </Pressable>

          {/* BAKASURAN LOGO */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* OTP DETAILS */}
          <View style={styles.otpSection}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.description}>
              We have sent an OTP to your mobile number
            </Text>
            <Text style={styles.mobileNumber}>{formattedMobile}</Text>

            {/* FOUR OTP BOXES - existing API expects a 4-digit OTP */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(event) => handleKeyPress(event, index)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  selectionColor={colors.primary}
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.otpInput,
                    index === 0 && styles.firstOtpInput,
                    digit !== "" && styles.otpInputActive,
                  ]}
                />
              ))}
            </View>

            {/* RESEND OTP */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Resend OTP in </Text>
              {seconds > 0 ? (
                <Text style={styles.resendRed}>
                  00:{String(seconds).padStart(2, "0")}
                </Text>
              ) : (
                <Pressable
                  onPress={handleResendOTP}
                  disabled={resending || loading}
                  hitSlop={10}
                >
                  <Text style={styles.resendRed}>
                    {resending ? "Sending..." : "Resend OTP"}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* VERIFY BUTTON */}
            <Pressable
              style={[
                styles.verifyButton,
                (loading || resending) && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerifyOTP}
              disabled={loading || resending}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.verifyText}>Verify & Continue</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={25}
                    color={colors.white}
                    style={styles.verifyIcon}
                  />
                </>
              )}
            </Pressable>

            <View style={styles.securityRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.securityText}>
                Your OTP is secure and private
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#050505",
    },
    keyboardContainer: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollView: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 35,
      backgroundColor: "transparent",
    },
    foodBackground: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "43%",
      opacity: 0.9,
    },
    darkOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.28)",
    },
    backButton: {
      position: "absolute",
      top: Platform.OS === "android" ? 12 : 8,
      left: 18,
      zIndex: 5,
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.overlay || "rgba(20,20,20,0.7)",
      borderWidth: 1,
      borderColor: colors.overlayLight || "rgba(255,255,255,0.12)",
    },
    logoContainer: {
      width: "100%",
      height: Math.min(width * 0.83, 345),
      marginTop: 42,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    logoImage: {
      width: "100%",
      height: "100%",
    },
    otpSection: {
      width: "100%",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 5,
      paddingBottom: 24,
      backgroundColor: "transparent",
    },
    title: {
      color: colors.textPrimary,
      fontSize: Fonts.size.xxl,
      fontFamily: Fonts.extraBold,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 9,
    },
    description: {
      color: colors.textSecondary,
      fontSize: Fonts.size.base,
      fontFamily: Fonts.regular,
      textAlign: "center",
      marginBottom: 8,
    },
    mobileNumber: {
      color: colors.textPrimary,
      fontSize: Fonts.size.xl,
      fontFamily: Fonts.bold,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 30,
      letterSpacing: 0.3,
    },
    otpContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 26,
      paddingHorizontal: 4,
    },
    otpInput: {
      width: Math.min((width - 88) / OTP_LENGTH, 66),
      height: 62,
      borderRadius: 12,
      backgroundColor: "rgba(18,18,18,0.92)",
      borderWidth: 1.5,
      borderColor: colors.border || "#383838",
      color: colors.textPrimary,
      textAlign: "center",
      fontSize: Fonts.size.xxl,
      fontFamily: Fonts.bold,
      fontWeight: "700",
      padding: 0,
    },
    firstOtpInput: {
      borderColor: colors.primary,
    },
    otpInputActive: {
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 27,
      flexWrap: "wrap",
    },
    resendText: {
      color: colors.textSecondary,
      fontSize: Fonts.size.xl,
      fontFamily: Fonts.regular,
    },
    resendRed: {
      color: colors.primary,
      fontSize: Fonts.size.xl,
      fontFamily: Fonts.bold,
      fontWeight: "700",
    },
    verifyButton: {
      width: "100%",
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 7,
    },
    verifyButtonDisabled: {
      opacity: 0.7,
    },
    verifyText: {
      color: colors.white,
      fontSize: Fonts.size.xxl,
      fontFamily: Fonts.bold,
      fontWeight: "700",
    },
    verifyIcon: {
      marginLeft: 12,
    },
    securityRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 17,
    },
    securityText: {
      color: colors.textMuted,
      fontSize: Fonts.size.base,
      fontFamily: Fonts.regular,
      marginLeft: 5,
    },
  });
