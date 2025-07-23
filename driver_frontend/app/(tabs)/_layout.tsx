import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Tabs,useRouter } from "expo-router";
import "../globals.css";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
// import "../../Lib/location/location-task";

export default function TabLayout() {
  const { isAuthenticated, isMainLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isMainLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isMainLoading]);

  // Show loading spinner while checking authentication
  if (isMainLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111827",
        }}
      >
        <ActivityIndicator size="large" color="#FFD86B" />
      </View>
    );
  }

  // Don't render tabs if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFD86B",
        tabBarStyle: { backgroundColor: "#111827" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <AntDesign size={24} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: "Active",
          tabBarIcon: ({ color }) => (
            <Fontisto size={24} name="checkbox-active" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: "Route",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={24} name="route" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <AntDesign size={24} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
