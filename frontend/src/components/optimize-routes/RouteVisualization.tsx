"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Clock,
  User,
  Phone,
  Route,
  RefreshCw,
  CenterFocus,
  List,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getRouteByDriverIdAndDate } from "@/lib/clientSideDataServices";

// Types
interface RouteWaypoint {
  lat: number;
  lng: number;
  address: string;
  delivery_id?: string;
}

interface RouteDelivery {
  delivery_id: string;
  sequence: number;
  estimated_arrival: string;
  travel_time_from_previous: number;
}

interface Customers {
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface DeliveryInfo {
  delivery_id: string;
  dropoff_location: string;
  priority: number;
  customer: Customers;
}

interface Assignments {
  delivery: DeliveryInfo;
  sequence_number: number;
  estimated_arrival: string;
}

interface RouteGeometry {
  waypoints: RouteWaypoint[];
  encoded_polyline?: string;
  total_distance: number;
  total_duration: number;
}

interface RouteDetails {
  driver_id: string;
  driver_name: string;
  deliveries: RouteDelivery[];
  route_geometry: RouteGeometry;
  total_deliveries: number;
  start_time: string;
  estimated_end_time: string;
}

interface RouteData {
  route_id: string;
  driver_id: string;
  route_details: RouteDetails;
  Assignment: Assignments[];
}

interface RouteVisualizationProps {
  driverId: string;
  date: string;
  onRouteSelect?: (routeId: string) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  driverId,
  date,
  onRouteSelect,
}) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const deliveryStopsRef = useRef<HTMLDivElement>(null);

  // Load Google Maps API
  useEffect(() => {
    console.log("Google Maps useEffect triggered");

    if (typeof window === "undefined") return;

    if (!window.google) {
      const script = document.createElement("script");
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setMapError("Google Maps API key is not configured");
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps loaded");
        setMapLoaded(true);
        initializeMap();
      };
      script.onerror = (error) => {
        console.error("Failed to load Google Maps:", error);
        setMapError("Failed to load Google Maps. Please check your API key.");
      };
      document.head.appendChild(script);
    } else {
      console.log("Google Maps already loaded");
      setMapLoaded(true);
      initializeMap();
    }
  }, []);

  // Fetch routes when component mounts or dependencies change
  useEffect(() => {
    if (driverId && date) {
      fetchRoutes();
    }
  }, [driverId, date]);

  // Update map when selected route changes
  useEffect(() => {
    if (selectedRoute && mapLoaded && mapInstanceRef.current) {
      renderRoute(selectedRoute);
    }
  }, [selectedRoute, mapLoaded]);

  const initializeMap = () => {
    if (mapRef.current && window.google && !mapInstanceRef.current) {
      try {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: 13.3479, lng: 74.7824 }, // Default to Manipal coordinates
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        directionsServiceRef.current =
          new window.google.maps.DirectionsService();
        directionsRendererRef.current =
          new window.google.maps.DirectionsRenderer({
            suppressMarkers: true, // We'll add custom markers
            polylineOptions: {
              strokeColor: "#4285f4",
              strokeWeight: 4,
              strokeOpacity: 0.8,
            },
          });

        directionsRendererRef.current.setMap(mapInstanceRef.current);
        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize map");
      }
    }
  };

  const fetchRoutes = async () => {
    if (isFetching) {
      console.log("Already fetching, skipping...");
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    setError(null);

    try {
      const response = await getRouteByDriverIdAndDate(driverId, date);
      console.log("Fetched routes response:", response);

      if (!response) {
        setRoutes([]);
        setSelectedRoute(null);
        return;
      }

      // Handle the response structure correctly
      let routesData: RouteData[] = [];

      if (Array.isArray(response)) {
        routesData = response;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          routesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          routesData = response.data.data;
        }
      }

      console.log("Processed routes data:", routesData);
      setRoutes(routesData);

      if (routesData.length > 0) {
        setSelectedRoute(routesData[0]);
        onRouteSelect?.(routesData[0].route_id);
      } else {
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      setError("Failed to fetch routes. Please try again.");
      setRoutes([]);
      setSelectedRoute(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const renderRoute = (route: RouteData) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) {
      console.warn("Directions service not initialized");
      // Fallback: just add markers
      addDeliveryMarkers(route);
      return;
    }

    // Clear existing markers
    clearMarkers();

    // Use Assignment data for markers since it has customer coordinates
    if (route.Assignment.length === 0) {
      console.warn("No assignments found for route");
      return;
    }

    // Sort assignments by sequence number
    const sortedAssignments = route.Assignment.sort(
      (a, b) => a.sequence_number - b.sequence_number
    );

    // Create waypoints for directions API from customer coordinates
    const origin = {
      lat: sortedAssignments[0].delivery.customer.latitude,
      lng: sortedAssignments[0].delivery.customer.longitude,
    };

    const destination = {
      lat: sortedAssignments[sortedAssignments.length - 1].delivery.customer
        .latitude,
      lng: sortedAssignments[sortedAssignments.length - 1].delivery.customer
        .longitude,
    };

    const waypoints = sortedAssignments.slice(1, -1).map((assignment) => ({
      location: new window.google.maps.LatLng(
        assignment.delivery.customer.latitude,
        assignment.delivery.customer.longitude
      ),
      stopover: true,
    }));

    const request = {
      origin: new window.google.maps.LatLng(origin.lat, origin.lng),
      destination: new window.google.maps.LatLng(
        destination.lat,
        destination.lng
      ),
      waypoints: waypoints,
      optimizeWaypoints: false, // We already have optimized order
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
    };

    directionsServiceRef.current.route(request, (result: any, status: any) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);
        addDeliveryMarkers(route);

        // Fit map to show all points
        const bounds = new window.google.maps.LatLngBounds();
        sortedAssignments.forEach((assignment) => {
          bounds.extend(
            new window.google.maps.LatLng(
              assignment.delivery.customer.latitude,
              assignment.delivery.customer.longitude
            )
          );
        });
        mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
      } else {
        console.error("Directions request failed:", status);
        // Fallback: show markers without route
        addDeliveryMarkers(route);
      }
    });
  };

  const addDeliveryMarkers = (route: RouteData) => {
    // Clear existing markers first
    clearMarkers();

    const sortedAssignments = route.Assignment.sort(
      (a, b) => a.sequence_number - b.sequence_number
    );

    sortedAssignments.forEach((assignment) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: assignment.delivery.customer.latitude,
          lng: assignment.delivery.customer.longitude,
        },
        map: mapInstanceRef.current,
        title: `${assignment.sequence_number}. ${assignment.delivery.customer.name}`,
        label: {
          text: assignment.sequence_number.toString(),
          color: "white",
          fontWeight: "bold",
          fontSize: "12px",
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: getPriorityColor(assignment.delivery.priority),
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // Add to markers array for cleanup
      markersRef.current.push(marker);

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
              Stop ${assignment.sequence_number}: ${
          assignment.delivery.customer.name
        }
            </h3>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Address:</strong> ${assignment.delivery.dropoff_location}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Phone:</strong> ${assignment.delivery.customer.phone}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>ETA:</strong> ${formatTime(assignment.estimated_arrival)}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Priority:</strong> ${getPriorityText(
                assignment.delivery.priority
              )}
            </p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });
    });
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1:
        return "#ef4444"; // red for high priority
      case 2:
        return "#f59e0b"; // amber for medium priority
      case 3:
        return "#10b981"; // green for low priority
      default:
        return "#6b7280"; // gray for default
    }
  };

  const getPriorityText = (priority: number): string => {
    switch (priority) {
      case 1:
        return "High";
      case 2:
        return "Medium";
      case 3:
        return "Low";
      default:
        return "Normal";
    }
  };

  const getPriorityVariant = (priority: number) => {
    switch (priority) {
      case 1:
        return "destructive";
      case 2:
        return "default";
      case 3:
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDuration = (duration: number): string => {
    // Handle both seconds and minutes
    const totalMinutes = duration > 1000 ? Math.floor(duration / 60) : duration;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = Math.round(diffInMinutes % 60);

    return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const scrollToDeliveryStops = () => {
    if (deliveryStopsRef.current) {
      deliveryStopsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const centerMapOnRoute = () => {
    if (selectedRoute && mapInstanceRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      selectedRoute.Assignment.forEach((assignment) => {
        bounds.extend(
          new window.google.maps.LatLng(
            assignment.delivery.customer.latitude,
            assignment.delivery.customer.longitude
          )
        );
      });
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading routes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mx-4">
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRoutes}
            className="ml-4"
            disabled={isFetching}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Route Visualization
        </h1>
        <Button
          onClick={fetchRoutes}
          disabled={isFetching}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Route Selection */}
      {routes.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Available Routes ({routes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {routes.map((route, index) => (
                <Button
                  key={route.route_id}
                  variant={
                    selectedRoute?.route_id === route.route_id
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setSelectedRoute(route);
                    onRouteSelect?.(route.route_id);
                  }}
                  className="text-sm"
                >
                  Route {index + 1} ({route.route_details.total_deliveries}{" "}
                  stops)
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Details */}
      {selectedRoute && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Route Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Route Overview
                <div className="flex items-center ml-auto space-x-2">
                  <Button
                    onClick={scrollToDeliveryStops}
                    size="sm"
                    variant="outline"
                  >
                    <List className="w-4 h-4 mr-1" />
                    Stops
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Driver:</span>
                  <span className="font-medium">
                    {selectedRoute.route_details.driver_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deliveries:</span>
                  <span className="font-medium">
                    {selectedRoute.route_details.total_deliveries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Distance:</span>
                  <span className="font-medium text-blue-600">
                    {formatDistance(
                      selectedRoute.route_details.route_geometry.total_distance
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium text-green-600">
                    {calculateDuration(
                      selectedRoute.route_details.start_time,
                      selectedRoute.route_details.estimated_end_time
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Time:</span>
                  <span className="font-medium">
                    {formatTime(selectedRoute.route_details.start_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Est. End:</span>
                  <span className="font-medium">
                    {formatTime(selectedRoute.route_details.estimated_end_time)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Route Map
                </span>
                <div className="flex space-x-2">
                  <Button
                    onClick={centerMapOnRoute}
                    size="sm"
                    variant="outline"
                  >
                    <CenterFocus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={scrollToDeliveryStops}
                    size="sm"
                    variant="outline"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mapError ? (
                <Alert>
                  <AlertDescription>{mapError}</AlertDescription>
                </Alert>
              ) : (
                <div
                  ref={mapRef}
                  className="w-full h-[500px] rounded-lg border bg-gray-100"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delivery Stops List */}
      {selectedRoute && (
        <Card ref={deliveryStopsRef}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Delivery Stops ({selectedRoute.Assignment.length})
              </span>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                size="sm"
                variant="outline"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedRoute.Assignment.sort(
                (a, b) => a.sequence_number - b.sequence_number
              ).map((assignment) => (
                <div
                  key={assignment.delivery.delivery_id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      style={{
                        backgroundColor: getPriorityColor(
                          assignment.delivery.priority
                        ),
                      }}
                    >
                      {assignment.sequence_number}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {assignment.delivery.customer.name}
                        </span>
                      </div>
                      <Badge
                        variant={
                          getPriorityVariant(
                            assignment.delivery.priority
                          ) as any
                        }
                      >
                        {getPriorityText(assignment.delivery.priority)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{assignment.delivery.dropoff_location}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{assignment.delivery.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          ETA: {formatTime(assignment.estimated_arrival)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Routes Found */}
      {routes.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No routes found
            </h3>
            <p className="text-gray-600 mb-4">
              No routes found for this driver on {date}
            </p>
            <Button onClick={fetchRoutes} disabled={isFetching}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
