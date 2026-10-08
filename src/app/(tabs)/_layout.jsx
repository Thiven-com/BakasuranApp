import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 82,
          paddingTop: 10,
          paddingBottom: 12,
          backgroundColor: "#0f1010",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#7b7b7b",
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
