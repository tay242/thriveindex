import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppProvider, useApp } from "@/lib/app-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { profile, isLoading } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!profile.onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (profile.onboardingComplete && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoading, profile.onboardingComplete, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({});

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppProvider>
          <NavThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavThemeProvider>
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
