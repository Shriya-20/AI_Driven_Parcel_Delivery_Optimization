import { Request, Response } from "express";
import { prisma } from "../db/db";
import { getTommorrowScheduledDeliveries } from "../Types/types";
import axios from "axios";
import { getDeliveriesByDateService } from "../services/deliveries.services";
interface OptimizationRequest {
  delivery_persons: Array<{
    id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
  }>;
  current_time?: string;
  deliveries: Array<{
    id: string;
    customer: string;
    location: {
      lat: number;
      lng: number;
      address?: string;
    };
    time_window: {
      start: string;
      end: string;
    };
    package_details?: {
      weight?: number;
      description?: string;
    };
  }>;
}

interface OptimizationResponse {
  status: "success" | "error";
  data?: {
    routes: Array<{
      driver_id: string;
      driver_name: string;
      deliveries: Array<{
        delivery_id: string;
        sequence: number;
        estimated_arrival: string;
        travel_time_from_previous: number;
      }>;
      route_geometry: {
        waypoints: Array<{
          lat: number;
          lng: number;
          address?: string;
        }>;
        encoded_polyline?: string;
        total_distance: number;
        total_duration: number;
      };
      total_deliveries: number;
      start_time: string;
      estimated_end_time: string;
    }>;
    summary: {
      total_drivers_used: number;
      total_deliveries_assigned: number;
      total_distance: number;
      total_duration: number;
      unassigned_deliveries: string[];
    };
  };
  error?: string;
}
export async function bulkAssignRoutes(req: Request, res: Response) {
  try {
    // Logic to bulk assign routes
    const { deliveries, date } = req.body;

    if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
      res.status(400).json({
        success: false,
        message: "Valid deliveries array is required",
        data: null,
      });
      return;
    }
    // This is mainly for the Assign deliveries section in admin where we assign drivers and store them in assignments routes
    //first get all the active drivers with their start locations
    const availableDrivers = await prisma.driver.findMany({
      where: {
        status: "ACTIVE",
        start_location_latitude: { not: null },
        start_location_longitude: { not: null },
      },
      select: {
        driver_id: true,
        first_name: true,
        start_location_latitude: true,
        start_location_longitude: true,
        phone_number: true,
      },
    });
    if (availableDrivers.length === 0) {
      // throw new Error("No active drivers available for route assignment.");
      // This will be caught in the controller and returned as a 500 error
      res.status(404).json({
        success: false,
        data: null,
        message: "No active drivers available for route assignment.",
      });
      return;
    }
    //no call the google or tolls api to get the routes and assign them
    const optimizationRequest: OptimizationRequest = {
      delivery_persons: availableDrivers.map((driver) => ({
        id: driver.driver_id,
        name: driver.first_name,
        location: {
          lat: driver.start_location_latitude!,
          lng: driver.start_location_longitude!,
        },
      })),
      // current_time: new Date().toISOString().split(".")[0],//as the current time for now doing hardcoded so else this shd be
      // current_time: new Date(date).toISOString().split(".")[0], // Use the date provided in the request(shd be this to work)
      current_time: "2025-05-26T08:00:00",//for now to work we use this
      deliveries: deliveries
        .filter(
          (delivery: getTommorrowScheduledDeliveries) =>
            delivery.Assignment.length === 0
        )
        .map((delivery: getTommorrowScheduledDeliveries) => {
          // Parse preferred time slot
          const [startTime, endTime] = delivery.preffered_time.split(" - ");
          const deliveryDate = new Date(date);

          const startDateTime = new Date(deliveryDate);
          const [startHour, startMinute] = startTime.split(":").map(Number);
          startDateTime.setHours(startHour, startMinute, 0, 0);

          const endDateTime = new Date(deliveryDate);
          const [endHour, endMinute] = endTime.split(":").map(Number);
          endDateTime.setHours(endHour, endMinute, 0, 0);

          return {
            id: delivery.delivery_id,
            customer:
              delivery.customer.first_name +
              " " +
              (delivery.customer.last_name || ""),
            location: {
              lat: delivery.customer.latitude as number,
              lng: delivery.customer.longitude as number,
              address: delivery.dropoff_location,
            },
            time_window: {
              start: startDateTime.toISOString().split(".")[0],
              end: endDateTime.toISOString().split(".")[0],
            },
            package_details: {
              weight: delivery.weight as number,
              size: delivery.size as string,
              description: `Priority ${delivery.priority} delivery`,
            },
          };
        }),
    };
    console.log("Optimization Request:", optimizationRequest.deliveries);
    console.log(
      "Available Drivers for Optimization:",
      optimizationRequest.delivery_persons
    );
    console.log(
      "Current Time for Optimization:",
      optimizationRequest.current_time
    );
    // Call the optimization service
    const optimizationResponse = await axios.post(
      `${process.env.OPTIMIZATION_SERVICE_URL}/optimize-multi-route`,
      optimizationRequest,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // 120 second timeout
      }
    );

    if (
      optimizationResponse.data.status !== "success" ||
      !optimizationResponse.data.data
    ) {
      throw new Error(optimizationResponse.data.error || "Optimization failed");
    }
    // const transformed = optimizationResponse.data.data.routes.map((route:any) => {
    //   const deliveries = route.stops.map((stop:any, index:any) => ({
    //     delivery_id: stop.id,
    //     sequence: index + 1,
    //     estimated_arrival: stop.estimated_arrival || new Date().toISOString(),
    //     travel_time_from_previous: stop.travel_time_from_previous || 0,
    //   }));

    //   const waypoints = route.waypoints.map((wp:any) => ({
    //     lat: wp.lat,
    //     lng: wp.lng,
    //     address: wp.address || undefined,
    //   }));

    //   return {
    //     driver_id: route.delivery_person.id,
    //     driver_name: route.delivery_person.name,
    //     deliveries,
    //     route_geometry: {
    //       waypoints,
    //       encoded_polyline: route.encoded_polyline || undefined,
    //       total_distance: route.total_distance_meters,
    //       total_duration: route.total_time_minutes,
    //     },
    //     total_deliveries: deliveries.length,
    //     start_time:
    //       deliveries[0]?.estimated_arrival || new Date().toISOString(),
    //     estimated_end_time:
    //       deliveries[deliveries.length - 1]?.estimated_arrival ||
    //       new Date().toISOString(),
    //   };
    // });
    
    const transformed = optimizationResponse.data.data.routes.map((route:any) => {
      const deliveries = route.stops.map((stop:any, index:any) => ({
        delivery_id: stop.delivery.id,
        sequence: index + 1,
        estimated_arrival: stop.arrival_time || new Date().toISOString(),
        travel_time_from_previous: 0, // You can calculate this if needed
      }));

      const waypoints = route.waypoints.map((wp:any) => ({
        lat: wp.lat,
        lng: wp.lng,
        address: wp.name || undefined, // or wp.address if available
      }));

      return {
        driver_id: route.delivery_person.id,
        driver_name: route.delivery_person.name,
        deliveries,
        route_geometry: {
          waypoints,
          encoded_polyline: route.encoded_polyline || undefined,
          total_distance: route.total_distance_meters,
          total_duration: route.total_time_minutes,
        },
        total_deliveries: deliveries.length,
        start_time:
          deliveries[0]?.estimated_arrival || new Date().toISOString(),
        estimated_end_time:
          deliveries[deliveries.length - 1]?.estimated_arrival ||
          new Date().toISOString(),
      };
    });
    
    const optimizedRoutes = transformed;
    console.log("Optimized Routes:", optimizedRoutes);
    // Store routes in database and create assignments
    console.log("seeing the first one", optimizedRoutes[0]);
    console.log("seeing the deliveries", optimizedRoutes[0].deliveries);
    console.log("seeing the route geometry", optimizedRoutes[0].route_geometry);
    console.log("seeing the waypoints", optimizedRoutes[0].route_geometry.waypoints);
    const assignments = [];
    const routes = [];

    for (const route of optimizedRoutes) {
      // Create route record
      const routeRecord = await prisma.route.create({
        data: {
          driver_id: route.driver_id,
          delivery_id: route.deliveries[0]?.delivery_id || "", // Primary delivery
          route_details: {
            driver_id: route.driver_id,
            driver_name: route.driver_name,
            deliveries: route.deliveries,
            route_geometry: route.route_geometry,
            total_deliveries: route.total_deliveries,
            start_time: route.start_time,
            estimated_end_time: route.estimated_end_time,
            waypoints: route.route_geometry.waypoints,
            total_distance: route.route_geometry.total_distance,
            total_duration: route.route_geometry.total_duration,
          },
        },
      });

      routes.push(routeRecord);

      // Create assignments for each delivery in this route
      for (const delivery of route.deliveries) {
        const assignment = await prisma.assignment.create({
          data: {
            delivery_id: delivery.delivery_id,
            driver_id: route.driver_id,
            route_id: routeRecord.route_id,
            assigned_at: new Date(),
            sequence_order: delivery.sequence,
            expected_arrival_time: new Date(delivery.estimated_arrival),
          },
        });

        assignments.push(assignment);

        // Update delivery status
        //   await prisma.delivery.update({
        //     where: { delivery_id: delivery.delivery_id },
        //     data: { status: "ASSIGNED" },
        //   });
        // Create delivery queue entry so that we can see that for the driver
        await prisma.deliveryQueue.create({
          data: {
            delivery_id: delivery.delivery_id,
            driver_id: route.driver_id,
            // date: date, //this date is the date of delivery, shd be converted to iso-8601 format
            date: new Date(date).toISOString(),
            position: delivery.sequence,
            status: "pending",
          },
        });
      }
    }

    //   // Fetch updated deliveries with assignments
    //   const updatedDeliveries = await prisma.delivery.findMany({
    //     where: {
    //       delivery_id: {
    //         in: deliveries.map((d: getTommorrowScheduledDeliveries) => d.delivery_id),
    //       },
    //     },
    //     include: {
    //       customer: {
    //         select: {
    //           customer_id: true,
    //           first_name: true,
    //           last_name: true,
    //           address: true,
    //           latitude: true,
    //           longitude: true,
    //           email: true,
    //           phone_number: true,
    //             createdAt: true,
    //             updatedAt: true,
    //         },
    //       },
    //       Assignment: {
    //         include: {
    //           driver: {
    //             select: {
    //               driver_id: true,
    //               first_name: true,
    //                 last_name: true,
    //             },
    //           },
    //           route: {
    //             select: {
    //               route_id: true,
    //               route_details: true,
    //             },
    //           },
    //         },
    //       },
    //       time_slot:{
    //         select: {
    //           time_slot_id: true,
    //           start_time: true,
    //           end_time: true,
    //         },
    //       }
    //     },
    //   });

    //   // Format response
    //   const formattedUpdatedDeliveries: getTommorrowScheduledDeliveries[] = updatedDeliveries.map(
    //     (delivery) => ({
    //       delivery_id: delivery.delivery_id,
    //       dropoff_location: delivery.dropoff_location,
    //       priority: delivery.priority,
    //       customer: delivery.customer,
    //       Assignment: delivery.Assignment.map((assignment) => ({
    //         driver_id: assignment.driver.driver_id,
    //         driver_name: assignment.driver.first_name + " " + (assignment.driver.last_name || ""),
    //         route_id: assignment.route_id,
    //       })),
    //       weight: delivery.weight,
    //       size: delivery.size,
    //       preffered_time: delivery.time_slot.start_time.toISOString().slice(11, 16) + " - " +
    //         delivery.time_slot.end_time.toISOString().slice(11, 16),
    //     })
    //   );
    const updatedDeliveries = await getDeliveriesByDateService(date);
    if (updatedDeliveries?.length === 0) {
      //if the length is 0 then no deliveries found
      res.status(404).json({
        success: false,
        message: "No deliveries found for this date",
        data: null,
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        optimizedDeliveries: updatedDeliveries,
        totalAssignments: assignments.length,
        totalDrivers: optimizedRoutes.length,
        totalRoutes: routes.length,
        summary: optimizationResponse.data.data.summary,
      },
      message: "Bulk routes assigned successfully",
    });
    return;
  } catch (error) {
    console.error("Get Deliveries Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
    return;
  }
}
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

interface RouteDetails {
    driver_id: string;
    driver_name: string;
    deliveries: RouteDelivery[];
    route_geometry: {
      waypoints: RouteWaypoint[];
      encoded_polyline?: string;
      total_distance: number;
      total_duration: number;
    };
    total_deliveries: number;
    start_time: string;
    estimated_end_time: string;
  };
// export async function getRouteByDriverIdAndDate(req: Request, res: Response) {
//   try {
//     const { driver_id, date } = req.params;
//     console.log("Driver ID:", driver_id);
//     console.log("Date:", date);
//     if (!driver_id || !date) {
//       res.status(400).json({
//         success: false,
//         message: "Driver ID and date are required",
//         data: null,
//       });
//       return;
//     }
//     // Logic to get route by driver ID and date
//     const targetDate = new Date(date);
//     const startOfDay = new Date(targetDate);
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date(targetDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     // const routes = await prisma.route.findMany({
//     //   where: {
//     //     driver_id: driver_id,
//     //     createdAt: {
//     //       gte: startOfDay,
//     //       lte: endOfDay,
//     //     },
//     //   },
//     //   include: {
//     //     driver: {
//     //       select: {
//     //         driver_id: true,
//     //         first_name: true,
//     //         last_name: true,
//     //         phone_number: true,
//     //       },
//     //     },
//     //     Assignment: {
//     //       include: {
//     //         delivery: {
//     //           include: {
//     //             customer: true,
//     //           },
//     //         },
//     //       },
//     //       orderBy: {
//     //         sequence_order: "asc",
//     //       },
//     //     },
//     //   },
//     //   orderBy: {
//     //     createdAt: "desc",
//     //   },
//     // });
//     const routes = await prisma.route.findMany({
//       where:{
//         driver_id: driver_id,
//         createdAt: {
//           gte: startOfDay,
//           lte: endOfDay,
//         },
//       },
//       include:{
//         driver: true,
//         delivery: {
//           include:{
//             customer: true,
//             time_slot: true,
//           }
//         },
//       }
//     })
//     if( routes.length === 0) {
//       res.status(404).json({
//         success: false,
//         message: "No routes found for this driver on the selected date",
//         data: null,
//       });
//       return;
//     }
//     const formattedRoutes =routes[0];
//     const routeDetails = formattedRoutes.route_details as unknown as RouteDetails;
//     const betterResult = routeDetails.deliveries.map((delivery) => ({
//       delivery_id: delivery.delivery_id,
//       sequence: delivery.sequence,
//       estimated_arrival: delivery.estimated_arrival,
//       travel_time_from_previous: delivery.travel_time_from_previous,
//       latitude: formattedRoutes.delivery.customer.latitude,//this the locaion of the customer or the dropoff basically
//       longitude: formattedRoutes.delivery.customer.longitude,
//       waypoints: routeDetails.route_geometry.waypoints.map((wp) => ({
//         lat: wp.lat,
//         lng: wp.lng,
//       })),
//       encoded_polyline: routeDetails.route_geometry.encoded_polyline,
//       driver_id: routeDetails.driver_id,
//       driver_name: routeDetails.driver_name,
//       total_distance: routeDetails.route_geometry.total_distance,
//       total_duration: routeDetails.route_geometry.total_duration,
//       route_start_time: routeDetails.start_time,
//       route_estimated_end_time: routeDetails.estimated_end_time,
//       drop_location: formattedRoutes.delivery.dropoff_location,
//       time_slot: formattedRoutes.delivery.time_slot.start_time.toISOString().slice(11, 16) + " - " +
//         formattedRoutes.delivery.time_slot.end_time.toISOString().slice(11, 16),
//       customer: formattedRoutes.delivery.customer,
//       sequence_order: delivery.sequence,
//     }));

//     res.json({
//       success: true,
//       message: `Route for driver ${driver_id} on date ${date}`,
//       data: betterResult,
//     });
//     return;
//   } catch (error) {
//     console.error("Get Deliveries Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: (error as Error).message,
//     });
//     return;
//   }
// }

//!Old get route by driver ID and date function
export async function getRouteByDriverIdAndDateAdminPanel(req: Request, res: Response) {
  try {
    const { driver_id, date } = req.params;
    console.log("Driver ID:", driver_id);
    console.log("Date:", date);

    if (!driver_id || !date) {
      res.status(400).json({
        success: false,
        message: "Driver ID and date are required",
        data: null,
      });
      return;
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const routes = await prisma.route.findMany({
      where: {
        driver_id: driver_id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        driver: true,
        // Remove this if route doesn't have a direct delivery relationship
        // delivery: {
        //   include: {
        //     customer: true,
        //     time_slot: true,
        //   }
        // },
      },
    });

    if (routes.length === 0) {
      res.status(200).json({
        success: false,
        message: "No routes found for this driver on the selected date",
        data: null,
      });
      return;
    }

    const route = routes[0];
    const routeDetails = route.route_details as unknown as RouteDetails;

    // Get all deliveries for this route with their details
    const deliveryIds = routeDetails.deliveries.map((d) => d.delivery_id);
    const deliveries = await prisma.delivery.findMany({
      where: {
        delivery_id: { in: deliveryIds },
      },
      include: {
        customer: true,
        time_slot: true,
      },
    });

    // Create a map for quick delivery lookup
    const deliveryMap = new Map(deliveries.map((d) => [d.delivery_id, d]));

    const betterResult = routeDetails.deliveries
      .map((routeDelivery) => {
        const deliveryData = deliveryMap.get(routeDelivery.delivery_id);

        if (!deliveryData) {
          console.warn(
            `Delivery ${routeDelivery.delivery_id} not found in database`
          );
          return null;
        }

        return {
          delivery_id: routeDelivery.delivery_id,
          sequence: routeDelivery.sequence,
          estimated_arrival: routeDelivery.estimated_arrival,
          travel_time_from_previous: routeDelivery.travel_time_from_previous,
          latitude: deliveryData.customer.latitude,
          longitude: deliveryData.customer.longitude,
          // Include waypoints only if they're specific to this delivery
          // Otherwise, consider moving this to route level
          waypoints: routeDetails.route_geometry.waypoints.map((wp) => ({
            lat: wp.lat,
            lng: wp.lng,
          })),
          encoded_polyline: routeDetails.route_geometry.encoded_polyline,
          driver_id: routeDetails.driver_id,
          driver_name: routeDetails.driver_name,
          total_distance: routeDetails.route_geometry.total_distance,
          total_duration: routeDetails.route_geometry.total_duration,
          route_start_time: routeDetails.start_time,
          route_estimated_end_time: routeDetails.estimated_end_time,
          drop_location: deliveryData.dropoff_location,
          time_slot:
            deliveryData.time_slot
              ? deliveryData.time_slot.start_time.toISOString().slice(11, 16) +
                " - " +
                deliveryData.time_slot.end_time.toISOString().slice(11, 16)
              : null,
          customer: deliveryData.customer,
          sequence_order: routeDelivery.sequence,
        };
      })
      .filter(Boolean); // Remove null entries

    res.json({
      success: true,
      message: `Route for driver ${driver_id} on date ${date}`,
      data: betterResult,
    });
    return;
  } catch (error) {
    console.error("Get Deliveries Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
    return;
  }
}
//!new one is this
export async function getRouteByDriverIdAndDate(req: Request, res: Response) {
  try {
    const { driver_id, date } = req.params;
    console.log("Driver ID:", driver_id);
    console.log("Date:", date);

    if (!driver_id || !date) {
      res.status(400).json({
        success: false,
        message: "Driver ID and date are required",
        data: null,
      });
      return;
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const routes = await prisma.route.findMany({
      where: {
        driver_id: driver_id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        driver: true,
      },
    });

    if (routes.length === 0) {
      res.status(200).json({
        success: false,
        message: "No routes found for this driver on the selected date",
        data: null,
      });
      return;
    }

    // Transform each route to match frontend expectations
    const transformedRoutes = await Promise.all(
      routes.map(async (route) => {
        const routeDetails = route.route_details as unknown as RouteDetails;

        // Get all deliveries for this route with their details
        const deliveryIds = routeDetails.deliveries.map((d) => d.delivery_id);
        const deliveries = await prisma.delivery.findMany({
          where: {
            delivery_id: { in: deliveryIds },
          },
          include: {
            customer: true,
            time_slot: true,
          },
        });

        // Create a map for quick delivery lookup
        const deliveryMap = new Map(deliveries.map((d) => [d.delivery_id, d]));

        // Transform deliveries to Assignment format
        const assignments = routeDetails.deliveries
          .map((routeDelivery) => {
            const deliveryData = deliveryMap.get(routeDelivery.delivery_id);

            if (!deliveryData) {
              console.warn(
                `Delivery ${routeDelivery.delivery_id} not found in database`
              );
              return null;
            }

            return {
              delivery: {
                delivery_id: routeDelivery.delivery_id,
                dropoff_location: deliveryData.dropoff_location,
                priority: deliveryData.priority || 3, // Default to low priority if not set
                customer: {
                  name: deliveryData.customer.first_name + " " + (deliveryData.customer.last_name || ""),
                  phone: deliveryData.customer.phone_number,
                  address: deliveryData.customer.address,
                  latitude: deliveryData.customer.latitude,
                  longitude: deliveryData.customer.longitude,
                },
              },
              sequence_number: routeDelivery.sequence,
              estimated_arrival: routeDelivery.estimated_arrival,
            };
          })
          .filter(Boolean); // Remove null entries

        // Transform waypoints to include delivery_id
        const transformedWaypoints = routeDetails.route_geometry.waypoints.map(
          (wp, index) => {
            const correspondingDelivery = routeDetails.deliveries[index];
            return {
              lat: wp.lat,
              lng: wp.lng,
              address: wp.address || "",
              delivery_id: correspondingDelivery?.delivery_id,
            };
          }
        );

        return {
          route_id: route.route_id,
          driver_id: route.driver_id,
          route_details: {
            driver_id: routeDetails.driver_id,
            driver_name: routeDetails.driver_name,
            deliveries: routeDetails.deliveries,
            route_geometry: {
              waypoints: transformedWaypoints,
              encoded_polyline: routeDetails.route_geometry.encoded_polyline,
              total_distance: routeDetails.route_geometry.total_distance,
              total_duration: routeDetails.route_geometry.total_duration,
            },
            total_deliveries: routeDetails.deliveries.length,
            start_time: routeDetails.start_time,
            estimated_end_time: routeDetails.estimated_end_time,
          },
          Assignment: assignments,
        };
      })
    );

    res.json({
      success: true,
      message: `Routes for driver ${driver_id} on date ${date}`,
      data: transformedRoutes,
    });
    return;
  } catch (error) {
    console.error("Get Routes Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
    return;
  }
}

export async function optimizeRoute(req: Request, res: Response) {
  try {
    const { driver_id, date } = req.params;
    // Logic to optimize route by driver ID and date
    res
      .status(200)
      .json({
        message: `Optimized route for driver ${driver_id} on date ${date}`,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to optimize route" });
  }
}
