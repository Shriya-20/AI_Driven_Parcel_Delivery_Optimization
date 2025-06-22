# Parcel Delivery Optimization Backend

## Overview

This backend system consists of two main components:

1. **Main API** - Core delivery management system handling drivers, deliveries, routes, customers, and admin operations
2. **Live Location Tracking Service** - Real-time location tracking between mobile app and admin dashboard

The system is built with Node.js, Express, TypeScript, and PostgreSQL with Prisma ORM. It includes route optimization using external services(Model API), email notifications, and comprehensive dashboard analytics.

## Architecture

- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication for drivers and admins
- **Route Optimization**: Integration with external optimization service
- **Email Service**: Automated email notifications to customers
- **Real-time Tracking**: WebSocket/HTTP-based location updates

## Database Design

The system uses PostgreSQL with Prisma ORM. The database schema includes the following main entities:

### Core Entities

#### Drivers

- `driver_id` (UUID, Primary Key)
- Personal information (name, email, phone, address)
- Authentication (hashed_password, refresh_token)
- Location data (start_location with latitude/longitude)
- Status tracking (ACTIVE, INACTIVE, BUSY)

#### Customers

- `customer_id` (UUID, Primary Key)
- Personal information (name, email, phone, address)
- Geolocation (latitude, longitude for address geocoding)

#### Deliveries

- `delivery_id` (UUID, Primary Key)
- Package details (weight, size, delivery_instructions)
- Location (dropoff_location, latitude, longitude)
- Timing (time_slot_id, delivery_date)
- Priority levels (0: normal, 1: high, 2: urgent)

#### Vehicles

- `vehicle_id` (UUID, Primary Key)
- Vehicle details (type, company, model, year, color)
- License plate (unique identifier)
- Associated with drivers

### Operational Entities

#### DeliveryQueue

- Manages delivery assignments to drivers
- Status tracking (pending, in_progress, completed, cancelled)
- Position-based queue management

#### Routes

- Stores optimized route information as JSON
- Links drivers to deliveries with route details
- Supports sequence ordering and expected arrival times

#### Assignments

- Links drivers, deliveries, and routes
- Tracks assignment timing and sequence
- Expected arrival time calculations

#### TimeSlots

- Manages delivery time windows
- Start and end time preferences

### Tracking & Analytics

#### DriverLocation

- Real-time location tracking
- Speed, heading, and battery level monitoring
- Unique per driver with timestamp updates

#### OrderHistory

- Historical delivery performance
- Completion status (on_time, late, early, not_delivered)
- Duration and distance metrics

#### Feedback

- Customer ratings for drivers (1-5 scale)
- Comments and service quality tracking

### Administration

#### Admin

- Multi-level admin roles (super_admin, regional_admin, standard)
- Regional assignment capabilities
- Authentication and access control

### Database Relationships

```
Driver (1:N) Vehicle
Driver (1:N) DeliveryQueue
Driver (1:N) OrderHistory
Driver (1:1) DriverLocation
Driver (1:N) Feedback

Customer (1:N) Delivery
Customer (1:N) OrderHistory
Customer (1:N) Feedback

Delivery (1:N) DeliveryQueue
Delivery (1:N) OrderHistory
Delivery (N:1) TimeSlot

Route (N:1) Driver
Route (N:1) Delivery
Route (1:N) Assignment
```


## API Documentation

### Base URL
```
http://localhost:8000/api - main api
http://localhost:4000 - live location tracking websocket api
http://localhost:5001/api - Model Api for route optimization and delivery assignment
```

---

## Authentication Endpoints

### Driver Login
**POST** `/auth/login/driver`

Authenticate driver and return JWT token.

**Request Body:**
```json
{
  "email": "driver@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver login successful",
  "data": {
    "driver": {
      "driver_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "driver@example.com",
      "phone_number": "+1234567890",
      "status": "ACTIVE"
    },
    "token": "jwt_token_here"
  }
}
```

### Admin Login
**POST** `/auth/login/admin`

Authenticate admin and return JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "admin_id": "uuid",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@example.com",
      "role": "super_admin"
    },
    "token": "jwt_token_here"
  }
}
```

---

## Driver Endpoints

### Get All Drivers
**GET** `/drivers`

Retrieve all drivers with their vehicles, locations, ratings, and delivery counts.

**Response:**
```json
{
  "success": true,
  "message": "Drivers fetched successfully",
  "data": [
    {
      "driver_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "vehicles": [
        {
          "vehicle_id": "uuid",
          "type": "motorcycle",
          "company": "Honda",
          "model": "CBR150R",
          "license_plate": "ABC123"
        }
      ],
      "rating": 4.5,
      "completed_deliveries": 150
    }
  ]
}
```

### Get Driver by ID
**GET** `/drivers/{id}`

Retrieve specific driver details by ID.

**Response:**
```json
{
  "success": true,
  "message": "Driver fetched successfully",
  "data": {
    "driver_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "vehicles": [],
    "rating": 4.5,
    "completed_deliveries": 150
  }
}
```

### Create Driver
**POST** `/drivers`

Create a new driver with vehicle information.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone_number": "+1234567890",
  "address": "123 Main St",
  "start_location": "Downtown Hub",
  "vehicles": [
    {
      "type": "motorcycle",
      "company": "Yamaha",
      "model": "R15",
      "year": 2023,
      "color": "Blue",
      "license_plate": "XYZ789"
    }
  ]
}
```

### Get Driver Deliveries
**GET** `/drivers/{id}/deliveries?date=2025-06-23`

Get all deliveries assigned to a driver for a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "message": "Driver deliveries fetched successfully",
  "data": [
    {
      "queue_id": "uuid",
      "delivery_id": "uuid",
      "status": "pending",
      "position": 1,
      "customer": {
        "first_name": "Customer",
        "last_name": "Name",
        "phone_number": "+1234567890",
        "address": "Customer Address"
      },
      "dropoff_location": "123 Customer St",
      "weight": 2.5,
      "size": "medium",
      "priority": 1,
      "time_slot": {
        "start_time": "2025-06-23T09:00:00Z",
        "end_time": "2025-06-23T11:00:00Z"
      }
    }
  ]
}
```

### Update Driver Location
**POST** `/drivers/{id}/location`

Update driver's real-time location.

**Request Body:**
```json
{
  "driver_id": "uuid",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "timestamp": "2025-06-22T10:30:00Z"
}
```

### Update Delivery Status
**POST** `/drivers/{id}/{delivery_id}/status`

Update delivery status (start delivery, complete, cancel).

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Possible Status Values:**
- `pending`
- `in_progress`
- `completed`
- `cancelled`

---

## Delivery Endpoints

### Get Deliveries by Date
**GET** `/deliveries?date=2025-06-23`

Get all deliveries for a specific date with assignment status.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "message": "Deliveries found",
  "data": [
    {
      "delivery_id": "uuid",
      "dropoff_location": "123 Customer St",
      "priority": 1,
      "weight": 2.5,
      "size": "medium",
      "customer": {
        "customer_id": "uuid",
        "first_name": "John",
        "last_name": "Customer",
        "email": "customer@example.com",
        "phone_number": "+1234567890"
      },
      "Assignment": [
        {
          "driver": {
            "driver_id": "uuid",
            "first_name": "Driver Name"
          }
        }
      ],
      "preffered_time": "09:00 - 11:00"
    }
  ]
}
```

### Get Order History
**GET** `/deliveries/orderhistory`

Retrieve complete order history with delivery statistics.

### Update Delivery Time Slot
**POST** `/deliveries/{id}/time-slot`

Update preferred delivery time slot for a delivery.

**Request Body:**
```json
{
  "timeSlot": {
    "start_time": "2025-06-23T09:00:00Z",
    "end_time": "2025-06-23T11:00:00Z"
  }
}
```

---

## Route Management Endpoints

### Bulk Assign Routes
**POST** `/routes/assignbulk`

Assign multiple deliveries to drivers using route optimization.

**Request Body:**
```json
{
  "deliveries": [
    {
      "delivery_id": "uuid",
      "customer": {
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "preffered_time": "09:00 - 11:00"
    }
  ],
  "date": "2025-06-23"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "optimizedDeliveries": [],
    "totalAssignments": 5,
    "totalDrivers": 2,
    "totalRoutes": 2,
    "summary": {
      "total_drivers_used": 2,
      "total_deliveries_assigned": 5,
      "total_distance": 45.2,
      "total_duration": 180
    }
  }
}
```

### Get Driver Route by Date
**GET** `/routes/route/{driver_id}/{date}`

Get optimized route for a specific driver on a specific date.

**Response:**
```json
{
  "success": true,
  "message": "Route for driver uuid on date 2025-06-23",
  "data": [
    {
      "delivery_id": "uuid",
      "sequence": 1,
      "estimated_arrival": "2025-06-23T09:30:00Z",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "waypoints": [
        {
          "lat": 12.9716,
          "lng": 77.5946
        }
      ],
      "customer": {
        "first_name": "Customer",
        "phone_number": "+1234567890"
      },
      "drop_location": "123 Customer St"
    }
  ]
}
```

---

## Dashboard Analytics Endpoints

### Get Dashboard Stats
**GET** `/dashboard/stats`

Get key performance indicators for the dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeDeliveries": 25,
    "pendingDeliveries": 40,
    "onRouteDeliveries": 15,
    "canceledDeliveries": 3,
    "availableDrivers": 12,
    "todayCompleted": 45
  }
}
```

### Get Daily Performance
**GET** `/dashboard/performance?days=7`

Get performance metrics for the last N days.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-06-22",
      "completed": 45,
      "failed": 2,
      "pending": 8
    }
  ]
}
```

### Get Top Drivers
**GET** `/dashboard/drivers/top?limit=5`

Get top performing drivers based on deliveries and ratings.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "driver_id": "uuid",
      "name": "John Doe",
      "deliveries": 150,
      "rating": 4.8,
      "status": "active",
      "completionRate": 95
    }
  ]
}
```

### Get Fleet Status
**GET** `/dashboard/fleet-status`

Get vehicle fleet utilization statistics.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "motorcycle",
      "total": 20,
      "active": 15,
      "utilization": 75
    }
  ]
}
```

---

## Customer Endpoints

### Get Customer Details
**GET** `/customers/{customer_id}`

Retrieve customer information by ID.

### Send Emails to Customers
**GET** `/customers/sendemails?date=2025-06-23`

Send delivery notification emails to all customers for a specific date.

---

## Email Endpoints

### Send Time Slot Emails
**POST** `/email/send-timeslots-emails`

Send delivery scheduling emails to customers.

**Request Body:**
```json
{
  "deliveries": [
    {
      "delivery_id": "uuid",
      "customer": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "customer@example.com"
      },
      "dropoff_location": "123 Main St",
      "priority": 1,
      "weight": 2.5,
      "size": "medium",
      "preffered_time": "09:00 - 11:00"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Live Location Tracking

The system includes real-time location tracking capabilities:

1. **Driver Location Updates**: Drivers send location updates via mobile app
2. **Admin Dashboard**: Real-time visualization of driver locations
3. **Route Tracking**: Live tracking of delivery progress
4. **Geofencing**: Automatic status updates based on location


---

## Model API (Route Optimization Service)

The system integrates with an external route optimization service built with Python Flask and Google OR-Tools. This service handles multi-vehicle delivery route optimization with time windows.

### Base URL
```
http://localhost:5001/api
```

### Route Optimization Endpoints

#### Optimize Multi-Vehicle Routes
**POST** `/optimize-multi-route`

Optimize delivery routes for multiple delivery persons using VRPTW (Vehicle Routing Problem with Time Windows) algorithm.

**Request Body:**
```json
{
  "current_time": "2025-06-23T08:00:00",
  "delivery_persons": [
    {
      "id": "driver_1",
      "name": "John Doe",
      "location": {
        "lat": 13.3409,
        "lng": 74.7421
      },
      "capacity": 10,
      "max_working_hours": 8
    }
  ],
  "deliveries": [
    {
      "id": "delivery_1",
      "customer": "Customer Name",
      "location": {
        "lat": 13.3500,
        "lng": 74.7500,
        "address": "123 Main St, Udupi"
      },
      "time_window": {
        "start": "2025-06-23T09:00:00",
        "end": "2025-06-23T11:00:00"
      },
      "package_details": {
        "weight": 2.5,
        "description": "Electronics package"
      }
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_vehicles_used": 1,
    "total_distance_meters": 5420,
    "total_time_minutes": 145,
    "routes": [
      {
        "delivery_person": {
          "id": "driver_1",
          "name": "John Doe",
          "location": {
            "lat": 13.3409,
            "lng": 74.7421
          }
        },
        "stops": [
          {
            "delivery": {
              "id": "delivery_1",
              "customer": "Customer Name",
              "location": {
                "lat": 13.3500,
                "lng": 74.7500,
                "address": "123 Main St, Udupi"
              }
            },
            "arrival_time": "2025-06-23T09:15:00",
            "wait_time_minutes": 0,
            "detailed_path": [
              {
                "start": {"lat": 13.3409, "lng": 74.7421},
                "end": {"lat": 13.3450, "lng": 74.7450},
                "distance_meters": 800,
                "time_minutes": 3,
                "road_name": "Main Road",
                "road_type": "primary"
              }
            ]
          }
        ],
        "total_distance_meters": 5420,
        "total_time_minutes": 145,
        "waypoints": [
          {
            "lat": 13.3409,
            "lng": 74.7421,
            "type": "start",
            "name": "Delivery Person: driver_1"
          },
          {
            "lat": 13.3500,
            "lng": 74.7500,
            "type": "delivery_point",
            "delivery_id": "delivery_1",
            "customer": "Customer Name",
            "arrival_time": "2025-06-23T09:15:00"
          }
        ]
      }
    ],
    "fallback_used": false
  },
  "error": null,
  "request_id": "REQ_20250623_081500_123456",
  "fallback_used": false
}
```

#### Health Check
**GET** `/health`

Check if the optimization service is running.

**Response:**
```json
{
  "status": "success",
  "message": "Multi-Vehicle Delivery Optimizer API is running"
}
```

#### Generate Route Visualization
**POST** `/visualize-routes`

Generate an HTML visualization of optimized routes using Folium maps.

**Request Body:**
```json
{
  "route_plan": {
    // Route plan data from optimize-multi-route endpoint
  }
}
```

**Response:**
```json
{
  "status": "success",
  "file_path": "./output/multi_vehicle_routes_20250623_081500.html",
  "error": null
}
```

### Data Analytics Endpoints

#### Get CSV Data
**GET** `/csv-data?type=requests&limit=10&request_id=REQ_123`

Retrieve stored optimization request data.

**Query Parameters:**
- `type`: 'requests', 'routes', or 'deliveries'
- `limit`: Number of records to return (optional)
- `request_id`: Filter by specific request ID (optional)

#### Export CSV Data
**GET** `/export-csv?type=requests`

Export CSV files containing optimization history.

**Query Parameters:**
- `type`: 'requests', 'routes', or 'deliveries'

### Algorithm Features

#### VRPTW (Vehicle Routing Problem with Time Windows)
- **Primary Algorithm**: Uses Google OR-Tools CP-SAT solver
- **Time Window Constraints**: Respects customer preferred delivery times
- **Capacity Constraints**: Considers vehicle capacity limits
- **Distance Optimization**: Minimizes total travel distance
- **Real Road Network**: Uses actual road data from OpenStreetMap

#### VRP Fallback
- **Fallback Algorithm**: Basic VRP without time windows if VRPTW fails
- **Automatic Switching**: Seamlessly falls back when constraints are too tight
- **Guaranteed Solution**: Always provides a valid route assignment

#### Route Optimization Features
- **Multi-Vehicle Support**: Handles multiple delivery persons simultaneously
- **Real-time Optimization**: Processes current traffic and road conditions
- **Waypoint Generation**: Provides detailed turn-by-turn navigation points
- **Performance Metrics**: Tracks distance, time, and efficiency statistics

### Integration with Main API

The main backend integrates with the Model API through the `/routes/assignbulk` endpoint:

1. **Collect Deliveries**: Main API gathers unassigned deliveries for a date
2. **Format Request**: Converts delivery data to Model API format
3. **Call Optimization**: Sends request to Model API `/optimize-multi-route`
4. **Process Response**: Stores optimized routes in database
5. **Update Assignments**: Creates delivery queue entries with route sequences

### Error Handling

The Model API includes comprehensive error handling:
- **Validation Errors**: Invalid coordinates, time formats, or missing data
- **Algorithm Failures**: Automatic fallback to simpler VRP
- **Network Issues**: Graceful degradation and error reporting
- **Data Storage**: All requests logged to CSV for analysis


## Development

### Running Tests
```bash
npm run test
```

### Database Operations
```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

---
