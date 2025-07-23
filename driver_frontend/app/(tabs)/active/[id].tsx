import CustomerInfo from "@/components/ui/Active/CustomerInfo";
import DeliveryInfo from "@/components/ui/Active/DeliveryInfo";
import DeliveryMap from "@/components/ui/Active/DeliveryMap";
import { DeliveryDetailsFetcher, DeliveryStatusChange } from "@/Lib/fetchDataServices";
import { DeliveryQueueForDriver, DeliveryStatus } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link, useLocalSearchParams } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { Text, View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function Active() {
  const { id } = useLocalSearchParams();
  const delivery_id = id || "";
  
  const [deliveryDetails, setDeliveryDetails] =
    useState<DeliveryQueueForDriver | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(DeliveryStatus.pending);
  if (!id) {
    setError("No delivery ID provided");
  }
  
  const fetchDeliveryDetail = useCallback(
    async (showToast = true) => {
      try {
        setError(null);
        setIsLoading(true);

        // Ensure delivery_id exists and is a string
        const deliveryIdParam = Array.isArray(delivery_id)
          ? delivery_id[0]
          : delivery_id;

        if (!deliveryIdParam) {
          throw new Error("No delivery ID provided");
        }

        const mockDriverId = "69ca617c-9259-492f-a73a-e9e351204678";
        const mockDate = "2025-05-27";

        const deliveryData = await DeliveryDetailsFetcher(
          mockDriverId,
          deliveryIdParam,
          mockDate
        );
        const delivery = Array.isArray(deliveryData)
          ? deliveryData[0]
          : deliveryData;

        setDeliveryDetails(delivery || null);
        setDeliveryStatus(delivery ? delivery.status : DeliveryStatus.pending);

        if (showToast) {
          Toast.show({
            type: delivery ? "success" : "info",
            text1: delivery ? "Success" : "Info",
            text2: delivery
              ? "Loaded delivery successfully"
              : "No delivery found",
            position: "top",
          });
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch delivery details";
        setError(message);

        if (showToast) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: `Error loading delivery: ${message}`,
            position: "top",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [delivery_id]
  );

  useEffect(() => {
    fetchDeliveryDetail(false);
  }, [fetchDeliveryDetail]);
  const changeDeliveryStatus = async (status: DeliveryStatus) => {
    try {
      if (!deliveryDetails?.driver?.driver_id || !deliveryDetails?.delivery_id) {
        throw new Error("Driver ID or Delivery ID is missing");
      }
      await DeliveryStatusChange(
        deliveryDetails?.driver?.driver_id,
        deliveryDetails?.delivery_id,
        status
      );
      if (status === DeliveryStatus.completed) {
        Toast.show({
          type: "success",
          text1: "Delivery Completed",
          text2: "The delivery has been marked as complete",
          position: "top",
        });
      }else if (status === DeliveryStatus.cancelled) {
        Toast.show({
          type: "success",
          text1: "Delivery Cancelled",
          text2: "The delivery has been marked as cancelled",
          position: "top",
        });
      }
      setDeliveryStatus(status);
      fetchDeliveryDetail();

    } catch (error) {
      console.error("Error updating delivery status:", error);
      Alert.alert("Error", "Failed to update delivery status");
    }
  };
  // const handleCompleteDelivery = useCallback(() => {
  //   // TODO: Implement delivery completion logic
  //   Toast.show({
  //     type: "success",
  //     text1: "Delivery Completed",
  //     text2: "The delivery has been marked as complete",
  //     position: "top",
  //   });
  // }, []);

  // const handleCancelDelivery = useCallback(() => {
  //   // TODO: Implement delivery cancellation logic
  //   Toast.show({
  //     type: "success",
  //     text1: "Delivery Cancelled",
  //     text2: "The delivery has been marked as cancelled",
  //     position: "top",
  //   });
  // }, []);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FFD86B" />
        <Text className="text-gray-600 text-lg mt-4">
          Loading delivery details...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !deliveryDetails) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AntDesign name="exclamationcircleo" size={48} color="#EF4444" />
        <Text className="text-red-600 font-bold text-xl mt-4">Error</Text>
        <Text className="text-gray-600 text-center mt-2">{error}</Text>
        <Button
          mode="outlined"
          onPress={() => fetchDeliveryDetail()}
          className="mt-4"
        >
          Try Again
        </Button>
      </View>
    );
  }

  // No delivery found state
  if (!deliveryDetails) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AntDesign name="inbox" size={48} color="#9CA3AF" />
        <Text className="text-gray-900 font-bold text-xl mt-4">
          Delivery Not Found
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          The requested delivery could not be found.
        </Text>
        <Link href="/(tabs)/active" asChild>
          <Button mode="outlined" className="mt-4">
            Back to Active Deliveries
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <View className="flex-row items-center p-4  rounded-lg  mt-2 ">
        <Link href={"/(tabs)/active"}>
          <View className="rounded-lg p-2 mr-3">
            <AntDesign name="back" size={32} color="#111827" />
          </View>
        </Link>
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-xl">
            Active Delivery
          </Text>
          <Text className="text-sm text-black">
            ID: {deliveryDetails.delivery_id}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="gap-2 p-2">
        <DeliveryMap
          delivery={deliveryDetails}
          setDeliveryStatus={setDeliveryStatus}
          deliveryStatus={deliveryStatus}
        />
        <DeliveryInfo delivery={deliveryDetails} />
        <CustomerInfo customer={deliveryDetails.customer} />

        {/* Complete Delivery Button */}
        {deliveryStatus === DeliveryStatus.pending ||
        deliveryStatus === DeliveryStatus.in_progress ? (
          // Active delivery - show action buttons
          <View className="mx-2 mt-4 mb-6 gap-2">
            <Button
              mode="elevated"
              onPress={() => changeDeliveryStatus(DeliveryStatus.completed)}
              buttonColor="#10B981"
              contentStyle={{ paddingVertical: 8 }}
              className="rounded-lg"
            >
              <View className="flex-row items-center justify-center">
                <AntDesign name="checkcircleo" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Complete Delivery
                </Text>
              </View>
            </Button>

            <Button
              mode="outlined"
              onPress={() => changeDeliveryStatus(DeliveryStatus.cancelled)}
              buttonColor="transparent"
              textColor="#DC2626"
              contentStyle={{ paddingVertical: 8 }}
              className="rounded-lg border-red-600"
            >
              <View className="flex-row items-center justify-center">
                <AntDesign name="closecircleo" size={20} color="#DC2626" />
                <Text className="text-red-600 font-semibold text-base ml-2">
                  Cancel Delivery
                </Text>
              </View>
            </Button>
          </View>
        ) : deliveryStatus === DeliveryStatus.completed ? (
          // Completed delivery - show status
          <View className="mx-2 mt-4 mb-6">
            <Button
              mode="elevated"
              disabled={true}
              buttonColor="#10B981"
              contentStyle={{ paddingVertical: 8 }}
              className="rounded-lg"
            >
              <View className="flex-row items-center justify-center">
                <AntDesign name="checkcircle" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Delivery Completed
                </Text>
              </View>
            </Button>
          </View>
        ) : deliveryStatus === DeliveryStatus.cancelled ? (
          // Cancelled delivery - show status
          <View className="mx-2 mt-4 mb-6">
            <Button
              mode="elevated"
              disabled={true}
              buttonColor="#DC2626"
              contentStyle={{ paddingVertical: 8 }}
              className="rounded-lg"
            >
              <View className="flex-row items-center justify-center">
                <AntDesign name="closecircle" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Delivery Cancelled
                </Text>
              </View>
            </Button>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
