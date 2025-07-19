/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/fetchDataService.ts
// Remove any "use server" directive from this file
import axios from "axios";
import { getAllDrivers, getTommorrowScheduledDeliveries, OrderData, ResponseData, RouteResponse } from "./types";
import { ParamValue } from "next/dist/server/request/params";

const backendURL = process.env.NEXT_PUBLIC_API_URL as string; 

export async function getRouteByDriverIdAndDate(
  driver_id: string,
  date: string
) {
  try {
    console.log(
      "Making API call to:",
      `${backendURL}/routes/route/admin/${driver_id}/${date}`
    );

    const res = await axios.get(
      `${backendURL}/routes/route/admin/${driver_id}/${date}`,
      {
        timeout: 10000, // 10 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API Response",res.data);
    if(res.data.success === false) {
      console.error("API Error:", res.data.message);
      return null;
      // throw new Error(res.data.message);
    }

    console.log("API Response:", res.data);
    return res.data.data as RouteResponse[];
  } catch (error) {
    console.error("API Error:", error);
    // throw error;
    return null;
  }
}
interface OrderHistoryResponse extends ResponseData {
  data: {
    completed: OrderData[];
    ongoing: OrderData[];
    pending: OrderData[];
    summary: {
      total_completed: number;
      total_ongoing: number;
      total_pending: number;
      total_orders: number;
    };
  };
}
export async function getOrderHistory() {
  const res = await axios.get(`${backendURL}/delivery/orderhistory`);
  const data: OrderHistoryResponse = res.data;
  console.log("Order History Data:", data);
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message);
}

export async function getDashboardStats() {
  const res = await axios.get(`${backendURL}/dashboard/stats`);
  return res;
}
export async function getDailyPerformance(days: number) {
  const res = await axios.get(
    `${backendURL}/dashboard/performance?days=${days}`
  );
  return res;
}

export async function getStatusDistribution() {
  const res = await axios.get(`${backendURL}/dashboard/status-distribution`);
  return res;
}

export async function fetchtopDrivers() {
  const res = await axios.get(`${backendURL}/dashboard/drivers/top?limit=5`);
  return res;
}

export async function getRecentActivities() {
  const res = await axios.get(`${backendURL}/dashboard/activity?limit=10`);
  return res;
}

export async function getPeakHours(days: number) {
  const res = await axios.get(
    `${backendURL}/dashboard/peak-hours?days=${days}`
  );
  return res;
}

export async function getFleetStatus() {
  const res = await axios.get(`${backendURL}/dashboard/fleet-status`);
  return res;
}

export async function assignBulkRoutes(
  deliveries: getTommorrowScheduledDeliveries[],
  date: string
) {
  const res = await axios.post(`${backendURL}/routes/assignbulk`, {
    deliveries,
    date,
  });
  return res;
}


export interface getDriversDataResponse extends ResponseData {
  data: getAllDrivers[];
}
export interface getTomorrowScheduledDeliveriesResponse extends ResponseData {
  data: getTommorrowScheduledDeliveries[];
}
export async function getDriversData() {
  const res = await axios.get(`${backendURL}/drivers`);
  const data: getDriversDataResponse = res.data;
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message);
}

export async function getTomorrowScheduledDeliveries(Date: string) {
  // const tomorrow = new Date();
  // tomorrow.setDate(tomorrow.getDate() + 1);
  // const formattedDate = tomorrow.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  //for now we will use today's date
  // const formattedDate = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  const formattedDate = "2025-05-26";

  //!IMP-> we expect to get proper date i.e for assign one day next ka and for customer two days next ka in YYYY-MM-DD format
  const res = await axios.get(`${backendURL}/delivery?date=${formattedDate}`);
  const data: getTomorrowScheduledDeliveriesResponse = res.data;
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message);
}


// export async function getPolylineFromGoogleMaps(
//   routeData: RouteResponse[],
//   driverId: string,
//   drivers: getAllDrivers[]
// ): Promise<string[]> {
//   try {
//     // Sort route data by sequence to ensure correct order
//     console.log("Route Data:", routeData);
//     const sortedRouteData = routeData.length > 1 ? routeData.sort((a, b) => a.sequence - b.sequence) : routeData;

//     // Find the driver
//     const driver = drivers.find((driver) => driver.driver_id === driverId);

//     if (
//       !driver ||
//       !driver.driver_location ||
//       driver.driver_location.length === 0
//     ) {
//       console.error(
//         "Driver not found or no location available for ID:",
//         driverId
//       );
//       return [];
//     }

//     if (!routeData || routeData.length === 0) {
//       console.error("No route data available");
//       return [];
//     }

//     // Driver's starting location
//     const startLocation = {
//       latitude: driver.driver_location[0].latitude,
//       longitude: driver.driver_location[0].longitude,
//     };

//     // Create an array of all points including start location
//     const allPoints = [
//       startLocation,
//       ...sortedRouteData.map((point) => ({
//         latitude: point.latitude,
//         longitude: point.longitude,
//       })),
//     ];

//     // Generate polylines between consecutive points
//     const polylinePromises = [];

//     for (let i = 0; i < allPoints.length - 1; i++) {
//       const origin = allPoints[i];
//       const destination = allPoints[i + 1];

//       const requestBody = {
//         origin: {
//           location: {
//             latLng: {
//               latitude: origin.latitude,
//               longitude: origin.longitude,
//             },
//           },
//         },
//         destination: {
//           location: {
//             latLng: {
//               latitude: destination.latitude,
//               longitude: destination.longitude,
//             },
//           },
//         },
//         travelMode: "DRIVE",
//         polylineQuality: "OVERVIEW",
//         routingPreference: "TRAFFIC_AWARE",
//       };

//       const headers = {
//         "Content-Type": "application/json",
//         "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Make sure this env variable is set
//         "X-Goog-FieldMask":
//           "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
//       };

//       polylinePromises.push(
//         axios.post(
//           "https://routes.googleapis.com/directions/v2:computeRoutes",
//           requestBody,
//           { headers }
//         )
//       );
//     }

//     // Wait for all requests to complete
//     const responses = await Promise.all(polylinePromises);

//     // Extract polylines from responses
//     const polylines: string[] = responses
//       .map((response, index) => {
//         if (response.data?.routes?.[0]?.polyline?.encodedPolyline) {
//           return response.data.routes[0].polyline.encodedPolyline;
//         } else {
//           console.warn(`No polyline found for segment ${index}`);
//           return "";
//         }
//       })
//       .filter((polyline) => polyline !== ""); // Remove empty polylines

//     return polylines;
//   } catch (error) {
//     console.error("Error fetching polylines from Google Maps:", error);
//     if (axios.isAxiosError(error)) {
//       console.error("Response data:", error.response?.data);
//       console.error("Response status:", error.response?.status);
//     }
//     return [];
//   }
// }

// export async function getPolylineFromGoogleMaps(
//   routeData: RouteResponse[],
//   driverId: string,
//   drivers: getAllDrivers[]
// ): Promise<string[]> {
//   try {
//     // Sort route data by sequence to ensure correct order
//     const sortedRouteData = routeData.length > 1 ? routeData.sort((a, b) => a.sequence - b.sequence) : routeData;

//     // Find the driver
//     const driver = drivers.find((driver) => driver.driver_id === driverId);

//     if (
//       !driver ||
//       !driver.driver_location ||
//       driver.driver_location.length === 0
//     ) {
//       console.error(
//         "Driver not found or no location available for ID:",
//         driverId
//       );
//       return [];
//     }

//     if (!routeData || routeData.length === 0) {
//       console.error("No route data available");
//       return [];
//     }

//     // Driver's starting location
//     const startLocation = {
//       latitude: driver.driver_location[0].latitude,
//       longitude: driver.driver_location[0].longitude,
//     };

//     // Create an array of all points including start location
//     const allPoints = [
//       startLocation,
//       ...sortedRouteData.map((point) => ({
//         latitude: point.latitude,
//         longitude: point.longitude,
//       })),
//     ];

//     // Handle special case: only driver location (no deliveries)
//     if (allPoints.length === 1) {
//       console.log("Only driver location available, no route to generate");
//       return [];
//     }

//     // Handle special case: only one delivery location
//     if (allPoints.length === 2) {
//       console.log(
//         "Only one delivery location found, creating single route segment"
//       );
//     }

//     // Generate polylines between consecutive points
//     const polylinePromises = [];

//     for (let i = 0; i < allPoints.length - 1; i++) {
//       const origin = allPoints[i];
//       const destination = allPoints[i + 1];

//       const requestBody = {
//         origin: {
//           location: {
//             latLng: {
//               latitude: origin.latitude,
//               longitude: origin.longitude,
//             },
//           },
//         },
//         destination: {
//           location: {
//             latLng: {
//               latitude: destination.latitude,
//               longitude: destination.longitude,
//             },
//           },
//         },
//         travelMode: "DRIVE",
//         polylineQuality: "OVERVIEW",
//         routingPreference: "TRAFFIC_AWARE",
//         // Optional: Add departure time for better traffic data
//         departureTime: new Date().toISOString(),
//       };

//       const headers = {
//         "Content-Type": "application/json",
//         "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Make sure this env variable is set
//         "X-Goog-FieldMask":
//           "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
//       };

//       polylinePromises.push(
//         axios
//           .post(
//             "https://routes.googleapis.com/directions/v2:computeRoutes",
//             requestBody,
//             { headers }
//           )
//           .catch((error) => {
//             console.error(`Error fetching polyline for segment ${i}:`, error);
//             return null; // Return null for failed requests
//           })
//       );
//     }

//     // Wait for all requests to complete
//     const responses = await Promise.all(polylinePromises);

//     // Extract polylines from responses, filtering out failed requests
//     const polylines: string[] = responses
//       .filter((response) => response !== null) // Remove failed requests
//       .map((response, index) => {
//         if (response?.data?.routes?.[0]?.polyline?.encodedPolyline) {
//           return response.data.routes[0].polyline.encodedPolyline;
//         } else {
//           console.warn(`No polyline found for segment ${index}`);
//           return "";
//         }
//       })
//       .filter((polyline) => polyline !== ""); // Remove empty polylines

//     console.log(`Successfully generated ${polylines.length} polyline segments`);
//     return polylines;
//   } catch (error) {
//     console.error("Error fetching polylines from Google Maps:", error);
//     if (axios.isAxiosError(error)) {
//       console.error("Response data:", error.response?.data);
//       console.error("Response status:", error.response?.status);

//       // Handle specific Google Maps API errors
//       if (error.response?.status === 400) {
//         console.error("Bad request - check your coordinates and API key");
//       } else if (error.response?.status === 403) {
//         console.error("API key issues - check permissions and quotas");
//       } else if (error.response?.status === 429) {
//         console.error("Rate limit exceeded - too many requests");
//       }
//     }
//     return [];
//   }
// }

// export async function getPolylineFromGoogleMaps(
//   routeData: RouteResponse[],
//   driverId: string,
//   drivers: getAllDrivers[]
// ): Promise<string[]> {
//   try {
//     // Validate input
//     console.log("Route Data:", routeData);
//     if (!routeData || routeData.length === 0) {
//       console.error("No route data available");
//       return [];
//     }

//     // Sort route data by sequence
//     const sortedRouteData =
//       routeData.length > 1
//         ? [...routeData].sort((a, b) => a.sequence - b.sequence)
//         : routeData;

//     // Find the driver
//     const driver = drivers.find((driver) => driver.driver_id === driverId);

//     if (
//       !driver ||
//       !driver.driver_location ||
//       driver.driver_location.length === 0
//     ) {
//       console.error(
//         "Driver not found or no location available for ID:",
//         driverId
//       );
//       return [];
//     }

//     // Driver's starting location
//     const startLocation = {
//       latitude: driver.driver_location[0].latitude,
//       longitude: driver.driver_location[0].longitude,
//     };
//     let deliveryPoints;
//     if (sortedRouteData.length == 1) {
//       deliveryPoints = [
//         {
//           latitude: sortedRouteData[0].latitude,
//           longitude: sortedRouteData[0].longitude,
//         },
//       ];
//     } else {
//       deliveryPoints = sortedRouteData.map((point) => ({
//         latitude: point.latitude,
//         longitude: point.longitude,
//       }));
//     }

//     const polylinePromises = [];

//     // Case: Only one delivery ➝ start ➝ delivery
//     if (deliveryPoints.length === 1) {
//       const origin = startLocation;
//       const destination = deliveryPoints[0];

//       polylinePromises.push(
//         fetchPolyline(origin, destination).catch((error) => {
//           console.error("Error fetching polyline for single delivery:", error);
//           return null;
//         })
//       );
//     } else {
//       // Case: Multiple deliveries ➝ segment-wise polylines
//       const allPoints = [startLocation, ...deliveryPoints];

//       for (let i = 0; i < allPoints.length - 1; i++) {
//         const origin = allPoints[i];
//         const destination = allPoints[i + 1];

//         polylinePromises.push(
//           fetchPolyline(origin, destination).catch((error) => {
//             console.error(`Error fetching polyline for segment ${i}:`, error);
//             return null;
//           })
//         );
//       }
//     }

//     // Await all polylines
//     const responses = await Promise.all(polylinePromises);

//     const polylines: string[] = responses
//       .filter((response) => response !== null)
//       .map((response, index) => {
//         if (response?.data?.routes?.[0]?.polyline?.encodedPolyline) {
//           return response.data.routes[0].polyline.encodedPolyline;
//         } else {
//           console.warn(`No polyline found for segment ${index}`);
//           return "";
//         }
//       })
//       .filter((polyline) => polyline !== "");

//     console.log(
//       `Successfully generated ${polylines.length} polyline segment(s)`
//     );
//     return polylines;
//   } catch (error) {
//     console.error("Error fetching polylines from Google Maps:", error);
//     if (axios.isAxiosError(error)) {
//       console.error("Response data:", error.response?.data);
//       console.error("Response status:", error.response?.status);
//       if (error.response?.status === 400) {
//         console.error("Bad request - check your coordinates and API key");
//       } else if (error.response?.status === 403) {
//         console.error("API key issues - check permissions and quotas");
//       } else if (error.response?.status === 429) {
//         console.error("Rate limit exceeded - too many requests");
//       }
//     }
//     return [];
//   }
// }
export async function getPolylineFromGoogleMaps(
  routeData: RouteResponse[],
  driverId: string,
  drivers: getAllDrivers[]
): Promise<string[]> {
  try {
    // Validate input
    console.log("Route Data:", routeData);
    if (!routeData || routeData.length === 0) {
      console.error("No route data available");
      return [];
    }

    // Sort route data by sequence
    const sortedRouteData = [...routeData].sort(
      (a, b) => a.sequence - b.sequence
    );

    // Find the driver
    const driver = drivers.find((driver) => driver.driver_id === driverId);

    if (
      !driver ||
      !driver.driver_location ||
      driver.driver_location.length === 0
    ) {
      console.error(
        "Driver not found or no location available for ID:",
        driverId
      );
      return [];
    }

    // Driver's starting location
    const startLocation = {
      latitude: driver.driver_location[0].latitude,
      longitude: driver.driver_location[0].longitude,
    };

    // Extract delivery points (remove redundant conditional logic)
    const deliveryPoints = sortedRouteData.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));

    // Validate delivery points have valid coordinates
    const validDeliveryPoints = deliveryPoints.filter(
      (point) =>
        point.latitude != null &&
        point.longitude != null &&
        !isNaN(point.latitude) &&
        !isNaN(point.longitude)
    );

    if (validDeliveryPoints.length === 0) {
      console.error("No valid delivery coordinates found");
      return [];
    }

    // Create all route segments: start -> delivery1 -> delivery2 -> ... -> deliveryN
    const allPoints = [startLocation, ...validDeliveryPoints];
    const polylinePromises = [];

    // Generate polylines for each segment
    for (let i = 0; i < allPoints.length - 1; i++) {
      const origin = allPoints[i];
      const destination = allPoints[i + 1];

      // Validate coordinates before making API call
      if (isValidCoordinate(origin) && isValidCoordinate(destination)) {
        polylinePromises.push(
          fetchPolyline(origin, destination).catch((error) => {
            console.error(
              `Error fetching polyline for segment ${i} (${origin.latitude},${origin.longitude} -> ${destination.latitude},${destination.longitude}):`,
              error
            );
            return null;
          })
        );
      } else {
        console.warn(`Invalid coordinates for segment ${i}:`, {
          origin,
          destination,
        });
      }
    }

    if (polylinePromises.length === 0) {
      console.error("No valid polyline requests could be made");
      return [];
    }

    // Await all polylines with timeout handling
    const responses = await Promise.allSettled(polylinePromises);

    const polylines: string[] = responses
      .map((result, index) => {
        if (
          result.status === "fulfilled" &&
          result.value?.data?.routes?.[0]?.polyline?.encodedPolyline
        ) {
          return result.value.data.routes[0].polyline.encodedPolyline;
        } else {
          if (result.status === "rejected") {
            console.warn(`Polyline request ${index} failed:`, result.reason);
          } else {
            console.warn(`No polyline found for segment ${index}`);
          }
          return null;
        }
      })
      .filter(
        (polyline): polyline is string => polyline !== null && polyline !== ""
      );

    console.log(
      `Successfully generated ${polylines.length} polyline segment(s) out of ${
        allPoints.length - 1
      } requested`
    );

    if (polylines.length === 0) {
      console.warn("No polylines were successfully generated");
    }

    return polylines;
  } catch (error) {
    console.error("Error fetching polylines from Google Maps:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      if (error.response?.status === 400) {
        console.error("Bad request - check your coordinates and API key");
      } else if (error.response?.status === 403) {
        console.error("API key issues - check permissions and quotas");
      } else if (error.response?.status === 429) {
        console.error("Rate limit exceeded - too many requests");
      }
    }
    return [];
  }
}

// Helper function to validate coordinates
function isValidCoordinate(point: {
  latitude: number;
  longitude: number;
}): boolean {
  return (
    point.latitude != null &&
    point.longitude != null &&
    !isNaN(point.latitude) &&
    !isNaN(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

// Helper function to call Google Maps Directions API
async function fetchPolyline(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) {
  const requestBody = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      },
    },
    travelMode: "DRIVE",
    polylineQuality: "OVERVIEW",
    routingPreference: "TRAFFIC_AWARE",
    departureTime: new Date().toISOString(),
  };

  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    "X-Goog-FieldMask":
      "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
  };

  return axios.post(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    requestBody,
    { headers }
  );
}


// Alternative function for creating a single optimized route with all waypoints
export async function getOptimizedPolylineFromGoogleMaps(
  routeData: RouteResponse[],
  driverId: string,
  drivers: getAllDrivers[]
): Promise<string> {
  try {
    const sortedRouteData = routeData.sort((a, b) => a.sequence - b.sequence);
    const driver = drivers.find((driver) => driver.driver_id === driverId);

    if (
      !driver ||
      !driver.driver_location ||
      driver.driver_location.length === 0
    ) {
      console.error(
        "Driver not found or no location available for ID:",
        driverId
      );
      return "";
    }

    if (!routeData || routeData.length === 0) {
      console.error("No route data available");
      return "";
    }

    const startLocation = {
      latitude: driver.driver_location[0].latitude,
      longitude: driver.driver_location[0].longitude,
    };

    // Create waypoints array (excluding start and end)
    const waypoints = sortedRouteData.slice(0, -1).map((point) => ({
      location: {
        latLng: {
          latitude: point.latitude,
          longitude: point.longitude,
        },
      },
    }));

    // Last point as destination
    const destination = sortedRouteData[sortedRouteData.length - 1];

    const requestBody = {
      origin: {
        location: {
          latLng: startLocation,
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },
      intermediates: waypoints,
      travelMode: "DRIVE",
      polylineQuality: "HIGH_QUALITY",
      routingPreference: "TRAFFIC_AWARE",
      optimizeWaypointOrder: true, // This optimizes the route order
      departureTime: new Date().toISOString(),
    };

    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex",
    };

    const response = await axios.post(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      requestBody,
      { headers }
    );

    if (response.data?.routes?.[0]?.polyline?.encodedPolyline) {
      return response.data.routes[0].polyline.encodedPolyline;
    }

    return "";
  } catch (error) {
    console.error("Error fetching optimized polyline:", error);
    return "";
  }
}

export async function fetchDeliveryByDeliveryId(deliveryId: string){
  try {
    const res = await axios.get(`${backendURL}/delivery/${deliveryId}`);
    const resData =  res.data;
    if(resData.success){
      return resData.data;
    }
  } catch (error) {
    console.error("Error fetching delivery by ID:", error);
    throw error;
  }
}

export async function sendTimeslot(payload: {
  deliveryId: ParamValue;
  timeSlot: {
    start_time: any;
    end_time: any;
  };
}) {
  try {
    console.log("Sending timeslot for delivery ID:", payload.deliveryId);
    console.log("Timeslot data:", payload.timeSlot);
    const res = await axios.post(
      `http://localhost:8000/api/delivery/${payload.deliveryId}/time-slot`,
      payload
    );
    const resData = res.data;
    if (resData.success) {
      return resData.data;
    }
  } catch (error) {
    console.error("Error sending time slot:", error);
    throw error;
  }
}

export async function sendEmailsToCustomers(deliveries: getTommorrowScheduledDeliveries[]) {
  try {
    console.log("Sending emails for deliveries:", deliveries);
    const res = await axios.post(
      `${backendURL}/email/send-timeslots-emails`,
      { deliveries }
    );
    const resData = res.data;
    console.log("Email response data:", resData);
    if (resData.success) {
      return resData;
    } else {
      throw new Error(resData.message);
    }
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
}