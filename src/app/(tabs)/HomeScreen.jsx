import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BannersScreen from "../../components/BannersScreen";
import HomeHeader from "../../components/HomeHeader";
import HomeSearchResults from "../../components/HomeSearchResults";
import RestaurantCard from "../../components/RestaurantCard";
import SearchBar from "../../components/SearchBar";
import { useTheme } from "../../hooks/use-theme";

const HomeScreen = () => {
  const [searchText, setSearchText] = useState("");
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const hasSearchQuery = searchText.trim().length > 0;

  // Food Categories
  const cuisines = [
    {
      id: "1",
      name: "All",
      image: require("../../../assets/images/all.png"),
    },
    {
      id: "2",
      name: "Dosa",
      image: require("../../../assets/images/dosa.png"),
    },
    {
      id: "3",
      name: "South Indian",
      image: require("../../../assets/images/south_indian.png"),
    },
    {
      id: "4",
      name: "Biryani",
      image: require("../../../assets/images/biryani.png"),
    },
    {
      id: "5",
      name: "Idli",
      image: require("../../../assets/images/idli.png"),
    },
    {
      id: "6",
      name: "Pizza",
      image: require("../../../assets/images/pizza.png"),
    },
    {
      id: "7",
      name: "Burgers",
      image: require("../../../assets/images/burgers.png"),
    },
    {
      id: "8",
      name: "Chinese",
      image: require("../../../assets/images/chinese.png"),
    },
    {
      id: "9",
      name: "Chicken",
      image: require("../../../assets/images/fried_chicken.jpg"),
    },
    {
      id: "10",
      name: "Desserts",
      image: require("../../../assets/images/desserts.png"),
    },
    {
      id: "11",
      name: "Drinks",
      image: require("../../../assets/images/drinks.png"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search */}
        <View style={styles.searchWrap}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        {!hasSearchQuery && <BannersScreen />}

        {/* ============================= */}
        {/* FOOD CATEGORIES */}
        {/* ============================= */}

        {!hasSearchQuery && (
          <View style={styles.cuisineTopSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cuisineTopList}
            >
              {cuisines.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cuisineTopItem}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/ExploreScreen",
                      params: {
                        search: item.name,
                      },
                    })
                  }
                >
                  <Image
                    source={item.image}
                    style={styles.cuisineTopImage}
                    resizeMode="contain"
                  />

                  <Text
                    style={styles.cuisineTopText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ============================= */}
        {/* OFFER BANNER */}
        {/* ============================= */}

        {/*<OfferBanner />*/}

        {/* ============================= */}
        {/* RESTAURANTS */}
        {/* ============================= */}

        <View style={styles.restaurantSection}>
          {hasSearchQuery ? (
            <HomeSearchResults searchText={searchText} />
          ) : (
            <RestaurantCard />
          )}
        </View>

        {/* ============================= */}
        {/* TABLE BOOKING */}
        {/* ============================= */}

        {!hasSearchQuery && (
          <View style={styles.bookingCard}>
            <Image
              source={require("../../../assets/images/book_table.jpg")}
              style={styles.bookingImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.findTableButton}
              activeOpacity={0.8}
              onPress={() => router.push("/table-booking")}
            />
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const makeStyles = (colors) =>
  StyleSheet.create({
    // ==========================================
    // MAIN CONTAINER
    // ==========================================

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    // ==========================================
    // SEARCH
    // ==========================================

    searchWrap: {
      marginTop: 4,
    },

    // ==========================================
    // TOP FOOD CATEGORIES
    // ==========================================

    cuisineTopSection: {
      backgroundColor: colors.background,
      marginTop: 4,
      paddingVertical: 5,
    },

    cuisineTopList: {
      paddingHorizontal: 2,
    },

    cuisineTopItem: {
      width: 115,
      alignItems: "center",
      justifyContent: "flex-start",
      marginRight: 5,
    },

    cuisineTopImage: {
      width: 110,
      height: 100,
      marginBottom: 3,
    },

    cuisineTopText: {
      width: 115,
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "500",
      textAlign: "center",
    },

    // ==========================================
    // RESTAURANTS
    // ==========================================

    restaurantSection: {
      marginTop: 2,
    },

    // ==========================================
    // TABLE BOOKING
    // ==========================================

    bookingCard: {
      marginHorizontal: 16,
      height: 180,
      borderRadius: 22,
      overflow: "hidden",
      position: "relative",
    },

    bookingImage: {
      width: "100%",
      height: "100%",
      borderRadius: 22,
    },

    findTableButton: {
      position: "absolute",
      left: 20,
      bottom: 18,
      width: 145,
      height: 42,
      backgroundColor: "transparent",
      borderRadius: 22,
    },

    // ==========================================
    // BOTTOM
    // ==========================================

    bottomSpacing: {
      height: 40,
    },
  });
