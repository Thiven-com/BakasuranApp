import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

export default function HelpSupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState("");

  const faqs = [
    {
      id: 1,
      question: "How can I track my order?",
      answer:
        "Go to My Orders from your profile and select your active order. You can view the current order status and delivery information there.",
    },
    {
      id: 2,
      question: "How can I cancel my order?",
      answer:
        "Open My Orders and select the order you want to cancel. If cancellation is available, you will see the cancel option on the order details screen.",
    },
    {
      id: 3,
      question: "What payment methods are available?",
      answer:
        "You can use saved cards, UPI, and Cash on Delivery where available during checkout.",
    },
    {
      id: 4,
      question: "My order is delayed. What should I do?",
      answer:
        "Please check your order status first. If the order is significantly delayed, contact our support team and provide your order number.",
    },
    {
      id: 5,
      question: "How do I change my delivery address?",
      answer:
        "Go to Profile → Addresses and add or update your delivery address before placing your next order.",
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq((previous) =>
      previous === id ? null : id
    );
  };

  const handleCall = () => {
    Linking.openURL("tel:+919876543210").catch(() => {
      Alert.alert(
        "Unable to Call",
        "Calling is not available on this device."
      );
    });
  };

  const handleEmail = () => {
    Linking.openURL(
      "mailto:support@bakasuran.com"
    ).catch(() => {
      Alert.alert(
        "Unable to Open Email",
        "No email application is available."
      );
    });
  };

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert(
        "Message Required",
        "Please enter your message before submitting."
      );
      return;
    }

    Alert.alert(
      "Request Submitted",
      "Thank you. Our support team will get back to you soon.",
      [
        {
          text: "OK",
          onPress: () => setMessage(""),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color={Colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Help & Support
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= TITLE ================= */}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            How can we help?
          </Text>

          <Text style={styles.subtitle}>
            Find answers or contact our support team
          </Text>
        </View>

        {/* ================= CONTACT SUPPORT ================= */}

        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <Ionicons
              name="headset-outline"
              size={30}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.contactTitle}>
            Need Help?
          </Text>

          <Text style={styles.contactText}>
            Our support team is here to help you with
            your orders and account.
          </Text>

          <View style={styles.contactButtons}>
            {/* CALL */}

            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call-outline"
                size={19}
                color={Colors.white}
              />

              <Text style={styles.contactButtonText}>
                Call Us
              </Text>
            </TouchableOpacity>

            {/* EMAIL */}

            <TouchableOpacity
              style={[
                styles.contactButton,
                styles.emailButton,
              ]}
              onPress={handleEmail}
              activeOpacity={0.8}
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color={Colors.white}
              />

              <Text style={styles.contactButtonText}>
                Email Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= QUICK HELP ================= */}

        <Text style={styles.sectionTitle}>
          Quick Help
        </Text>

        <View style={styles.quickHelpCard}>
          {/* ORDERS */}

          <TouchableOpacity
            style={styles.quickHelpRow}
            activeOpacity={0.7}
            onPress={() => router.push("/orders")}
          >
            <View
              style={[
                styles.quickIcon,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.quickContent}>
              <Text style={styles.quickTitle}>
                My Orders
              </Text>

              <Text style={styles.quickSubtitle}>
                Track or manage your orders
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* ADDRESS */}

          <TouchableOpacity
            style={styles.quickHelpRow}
            activeOpacity={0.7}
            onPress={() => router.push("/addresses")}
          >
            <View
              style={[
                styles.quickIcon,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.quickContent}>
              <Text style={styles.quickTitle}>
                Delivery Address
              </Text>

              <Text style={styles.quickSubtitle}>
                Manage your saved addresses
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* PAYMENT */}

          <TouchableOpacity
            style={[
              styles.quickHelpRow,
              styles.lastQuickHelpRow,
            ]}
            activeOpacity={0.7}
            onPress={() => router.push("/payments")}
          >
            <View
              style={[
                styles.quickIcon,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="card-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.quickContent}>
              <Text style={styles.quickTitle}>
                Payment Methods
              </Text>

              <Text style={styles.quickSubtitle}>
                Manage your payment options
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* ================= FAQ ================= */}

        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqCard}>
          {faqs.map((faq, index) => {
            const isExpanded =
              expandedFaq === faq.id;

            return (
              <View
                key={faq.id}
                style={[
                  styles.faqItem,
                  index === faqs.length - 1 &&
                    styles.lastFaqItem,
                ]}
              >
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.questionIcon}>
                    <Ionicons
                      name="help-circle-outline"
                      size={19}
                      color={Colors.warning}
                    />
                  </View>

                  <Text style={styles.questionText}>
                    {faq.question}
                  </Text>

                  <Ionicons
                    name={
                      isExpanded
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={19}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ================= CONTACT MESSAGE ================= */}

        <Text style={styles.sectionTitle}>
          Contact Support
        </Text>

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Send us a message
          </Text>

          <Text style={styles.messageSubtitle}>
            Tell us how we can help you.
          </Text>

          <View style={styles.textInputContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={Colors.textSecondary}
            />

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Write your message..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
              style={styles.messageInput}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send-outline"
              size={20}
              color={Colors.white}
            />

            <Text style={styles.submitText}>
              Send Message
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= SUPPORT INFO ================= */}

        <View style={styles.supportInfo}>
          <View style={styles.supportInfoIcon}>
            <Ionicons
              name="time-outline"
              size={19}
              color={Colors.primary}
            />
          </View>

          <View style={styles.supportInfoContent}>
            <Text style={styles.supportInfoTitle}>
              Support Hours
            </Text>

            <Text style={styles.supportInfoText}>
              Monday - Sunday • 9:00 AM - 10:00 PM
            </Text>
          </View>
        </View>

        {/* ================= BOTTOM ================= */}

        <Text style={styles.bottomText}>
          BAKASURAN Support
        </Text>

        <Text style={styles.versionText}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 45,
  },

  /* ================= HEADER ================= */

  header: {
    height: 62,
    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: Colors.card,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: Colors.border,
  },

  headerTitle: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xxl,
  },

  headerSpace: {
    width: 42,
  },

  /* ================= TITLE ================= */

  titleContainer: {
    marginTop: 22,
    marginBottom: 18,
  },

  title: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.xxl,
  },

  subtitle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginTop: 6,
  },

  /* ================= CONTACT ================= */

  contactCard: {
    backgroundColor: Colors.card,

    borderRadius: 20,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 20,

    alignItems: "center",
  },

  contactIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,

    backgroundColor: Colors.backgroundSecondary,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 12,
  },

  contactTitle: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.xl,
  },

  contactText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    textAlign: "center",

    lineHeight: 18,

    marginTop: 6,
    paddingHorizontal: 12,
  },

  contactButtons: {
    width: "100%",

    flexDirection: "row",

    gap: 10,

    marginTop: 17,
  },

  contactButton: {
    flex: 1,

    height: 47,
    borderRadius: 24,

    backgroundColor: Colors.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  emailButton: {
    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  contactButtonText: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,

    marginLeft: 7,
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.xl,

    marginTop: 27,
    marginBottom: 13,
  },

  /* ================= QUICK HELP ================= */

  quickHelpCard: {
    backgroundColor: Colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,

    overflow: "hidden",
  },

  quickHelpRow: {
    minHeight: 72,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  lastQuickHelpRow: {
    borderBottomWidth: 0,
  },

  quickIcon: {
    width: 44,
    height: 44,

    borderRadius: 13,

    justifyContent: "center",
    alignItems: "center",
  },

  quickContent: {
    flex: 1,

    marginLeft: 12,
  },

  quickTitle: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.base,
  },

  quickSubtitle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    marginTop: 4,
  },

  /* ================= FAQ ================= */

  faqCard: {
    backgroundColor: Colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,

    overflow: "hidden",
  },

  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  lastFaqItem: {
    borderBottomWidth: 0,
  },

  faqQuestion: {
    minHeight: 64,

    paddingHorizontal: 13,

    flexDirection: "row",
    alignItems: "center",
  },

  questionIcon: {
    width: 44,
    height: 44,

    borderRadius: 10,

    backgroundColor: Colors.backgroundSecondary,

    justifyContent: "center",
    alignItems: "center",
  },

  questionText: {
    flex: 1,

    color: Colors.white,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.base,

    marginHorizontal: 10,

    lineHeight: 18,
  },

  answerContainer: {
    paddingHorizontal: 58,
    paddingBottom: 15,
  },

  answerText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    lineHeight: 19,
  },

  /* ================= MESSAGE ================= */

  messageCard: {
    backgroundColor: Colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 16,
  },

  messageTitle: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.xl,
  },

  messageSubtitle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,

    marginTop: 5,
    marginBottom: 13,
  },

  textInputContainer: {
    minHeight: 115,

    backgroundColor: Colors.backgroundSecondary,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 13,

    flexDirection: "row",
    alignItems: "flex-start",
  },

  messageInput: {
    flex: 1,

    minHeight: 85,

    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginLeft: 9,
    paddingTop: 0,
  },

  submitButton: {
    height: 53,

    borderRadius: 27,

    backgroundColor: Colors.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 14,
  },

  submitText: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xxl,

    marginLeft: 8,
  },

  /* ================= SUPPORT INFO ================= */

  supportInfo: {
    backgroundColor: Colors.backgroundSecondary,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 13,

    flexDirection: "row",
    alignItems: "center",

    marginTop: 18,
  },

  supportInfoIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: Colors.surface,

    justifyContent: "center",
    alignItems: "center",
  },

  supportInfoContent: {
    flex: 1,

    marginLeft: 11,
  },

  supportInfoTitle: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  supportInfoText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    marginTop: 4,
  },

  /* ================= BOTTOM ================= */

  bottomText: {
    color: Colors.textMuted,

    textAlign: "center",

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xs,

    letterSpacing: 2,

    marginTop: 27,
  },

  versionText: {
    color: Colors.textMuted,

    textAlign: "center",

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,

    marginTop: 4,
  },
});