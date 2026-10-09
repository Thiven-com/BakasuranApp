import { router } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const categories = [
  {
    id: "1",
    label: "All",
    icon: require("../../assets/images/order-food.png"),
    route: "/(tabs)/ExploreScreen",
  },
  {
    id: "2",
    label: "Dosa",
    icon: require("../../assets/images/BookTable.png"),
    route: "/table-booking",
  },
  {
    id: "3",
    label: "South Indian",
    icon: require("../../assets/images/offers.png"),
    route: "/Offers&DealsScreen",
  },
  {
    id: "4",
    label: "Biryani",
    icon: require("../../assets/images/Top-Rated.png"),
    route: "/(tabs)/ExploreScreen",
  },
  {
    id: "5",
    label: "Idli",
    icon: require("../../assets/images/AllCuisines.png"),
    route: "/(tabs)/ExploreScreen",
  },
];

const CategoryCard = () => {
  const handlePress = (route) => {
    router.push(route);
  };

  const renderCategory = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.8}
        onPress={() => handlePress(item.route)}
      >
        <Image source={item.icon} style={styles.image} resizeMode="contain" />

        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },

  list: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },

  item: {
    width: 115,
    alignItems: "center",
    justifyContent: "flex-start",
    marginRight: 5,
  },

  image: {
    width: 110,
    height: 100,
    marginBottom: 4,
  },

  name: {
    color: "#222222",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    width: 115,
  },
});
