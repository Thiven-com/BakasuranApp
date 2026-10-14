import { Stack } from "expo-router";

import { ThemeProvider } from "../hooks/use-theme";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
