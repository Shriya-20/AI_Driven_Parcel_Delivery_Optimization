// import { Axios } from "axios";

// const axios = new Axios({
//   baseURL: process.env.MAIN_SERVER_BASE_URL,
// });

// export async function updateDriverLocation(driverId:string, latitude:number, longitude:number) {
//   try {
//     const body = {
//         driverId,
//         latitude,
//         longitude
//     }
//     //for now only this we will keep basically all those battery level,speed,heading etc will be but main are these only
//     const response = await axios.post(`/api/drivers/${driverId}/location`, body);

//     if (response.status === 200) {
//       // Successfully updated
//       return response.data.data;
//     } else {
//       throw new Error("Failed to update driver location");
//     }
//   } catch (error) {
//     console.error("Error updating driver location of driver with ID:", driverId, error);
//     return null;
//   }
// }

import axios from "axios"; // Use default axios import

const axiosInstance = axios.create({
  baseURL: process.env.MAIN_SERVER_BASE_URL || "http://localhost:8000", // Fallback to localhost if not set
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

export async function updateDriverLocation(
  driver_id: string,
  latitude: number,
  longitude: number
) {
  try {
    const body = {
      driver_id,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    };

    console.log("Updating driver location:", body);

    const response = await axiosInstance.post(
      `/api/drivers/${driver_id}/location`,
      body
    );

    if (response.status === 200) {
      console.log("Successfully updated driver location:", response.data);
      return {
        driver_id,
        latitude,
        longitude,
        timestamp: body.timestamp,
        ...response.data.data, // Include any additional data from your API response
      };
    } else {
      throw new Error(
        `Failed to update driver location. Status: ${response.status}`
      );
    }
  } catch (error) {
    console.error(
      "Error updating driver location for driver ID:",
      driver_id,
      error
    );

    // Return a fallback object so the frontend can still update with cached data
    // You might want to return null if you prefer to skip the update entirely
    return {
      driver_id,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      cached: true, // Flag to indicate this wasn't saved to DB
    };
  }
}