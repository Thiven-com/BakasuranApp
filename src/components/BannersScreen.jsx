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

const BANNER_GAP = 12;
const BANNER_WIDTH = width - 32;
const BANNER_HEIGHT = 150;
const BANNER_INTERVAL = BANNER_WIDTH + BANNER_GAP;

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

export default function BannersScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * BANNER_INTERVAL,
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // Manual swipe
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_INTERVAL);

    if (index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  // Banner navigation
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
        snapToInterval={BANNER_INTERVAL}
        decelerationRate="fast"
        disableIntervalMomentum
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: BANNER_INTERVAL,
          offset: BANNER_INTERVAL * index,
          index,
        })}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleBannerPress(item)}
            style={styles.bannerWrapper}
          >
            <Image
              source={item.image}
              style={styles.banner}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {/* Pagination dots */}
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
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    gap: BANNER_GAP,
  },

  bannerWrapper: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  banner: {
    width: "100%",
    height: "100%",
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#777777",
  },

  activeDot: {
    width: 21,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF2028",
  },
});
