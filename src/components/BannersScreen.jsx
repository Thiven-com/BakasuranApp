import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Banner dimensions
const BANNER_WIDTH = width - 24;
const BANNER_HEIGHT = 105;
const banners = [
  {
    id: "1",
    image: require("../../assets/images/banner1.png"),
    route: "/explore",
  },
  {
    id: "2",
    image: require("../../assets/images/banner2.png"),
    route: "/table-booking",
  },
  {
    id: "3",
    image: require("../../assets/images/banner3.png"),
    route: "/offers-deals",
  },
];

const BannersScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef(null);

  // --------------------------------
  // AUTO SLIDE
  // --------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex =
          currentIndex === banners.length - 1 ? 0 : currentIndex + 1;

        flatListRef.current?.scrollToOffset({
          offset: nextIndex * BANNER_WIDTH,
          animated: true,
        });

        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------
  // MANUAL SWIPE
  // --------------------------------
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / BANNER_WIDTH);

    if (index >= 0 && index < banners.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // --------------------------------
  // BANNER CLICK
  // --------------------------------
  const handleBannerPress = (item) => {
    router.push(item.route);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
        disableIntervalMomentum
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleBannerPress(item)}
            style={styles.bannerWrapper}
          >
            <Image
              source={item.image}
              style={styles.banner}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      />

      {/* PAGINATION */}
      <View style={styles.dotsContainer}>
        {banners.map((item, index) => (
          <View
            key={item.id}
            style={[styles.dot, index === activeIndex && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannersScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 14,
  },

  listContent: {
    paddingHorizontal: 10,
  },

  bannerWrapper: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#080808",

    // Small premium shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,

    elevation: 5,
  },

  banner: {
    width: "100%",
    height: "100%",
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 9,
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#555555",
  },

  activeDot: {
    width: 21,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF2028",
  },
});
