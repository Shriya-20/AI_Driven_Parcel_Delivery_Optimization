// "use client";

// import { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useAuth } from "../../context/AuthContext";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// const LoginScreen = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [activeTab, setActiveTab] = useState("login");
//   const router = useRouter();
//   const { login, isAuthenticated } = useAuth();
//   useEffect(() => {
//     if (isAuthenticated) {
//       router.push("/(tabs)");
//     }
//   }, [isAuthenticated]);
//   const handleLogin = async () => {
//     console.log("Logging in with:", email, password);
//     // router.push("/(tabs)");
//     if (!email || !password) {
//       setError("Please enter both email and password");
//       return;
//     }
//     setIsLoading(true);
//     setError("");

//     try {
//       const success = await login(email, password);
//       console.log("Login success:", success);
//       if (!success) {
//         setError("Invalid email or password");
//       } else {
//         router.push("/(tabs)");
//       }
//     } catch (err) {
//       setError("An error occurred during login");
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-900">
//       <ScrollView className="flex-1 p-4">
//         <View className="items-center my-8">
//           <View className="w-16 h-16 rounded-full bg-[#FFD86B] justify-center items-center mb-4">
//             <MaterialCommunityIcons name="shield" size={32} color="#111827" />
//           </View>
//           <Text className="text-2xl font-bold text-white">MargaDarshi</Text>
//           <Text className="text-gray-400 mt-1">Driver Portal</Text>
//         </View>

//         <View className="flex-row mb-4 rounded-lg overflow-hidden bg-gray-700">
//           <TouchableOpacity
//             className={`flex-1 py-3 items-center ${
//               activeTab === "login" ? "bg-gray-800" : ""
//             }`}
//             onPress={() => setActiveTab("login")}
//           >
//             <Text
//               className={`${
//                 activeTab === "login"
//                   ? "text-[#FFD86B] font-bold"
//                   : "text-gray-400"
//               }`}
//             >
//               Login
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className={`flex-1 py-3 items-center ${
//               activeTab === "join" ? "bg-gray-800" : ""
//             }`}
//             onPress={() => setActiveTab("join")}
//           >
//             <Text
//               className={`${
//                 activeTab === "join"
//                   ? "text-[#FFD86B] font-bold"
//                   : "text-gray-400"
//               }`}
//             >
//               Join Us
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {activeTab === "login" ? (
//           <View className="p-4 rounded-lg bg-gray-700 mb-4">
//             <Text className="text-lg font-bold text-white mb-1">
//               Driver Login
//             </Text>
//             <Text className="text-gray-400 mb-4">
//               Enter your credentials to access your account
//             </Text>

//             <View className="space-y-4">
//               <View>
//                 <Text className="text-white mb-1">Email or Phone</Text>
//                 <TextInput
//                   value={email}
//                   onChangeText={setEmail}
//                   className="bg-gray-800 rounded-md px-3 py-2.5 text-white"
//                   placeholderTextColor="#9CA3AF"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                 />
//               </View>

//               <View>
//                 <View className="flex-row justify-between">
//                   <Text className="text-white mb-1">Password</Text>
//                   <TouchableOpacity
//                     onPress={() => router.push("/(tabs)")}
//                   >
//                     <Text className="text-[#FFD86B] text-xs mt-2">
//                       Forgot password?
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//                 <TextInput
//                   value={password}
//                   onChangeText={setPassword}
//                   secureTextEntry
//                   className="bg-gray-800 rounded-md px-3 py-2.5 text-white"
//                   placeholderTextColor="#9CA3AF"
//                 />
//               </View>

//               <View className="flex-row items-center">
//                 <TouchableOpacity
//                   onPress={() => setRememberMe(!rememberMe)}
//                   className={`w-5 h-5 mt-2 rounded border ${
//                     rememberMe
//                       ? "bg-[#FFD86B] border-[#FFD86B]"
//                       : "border-gray-400"
//                   } justify-center items-center`}
//                 >
//                   {rememberMe && (
//                     <MaterialCommunityIcons
//                       name="check"
//                       size={14}
//                       color="#111827"
//                     />
//                   )}
//                 </TouchableOpacity>
//                 <Text className="ml-2 mt-2 text-gray-400 text-sm">
//                   Remember me for 30 days
//                 </Text>
//               </View>

//               {error ? <Text className="text-red-400">{error}</Text> : null}

//               <TouchableOpacity
//                 onPress={handleLogin}
//                 disabled={isLoading}
//                 className="bg-[#FFD86B] rounded-md py-3 items-center mt-2"
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color="#111827" size="small" />
//                 ) : (
//                   <Text className="text-gray-900 font-bold">Sign In</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <View className="p-4 rounded-lg bg-gray-800 mb-4">
//             <Text className="text-lg font-bold text-white mb-1">
//               Join Our Driver Network
//             </Text>
//             <Text className="text-gray-400 mb-4">
//               Become a ParcelAI delivery partner today
//             </Text>

//             <View className="space-y-4">
//               <View>
//                 <Text className="text-white mb-1">Full Name</Text>
//                 <TextInput
//                   className="bg-gray-700 rounded-md px-3 py-2.5 text-white"
//                   placeholderTextColor="#9CA3AF"
//                 />
//               </View>

//               <View>
//                 <Text className="text-white mb-1">Phone Number</Text>
//                 <TextInput
//                   className="bg-gray-700 rounded-md px-3 py-2.5 text-white"
//                   placeholderTextColor="#9CA3AF"
//                   keyboardType="phone-pad"
//                 />
//               </View>

//               <View>
//                 <Text className="text-white mb-1">Email Address</Text>
//                 <TextInput
//                   className="bg-gray-700 rounded-md px-3 py-2.5 text-white"
//                   placeholderTextColor="#9CA3AF"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                 />
//               </View>

//               <View>
//                 <Text className="text-white mb-1">Vehicle Type</Text>
//                 <TextInput
//                   className="bg-gray-700 rounded-md px-3 py-2.5 text-white"
//                   placeholderTextColor="#9CA3AF"
//                   placeholder="Sedan, SUV, Van, etc."
//                 />
//               </View>

//               <View className="flex-row items-center">
//                 <TouchableOpacity className="w-5 h-5 mt-2 rounded border border-gray-400 justify-center items-center">
//                   {/* Empty checkbox */}
//                 </TouchableOpacity>
//                 <Text className="ml-2 text-gray-400 text-sm mt-2">
//                   I agree to the{" "}
//                   <Text className="text-[#FFD86B]">terms and conditions</Text>
//                 </Text>
//               </View>

//               <TouchableOpacity className="bg-[#FFD86B] rounded-md py-3 items-center mt-2">
//                 <Text className="text-gray-900 font-bold">
//                   Submit Application
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         <View className="mt-6 items-center">
//           <Text className="text-gray-400 text-xs">
//             © 2025 Nexustron. All rights reserved.
//           </Text>
//           <View className="flex-row mt-2 gap-2 space-x-4">
//             <TouchableOpacity>
//               <Text className="text-gray-400 text-xs">Privacy</Text>
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <Text className="text-gray-400 text-xs">Terms</Text>
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <Text className="text-gray-400 text-xs">Support</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default LoginScreen;
"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// import { Image } from "expo-image";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    console.log("Logging in with:", email, password);
    // router.push("/(tabs)");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      console.log("Login success:", success);
      if (!success) {
        setError("Invalid email or password");
      } else {
        router.push("/(tabs)");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <View className="items-center my-8">
          <View className="w-16 h-16 rounded-full bg-[#FFD86B] justify-center items-center mb-4">
            <MaterialCommunityIcons name="shield" size={32} color="#111827" />
          {/* <Image
              source={require("../../assets/images/logo.svg")}
              className="w-16 h-16 rounded-full"
            /> */}
          </View>
          {/* <View className="items-center justify-center mt-4">
            <Logo width={80} height={80} />
          </View> */}
          <Text className="text-2xl font-bold text-white">MargaDarshi</Text>
          <Text className="text-gray-400 mt-1">Driver Portal</Text>
        </View>

        <View className="p-4 rounded-lg bg-gray-700 mb-4">
          <Text className="text-lg font-bold text-white mb-1">
            Driver Login
          </Text>
          <Text className="text-gray-400 mb-4">
            Enter your credentials to access your account
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="text-white mb-1">Email or Phone</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="bg-gray-800 rounded-md px-3 py-2.5 text-white"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <View className="flex-row justify-between">
                <Text className="text-white mb-2">Password</Text>
                {/* <TouchableOpacity onPress={() => router.push("/(tabs)")}>
                  <Text className="text-[#FFD86B] text-xs mt-2">
                    Forgot password?
                  </Text>
                </TouchableOpacity> */}
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-gray-800 rounded-md px-3 py-2.5 text-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 mt-2 rounded border ${
                  rememberMe
                    ? "bg-[#FFD86B] border-[#FFD86B]"
                    : "border-gray-400"
                } justify-center items-center`}
              >
                {rememberMe && (
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color="#111827"
                  />
                )}
              </TouchableOpacity>
              <Text className="ml-2 mt-2 text-gray-400 text-sm">
                Remember me for 30 days
              </Text>
            </View> */}

            {error ? <Text className="text-red-400">{error}</Text> : null}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="bg-[#FFD86B] rounded-md py-3 items-center mt-2"
            >
              {isLoading ? (
                <ActivityIndicator color="#111827" size="small" />
              ) : (
                <Text className="text-gray-900 font-bold">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-6 items-center">
          <Text className="text-gray-400 text-xs">
            © 2025 MargaDarshi. All rights reserved.
          </Text>
          <View className="flex-row mt-2 gap-2 space-x-4">
            <TouchableOpacity>
              <Text className="text-gray-400 text-xs">Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-400 text-xs">Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-400 text-xs">Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;