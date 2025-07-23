import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { LOCATION_TASK_NAME } from "@/Lib/location/location-task";

const DebugLocationComponent = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [taskStatus, setTaskStatus] = useState("Unknown");

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  const checkTrackingStatus = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      setIsTracking(hasStarted);

      const registeredTasks = await TaskManager.getRegisteredTasksAsync();
      const locationTask = registeredTasks.find(
        (task) => task.taskName === LOCATION_TASK_NAME
      );
      setTaskStatus(locationTask ? "Registered" : "Not Registered");
    } catch (error) {
      console.error("Error checking tracking status:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLastLocation(location.coords);
      console.log("Manual location fetch:", location.coords);
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const testLocationUpdates = async () => {
    try {
      // Start watching position changes
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (location) => {
          console.log("Watch position update:", location.coords);
          setLastLocation(location.coords);
        }
      );
    } catch (error) {
      console.error("Error watching position:", error);
    }
  };

  return (
    <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <Text className="text-blue-800 font-bold mb-2">Location Debug</Text>

      <View className="space-y-2">
        <Text className="text-blue-700">
          Background Tracking: {isTracking ? "Active" : "Inactive"}
        </Text>
        <Text className="text-blue-700">Task Status: {taskStatus}</Text>

        {lastLocation && (
          <View>
            <Text className="text-blue-700">Last Location:</Text>
            <Text className="text-blue-600 text-sm">
              Lat: {lastLocation.latitude.toFixed(6)}
            </Text>
            <Text className="text-blue-600 text-sm">
              Lng: {lastLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            onPress={getCurrentLocation}
            className="bg-blue-500 px-3 py-1 rounded"
          >
            <Text className="text-white text-sm">Get Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={testLocationUpdates}
            className="bg-green-500 px-3 py-1 rounded"
          >
            <Text className="text-white text-sm">Start Watch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DebugLocationComponent;
