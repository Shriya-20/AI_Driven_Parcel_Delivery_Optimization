// "use client";

// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { useState, useEffect, useCallback } from "react";
// import { ScrollView, View, Text, Switch } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { ActivityIndicator } from "react-native-paper";
// import Toast from "react-native-toast-message";
// import { useAuth } from "../../context/AuthContext";
// import DeliveryQueue from "../ui/DeliveryQueue";
// import WeatherAlert from "../ui/WeatherAlert";
// import { DeliveryQueueForDriver } from "@/types";
// import { DashboardDataFetcher } from "@/Lib/fetchDataServices";
// // import { startBackgroundLocationTracking } from "@/Lib/location/StartTracking";
// // import AsyncStorage from "@react-native-async-storage/async-storage";

// const DashboardScreen = () => {
//   const { user } = useAuth();
//   const [isAvailable, setIsAvailable] = useState(true);
//   const [deliveryQueue, setDeliveryQueue] = useState<DeliveryQueueForDriver[]>(
//     []
//   );
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // After successful login to store the driverId in AsyncStorage
//   // useEffect(() => {
//   //   const setDriverId = async () => {
//   //     try {
//   //       await AsyncStorage.setItem("driverId", user?.id || "");
//   //       console.log("Driver ID stored successfully");
//   //     } catch (error) {
//   //       console.error("Failed to store driver ID:", error);
//   //     }
//   //   };
//   //   if (user?.id) {
//   //     setDriverId();
//   //   }
//   // }, [user]);

//   // To start the background location tracking (not tested for now but should work)
//   // useEffect(() => {
//   //   const initializeLocationTracking = async () => {
//   //     try {
//   //       await startBackgroundLocationTracking();
//   //       console.log("Background location tracking started");
//   //     } catch (error) {
//   //       console.error("Failed to start location tracking:", error);
//   //     }
//   //   };
//   //   initializeLocationTracking();
//   // }, []);

//   const fetchDeliveryQueue = useCallback(async (showToast = true) => {
//     try {
//       setError(null);
//       setIsLoading(true);

//       // Should send the driverId and date to the backend to fetch the deliveries
//       // For now just use the mock data
//       const mockDriverId = "69ca617c-9259-492f-a73a-e9e351204678";
//       const mockDate = "2025-05-25";
//       const deliveryQueue = await DashboardDataFetcher(mockDriverId, mockDate);

//       if (deliveryQueue && deliveryQueue.length > 0) {
//         setDeliveryQueue(deliveryQueue);

//         if (showToast) {
//           Toast.show({
//             type: "success",
//             text1: "Success",
//             text2: `Loaded ${deliveryQueue.length} deliveries successfully`,
//             position: "top",
//           });
//         }
//       } else {
//         setDeliveryQueue([]);

//         if (showToast) {
//           Toast.show({
//             type: "info",
//             text1: "Info",
//             text2: "No deliveries found",
//             position: "top",
//           });
//         }
//       }
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to fetch deliveries";
//       setError(errorMessage);

//       Toast.show({
//         type: "error",
//         text1: "Error",
//         text2: `Error loading deliveries: ${errorMessage}`,
//         position: "top",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const handleRefresh = useCallback(() => {
//     fetchDeliveryQueue(true);
//   }, [fetchDeliveryQueue]);

//   const handleAvailabilityToggle = useCallback((value: boolean) => {
//     setIsAvailable(value);
//     Toast.show({
//       type: value ? "success" : "info",
//       text1: value ? "Available" : "Unavailable",
//       text2: `You are now ${
//         value ? "available" : "unavailable"
//       } for deliveries`,
//       position: "top",
//     });
//   }, []);

//   useEffect(() => {
//     fetchDeliveryQueue(false);
//   }, [fetchDeliveryQueue]);

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-gray-50">
//         <View className="flex-1 items-center justify-center">
//           <ActivityIndicator size="large" animating={true} />
//           <Text className="text-gray-500 mt-4 text-base">
//             Loading dashboard...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 80 }}
//         className="p-4"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header Section */}
//         <View className="flex-row justify-between items-center mb-6">
//           <View className="flex-1">
//             <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
//             <Text className="text-gray-500 mt-1">
//               Welcome back, {user?.name || "Driver"}
//             </Text>
//           </View>

//           <View className="flex-row items-center ml-4">
//             <Switch
//               value={isAvailable}
//               onValueChange={handleAvailabilityToggle}
//               trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
//               thumbColor={isAvailable ? "#2563eb" : "#f3f4f6"}
//             />
//             <Text
//               className={`ml-2 font-medium ${
//                 isAvailable ? "text-blue-600" : "text-gray-500"
//               }`}
//             >
//               {isAvailable ? "Available" : "Unavailable"}
//             </Text>
//           </View>
//         </View>

//         {/* Error Display */}
//         {error && (
//           <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//             <Text className="text-red-800 font-medium">Error</Text>
//             <Text className="text-red-600 mt-1">{error}</Text>
//           </View>
//         )}

//         {/* Delivery Queue Section */}
//         <View className="bg-gray-900 p-4 rounded-lg mb-4">
//           <View className="flex-row justify-between items-center mb-3">
//             <Text className="text-base font-bold text-gray-100">
//               Current Delivery Queue
//             </Text>
//             <View className="bg-gray-100 px-3 py-1 rounded-full">
//               <Text className="text-gray-800 text-sm font-semibold">
//                 {deliveryQueue.length}{" "}
//                 {deliveryQueue.length === 1 ? "Package" : "Packages"}
//               </Text>
//             </View>
//           </View>

//           <DeliveryQueue
//             deliveryQueue={deliveryQueue}
//             onRefresh={handleRefresh}
//           />
//         </View>

//         {/* Weather Alert */}
//         <WeatherAlert />

//         {/* Daily Summary Section */}
//         <View className="bg-gray-900 p-4 rounded-lg">
//           <View className="w-full rounded-lg flex-row items-center justify-center mb-4">
//             <Text className="text-xl text-white text-center font-bold">
//               Daily Summary
//             </Text>
//           </View>

//           <View className="space-y-3">
//             <View className="flex-row gap-2">
//               <View className="flex-1 items-center border border-white justify-center bg-gray-700 rounded-lg p-4">
//                 <MaterialCommunityIcons
//                   name="package-variant"
//                   size={28}
//                   color="white"
//                 />
//                 <Text className="text-xl text-white font-bold mt-2">12</Text>
//                 <Text className="text-white text-sm">Deliveries</Text>
//               </View>

//               <View className="flex-1 items-center border border-white justify-center bg-gray-700 rounded-lg p-4">
//                 <MaterialCommunityIcons
//                   name="currency-usd"
//                   size={28}
//                   color="white"
//                 />
//                 <Text className="text-xl text-white font-bold mt-2">$142</Text>
//                 <Text className="text-white text-sm">Earnings</Text>
//               </View>
//             </View>

//             <View className="flex-row gap-2">
//               <View className="flex-1 items-center border border-white justify-center bg-gray-700 rounded-lg p-4">
//                 <MaterialCommunityIcons
//                   name="clock-outline"
//                   size={28}
//                   color="white"
//                 />
//                 <Text className="text-xl font-bold text-white mt-2">5.2</Text>
//                 <Text className="text-white text-sm">Hours</Text>
//               </View>

//               <View className="flex-1 items-center border border-white justify-center bg-gray-700 rounded-lg p-4">
//                 <MaterialCommunityIcons
//                   name="trending-up"
//                   size={28}
//                   color="white"
//                 />
//                 <Text className="text-xl font-bold text-white mt-2">98%</Text>
//                 <Text className="text-white text-sm">On-time</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default DashboardScreen;

"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollView, View, Text, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
// import { useAuth } from "../../context/AuthContext";
import DeliveryQueue from "../ui/DeliveryQueue";
import WeatherAlert from "../ui/WeatherAlert";
import { DeliveryQueueForDriver } from "@/types";
import { DashboardDataFetcher } from "@/Lib/fetchDataServices";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
// import { startBackgroundLocationTracking } from "@/Lib/location/StartTracking";
// import DebugLocationComponent from "@/Lib/location/DebugLocation";
// import { useRouter } from "expo-router";
const DashboardScreen = () => {
  const { driver } = useAuth();
  // const [isAvailable, setIsAvailable] = useState(true);
  const [deliveryQueue, setDeliveryQueue] = useState<DeliveryQueueForDriver[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDeliveryQueue = useCallback(async (showToast = true) => {
    try {
      setError(null);
      setIsLoading(true);

      // const mockDriverId = "69ca617c-9259-492f-a73a-e9e351204678";
      const mockDate = "2025-05-27";
      //to get based on actual driver and todays date
      const mockDriverId =
        driver?.driver_id || "69ca617c-9259-492f-a73a-e9e351204678";
      // const mockDate = new Date().toISOString().split("T")[0];// !imp for now using the mock date else this only shd be used
      const queue = await DashboardDataFetcher(mockDriverId, mockDate);
      // console.log(queue);
      setDeliveryQueue(queue);

      Toast.show({
        type: queue.length > 0 ? "success" : "info",
        text1: queue.length > 0 ? "Success" : "Info",
        text2:
          queue.length > 0
            ? `Loaded ${queue.length} deliveries successfully`
            : "No deliveries found",
        position: "top",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch deliveries";
      setError(message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Error loading deliveries: ${message}`,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // const handleAvailabilityToggle = (value: boolean) => {
  //   setIsAvailable(value);
  //   Toast.show({
  //     type: value ? "success" : "info",
  //     text1: value ? "Available" : "Unavailable",
  //     text2: `You are now ${
  //       value ? "available" : "unavailable"
  //     } for deliveries`,
  //     position: "top",
  //   });
  // };

  const handleRefresh = () => fetchDeliveryQueue(true);

  useEffect(() => {
    fetchDeliveryQueue(false);
  }, [fetchDeliveryQueue]);
    // To start the background location tracking (not tested for now but should work)
    // useEffect(() => {
    //   const initializeLocationTracking = async () => {
    //     try {
    //       await startBackgroundLocationTracking();
    //       console.log("Background location tracking started");
    //     } catch (error) {
    //       console.error("Failed to start location tracking:", error);
    //     }
    //   };
    //   initializeLocationTracking();
    // }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="text-gray-500 mt-4">Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-black mt-1">
              Welcome back,{" "}
              {deliveryQueue[0]?.driver.first_name +
                " " +
                deliveryQueue[0]?.driver.last_name || "Driver"}
            </Text>
          </View>
          {/* <DebugLocationComponent/> */}
          {/* <View className="flex-row items-center ml-4">
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={isAvailable ? "#2563eb" : "#f3f4f6"}
            />
            <Text
              className={`ml-2 font-medium ${
                isAvailable ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {isAvailable ? "Available" : "Unavailable"}
            </Text>
          </View> */}
        </View>

        {/* Error */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <Text className="text-red-800 font-medium">Error</Text>
            <Text className="text-red-600 mt-1">{error}</Text>
          </View>
        )}

        {/* Delivery Queue */}
        <View className="bg-gray-900 p-4 rounded-lg mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-100">
              Current Delivery Queue
            </Text>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-gray-800 text-sm font-semibold">
                {deliveryQueue.length}{" "}
                {deliveryQueue.length === 1 ? "Package" : "Packages"}
              </Text>
            </View>
          </View>

          <DeliveryQueue
            deliveryQueue={deliveryQueue}
            onRefresh={handleRefresh}
          />
        </View>

        {/* Weather Alert */}
        <WeatherAlert />

        {/* Daily Summary */}
        {/* <View className="bg-gray-900 p-4 rounded-lg">
          <Text className="text-xl text-white text-center font-bold mb-4">
            Daily Summary
          </Text>

          <View className="space-y-3">
            <View className="flex-row gap-2">
              <SummaryCard
                icon="package-variant"
                label="Deliveries"
                value="12"
              />
              <SummaryCard icon="currency-usd" label="Earnings" value="$142" />
            </View>
            <View className="flex-row gap-2">
              <SummaryCard icon="clock-outline" label="Hours" value="5.2" />
              <SummaryCard icon="trending-up" label="On-time" value="98%" />
            </View>
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View className="flex-1 items-center border border-white justify-center bg-gray-700 rounded-lg p-4 mb-2">
    <MaterialCommunityIcons name={icon} size={28} color="white" />
    <Text className="text-xl text-white font-bold mt-2">{value}</Text>
    <Text className="text-white text-sm">{label}</Text>
  </View>
);

export default DashboardScreen;
