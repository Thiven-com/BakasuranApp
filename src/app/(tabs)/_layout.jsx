import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const COLORS = {
  red: "#f30707",
  black: "#1b1212",
  gray: "#ebe6e6",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,

        tabBarActiveTintColor: COLORS.red,
        tabBarInactiveTintColor: COLORS.gray,

        tabBarStyle: {
          height: 72,
          backgroundColor: COLORS.black,
          borderTopWidth: 1,
          borderTopColor: "#242424",
          paddingTop: 8,
          paddingBottom: 10,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? "person" : "person-outline"}
            size={size}
            color={color}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}