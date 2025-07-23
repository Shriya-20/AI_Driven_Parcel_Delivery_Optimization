import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import "./globals.css";
// import { toastConfig } from "@/Lib/toastConfig";
import { AuthProvider } from "@/context/AuthContext";
import "@/Lib/location/location-task";
import { useLocationTracking } from "@/Lib/location/useLocationTracking";

export default function RootLayout() {
  useLocationTracking();
  
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
      <Toast swipeable={true} />
    </AuthProvider>
  );
}
