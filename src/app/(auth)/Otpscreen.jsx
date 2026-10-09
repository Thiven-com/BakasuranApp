import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
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

// =========================================================
// GLOBAL COLORS & FONTS
// =========================================================
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const { width } = Dimensions.get("window");


// =========================================================
// OTP SCREEN
// =========================================================
export default function OTPScreen() {
  const { mobile } = useLocalSearchParams();

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [seconds, setSeconds] = useState(30);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);


  // =======================================================
  // TIMER
  // =======================================================
  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);


  // =======================================================
  // MOBILE NUMBER
  // =======================================================
  const mobileNumber =
    mobile && String(mobile).length > 0
      ? String(mobile)
      : "8886742779";

  const formattedMobile =
    mobileNumber.length === 10
      ? `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`
      : `+91 ${mobileNumber}`;


  // =======================================================
  // OTP CHANGE
  // =======================================================
  const handleOTPChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, "");

    // Empty value
    if (!cleaned) {
      const updatedOTP = [...otp];

      updatedOTP[index] = "";

      setOtp(updatedOTP);

      return;
    }


    // =====================================================
    // PASTE MULTIPLE DIGITS
    // =====================================================
    if (cleaned.length > 1) {
      const updatedOTP = [...otp];

      cleaned
        .slice(0, 6)
        .split("")
        .forEach((digit, i) => {
          if (index + i < 6) {
            updatedOTP[index + i] = digit;
          }
        });

      setOtp(updatedOTP);

      const nextIndex = Math.min(
        index + cleaned.length,
        5
      );

      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 50);

      return;
    }


    // =====================================================
    // SINGLE DIGIT
    // =====================================================
    const updatedOTP = [...otp];

    updatedOTP[index] = cleaned;

    setOtp(updatedOTP);

    if (index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 50);
    }
  };


  // =======================================================
  // BACKSPACE
  // =======================================================
  const handleKeyPress = (event, index) => {
    if (
      event.nativeEvent.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };


  // =======================================================
  // VERIFY OTP
  // =======================================================
  const handleVerifyOTP = () => {
    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the complete 6-digit OTP."
      );

      return;
    }

    setLoading(true);

    // =====================================================
    // API VERIFICATION CAN BE ADDED HERE
    // =====================================================

    setTimeout(() => {
      setLoading(false);

      // Current route
      router.replace("/profile");
    }, 500);
  };


  // =======================================================
  // RESEND OTP
  // =======================================================
  const handleResendOTP = () => {
    if (seconds > 0) {
      return;
    }

    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    setSeconds(30);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    Alert.alert(
      "OTP Sent",
      "A new OTP has been sent to your mobile number."
    );
  };


  // =======================================================
  // EDIT MOBILE
  // =======================================================
  const handleEditMobile = () => {
    router.back();
  };


  // =======================================================
  // UI
  // =======================================================
  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        translucent
        backgroundColor={Colors.transparent}
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >

          {/* =================================================
              HERO IMAGE
          ================================================= */}

          <View style={styles.heroContainer}>

            <Image
              source={require("../../../assets/images/otpimage.png")}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* BACK BUTTON */}

            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              onPress={() => router.back()}
            >

              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.white}
              />

            </Pressable>

          </View>


          {/* =================================================
              OTP SECTION
          ================================================= */}

          <View style={styles.otpSection}>

            {/* =================================================
                TITLE
            ================================================= */}

            <View style={styles.titleRow}>

              <Text style={styles.titleWhite}>
                Verify{" "}
              </Text>

              <Text style={styles.titleRed}>
                OTP
              </Text>

            </View>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <Text style={styles.description}>
              We've sent a 6-digit OTP to
            </Text>


            {/* =================================================
                MOBILE NUMBER
            ================================================= */}

            <View style={styles.mobileRow}>

              <Text style={styles.mobileNumber}>
                {formattedMobile}
              </Text>

              <Pressable
                onPress={handleEditMobile}
                hitSlop={10}
              >
                <Text style={styles.editText}>
                  Edit
                </Text>
              </Pressable>

            </View>


            {/* =================================================
                OTP BOXES
            ================================================= */}

            <View style={styles.otpContainer}>

              {otp.map((digit, index) => (

                <TextInput
                  key={index}

                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}

                  value={digit}

                  onChangeText={(value) =>
                    handleOTPChange(
                      value,
                      index
                    )
                  }

                  onKeyPress={(event) =>
                    handleKeyPress(
                      event,
                      index
                    )
                  }

                  keyboardType="number-pad"

                  maxLength={1}

                  textContentType="oneTimeCode"

                  autoComplete="sms-otp"

                  selectionColor={Colors.primary}

                  placeholderTextColor={
                    Colors.textMuted
                  }

                  style={[
                    styles.otpInput,

                    digit !== "" &&
                      styles.otpInputActive,
                  ]}
                />

              ))}

            </View>


            {/* =================================================
                RESEND OTP
            ================================================= */}

            <View style={styles.resendRow}>

              <Text style={styles.resendText}>
                Didn't receive the OTP?
              </Text>

              {seconds > 0 ? (

                <Text style={styles.resendRed}>
                  {" "}
                  Resend in 00:
                  {String(seconds).padStart(
                    2,
                    "0"
                  )}
                </Text>

              ) : (

                <Pressable
                  onPress={handleResendOTP}
                  hitSlop={10}
                >

                  <Text style={styles.resendRed}>
                    {" "}
                    Resend OTP
                  </Text>

                </Pressable>

              )}

            </View>


            {/* =================================================
                VERIFY BUTTON
            ================================================= */}

            <Pressable
              style={({ pressed }) => [
                styles.verifyButton,

                loading &&
                  styles.verifyButtonDisabled,

                pressed &&
                  !loading &&
                  styles.verifyButtonPressed,
              ]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >

              <Text style={styles.verifyText}>
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </Text>

              {!loading && (

                <Ionicons
                  name="arrow-forward"
                  size={27}
                  color={Colors.white}
                  style={styles.verifyIcon}
                />

              )}

            </Pressable>


            {/* =================================================
                SECURITY
            ================================================= */}

            <View style={styles.securityRow}>

              <Ionicons
                name="shield-checkmark-outline"
                size={12}
                color={Colors.textMuted}
              />

              <Text style={styles.securityText}>
                Your OTP is secure and private
              </Text>

            </View>


            {/* =================================================
                BOTTOM SPACE
            ================================================= */}

            <View style={styles.bottomSpace} />

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  // =======================================================
  // MAIN
  // =======================================================

  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },


  // =======================================================
  // HERO IMAGE
  // =======================================================

  heroContainer: {
    width: "100%",
    height: width * 1.28,

    position: "relative",

    backgroundColor: Colors.black,

    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },


  // =======================================================
  // BACK BUTTON
  // =======================================================

  backButton: {
    position: "absolute",

    top: 18,
    left: 12,

    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: Colors.overlay,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      Colors.lightOverlay,
  },

  backButtonPressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.95,
      },
    ],
  },


  // =======================================================
  // OTP SECTION
  // =======================================================

  otpSection: {
    width: "100%",

    backgroundColor:
      Colors.backgroundSecondary,

    paddingHorizontal: 12,

    paddingTop: 25,

    paddingBottom: 25,

    minHeight: 470,
  },


  // =======================================================
  // TITLE
  // =======================================================

  titleRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 8,
  },

  titleWhite: {
    color: Colors.textPrimary,

    fontSize: Fonts.size.xxl,

    fontFamily: Fonts.extraBold,

    fontWeight: "800",

    letterSpacing: -0.3,
  },

  titleRed: {
    color: Colors.primary,

    fontSize: Fonts.size.xxl,

    fontFamily: Fonts.extraBold,

    fontWeight: "800",

    letterSpacing: -0.3,
  },


  // =======================================================
  // DESCRIPTION
  // =======================================================

  description: {
    color: Colors.textSecondary,

    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,

    lineHeight: 20,

    marginBottom: 7,
  },


  // =======================================================
  // MOBILE NUMBER
  // =======================================================

  mobileRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 22,
  },

  mobileNumber: {
    color: Colors.textPrimary,

    fontSize: Fonts.size.xl,

    fontFamily: Fonts.bold,

    fontWeight: "700",

    letterSpacing: 0.2,
  },

  editText: {
    color: Colors.primary,

    fontSize: Fonts.size.sm,

    fontFamily: Fonts.semiBold,

    fontWeight: "600",

    marginLeft: 9,

    textDecorationLine: "underline",
  },


  // =======================================================
  // OTP BOXES
  // =======================================================

  otpContainer: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 17,
  },

  otpInput: {
    width: (width - 72) / 6,

    height: 50,

    maxWidth: 50,

    minWidth: 38,

    borderRadius: 9,

    backgroundColor:
      Colors.surface,

    borderWidth: 1,

    borderColor:
      Colors.border,

    color: Colors.textPrimary,

    textAlign: "center",

    fontSize: Fonts.size.xxl,

    fontFamily: Fonts.bold,

    fontWeight: "700",

    padding: 0,
  },

  otpInputActive: {
    borderColor:
      Colors.borderLight,

    backgroundColor:
      Colors.card,
  },


  // =======================================================
  // RESEND
  // =======================================================

  resendRow: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 22,

    flexWrap: "wrap",
  },

  resendText: {
    color: Colors.textSecondary,

    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,
  },

  resendRed: {
    color: Colors.primary,

    fontSize: Fonts.size.md,

    fontFamily: Fonts.bold,

    fontWeight: "700",
  },


  // =======================================================
  // VERIFY BUTTON
  // =======================================================

  verifyButton: {
    width: "100%",

    height: 60,

    borderRadius: 25,

    backgroundColor:
      Colors.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor:
      Colors.primary,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.25,

    shadowRadius: 10,

    elevation: 5,
  },

  verifyButtonPressed: {
    opacity: 0.85,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  verifyButtonDisabled: {
    opacity: 0.7,
  },

  verifyText: {
    color: Colors.white,

    fontSize: Fonts.size.xxl,

    fontFamily: Fonts.bold,

    fontWeight: "700",
  },

  verifyIcon: {
    marginLeft: 9,
  },


  // =======================================================
  // SECURITY
  // =======================================================

  securityRow: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 16,
  },

  securityText: {
    color: Colors.textMuted,

    fontSize: Fonts.size.xs,

    fontFamily: Fonts.regular,

    marginLeft: 4,
  },


  // =======================================================
  // BOTTOM SPACE
  // =======================================================

  bottomSpace: {
    height: 35,
  },

});