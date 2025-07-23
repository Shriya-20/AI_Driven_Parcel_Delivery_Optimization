import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { getRouteByDriverIdAndDate } from "@/Lib/fetchDataServices";
import { RouteData } from "@/types";
import { useAuth } from "@/context/AuthContext"; // Uncomment when you have auth context

const { height: screenHeight } = Dimensions.get("window");
const RouteVisualizationScreen: React.FC = () => {
  // const { driverId } = useAuth(); // Uncomment when auth context is available
  const { driver } = useAuth();
  const mockDriverId = "69ca617c-9259-492f-a73a-e9e351204678"; // Remove when auth context is available
  const driverId = driver ? driver.driver_id : mockDriverId; // Use auth context when available
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);

  const mapRef = useRef<MapView>(null);

  // Fetch routes when date changes
  useEffect(() => {
    if (driverId) {
      fetchRoutes();
    }
  }, [selectedDate, driverId]);

  const fetchRoutes = async () => {
    if (isFetching) {
      console.log("Already fetching, skipping...");
      return;
    }
    
    setIsLoading(true);
    setIsFetching(true);
    
    // try {
    //   const dateString = selectedDate.toISOString().split('T')[0];
    //   const response = await getRouteByDriverIdAndDate(mockDriverId, dateString);
    //   if (!response) {
    //     throw new Error("Failed to fetch routes");
    //   }
    //   if (response.status < 200 || response.status >= 300) {
    //     throw new Error("Failed to fetch routes");
    //   }

    //   const apiResponse = response.data;
    //   const routesData = apiResponse.data || [];

    //   setRoutes(routesData);

    //   if (routesData.length > 0) {
    //     setSelectedRoute(routesData[0]);
    //     // Fit map to show all waypoints
    //     fitMapToRoute(routesData[0]);
    //   } else {
    //     setSelectedRoute(null);
    //   }
    // } catch (error) {
    //   console.error("Error fetching routes:", error);
    //   Alert.alert("Error", "Failed to fetch routes. Please try again.");
    // } finally {
    //   setIsLoading(false);
    //   setIsFetching(false);
    // }
    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      const routesData = await getRouteByDriverIdAndDate(
        mockDriverId,
        dateString
      );
      console.log("Fetched routes:", routesData);
      if (!routesData) {
        setRoutes([]);
        setSelectedRoute(null);
        return;
      }

      setRoutes(routesData);

      if (routesData.length > 0) {
        setSelectedRoute(routesData[0]);
        // Fit map to show all waypoints
        fitMapToRoute(routesData[0]);
      } else {
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      Alert.alert("Error", "Failed to fetch routes. Please try again.");
      setRoutes([]);
      setSelectedRoute(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const fitMapToRoute = (route: RouteData) => {
    if (route.route_details.route_geometry.waypoints.length > 0 && mapRef.current) {
      const coordinates = route.route_details.route_geometry.waypoints.map(wp => ({
        latitude: wp.lat,
        longitude: wp.lng,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "#ef4444"; // red for high priority
      case 2: return "#f59e0b"; // amber for medium priority
      case 3: return "#10b981"; // green for low priority
      default: return "#6b7280"; // gray for default
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return "High";
      case 2: return "Medium";
      case 3: return "Low";
      default: return "Normal";
    }
  };
  
  const formatDuration = (duration: number) => {
    // The API sends duration in minutes, not seconds
    const totalMinutes = duration;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const scrollViewRef = useRef<ScrollView>(null);
  const deliveryStopsRef = useRef<View>(null);
//   console.log(
//     "Duration from API:",
//     selectedRoute?.route_details.route_geometry.total_duration
//   );
//   console.log(
//     "Type:",
//     typeof selectedRoute?.route_details.route_geometry.total_duration
//   );
const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = Math.round(diffInMinutes % 60);

  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
};
  // Function to scroll to delivery stops
  const scrollToDeliveryStops = () => {
    if (scrollViewRef.current && deliveryStopsRef.current) {
      // Measure the position of delivery stops section
      deliveryStopsRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {} // error callback
      );
    }
  };
  const renderRouteSelector = () => (
    <Modal
      visible={showRouteList}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRouteList(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-4 max-h-96">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Select Route</Text>
            <TouchableOpacity onPress={() => setShowRouteList(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {routes.map((route, index) => (
              <TouchableOpacity
                key={route.route_id}
                className={`p-4 rounded-lg mb-3 border ${
                  selectedRoute?.route_id === route.route_id
                    ? 'bg-yellow-50 border-[#FFD86B]'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => {
                  setSelectedRoute(route);
                  fitMapToRoute(route);
                  setShowRouteList(false);
                }}
              >
                <Text className="text-lg font-semibold text-gray-900">
                  Route {index + 1}
                </Text>
                <Text className="text-gray-600 mt-1">
                  {route.route_details.total_deliveries} deliveries • {formatDistance(route.route_details.route_geometry.total_distance)}
                </Text>
                <Text className="text-gray-600">
                  Duration: {formatDuration(route.route_details.route_geometry.total_duration)}
                </Text>
              </TouchableOpacity>
            ))}
            
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFD86B" />
          <Text className="text-gray-600 mt-4 text-lg">Loading routes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // <SafeAreaView className="flex-1 bg-gray-50">
    //   {/* Header */}
    //   <View className="bg-white px-4 py-4 shadow-sm">
    //     <View className="flex-row justify-between items-center">
    //       <Text className="text-2xl font-bold text-gray-900">My Route</Text>
    //       <TouchableOpacity
    //         onPress={fetchRoutes}
    //         disabled={isFetching}
    //         className="bg-[#FFD86B] rounded-lg px-3 py-2"
    //       >
    //         <MaterialCommunityIcons
    //           name={isFetching ? "loading" : "refresh"}
    //           size={20}
    //           color="black"
    //         />
    //       </TouchableOpacity>
    //     </View>

    //     {/* Date Picker */}
    //     <TouchableOpacity
    //       onPress={() => setShowDatePicker(true)}
    //       className="flex-row items-center mt-3 bg-gray-100 rounded-lg px-3 py-2"
    //     >
    //       <MaterialIcons name="date-range" size={20} color="#6B7280" />
    //       <Text className="text-gray-700 ml-2 font-medium">
    //         {selectedDate.toDateString()}
    //       </Text>
    //     </TouchableOpacity>

    //     {showDatePicker && (
    //       <DateTimePicker
    //         value={selectedDate}
    //         mode="date"
    //         display="default"
    //         onChange={onDateChange}
    //         maximumDate={new Date()}
    //       />
    //     )}
    //   </View>

    //   {/* Route Overview Cards */}
    //   {selectedRoute && (
    //     <View className="px-4 py-3">
    //       <View className="bg-white rounded-lg p-4 shadow-sm">
    //         <View className="flex-row justify-between items-center mb-3">
    //           <Text className="text-lg font-bold text-gray-900">
    //             Route Overview
    //           </Text>
    //           {routes.length > 1 && (
    //             <TouchableOpacity
    //               onPress={() => setShowRouteList(true)}
    //               className="bg-[#FFD86B] rounded-lg px-3 py-1"
    //             >
    //               <Text className="text-black font-medium text-sm">
    //                 {routes.length} Routes
    //               </Text>
    //             </TouchableOpacity>
    //           )}
    //         </View>

    //         <View className="flex-row justify-between">
    //           <View className="items-center flex-1">
    //             <Text className="text-2xl font-bold text-gray-900">
    //               {selectedRoute.route_details.total_deliveries}
    //             </Text>
    //             <Text className="text-gray-600 text-sm">Deliveries</Text>
    //           </View>
    //           <View className="items-center flex-1">
    //             <Text className="text-2xl font-bold text-blue-600">
    //               {formatDistance(
    //                 selectedRoute.route_details.route_geometry.total_distance
    //               )}
    //             </Text>
    //             <Text className="text-gray-600 text-sm">Distance</Text>
    //           </View>
    //           {/* <View className="items-center flex-1">
    //             <Text className="text-2xl font-bold text-green-600">
    //               {formatDuration(
    //                 selectedRoute.route_details.route_geometry.total_duration
    //               )}
    //             </Text>
    //             <Text className="text-gray-600 text-sm">Duration</Text>
    //           </View> */}
    //         </View>

    //         <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
    //           <View>
    //             <Text className="text-gray-600 text-sm">Start Time</Text>
    //             <Text className="font-semibold">
    //               {formatTime(selectedRoute.route_details.start_time)}
    //             </Text>
    //           </View>
    //           <View>
    //             <Text className="text-gray-600 text-sm">Est. End Time</Text>
    //             <Text className="font-semibold">
    //               {formatTime(selectedRoute.route_details.estimated_end_time)}
    //             </Text>
    //           </View>
    //         </View>
    //       </View>
    //     </View>
    //   )}
    //   <ScrollView className="flex-1 bg-red-500">
    //     {/* Map */}
    //     {selectedRoute && (
    //       <View className="mx-4 my-4">
    //         <View
    //           className="bg-white rounded-lg overflow-hidden shadow-sm "
    //           style={{ height: 450 }}
    //         >
    //           <MapView
    //             ref={mapRef}
    //             provider={PROVIDER_GOOGLE}
    //             style={{ flex: 1 }}
    //             initialRegion={{
    //               latitude: 13.3479,
    //               longitude: 74.7824,
    //               latitudeDelta: 0.1,
    //               longitudeDelta: 0.1,
    //             }}
    //             showsUserLocation
    //             showsMyLocationButton
    //           >
    //             {/* Route Polyline */}
    //             {selectedRoute.route_details.route_geometry.waypoints.length >
    //               1 && (
    //               <Polyline
    //                 coordinates={selectedRoute.route_details.route_geometry.waypoints.map(
    //                   (wp) => ({
    //                     latitude: wp.lat,
    //                     longitude: wp.lng,
    //                   })
    //                 )}
    //                 strokeColor="#4285f4"
    //                 strokeWidth={4}
    //               />
    //             )}
    //             {/* !old Delivery Markers */}
    //             {/* {selectedRoute.Assignment.map((assignment) => {
    //             const waypoint = selectedRoute.route_details.route_geometry.waypoints.find(
    //               wp => wp.delivery_id === assignment.delivery.delivery_id
    //             );

    //             if (!waypoint) return null;

    //             return (
    //               <Marker
    //                 key={assignment.delivery.delivery_id}
    //                 coordinate={{
    //                   latitude: waypoint.lat,
    //                   longitude: waypoint.lng,
    //                 }}
    //                 title={`Stop ${assignment.sequence_number}: ${assignment.delivery.customer.name}`}
    //                 description={`${assignment.delivery.dropoff_location} | ETA: ${formatTime(assignment.estimated_arrival)}`}
    //                 pinColor={getPriorityColor(assignment.delivery.priority)}
    //               >
    //                 <View
    //                   className="w-8 h-8 rounded-full items-center justify-center border-2 border-white"
    //                   style={{ backgroundColor: getPriorityColor(assignment.delivery.priority) }}
    //                 >
    //                   <Text className="text-white text-xs font-bold">
    //                     {assignment.sequence_number}
    //                   </Text>
    //                 </View>
    //               </Marker>
    //             );
    //           })} */}
    //             {/* new Delivery Markers */}
    //             {selectedRoute.Assignment.map((assignment) => {
    //               return (
    //                 <Marker
    //                   key={assignment.delivery.delivery_id}
    //                   coordinate={{
    //                     latitude: assignment.delivery.customer.latitude,
    //                     longitude: assignment.delivery.customer.longitude,
    //                   }}
    //                   title={`Stop ${assignment.sequence_number}: ${assignment.delivery.customer.name}`}
    //                   description={`${
    //                     assignment.delivery.dropoff_location
    //                   } | ETA: ${formatTime(assignment.estimated_arrival)}`}
    //                   pinColor={getPriorityColor(assignment.delivery.priority)}
    //                 >
    //                   <View
    //                     className="w-8 h-8 rounded-full items-center justify-center border-2 border-white"
    //                     style={{
    //                       backgroundColor: getPriorityColor(
    //                         assignment.delivery.priority
    //                       ),
    //                     }}
    //                   >
    //                     <Text className="text-white text-xs font-bold">
    //                       {assignment.sequence_number}
    //                     </Text>
    //                   </View>
    //                 </Marker>
    //               );
    //             })}
    //           </MapView>
    //         </View>
    //       </View>
    //     )}

    //     {/* Delivery Stops List */}
    //     {selectedRoute && (
    //       <View className="px-4 pb-4">
    //         <View className="bg-white rounded-lg shadow-sm">
    //           <View className="p-4 border-b border-gray-200">
    //             <Text className="text-lg font-bold text-gray-900">
    //               Delivery Stops ({selectedRoute.Assignment.length})
    //             </Text>
    //           </View>

    //           <ScrollView
    //             className="max-h-64"
    //             showsVerticalScrollIndicator={false}
    //             nestedScrollEnabled
    //           >
    //             {selectedRoute.Assignment.sort(
    //               (a, b) => a.sequence_number - b.sequence_number
    //             ).map((assignment) => (
    //               <View
    //                 key={assignment.delivery.delivery_id}
    //                 className="flex-row items-center p-4 border-b border-gray-100"
    //               >
    //                 <View
    //                   className="w-8 h-8 rounded-full items-center justify-center mr-3"
    //                   style={{
    //                     backgroundColor: getPriorityColor(
    //                       assignment.delivery.priority
    //                     ),
    //                   }}
    //                 >
    //                   <Text className="text-white text-sm font-bold">
    //                     {assignment.sequence_number}
    //                   </Text>
    //                 </View>

    //                 <View className="flex-1">
    //                   <View className="flex-row justify-between items-start">
    //                     <Text className="font-semibold text-gray-900 flex-1">
    //                       {assignment.delivery.customer.name}
    //                     </Text>
    //                     <View
    //                       className="px-2 py-1 rounded-full ml-2"
    //                       style={{
    //                         backgroundColor:
    //                           getPriorityColor(assignment.delivery.priority) +
    //                           "20",
    //                       }}
    //                     >
    //                       <Text
    //                         className="text-xs font-medium"
    //                         style={{
    //                           color: getPriorityColor(
    //                             assignment.delivery.priority
    //                           ),
    //                         }}
    //                       >
    //                         {getPriorityText(assignment.delivery.priority)}
    //                       </Text>
    //                     </View>
    //                   </View>

    //                   <Text className="text-gray-600 text-sm mt-1">
    //                     {assignment.delivery.dropoff_location}
    //                   </Text>

    //                   <View className="flex-row justify-between mt-2">
    //                     <Text className="text-gray-500 text-sm">
    //                       📞 {assignment.delivery.customer.phone}
    //                     </Text>
    //                     <Text className="text-gray-500 text-sm">
    //                       🕐 ETA: {formatTime(assignment.estimated_arrival)}
    //                     </Text>
    //                   </View>
    //                 </View>
    //               </View>
    //             ))}
    //           </ScrollView>
    //         </View>
    //       </View>
    //     )}

    //     {/* No Routes Found */}
    //     {!selectedRoute && !isLoading && (
    //       <View className="flex-1 items-center justify-center px-4">
    //         <MaterialIcons name="route" size={64} color="#D1D5DB" />
    //         <Text className="text-gray-600 text-lg mt-4 text-center">
    //           No routes found for {selectedDate.toDateString()}
    //         </Text>
    //         <Text className="text-gray-500 text-center mt-2">
    //           Try selecting a different date or contact your dispatcher.
    //         </Text>
    //       </View>
    //     )}
    //   </ScrollView>

    //   {renderRouteSelector()}
    // </SafeAreaView>
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">My Route</Text>
          <TouchableOpacity
            onPress={fetchRoutes}
            disabled={isFetching}
            className="bg-[#FFD86B] rounded-lg px-3 py-2"
          >
            <MaterialCommunityIcons
              name={isFetching ? "loading" : "refresh"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center mt-3 bg-gray-100 rounded-lg px-3 py-2"
        >
          <MaterialIcons name="date-range" size={20} color="#6B7280" />
          <Text className="text-gray-700 ml-2 font-medium">
            {selectedDate.toDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Route Overview Cards */}
        {selectedRoute && (
          <View className="px-4 py-3">
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  Route Overview
                </Text>
                <View className="flex-row items-center space-x-2">
                  {routes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => setShowRouteList(true)}
                      className="bg-[#FFD86B] rounded-lg px-3 py-1 mr-2"
                    >
                      <Text className="text-black font-medium text-sm">
                        {routes.length} Routes
                      </Text>
                    </TouchableOpacity>
                  )}
                  {/* Scroll to Delivery Stops Button */}
                  <TouchableOpacity
                    onPress={scrollToDeliveryStops}
                    className="bg-blue-500 rounded-lg px-3 py-1 flex-row items-center"
                  >
                    <MaterialIcons name="list" size={16} color="white" />
                    <Text className="text-white font-medium text-sm ml-1">
                      Stops
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {selectedRoute.route_details.total_deliveries}
                  </Text>
                  <Text className="text-gray-600 text-sm">Deliveries</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-blue-600">
                    {formatDistance(
                      selectedRoute.route_details.route_geometry.total_distance
                    )}
                  </Text>
                  <Text className="text-gray-600 text-sm">Distance</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-600">
                    {/* {formatDuration(
                      selectedRoute.route_details.route_geometry.total_duration
                    )} */}
                    {calculateDuration(
                      selectedRoute.route_details.start_time,
                      selectedRoute.route_details.estimated_end_time
                    )}
                  </Text>
                  <Text className="text-gray-600 text-sm">Duration</Text>
                </View>
              </View>

              <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
                <View>
                  <Text className="text-gray-600 text-sm">Start Time</Text>
                  <Text className="font-semibold">
                    {formatTime(selectedRoute.route_details.start_time)}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-600 text-sm">Est. End Time</Text>
                  <Text className="font-semibold">
                    {formatTime(selectedRoute.route_details.estimated_end_time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Map - Much Taller */}
        {selectedRoute && (
          <View className="mx-4 mb-4">
            <View className="bg-white rounded-lg overflow-hidden shadow-sm">
              {/* Map Header with Quick Actions */}
              <View className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold text-gray-900">
                    Route Map
                  </Text>
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => {
                        if (selectedRoute && mapRef.current) {
                          const coordinates = selectedRoute.Assignment.map(
                            (assignment) => ({
                              latitude: assignment.delivery.customer.latitude,
                              longitude: assignment.delivery.customer.longitude,
                            })
                          );
                          mapRef.current.fitToCoordinates(coordinates, {
                            edgePadding: {
                              top: 50,
                              right: 50,
                              bottom: 50,
                              left: 50,
                            },
                            animated: true,
                          });
                        }
                      }}
                      className="bg-blue-500 rounded-lg px-3 py-1"
                    >
                      <MaterialIcons
                        name="center-focus-strong"
                        size={16}
                        color="white"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={scrollToDeliveryStops}
                      className="bg-green-500 rounded-lg px-3 py-1"
                    >
                      <MaterialIcons
                        name="keyboard-arrow-down"
                        size={16}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ height: screenHeight * 0.6 }} // 60% of screen height
                initialRegion={{
                  latitude: 13.3479,
                  longitude: 74.7824,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
                showsUserLocation
                showsMyLocationButton
              >
                {/* Route Polyline */}
                {selectedRoute.route_details.route_geometry.waypoints.length >
                  1 && (
                  <Polyline
                    coordinates={selectedRoute.route_details.route_geometry.waypoints.map(
                      (wp) => ({
                        latitude: wp.lat,
                        longitude: wp.lng,
                      })
                    )}
                    strokeColor="#4285f4"
                    strokeWidth={4}
                  />
                )}

                {/* Delivery Markers */}
                {selectedRoute.Assignment.map((assignment) => {
                  return (
                    <Marker
                      key={assignment.delivery.delivery_id}
                      coordinate={{
                        latitude: assignment.delivery.customer.latitude,
                        longitude: assignment.delivery.customer.longitude,
                      }}
                      title={`Stop ${assignment.sequence_number}: ${assignment.delivery.customer.name}`}
                      description={`${
                        assignment.delivery.dropoff_location
                      } | ETA: ${formatTime(assignment.estimated_arrival)}`}
                      pinColor={getPriorityColor(assignment.delivery.priority)}
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-lg"
                        style={{
                          backgroundColor: getPriorityColor(
                            assignment.delivery.priority
                          ),
                        }}
                      >
                        <Text className="text-white text-sm font-bold">
                          {assignment.sequence_number}
                        </Text>
                      </View>
                    </Marker>
                  );
                })}
              </MapView>
            </View>
          </View>
        )}

        {/* Delivery Stops List - Now with ref for scrolling */}
        {selectedRoute && (
          <View ref={deliveryStopsRef} className="px-4 pb-6">
            <View className="bg-white rounded-lg shadow-sm">
              <View className="p-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-gray-900">
                    Delivery Stops ({selectedRoute.Assignment.length})
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      // Scroll back to top
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                    className="bg-gray-100 rounded-lg p-2"
                  >
                    <MaterialIcons
                      name="keyboard-arrow-up"
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                className="max-h-96"
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {selectedRoute.Assignment.sort(
                  (a, b) => a.sequence_number - b.sequence_number
                ).map((assignment) => (
                  <View
                    key={assignment.delivery.delivery_id}
                    className="flex-row items-center p-4 border-b border-gray-100"
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3 shadow-sm"
                      style={{
                        backgroundColor: getPriorityColor(
                          assignment.delivery.priority
                        ),
                      }}
                    >
                      <Text className="text-white text-sm font-bold">
                        {assignment.sequence_number}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Text className="font-semibold text-gray-900 flex-1">
                          {assignment.delivery.customer.name}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full ml-2"
                          style={{
                            backgroundColor:
                              getPriorityColor(assignment.delivery.priority) +
                              "20",
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{
                              color: getPriorityColor(
                                assignment.delivery.priority
                              ),
                            }}
                          >
                            {getPriorityText(assignment.delivery.priority)}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-gray-600 text-sm mt-1">
                        {assignment.delivery.dropoff_location}
                      </Text>

                      <View className="flex-row justify-between mt-2">
                        <Text className="text-gray-500 text-sm">
                          📞 {assignment.delivery.customer.phone}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          🕐 ETA: {formatTime(assignment.estimated_arrival)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* No Routes Found */}
        {!selectedRoute && !isLoading && (
          <View className="flex-1 items-center justify-center px-4 py-20">
            <MaterialIcons name="route" size={64} color="#D1D5DB" />
            <Text className="text-gray-600 text-lg mt-4 text-center">
              No routes found for {selectedDate.toDateString()}
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Try selecting a different date or contact your dispatcher.
            </Text>
          </View>
        )}
      </ScrollView>

      {renderRouteSelector()}
    </SafeAreaView>
  );
};

export default RouteVisualizationScreen;