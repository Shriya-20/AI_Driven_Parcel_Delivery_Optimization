// import { Driver } from "@prisma/client";
import { Driver, DriverLocation } from "../validation/drivers.validation";
import { prisma } from "../db/db";
import { DeliveryStatus, VehicleType } from "@prisma/client";
import { hash_password } from "./utils.services";
import { DeliveryQueueForDriver, newDriver, RouteDetailsForDelivery } from "../Types/types";
import { custom, date } from "zod";



export async function getAllDriversService(){
    const drivers = await prisma.driver.findMany({
        select: {
          driver_id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          start_location: true,
          createdAt: true,
          address: true,
          vehicles: {
            select: {
              vehicle_id: true,
              type: true,
              license_plate: true,
              model: true,
              year: true,
              color: true,
              company: true
            }
          },
          driver_location: {
            select: {
              latitude: true,
              longitude: true
            }
          },
        }
      });
      const driverRatings = await prisma.feedback.aggregate({
        _avg: {
          rating: true
        },
        where: {
          driver_id: {
            in: drivers.map((driver) => driver.driver_id)
          }
        }
      });
      const completedDeliveries = await prisma.orderHistory.aggregate({
        _count: {
          delivery_id: true
        },
        where: {
          driver_id: {
            in: drivers.map((driver) => driver.driver_id)
          }
        }
      });
      const driverandRatings = drivers.map((driver) => {
        const rating = driverRatings._avg.rating;
        const completed = completedDeliveries._count.delivery_id;
        return {
          ...driver,
          rating: rating,
          completed_deliveries: completed
        }
      })
    return driverandRatings;
}

export async function getDriverByIdService(id:string){
    const driver = await prisma.driver.findUnique({
        where: {
            driver_id: id
        },
        select: {
            driver_id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
            start_location: true,
            createdAt: true,
            vehicles: {
                select: {
                    vehicle_id: true,
                    type: true,
                    license_plate: true
                }
            }
        }
    });
    return driver;
}

export async function getDriverByEmailService(email:string){
    const driver = await prisma.driver.findUnique({
        where: {
            email: email
        }
    });
    return driver;
}

export async function createDriverService(driverData:Omit<Driver, "driver_id" | "createdAt" | "updatedAt" | "refresh_token" | "hashed_password"| "address" | "last_name">){
    const { password, ...driverDataWithoutPassword } = driverData;
    const newDriver: newDriver = await prisma.driver.create({
      data: {
        ...driverDataWithoutPassword,
        hashed_password: hash_password(password),
        vehicles: {
          create: driverData.vehicles.map((vehicle) => ({
            type: vehicle.type as VehicleType,
            company: vehicle.company,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            license_plate: vehicle.license_plate,
          })),
        },
      },
      select: {
        driver_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        start_location: true,
        createdAt: true,
        vehicles: {
          select: {
            vehicle_id: true,
            type: true,
            company: true,
            model: true,
            year: true,
            color: true,
            license_plate: true,
          },
        },
      },
    });
    return newDriver;
}

export async function updateDriverService(id:string, driverData:Omit<Driver, "driver_id" | "createdAt" | "updatedAt" | "refresh_token" | "hashed_password"| "address" | "last_name" | "start_location">){
    const updatedDriver = await prisma.driver.update({
        where: {
            driver_id: id
        },
        data: {
            ...driverData,
            vehicles: {
                updateMany: driverData.vehicles.map((vehicle) => ({
                    where: {
                        license_plate: vehicle.license_plate
                    },
                    data: {
                        type: vehicle.type as VehicleType,
                        company: vehicle.company,
                        model: vehicle.model,
                        year: vehicle.year,
                        color: vehicle.color,
                        license_plate: vehicle.license_plate
                    }
                }))
            }
        },
        select: {
            driver_id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
            start_location: true,
            createdAt: true,
            vehicles: {
                select: {
                    vehicle_id: true,
                    type: true,
                    company: true,
                    model: true,
                    year: true,
                    color: true,
                    license_plate: true
                }
            }
        }
    });
    return updatedDriver;
}

export async function getDriverDeliveriesService(id:string, date:string){
    // Build where clause
    const where: any = {
      driver_id: id,
    };

    if (date) {
      // const startOfDay = new Date(date);
      // startOfDay.setHours(0, 0, 0, 0);

      // const endOfDay = new Date(date);
      // endOfDay.setHours(23, 59, 59, 999);
      // Instead of relying on ambiguous Date parsing
      const parsedDate = new Date(`${date}T00:00:00Z`);
      //shd send date as YYYY-MM-DD
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      // console.log("Start of day:", startOfDay.toISOString());
      // console.log("End of day:", endOfDay.toISOString());

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Fetch deliveries
    const deliveryQueue = await prisma.deliveryQueue.findMany({
      where,
      include: {
        delivery: {
          include: {
            customer: {
              select: {
                first_name: true,
                last_name: true,
                phone_number: true,
                address: true,
                customer_id: true,
              },
            },
            time_slot: true,
          },
          
        },
        driver:{
          select: {
            driver_id: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            email: true,
            start_location: true,
          },
        }
      },
      orderBy: {
        position: "asc",
      },
    });

    // Format response
    const deliveries: DeliveryQueueForDriver[] = deliveryQueue.map((queue) => ({
      queue_id: queue.queue_id,
      delivery_id: queue.delivery_id,
      status: queue.status,
      date: queue.date,
      position: queue.position,
      priority: queue.delivery.priority,
      driver: queue.driver,
      customer: queue.delivery.customer,
      dropoff_location: queue.delivery.dropoff_location,
      weight: queue.delivery.weight,
      size: queue.delivery.size,
      delivery_instructions: queue.delivery.delivery_instructions,
      time_slot: queue.delivery.time_slot
        ? {
            start_time: queue.delivery.time_slot.start_time,
            end_time: queue.delivery.time_slot.end_time,
          }
        : undefined,
    }));
    return deliveries;
}

export async function getDeliveryForDriver(id: string, date: string, delivery_id: string) {
  //this gives specific delivery for a driver on a specific date

  // Build where clause
  const where: any = {
    driver_id: id,
    delivery_id: delivery_id,
  };

  if (date) {
    // const startOfDay = new Date(date);
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date(date);
    // endOfDay.setHours(23, 59, 59, 999);
    // Instead of relying on ambiguous Date parsing
    const parsedDate = new Date(`${date}T00:00:00Z`);
    //shd send date as YYYY-MM-DD
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    // console.log("Start of day:", startOfDay.toISOString());
    // console.log("End of day:", endOfDay.toISOString());

    where.date = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  // Fetch deliveries
  const deliveryQueue = await prisma.deliveryQueue.findMany({
    where,
    include: {
      delivery: {
        include: {
          customer: {
            select: {
              first_name: true,
              last_name: true,
              phone_number: true,
              latitude: true,
              longitude: true,
              address: true,
              customer_id: true,
            },
          },
          time_slot: true,
        },
      },
      driver: {
        select: {
          driver_id: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
          start_location: true,
        },
      },
    },
  });
  if (!deliveryQueue) {
    throw new Error("Delivery not found for the specified driver and date");
  }

  // Format response
  const deliveries: DeliveryQueueForDriver[] = deliveryQueue.map((queue) => ({
    queue_id: queue.queue_id,
    delivery_id: queue.delivery_id,
    status: queue.status,
    date: queue.date,
    position: queue.position,
    priority: queue.delivery.priority,
    customer: queue.delivery.customer,
    dropoff_location: queue.delivery.dropoff_location,
    weight: queue.delivery.weight,
    size: queue.delivery.size,
    delivery_instructions: queue.delivery.delivery_instructions,
    time_slot: queue.delivery.time_slot
      ? {
          start_time: queue.delivery.time_slot.start_time,
          end_time: queue.delivery.time_slot.end_time,
        }
      : undefined,
    driver: queue.driver,
  }));
  return deliveries;
}
export async function getDriverRouteDeliveryService(driver_id:string, delivery_id:string){
    const route: RouteDetailsForDelivery = await prisma.route.findFirst({
      where: {
        driver_id: driver_id,
        delivery_id: delivery_id,
      },
      select: {
        route_id: true,
        driver_id: true,
        delivery_id: true,
        route_details: true,
      },
    });
    return route;
}

export async function updateDriverLocationService(driver_id:string, location: {
  driver_id: string;
  latitude: number;
  longitude: number;
  timestamp?: Date;
}){
    const updatedLocation: {
      driver_id: string;
      latitude: number;
      longitude: number;
    } = await prisma.driverLocation.update({
      where: {
        driver_id: driver_id,
      },
      data: {
        ...location,
      },
      select: {
        location_id: false,
        driver_id: true,
        latitude: true,
        longitude: true,
      },
    });
    return updatedLocation;
}

// export async function deliveryStatusChangeService(driver_id: string, delivery_id: string, status: DeliveryStatus) {
//   const updatedDeliveryQueue = await prisma.deliveryQueue.update({
//     where: {
//       idx_delivery_queue_driver_delivery_id: {
//         driver_id: driver_id,
//         delivery_id: delivery_id,
//       },//to say that we are looking for a specific delivery for the driver in the queue
//     },
//     data: {
//       status: status,
//     },
//     select: {
//       driver_id: true,
//       delivery_id: true,
//       status: true,
//       delivery: true,
//       date: true,
//     }
//   });
//   if (status === "completed" || status === "cancelled") {
//     //if status is completed then we need to put it in the order history
//     const customer_id = updatedDeliveryQueue.delivery.customer_id;
//     const time_slot = updatedDeliveryQueue.delivery.time_slot_id;
//     if(!customer_id || !time_slot){
//       throw new Error("Customer ID or Time Slot ID not found in delivery details");
//     }
//     const time_slot_details = await prisma.timeSlot.findUnique({
//       where: {
//         time_slot_id: time_slot,
//       },
//       select: {
//         start_time: true,
//         end_time: true,
//       }
//     });
//     if (!time_slot_details) {
//         throw new Error("Time slot not found");
//       }
//     const customer = await prisma.customer.findUnique({
//       where: {
//         customer_id: customer_id,
//       },});
//     if (!customer) {
//       throw new Error("Customer not found");
//     }
//     if (status === "completed") {
//       //if completed then we need to add it to the order history
//       const currentTime = new Date().getTime();
//       const startTime = new Date(time_slot_details.start_time).getTime();
//       const endTime = new Date(time_slot_details.end_time).getTime();
//       let OrderStatus = "on_time";
//       //check if the delivery is completed within the time slot
//       if (currentTime < startTime) {
//         OrderStatus = "early";
//       }else if (currentTime > endTime) {
//         OrderStatus = "late";
//       }
//       await prisma.orderHistory.create({
//         data: {
//           delivery_id: updatedDeliveryQueue.delivery_id,
//           customer_id: customer_id,
//           driver_id: driver_id,
//           completed_at: new Date(),
//           date: updatedDeliveryQueue.date,
//           status: OrderStatus as "on_time" | "early" | "late" | "not_delivered",
//         },
//       });
//     }else if (status === "cancelled") {
//       await prisma.orderHistory.create({
//         data: {
//           delivery_id: updatedDeliveryQueue.delivery_id,
//           customer_id: customer_id,
//           driver_id: driver_id,
//           completed_at: new Date(),
//           date: updatedDeliveryQueue.date,
//           status: "not_delivered" as "on_time" | "early" | "late" | "not_delivered",
//         },
//       });
//     }
//            //current time

//     //TODO-> once it is completed we shd get the time also for that delivery compare with the current time and make the orderstatus as such and get the customer info and then store it in the order history
//   }
//   return updatedDeliveryQueue;
//   //would be ok on returning just this as in dashboard the delivery queue will be picked properly anyway so it will be fine
// }
export async function deliveryStatusChangeService(
  driver_id: string,
  delivery_id: string,
  status: DeliveryStatus
) {
  // Update delivery status in queue
  const updatedDeliveryQueue = await prisma.deliveryQueue.update({
    where: {
      idx_delivery_queue_driver_delivery_id: {
        driver_id,
        delivery_id,
      },
    },
    data: {
      status,
    },
    select: {
      driver_id: true,
      delivery_id: true,
      status: true,
      date: true,
      delivery: {
        select: {
          customer_id: true,
          time_slot_id: true,
        },
      },
    },
  });

  // Handle completion or cancellation
  if (status === "completed" || status === "cancelled") {
    await createOrderHistory(updatedDeliveryQueue, driver_id, status);
  }

  return updatedDeliveryQueue;
}

async function createOrderHistory(
  deliveryQueue: any,
  driver_id: string,
  status: "completed" | "cancelled"
) {
  const { delivery_id, date, delivery } = deliveryQueue;
  const { customer_id, time_slot_id } = delivery;

  // Validate required fields
  if (!customer_id || !time_slot_id) {
    throw new Error(
      "Customer ID or Time Slot ID not found in delivery details"
    );
  }

  // Fetch customer and time slot details in parallel
  const [customer, timeSlotDetails] = await Promise.all([
    prisma.customer.findUnique({
      where: { customer_id },
      select: { customer_id: true }, // Only select what we need
    }),
    prisma.timeSlot.findUnique({
      where: { time_slot_id },
      select: {
        start_time: true,
        end_time: true,
      },
    }),
  ]);

  // Validate fetched data
  if (!customer) {
    throw new Error("Customer not found");
  }

  if (!timeSlotDetails) {
    throw new Error("Time slot not found");
  }

  // Determine order status based on completion time and time slot
  const orderStatus =
    status === "completed"
      ? determineDeliveryTiming(timeSlotDetails)
      : "not_delivered";

  // Create order history record
  await prisma.orderHistory.create({
    data: {
      delivery_id,
      customer_id,
      driver_id,
      completed_at: new Date(),
      date,
      status: orderStatus as "on_time" | "early" | "late" | "not_delivered",
    },
  });
}

function determineDeliveryTiming(timeSlot: {
  start_time: Date;
  end_time: Date;
}): string {
  const currentTime = new Date().getTime();
  const startTime = new Date(timeSlot.start_time).getTime();
  const endTime = new Date(timeSlot.end_time).getTime();

  if (currentTime < startTime) {
    return "early";
  } else if (currentTime > endTime) {
    return "late";
  } else {
    return "on_time";
  }
}