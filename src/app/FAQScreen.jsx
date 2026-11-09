import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";
import { getFAQs } from "../utils/Function";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const scale = (size) => Math.round(size * Math.min(SCREEN_WIDTH / 375, 1.12));

export default function FAQScreen() {
  const { colors, isDark } = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================================================
  // GET FAQ API
  // =========================================================

  const loadFAQs = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getFAQs();

      console.log("FAQ API RESPONSE:", JSON.stringify(response, null, 2));

      // Support common API response formats.
      const candidates = [
        response?.data?.data,
        response?.data?.faqs,
        response?.data?.items,
        response?.data,
        response?.faqs,
        response?.items,
        response,
      ];

      const list = candidates.find(Array.isArray) || [];

      const formattedFAQs = list
        .map((item, index) => ({
          id: item?.id ?? item?.faq_id ?? item?.faqId ?? index + 1,

          question:
            item?.question ??
            item?.faq_question ??
            item?.title ??
            item?.questions ??
            "",

          answer:
            item?.answer ??
            item?.faq_answer ??
            item?.description ??
            item?.answers ??
            "",
        }))
        .filter(
          (item) =>
            String(item.question).trim() !== "" &&
            String(item.answer).trim() !== "",
        );

      setFaqs(formattedFAQs);
    } catch (error) {
      console.error(
        "FAQ GET API ERROR:",
        error?.response?.data || error?.message || error,
      );

      setFaqs([]);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load FAQs. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD FAQS WHEN SCREEN MOUNTS
  // =========================================================

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  // =========================================================
  // BACK BUTTON
  // =========================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // =========================================================
  // EXPAND / COLLAPSE FAQ
  // =========================================================

  const toggleFAQ = (id) => {
    setExpandedId((currentId) => (currentId === id ? null : id));
  };

  // =========================================================
  // HELP AND SUPPORT
  // =========================================================

  const handleSupport = () => {
    router.push("/help&support");
  };

  // =========================================================
  // STYLES
  // =========================================================

  const styles = useMemo(() => createStyles(colors), [colors]);

  // =========================================================
  // SCREEN UI
  // =========================================================

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={scale(20)}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>

        <View style={styles.headerRightSpace} />
      </View>

      {/* FAQ CONTENT */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* LOADING STATE */}
        {loading ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={colors.primary} />

            <Text style={styles.statusText}>Loading FAQs...</Text>
          </View>
        ) : errorMessage ? (
          /* ERROR STATE */
          <View style={styles.statusContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={scale(28)}
              color={colors.primary}
            />

            <Text style={styles.statusText}>{errorMessage}</Text>

            <Pressable
              onPress={loadFAQs}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : faqs.length === 0 ? (
          /* EMPTY STATE */
          <View style={styles.statusContainer}>
            <Ionicons
              name="help-circle-outline"
              size={scale(28)}
              color={colors.textSecondary}
            />

            <Text style={styles.statusText}>
              No FAQs are available right now.
            </Text>

            <Pressable
              onPress={loadFAQs}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
            </Pressable>
          </View>
        ) : (
          /* FAQ LIST */
          <View style={styles.faqContainer}>
            {faqs.map((item, index) => {
              const isExpanded = expandedId === item.id;

              return (
                <View key={String(item.id)} style={styles.faqItem}>
                  {/* QUESTION */}
                  <Pressable
                    onPress={() => toggleFAQ(item.id)}
                    accessibilityRole="button"
                    accessibilityState={{
                      expanded: isExpanded,
                    }}
                    style={({ pressed }) => [
                      styles.questionRow,
                      isExpanded && styles.questionRowActive,
                      pressed && styles.questionRowPressed,
                    ]}
                  >
                    <View style={styles.numberContainer}>
                      <Text style={styles.numberText}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>

                    <View style={styles.questionContent}>
                      <Text
                        style={[
                          styles.questionText,
                          isExpanded && styles.questionTextActive,
                        ]}
                      >
                        {item.question}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.expandButton,
                        isExpanded && styles.expandButtonActive,
                      ]}
                    >
                      <Ionicons
                        name={isExpanded ? "remove" : "add"}
                        size={scale(16)}
                        color={isExpanded ? colors.white : colors.textSecondary}
                      />
                    </View>
                  </Pressable>

                  {/* ANSWER */}
                  {isExpanded && (
                    <View style={styles.answerContainer}>
                      <Text style={styles.answerText}>{item.answer}</Text>
                    </View>
                  )}

                  {/* DIVIDER */}
                  {index < faqs.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        )}

        {/* HELP AND SUPPORT CARD */}
        <View style={styles.helpSection}>
          <Pressable
            onPress={handleSupport}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.helpCard,
              pressed && styles.helpCardPressed,
            ]}
          >
            <View style={styles.helpTopRow}>
              <View style={styles.helpLine} />

              <View style={styles.helpIcon}>
                <Ionicons
                  name="headset-outline"
                  size={scale(17)}
                  color={colors.white}
                />
              </View>

              <View style={styles.helpLine} />
            </View>

            <Text style={styles.helpTitle}>Need More Help?</Text>

            <Text style={styles.helpDescription}>
              Have a question about your food, restaurant, payment or delivery?
              BAKASURAN is here to help you with your ordering journey.
            </Text>

            <View style={styles.helpButton}>
              <Text style={styles.helpButtonText}>
                Visit Help &amp; Support
              </Text>

              <Ionicons
                name="arrow-forward"
                size={scale(13)}
                color={colors.white}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===========================================================
// STYLES
// ===========================================================

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    contentContainer: {
      paddingHorizontal: scale(15),
      paddingTop: scale(16),
      paddingBottom: scale(25),
    },

    // HEADER
    header: {
      height: scale(54),
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(15),
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },

    backButton: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    backButtonPressed: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    headerTitle: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: scale(17),
      lineHeight: scale(22),
      color: colors.text,
      textAlign: "center",
      marginHorizontal: scale(8),
    },

    headerRightSpace: {
      width: scale(34),
    },

    // LOADING / ERROR / EMPTY STATE
    statusContainer: {
      minHeight: scale(150),
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(20),
      paddingVertical: scale(24),
      backgroundColor: colors.card,
      borderRadius: scale(11),
      borderWidth: 1,
      borderColor: colors.border,
      gap: scale(10),
    },

    statusText: {
      fontFamily: Fonts.regular,
      fontSize: scale(13),
      lineHeight: scale(19),
      color: colors.textSecondary,
      textAlign: "center",
    },

    retryButton: {
      marginTop: scale(4),
      paddingHorizontal: scale(18),
      paddingVertical: scale(9),
      borderRadius: scale(20),
      backgroundColor: colors.primary,
    },

    retryButtonPressed: {
      opacity: 0.75,
    },

    retryButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: scale(12),
      color: colors.white,
    },

    // FAQ CONTAINER
    faqContainer: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: scale(11),
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },

    faqItem: {
      width: "100%",
      backgroundColor: colors.card,
    },

    // QUESTION ROW
    questionRow: {
      width: "100%",
      minHeight: scale(60),
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(12),
      paddingVertical: scale(9),
      backgroundColor: colors.card,
    },

    questionRowActive: {
      backgroundColor: colors.backgroundElement,
    },

    questionRowPressed: {
      opacity: 0.7,
    },

    // QUESTION NUMBER
    numberContainer: {
      width: scale(29),
      alignItems: "flex-start",
      justifyContent: "center",
    },

    numberText: {
      fontFamily: Fonts.semiBold,
      fontSize: scale(16),
      letterSpacing: 0.5,
      color: colors.gold,
    },

    // QUESTION TEXT
    questionContent: {
      flex: 1,
      paddingRight: scale(8),
      justifyContent: "center",
    },

    questionText: {
      fontFamily: Fonts.regular,
      fontSize: scale(16),
      lineHeight: scale(20),
      color: colors.text,
    },

    questionTextActive: {
      color: colors.primaryLight,
    },

    // EXPAND BUTTON
    expandButton: {
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.border,
    },

    expandButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    // ANSWER
    answerContainer: {
      paddingLeft: scale(41),
      paddingRight: scale(38),
      paddingTop: scale(1),
      paddingBottom: scale(14),
      backgroundColor: colors.backgroundElement,
    },

    answerText: {
      fontFamily: Fonts.regular,
      fontSize: scale(15),
      lineHeight: scale(20),
      color: colors.textSecondary,
    },

    // DIVIDER
    divider: {
      width: "100%",
      height: 1,
      backgroundColor: colors.divider,
    },

    // HELP SECTION
    helpSection: {
      marginTop: scale(20),
    },

    helpCard: {
      width: "100%",
      borderRadius: scale(13),
      paddingHorizontal: scale(17),
      paddingVertical: scale(15),
      backgroundColor: colors.gradientEnd,
      borderWidth: 1,
      borderColor: "rgba(245,181,27,0.22)",
      alignItems: "center",

      // Use boxShadow on web to avoid the shadow* deprecation.
      // Native platforms retain their standard shadow properties.
      ...Platform.select({
        web: {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.35)",
        },
        default: {
          shadowColor: colors.logoBlack,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 5,
        },
      }),
    },

    helpCardPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }],
    },

    helpTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(3),
    },

    helpLine: {
      width: scale(25),
      height: 1,
      backgroundColor: colors.goldDark,
      opacity: 0.7,
    },

    helpIcon: {
      width: scale(29),
      height: scale(29),
      borderRadius: scale(15),
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: scale(7),
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.goldDark,
    },

    helpTitle: {
      fontFamily: Fonts.bold,
      fontSize: scale(17),
      lineHeight: scale(22),
      color: colors.gold,
      textAlign: "center",
      marginBottom: scale(4),
    },

    helpDescription: {
      fontFamily: Fonts.regular,
      fontSize: scale(14),
      lineHeight: scale(20),
      color: colors.white,
      opacity: 0.92,
      textAlign: "center",
      maxWidth: scale(310),
    },

    helpButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: scale(9),
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(20),
      backgroundColor: colors.primary,
    },

    helpButtonText: {
      fontFamily: Fonts.regular,
      fontSize: scale(14),
      color: colors.white,
      marginRight: scale(5),
    },

    // BOTTOM SPACE
    bottomSpace: {
      height: scale(12),
    },
  });
