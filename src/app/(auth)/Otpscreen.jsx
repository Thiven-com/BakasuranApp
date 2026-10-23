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
const OTP_LENGTH = 4;

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

    const nextIndex = Math.min(
      index + digits.length,
      OTP_LENGTH - 1
    );

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

  // VERIFY OTP API
  

const handleVerifyOTP = async () => {
  const enteredOTP = otp.join("").trim();

  if (!mobileNumber || mobileNumber.length !== 10) {
    Alert.alert(
      "Invalid Mobile Number",
      "Please return to the login screen and enter a valid mobile number."
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

      // Navigate directly to the tabs entry route.
      router.replace("/HomeScreen");
    } else {
      Alert.alert(
        "Verification Failed",
        response?.message || "OTP verification failed. Please try again."
      );
    }
  } catch (error) {
    console.log("OTP API ERROR:", error?.message || error);

    Alert.alert(
      "API Error",
      error?.message || "Unable to verify OTP. Please try again."
    );
  } finally {
    setLoading(false);
  }
};



  // RESEND OTP using the existing login API
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
          response?.message || "A new OTP has been sent."
        );
      } else {
        Alert.alert(
          "Resend Failed",
          response?.message || "Unable to resend OTP."
        );
      }
    } catch (error) {
      console.log("Resend OTP error:", error);

      Alert.alert(
        "Resend Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to resend OTP."
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
          {/* HERO IMAGE */}
          <View style={styles.heroContainer}>
            <Image
              source={require("../../../assets/images/otpimage.png")}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.white}
              />
            </Pressable>
          </View>

          {/* OTP SECTION */}
          <View style={styles.otpSection}>
            <View style={styles.titleRow}>
              <Text style={styles.titleWhite}>Verify </Text>
              <Text style={styles.titleRed}>OTP</Text>
            </View>

            <Text style={styles.description}>
              We've sent a 4-digit OTP to
            </Text>

            <View style={styles.mobileRow}>
              <Text style={styles.mobileNumber}>
                {formattedMobile}
              </Text>

              <Pressable onPress={handleEditMobile} hitSlop={10}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>

            {/* FOUR OTP BOXES */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) =>
                    handleOTPChange(value, index)
                  }
                  onKeyPress={(event) =>
                    handleKeyPress(event, index)
                  }
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  selectionColor={colors.primary}
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.otpInput,
                    digit !== "" && styles.otpInputActive,
                  ]}
                />
              ))}
            </View>

            {/* RESEND OTP */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>
                Didn't receive the OTP?
              </Text>

              {seconds > 0 ? (
                <Text style={styles.resendRed}>
                  {" "}Resend in 00:
                  {String(seconds).padStart(2, "0")}
                </Text>
              ) : (
                <Pressable
                  onPress={handleResendOTP}
                  disabled={resending || loading}
                  hitSlop={10}
                >
                  <Text style={styles.resendRed}>
                    {resending ? " Sending..." : " Resend OTP"}
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
                  <Text style={styles.verifyText}>Verify OTP</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={27}
                    color={colors.white}
                    style={styles.verifyIcon}
                  />
                </>
              )}
            </Pressable>

            {/* SECURITY */}
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

            <View style={styles.bottomSpace} />
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
      backgroundColor: colors.background,
    },
    keyboardContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    heroContainer: {
      width: "100%",
      height: width * 1.28,
      position: "relative",
      backgroundColor: colors.background,
      overflow: "hidden",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    backButton: {
      position: "absolute",
      top: 18,
      left: 12,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.overlayLight,
    },
    otpSection: {
      width: "100%",
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingTop: 25,
      paddingBottom: 25,
      minHeight: 470,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    titleWhite: {
      color: colors.textPrimary,
      fontSize: Fonts.size.xxl,
      fontFamily: Fonts.extraBold,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    titleRed: {
      color: colors.primary,
      fontSize: Fonts.size.xxl,
      fontFamily: Fonts.extraBold,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    description: {
      color: colors.textSecondary,
      fontSize: Fonts.size.xl,
      fontFamily: Fonts.regular,
      lineHeight: 20,
      marginBottom: 7,
    },
    mobileRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 22,
    },
    mobileNumber: {
      color: colors.textPrimary,
      fontSize: Fonts.size.xl,
      fontFamily: Fonts.bold,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    editText: {
      color: colors.primary,
      fontSize: Fonts.size.sm,
      fontFamily: Fonts.semiBold,
      fontWeight: "600",
      marginLeft: 9,
      textDecorationLine: "underline",
    },
    otpContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginBottom: 17,
    },
    otpInput: {
      width: Math.min((width - 80) / 4, 60),
      height: 54,
      borderRadius: 9,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.textPrimary,
      textAlign: "center",
      fontSize: Fonts.size.xxl,
      fontFamily: Fonts.bold,
      fontWeight: "700",
      padding: 0,
    },
    otpInputActive: {
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
    },
    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 22,
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
      borderRadius: 25,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
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
      marginLeft: 9,
    },
    securityRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
    },
    securityText: {
      color: colors.textMuted,
      fontSize: Fonts.size.base,
      fontFamily: Fonts.regular,
      marginLeft: 4,
    },
    bottomSpace: {
      height: 35,
    },
  });
