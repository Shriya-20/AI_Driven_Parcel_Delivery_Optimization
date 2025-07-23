"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";
// Remove useRouter import from here - not needed!

interface DriverForLogin {
  driver_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string;
  address: string | null;
  start_location_latitude: number | null;
  start_location_longitude: number | null;
  start_location: string;
  refresh_token: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

type AuthContextType = {
  isAuthenticated: boolean;
  isMainLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  driver: DriverForLogin | null;
  token: string | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isMainLoading: true,
  login: async () => false,
  logout: () => {},
  driver: null,
  token: null,
});

const axiosInstance = axios.create({
  baseURL: "http://192.168.31.193:8000/api",
  // baseURL: "http://26.219.114.145:8000/api",
  // baseURL: "http://192.168.30.246:8000/api",
  withCredentials: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMainLoading, setisMainLoading] = useState(true);
  const [driver, setDriver] = useState<DriverForLogin | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Remove router from here - navigation will be handled by layouts!

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = async () => {
      try {
        const driverString = await AsyncStorage.getItem("driver");
        const tokenString = await AsyncStorage.getItem("token");
        if (driverString) {
          const driverData = JSON.parse(driverString);
          setDriver(driverData);
          setIsAuthenticated(true);
        }
        if (tokenString) {
          setToken(tokenString);
        }
      } catch (error) {
        console.error("Failed to get driver data", error);
      } finally {
        setisMainLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (email && password) {
        console.log("Attempting to login with", email);
        console.log("password", password);

        const response = await axiosInstance.post("/auth/login/driver", {
          email,
          password,
        });

        const driverData = response.data.data.driver;
        const token = response.data.data.token;
        if (!driverData || !token) {
          throw new Error("Invalid login response");
        }
        console.log("Login successful", driverData, token);
        await AsyncStorage.setItem("driver", JSON.stringify(driverData));
        await AsyncStorage.setItem("token", token);
        setDriver(driverData);
        setToken(token);
        setIsAuthenticated(true);
        // Remove router.push - layout will handle navigation automatically!
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out");
      Toast.show({
        type: "success",
        text1: "Logout Successful",
        text2: "You have been logged out successfully.",
      });
      await AsyncStorage.removeItem("driver");
      await AsyncStorage.removeItem("token");
      setDriver(null);
      setToken(null);
      setIsAuthenticated(false);
      // Remove router.push("/") - layout will handle navigation automatically!
      console.log("Logout successful");

      // Debug logs
      const driverString = await AsyncStorage.getItem("driver");
      const tokenString = await AsyncStorage.getItem("token");
      console.log("Driver after logout:", driverString);
      console.log("Token after logout:", tokenString);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isMainLoading, login, logout, driver, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};
