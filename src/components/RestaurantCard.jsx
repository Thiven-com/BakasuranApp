import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const restaurants = [
  {
    id: "1",
    name: "Spice House",
    image: require("../../assets/images/spice_house.jpg"),
    cuisine: "South Indian • Biryani",
    rating: "4.5",
    time: "25-30 min",
  },
  {
    id: "2",
    name: "Crispy Bowl",
    image: require("../../assets/images/crispy_bowl.jpg"),
    cuisine: "Chinese • Fast Food",
    rating: "4.3",
    time: "20-25 min",
  },
  {
    id: "3",
    name: "Pizza Planet",
    image: require("../../assets/images/pizza_planet.jpg"),
    cuisine: "Pizza • Italian",
    rating: "4.6",
    time: "30-35 min",
  },
];

const RestaurantCard = () => {
  const handleRestaurantPress = (item) => {
    router.push({
      pathname: "/Restaurant/[id]",
      params: {
        id: item.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurants Near You</Text>

      {restaurants.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => handleRestaurantPress(item)}
        >
          <Image source={item.image} style={styles.image} resizeMode="cover" />

          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>

            <Text style={styles.cuisine}>{item.cuisine}</Text>

            <View style={styles.bottomRow}>
              <View style={styles.ratingBox}>
                <Text style={styles.rating}>★ {item.rating}</Text>
              </View>

              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RestaurantCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
  },

  card: {
    width: "100%",
    backgroundColor: "#151818",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },

  image: {
    width: "100%",
    height: 190,
  },

  details: {
    padding: 14,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },

  cuisine: {
    color: "#ffffff",
    fontSize: 17,
    marginBottom: 12,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ratingBox: {
    backgroundColor: "#168A3A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  rating: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  time: {
    color: "#F59E0B",
    fontSize: 14,
  },
});
