import { Ionicons } from "@expo/vector-icons";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const foods = [
  {
    id: "1",
    name: "Chicken Biryani",
    image: require("../../assets/images/chicken_biryani.jpg"),
    restaurant: "Spice House",
    rating: "4.8",
    price: "₹249",
    oldPrice: "₹299",
    deliveryTime: "25 min",
    isVeg: false,
  },
  {
    id: "2",
    name: "Paneer Special",
    image: require("../../assets/images/paneer.jpg"),
    restaurant: "Spice House",
    rating: "4.6",
    price: "₹199",
    oldPrice: "₹249",
    deliveryTime: "25 min",
    isVeg: true,
  },
  {
    id: "3",
    name: "Fried Chicken",
    image: require("../../assets/images/fried_chicken.jpg"),
    restaurant: "Crispy Bowl",
    rating: "4.7",
    price: "₹279",
    oldPrice: "₹329",
    deliveryTime: "30 min",
    isVeg: false,
  },
  {
    id: "4",
    name: "Veg Special",
    image: require("../../assets/images/veg_specials.jpg"),
    restaurant: "Food Paradise",
    rating: "4.5",
    price: "₹179",
    oldPrice: "₹219",
    deliveryTime: "20 min",
    isVeg: true,
  },
  {
    id: "5",
    name: "Ice Cream",
    image: require("../../assets/images/ice_cream.jpg"),
    restaurant: "Sweet Corner",
    rating: "4.8",
    price: "₹149",
    oldPrice: "₹179",
    deliveryTime: "15 min",
    isVeg: true,
  },
];

const FoodCard = () => {
  const renderFood = ({ item }) => {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85}>
        {/* Food Image */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />

          {/* Veg / Non-Veg */}
          <View
            style={[
              styles.foodType,
              {
                borderColor: item.isVeg ? Colors.success : Colors.primary,
              },
            ]}
          >
            <View
              style={[
                styles.foodTypeDot,
                {
                  backgroundColor: item.isVeg ? Colors.success : Colors.primary,
                },
              ]}
            />
          </View>

          {/* Wishlist */}
          <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={19} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.restaurant} numberOfLines={1}>
            {item.restaurant}
          </Text>

          {/* Rating & Delivery */}
          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={11} color={Colors.white} />

              <Text style={styles.rating}>{item.rating}</Text>
            </View>

            <View style={styles.dot} />

            <Ionicons
              name="time-outline"
              size={13}
              color={Colors.textSecondary}
            />

            <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
          </View>

          {/* Price */}
          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{item.price}</Text>

              <Text style={styles.oldPrice}>{item.oldPrice}</Text>
            </View>

            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <Ionicons name="add" size={21} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Popular Near You</Text>

          <Text style={styles.subtitle}>Best food picks for you</Text>
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Food List */}
      <FlatList
        data={foods}
        renderItem={renderFood}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default FoodCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 28,

    paddingBottom: 20,

    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: Colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
  },

  subtitle: {
    marginTop: 3,

    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  seeAll: {
    color: Colors.primary,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
  },

  list: {
    paddingHorizontal: 20,
  },

  card: {
    width: 215,

    marginRight: 15,

    overflow: "hidden",

    borderRadius: 18,

    backgroundColor: Colors.card,

    borderWidth: 1,
    borderColor: Colors.divider,
  },

  imageContainer: {
    width: "100%",
    height: 155,

    position: "relative",

    backgroundColor: Colors.surface,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  foodType: {
    position: "absolute",

    top: 10,
    left: 10,

    width: 18,
    height: 18,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 3,

    backgroundColor: Colors.white,

    borderWidth: 1.5,
  },

  foodTypeDot: {
    width: 8,
    height: 8,

    borderRadius: 4,
  },

  favoriteButton: {
    position: "absolute",

    top: 10,
    right: 10,

    width: 34,
    height: 34,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 17,

    backgroundColor: "rgba(0, 0, 0, 0.55)",

    borderWidth: 1,
    borderColor: Colors.lightOverlay,
  },

  details: {
    padding: 13,
  },

  name: {
    color: Colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  restaurant: {
    marginTop: 3,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  infoRow: {
    marginTop: 9,

    flexDirection: "row",
    alignItems: "center",
  },

  ratingContainer: {
    height: 21,

    paddingHorizontal: 6,

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 5,

    backgroundColor: Colors.success,
  },

  rating: {
    marginLeft: 3,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xs,
  },

  dot: {
    width: 3,
    height: 3,

    marginHorizontal: 7,

    borderRadius: 2,

    backgroundColor: Colors.textMuted,
  },

  deliveryTime: {
    marginLeft: 3,

    color: Colors.textSecondary,

    fontFamily: Fonts.medium,
    fontSize: Fonts.size.xs,
  },

  bottomRow: {
    marginTop: 11,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  price: {
    color: Colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
  },

  oldPrice: {
    marginLeft: 6,

    color: Colors.textMuted,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,

    textDecorationLine: "line-through",
  },

  addButton: {
    width: 34,
    height: 34,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 17,

    backgroundColor: Colors.primary,
  },
});
