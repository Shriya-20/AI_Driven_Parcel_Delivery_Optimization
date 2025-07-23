import * as TaskManager from "expo-task-manager";
// import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
// import { useAuth } from "@/context/AuthContext";

const LOCATION_TASK_NAME = "background-location-task";
console.log("location-task.ts loaded");
// Initialize socket
// const socket = io("http://localhost:4000");
const socket = io("http://192.168.31.193:4000");
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});
socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});
if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  console.log("Defining background location task...");
  TaskManager.defineTask(
    LOCATION_TASK_NAME,
    async ({
      data,
      error,
    }: {
      data?: {
        locations: { coords: { latitude: number; longitude: number } }[];
      };
      error: TaskManager.TaskManagerError | null;
    }) => {
      console.log("TaskManager.defineTask called");
      if (error) {
        console.error("Location task error:", error);
        return;
      }
      console.log("Background location task triggered:", data?.locations?.[0]);

      if (data && data.locations && data.locations.length > 0) {
        const { locations } = data;
        const { latitude, longitude } = locations[0].coords;
        console.log("Location update received:", latitude, longitude);
        // const driverId = await AsyncStorage.getItem("driverId"); // get driverId stored at login
        // const { driver } = useAuth();
        // const driverId = driver?.driver_id; // Assuming driver object has an id property
        const driverString = await AsyncStorage.getItem("driver");
        let driverData;
        if (driverString) {
          driverData = JSON.parse(driverString);
        }
        const driverId = driverData?.driver_id;
        if (!driverId) return;

        // socket.emit("driver_location", {
        //   driverId,
        //   latitude,
        //   longitude,
        // });
        if (socket.connected) {
          socket.emit("driver_location", {
            driverId,
            latitude,
            longitude,
          });
          console.log("Sent background location:", latitude, longitude);
        } else {
          console.warn("Socket not connected. Skipping emit.");
        }

        console.log("Sent background location:", latitude, longitude);
      }
    }
  );
}

export { LOCATION_TASK_NAME };

// import * as TaskManager from "expo-task-manager";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { io } from "socket.io-client";

// const LOCATION_TASK_NAME = "background-location-task";

// let socket = null;

// const initializeSocket = () => {
//   if (!socket) {
//     socket = io("http://192.168.31.193:4000", {
//       transports: ["websocket"],
//       timeout: 20000,
//     });

//     socket.on("connect", () => {
//       console.log("Socket connected:", socket.id);
//     });

//     socket.on("connect_error", (err) => {
//       console.error("Socket connection error:", err.message);
//     });
//   }
//   return socket;
// };

// TaskManager.defineTask(
//   LOCATION_TASK_NAME,
//   async ({
//     data,
//     error,
//   }: {
//     data?: { locations: { coords: { latitude: number; longitude: number } }[] };
//     error: TaskManager.TaskManagerError | null;
//   }) => {
//     if (error) {
//       console.error("Location task error:", error);
//       return;
//     }

//     if (data && data.locations && data.locations.length > 0) {
//       const { locations } = data;
//       const { latitude, longitude } = locations[0].coords;

//       console.log("Location update received:", latitude, longitude);

//       try {
//         const driverString = await AsyncStorage.getItem("driver");
//         let driverData;
//         if (driverString) {
//           driverData = JSON.parse(driverString);
//         }
//         const driverId = driverData?.driver_id;

//         if (!driverId) {
//           console.warn("No driver ID found");
//           return;
//         }

//         const currentSocket = initializeSocket();

//         if (currentSocket && currentSocket.connected) {
//           currentSocket.emit("driver_location", {
//             driverId,
//             latitude,
//             longitude,
//             timestamp: new Date().toISOString(),
//           });
//           console.log("Sent background location:", latitude, longitude);
//         } else {
//           console.warn("Socket not connected. Attempting to reconnect...");
//           // Store location for retry if needed
//           await AsyncStorage.setItem(
//             "pending_location",
//             JSON.stringify({
//               driverId,
//               latitude,
//               longitude,
//               timestamp: new Date().toISOString(),
//             })
//           );
//         }
//       } catch (error) {
//         console.error("Error processing location:", error);
//       }
//     }
//   }
// );

// export { LOCATION_TASK_NAME };
