import { useMemo, useState } from "react";

import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";

/* =========================================================
   SIGNUP SCREEN
========================================================= */

export default function Signupscreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  /* =======================================================
     CREATE ACCOUNT
  ======================================================= */

  const handleCreateAccount = () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }

    if (!mobile.trim()) {
      Alert.alert("Required", "Please enter your mobile number.");
      return;
    }

    if (mobile.replace(/\D/g, "").length !== 10) {
      Alert.alert(
        "Invalid Mobile",
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    if (!password) {
      Alert.alert("Required", "Please enter your password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Password and confirm password do not match.",
      );
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        "Terms Required",
        "Please accept Terms & Conditions and Privacy Policy.",
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      router.push({
        pathname: "/(auth)/Otpscreen",
        params: {
          mobile: mobile,
        },
      });
    }, 500);
  };

  /* =======================================================
     GOOGLE
  ======================================================= */

  const handleGoogle = () => {
    Alert.alert(
      "Google Sign In",
      "Google authentication will be connected here.",
    );
  };

  /* =======================================================
     APPLE
  ======================================================= */

  const handleApple = () => {
    Alert.alert(
      "Apple Sign In",
      "Apple authentication will be connected here.",
    );
  };

  /* =======================================================
     FACEBOOK
  ======================================================= */

  const handleFacebook = () => {
    Alert.alert(
      "Facebook Sign In",
      "Facebook authentication will be connected here.",
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* =================================================
              BACKGROUND
          ================================================= */}

          <ImageBackground
            source={require("../../../assets/images/signup-bg.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Dark overlay */}

            <View style={styles.darkOverlay} />

            {/* ===============================================
                TOP HEADER
            =============================================== */}

            <View style={styles.topArea}>
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.8}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  size={29}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* =================================================
                FORM CONTENT
            ================================================= */}

            <View style={styles.formContainer}>
              {/* TITLE */}

              <View style={styles.titleContainer}>
                <Text style={styles.titleWhite}>Create </Text>

                <Text style={styles.titleRed}>Account</Text>
              </View>

              <Text style={styles.subtitle}>
                Join BAKASURAN and enjoy delicious
                {"\n"}
                food at your doorstep.
              </Text>

              {/* =================================================
                  FULL NAME
              ================================================= */}

              <View style={styles.inputBox}>
                <Ionicons
                  name="person-outline"
                  size={29}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* =================================================
                  EMAIL
              ================================================= */}

              <View style={styles.inputBox}>
                <Ionicons
                  name="mail-outline"
                  size={29}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <View style={styles.inputBox}>
                <Ionicons
                  name="call-outline"
                  size={30}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />

                <View style={styles.countryContainer}>
                  <Text style={styles.countryCode}>+91</Text>

                  <Ionicons
                    name="chevron-down"
                    size={17}
                    color={colors.textSecondary}
                  />
                </View>

                <View style={styles.verticalDivider} />

                <TextInput
                  value={mobile}
                  onChangeText={(value) => {
                    const cleaned = value.replace(/\D/g, "").slice(0, 10);

                    setMobile(cleaned);
                  }}
                  placeholder="Mobile Number"
                  placeholderTextColor={colors.textMuted}
                  style={styles.mobileInput}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                />
              </View>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              <View style={styles.inputBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={29}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={27}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* =================================================
                  CONFIRM PASSWORD
              ================================================= */}

              <View style={styles.inputBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={29}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={27}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* =================================================
                  TERMS
              ================================================= */}

              <TouchableOpacity
                style={styles.termsRow}
                activeOpacity={0.8}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedTerms && styles.checkboxActive,
                  ]}
                >
                  {acceptedTerms && (
                    <Ionicons name="checkmark" size={22} color={colors.white} />
                  )}
                </View>

                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsRed}>Terms & Conditions</Text> and
                  {"\n"}
                  <Text style={styles.termsRed}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* =================================================
                  CREATE ACCOUNT BUTTON
              ================================================= */}

              <TouchableOpacity
                style={[
                  styles.createButton,
                  loading && styles.createButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleCreateAccount}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? "Creating..." : "Create Account"}
                </Text>

                {!loading && <Text style={styles.buttonArrow}>→</Text>}
              </TouchableOpacity>

              {/* =================================================
                  OR
              ================================================= */}

              <View style={styles.orContainer}>
                <View style={styles.orLine} />

                <Text style={styles.orText}>OR</Text>

                <View style={styles.orLine} />
              </View>

              {/* =================================================
                  SOCIAL BUTTONS
              ================================================= */}

              <View style={styles.socialContainer}>
                {/* Google */}

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={handleGoogle}
                >
                  <Text style={styles.googleG}>G</Text>

                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>

                {/* Apple */}

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={handleApple}
                >
                  <Ionicons
                    name="logo-apple"
                    size={27}
                    color={colors.textPrimary}
                  />

                  <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>

                {/* Facebook */}

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={handleFacebook}
                >
                  <View style={styles.facebookIcon}>
                    <Text style={styles.facebookF}>f</Text>
                  </View>

                  <Text style={styles.socialText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* =================================================
                  SIGN IN
              ================================================= */}

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account?</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(auth)/Loginscreen")}
                >
                  <Text style={styles.signInRed}>Sign In</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom spacing */}

              <View style={styles.bottomSpace} />
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const createStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboard: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  /* =======================================================
     BACKGROUND
  ======================================================= */

  backgroundImage: {
    width: "100%",
    minHeight: 1100,
    backgroundColor: colors.background,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDark ? colors.overlayDark : colors.background,
    opacity: isDark ? 1 : 0.94,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  topArea: {
    minHeight: 100,
    paddingTop: 38,
    paddingHorizontal: 24,
    position: "relative",
  },

  backButton: {
    position: "absolute",

    left: 24,
    top: 36,

    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    justifyContent: "center",
    alignItems: "center",

    zIndex: 10,
  },

  /* =======================================================
     FORM
  ======================================================= */

  formContainer: {
    paddingHorizontal: 32,
    paddingTop: 90,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  titleWhite: {
    color: colors.textPrimary,

    fontFamily: Fonts.extraBold,
    fontSize: 25,
    lineHeight: 47,

    letterSpacing: -0.8,
  },

  titleRed: {
    color: colors.primary,

    fontFamily: Fonts.extraBold,
    fontSize: 25,
    lineHeight: 47,

    letterSpacing: -0.8,
  },

  subtitle: {
    color: colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 28,

    marginTop: 7,
    marginBottom: 27,
  },

  /* =======================================================
     INPUT
  ======================================================= */

  inputBox: {
    height: 60,
    width: "100%",

    borderRadius: 20,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 24,
    marginBottom: 19,
  },

  inputIcon: {
    width: 42,
    marginRight: 18,
  },

  input: {
    flex: 1,
    height: "100%",

    color: colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: 20,
  },

  mobileInput: {
    flex: 1,
    height: "100%",

    color: colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: 20,
  },

  countryContainer: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,
    marginRight: 14,
  },

  countryCode: {
    color: colors.textPrimary,

    fontFamily: Fonts.medium,
    fontSize: 19,
  },

  verticalDivider: {
    width: 1,
    height: 34,

    backgroundColor: colors.borderLight,

    marginRight: 18,
  },

  eyeButton: {
    width: 38,
    height: 45,

    justifyContent: "center",
    alignItems: "flex-end",
  },

  /* =======================================================
     TERMS
  ======================================================= */

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",

    marginTop: 4,
    marginBottom: 24,
  },

  checkbox: {
    width: 40,
    height: 40,

    borderRadius: 8,

    borderWidth: 1.5,
    borderColor: colors.textMuted,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 17,
  },

  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  termsText: {
    flex: 1,

    color: colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 17,
    lineHeight: 25,

    paddingTop: 4,
  },

  termsRed: {
    color: colors.primary,
    fontFamily: Fonts.medium,
  },

  /* =======================================================
     CREATE BUTTON
  ======================================================= */

  createButton: {
    height: 82,
    width: "100%",

    borderRadius: 20,

    backgroundColor: colors.primary,

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: colors.primary,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.3,
    shadowRadius: 15,

    elevation: 8,
  },

  createButtonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
    color: colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: 27,
  },

  buttonArrow: {
    color: colors.white,

    fontFamily: Fonts.regular,
    fontSize: 39,
    lineHeight: 42,

    marginLeft: 17,
  },

  /* =======================================================
     OR
  ======================================================= */

  orContainer: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 31,
    marginBottom: 25,
  },

  orLine: {
    flex: 1,

    height: 1,

    backgroundColor: colors.textMuted,
  },

  orText: {
    color: colors.textMuted,

    fontFamily: Fonts.medium,
    fontSize: 18,

    marginHorizontal: 19,
  },

  /* =======================================================
     SOCIAL
  ======================================================= */

  socialContainer: {
    flexDirection: "row",

    justifyContent: "space-between",

    gap: 12,
  },

  socialButton: {
    flex: 1,

    height: 76,

    borderRadius: 17,

    borderWidth: 1.4,
    borderColor: colors.textMuted,

    backgroundColor: colors.surface,

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 10,
  },

  socialText: {
    color: colors.textPrimary,

    fontFamily: Fonts.medium,
    fontSize: 16,
  },

  googleG: {
    fontSize: 27,

    fontFamily: Fonts.extraBold,

    color: "#4285F4",
  },

  facebookIcon: {
    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor: "#1877F2",

    justifyContent: "flex-end",
    alignItems: "center",

    overflow: "hidden",
  },

  facebookF: {
    color: colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: 25,
    lineHeight: 29,
  },

  /* =======================================================
     SIGN IN
  ======================================================= */

  signInContainer: {
    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 37,
  },

  signInText: {
    color: colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 17,
  },

  signInRed: {
    color: colors.primary,

    fontFamily: Fonts.bold,
    fontSize: 18,

    marginLeft: 8,
  },

  bottomSpace: {
    height: 35,
  },
});
