import axios , { isAxiosError } from 'axios';
import { DeliveryQueryResponse, RouteData } from '@/types';

// For React Native, you might need to use:
// import { BACKEND_URL } from '@env'; // if using react-native-dotenv
// or define it directly for now:
const BACKEND_URL = "http://192.168.31.193:8000/api";
// const BACKEND_URL = "http://26.219.114.145:8000/api";
// const BACKEND_URL = "http://192.168.30.246:8000/api";

export async function DashboardDataFetcher(driver_id: string, date: string) {
    try {
        // Better URL construction
        const url = `${BACKEND_URL}/drivers/${driver_id}/deliveries`;
        // console.log(url);
        const response = await axios.get(url, {
            params: { date },
            timeout: 10000, // 10 second timeout
        });
        // console.log("response is ",response);
        
        const responseData: DeliveryQueryResponse = response.data;
        // console.log("response data is ",responseData);
        // Check if response structure is valid
        if (!responseData) {
            throw new Error("Invalid response from server");
        }
        
        if (responseData.data === null) {
            console.log("reached here");
            // throw new Error(
            //     responseData.message || "No deliveries found for the given date"
            // );
            return []; // Return an empty array if no deliveries found as null means only that no deliveries were found for this date so
        }
        
        if (responseData.success) {
            return responseData.data;
        }
        
        throw new Error(responseData.message || "Failed to fetch deliveries");
        
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Provide more specific error messages
        if (isAxiosError(error)) {
            console.log(error.response?.data)
            if (error.code === 'ECONNABORTED') {
                throw new Error("Request timed out. Please check your connection.");
            }
            if (error.response?.status === 404) {
                console.log(error.response?.status);
                throw new Error("Driver not found or invalid date.");
            }
            if (error.response && typeof error.response.status === 'number' && error.response.status >= 500) {
                throw new Error("Server error. Please try again later.");
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
        }
        
        throw error;
    }
}

export async function DeliveryDetailsFetcher(driver_id: string, delivery_id: string, date: string) {
    try {
        const url = `${BACKEND_URL}/drivers/${driver_id}/deliveries/${delivery_id}`;
        const response = await axios.get(url, {
            params: { date },
            timeout: 10000, // 10 second timeout
        });
        
        const responseData: DeliveryQueryResponse = response.data;
        
        if (!responseData) {
            throw new Error("Invalid response from server");
        }
        
        if (responseData.data === null) {
            throw new Error(
                responseData.message || "Delivery details not found"
            );
        }
        
        if (responseData.success) {
            return responseData.data;
        }
        
        throw new Error(responseData.message || "Failed to fetch delivery details");
        
    } catch (error) {
        console.error("Error fetching delivery details:", error);
        
        if (isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error("Request timed out. Please check your connection.");
            }
            if (error.response?.status === 404) {
                throw new Error("Delivery not found.");
            }
            if (error.response && typeof error.response.status === 'number' && error.response.status >= 500) {
                throw new Error("Server error. Please try again later.");
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
        }
        
        throw error;
    }
}

export async function DeliveryStatusChange(driver_id: string, delivery_id:string, status: "completed" | "cancelled" | "pending" | "in_progress") {
    try {
        const url = `${BACKEND_URL}/drivers/${driver_id}/${delivery_id}/status`;
        const response = await axios.post(url, { status }, {
            timeout: 10000, // 10 second timeout
        });
        
        const responseData = response.data;
        
        if (!responseData) {
            throw new Error("Invalid response from server");
        }
        
        if (responseData.success) {
            return responseData.data;
        }
        
        throw new Error(responseData.message || "Failed to change delivery status");
        
    } catch (error) {
        console.error("Error changing delivery status:", error);
        
        if (isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error("Request timed out. Please check your connection.");
            }
            if (error.response?.status === 404) {
                throw new Error("Delivery not found.");
            }
            if (error.response && typeof error.response.status === 'number' && error.response.status >= 500) {
                throw new Error("Server error. Please try again later.");
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
        }
        
        throw error;
    }
}

export async function getRouteByDriverIdAndDate(
  driver_id: string,
  date: string
) {
  try {
    console.log(
      "Making API call to:",
      `${BACKEND_URL}/routes/route/${driver_id}/${date}`
    );

    const res = await axios.get(
      `${BACKEND_URL}/routes/route/${driver_id}/${date}`,
      {
        timeout: 10000, // 10 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API Response", res.data);
    if (res.data.success === false) {
      console.error("API Error:", res.data.message);
      return null;
      // throw new Error(res.data.message);
    }

    console.log("API Response:", res.data);
    return res.data.data as RouteData[];
  } catch (error) {
    console.error("API Error:", error);
    // throw error;
    return null;
  }
}