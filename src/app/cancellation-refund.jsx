import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const faqs = [
  {
    question: "Can I cancel my order?",
    icon: "help-outline",
    answer:
      "You can request cancellation shortly after placing your order. Open My Orders, select your order, and check whether cancellation is available. Orders already being prepared or delivered may not be cancellable.",
  },
  {
    question: "How long does a refund take?",
    icon: "cash-outline",
    answer:
      "Eligible online-payment refunds are generally processed within 3–5 business days. The actual time depends on your payment provider and bank.",
  },
  {
    question: "Will I get a full refund?",
    icon: "cube-outline",
    answer:
      "Refund eligibility depends on the order status, cancellation reason, and applicable refund policy. The final amount will be shown when your refund is confirmed.",
  },
];

export default function CancellationRefundScreen() {
  const { colors: Colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState("cancellation");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const scrollRef = useRef(null);
  const cancellationY = useRef(0);
  const refundY = useRef(0);

  const compact = width < 380;

  const horizontalPadding = compact ? 14 : 20;
  const cardGap = 12;

  const paymentCardWidth = (width - horizontalPadding * 2 - cardGap - 24) / 2;

  const selectTab = (tab) => {
    setActiveTab(tab);

    const y = tab === "cancellation" ? cancellationY.current : refundY.current;

    scrollRef.current?.scrollTo({
      y: Math.max(0, y - 12),
      animated: true,
    });
  };

  const goToOrders = () => {
    router.push("/orders");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={Colors.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================
            HERO
        ========================================= */}

        <View style={styles.hero}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={29}
              color={isDark ? "#B8C0CC" : "#4B5563"}
            />
          </Pressable>

          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Cancellation{"\n"}& Refund</Text>

            <Text style={styles.heroDescription}>
              We understand plans can change. Here’s everything you need to know
              about cancellations and refunds.
            </Text>
          </View>

          {/* =========================================
              HERO ART
          ========================================= */}

          <View
            style={[
              styles.heroArt,
              {
                width: width * 0.43,
                height: width * 0.43,
              },
            ]}
          >
            <View style={styles.artGlow} />

            <Ionicons
              name="arrow-undo"
              size={42}
              color={Colors.primary}
              style={styles.artArrow}
            />

            <View style={styles.receipt}>
              <View style={styles.receiptLine} />
              <View style={styles.receiptLine} />
              <View style={styles.receiptLine} />
              <View style={styles.receiptLineShort} />
            </View>

            <View style={styles.shoppingBag}>
              <View style={styles.bagHandle} />

              <Ionicons
                name="restaurant-outline"
                size={43}
                color={Colors.white}
              />
            </View>

            <View style={styles.cancelCircle}>
              <Ionicons name="close" size={49} color={Colors.white} />
            </View>

            <View style={styles.artBase} />
          </View>
        </View>

        {/* =========================================
            SECTION TABS
        ========================================= */}

        <View style={styles.tabs}>
          <Pressable
            onPress={() => selectTab("cancellation")}
            style={[
              styles.tab,
              activeTab === "cancellation" && styles.activeTab,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={29}
              color={Colors.white}
            />

            <Text style={styles.tabText}>Order Cancellation</Text>
          </Pressable>

          <Pressable
            onPress={() => selectTab("refund")}
            style={[styles.tab, activeTab === "refund" && styles.activeTab]}
          >
            <Ionicons name="cash-outline" size={29} color={Colors.white} />

            <Text style={styles.tabText}>Refund Policy</Text>
          </Pressable>
        </View>

        {/* =========================================
            CANCELLATION PROCESS
        ========================================= */}

        <View
          style={styles.panel}
          onLayout={(event) => {
            cancellationY.current = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.panelTitle}>Order Cancellation</Text>

          <Text style={styles.panelDescription}>
            You can request cancellation shortly after placing your order,
            subject to its current status.
          </Text>

          <View style={styles.timeline}>
            {/* STEP 1 */}

            <View style={styles.timelineStep}>
              <View style={styles.stepIconActive}>
                <Ionicons
                  name="document-text-outline"
                  size={31}
                  color={Colors.white}
                />
              </View>

              <Text style={styles.stepTitle}>Request{"\n"}Cancellation</Text>

              <Text style={styles.stepDescription}>
                Go to My Orders and select Cancel
              </Text>
            </View>

            {/* STEP 2 */}

            <View style={styles.timelineStep}>
              <View style={styles.stepIcon}>
                <Ionicons
                  name="storefront-outline"
                  size={32}
                  color={Colors.white}
                />
              </View>

              <Text style={styles.stepTitle}>Approval{"\n"}by Restaurant</Text>

              <Text style={styles.stepDescription}>
                We’ll send your request to the restaurant
              </Text>
            </View>

            {/* STEP 3 */}

            <View style={styles.timelineStep}>
              <View style={styles.stepIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={32}
                  color={Colors.white}
                />
              </View>

              <Text style={styles.stepTitle}>Get Notified</Text>

              <Text style={styles.stepDescription}>
                You’ll receive an update on your request
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={goToOrders}
          >
            <Text style={styles.actionButtonText}>Go to My Orders</Text>

            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </Pressable>
        </View>

        {/* =========================================
            REFUND POLICY
        ========================================= */}

        <View
          style={styles.panel}
          onLayout={(event) => {
            refundY.current = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.panelTitle}>Refund Policy</Text>

          <Text style={styles.panelDescription}>
            If your order is cancelled, any eligible refund will be processed
            according to the payment method used.
          </Text>

          <View style={styles.paymentCards}>
            {/* ONLINE PAYMENT */}

            <View
              style={[
                styles.paymentCard,
                {
                  width: paymentCardWidth,
                },
              ]}
            >
              <View style={styles.paymentIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={29}
                  color={Colors.white}
                />
              </View>

              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentTitle}>Online Payment</Text>

                <Text style={styles.paymentDescription}>
                  Eligible refunds are generally processed within 3–5 business
                  days.
                </Text>
              </View>
            </View>

            {/* CASH ON DELIVERY */}

            <View
              style={[
                styles.paymentCard,
                {
                  width: paymentCardWidth,
                },
              ]}
            >
              <View style={styles.paymentIcon}>
                <Ionicons name="cash-outline" size={29} color={Colors.white} />
              </View>

              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentTitle}>Cash on Delivery</Text>

                <Text style={styles.paymentDescription}>
                  Eligible refunds may be provided as wallet credit or another
                  approved method.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =========================================
            FAQ
        ========================================= */}

        <View style={styles.faqSection}>
          <Text style={styles.faqHeading}>Frequently Asked Questions</Text>

          {faqs.map((item, index) => {
            const expanded = expandedFaq === index;

            return (
              <View key={item.question} style={styles.faqCard}>
                <Pressable
                  onPress={() => setExpandedFaq(expanded ? null : index)}
                  style={styles.faqQuestion}
                >
                  <View style={styles.faqIcon}>
                    <Ionicons name={item.icon} size={23} color={Colors.white} />
                  </View>

                  <Text style={styles.faqQuestionText}>{item.question}</Text>

                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={23}
                    color={Colors.white}
                  />
                </Pressable>

                {expanded && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* =========================================
            FOOTER
        ========================================= */}

        <Text style={styles.footer}>Bakasuran · Cancellation & Refund</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (Colors) => {
  return StyleSheet.create({
    // =========================================
    // SCREEN
    // =========================================

    safeArea: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    screen: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    content: {
      paddingTop: 8,
      paddingBottom: 35,
    },

    // =========================================
    // HERO
    // =========================================

    hero: {
      minHeight: 320,
      flexDirection: "row",
      alignItems: "flex-end",
      position: "relative",
      paddingTop: 10,
      paddingBottom: 50,
    },

    backButton: {
      position: "absolute",
      top: 8,
      left: 5,
      zIndex: 5,
      width: 55,
      height: 55,
      borderRadius: 28,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    heroText: {
      width: "57%",
      zIndex: 2,
      paddingBottom: 5,
    },

    heroTitle: {
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.lg,
      lineHeight: 38,
      letterSpacing: -0.7,
      color: Colors.textPrimary,
      marginBottom: 10,
    },

    heroDescription: {
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.base,
      lineHeight: 22,
      color: Colors.textSecondary,
    },

    // =========================================
    // HERO ART
    // =========================================

    heroArt: {
      position: "absolute",
      right: -2,
      bottom: 16,
      borderRadius: 200,
      backgroundColor: "#230506",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },

    artGlow: {
      position: "absolute",
      width: "80%",
      height: "80%",
      borderRadius: 200,
      backgroundColor: "#3B080B",
    },

    artArrow: {
      position: "absolute",
      top: 12,
      right: 31,
      transform: [{ rotate: "25deg" }],
    },

    receipt: {
      position: "absolute",
      top: "27%",
      right: "13%",
      width: "33%",
      height: "52%",
      backgroundColor: "#E7D0D0",
      borderRadius: 7,
      transform: [{ rotate: "12deg" }],
      paddingTop: 15,
      paddingHorizontal: 8,
      gap: 9,
    },

    receiptLine: {
      height: 4,
      width: "90%",
      backgroundColor: "#B89E9E",
      borderRadius: 3,
    },

    receiptLineShort: {
      height: 4,
      width: "60%",
      backgroundColor: "#B89E9E",
      borderRadius: 3,
    },

    shoppingBag: {
      position: "absolute",
      left: "15%",
      bottom: "10%",
      width: "53%",
      height: "57%",
      backgroundColor: Colors.primary,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      elevation: 8,
      zIndex: 2,
    },

    bagHandle: {
      position: "absolute",
      top: -14,
      width: "48%",
      height: 31,
      borderWidth: 5,
      borderColor: Colors.primaryLight,
      borderBottomWidth: 0,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },

    cancelCircle: {
      position: "absolute",
      zIndex: 3,
      bottom: "7%",
      right: "21%",
      width: "34%",
      aspectRatio: 1,
      borderRadius: 100,
      borderWidth: 4,
      borderColor: Colors.primaryDark,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    artBase: {
      position: "absolute",
      bottom: "5%",
      width: "95%",
      height: 7,
      borderRadius: 100,
      backgroundColor: Colors.primaryDark,
    },

    // =========================================
    // TABS
    // =========================================

    tabs: {
      flexDirection: "row",
      borderWidth: 1.5,
      borderColor: Colors.border,
      borderRadius: 22,
      overflow: "hidden",
      marginBottom: 20,
      backgroundColor: Colors.backgroundElement,
    },

    tab: {
      flex: 1,
      minHeight: 66,
      paddingHorizontal: 7,
      paddingVertical: 9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    activeTab: {
      backgroundColor: Colors.primary,
      borderRadius: 20,
    },

    tabText: {
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.base,
      flexShrink: 1,
    },

    // =========================================
    // PANELS
    // =========================================

    panel: {
      padding: 17,
      marginBottom: 18,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: Colors.divider,
      backgroundColor: Colors.card,
    },

    panelTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xxl,
      lineHeight: 30,
      marginBottom: 3,
    },

    panelDescription: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.base,
      lineHeight: 22,
      marginBottom: 20,
    },

    // =========================================
    // TIMELINE
    // =========================================

    timeline: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 5,
    },

    timelineStep: {
      flex: 1,
      alignItems: "center",
    },

    stepIconActive: {
      width: 67,
      height: 67,
      borderRadius: 36,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },

    stepIcon: {
      width: 67,
      height: 67,
      borderRadius: 36,
      backgroundColor: Colors.borderLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },

    stepTitle: {
      color: Colors.textPrimary,
      textAlign: "center",
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.base,
      lineHeight: 19,
      minHeight: 39,
    },

    stepDescription: {
      color: Colors.textSecondary,
      textAlign: "center",
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.md,
      lineHeight: 18,
      marginTop: 4,
    },

    // =========================================
    // ACTION BUTTON
    // =========================================

    actionButton: {
      backgroundColor: Colors.buttonPrimary,
      minHeight: 49,
      borderRadius: 15,
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    actionButtonPressed: {
      backgroundColor: Colors.buttonPressed,
    },

    actionButtonText: {
      color: Colors.buttonText,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
    },

    // =========================================
    // PAYMENT CARDS
    // =========================================

    paymentCards: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },

    paymentCard: {
      minHeight: 190,
      padding: 12,
      borderRadius: 19,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      alignItems: "flex-start",
    },

    paymentIcon: {
      width: 56,
      height: 56,
      borderRadius: 30,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 13,
    },

    paymentTextContainer: {
      width: "100%",
    },

    paymentTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
      lineHeight: 20,
      marginBottom: 6,
    },

    paymentDescription: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.md,
      lineHeight: 19,
    },

    // =========================================
    // FAQ
    // =========================================

    faqSection: {
      marginTop: 3,
    },

    faqHeading: {
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xxl,
      lineHeight: 30,
      marginBottom: 13,
      paddingHorizontal: 5,
    },

    faqCard: {
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: Colors.divider,
      backgroundColor: Colors.surface,
      marginBottom: 10,
      overflow: "hidden",
    },

    faqQuestion: {
      minHeight: 65,
      paddingHorizontal: 13,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    faqIcon: {
      width: 43,
      height: 43,
      borderRadius: 23,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    faqQuestionText: {
      flex: 1,
      color: Colors.textPrimary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.base,
      lineHeight: 21,
    },

    faqAnswer: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.md,
      lineHeight: 22,
      paddingHorizontal: 17,
      paddingBottom: 17,
      paddingLeft: 68,
    },

    // =========================================
    // FOOTER
    // =========================================

    footer: {
      color: Colors.textMuted,
      textAlign: "center",
      fontFamily: Fonts.regular,
      fontSize: Fonts.size.xl,
      marginTop: 12,
    },
  });
};
