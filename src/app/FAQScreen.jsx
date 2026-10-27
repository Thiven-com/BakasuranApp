
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";
import { getFAQs } from "../utils/Function";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const scale = (size) =>
  Math.round(size * Math.min(SCREEN_WIDTH / 375, 1.12));

export default function FAQScreen() {
  const [expandedId, setExpandedId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // GET FAQ API
  // =========================================================

  const loadFAQs = useCallback(async () => {
    try {
      setErrorMessage("");

      const response = await getFAQs();

      console.log(
        "FAQ API RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      // Support common API response formats
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
          id:
            item?.id ??
            item?.faq_id ??
            item?.faqId ??
            index + 1,

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
            String(item.question).trim() &&
            String(item.answer).trim()
        );

      setFaqs(formattedFAQs);
    } catch (error) {
      console.error(
        "FAQ GET API ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load FAQs. Please try again."
      );
    }
  }, []);

  // =========================================================
  // CALL API WHEN SCREEN MOUNTS
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
    setExpandedId((currentId) =>
      currentId === id ? null : id
    );
  };

  // =========================================================
  // HELP AND SUPPORT
  // =========================================================

  const handleSupport = () => {
    router.push("/help&support");
  };

  // =========================================================
  // SCREEN UI
  // =========================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.backgroundDark}
        translucent={false}
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={scale(20)}
            color={Colors.iconPrimary}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Frequently Asked Questions
        </Text>

        <View style={styles.headerRightSpace} />
      </View>

      {/* =====================================================
          FAQ CONTENT
      ====================================================== */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ===================================================
            ERROR STATE
        ==================================================== */}

        {errorMessage ? (
          <View style={styles.statusContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={scale(28)}
              color={Colors.primary}
            />

            <Text style={styles.statusText}>
              {errorMessage}
            </Text>

            <Pressable
              onPress={loadFAQs}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
            >
              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : faqs.length === 0 ? (
          /* =================================================
             EMPTY DATA
          ================================================== */

          <View style={styles.statusContainer}>
            <Ionicons
              name="help-circle-outline"
              size={scale(28)}
              color={Colors.iconSecondary}
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
              <Text style={styles.retryButtonText}>
                Refresh
              </Text>
            </Pressable>
          </View>
        ) : (
          /* =================================================
             FAQ LIST
          ================================================== */

          <View style={styles.faqContainer}>
            {faqs.map((item, index) => {
              const isExpanded =
                expandedId === item.id;

              return (
                <View
                  key={String(item.id)}
                  style={styles.faqItem}
                >
                  {/* =========================================
                      QUESTION
                  ========================================== */}

                  <Pressable
                    onPress={() =>
                      toggleFAQ(item.id)
                    }
                    style={({ pressed }) => [
                      styles.questionRow,
                      isExpanded &&
                        styles.questionRowActive,
                      pressed &&
                        styles.questionRowPressed,
                    ]}
                  >
                    {/* QUESTION NUMBER */}

                    <View
                      style={styles.numberContainer}
                    >
                      <Text
                        style={styles.numberText}
                      >
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </Text>
                    </View>

                    {/* QUESTION TEXT */}

                    <View
                      style={styles.questionContent}
                    >
                      <Text
                        style={[
                          styles.questionText,
                          isExpanded &&
                            styles.questionTextActive,
                        ]}
                      >
                        {item.question}
                      </Text>
                    </View>

                    {/* EXPAND ICON */}

                    <View
                      style={[
                        styles.expandButton,
                        isExpanded &&
                          styles.expandButtonActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          isExpanded
                            ? "remove"
                            : "add"
                        }
                        size={scale(16)}
                        color={
                          isExpanded
                            ? Colors.white
                            : Colors.iconSecondary
                        }
                      />
                    </View>
                  </Pressable>

                  {/* =========================================
                      ANSWER
                  ========================================== */}

                  {isExpanded && (
                    <View
                      style={
                        styles.answerContainer
                      }
                    >
                      <Text
                        style={styles.answerText}
                      >
                        {item.answer}
                      </Text>
                    </View>
                  )}

                  {/* =========================================
                      DIVIDER
                  ========================================== */}

                  {index < faqs.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ===================================================
            HELP AND SUPPORT CARD
        ==================================================== */}

        <View style={styles.helpSection}>
          <Pressable
            onPress={handleSupport}
            style={({ pressed }) => [
              styles.helpCard,
              pressed &&
                styles.helpCardPressed,
            ]}
          >
            <View style={styles.helpTopRow}>
              <View style={styles.helpLine} />

              <View style={styles.helpIcon}>
                <Ionicons
                  name="headset-outline"
                  size={scale(17)}
                  color={Colors.white}
                />
              </View>

              <View style={styles.helpLine} />
            </View>

            <Text style={styles.helpTitle}>
              Need More Help?
            </Text>

            <Text
              style={styles.helpDescription}
            >
              Have a question about your food,
              restaurant, payment or delivery?
              BAKASURAN is here to help you with
              your ordering journey.
            </Text>

            <View style={styles.helpButton}>
              <Text
                style={styles.helpButtonText}
              >
                Visit Help & Support
              </Text>

              <Ionicons
                name="arrow-forward"
                size={scale(13)}
                color={Colors.white}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  contentContainer: {
    paddingHorizontal: scale(15),
    paddingTop: scale(16),
    paddingBottom: scale(25),
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    height: scale(54),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(15),
    backgroundColor: Colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  backButton: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  backButtonPressed: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  headerTitle: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: scale(17),
    lineHeight: scale(22),
    color: Colors.textPrimary,
    textAlign: "center",
    marginHorizontal: scale(8),
  },

  headerRightSpace: {
    width: scale(34),
  },

  // =========================================================
  // ERROR / EMPTY STATE
  // =========================================================

  statusContainer: {
    minHeight: scale(150),
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(20),
    paddingVertical: scale(24),
    backgroundColor: Colors.card,
    borderRadius: scale(11),
    borderWidth: 1,
    borderColor: Colors.border,
    gap: scale(10),
  },

  statusText: {
    fontFamily: Fonts.regular,
    fontSize: scale(13),
    lineHeight: scale(19),
    color: Colors.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: scale(4),
    paddingHorizontal: scale(18),
    paddingVertical: scale(9),
    borderRadius: scale(20),
    backgroundColor: Colors.primary,
  },

  retryButtonPressed: {
    opacity: 0.75,
  },

  retryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: scale(12),
    color: Colors.white,
  },

  // =========================================================
  // FAQ CONTAINER
  // =========================================================

  faqContainer: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: scale(11),
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  faqItem: {
    width: "100%",
    backgroundColor: Colors.card,
  },

  // =========================================================
  // QUESTION ROW
  // =========================================================

  questionRow: {
    width: "100%",
    minHeight: scale(60),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: scale(9),
    backgroundColor: Colors.card,
  },

  questionRowActive: {
    backgroundColor: Colors.backgroundLight,
  },

  questionRowPressed: {
    opacity: 0.7,
  },

  // =========================================================
  // NUMBER
  // =========================================================

  numberContainer: {
    width: scale(29),
    alignItems: "flex-start",
    justifyContent: "center",
  },

  numberText: {
    fontFamily: Fonts.semiBold,
    fontSize: scale(16),
    letterSpacing: 0.5,
    color: Colors.gold,
  },

  // =========================================================
  // QUESTION TEXT
  // =========================================================

  questionContent: {
    flex: 1,
    paddingRight: scale(8),
    justifyContent: "center",
  },

  questionText: {
    fontFamily: Fonts.regular,
    fontSize: scale(16),
    lineHeight: scale(20),
    color: Colors.textPrimary,
  },

  questionTextActive: {
    color: Colors.primaryLight,
  },

  // =========================================================
  // EXPAND BUTTON
  // =========================================================

  expandButton: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  expandButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  // =========================================================
  // ANSWER
  // =========================================================

  answerContainer: {
    paddingLeft: scale(41),
    paddingRight: scale(38),
    paddingTop: scale(1),
    paddingBottom: scale(14),
    backgroundColor: Colors.backgroundLight,
  },

  answerText: {
    fontFamily: Fonts.regular,
    fontSize: scale(15),
    lineHeight: scale(18),
    color: Colors.textSecondary,
  },

  // =========================================================
  // DIVIDER
  // =========================================================

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.divider,
  },

  // =========================================================
  // HELP SECTION
  // =========================================================

  helpSection: {
    marginTop: scale(20),
  },

  helpCard: {
    width: "100%",
    borderRadius: scale(13),
    paddingHorizontal: scale(17),
    paddingVertical: scale(15),
    backgroundColor: Colors.gradientEnd,
    borderWidth: 1,
    borderColor: "rgba(245,181,27,0.22)",
    alignItems: "center",

    shadowColor: Colors.logoBlack,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  helpCardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.985,
      },
    ],
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
    backgroundColor: Colors.goldDark,
    opacity: 0.7,
  },

  helpIcon: {
    width: scale(29),
    height: scale(29),
    borderRadius: scale(15),
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: scale(7),
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },

  helpTitle: {
    fontFamily: Fonts.bold,
    fontSize: scale(17),
    lineHeight: scale(18),
    color: Colors.gold,
    textAlign: "center",
    marginBottom: scale(4),
  },

  helpDescription: {
    fontFamily: Fonts.regular,
    fontSize: scale(14),
    lineHeight: scale(15),
    color: Colors.white,
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
    backgroundColor: Colors.primary,
  },

  helpButtonText: {
    fontFamily: Fonts.regular,
    fontSize: scale(14),
    color: Colors.white,
    marginRight: scale(5),
  },

  // =========================================================
  // BOTTOM SPACE
  // =========================================================

  bottomSpace: {
    height: scale(12),
  },
});
