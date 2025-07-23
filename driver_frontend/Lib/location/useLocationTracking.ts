//!this doesnt have the notification part
// // useLocationTracking.ts
// import { useEffect } from "react";
// import * as Location from "expo-location";
// import { LOCATION_TASK_NAME } from "./location-task";

// export const useLocationTracking = () => {
//   useEffect(() => {
//     const setupTracking = async () => {
//       const { status: fgStatus } =
//         await Location.requestForegroundPermissionsAsync();
//       const { status: bgStatus } =
//         await Location.requestBackgroundPermissionsAsync();

//       const foregroundGranted = fgStatus === "granted";
//       const backgroundGranted = bgStatus === "granted";

//       console.log("🟢 Foreground permission:", foregroundGranted);
//       console.log("🔵 Background permission:", backgroundGranted);

//       if (!foregroundGranted || !backgroundGranted) {
//         console.warn("❌ Permissions not granted");
//         return;
//       }

//       const hasStarted = await Location.hasStartedLocationUpdatesAsync(
//         LOCATION_TASK_NAME
//       );
//       console.log("⏯ Has location tracking started?", hasStarted);

//       if (!hasStarted) {
//         console.log("🚀 Starting background location tracking");
//         await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//           accuracy: Location.Accuracy.Highest,
//           timeInterval: 4000, // every 4 sec
//           distanceInterval: 0, // report every time interval even if not moved
//           showsBackgroundLocationIndicator: true,
//           foregroundService: {
//             notificationTitle: "Tracking location",
//             notificationBody: "MargaDarshi is running in background",
//             notificationColor: "#FF5722",
//           },
//         });
//       } else {
//         console.log("✅ Already tracking location");
//       }
//     };

//     setupTracking();
//   }, []);
// };

//!this is the one with notification part
// useLocationTracking.ts
import * as Location from "expo-location";
import { useEffect } from "react";
import { LOCATION_TASK_NAME } from "./location-task";
// import * as Notifications from "expo-notifications";
export const useLocationTracking = () => {
  useEffect(() => {
    const setupTracking = async () => {
      // ✅ Request notification permission (needed for Android 13+)
    //   const { status: notifStatus } =
        // await Notifications.requestPermissionsAsync();
    //   console.log("🔔 Notification permission:", notifStatus);
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      const { status: bgStatus } =
        await Location.requestBackgroundPermissionsAsync();

      const foregroundGranted = fgStatus === "granted";
      const backgroundGranted = bgStatus === "granted";

      console.log("🟢 Foreground permission:", foregroundGranted);
      console.log("🔵 Background permission:", backgroundGranted);

      if (!foregroundGranted || !backgroundGranted) {
        console.warn("❌ Permissions not granted");
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      console.log("⏯ Has location tracking started?", hasStarted);

      if (!hasStarted) {
        console.log("🚀 Starting background location tracking");
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 4000, // every 4 sec
          distanceInterval: 0, // report every time interval even if not moved
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Tracking location",
            notificationBody: "MargaDarshi is running in background",
            notificationColor: "#FF5722",
          },
          pausesUpdatesAutomatically: false,
        });
      } else {
        console.log("✅ Already tracking location");
      }
    };

    setupTracking();
  }, []);
};
