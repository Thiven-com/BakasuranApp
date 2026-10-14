import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import Fonts from "../../constants/Fonts";
import { useTheme } from "../../hooks/use-theme";

const TabsLayout = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 82,
          paddingTop: 10,
          paddingBottom: 12,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? "#7B7B7B" : "#6B7280",
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ExploreScreen"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="CartScreen"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="MyWishlistScreen"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
