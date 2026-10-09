import { Stack } from "expo-router";

import Colors from "../constants/Colors";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    />
  );
};

export default RootLayout;
