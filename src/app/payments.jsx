import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
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

/* =========================================================
   PAYMENT SCREEN
========================================================= */

export default function PaymentsScreen() {
  const [showForm, setShowForm] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [selectedPayment, setSelectedPayment] =
    useState("card");

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "card",
      cardType: "VISA",
      lastFour: "4242",
      name: "Raju Kumar",
      expiry: "12/28",
      color: "#f82408",
    },
    {
      id: 2,
      type: "card",
      cardType: "MASTER",
      lastFour: "5678",
      name: "Raju Kumar",
      expiry: "09/27",
      color: "#f82408",
    },
  ]);

  /* =====================================================
     FORMAT CARD NUMBER
  ===================================================== */

  const handleCardNumber = (value) => {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, 16);

    const formatted = numbers
      .replace(/(.{4})/g, "$1 ")
      .trim();

    setCardNumber(formatted);
  };

  /* =====================================================
     FORMAT EXPIRY
  ===================================================== */

  const handleExpiry = (value) => {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (numbers.length >= 3) {
      setExpiry(
        `${numbers.slice(0, 2)}/${numbers.slice(2)}`
      );
    } else {
      setExpiry(numbers);
    }
  };

  /* =====================================================
     ADD PAYMENT METHOD
  ===================================================== */

  const handleSaveCard = () => {
    const cleanCardNumber =
      cardNumber.replace(/\s/g, "");

    if (cleanCardNumber.length !== 16) {
      Alert.alert(
        "Invalid Card",
        "Please enter a valid 16-digit card number."
      );
      return;
    }

    if (!cardName.trim()) {
      Alert.alert(
        "Required",
        "Please enter the name on the card."
      );
      return;
    }

    if (expiry.length !== 5) {
      Alert.alert(
        "Invalid Expiry",
        "Please enter expiry in MM/YY format."
      );
      return;
    }

    if (cvv.length !== 3) {
      Alert.alert(
        "Invalid CVV",
        "Please enter a valid 3-digit CVV."
      );
      return;
    }

    const lastFour = cleanCardNumber.slice(-4);

    const newCard = {
      id: Date.now(),
      type: "card",
      cardType: "VISA",
      lastFour,
      name: cardName.trim(),
      expiry,
      color: Colors.info,
    };

    setPaymentMethods((previous) => [
      ...previous,
      newCard,
    ]);

    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setShowForm(false);

    Alert.alert(
      "Card Added",
      "Your payment method has been added successfully."
    );
  };

  /* =====================================================
     DELETE CARD
  ===================================================== */

  const handleDelete = (id) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this card?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPaymentMethods((previous) =>
              previous.filter(
                (item) => item.id !== id
              )
            );
          },
        },
      ]
    );
  };

  /* =====================================================
     CANCEL FORM
  ===================================================== */

  const handleCancel = () => {
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setShowForm(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      {/* =================================================
          HEADER
      ================================================= */}

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
          Payment Methods
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* =================================================
            TITLE
        ================================================= */}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Your Payment Methods
          </Text>

          <Text style={styles.subtitle}>
            Manage your cards and payment options
          </Text>
        </View>

        {/* =================================================
            SECURE PAYMENT MESSAGE
        ================================================= */}

        <View style={styles.secureCard}>
          <View style={styles.secureIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={Colors.primary}
            />
          </View>

          <View style={styles.secureContent}>
            <Text style={styles.secureTitle}>
              Secure Payments
            </Text>

            <Text style={styles.secureText}>
              Your payment information is protected
              and encrypted.
            </Text>
          </View>
        </View>

        {/* =================================================
            PAYMENT METHODS
        ================================================= */}

        {paymentMethods.length > 0 && (
          <View style={styles.methodsContainer}>
            {paymentMethods.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.paymentCard,
                  selectedPayment === String(item.id) &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setSelectedPayment(String(item.id))
                }
                activeOpacity={0.8}
              >
                {/* CARD ICON */}

                <View
                  style={[
                    styles.cardIcon,
                    {
                      backgroundColor: `${item.color}18`,
                    },
                  ]}
                >
                  <Ionicons
                    name="card-outline"
                    size={25}
                    color={item.color}
                  />
                </View>

                {/* CARD DETAILS */}

                <View style={styles.cardInfo}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardType}>
                      {item.cardType}
                    </Text>

                    <View
                      style={[
                        styles.defaultBadge,
                        {
                          backgroundColor: `${item.color}18`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.defaultText,
                          {
                            color: item.color,
                          },
                        ]}
                      >
                        SAVED
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {item.lastFour}
                  </Text>

                  <Text style={styles.cardName}>
                    {item.name}
                  </Text>

                  <Text style={styles.expiryText}>
                    Expires {item.expiry}
                  </Text>
                </View>

                {/* DELETE */}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDelete(item.id)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* =================================================
            ADD CARD BUTTON
        ================================================= */}

        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add-circle-outline"
              size={23}
              color={Colors.white}
            />

            <Text style={styles.addButtonText}>
              Add New Card
            </Text>
          </TouchableOpacity>
        )}

        {/* =================================================
            ADD CARD FORM
        ================================================= */}

        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                Add New Card
              </Text>

              <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* CARD NUMBER */}

            <Text style={styles.inputLabel}>
              Card Number
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="card-outline"
                size={20}
                color={Colors.textSecondary}
              />

              <TextInput
                value={cardNumber}
                onChangeText={handleCardNumber}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={19}
                style={styles.input}
              />
            </View>

            {/* CARD NAME */}

            <Text style={styles.inputLabel}>
              Name on Card
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.textSecondary}
              />

              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="Enter card holder name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            {/* EXPIRY + CVV */}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>
                  Expiry
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />

                  <TextInput
                    value={expiry}
                    onChangeText={handleExpiry}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={5}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>
                  CVV
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />

                  <TextInput
                    value={cvv}
                    onChangeText={(value) =>
                      setCvv(
                        value
                          .replace(/\D/g, "")
                          .slice(0, 3)
                      )
                    }
                    placeholder="CVV"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {/* SAVE */}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveCard}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color={Colors.white}
              />

              <Text style={styles.saveButtonText}>
                Save Card
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            OTHER PAYMENT OPTIONS
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Other Payment Options
        </Text>

        <View style={styles.otherCard}>
          {/* UPI */}

          <TouchableOpacity
            style={styles.otherRow}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "UPI",
                "UPI payment will be available during checkout."
              )
            }
          >
            <View
              style={[
                styles.otherIcon,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.otherInfo}>
              <Text style={styles.otherTitle}>
                UPI
              </Text>

              <Text style={styles.otherSubtitle}>
                Pay using any UPI app
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* CASH */}

          <TouchableOpacity
            style={[
              styles.otherRow,
              styles.lastOtherRow,
            ]}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Cash on Delivery",
                "Cash on Delivery will be available during checkout."
              )
            }
          >
            <View
              style={[
                styles.otherIcon,
                {
                  backgroundColor: `${Colors.primary}18`,
                },
              ]}
            >
              <Ionicons
                name="cash-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.otherInfo}>
              <Text style={styles.otherTitle}>
                Cash on Delivery
              </Text>

              <Text style={styles.otherSubtitle}>
                Pay when your order arrives
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            SECURITY
        ================================================= */}

        <View style={styles.bottomSecurity}>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={Colors.primary}
          />

          <Text style={styles.bottomSecurityText}>
            Your payment details are safe and secure
          </Text>
        </View>
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
    paddingBottom: 40,
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
    color: Colors.textPrimary,

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
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,
  },

  subtitle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginTop: 6,
  },

  /* ================= SECURE ================= */

  secureCard: {
    backgroundColor: Colors.surface,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 13,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 18,
  },

  secureIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: Colors.backgroundSecondary,

    justifyContent: "center",
    alignItems: "center",
  },

  secureContent: {
    flex: 1,

    marginLeft: 11,
  },

  secureTitle: {
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,
  },

  secureText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginTop: 3,
  },

  /* ================= PAYMENT CARDS ================= */

  methodsContainer: {
    gap: 13,
  },

  paymentCard: {
    minHeight: 145,

    backgroundColor: Colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 15,

    flexDirection: "row",
  },

  selectedCard: {
    borderColor: Colors.primary,
  },

  cardIcon: {
    width: 46,
    height: 46,

    borderRadius: 13,

    justifyContent: "center",
    alignItems: "center",
  },

  cardInfo: {
    flex: 1,

    marginLeft: 13,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardType: {
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,

    letterSpacing: 1,
  },

  defaultBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 6,

    marginLeft: 8,
  },

  defaultText: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,

    letterSpacing: 0.5,
  },

  cardNumber: {
    color: Colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,

    letterSpacing: 1.5,

    marginTop: 11,
  },

  cardName: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    textTransform: "uppercase",

    marginTop: 9,
  },

  expiryText: {
    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginTop: 3,
  },

  deleteButton: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: Colors.surface,

    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= ADD ================= */

  addButton: {
    height: 56,

    borderRadius: 28,

    backgroundColor: Colors.primary,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 18,
  },

  addButtonText: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xxl,

    marginLeft: 8,
  },

  /* ================= FORM ================= */

  formCard: {
    backgroundColor: Colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 16,

    marginTop: 18,
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 10,
  },

  formTitle: {
    color: Colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xxl,
  },

  inputLabel: {
    color: Colors.textSecondary,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xl,

    marginTop: 14,
    marginBottom: 8,
  },

  inputContainer: {
    minHeight: 52,

    borderRadius: 13,

    backgroundColor: Colors.backgroundSecondary,

    borderWidth: 1,
    borderColor: Colors.border,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
  },

  input: {
    flex: 1,

    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginLeft: 10,

    paddingVertical: 10,
  },

  row: {
    flexDirection: "row",

    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  saveButton: {
    height: 56,

    borderRadius: 28,

    backgroundColor: Colors.primary,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 25,
  },

  saveButtonText: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xxl,

    marginLeft: 8,
  },

  cancelButton: {
    height: 48,

    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: Colors.textSecondary,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xl,
  },

  /* ================= OTHER ================= */

  sectionTitle: {
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,

    marginTop: 27,
    marginBottom: 13,
  },

  otherCard: {
    backgroundColor: Colors.card,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,

    overflow: "hidden",
  },

  otherRow: {
    minHeight: 72,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  lastOtherRow: {
    borderBottomWidth: 0,
  },

  otherIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    justifyContent: "center",
    alignItems: "center",
  },

  otherInfo: {
    flex: 1,

    marginLeft: 12,
  },

  otherTitle: {
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,
  },

  otherSubtitle: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginTop: 4,
  },

  /* ================= SECURITY ================= */

  bottomSecurity: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 25,
  },

  bottomSecurityText: {
    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,

    marginLeft: 7,
  },
});