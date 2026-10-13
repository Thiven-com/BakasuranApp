import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const termsSections = [
  {
    icon: "document-text-outline",
    title: "1. Introduction",
    content:
      "Welcome to Bakasuran. These Terms & Conditions govern your access to and use of the Bakasuran application and its food ordering and delivery services. By accessing or using the app, you agree to these terms. ",
  },
  {
    icon: "person-outline",
    title: "2. User Eligibility",
    content:
      "You must have the legal capacity required to enter into an agreement under applicable law to use our services independently. If you are not legally able to enter into an agreement, you may use the service only with appropriate involvement from a parent, guardian, or other legally authorized person, where permitted by law.",
  },
  {
    icon: "person-circle-outline",
    title: "3. Account Registration",
    content:
      "You are responsible for providing accurate account information and keeping your login credentials and verification codes secure. Please notify us if you suspect unauthorized access to your account. We may restrict or suspend accounts when reasonably necessary for security, suspected fraud, or compliance with applicable law.",
  },
  {
    icon: "restaurant-outline",
    title: "4. Food Ordering",
    content:
      "You may use Bakasuran to browse available food items and place orders from participating restaurants. Menu descriptions, prices, availability, photographs, and preparation times may change. An order is subject to acceptance and confirmation. Restaurants are responsible for preparing the food they offer.",
  },
  {
    icon: "cash-outline",
    title: "5. Prices and Payments",
    content:
      "The amount payable may include item prices, applicable taxes, delivery charges, platform fees, and other charges disclosed before checkout. Payments must be made using the payment methods offered in the app. Payment processing may be handled by third-party providers under their applicable terms.",
  },
  {
    icon: "bicycle-outline",
    title: "6. Delivery",
    content:
      "Delivery estimates are approximate and may be affected by restaurant preparation, traffic, weather, location, and other circumstances. You are responsible for providing a complete and accurate delivery address and reachable contact details. Please follow reasonable delivery instructions and cooperate with delivery personnel.",
  },
  {
    icon: "close-circle-outline",
    title: "7. Cancellations",
    content:
      "Cancellation eligibility depends on the order status and the applicable cancellation policy displayed in the app. Orders that have already been accepted or prepared may have limited cancellation options. Any cancellation charge or restriction must be consistent with applicable law and the terms disclosed to you.",
  },
  {
    icon: "wallet-outline",
    title: "8. Refunds and Complaints",
    content:
      "If an order is missing, incorrect, damaged, or otherwise unsatisfactory, contact customer support with the relevant order details. Refund eligibility, amount, and processing time depend on the circumstances, payment method, and applicable policy. Nothing in these terms removes consumer rights that cannot legally be excluded.",
  },
  {
    icon: "nutrition-outline",
    title: "9. Food Information and Allergies",
    content:
      "Food ingredients, allergens, dietary suitability, and preparation practices are generally determined by the restaurant. If you have an allergy or dietary restriction, contact the restaurant before ordering. We cannot guarantee that food is free from a particular allergen unless this has been expressly confirmed by an appropriate source.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "10. Acceptable Use",
    content:
      "You must not misuse the app, submit false information, engage in fraudulent transactions, interfere with its operation, attempt unauthorized access, harass restaurants or delivery personnel, or use the service for unlawful purposes. We may investigate suspected misuse and take proportionate action where appropriate.",
  },
  
  {
    icon: "lock-closed-outline",
    title: "11. Privacy",
    content:
      "Your personal information is handled in accordance with the Bakasuran Privacy Policy. Information may be used as reasonably necessary to manage accounts, process orders, coordinate delivery, handle payments, provide support, maintain security, and meet legal obligations.",
  },
  {
    icon: "warning-outline",
    title: "12. Service Availability",
    content:
      "We aim to keep the service available and functioning correctly but cannot guarantee uninterrupted access. Features may be updated, suspended, or discontinued for maintenance, operational needs, security, or legal reasons. We will take reasonable steps where appropriate to minimize disruption.",
  },
  
  {
    icon: "ban-outline",
    title: "13. Suspension and Termination",
    content:
      "You may stop using the app at any time. We may restrict or suspend access where reasonably necessary due to security concerns, material breaches of these terms, suspected fraud, or legal requirements. Account closure does not remove obligations or rights that arose before closure.",
  },
  {
    icon: "create-outline",
    title: "14. Changes to These Terms",
    content:
      "We may revise these Terms & Conditions to reflect changes to our services, business practices, or legal requirements. Updated terms will be made available in the app or through another appropriate channel, with an updated effective date where applicable.",
  },
  
  {
    icon: "mail-outline",
    title: "15. Contact Us",
    content:
      "For questions about these Terms & Conditions, orders, cancellations, or complaints, contact the Bakasuran support team using the verified contact details provided in the app or on the official Bakasuran website.",
  },
];

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.white}
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Terms <Text style={styles.headerTitleRed}>& Conditions</Text>
          </Text>

          <Text style={styles.headerSubtitle}>
            Please read before using Bakasuran
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={Colors.primary}
          />
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* INTRODUCTION CARD */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="reader-outline"
              size={32}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.introTitle}>
            Terms of Service
          </Text>

          <Text style={styles.introDescription}>
            These terms explain the rules, responsibilities,
            and conditions that apply when you use Bakasuran.
          </Text>

          
        </View>

        {/* TERMS SECTIONS */}
        {termsSections.map((section) => (
          <View
            key={section.title}
            style={styles.sectionCard}
          >
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name={section.icon}
                  size={20}
                  color={Colors.primary}
                />
              </View>

              <Text style={styles.sectionTitle}>
                {section.title}
              </Text>
            </View>

            <Text style={styles.sectionContent}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Ionicons
            name="heart"
            size={28}
            color={Colors.primary}
          />

          <Text style={styles.footerTitle}>
            Thank you for choosing Bakasuran!
          </Text>

          <Text style={styles.footerSubtitle}>
            Enjoy your food and order responsibly.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: "800",
  },

  headerTitleRed: {
    color: Colors.primary,
  },

  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
  },

  introCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    alignItems: "center",
  },

  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  introTitle: {
    color: Colors.textPrimary,
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.regular,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 9,
  },

  introDescription: {
    color: Colors.textSecondary,
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.regular,
    lineHeight: 22,
    textAlign: "center",
  },

 

  sectionCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  sectionTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.regular,
    fontWeight: "700",
  },

  sectionContent: {
    color: Colors.textSecondary,
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.regular,
    lineHeight: 23,
  },

  footer: {
    alignItems: "center",
    paddingTop: 22,
    paddingBottom: 10,
  },

  footerTitle: {
    color: Colors.textPrimary,
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.regular,
    fontWeight: "600",
    marginTop: 9,
    textAlign: "center",
  },

  footerSubtitle: {
    color: Colors.textMuted,
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,
    marginTop: 5,
    textAlign: "center",
  },

  bottomSpace: {
    height: 20,
  },
});
