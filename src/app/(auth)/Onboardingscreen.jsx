import { router } from "expo-router";
import { useRef, useState } from "react";

import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// =========================================================
// IMPORT YOUR COMMON FONTS AND COLORS
// =========================================================

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

// =========================================================
// SCREEN SIZE
// =========================================================

const { width, height } = Dimensions.get("window");

// =========================================================
// 4 ONBOARDING SCREENS
// =========================================================

const onboardingData = [
  {
    id: "1",

    image: require("../../../assets/images/onboardingimage1.png"),

    title: "Delicious Food",

    redTitle: "Delivered to You",

    description:
      "Explore top restaurants and mouthwatering dishes near you.",
  },

  {
    id: "2",

    image: require("../../../assets/images/onboardingimage2.png"),

    title: "One Platform",

    redTitle: "for Everything",

    description:
      "From biryanis to burgers, desserts to drinks — get everything you crave.",
  },

  {
    id: "3",

    image: require("../../../assets/images/onboardingimage3.png"),

    title: "Fast & Reliable",

    redTitle: "Delivery",

    description:
      "Hot food. Faster at your door.",
  },

  {
    id: "4",

    image: require("../../../assets/images/onboardingimage4.png"),

    title: "Book a Table",

    redTitle: "With Ease",

    description:
      "Reserve your favourite tables at top restaurants.",
  },
];

// =========================================================
// SCREEN
// =========================================================

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);

  // =======================================================
  // VIEWABILITY CONFIG
  // =======================================================

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }) => {
      if (viewableItems && viewableItems.length > 0) {
        const index = viewableItems[0]?.index;

        if (
          index !== null &&
          index !== undefined
        ) {
          setCurrentIndex(index);
        }
      }
    }
  ).current;

  // =======================================================
  // NEXT BUTTON
  // =======================================================

  const handleNext = () => {
    // Go to next onboarding screen
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });

      return;
    }

    // 4th screen -> Signup
    router.push("/(auth)/Signupscreen");
  };

  // =======================================================
  // SKIP BUTTON
  // =======================================================

  const handleSkip = () => {
    router.push("/(auth)/Loginscreen");
  };

  // =======================================================
  // RENDER ITEM
  // =======================================================

  const renderItem = ({ item }) => {
    return (
      <View style={styles.screen}>

        {/* =================================================
            IMAGE
        ================================================= */}

        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
        />

        {/* =================================================
            BOTTOM BLACK SECTION
        ================================================= */}

        <View style={styles.bottomSection}>

          {/* =================================================
              TITLE
          ================================================= */}

          <Text style={styles.title}>
            {item.title}
          </Text>

          {/* =================================================
              RED TITLE
          ================================================= */}

          <Text style={styles.redTitle}>
            {item.redTitle}
          </Text>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <Text style={styles.description}>
            {item.description}
          </Text>

          {/* =================================================
              BOTTOM CONTROLS
          ================================================= */}

          <View style={styles.controls}>

            {/* =============================================
                SKIP
            ============================================= */}

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>
                Skip
              </Text>
            </TouchableOpacity>

            {/* =============================================
                4 DOTS
            ============================================= */}

            <View style={styles.dotsContainer}>
              {onboardingData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,

                    currentIndex === index
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            {/* =============================================
                NEXT BUTTON
            ============================================= */}

            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              style={styles.nextButton}
            >
              <Text style={styles.arrow}>
                →
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    );
  };

  // =======================================================
  // MAIN
  // =======================================================

  return (
    <View style={styles.container}>

      <FlatList
        ref={flatListRef}

        data={onboardingData}

        renderItem={renderItem}

        keyExtractor={(item) => item.id}

        horizontal

        pagingEnabled

        showsHorizontalScrollIndicator={false}

        showsVerticalScrollIndicator={false}

        bounces={false}

        onViewableItemsChanged={
          onViewableItemsChanged
        }

        viewabilityConfig={
          viewabilityConfig
        }

        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  // =======================================================
  // MAIN CONTAINER
  // =======================================================

  container: {
    flex: 1,

    backgroundColor: Colors.background,
  },

  // =======================================================
  // EACH ONBOARDING SCREEN
  // =======================================================

  screen: {
    width: width,

    height: height,

    backgroundColor: Colors.background,
  },

  // =======================================================
  // IMAGE
  // =======================================================

  image: {
    width: width,

    height: height * 0.69,
  },

  // =======================================================
  // BOTTOM SECTION
  // =======================================================

  bottomSection: {
    flex: 1,

    backgroundColor: Colors.background,

    alignItems: "center",

    paddingHorizontal: 25,

    paddingTop: 12,
  },

  // =======================================================
  // TITLE
  // =======================================================

  title: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,

    fontSize: Fonts.size.lg,

    textAlign: "center",

    lineHeight: 34,
  },

  // =======================================================
  // RED TITLE
  // =======================================================

  redTitle: {
    color: Colors.primary,

    fontFamily: Fonts.extraBold,

    fontSize: Fonts.size.lg,

    textAlign: "center",

    lineHeight: 34,
  },

  // =======================================================
  // DESCRIPTION
  // =======================================================

  description: {
    color: Colors.textPrimary,

    fontFamily: Fonts.regular,

    fontSize: Fonts.size.base,

    lineHeight: 25,

    textAlign: "center",

    marginTop: 12,

    maxWidth: 360,
  },

  // =======================================================
  // CONTROLS
  // =======================================================

  controls: {
    position: "absolute",

    bottom: 25,

    left: 25,

    right: 25,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  // =======================================================
  // SKIP BUTTON
  // =======================================================

  skipButton: {
    width: 70,

    height: 55,

    justifyContent: "center",
  },

  // =======================================================
  // SKIP TEXT
  // =======================================================

  skipText: {
    color: Colors.white,

    fontFamily: Fonts.medium,

    fontSize: Fonts.size.md,
  },

  // =======================================================
  // DOTS CONTAINER
  // =======================================================

  dotsContainer: {
    flexDirection: "row",

    alignItems: "center",

    gap: 10,
  },

  // =======================================================
  // DOT
  // =======================================================

  dot: {
    width: 17,

    height: 17,

    borderRadius: 9,
  },

  // =======================================================
  // ACTIVE DOT
  // =======================================================

  activeDot: {
    backgroundColor: Colors.primary,

    // Red glow
    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,

      height: 0,
    },

    shadowOpacity: 0.8,

    shadowRadius: 8,

    elevation: 5,
  },

  // =======================================================
  // INACTIVE DOT
  // =======================================================

  inactiveDot: {
    backgroundColor: Colors.tabInactive,
  },

  // =======================================================
  // NEXT BUTTON
  // =======================================================

  nextButton: {
    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor: Colors.primary,

    alignItems: "center",

    justifyContent: "center",

    // Red glow
    shadowColor: Colors.primary,

    shadowOffset: {
      width: 0,

      height: 6,
    },

    shadowOpacity: 0.35,

    shadowRadius: 10,

    elevation: 8,
  },

  // =======================================================
  // ARROW
  // =======================================================

  arrow: {
    color: Colors.white,

    fontFamily: Fonts.regular,

    fontSize: 36,

    lineHeight: 40,
  },
});