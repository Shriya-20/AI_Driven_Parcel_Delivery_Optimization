import RouteScreen from "@/components/Screens/RouteScreen";
import RouteVisualizationScreen from "@/components/Screens/RouteVisualization";
import { View } from "react-native";

export default function Route() {
  return (
    <View className="flex-1">
      {/* <RouteScreen/> */}
      <RouteVisualizationScreen />
    </View>
  );
}
