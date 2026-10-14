import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";

// ============================================================
// RESTAURANT DATA
// ============================================================

export const restaurants = {
  1: {
    id: "1",
    name: "Spice House",
    image: require("../../../assets/images/Restaurant1.png"),
    rating: "4.5",
    reviews: "2.1K",
    time: "35-45 mins",
    price: "₹200 for two",
    cuisine: "Biryani • North Indian • Mughlai",
    address: "Hitech City, Hyderabad",
    phone: "+919876543210",
    offer: "30% OFF",
    offerText: "30% OFF up to ₹100",
    offerCode: "BAKA30",

    menu: {
      Recommended: [
        {
          id: "1-1",
          name: "Chicken Biryani",
          description:
            "Fragrant basmati rice cooked with tender chicken and aromatic spices.",
          price: 249,
          image: require("../../../assets/images/chicken_biryani.jpg"),
          isVeg: false,
        },
        {
          id: "1-2",
          name: "Paneer Special",
          description:
            "Soft paneer cooked in a rich Indian masala with aromatic spices.",
          price: 199,
          image: require("../../../assets/images/paneer.jpg"),
          isVeg: true,
        },
        {
          id: "1-3",
          name: "Fried Chicken",
          description:
            "Crispy golden chicken pieces seasoned with our signature spices.",
          price: 279,
          image: require("../../../assets/images/fried_chicken.jpg"),
          isVeg: false,
        },
      ],

      Biryani: [
        {
          id: "1-4",
          name: "Chicken Biryani",
          description:
            "Classic Hyderabadi chicken biryani with long-grain basmati rice.",
          price: 249,
          image: require("../../../assets/images/chicken_biryani.jpg"),
          isVeg: false,
        },
        {
          id: "1-5",
          name: "Paneer Biryani",
          description:
            "Aromatic basmati rice layered with spicy paneer and herbs.",
          price: 219,
          image: require("../../../assets/images/paneer.jpg"),
          isVeg: true,
        },
      ],

      Starters: [
        {
          id: "1-6",
          name: "Crispy Chicken",
          description:
            "Crunchy chicken strips served with our special spicy dip.",
          price: 229,
          image: require("../../../assets/images/fried_chicken.jpg"),
          isVeg: false,
        },
        {
          id: "1-7",
          name: "Paneer Starter",
          description: "Spicy grilled paneer cubes with onions and capsicum.",
          price: 189,
          image: require("../../../assets/images/paneer.jpg"),
          isVeg: true,
        },
      ],

      "Main Course": [
        {
          id: "1-8",
          name: "Chicken Special",
          description:
            "Tender chicken cooked in a rich traditional Indian gravy.",
          price: 269,
          image: require("../../../assets/images/chicken_biryani.jpg"),
          isVeg: false,
        },
        {
          id: "1-9",
          name: "Veg Special",
          description:
            "Delicious mixed vegetable curry prepared with fresh ingredients.",
          price: 179,
          image: require("../../../assets/images/veg_specials.jpg"),
          isVeg: true,
        },
      ],
    },
  },

  // ==========================================================
  // PIZZA PLANET
  // ==========================================================

  2: {
    id: "2",
    name: "Pizza Planet",
    image: require("../../../assets/images/Restaurant3.png"),
    rating: "4.3",
    reviews: "1.8K",
    time: "25-35 mins",
    price: "₹300 for two",
    cuisine: "Pizza • Italian • Fast Food",
    address: "Madhapur, Hyderabad",
    phone: "+919876543211",
    offer: "20% OFF",
    offerText: "20% OFF up to ₹150",
    offerCode: "PIZZA20",

    menu: {
      Recommended: [
        {
          id: "2-1",
          name: "Classic Veg Pizza",
          description:
            "Loaded with fresh vegetables, mozzarella and Italian herbs.",
          price: 249,
          image: require("../../../assets/images/pizza.png"),
          isVeg: true,
        },
        {
          id: "2-2",
          name: "Chicken Pizza",
          description:
            "Cheesy pizza topped with juicy chicken and signature sauce.",
          price: 299,
          image: require("../../../assets/images/pizza_planet.jpg"),
          isVeg: false,
        },
        {
          id: "2-3",
          name: "Paneer Pizza",
          description: "Spicy paneer chunks with capsicum, onion and cheese.",
          price: 279,
          image: require("../../../assets/images/paneer.jpg"),
          isVeg: true,
        },
      ],

      Biryani: [
        {
          id: "2-4",
          name: "Pizza Biryani Combo",
          description: "A delicious combo of mini biryani and personal pizza.",
          price: 329,
          image: require("../../../assets/images/pizza_planet.jpg"),
          isVeg: false,
        },
      ],

      Starters: [
        {
          id: "2-5",
          name: "Cheesy Garlic Bread",
          description: "Toasted garlic bread loaded with mozzarella cheese.",
          price: 149,
          image: require("../../../assets/images/pizza.png"),
          isVeg: true,
        },
        {
          id: "2-6",
          name: "Chicken Wings",
          description: "Crispy chicken wings tossed in a spicy sauce.",
          price: 229,
          image: require("../../../assets/images/fried_chicken.jpg"),
          isVeg: false,
        },
      ],

      "Main Course": [
        {
          id: "2-7",
          name: "Chicken Supreme Pizza",
          description: "Premium pizza loaded with chicken, peppers and cheese.",
          price: 399,
          image: require("../../../assets/images/pizza_planet.jpg"),
          isVeg: false,
        },
        {
          id: "2-8",
          name: "Veg Supreme Pizza",
          description: "Fresh vegetables, olives, peppers and extra cheese.",
          price: 349,
          image: require("../../../assets/images/pizza.png"),
          isVeg: true,
        },
      ],
    },
  },

  // ==========================================================
  // BURGER MANIA
  // ==========================================================

  3: {
    id: "3",
    name: "Burger Mania",
    image: require("../../../assets/images/Restaurant2.png"),
    rating: "4.2",
    reviews: "1.5K",
    time: "20-30 mins",
    price: "₹250 for two",
    cuisine: "Burgers • Fast Food • Snacks",
    address: "Kondapur, Hyderabad",
    phone: "+919876543212",
    offer: "40% OFF",
    offerText: "40% OFF up to ₹120",
    offerCode: "BURGER40",

    menu: {
      Recommended: [
        {
          id: "3-1",
          name: "Classic Chicken Burger",
          description:
            "Juicy crispy chicken patty with lettuce, cheese and sauce.",
          price: 199,
          image: require("../../../assets/images/burger_mania.jpg"),
          isVeg: false,
        },
        {
          id: "3-2",
          name: "Veg Cheese Burger",
          description:
            "Crispy vegetarian patty with cheese and fresh vegetables.",
          price: 169,
          image: require("../../../assets/images/veg_specials.jpg"),
          isVeg: true,
        },
        {
          id: "3-3",
          name: "Fried Chicken",
          description: "Crunchy fried chicken pieces with signature seasoning.",
          price: 249,
          image: require("../../../assets/images/fried_chicken.jpg"),
          isVeg: false,
        },
      ],

      Biryani: [
        {
          id: "3-4",
          name: "Burger Biryani Combo",
          description: "A filling combo with chicken burger and mini biryani.",
          price: 299,
          image: require("../../../assets/images/burger_mania.jpg"),
          isVeg: false,
        },
      ],

      Starters: [
        {
          id: "3-5",
          name: "Chicken Nuggets",
          description: "Golden crispy chicken nuggets served with dip.",
          price: 159,
          image: require("../../../assets/images/fried_chicken.jpg"),
          isVeg: false,
        },
        {
          id: "3-6",
          name: "Veg Nuggets",
          description: "Crispy vegetable nuggets with a delicious dip.",
          price: 139,
          image: require("../../../assets/images/veg_specials.jpg"),
          isVeg: true,
        },
      ],

      "Main Course": [
        {
          id: "3-7",
          name: "Double Chicken Burger",
          description: "Two juicy chicken patties with double cheese.",
          price: 299,
          image: require("../../../assets/images/burger_mania.jpg"),
          isVeg: false,
        },
        {
          id: "3-8",
          name: "Double Veg Burger",
          description:
            "Double vegetarian patties with fresh vegetables and cheese.",
          price: 249,
          image: require("../../../assets/images/veg_specials.jpg"),
          isVeg: true,
        },
      ],
    },
  },

  // ==========================================================
  // CRISPY BOWL
  // ==========================================================

  4: {
    id: "4",
    name: "Crispy Bowl",
    image: require("../../../assets/images/Restaurant4.png"),
    rating: "4.1",
    reviews: "1.2K",
    time: "30-40 mins",
    price: "₹200 for two",
    cuisine: "Chinese • Asian • Momos",
    address: "Gachibowli, Hyderabad",
    phone: "+919876543213",
    offer: "15% OFF",
    offerText: "15% OFF up to ₹100",
    offerCode: "CRISPY15",

    menu: {
      Recommended: [
        {
          id: "4-1",
          name: "Chicken Rice Bowl",
          description:
            "Steamed rice topped with spicy chicken and Asian sauce.",
          price: 249,
          image: require("../../../assets/images/crispy_bowl.jpg"),
          isVeg: false,
        },
        {
          id: "4-2",
          name: "Veg Rice Bowl",
          description: "Fresh vegetables tossed with rice and Asian seasoning.",
          price: 199,
          image: require("../../../assets/images/veg_specials.jpg"),
          isVeg: true,
        },
        {
          id: "4-3",
          name: "Crispy Chicken",
          description: "Crispy chicken tossed in our signature Asian sauce.",
          price: 259,
          image: require("../../../assets/images/fried_chicken.jpg"),
          isVeg: false,
        },
      ],

      Biryani: [
        {
          id: "4-4",
          name: "Asian Chicken Rice",
          description: "Aromatic rice with chicken and Asian spices.",
          price: 239,
          image: require("../../../assets/images/crispy_bowl.jpg"),
          isVeg: false,
        },
      ],

      Starters: [
        {
          id: "4-5",
          name: "Chicken Momos",
          description: "Steamed chicken momos served with spicy chutney.",
          price: 169,
          image: require("../../../assets/images/crispy_bowl.jpg"),
          isVeg: false,
        },
        {
          id: "4-6",
          name: "Veg Momos",
          description: "Fresh vegetable momos with spicy Asian chutney.",
          price: 139,
          image: require("../../../assets/images/veg_specials.jpg"),
          isVeg: true,
        },
      ],

      "Main Course": [
        {
          id: "4-7",
          name: "Chicken Noodles",
          description: "Wok-tossed noodles with chicken and fresh vegetables.",
          price: 229,
          image: require("../../../assets/images/crispy_bowl.jpg"),
          isVeg: false,
        },
        {
          id: "4-8",
          name: "Veg Noodles",
          description: "Classic Chinese noodles tossed with fresh vegetables.",
          price: 189,
          image: require("../../../assets/images/veg_specials.jpg"),
          isVeg: true,
        },
      ],
    },
  },
};

// ============================================================
// COMPONENT
// ============================================================

const RestaurantDetails = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { id } = useLocalSearchParams();

  const restaurant = restaurants[String(id)];

  // ==========================================================
  // STATE
  // ==========================================================

  const [selectedCategory, setSelectedCategory] = useState("Recommended");

  const [quantities, setQuantities] = useState({});

  const [isFavorite, setIsFavorite] = useState(false);

  // ==========================================================
  // SAFETY
  // ==========================================================

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="restaurant-outline"
          size={60}
          color={Colors.textMuted}
        />

        <Text style={styles.errorTitle}>Restaurant not found</Text>

        <TouchableOpacity
          style={styles.backHomeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backHomeText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================================
  // MENU CATEGORIES
  // ==========================================================

  const menuCategories = Object.keys(restaurant.menu);

  // ==========================================================
  // CURRENT MENU
  // ==========================================================

  const currentItems = restaurant.menu[selectedCategory] || [];

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const increaseQuantity = (itemId) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const decreaseQuantity = (itemId) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;

      if (current <= 1) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }

      return {
        ...prev,
        [itemId]: current - 1,
      };
    });
  };

  // ==========================================================
  // CART CALCULATION
  // ==========================================================

  const cartItems = useMemo(() => {
    const allItems = Object.values(restaurant.menu).flat();

    return allItems.filter((item) => (quantities[item.id] || 0) > 0);
  }, [restaurant.menu, quantities]);

  const cartCount = useMemo(() => {
    return Object.values(quantities).reduce(
      (total, quantity) => total + quantity,
      0,
    );
  }, [quantities]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + item.price * (quantities[item.id] || 0);
    }, 0);
  }, [cartItems, quantities]);

  const deliveryFee = cartCount > 0 ? 30 : 0;

  const discount =
    cartCount > 0 ? Math.min(Math.round(subtotal * 0.3), 100) : 0;

  const total = subtotal + deliveryFee - discount;

  // ==========================================================
  // MENU ITEM  (IMAGE ON LEFT, DETAILS ON RIGHT)
  // ==========================================================

  // ==========================================================
  // ACTIONS (CALL / DIRECTIONS / TABLE BOOKING / FOOD DETAILS)
  // ==========================================================

  const handleCall = () => {
    Linking.openURL(`tel:${restaurant.phone}`).catch(() => {});
  };

  const handleDirections = () => {
    const destination = encodeURIComponent(
      `${restaurant.name}, ${restaurant.address}`,
    );

    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    ).catch(() => {});
  };

  const handleTableBooking = () => {
    router.push({
      pathname: "/table-booking",
      params: {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
      },
    });
  };

  const openFoodDetails = (item) => {
    router.push({
      pathname: "/Food-Details",
      params: {
        itemId: item.id,
        restaurantId: restaurant.id,
      },
    });
  };

  const renderMenuItem = (item) => {
    const quantity = quantities[item.id] || 0;

    return (
      <View key={item.id} style={styles.menuItem}>
        {/* ITEM IMAGE + ADD (LEFT) */}

        <View style={styles.menuImageContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openFoodDetails(item)}
          >
            <Image
              source={item.image}
              style={styles.menuItemImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => increaseQuantity(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => decreaseQuantity(item.id)}
              >
                <Ionicons name="remove" size={17} color={Colors.white} />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => increaseQuantity(item.id)}
              >
                <Ionicons name="add" size={17} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ITEM DETAILS (RIGHT) */}

        <View style={styles.menuItemDetails}>
          {/* VEG */}

          <View
            style={[
              styles.vegIndicator,
              {
                borderColor: item.isVeg ? Colors.success : Colors.primary,
              },
            ]}
          >
            <View
              style={[
                styles.vegIndicatorDot,
                {
                  backgroundColor: item.isVeg ? Colors.success : Colors.primary,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openFoodDetails(item)}
          >
            <Text style={styles.menuItemName} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>

          <Text style={styles.menuItemPrice}>₹{item.price}</Text>

          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <Text style={styles.itemRating}>
            <Ionicons name="star" size={11} color={Colors.rating} /> 4.5
          </Text>
        </View>
      </View>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          cartCount > 0 && {
            paddingBottom: 100,
          },
        ]}
      >
        {/* ==================================================
            HERO
        ================================================== */}

        <View style={styles.heroContainer}>
          <Image
            source={restaurant.image}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroOverlay}>
            {/* BACK */}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>

            {/* ACTIONS */}

            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <Ionicons name="share-outline" size={20} color={Colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? Colors.primary : Colors.white}
                />
              </TouchableOpacity>
            </View>

            {/* OPEN NOW */}

            <View style={styles.openBadge}>
              <View style={styles.openDot} />

              <Text style={styles.openText}>OPEN NOW</Text>
            </View>
          </View>
        </View>

        {/* ==================================================
            RESTAURANT INFORMATION
        ================================================== */}

        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>

          {/* STATS */}

          <View style={styles.statsContainer}>
            {/* RATING */}

            <View style={styles.statItem}>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={13} color={Colors.white} />

                <Text style={styles.ratingValue}>{restaurant.rating}</Text>
              </View>

              <Text style={styles.statLabel}>{restaurant.reviews} ratings</Text>
            </View>

            <View style={styles.statDivider} />

            {/* DELIVERY */}

            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />

              <Text style={styles.statValue}>{restaurant.time}</Text>

              <Text style={styles.statLabel}>Delivery</Text>
            </View>

            <View style={styles.statDivider} />

            {/* PRICE */}

            <View style={styles.statItem}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={Colors.primary}
              />

              <Text style={styles.statValue}>
                {restaurant.price.replace(" for two", "")}
              </Text>

              <Text style={styles.statLabel}>for two</Text>
            </View>
          </View>

          {/* ADDRESS */}

          <TouchableOpacity style={styles.addressContainer} activeOpacity={0.8}>
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.primary}
            />

            <Text style={styles.addressText} numberOfLines={1}>
              {restaurant.address}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* QUICK ACTIONS */}

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.8}
              onPress={handleCall}
            >
              <Ionicons name="call-outline" size={20} color={Colors.primary} />

              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.8}
              onPress={handleDirections}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={Colors.primary}
              />

              <Text style={styles.quickActionText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.quickActionPrimary]}
              activeOpacity={0.8}
              onPress={handleTableBooking}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.primary}
              />

              <Text style={styles.quickActionText}>Table Booking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================================================
            OFFER
        ================================================== */}

        <View style={styles.offerCard}>
          <View style={styles.offerIcon}>
            <Ionicons name="pricetag" size={19} color={Colors.white} />
          </View>

          <View style={styles.offerContent}>
            <Text style={styles.offerTitle}>{restaurant.offerText}</Text>

            <Text style={styles.offerSubtitle}>
              Use code {restaurant.offerCode} above ₹299
            </Text>
          </View>

          <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
            <Text style={styles.applyText}>APPLY</Text>
          </TouchableOpacity>
        </View>

        {/* ==================================================
            MENU HEADER
        ================================================== */}

        <View style={styles.menuHeader}>
          <View>
            <Text style={styles.menuTitle}>Menu</Text>

            <Text style={styles.menuSubtitle}>
              {Object.values(restaurant.menu).flat().length} items
            </Text>
          </View>
        </View>

        {/* ==================================================
            MENU CATEGORIES
        ================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuCategoryList}
        >
          {menuCategories.map((category) => {
            const active = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.menuCategoryButton,
                  active && styles.activeMenuCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.menuCategoryText,
                    active && styles.activeMenuCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ==================================================
            MENU ITEMS
        ================================================== */}

        <View style={styles.menuList}>{currentItems.map(renderMenuItem)}</View>
      </ScrollView>

      {/* =====================================================
          CART BAR
      ===================================================== */}

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartCount}>
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </Text>

            <Text style={styles.cartTotal}>₹{total}</Text>
          </View>

          <TouchableOpacity
            style={styles.viewCartButton}
            activeOpacity={0.85}
            onPress={() => router.push("/CartScreen")}
          >
            <Text style={styles.viewCartText}>VIEW CART</Text>

            <Ionicons name="arrow-forward" size={17} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default RestaurantDetails;

// ============================================================
// STYLES
// ============================================================

const createStyles = (Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    scrollContent: {
      paddingBottom: 30,
    },

    // ==========================================================
    // ERROR
    // ==========================================================

    errorContainer: {
      flex: 1,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    errorTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: Fonts.size.lg,
      marginTop: 15,
    },

    backHomeButton: {
      backgroundColor: Colors.primary,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 25,
      marginTop: 20,
    },

    backHomeText: {
      color: Colors.white,
      fontFamily: Fonts.semiBold,
    },

    // ==========================================================
    // HERO
    // ==========================================================

    heroContainer: {
      width: "100%",
      height: 230,
      backgroundColor: Colors.surface,
      position: "relative",
    },

    heroImage: {
      width: "100%",
      height: "100%",
    },

    heroOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.25)",
    },

    backButton: {
      position: "absolute",
      top: 18,
      left: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      alignItems: "center",
      justifyContent: "center",
    },

    heroActions: {
      position: "absolute",
      top: 18,
      right: 12,
      flexDirection: "row",
      gap: 8,
    },

    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      alignItems: "center",
      justifyContent: "center",
    },

    openBadge: {
      position: "absolute",
      bottom: 12,
      left: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.78)",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 5,
    },

    openDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.success,
      marginRight: 5,
    },

    openText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 8,
    },

    // ==========================================================
    // RESTAURANT INFO
    // ==========================================================

    restaurantInfo: {
      paddingHorizontal: 15,
      paddingTop: 15,
    },

    restaurantName: {
      color: Colors.textPrimary,
      fontFamily: Fonts.extraBold,
      fontSize: 24,
    },

    restaurantCuisine: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 15,
      marginTop: 4,
    },

    // ==========================================================
    // STATS
    // ==========================================================

    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      marginTop: 15,
      paddingVertical: 13,
    },

    statItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    statDivider: {
      width: 1,
      height: 38,
      backgroundColor: Colors.divider,
    },

    ratingBox: {
      backgroundColor: Colors.success,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },

    ratingValue: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 12,
    },

    statValue: {
      color: Colors.success,
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      marginTop: 3,
    },

    statLabel: {
      color: Colors.textPrimary,
      fontFamily: Fonts.medium,
      fontSize: 14,
      marginTop: 3,
    },

    // ==========================================================
    // ADDRESS
    // ==========================================================

    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 13,
      marginTop: 10,
      borderWidth: 1,
      borderColor: Colors.border,
    },

    addressText: {
      flex: 1,
      color: Colors.warningDark,
      fontFamily: Fonts.regular,
      fontSize: 16,
      marginHorizontal: 8,
    },

    // ==========================================================
    // QUICK ACTIONS
    // ==========================================================

    quickActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 10,
    },

    quickActionButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      gap: 4,
    },

    quickActionPrimary: {
      borderColor: Colors.primary,
    },

    quickActionText: {
      color: Colors.textPrimary,
      fontFamily: Fonts.semiBold,
      fontSize: 13,
    },

    // ==========================================================
    // OFFER
    // ==========================================================

    offerCard: {
      marginHorizontal: 15,
      marginTop: 15,
      backgroundColor: "rgba(255,32,40,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,32,40,0.35)",
      borderRadius: 12,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
    },

    offerIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: Colors.info,
      alignItems: "center",
      justifyContent: "center",
    },

    offerContent: {
      flex: 1,
      marginLeft: 10,
    },

    offerTitle: {
      color: Colors.info,
      fontFamily: Fonts.bold,
      fontSize: 14,
    },

    offerSubtitle: {
      color: Colors.textSecondary,
      fontFamily: Fonts.regular,
      fontSize: 12,
      marginTop: 3,
    },

    applyButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },

    applyText: {
      color: Colors.primary,
      fontFamily: Fonts.bold,
      fontSize: 14,
    },

    // ==========================================================
    // MENU HEADER
    // ==========================================================

    menuHeader: {
      paddingHorizontal: 15,
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    menuTitle: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 22,
    },

    menuSubtitle: {
      color: Colors.orangeDark,
      fontFamily: Fonts.medium,
      fontSize: 17,
      marginTop: 2,
    },

    // ==========================================================
    // MENU CATEGORIES
    // ==========================================================

    menuCategoryList: {
      paddingHorizontal: 15,
      paddingTop: 12,
      paddingBottom: 12,
      gap: 8,
    },

    menuCategoryButton: {
      paddingHorizontal: 14,
      height: 34,
      borderRadius: 17,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    activeMenuCategoryButton: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },

    menuCategoryText: {
      color: Colors.textSecondary,
      fontFamily: Fonts.medium,
      fontSize: 16,
    },

    activeMenuCategoryText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
    },

    // ==========================================================
    // MENU
    // ==========================================================

    menuList: {
      paddingHorizontal: 15,
    },

    menuItem: {
      minHeight: 150,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors.divider,
      flexDirection: "row",
    },

    // Image is now on the left, so the gap goes on the LEFT of the details
    menuItemDetails: {
      flex: 1,
      paddingLeft: 12,
    },

    vegIndicator: {
      width: 14,
      height: 14,
      borderRadius: 3,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },

    vegIndicatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    menuItemName: {
      color: Colors.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 19,
      lineHeight: 19,
    },

    menuItemPrice: {
      color: Colors.gold,
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      marginTop: 4,
    },

    menuItemDescription: {
      color: Colors.textMuted,
      fontFamily: Fonts.medium,
      fontSize: 16,
      lineHeight: 14,
      marginTop: 5,
    },

    itemRating: {
      color: Colors.rating,
      fontFamily: Fonts.medium,
      fontSize: 9,
      marginTop: 7,
    },

    // ==========================================================
    // MENU IMAGE
    // ==========================================================

    menuImageContainer: {
      width: 120,
      height: 120,
      position: "relative",
    },

    menuItemImage: {
      width: 120,
      height: 100,
      borderRadius: 10,
    },

    addButton: {
      position: "absolute",
      bottom: 5,
      left: 16,
      right: 16,
      height: 34,
      borderRadius: 8,
      backgroundColor: Colors.primaryDark,
      borderWidth: 1,
      borderColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
    },

    addButtonText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    quantityContainer: {
      position: "absolute",
      bottom: 5,
      left: 8,
      right: 8,
      height: 34,
      borderRadius: 8,
      backgroundColor: Colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 5,
    },

    quantityButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    quantityText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 15,
    },

    // ==========================================================
    // CART BAR
    // ==========================================================

    cartBar: {
      position: "absolute",
      left: 10,
      right: 10,
      bottom: 10,
      minHeight: 62,
      backgroundColor: Colors.primary,
      borderRadius: 15,
      paddingHorizontal: 15,
      paddingVertical: 9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },

    cartCount: {
      color: Colors.white,
      fontFamily: Fonts.medium,
      fontSize: 15,
    },

    cartTotal: {
      color: Colors.white,
      fontFamily: Fonts.extraBold,
      fontSize: 19,
      marginTop: 2,
    },

    viewCartButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 13,
      paddingVertical: 9,
      backgroundColor: Colors.primaryDark,
      borderRadius: 10,
    },

    viewCartText: {
      color: Colors.white,
      fontFamily: Fonts.bold,
      fontSize: 15,
    },
  });
