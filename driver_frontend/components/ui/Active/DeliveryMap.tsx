import { DeliveryQueueForDriver, DeliveryStatus } from "@/types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import polyline from "@mapbox/polyline";
import Constants from "expo-constants";
import React, { useEffect, useState, useCallback } from "react";
import { Linking, Text, TouchableOpacity, View, Alert } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { Button, Card } from "react-native-paper";
import { formatTime, getPriorityInfo, getStatusClasses, getStatusLabel, getStatusTextClasses } from "@/Lib/utils";
import { DeliveryStatusChange } from "@/Lib/fetchDataServices";
// import * as IntentLauncher from "expo-intent-launcher";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface DeliveryMapProps {
  delivery: DeliveryQueueForDriver | null;
  setDeliveryStatus: (status: DeliveryStatus) => void;
  deliveryStatus: DeliveryStatus;
}

export default function DeliveryMap({ delivery, setDeliveryStatus, deliveryStatus}: DeliveryMapProps) {
  const [currentLocation] = useState("Udupi City Bus Stand, Udupi, Karnataka");
  const [eta, setEta] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Map state
  const [region, setRegion] = useState<Region>({
    latitude: 13.3409, // Default Udupi latitude
    longitude: 74.7421, // Default Udupi longitude
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Route and coordinates state
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [originCoords, setOriginCoords] = useState<Coordinates>({
    latitude: 13.3409,
    longitude: 74.7421,
  });
  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  // Fetch route and coordinates
  const fetchRoute = useCallback(async () => {
    if (!delivery?.dropoff_location) return;

    try {
      setIsLoading(true);

      const origin = encodeURIComponent(currentLocation);
      const destination = encodeURIComponent(delivery.dropoff_location);

      // Get coordinates for both origin and destination
      const [originCoordsResult, destinationCoordsResult] = await Promise.all([
        getCoordinates(currentLocation),
        getCoordinates(delivery.dropoff_location),
      ]);

      if (originCoordsResult && destinationCoordsResult) {
        setOriginCoords(originCoordsResult);
        setDestinationCoords(destinationCoordsResult);

        // Update map region to show both points
        const centerLat =
          (originCoordsResult.latitude + destinationCoordsResult.latitude) / 2;
        const centerLng =
          (originCoordsResult.longitude + destinationCoordsResult.longitude) /
          2;

        // Calculate appropriate delta to show both points
        const latDiff = Math.abs(
          originCoordsResult.latitude - destinationCoordsResult.latitude
        );
        const lngDiff = Math.abs(
          originCoordsResult.longitude - destinationCoordsResult.longitude
        );

        setRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: Math.max(latDiff * 1.5, 0.01), // Add padding and minimum zoom
          longitudeDelta: Math.max(lngDiff * 1.5, 0.01),
        });
      }

      // Fetch route from Google Directions API
      const apiKey = Constants?.expoConfig?.extra?.googleMapsApiKey as string;

      if (!apiKey) {
        console.error("Google Maps API key not found");
        return;
      }

      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=driving`;

      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.status === "OK" && data.routes?.length > 0) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);

        // Extract duration for ETA
        if (data.routes[0].legs?.[0]?.duration?.text) {
          setEta(data.routes[0].legs[0].duration.text);
        }
      } else {
        console.error("Directions API error:", data.status, data.error_message);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation, delivery?.dropoff_location]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Set default ETA based on priority if no route data
  useEffect(() => {
    if (!delivery) return;

    if (!eta) {
      const etaTimes = {
        high: "10 minutes",
        medium: "15 minutes",
        low: "25 minutes",
      };
      const level = getPriorityInfo(delivery.priority).level as
        | "high"
        | "medium"
        | "low";
      setEta(etaTimes[level]);
    }
  }, [delivery, eta]);

  // Google Maps navigation function (keeping your commented implementation)
  const openGoogleMapsNavigation = () => {
    setDeliveryStatus(DeliveryStatus.in_progress);
    // const origin = `${originCoords.latitude},${originCoords.longitude}`;
    // const destination = `${destCoords.latitude},${destCoords.longitude}`;
    // console.log("Origin: ", origin);
    // console.log("Destination: ", destination);
    // // Check if Google Maps is installed (primarily for iOS)
    // Linking.canOpenURL("comgooglemaps://")
    //   .then((hasGoogleMaps) => {
    //     if (Platform.OS === "ios" && hasGoogleMaps) {
    //       // Use Google Maps app on iOS if available
    //       Linking.openURL(
    //         `comgooglemaps://?saddr=${origin}&daddr=${destination}&directionsmode=driving`
    //       );
    //     } else if (Platform.OS === "ios") {
    //       // Fallback to Apple Maps on iOS
    //       Linking.openURL(
    //         `maps://?saddr=${origin}&daddr=${destination}&dirflg=d`
    //       );
    //     } else {
    //       // For Android devices
    //       // Google Maps is the default, no need to check if installed
    //       Linking.openURL(`google.navigation:q=${destination}&mode=d`);
    //     }
    //   })
    //   .catch((err) => {
    //     // If error occurs with deep linking, fall back to web URL
    //     const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    //     Linking.openURL(webUrl);
    //     console.error("Error opening navigation:", err);
    //   });

    if (!destinationCoords) {
      Alert.alert("Error", "Destination coordinates not available");
      return;
    }

    const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;
    const url = `google.navigation:q=${destination}&mode=d`;

    Linking.openURL(url).catch((err) => {
      console.error("Failed to launch navigation:", err);
      // Fallback to web Google Maps
      const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoords.latitude},${originCoords.longitude}&destination=${destination}&travelmode=driving`;
      Linking.openURL(webUrl);
    });
  };
  // const openGoogleMapsNavigationReliable = ()=>{
  //   setDeliveryStatus(DeliveryStatus.in_progress);

  //   if (!destinationCoords) {
  //     Alert.alert("Error", "Destination coordinates not available");
  //     return;
  //   }

  //   const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;

  //   try {
  //     // This will open the Google Maps app directly with navigation
  //     IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
  //       data: `google.navigation:q=${destination}&mode=d`,
  //       packageName: "com.google.android.apps.maps",
  //     });
  //   } catch (err) {
  //     console.error("Intent launch error:", err);

  //     // Fallback to browser if Google Maps app is not available
  //     const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  //     Linking.openURL(webUrl);
  //   }
  // }
  const changeDeliveryStatus = async(status: DeliveryStatus) => {
    try {
      if (
        !delivery?.driver?.driver_id ||
        !delivery?.delivery_id
      ) {
        throw new Error("Driver ID or Delivery ID is missing");
      }
      await DeliveryStatusChange(
        delivery?.driver?.driver_id,
        delivery?.delivery_id,
        status
      );
      setDeliveryStatus(status);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      Alert.alert("Error", "Failed to update delivery status");
    }
  };
  if (!delivery) {
    return (
      <View className="flex-1 w-full px-2">
        <Card className="overflow-hidden rounded-lg my-2 shadow-lg">
          <View
            style={{ height: 200 }}
            className="items-center justify-center bg-gray-50"
          >
            <Text className="text-gray-500">No delivery data available</Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View className="flex-1 w-full px-2">
      <Card className="overflow-hidden rounded-lg my-2 shadow-lg">
        <View style={{ height: 420 }}>
          <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            zoomEnabled={true}
            zoomControlEnabled={true}
            loadingEnabled={isLoading}
          >
            {/* Origin Marker */}
            <Marker
              coordinate={originCoords}
              title="Your Location"
              description={currentLocation}
              pinColor="blue"
              identifier="origin"
            />

            {/* Destination Marker */}
            {destinationCoords && (
              <Marker
                coordinate={destinationCoords}
                title="Delivery Location"
                description={delivery.dropoff_location}
                pinColor="red"
                identifier="destination"
              />
            )}

            {/* Route Polyline */}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeWidth={4}
                strokeColor="#2563eb"
                lineDashPattern={[1]}
              />
            )}
          </MapView>
        </View>

        <View className="p-4 bg-white">
          <View className="flex-col justify-between gap-2 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#2563eb" />
              <View className="ml-2 flex-1">
                <Text className="font-bold text-base" numberOfLines={2}>
                  {delivery.dropoff_location}
                </Text>
                <Text className="text-xs text-gray-600">
                  Delivery #{delivery.delivery_id}
                </Text>
              </View>
            </View>

            <View className="w-full p-2 flex-row justify-between items-center rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#16a34a" />
                <Text className="ml-1 font-medium">
                  ETA: {isLoading ? "Calculating..." : eta}
                </Text>
              </View>
              {(deliveryStatus === DeliveryStatus.pending ||
                deliveryStatus === DeliveryStatus.in_progress) && (
                <TouchableOpacity
                  onPress={openGoogleMapsNavigation}
                  disabled={!destinationCoords}
                >
                  <Button
                    mode="elevated"
                    className="rounded-lg"
                    buttonColor="#FFD86B"
                    disabled={!destinationCoords}
                    onPress={ () => changeDeliveryStatus(DeliveryStatus.in_progress)}
                    contentStyle={{ paddingHorizontal: 4, paddingVertical: 4 }}
                  >
                    <View className="flex-row items-center justify-center">
                      <AntDesign name="enviromento" size={16} color="black" />
                      <Text className="text-black font-semibold text-sm ml-2">
                        Start Navigation
                      </Text>
                    </View>
                  </Button>
                </TouchableOpacity>
              )}
              {deliveryStatus === DeliveryStatus.completed && (
                <Button
                  mode="elevated"
                  className="rounded-lg"
                  buttonColor="#10B981"
                  contentStyle={{ paddingHorizontal: 4, paddingVertical: 4 }}
                >
                  <View className="flex-row items-center justify-center">
                    <AntDesign name="check" size={16} color="black" />
                    <Text className="text-black font-semibold text-sm ml-2">
                      Completed
                    </Text>
                  </View>
                </Button>
              )}
              {deliveryStatus === DeliveryStatus.cancelled && (
                <Button
                  mode="elevated"
                  className="rounded-lg"
                  buttonColor="#DC2626"
                  contentStyle={{ paddingHorizontal: 4, paddingVertical: 4 }}
                >
                  <View className="flex-row items-center justify-center">
                    <AntDesign name="check" size={16} color="black" />
                    <Text className="text-black font-semibold text-sm ml-2">
                      Cancelled
                    </Text>
                  </View>
                </Button>
              )}
            </View>
          </View>

          <View className="mt-4 flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-xs text-gray-600">
                From:{" "}
                <Text className="font-medium text-gray-700">
                  {currentLocation}
                </Text>
              </Text>
              <Text className="text-xs text-gray-600 mt-1">
                Scheduled for:{" "}
                <Text className="font-medium text-gray-700">
                  {formatTime(delivery.time_slot.start_time)} -{" "}
                  {formatTime(delivery.time_slot.end_time)}
                </Text>
              </Text>
            </View>

            <View
              className={`px-3 py-1 rounded-full ${getStatusClasses(
                delivery.status
              )}`}
            >
              <Text
                className={`text-xs font-medium ${getStatusTextClasses(
                  delivery.status
                )}`}
              >
                {getStatusLabel(delivery.status)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

const getCoordinates = async (address: string): Promise<Coordinates | null> => {
  const apiKey = Constants?.expoConfig?.extra?.googleMapsApiKey;

  if (!apiKey) {
    console.error("Google Maps API key not found");
    return null;
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results?.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      console.error("Geocoding error:", data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};
