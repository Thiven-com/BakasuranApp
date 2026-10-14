import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

/* =========================================================
   DATA
========================================================= */

const categories = [
  {
    id: "all",
    title: "All",
    icon: "grid-outline",
  },
  {
    id: "food",
    title: "Food",
    icon: "fast-food-outline",
  },
  {
    id: "restaurants",
    title: "Restaurants",
    icon: "restaurant-outline",
  },
  {
    id: "bank",
    title: "Bank Offers",
    icon: "card-outline",
  },
  {
    id: "combo",
    title: "Combo Deals",
    icon: "gift-outline",
  },
];

const bestOffers = [
  {
    id: "1",
    category: "food",
    title: "Flat 40% OFF",
    description: "On Biryani & Rice Bowls",
    code: "RICE40",
    image: require("../../assets/images/biryani_fest.jpg"),
    discount: "40% OFF",
  },
  {
    id: "2",
    category: "food",
    title: "Flat 30% OFF",
    description: "On Pizzas",
    code: "PIZZA30",
    image: require("../../assets/images/pizza_planet.jpg"),
    discount: "30% OFF",
  },
  {
    id: "3",
    category: "combo",
    title: "Buy 1 Get 1 Free",
    description: "On selected Burgers",
    code: "BOGO",
    image: require("../../assets/images/burger_mania.jpg"),
    discount: "BUY 1 GET 1",
  },
  {
    id: "4",
    category: "food",
    title: "Flat 25% OFF",
    description: "On Chicken Specials",
    code: "CHICKEN25",
    image: require("../../assets/images/fried_chicken.jpg"),
    discount: "25% OFF",
  },
];

const restaurantDeals = [
  {
    id: "1",
    category: "restaurants",
    name: "Spice House",
    image: require("../../assets/images/spice_house.jpg"),
    offer: "Upto 50% OFF",
    cuisine: "Biryani • North Indian",
    rating: "4.7",
  },
  {
    id: "2",
    category: "restaurants",
    name: "Pizza Planet",
    image: require("../../assets/images/pizza_planet.jpg"),
    offer: "Upto 40% OFF",
    cuisine: "Pizza • Italian",
    rating: "4.6",
  },
  {
    id: "3",
    category: "restaurants",
    name: "Burger Mania",
    image: require("../../assets/images/burger_mania.jpg"),
    offer: "Upto 35% OFF",
    cuisine: "Burgers • Fast Food",
    rating: "4.5",
  },
  {
    id: "4",
    category: "restaurants",
    name: "Crispy Bowl",
    image: require("../../assets/images/crispy_bowl.jpg"),
    offer: "Upto 40% OFF",
    cuisine: "Chinese • Asian",
    rating: "4.4",
  },
];

const savingOptions = [
  {
    id: "1",
    type: "bank",
    title: "Bank Offers",
    subtitle: "Upto 20% OFF",
    description: "with bank cards",
    icon: "card-outline",
  },
  {
    id: "2",
    type: "wallet",
    title: "Wallet Offers",
    subtitle: "Upto 30% OFF",
    description: "using wallet",
    icon: "wallet-outline",
  },
  {
    id: "3",
    type: "combo",
    title: "Combo Deals",
    subtitle: "Special prices",
    description: "on food combos",
    icon: "gift-outline",
  },
];

/* =========================================================
   SCREEN
========================================================= */

const OffersDealsScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredOffers = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return bestOffers.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.code.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [searchText, selectedCategory]);

  const filteredRestaurants = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return restaurantDeals.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        selectedCategory === "restaurants" ||
        item.category === selectedCategory;

      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.cuisine.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [searchText, selectedCategory]);

  const copyCoupon = async (code) => {
    await Clipboard.setStringAsync(code);

    Alert.alert("Coupon Copied", `${code} has been copied to your clipboard.`);
  };

  const openRestaurant = (restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  return (
    <View style={styles.container}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Offers & Deals</Text>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={() => router.push("/wishlist")}
        >
          <Ionicons name="heart-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================================
            SEARCH
        ===================================================== */}

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={22}
            color={Colors.textSecondary}
          />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search offers, restaurants, cuisines..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* =====================================================
            CATEGORY FILTER
        ===================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = selectedCategory === category.id;

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.85}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={active ? Colors.white : Colors.textSecondary}
                />

                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* =====================================================
            HERO OFFER
        ===================================================== */}

        {selectedCategory === "all" && !searchText && (
          <View style={styles.heroCard}>
            <Image
              source={require("../../assets/images/cravings_offer.jpg")}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <View style={styles.heroOverlay} />

            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>50%</Text>

              <Text style={styles.discountBadgeSmall}>OFF</Text>
            </View>
          </View>
        )}

        {/* =====================================================
            BEST OFFERS
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIcon}>
              <Ionicons name="flame" size={18} color={Colors.white} />
            </View>

            <Text style={styles.sectionTitle}>Best Offers for You</Text>
          </View>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredOffers.length > 0 ? (
          <FlatList
            data={filteredOffers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.offerList}
            renderItem={({ item }) => (
              <OfferCard item={item} onCopy={copyCoupon} />
            )}
          />
        ) : (
          <EmptySearch />
        )}

        {/* =====================================================
            RESTAURANT DEALS
        ===================================================== */}

        {(selectedCategory === "all" || selectedCategory === "restaurants") &&
          filteredRestaurants.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="restaurant"
                      size={17}
                      color={Colors.white}
                    />
                  </View>

                  <Text style={styles.sectionTitle}>Restaurant Deals</Text>
                </View>

                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={filteredRestaurants}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.restaurantList}
                renderItem={({ item }) => (
                  <RestaurantDealCard
                    item={item}
                    onPress={() => openRestaurant(item)}
                  />
                )}
              />
            </>
          )}

        {/* =====================================================
            MORE WAYS TO SAVE
        ===================================================== */}

        {(selectedCategory === "all" ||
          selectedCategory === "bank" ||
          selectedCategory === "combo") && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="pricetag" size={17} color={Colors.white} />
                </View>

                <Text style={styles.sectionTitle}>More Ways to Save</Text>
              </View>
            </View>

            <View style={styles.savingGrid}>
              {savingOptions
                .filter((item) => {
                  if (selectedCategory === "all") {
                    return true;
                  }

                  return item.type === selectedCategory;
                })
                .map((item) => (
                  <SavingCard key={item.id} item={item} />
                ))}
            </View>
          </>
        )}

        {/* =====================================================
            BAKASURAN PROMISE
        ===================================================== */}

        <View style={styles.promiseCard}>
          <View style={styles.promiseIcon}>
            <Ionicons
              name="shield-checkmark"
              size={25}
              color={Colors.primary}
            />
          </View>

          <View style={styles.promiseContent}>
            <Text style={styles.promiseTitle}>BAKASURAN Savings Promise</Text>

            <Text style={styles.promiseText}>
              Get the best food deals, exclusive offers and special rewards
              every day.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

/* =========================================================
   OFFER CARD
========================================================= */

const OfferCard = ({ item, onCopy }) => {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerImageContainer}>
        <Image
          source={item.image}
          style={styles.offerImage}
          resizeMode="cover"
        />

        <View style={styles.offerDiscount}>
          <Text style={styles.offerDiscountText}>{item.discount}</Text>
        </View>
      </View>

      <View style={styles.offerContent}>
        <Text style={styles.offerTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.offerDescription} numberOfLines={1}>
          {item.description}
        </Text>

        <TouchableOpacity
          style={styles.couponButton}
          activeOpacity={0.8}
          onPress={() => onCopy(item.code)}
        >
          <Text style={styles.couponLabel}>Use Code:</Text>

          <Text style={styles.couponCode}>{item.code}</Text>

          <Ionicons name="copy-outline" size={15} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* =========================================================
   RESTAURANT DEAL CARD
========================================================= */

const RestaurantDealCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.restaurantCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.restaurantImageContainer}>
        <Image
          source={item.image}
          style={styles.restaurantImage}
          resizeMode="cover"
        />

        <View style={styles.restaurantOffer}>
          <Text style={styles.restaurantOfferText}>{item.offer}</Text>
        </View>

        <TouchableOpacity style={styles.restaurantHeart} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.restaurantContent}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.restaurantCuisine} numberOfLines={1}>
          {item.cuisine}
        </Text>

        <View style={styles.restaurantRating}>
          <Ionicons name="star" size={12} color={Colors.rating} />

          <Text style={styles.restaurantRatingText}>{item.rating}</Text>

          <Text style={styles.ratingDot}>•</Text>

          <Text style={styles.dealText}>Great Deal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* =========================================================
   SAVING CARD
========================================================= */

const SavingCard = ({ item }) => {
  return (
    <TouchableOpacity style={styles.savingCard} activeOpacity={0.85}>
      <View style={styles.savingIcon}>
        <Ionicons name={item.icon} size={23} color={Colors.white} />
      </View>

      <View style={styles.savingContent}>
        <Text style={styles.savingTitle}>{item.title}</Text>

        <Text style={styles.savingSubtitle}>{item.subtitle}</Text>

        <Text style={styles.savingDescription}>{item.description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={19} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
};

/* =========================================================
   EMPTY SEARCH
========================================================= */

const EmptySearch = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={30} color={Colors.textMuted} />

      <Text style={styles.emptyTitle}>No offers found</Text>

      <Text style={styles.emptyText}>Try another offer or restaurant</Text>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    height: 70,

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  headerTitle: {
    flex: 1,

    marginLeft: 14,

    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,
  },

  /* SEARCH */

  searchContainer: {
    height: 50,

    marginHorizontal: 18,
    marginTop: 16,

    paddingHorizontal: 15,

    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  searchInput: {
    flex: 1,

    marginHorizontal: 10,

    paddingVertical: 0,

    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,
  },

  /* CATEGORY */

  categoryList: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
  },

  categoryButton: {
    height: 40,

    marginRight: 8,

    paddingHorizontal: 14,

    borderRadius: 20,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  categoryButtonActive: {
    backgroundColor: Colors.primary,

    borderColor: Colors.primary,
  },

  categoryText: {
    marginLeft: 6,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xl,
  },

  categoryTextActive: {
    color: Colors.white,

    fontFamily: Fonts.semiBold,
  },

  /* HERO */

  heroCard: {
    height: 230,

    marginHorizontal: 18,
    marginTop: 16,

    borderRadius: 22,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(255,32,40,0.45)",

    position: "relative",

    backgroundColor: Colors.card,
  },

  heroImage: {
    position: "absolute",

    width: "100%",
    height: "100%",
  },

  heroOverlay: {
    position: "absolute",

    width: "100%",
    height: "100%",

    backgroundColor: "rgba(0,0,0,0.48)",
  },

  heroContent: {
    position: "absolute",

    left: 18,
    top: 18,

    zIndex: 2,
  },

  heroBadge: {
    alignSelf: "flex-start",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 8,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.primary,
  },

  heroBadgeText: {
    marginLeft: 5,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: 9,

    letterSpacing: 0.7,
  },

  heroTitle: {
    marginTop: 13,

    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: 31,
  },

  heroSubtitle: {
    marginTop: 1,

    color: Colors.white,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xl,
  },

  heroCodeRow: {
    marginTop: 12,

    alignSelf: "flex-start",

    height: 35,

    paddingLeft: 10,
    paddingRight: 5,

    borderRadius: 8,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0.65)",

    borderWidth: 1,
    borderColor: Colors.primary,
  },

  heroCodeLabel: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  heroCode: {
    marginLeft: 6,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: 15,
  },

  copyIconButton: {
    width: 29,
    height: 29,

    marginLeft: 7,

    borderRadius: 7,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.primary,
  },

  orderButton: {
    height: 38,

    marginTop: 11,

    paddingHorizontal: 15,

    alignSelf: "flex-start",

    borderRadius: 19,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.primary,
  },

  orderButtonText: {
    marginRight: 6,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
  },

  discountBadge: {
    position: "absolute",

    right: 16,
    top: 16,

    width: 65,
    height: 65,

    borderRadius: 33,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.primary,

    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",

    transform: [
      {
        rotate: "10deg",
      },
    ],
  },

  discountBadgeText: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: 21,

    lineHeight: 22,
  },

  discountBadgeSmall: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: 15,
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 24,

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 30,
    height: 30,

    marginRight: 8,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.primary,
  },

  sectionTitle: {
    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,
  },

  seeAll: {
    color: Colors.primary,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xl,
  },

  /* BEST OFFERS */

  offerList: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  offerCard: {
    width: 205,

    marginRight: 12,

    overflow: "hidden",

    borderRadius: 18,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  offerImageContainer: {
    height: 125,

    position: "relative",
  },

  offerImage: {
    width: "100%",
    height: "100%",
  },

  offerDiscount: {
    position: "absolute",

    right: 8,
    top: 8,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 8,

    backgroundColor: Colors.primary,
  },

  offerDiscountText: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: 15,
  },

  offerContent: {
    padding: 11,
  },

  offerTitle: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  offerDescription: {
    marginTop: 3,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  couponButton: {
    height: 34,

    marginTop: 10,

    paddingHorizontal: 8,

    borderRadius: 8,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: Colors.primary,

    backgroundColor: "rgba(255,32,40,0.06)",
  },

  couponLabel: {
    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 15,
  },

  couponCode: {
    flex: 1,

    marginLeft: 4,

    color: Colors.primary,

    fontFamily: Fonts.bold,
    fontSize: 13,
  },

  /* RESTAURANTS */

  restaurantList: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  restaurantCard: {
    width: 190,

    marginRight: 12,

    overflow: "hidden",

    borderRadius: 18,

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  restaurantImageContainer: {
    height: 130,

    position: "relative",
  },

  restaurantImage: {
    width: "100%",
    height: "100%",
  },

  restaurantOffer: {
    position: "absolute",

    left: 8,
    bottom: 8,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 7,

    backgroundColor: Colors.primary,
  },

  restaurantOfferText: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: 14,
  },

  restaurantHeart: {
    position: "absolute",

    right: 8,
    top: 8,

    width: 30,
    height: 30,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(0,0,0,0.55)",
  },

  restaurantContent: {
    padding: 11,
  },

  restaurantName: {
    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  restaurantCuisine: {
    marginTop: 3,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 14,
  },

  restaurantRating: {
    marginTop: 8,

    flexDirection: "row",
    alignItems: "center",
  },

  restaurantRatingText: {
    marginLeft: 4,

    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },

  ratingDot: {
    marginHorizontal: 6,

    color: Colors.textMuted,
  },

  dealText: {
    color: Colors.success,

    fontFamily: Fonts.medium,
    fontSize: 15,
  },

  /* SAVINGS */

  savingGrid: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 10,
  },

  savingCard: {
    minHeight: 82,

    padding: 13,

    borderRadius: 18,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  savingIcon: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.primary,
  },

  savingContent: {
    flex: 1,

    marginLeft: 12,
  },

  savingTitle: {
    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xxl,
  },

  savingSubtitle: {
    marginTop: 2,

    color: Colors.primary,

    fontFamily: Fonts.regular,
    fontSize: 16,
  },

  savingDescription: {
    marginTop: 2,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 17,
  },

  /* PROMISE */

  promiseCard: {
    marginHorizontal: 18,
    marginTop: 24,

    padding: 15,

    borderRadius: 18,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(255,32,40,0.06)",

    borderWidth: 1,
    borderColor: "rgba(255,32,40,0.2)",
  },

  promiseIcon: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,32,40,0.12)",
  },

  promiseContent: {
    flex: 1,

    marginLeft: 12,
  },

  promiseTitle: {
    color: Colors.white,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,
  },

  promiseText: {
    marginTop: 3,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: 16,

    lineHeight: 15,
  },

  /* EMPTY */

  emptyContainer: {
    height: 150,

    marginHorizontal: 18,
    marginTop: 12,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  emptyTitle: {
    marginTop: 8,

    color: Colors.white,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
  },

  emptyText: {
    marginTop: 3,

    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  bottomSpace: {
    height: 25,
  },
});

export default OffersDealsScreen;
