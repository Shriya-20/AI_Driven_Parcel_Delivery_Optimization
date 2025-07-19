// "use client";
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import { Route } from "lucide-react";
// import { getAllDrivers, RouteResponse } from "@/lib/types";
// import { getDriversData, getPolylineFromGoogleMaps, getRouteByDriverIdAndDate } from "@/lib/clientSideDataServices";
// import {
//   APIProvider,
//   Map,
//   AdvancedMarker,
//   InfoWindow,
//   Pin,
// } from "@vis.gl/react-google-maps";
// import { Calendar } from "../ui/calendar";
// import { Polyline } from "./polyline";

// interface MarkerInfo {
//   customer: {
//     createdAt: Date;
//     updatedAt: Date;
//     customer_id: string;
//     latitude: number;
//     longitude: number;
//     first_name: string;
//     last_name: string | null;
//     email: string;
//     phone_number: string;
//     address: string | null;
//   };
//   drop_location: string;
//   delivery_id: string;
//   time_slot: string;
//   sequence: number;
// }
// const polygonecolors = [
//   "#FF0000",
//   "#00FF00",
//   "#0000FF",
//   "#FFFF00",
//   "#FF00FF",
//   "#00FFFF",
//   "#800080",
//   "#008080",
//   "#808000",
// ]
// export function OptimizeRoutes() {
//   const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
//   const [optimized, setOptimized] = useState(true); // default is Optimized
//   const [routes, setRoutes] = useState<RouteResponse[]>([]);
//   const [drivers,setDrivers] = useState<getAllDrivers[]>([]);
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);
//   const [polylines,getPolylines] = useState<string[]>([]);

//   const handleSelectDriver = (driverId: string) => {
//     setSelectedDriver(driverId);
//     setRoutes(routes.filter((route) => route.driver_id === driverId));
//     setOptimized(true); // reset to optimized view
//   };

//   const handleOptimizeRoute = () => {
//     if (!selectedDriver) return;

//     toast.success(
//       `Route re-optimized for ${
//         drivers.find((d) => d.driver_id === selectedDriver)?.first_name + " " + drivers.find((d) => d.driver_id === selectedDriver)?.last_name
//       }`
//     );

//     // Shuffle to simulate re-optimization
//     setRoutes([...routes].sort(() => Math.random() - 0.5));
//     setOptimized(true);
//   };
//   const handleGetRoute = async () => {
//     const routeData = await getRouteByDriverIdAndDate(selectedDriver!, date!.toISOString().split("T")[0]);
//     if (!routeData || routeData.length === 0) {
//       toast.error("No deliveries assigned to this driver for the selected date. hence, no route available.");
//       setRoutes([]);
//       return;
//     }
//     setRoutes(routeData);
//     const getPolyLinesFromGoogle = await getPolylineFromGoogleMaps(routeData, selectedDriver!, drivers);
//     if (getPolyLinesFromGoogle) {
//       getPolylines(getPolyLinesFromGoogle);
//     } else {
//       toast.error("Failed to fetch route polyline from Google Maps.");
//     }
//   }

//   useEffect(() => {
//     const fetchDrivers = async () => {
//       const data = await getDriversData();
//       setDrivers(data);
//     };
//     fetchDrivers();
//   }, []);

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex flex-col gap-2">
//           <h1 className="text-2xl font-bold tracking-tight">Optimize Routes</h1>
//           <p className="text-sm text-foreground">
//             View the <span className="font-bold">Optimized Routes</span> for
//             your drivers (Assign the drivers first).
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-1">
//           <Card className="h-full">
//             <CardHeader>
//               <CardTitle className="text-lg font-medium">
//                 Route Settings
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Select Driver</label>
//                   <Select
//                     onValueChange={handleSelectDriver}
//                     value={selectedDriver || undefined}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a driver" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {drivers.map((driver) => (
//                         <SelectItem
//                           key={driver.driver_id}
//                           value={driver.driver_id}
//                         >
//                           {driver.first_name + " " + driver.last_name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <Calendar
//                   mode="single"
//                   selected={date}
//                   onSelect={setDate}
//                   className="rounded-md border shadow-sm"
//                 />
//                 <Button
//                   className="w-full gap-2"
//                   onClick={handleGetRoute}
//                   disabled={!selectedDriver || routes.length === 0}
//                 >
//                   <Route className="h-4 w-4" />
//                   Get Route
//                 </Button>
//                 <Button
//                   className="w-full gap-2"
//                   onClick={handleOptimizeRoute}
//                   disabled={!selectedDriver || routes.length === 0}
//                 >
//                   <Route className="h-4 w-4" />
//                   Re-optimize Route
//                 </Button>

//                 {selectedDriver && routes.length > 0 && (
//                   <div className="border rounded-md p-4 bg-muted/30">
//                     <h3 className="font-medium mb-2">Route Summary</h3>
//                     <div className="text-sm text-muted-foreground">
//                       <p>
//                         Driver:{" "}
//                         {drivers.find((d) => d.driver_id === selectedDriver)
//                           ?.first_name +
//                           " " +
//                           drivers.find((d) => d.driver_id === selectedDriver)
//                             ?.last_name}
//                       </p>
//                       <p>Deliveries: {routes.length}</p>
//                       <p>Status: {optimized ? "Optimized" : "Not optimized"}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="lg:col-span-2">
//           <div className="grid grid-rows-2 gap-6 h-full">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg font-medium">Route Map</CardTitle>
//               </CardHeader>
//               <CardContent className="p-0 h-[300px]">
//                 <div className="h-full w-full bg-[#f2f5f7] relative">
//                   {!selectedDriver ? (
//                     <div className="flex items-center justify-center h-full text-muted-foreground">
//                       Select a driver and date to view their route
//                     </div>
//                   ) : routes.length === 0 ? (
//                     <div className="flex items-center justify-center h-full text-muted-foreground">
//                       No deliveries assigned to this driver for the selected date.
//                     </div>
//                   ) : (
//                     <APIProvider
//                       apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
//                     >
//                       <Map
//                         defaultCenter={{
//                           lat: drivers.find(
//                             (d) => d.driver_id === selectedDriver
//                           )?.driver_location[0].latitude || 13.082680,
//                           lng: drivers.find(
//                             (d) => d.driver_id === selectedDriver
//                           )?.driver_location[0].longitude || 74.742142,
//                         }}
//                         defaultZoom={12}
//                         gestureHandling="greedy"
//                         disableDefaultUI={false}
//                         mapId={
//                           process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID as string
//                         }
//                       >
//                         {routes.map((stop) => (
//                           <AdvancedMarker
//                             key={stop.delivery_id}
//                             position={{
//                               lat: stop.latitude,
//                               lng: stop.longitude,
//                             }}
//                             onClick={() => {
//                               setSelectedMarker({
//                                 customer: stop.customer,
//                                 drop_location: stop.drop_location,
//                                 delivery_id: stop.delivery_id,
//                                 time_slot: stop.time_slot,
//                                 sequence: stop.sequence,
//                               });
//                             }}
//                           >
//                             <Pin />
//                           </AdvancedMarker>
//                         ))}
//                         {selectedMarker && (
//                           <InfoWindow
//                             position={{
//                               lat: selectedMarker.customer.latitude,
//                               lng: selectedMarker.customer.longitude,
//                             }}
//                             onCloseClick={() => setSelectedMarker(null)}
//                           >
//                             <div className="bg-white rounded shadow-md">
//                               <h5>Customer Name:</h5>
//                               <p className="text-md font-semibold">
//                                 {selectedMarker.customer.first_name} {selectedMarker.customer.last_name}
//                               </p>
//                               <p>Sequence: {selectedMarker.sequence}</p>
//                               <p>Drop Location: {selectedMarker.drop_location}</p>
//                               <p>Time Slot: {selectedMarker.time_slot}</p>
//                             </div>
//                           </InfoWindow>
//                         )}
//                         {polylines.map((encodedPath, index) => (
//                           <Polyline
//                             key={index}
//                             encodedPath={encodedPath}
//                             onClick={() => console.log("Polyline clicked")}
//                             onMouseOver={() => console.log("Mouse over polyline")}
//                             onMouseOut={() => console.log("Mouse out of polyline")}
//                             strokeColor={polygonecolors[Math.floor(Math.random() * polygonecolors.length)]}
//                             strokeOpacity={0.8}
//                             strokeWeight={2}
//                           />
//                         ))}
//                       </Map>
//                     </APIProvider>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg font-medium">
//                   Delivery Schedule
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <div className="max-h-[300px] overflow-auto">
//                   {routes.length === 0 ? (
//                     <div className="flex items-center justify-center h-[100px] text-muted-foreground">
//                       No deliveries to display
//                     </div>
//                   ) : (
//                     <table className="w-full">
//                       <thead className="bg-muted/50 sticky top-0">
//                         <tr>
//                           <th className="text-left p-3 text-sm">Stop</th>
//                           <th className="text-left p-3 text-sm">
//                             Delivery Address
//                           </th>
//                           <th className="text-left p-3 text-sm">Time Slot</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {routes.map((stop, index) => (
//                           <tr
//                             key={stop.delivery_id}
//                             className="border-b last:border-b-0"
//                           >
//                             <td className="p-3">
//                               <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
//                                 {index + 1}
//                               </div>
//                             </td>
//                             <td className="p-3">{stop.drop_location}</td>
//                             <td className="p-3">{stop.time_slot}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import { Route, Loader2 } from "lucide-react";
// import { getAllDrivers, RouteResponse } from "@/lib/types";
// import {
//   getDriversData,
//   getPolylineFromGoogleMaps,
//   getRouteByDriverIdAndDate,
// } from "@/lib/clientSideDataServices";
// import {
//   APIProvider,
//   Map,
//   AdvancedMarker,
//   InfoWindow,
//   Pin,
// } from "@vis.gl/react-google-maps";
// import { Calendar } from "../ui/calendar";
// import { Polyline } from "./polyline";

// interface MarkerInfo {
//   customer: {
//     createdAt: Date;
//     updatedAt: Date;
//     customer_id: string;
//     latitude: number;
//     longitude: number;
//     first_name: string;
//     last_name: string | null;
//     email: string;
//     phone_number: string;
//     address: string | null;
//   };
//   drop_location: string;
//   delivery_id: string;
//   time_slot: string;
//   sequence: number;
// }

// // Predefined colors for polylines - better color choices for visibility
// const polylineColors = [
//   "#FF4444", // Red
//   "#4CAF50", // Green
//   "#2196F3", // Blue
//   "#FF9800", // Orange
//   "#9C27B0", // Purple
//   "#00BCD4", // Cyan
//   "#795548", // Brown
//   "#607D8B", // Blue Grey
//   "#E91E63", // Pink
// ];

// export function OptimizeRoutes() {
//   const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
//   const [optimized, setOptimized] = useState(true);
//   const [routes, setRoutes] = useState<RouteResponse[]>([]);
//   const [drivers, setDrivers] = useState<getAllDrivers[]>([]);
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);
//   const [polylines, setPolylines] = useState<string[]>([]);
//   const [isLoadingRoute, setIsLoadingRoute] = useState(false);
//   const [isOptimizing, setIsOptimizing] = useState(false);

//   // Memoized function to get driver name
//   const getDriverName = useCallback(
//     (driverId: string) => {
//       const driver = drivers.find((d) => d.driver_id === driverId);
//       return driver
//         ? `${driver.first_name} ${driver.last_name}`
//         : "Unknown Driver";
//     },
//     [drivers]
//   );

//   const handleSelectDriver = (driverId: string) => {
//     setSelectedDriver(driverId);
//     // Clear previous routes and polylines when changing driver
//     setRoutes([]);
//     setPolylines([]);
//     setSelectedMarker(null);
//     setOptimized(false);
//   };

//   const handleOptimizeRoute = async () => {
//     if (!selectedDriver || routes.length === 0) return;

//     setIsOptimizing(true);
//     try {
//       // Simulate optimization process - in real app, this would call your optimization API
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Simple shuffle simulation - replace with actual optimization logic
//       const optimizedRoutes = [...routes]
//         .sort(() => Math.random() - 0.5)
//         .map((route, index) => ({ ...route, sequence: index + 1 }));

//       setRoutes(optimizedRoutes);
//       setOptimized(true);

//       // Fetch new polylines for optimized route
//       const newPolylines = await getPolylineFromGoogleMaps(
//         optimizedRoutes,
//         selectedDriver,
//         drivers
//       );
//       if (newPolylines && newPolylines.length > 0) {
//         setPolylines(newPolylines);
//       }

//       toast.success(`Route re-optimized for ${getDriverName(selectedDriver)}`);
//     } catch (error) {
//       toast.error("Failed to optimize route");
//       console.error("Optimization error:", error);
//     } finally {
//       setIsOptimizing(false);
//     }
//   };

//   const handleGetRoute = async () => {
//     if (!selectedDriver || !date) {
//       toast.error("Please select a driver and date");
//       return;
//     }

//     setIsLoadingRoute(true);
//     try {
//       const routeData = await getRouteByDriverIdAndDate(
//         selectedDriver,
//         date.toISOString().split("T")[0]
//       );

//       if (!routeData || routeData.length === 0) {
//         toast.error(
//           "No deliveries assigned to this driver for the selected date."
//         );
//         setRoutes([]);
//         setPolylines([]);
//         return;
//       }

//       // Sort routes by sequence
//       const sortedRoutes = routeData.length > 1 ? routeData.sort((a, b) => a.sequence - b.sequence) : routeData;
//       setRoutes(sortedRoutes);
//       setOptimized(false);

//       // Fetch polylines
//       const fetchedPolylines = await getPolylineFromGoogleMaps(
//         sortedRoutes,
//         selectedDriver,
//         drivers
//       );
//       if (fetchedPolylines && fetchedPolylines.length > 0) {
//         setPolylines(fetchedPolylines);
//         toast.success("Route loaded successfully");
//       } else {
//         toast.warning("Route loaded but polylines could not be fetched");
//       }
//     } catch (error) {
//       toast.error("Failed to fetch route data");
//       console.error("Route fetch error:", error);
//     } finally {
//       setIsLoadingRoute(false);
//     }
//   };

//   // Calculate map center based on routes or driver location
//   const getMapCenter = useCallback(() => {
//     if (routes.length > 0) {
//       const avgLat =
//         routes.reduce((sum, route) => sum + route.latitude, 0) / routes.length;
//       const avgLng =
//         routes.reduce((sum, route) => sum + route.longitude, 0) / routes.length;
//       return { lat: avgLat, lng: avgLng };
//     }

//     if (selectedDriver) {
//       const driver = drivers.find((d) => d.driver_id === selectedDriver);
//       return {
//         lat: driver?.driver_location[0]?.latitude || 13.08268,
//         lng: driver?.driver_location[0]?.longitude || 74.742142,
//       };
//     }

//     return { lat: 13.08268, lng: 74.742142 };
//   }, [routes, selectedDriver, drivers]);

//   useEffect(() => {
//     const fetchDrivers = async () => {
//       try {
//         const data = await getDriversData();
//         setDrivers(data);
//       } catch (error) {
//         toast.error("Failed to fetch drivers data");
//         console.error("Drivers fetch error:", error);
//       }
//     };
//     fetchDrivers();
//   }, []);

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex flex-col gap-2">
//           <h1 className="text-2xl font-bold tracking-tight">Optimize Routes</h1>
//           <p className="text-sm text-foreground">
//             View the <span className="font-bold">Optimized Routes</span> for
//             your drivers (Assign the drivers first).
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-1">
//           <Card className="h-full">
//             <CardHeader>
//               <CardTitle className="text-lg font-medium">
//                 Route Settings
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Select Driver</label>
//                   <Select
//                     onValueChange={handleSelectDriver}
//                     value={selectedDriver || undefined}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a driver" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {drivers.map((driver) => (
//                         <SelectItem
//                           key={driver.driver_id}
//                           value={driver.driver_id}
//                         >
//                           {getDriverName(driver.driver_id)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Select Date</label>
//                   <Calendar
//                     mode="single"
//                     selected={date}
//                     onSelect={setDate}
//                     className="rounded-md border shadow-sm"
//                   />
//                 </div>

//                 <Button
//                   className="w-full gap-2"
//                   onClick={handleGetRoute}
//                   disabled={!selectedDriver || !date || isLoadingRoute}
//                 >
//                   {isLoadingRoute ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Route className="h-4 w-4" />
//                   )}
//                   {isLoadingRoute ? "Loading..." : "Get Route"}
//                 </Button>

//                 <Button
//                   className="w-full gap-2"
//                   onClick={handleOptimizeRoute}
//                   disabled={
//                     !selectedDriver || routes.length === 0 || isOptimizing
//                   }
//                   variant="outline"
//                 >
//                   {isOptimizing ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Route className="h-4 w-4" />
//                   )}
//                   {isOptimizing ? "Optimizing..." : "Re-optimize Route"}
//                 </Button>

//                 {selectedDriver && routes.length > 0 && (
//                   <div className="border rounded-md p-4 bg-muted/30">
//                     <h3 className="font-medium mb-2">Route Summary</h3>
//                     <div className="text-sm text-muted-foreground space-y-1">
//                       <p>Driver: {getDriverName(selectedDriver)}</p>
//                       <p>Deliveries: {routes.length}</p>
//                       <p>Status: {optimized ? "Optimized" : "Not optimized"}</p>
//                       <p>Date: {date?.toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="lg:col-span-2">
//           <div className="grid grid-rows-2 gap-6 h-full">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg font-medium">Route Map</CardTitle>
//               </CardHeader>
//               <CardContent className="p-0 h-[400px]">
//                 <div className="h-full w-full bg-[#f2f5f7] relative">
//                   {!selectedDriver ? (
//                     <div className="flex items-center justify-center h-full text-muted-foreground">
//                       Select a driver and date to view their route
//                     </div>
//                   ) : routes.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//                       <p>
//                         No deliveries assigned to this driver for the selected
//                         date.
//                       </p>
//                       <p className="text-sm mt-2">
//                         Click &quot;Get Route&quot; to fetch route data.
//                       </p>
//                     </div>
//                   ) : (
//                     <APIProvider
//                       apiKey={
//                         process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
//                       }
//                     >
//                       <Map
//                         center={getMapCenter()}
//                         defaultZoom={12}
//                         gestureHandling="greedy"
//                         disableDefaultUI={false}
//                         mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID as string}
//                       >
//                         {/* Driver starting location marker */}
//                         {selectedDriver &&
//                           drivers.find((d) => d.driver_id === selectedDriver)
//                             ?.driver_location?.[0] && (
//                             <AdvancedMarker
//                               position={{
//                                 lat: drivers.find(
//                                   (d) => d.driver_id === selectedDriver
//                                 )!.driver_location[0].latitude,
//                                 lng: drivers.find(
//                                   (d) => d.driver_id === selectedDriver
//                                 )!.driver_location[0].longitude,
//                               }}
//                             >
//                               <Pin
//                                 background="#00ff00"
//                                 borderColor="#ffffff"
//                                 glyphColor="#000000"
//                               >
//                                 START
//                               </Pin>
//                             </AdvancedMarker>
//                           )}

//                         {/* Delivery location markers */}
//                         {routes.map((stop) => (
//                           <AdvancedMarker
//                             key={stop.delivery_id}
//                             position={{
//                               lat: stop.latitude,
//                               lng: stop.longitude,
//                             }}
//                             onClick={() => {
//                               setSelectedMarker({
//                                 customer: stop.customer,
//                                 drop_location: stop.drop_location,
//                                 delivery_id: stop.delivery_id,
//                                 time_slot: stop.time_slot,
//                                 sequence: stop.sequence,
//                               });
//                             }}
//                           >
//                             <Pin
//                               background="#ff0000"
//                               borderColor="#ffffff"
//                               glyphColor="#ffffff"
//                             >
//                               {stop.sequence}
//                             </Pin>
//                           </AdvancedMarker>
//                         ))}

//                         {/* Info window for selected marker */}
//                         {selectedMarker && (
//                           <InfoWindow
//                             position={{
//                               lat: selectedMarker.customer.latitude,
//                               lng: selectedMarker.customer.longitude,
//                             }}
//                             onCloseClick={() => setSelectedMarker(null)}
//                           >
//                             <div className="bg-white rounded shadow-md p-2">
//                               <h5 className="font-semibold">Customer:</h5>
//                               <p className="text-md">
//                                 {selectedMarker.customer.first_name}{" "}
//                                 {selectedMarker.customer.last_name}
//                               </p>
//                               <p>
//                                 <strong>Sequence:</strong>{" "}
//                                 {selectedMarker.sequence}
//                               </p>
//                               <p>
//                                 <strong>Location:</strong>{" "}
//                                 {selectedMarker.drop_location}
//                               </p>
//                               <p>
//                                 <strong>Time:</strong>{" "}
//                                 {selectedMarker.time_slot}
//                               </p>
//                             </div>
//                           </InfoWindow>
//                         )}

//                         {/* Route polylines */}
//                         {polylines.map((encodedPath, index) => (
//                           <Polyline
//                             key={`polyline-${index}`}
//                             encodedPath={encodedPath}
//                             strokeColor={
//                               polylineColors[index % polylineColors.length]
//                             }
//                             strokeOpacity={0.8}
//                             strokeWeight={3}
//                             onClick={() =>
//                               console.log(`Polyline ${index} clicked`)
//                             }
//                           />
//                         ))}
//                       </Map>
//                     </APIProvider>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg font-medium">
//                   Delivery Schedule
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <div className="max-h-[300px] overflow-auto">
//                   {routes.length === 0 ? (
//                     <div className="flex items-center justify-center h-[100px] text-muted-foreground">
//                       No deliveries to display
//                     </div>
//                   ) : (
//                     <table className="w-full">
//                       <thead className="bg-muted/50 sticky top-0">
//                         <tr>
//                           <th className="text-left p-3 text-sm">Sequence</th>
//                           <th className="text-left p-3 text-sm">Customer</th>
//                           <th className="text-left p-3 text-sm">
//                             Delivery Address
//                           </th>
//                           <th className="text-left p-3 text-sm">Time Slot</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {routes
//                           .sort((a, b) => a.sequence - b.sequence)
//                           .map((stop) => (
//                             <tr
//                               key={stop.delivery_id}
//                               className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
//                               onClick={() => {
//                                 setSelectedMarker({
//                                   customer: stop.customer,
//                                   drop_location: stop.drop_location,
//                                   delivery_id: stop.delivery_id,
//                                   time_slot: stop.time_slot,
//                                   sequence: stop.sequence,
//                                 });
//                               }}
//                             >
//                               <td className="p-3">
//                                 <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
//                                   {stop.sequence}
//                                 </div>
//                               </td>
//                               <td className="p-3">
//                                 {stop.customer.first_name}{" "}
//                                 {stop.customer.last_name}
//                               </td>
//                               <td className="p-3">{stop.drop_location}</td>
//                               <td className="p-3">{stop.time_slot}</td>
//                             </tr>
//                           ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Route, Loader2 } from "lucide-react";
import { getAllDrivers, RouteResponse } from "@/lib/types";
import {
  getDriversData,
  getPolylineFromGoogleMaps,
  getRouteByDriverIdAndDate,
} from "@/lib/clientSideDataServices";

// Utility function to format date without timezone issues
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from "@vis.gl/react-google-maps";
import { Calendar } from "../ui/calendar";
import { Polyline } from "./polyline";

interface MarkerInfo {
  customer: {
    createdAt: Date;
    updatedAt: Date;
    customer_id: string;
    latitude: number;
    longitude: number;
    first_name: string;
    last_name: string | null;
    email: string;
    phone_number: string;
    address: string | null;
  };
  drop_location: string;
  delivery_id: string;
  time_slot: string;
  sequence: number;
}

// Predefined colors for polylines - better color choices for visibility
const polylineColors = [
  "#FF4444", // Red
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#00BCD4", // Cyan
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
];

export function OptimizeRoutes() {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [optimized, setOptimized] = useState(true);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [drivers, setDrivers] = useState<getAllDrivers[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);
  const [polylines, setPolylines] = useState<string[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  // const [isOptimizing, setIsOptimizing] = useState(false);

  // Memoized function to get driver name
  const getDriverName = useCallback(
    (driverId: string) => {
      const driver = drivers.find((d) => d.driver_id === driverId);
      return driver
        ? `${driver.first_name} ${driver.last_name}`
        : "Unknown Driver";
    },
    [drivers]
  );

  const handleSelectDriver = (driverId: string) => {
    setSelectedDriver(driverId);
    // Clear previous routes and polylines when changing driver
    setRoutes([]);
    setPolylines([]);
    setSelectedMarker(null);
    setOptimized(false);
  };

  // for now no need of reoptimizing and all so commented
  // const handleOptimizeRoute = async () => {
  //   if (!selectedDriver || routes.length === 0) return;

  //   setIsOptimizing(true);
  //   try {
  //     // Simulate optimization process - in real app, this would call your optimization API
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // Simple shuffle simulation - replace with actual optimization logic
  //     const optimizedRoutes = [...routes]
  //       .sort(() => Math.random() - 0.5)
  //       .map((route, index) => ({ ...route, sequence: index + 1 }));

  //     setRoutes(optimizedRoutes);
  //     setOptimized(true);

  //     // Fetch new polylines for optimized route
  //     const newPolylines = await getPolylineFromGoogleMaps(
  //       optimizedRoutes,
  //       selectedDriver,
  //       drivers
  //     );
  //     if (newPolylines && newPolylines.length > 0) {
  //       setPolylines(newPolylines);
  //     }

  //     toast.success(`Route re-optimized for ${getDriverName(selectedDriver)}`);
  //   } catch (error) {
  //     toast.error("Failed to optimize route");
  //     console.error("Optimization error:", error);
  //   } finally {
  //     setIsOptimizing(false);
  //   }
  // };

  const handleGetRoute = async () => {
    if (!selectedDriver || !date) {
      toast.error("Please select a driver and date");
      return;
    }

    setIsLoadingRoute(true);
    try {
      // Fix timezone issue by using local date formatting
      const formattedDate = formatDateForAPI(date);

      console.log("Selected date:", date);
      console.log("Formatted date for API:", formattedDate);
      console.log("Original toISOString:", date.toISOString().split("T")[0]);

      const routeData = await getRouteByDriverIdAndDate(
        selectedDriver,
        formattedDate
      );
      console.log("routeData:", routeData);
      if (!routeData || routeData.length === 0) {
        toast.error(
          "No deliveries assigned to this driver for the selected date."
        );
        setRoutes([]);
        setPolylines([]);
        return;
      }

      // Sort routes by sequence
      const sortedRoutes = routeData.length > 1 ? routeData.sort((a, b) => a.sequence - b.sequence) : routeData;
      setRoutes(sortedRoutes);
      setOptimized(true);

      // Fetch polylines - handle single location case
      const fetchedPolylines = await getPolylineFromGoogleMaps(
        sortedRoutes,
        selectedDriver,
        drivers
      );
      if (fetchedPolylines && fetchedPolylines.length > 0) {
        setPolylines(fetchedPolylines);
        toast.success(
          `Route loaded successfully with ${fetchedPolylines.length} route segments`
        );
      } else if (sortedRoutes.length === 1) {
        // Special case: only one delivery location
        setPolylines([]);
        toast.success("Route loaded successfully (single delivery location)");
      } else {
        toast.warning("Route loaded but polylines could not be fetched");
      }
    } catch (error) {
      toast.error("Failed to fetch route data");
      console.error("Route fetch error:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Calculate map center based on routes or driver location
  const getMapCenter = useCallback(() => {
    if (routes.length > 0) {
      const avgLat =
        routes.reduce((sum, route) => sum + route.latitude, 0) / routes.length;
      const avgLng =
        routes.reduce((sum, route) => sum + route.longitude, 0) / routes.length;
      return { lat: avgLat, lng: avgLng };
    }

    if (selectedDriver) {
      const driver = drivers.find((d) => d.driver_id === selectedDriver);
      return {
        lat: driver?.driver_location[0]?.latitude || 13.08268,
        lng: driver?.driver_location[0]?.longitude || 74.742142,
      };
    }

    return { lat: 13.08268, lng: 74.742142 };
  }, [routes, selectedDriver, drivers]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDriversData();
        setDrivers(data);
      } catch (error) {
        toast.error("Failed to fetch drivers data");
        console.error("Drivers fetch error:", error);
      }
    };
    fetchDrivers();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Routes</h1>
          <p className="text-sm text-foreground">
            View the <span className="font-bold">Optimized Routes</span> for
            your drivers (Assign the drivers first).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Route Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Driver</label>
                  <Select
                    onValueChange={handleSelectDriver}
                    value={selectedDriver || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem
                          key={driver.driver_id}
                          value={driver.driver_id}
                        >
                          {getDriverName(driver.driver_id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm"
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleGetRoute}
                  disabled={!selectedDriver || !date || isLoadingRoute}
                >
                  {isLoadingRoute ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Route className="h-4 w-4" />
                  )}
                  {isLoadingRoute ? "Loading..." : "Get Route"}
                </Button>
                
                {/* no need of optimizing and all */}
                {/* <Button
                  className="w-full gap-2"
                  onClick={handleOptimizeRoute}
                  disabled={
                    !selectedDriver || routes.length === 0 || isOptimizing
                  }
                  variant="outline"
                >
                  {isOptimizing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Route className="h-4 w-4" />
                  )}
                  {isOptimizing ? "Optimizing..." : "Re-optimize Route"}
                </Button> */}

                {selectedDriver && routes.length > 0 && (
                  <div className="border rounded-md p-4 bg-muted/30">
                    <h3 className="font-medium mb-2">Route Summary</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Driver: {getDriverName(selectedDriver)}</p>
                      <p>Deliveries: {routes.length}</p>
                      <p>Route Segments: {polylines.length}</p>
                      <p>Status: {optimized ? "Optimized" : "Not optimized"}</p>
                      <p>Date: {date?.toLocaleDateString()}</p>
                      {routes.length === 1 && (
                        <p className="text-yellow-600 text-xs">
                          Single delivery - no route optimization needed
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-rows-2 gap-6 h-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Route Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[400px] bg-red-500">
                <div className="h-[400px] w-full bg-[#f2f5f7] relative">
                  {!selectedDriver ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select a driver and date to view their route
                    </div>
                  ) : routes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <p>
                        No deliveries assigned to this driver for the selected
                        date.
                      </p>
                      <p className="text-sm mt-2">
                        Click &quot;Get Route&quot; to fetch route data.
                      </p>
                    </div>
                  ) : (
                    <APIProvider
                      apiKey={
                        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
                      }
                    >
                      <Map
                        center={getMapCenter()}
                        defaultZoom={12}
                        gestureHandling="greedy"
                        disableDefaultUI={false}
                        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID as string}
                        zoomControl={true}
                        fullscreenControl={true}
                        draggable={true}
                      >
                        {/* Driver starting location marker */}
                        {selectedDriver &&
                          drivers.find((d) => d.driver_id === selectedDriver)
                            ?.driver_location?.[0] && (
                            <AdvancedMarker
                              position={{
                                lat: drivers.find(
                                  (d) => d.driver_id === selectedDriver
                                )!.driver_location[0].latitude,
                                lng: drivers.find(
                                  (d) => d.driver_id === selectedDriver
                                )!.driver_location[0].longitude,
                              }}
                            >
                              <Pin
                                background="#00ff00"
                                borderColor="#ffffff"
                                glyphColor="#000000"
                              >
                                START
                              </Pin>
                            </AdvancedMarker>
                          )}

                        {/* Delivery location markers */}
                        {routes.map((stop) => (
                          <AdvancedMarker
                            key={stop.delivery_id}
                            position={{
                              lat: stop.latitude,
                              lng: stop.longitude,
                            }}
                            onClick={() => {
                              setSelectedMarker({
                                customer: stop.customer,
                                drop_location: stop.drop_location,
                                delivery_id: stop.delivery_id,
                                time_slot: stop.time_slot,
                                sequence: stop.sequence,
                              });
                            }}
                          >
                            <Pin
                              background="#ff0000"
                              borderColor="#ffffff"
                              glyphColor="#ffffff"
                            >
                              {stop.sequence}
                            </Pin>
                          </AdvancedMarker>
                        ))}

                        {/* Info window for selected marker */}
                        {selectedMarker && (
                          <InfoWindow
                            position={{
                              lat: selectedMarker.customer.latitude,
                              lng: selectedMarker.customer.longitude,
                            }}
                            onCloseClick={() => setSelectedMarker(null)}
                          >
                            <div className="bg-white rounded shadow-md p-2">
                              <h5 className="font-semibold">Customer:</h5>
                              <p className="text-md">
                                {selectedMarker.customer.first_name}{" "}
                                {selectedMarker.customer.last_name}
                              </p>
                              <p>
                                <strong>Sequence:</strong>{" "}
                                {selectedMarker.sequence}
                              </p>
                              <p>
                                <strong>Location:</strong>{" "}
                                {selectedMarker.drop_location}
                              </p>
                              <p>
                                <strong>Time:</strong>{" "}
                                {selectedMarker.time_slot}
                              </p>
                            </div>
                          </InfoWindow>
                        )}

                        {/* Route polylines */}
                        {polylines.map((encodedPath, index) => (
                          <Polyline
                            key={`polyline-${index}`}
                            encodedPath={encodedPath}
                            strokeColor={
                              polylineColors[index % polylineColors.length]
                            }
                            strokeOpacity={0.8}
                            strokeWeight={3}
                            onClick={() =>
                              console.log(`Polyline ${index} clicked`)
                            }
                          />
                        ))}
                      </Map>
                    </APIProvider>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Delivery Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-auto">
                  {routes.length === 0 ? (
                    <div className="flex items-center justify-center h-[100px] text-muted-foreground">
                      No deliveries to display
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-sm">Sequence</th>
                          <th className="text-left p-3 text-sm">Customer</th>
                          <th className="text-left p-3 text-sm">
                            Delivery Address
                          </th>
                          <th className="text-left p-3 text-sm">Time Slot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routes
                          .sort((a, b) => a.sequence - b.sequence)
                          .map((stop) => (
                            <tr
                              key={stop.delivery_id}
                              className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
                              onClick={() => {
                                setSelectedMarker({
                                  customer: stop.customer,
                                  drop_location: stop.drop_location,
                                  delivery_id: stop.delivery_id,
                                  time_slot: stop.time_slot,
                                  sequence: stop.sequence,
                                });
                              }}
                            >
                              <td className="p-3">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                  {stop.sequence}
                                </div>
                              </td>
                              <td className="p-3">
                                {stop.customer.first_name}{" "}
                                {stop.customer.last_name}
                              </td>
                              <td className="p-3">{stop.drop_location}</td>
                              <td className="p-3">{stop.time_slot}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}