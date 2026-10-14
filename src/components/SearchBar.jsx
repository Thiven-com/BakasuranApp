import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

const SearchBar = ({ value = "", onChangeText, onSubmitEditing }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

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
        <Ionicons name="search-outline" size={23} color={colors.textSecondary} />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Search for restaurants, cuisines, dishes..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/ExploreScreen")}
        >
          <Ionicons name="options-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;

const makeStyles = (colors, isDark) => StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },

  searchContainer: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    paddingVertical: 0,
    color: colors.textPrimary,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },

  filterButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: isDark ? colors.surface : colors.backgroundElement,
  },
});
