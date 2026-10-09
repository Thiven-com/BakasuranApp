import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const SearchBar = ({ value = "", onChangeText, onSubmitEditing }) => {
  const handleSubmit = () => {
    if (onSubmitEditing) {
      onSubmitEditing();
      return;
    }

    if (value && value.trim()) {
      router.push({
        pathname: "/(tabs)/ExploreScreen",
        params: { search: value.trim() },
      });
    } else {
      router.push("/(tabs)/ExploreScreen");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={23} color={Colors.white} />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Search for restaurants, cuisines, dishes..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          returnKeyType="search"
        />

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/ExploreScreen")}
        >
          <Ionicons name="options-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#060808",
  },

  searchContainer: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  input: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    paddingVertical: 0,
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },

  filterButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
