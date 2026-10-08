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

const deals = [
  {
    id: "1",
    name: "Biryani Fest",
    image: require("../../assets/images/biryani_fest.jpg"),
    offer: "50% OFF",
    description: "On selected biryani combos",
    code: "BAKA50",
  },
  {
    id: "2",
    name: "Burger Mania",
    image: require("../../assets/images/burger_mania.jpg"),
    offer: "40% OFF",
    description: "On delicious burger combos",
    code: "BURGER40",
  },
  {
    id: "3",
    name: "Spice House",
    image: require("../../assets/images/spice_house.jpg"),
    offer: "30% OFF",
    description: "On orders above ₹299",
    code: "SPICE30",
  },
];

const DealCard = () => {
  const renderDeal = ({ item }) => {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />

          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>{item.offer}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>

          <View style={styles.bottomRow}>
            <View style={styles.codeContainer}>
              <Ionicons
                name="pricetag-outline"
                size={13}
                color={Colors.primary}
              />

              <Text style={styles.code}>{item.code}</Text>
            </View>

            <TouchableOpacity style={styles.orderButton} activeOpacity={0.8}>
              <Text style={styles.orderText}>ORDER</Text>

              <Ionicons name="arrow-forward" size={14} color={Colors.white} />
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
          <Text style={styles.title}>Hot Deals</Text>

          <Text style={styles.subtitle}>Grab them before they're gone</Text>
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Deals */}
      <FlatList
        data={deals}
        renderItem={renderDeal}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default DealCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 28,

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
    width: 285,

    marginRight: 16,

    overflow: "hidden",

    borderRadius: 18,

    backgroundColor: Colors.card,

    borderWidth: 1,
    borderColor: Colors.divider,
  },

  imageContainer: {
    width: "100%",
    height: 145,

    position: "relative",

    backgroundColor: Colors.surface,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  offerBadge: {
    position: "absolute",

    left: 12,
    top: 12,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 7,

    backgroundColor: Colors.primary,
  },

  offerText: {
    color: Colors.white,

    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.xs,

    letterSpacing: 0.3,
  },

  content: {
    padding: 14,
  },

  name: {
    color: Colors.textPrimary,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
  },

  description: {
    marginTop: 4,

    color: Colors.textSecondary,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
  },

  bottomRow: {
    marginTop: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  codeContainer: {
    height: 30,

    paddingHorizontal: 8,

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 6,

    backgroundColor: "rgba(255, 32, 40, 0.10)",

    borderWidth: 1,
    borderColor: "rgba(255, 32, 40, 0.25)",
  },

  code: {
    marginLeft: 5,

    color: Colors.primary,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xs,
  },

  orderButton: {
    height: 32,

    paddingHorizontal: 11,

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 16,

    backgroundColor: Colors.primary,
  },

  orderText: {
    marginRight: 5,

    color: Colors.white,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xs,
  },
});
