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

const privacySections = [
  {
    icon: "information-circle-outline",
    title: "1. Introduction",
    content:
      "Welcome to Bakasuran. We respect your privacy and are committed to protecting your personal information when you use our food ordering and delivery services.",
  },
  {
    icon: "person-outline",
    title: "2. Information We Collect",
    content:
      "Depending on how you use the app, we may collect your name, mobile number, email address, delivery address, profile information, order history, and information you provide when contacting customer support.",
  },
  {
    icon: "settings-outline",
    title: "3. How We Use Your Information",
    content:
      "We may use your information to create and manage your account, process food orders, arrange deliveries, send order updates, provide customer support, improve the app, and help prevent fraud or unauthorized activity.",
  },
  {
    icon: "location-outline",
    title: "4. Location Information",
    content:
      "If location access is enabled, your location may be used to help identify delivery addresses and support delivery services. You can manage location permissions through your device settings. Features that depend on location may not work without permission.",
  },
  {
    icon: "card-outline",
    title: "5. Payments and Transactions",
    content:
      "Payments may be processed by third-party payment providers. Payment information is handled according to the relevant provider's privacy and security practices. We do not claim to store or process card details ourselves unless our actual payment implementation does so.",
  },
  {
    icon: "share-social-outline",
    title: "6. Sharing of Information",
    content:
      "Where necessary to provide the service, relevant information may be shared with restaurants, delivery partners, payment providers, hosting providers, and customer support providers. We may also disclose information where required by applicable law. We do not sell personal information unless our published policy is updated to state otherwise.",
  },
  {
    icon: "lock-closed-outline",
    title: "7. Data Security",
    content:
      "We use reasonable measures intended to protect your personal information against unauthorized access, misuse, loss, or disclosure. However, no method of electronic transmission or storage can be guaranteed to be completely secure.",
  },
  {
    icon: "time-outline",
    title: "8. Data Retention",
    content:
      "We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including fulfilling orders, maintaining required records, resolving disputes, and complying with applicable legal obligations.",
  },
  {
    icon: "notifications-outline",
    title: "9. Notifications and Preferences",
    content:
      "If enabled, notifications may provide order updates and important service information. You can manage notification permissions in your device settings. Marketing communications, if offered, should be managed using the available preferences or unsubscribe options.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "10. Your Privacy Rights",
    content:
      "Subject to applicable law, you may request access to, correction of, or deletion of your personal information. You may also ask questions about how your information is handled. Some records may need to be retained where legally required.",
  },
  {
    icon: "people-outline",
    title: "11. Children's Privacy",
    content:
      "Bakasuran is not intended to collect children's personal information unnecessarily. If you believe a child has provided personal information inappropriately, please contact us so we can review the matter.",
  },
  {
    icon: "document-text-outline",
    title: "12. Policy Updates",
    content:
      "We may update this Privacy Policy when our services, data practices, or legal requirements change. The revised policy will be published with an updated effective date.",
  },
  {
    icon: "mail-outline",
    title: "13. Contact Us",
    content:
      "For questions, privacy requests, or concerns about your personal information, contact the Bakasuran support team using the contact details published in the app or on our official website.",
  },
];

export default function PrivacyPolicyScreen() {
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
            size={25}
            color={Colors.white}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Privacy <Text style={styles.headerTitleRed}>Policy</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Your privacy matters to us
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons
            name="shield-checkmark-outline"
            size={25}
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
        {/* INTRO CARD */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="shield-checkmark"
              size={30}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.introTitle}>
            Your Data. Your Privacy.
          </Text>

          <Text style={styles.introDescription}>
            Learn how Bakasuran may collect, use, and protect
            your information while you enjoy our services.
          </Text>

          
        </View>

        {/* PRIVACY SECTIONS */}
        {privacySections.map((section) => (
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

          <Text style={styles.footerText}>
            Thank you for choosing Bakasuran.
          </Text>

          <Text style={styles.footerSubtext}>
            We value your trust and privacy.
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

  headerTitleContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.regular,
    fontWeight: "800",
  },

  headerTitleRed: {
    color: Colors.primary,
  },

  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.regular,
    marginTop: 10,
  },

  headerRight: {
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

  footerText: {
    color: Colors.textPrimary,
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.regular,
    fontWeight: "600",
    marginTop: 9,
  },

  footerSubtext: {
    color: Colors.textMuted,
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,
    marginTop: 5,
  },

  bottomSpace: {
    height: 20,
  },
});
