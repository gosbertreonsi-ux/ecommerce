import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ShopThemeProvider, useShopTheme } from "../theme/ShopTheme";

function Navigation() {
  const { theme, colors } = useShopTheme();
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="product/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ShopThemeProvider>
      <Navigation />
    </ShopThemeProvider>
  );
}
