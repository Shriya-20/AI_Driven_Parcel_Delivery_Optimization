import { Request, Response } from "express";
import {
  createDriverService,
  deliveryStatusChangeService,
  getAllDriversService,
  getDeliveryForDriver,
  getDriverByEmailService,
  getDriverByIdService,
  getDriverDeliveriesService,
  getDriverRouteDeliveryService,
  updateDriverLocationService,
  updateDriverService,
} from "../services/drivers.services";
import {
  Driver,
  driverLocationSchema,
  driverSchema,
  DriverLocation,
} from "../validation/drivers.validation";
import { VehicleType } from "@prisma/client";
import {
  DeliveryQueueForDriver,
  newDriver,
  RouteDetailsForDelivery,
} from "../Types/types";

export async function getAllDrivers(req: Request, res: Response) {
  try {
    const drivers = await getAllDriversService();
    res.status(200).json({
      success: true,
      message: "Drivers fetched successfully",
      data: drivers,
    });
    return;
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
    return;
  }
}

export async function getDriverById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const driver = await getDriverByIdService(id);
    if (!driver) {
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Driver fetched successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Get Driver By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}

export async function createDriver(req: Request, res: Response) {
  try {
    console.log("Create Driver Request Body:", req.body);
    const validationResult = driverSchema.safeParse(req.body);
    if (validationResult.success) {
      const driverData = validationResult.data;
      const existingDriver = await getDriverByEmailService(driverData.email);
      if (existingDriver) {
        res.status(400).json({
          success: false,
          message: "Driver with this email already exists",
          data: null,
        });
        return;
      }
      const newDriver: newDriver = await createDriverService(driverData);
      res.status(201).json({
        success: true,
        message: "Driver created successfully",
        data: newDriver,
      });
      return;
    }
    if (!validationResult.success) {
      console.error("Validation Error:", validationResult.error.errors);
      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationResult.error.errors,
      });
      return;
    }
  } catch (error) {
    console.error("Create Driver Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}

export async function updateDriver(req: Request, res: Response) {
  const { id } = req.params;
  const driverData = req.body;
  try {
    const validationResult = driverSchema.safeParse(driverData);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationResult.error.errors,
      });
      return;
    }
    const existingDriver = await getDriverByIdService(id);
    if (!existingDriver) {
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    if (validationResult.success) {
      const updatedDriver: newDriver = await updateDriverService(
        id,
        driverData
      );
      if (!updatedDriver) {
        res.status(404).json({
          success: false,
          message: "Driver not found",
          data: null,
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Driver updated successfully",
        data: updatedDriver,
      });
      return;
    }
  } catch (error) {
    console.error("Update Driver Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}

export async function getDriverDeliveries(req: Request, res: Response) {
  const { id } = req.params;
  const { date } = req.query;
  if (!id) {
    res.status(400).json({
      success: false,
      message: "Driver ID is required",
      data: null,
    });
    return;
  }
  if (!date) {
    res.status(400).json({
      success: false,
      message: "Date is required",
      data: null,
    });
    return;
  }
  try {
    console.log("reached here");
    console.log("Driver ID:", id, "Date:", date);
    const driver = await getDriverByIdService(id);
    if (!driver) {
      console.error("Driver not found for ID:", id);
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    const driverDeliveryQueue: DeliveryQueueForDriver[] =
      await getDriverDeliveriesService(id, date as string);
      // console.log("Driver Delivery Queue:", driverDeliveryQueue);
    if (driverDeliveryQueue.length === 0) {
      console.error("No assigned deliveries for this driver on this date:", date);
      res.status(200).json({
        success: true,
        message: `No assigned deliveries for this driver on this date: ${date}`,
        data: null,
      });//if no assigned shd show this message and not 404 and also is success only
      return;
    }
    res.status(200).json({
      success: true,
      message: "Driver deliveries fetched successfully",
      data: driverDeliveryQueue,
    });
  } catch (error) {
    console.error("Get Driver Deliveries Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}
export async function getDriverSpecificDelivery(req: Request, res: Response) {
  const { id, deliveryId } = req.params;
  const { date } = req.query;
  if (!id || !deliveryId) {
    res.status(400).json({
      success: false,
      message: "Driver ID is required",
      data: null,
    });
    return;
  }
  if (!date) {
    res.status(400).json({
      success: false,
      message: "Date is required",
      data: null,
    });
    return;
  }
  try {
    console.log("reached here");
    const driver = await getDriverByIdService(id);
    if (!driver) {
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    const deliveryDetails: DeliveryQueueForDriver[] = await getDeliveryForDriver(
      id,
      date as string,
      deliveryId
    );
    // console.log("Driver Delivery Queue:", driverDeliveryQueue);
    if (deliveryDetails.length === 0) {
      res.status(200).json({
        success: true,
        message: `No assigned deliveries for this driver on this date: ${date}`,
        data: null,
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Driver deliveries fetched successfully",
      data: deliveryDetails,
    });
  } catch (error) {
    console.error("Get Driver Deliveries Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}

export async function getDriverRouteDelivery(req: Request, res: Response) {
  const { id, deliveryId } = req.params;
  if (!id || !deliveryId) {
    res.status(400).json({
      success: false,
      message: id ? "Delivery ID is required" : "Driver ID is required",
      data: null,
    });
    return;
  }
  try {
    const driver = await getDriverByIdService(id);
    if (!driver) {
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    const routeForDelivery: RouteDetailsForDelivery =
      await getDriverRouteDeliveryService(id, deliveryId);
    if (!routeForDelivery) {
      res.status(404).json({
        success: false,
        message: "No route found for this delivery",
        data: null,
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Driver route fetched successfully",
      data: routeForDelivery,
    });
  } catch (error) {
    console.error("Get Driver Deliveries Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}

export async function updateDriverLocation(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      success: false,
      message: "Driver ID is required",
      data: null,
    });
    return;
  }
  try {
    // const validationResult = driverLocationSchema.safeParse(req.body);
    console.log("Update Driver Location Request Body:", req.body);
    // if (!validationResult.success) {
    //   res.status(400).json({
    //     success: false,
    //     message: "Validation Error",
    //     errors: validationResult.error.errors,
    //   });
    //   return;
    // }
    const {driver_id, latitude,longitude,timestamp} = req.body;
    const driver = await getDriverByIdService(id);
    console.log("Driver found:", driver);
    if (!driver) {
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    const location ={
      driver_id,
      latitude,
      longitude,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };
    const updatedDriverLocation = await updateDriverLocationService(
      id,
      location
    );
    if (!updatedDriverLocation) {
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    console.log("Updated Driver Location:", updatedDriverLocation);
    res.status(200).json({  
      success: true,
      message: "Driver location updated successfully",
      data: updatedDriverLocation,
    });
  } catch (error) {
    console.error("Update Driver Location Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}

export async function deliveryStatusChange(req: Request, res: Response) {
  const { id, delivery_id } = req.params;
  const { status } = req.body;
  if (!id || !delivery_id || !status) {
    res.status(400).json({
      success: false,
      message: id ? "Delivery ID is required" : delivery_id ? "Status is required" : "Driver ID is required",
      data: null,
    });
    return;
  }
  try {
    const driver = await getDriverByIdService(id);
    if (!driver) {
      res.status(404).json({
        success: false,
        message: "Driver not found",
        data: null,
      });
      return;
    }
    const updatedDeliveryQueue = await deliveryStatusChangeService(id, delivery_id, status);
    if (!updatedDeliveryQueue) {
      res.status(404).json({
        success: false,
        message: "Delivery not found",
        data: null,
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Driver delivery status updated successfully",
      data: updatedDeliveryQueue,
    });
  } catch (error) {
    console.error("Start Delivery Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
}