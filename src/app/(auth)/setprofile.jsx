import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";

import {
  Alert,
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

export default function SetProfileScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  // Select profile picture
  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo library access to select your profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Unable to select your profile picture.");
    }
  };

  // Continue to Profile screen
  const handleContinue = () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }

    if (!owner.trim()) {
      Alert.alert("Required", "Please enter the owner name.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (!location.trim()) {
      Alert.alert("Required", "Please enter your city, state, or pincode.");
      return;
    }

    // TODO: Save profile details and profileImage using your API.
    router.replace("/(tabs)/profile");
  };

  // Skip directly to Home screen
  const handleSkip = () => {
    router.replace("/(tabs)/HomeScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* BACK BUTTON */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={30} color={colors.text} />
          </Pressable>

          {/* PROFILE IMAGE */}
          <View style={styles.profileArea}>
            <View style={styles.avatar}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={170} color={colors.textSecondary} />
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.cameraButton,
                pressed && styles.pressed,
              ]}
              onPress={handlePickImage}
              accessibilityLabel="Choose profile picture"
            >
              <Ionicons name="camera" size={30} color={colors.white} />
            </Pressable>
          </View>

          {/* TITLE */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Set Your Profile</Text>

            <Text style={styles.subtitle}>
              Add a few details to get started
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={31}
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
                accessibilityLabel="Full name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={31}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />

              <TextInput
                value={owner}
                onChangeText={setOwner}
                placeholder="Take Owner"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Owner name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={31}
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
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Email address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={31}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />

              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City, State or Pincode"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="done"
                accessibilityLabel="City, state or pincode"
              />
            </View>

            {/* CONTINUE: PROFILE */}
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.continueText}>Continue</Text>
            </Pressable>

            {/* SKIP: HOME */}
            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.skipText}>Skip </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: colors.background,
  },

  backButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  profileArea: {
    alignSelf: "center",
    marginTop: 20,
    width: 150,
    height: 150,
    marginBottom: 50,
    position: "relative",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 95,
    backgroundColor: colors.backgroundElement,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "50%",
    height: "50%",
    borderRadius: 95,
  },

  cameraButton: {
    position: "absolute",
    right: -6,
    bottom: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },

  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  title: {
    color: colors.text,
    fontSize: 35,
    fontFamily: Fonts.bold,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.6,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 19,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 12,
  },

  form: {
    width: "100%",
  },

  inputContainer: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 19,
    marginBottom: 16,
  },

  inputIcon: {
    width: 43,
    marginRight: 13,
    textAlign: "center",
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 19,
    fontFamily: Fonts.regular,
    paddingVertical: 15,
    minWidth: 0,
  },

  continueButton: {
    minHeight: 50,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  continueText: {
    color: colors.white,
    fontSize: 25,
    fontFamily: Fonts.regular,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  skipButton: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    marginTop: 4,
  },

  skipText: {
    color: colors.primary,
    fontSize: 17,
    fontFamily: Fonts.regular,
    textDecorationLine: "underline",
  },

  pressed: {
    opacity: 0.7,
  },
  });
