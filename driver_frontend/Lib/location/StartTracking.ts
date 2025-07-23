//!main one->but no stoping happens
// import * as Location from "expo-location";
// import { LOCATION_TASK_NAME } from "./location-task";

// export const startBackgroundLocationTracking = async () => {
//   const { status: fgStatus } =
//     await Location.requestForegroundPermissionsAsync();
//   const { status: bgStatus } =
//     await Location.requestBackgroundPermissionsAsync();

//   if (fgStatus !== "granted" || bgStatus !== "granted") {
//     console.warn("Permissions not granted for location tracking.");
//     return;
//   }
//   console.log("Foreground and background permissions granted");

//   const hasStarted = await Location.hasStartedLocationUpdatesAsync(
//     LOCATION_TASK_NAME
//   );
//   console.log("Location tracking started:", hasStarted);
//   if (!hasStarted) {
//     console.log("Starting background location tracking...");
//     await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//       accuracy: Location.Accuracy.BestForNavigation,
//       timeInterval: 3000, // 3 seconds
//       distanceInterval: 5, // 5 meters
//       showsBackgroundLocationIndicator: true,
//       foregroundService: {
//         notificationTitle: "Nexustron App",
//         notificationBody:
//           "Tracking your live location in background, Don't close the app and Don't Worry",
//       },
//     });
//     console.log("Started background location tracking");
//   }
//   console.log("Location tracking is already started");
// };

//!another one but here if already started then stops and then starts again
import * as Location from "expo-location";
import { LOCATION_TASK_NAME } from "./location-task";

export const startBackgroundLocationTracking = async () => {
  try {
    const { status: fgStatus } =
      await Location.requestForegroundPermissionsAsync();
    const { status: bgStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (fgStatus !== "granted" || bgStatus !== "granted") {
      console.warn("Permissions not granted for location tracking.");
      return;
    }

    console.log("Foreground and background permissions granted");

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

    if (hasStarted) {
      console.log("Background location task already running. Stopping it...");
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("Stopped previous background location task");
    }

    console.log("Starting background location tracking...");

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 15000, // in ms
      distanceInterval: 10, // in meters
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Nexustron App",
        notificationBody:
          "Tracking your live location in background. Don’t close the app.",
      },
    });

    console.log("Started background location tracking");
  } catch (error) {
    console.error("Error during background location tracking setup:", error);
  }
};


// import * as Location from "expo-location";
// import { LOCATION_TASK_NAME } from "./location-task";

// export const startBackgroundLocationTracking = async () => {
//   try {
//     // Request permissions
//     const { status: fgStatus } =
//       await Location.requestForegroundPermissionsAsync();
//     const { status: bgStatus } =
//       await Location.requestBackgroundPermissionsAsync();

//     if (fgStatus !== "granted" || bgStatus !== "granted") {
//       console.warn("Permissions not granted for location tracking.");
//       throw new Error("Location permissions not granted");
//     }

//     // Check if already started
//     const hasStarted = await Location.hasStartedLocationUpdatesAsync(
//       LOCATION_TASK_NAME
//     );

//     if (hasStarted) {
//       console.log("Location tracking already started");
//       return;
//     }

//     // Start location updates with more aggressive settings for testing
//     await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//       accuracy: Location.Accuracy.High,
//       timeInterval: 5000, // Reduced to 5 seconds for testing
//       distanceInterval: 10, // Reduced to 10 meters for testing
//       showsBackgroundLocationIndicator: true,
//       deferredUpdatesInterval: 5000,
//       foregroundService: {
//         notificationTitle: "Nexustron App",
//         notificationBody: "Tracking your live location in background",
//         notificationColor: "#3b82f6",
//       },
//     });

//     console.log("Started background location tracking");

//     // Test with current location
//     const currentLocation = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.High,
//     });
//     console.log("Current location:", currentLocation.coords);
//   } catch (error) {
//     console.error("Error starting location tracking:", error);
//     throw error;
//   }
// };

// export const stopBackgroundLocationTracking = async () => {
//   try {
//     const hasStarted = await Location.hasStartedLocationUpdatesAsync(
//       LOCATION_TASK_NAME
//     );
//     if (hasStarted) {
//       await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
//       console.log("Stopped background location tracking");
//     }
//   } catch (error) {
//     console.error("Error stopping location tracking:", error);
//   }
// };