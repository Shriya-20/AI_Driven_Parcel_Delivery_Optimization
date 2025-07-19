# Parcel Delivery Optimization using Reinforcement Learning Algorithms

## Project Overview

This project optimizes parcel delivery routes using Reinforcement Learning (RL) Algorithms. The goal is to provide an efficient and realistic solution for managing parcel deliveries, incorporating real-world factors like road networks, traffic conditions, and package characteristics. The system includes an admin dashboard for route optimization and assignment, and a driver interface for managing deliveries.

## Project Layout

![Architecture](./basic_diagram_svg.svg)
![ER Diagram](./ERdiagram.svg)
## Features

### Admin Dashboard (Frontend)
*   Assign deliveries to drivers.
*   Manage carriers (add, view, edit).
*   Manage customers (add, view, edit).
*   View overall dashboard with key metrics.
*   User authentication (login, registration).
*   Optimize delivery routes (likely triggers backend optimization).
*   Manage orders (create, view, update status).
*   View planned routes on a map.
*   Configure application settings.
*   Manage delivery time slots for customers.
*   Live track delivery vehicles on a map.

### Driver Mobile App (driver_frontend)
*   Driver account management (profile, settings).
*   View and manage active deliveries.
*   Detailed view of individual deliveries (customer info, address, time window).
*   Mark deliveries as completed or failed.
*   View assigned route on a map.
*   Navigate to delivery locations (likely integrates with a map app).
*   Dashboard/Home screen with summary information.

### Backend API
*   Handles user authentication and authorization.
*   Manages customer data.
*   Provides data for the admin dashboard.
*   Manages delivery lifecycle (creation, assignment, status updates).
*   Manages driver data and assignments.
*   Sends email notifications (e.g., order confirmation, delivery updates).
*   Manages and serves optimized routes.
*   Live location tracking updates from drivers.

### Reinforcement Learning Route Optimization (RL_gym_environment)
*   Custom OpenAI Gym environment (`UdupiDeliveryEnv`) for simulating deliveries in Udupi.
*   Utilizes real-world road network data (from `data/udupi.graphml`) and delivery details (`data/deliveries.csv`).
*   Agent learns to optimize routes based on:
    *   Current location and time.
    *   Time left in the delivery day (8 AM to 8 PM).
    *   Urgency of nearest delivery deadline.
    *   Number of remaining deliveries.
    *   Delivery time windows.
*   Reward function encourages:
    *   On-time deliveries.
    *   Minimizing travel time and distance.
    *   Prioritizing urgent deliveries.
    *   Completing all deliveries.
    *   Finishing the day early.
*   Tracks metrics: on-time deliveries, off-time deliveries, total distance.

### Google OR-Tools Route Optimization (google_or_tools)
*   Solves Vehicle Routing Problems (VRP).
*   **Single Vehicle Optimization API:**
    *   Provides an API endpoint for optimizing routes for a single vehicle.
    *   Visualizes initial and optimized routes on HTML maps.
*   **Multi-Vehicle Optimization with Time Windows (VRPTW):**
    *   Optimizes routes for multiple vehicles considering delivery time windows.
    *   Provides an API endpoint for multi-vehicle optimization.
    *   Uses CSV files for delivery requests and vehicle details.
    *   Generates HTML reports with optimized multi-vehicle routes.
*   **ML-Enhanced Travel Time:** The main README mentions an "ML Layer to modify the matrix based on several features like day of week, month, is_weekend, is_rush_hour, is_night, temperature, humidity, weather_condition, wind_speed, visibility, package_weight, etc." This is likely used in conjunction with OR-Tools to provide more accurate travel time estimations.

## Technologies Used

-   **Backend:** [Specify backend technologies from backend/Readme.md if available, otherwise generalize]
-   **Frontend (Admin):** [Specify frontend technologies if available, otherwise generalize e.g., React, Next.js]
-   **Frontend (Driver):** Expo
-   **Machine Learning:** Python, Reinforcement Learning Libraries (e.g., TensorFlow, PyTorch), Google OR-Tools
-   **Database:** [Specify database if information is available]
-   **APIs:** OpenStreetMap API

## Project Structure

```
.
├── backend/                # Main backend API for the application
├── driver_frontend/        # Expo app for drivers
├── frontend/               # Frontend for the Admin point of view
├── models/                 # Contains the different optimization models
│   ├── deep_q_learning/
│   └── google_or_tools_ml/
└── README.md               # This file
```

*(Note: This is a simplified overview. More detailed structure can be added as the project evolves.)*

## Setup and Installation

### Backend

(Instructions for setting up the backend will be added here based on `backend/Readme.md` or further information.)

### Frontend (Admin)

(Instructions for setting up the admin frontend will be added here based on `frontend/README.md` or further information.)

### Driver Frontend (Expo App)

1.  **Install dependencies:**
    ```bash
    cd driver_frontend
    npm install
    ```
2.  **Start the app:**
    ```bash
    npx expo start
    ```
    This will provide options to open the app in a development build, Android emulator, iOS simulator, or Expo Go.

## Usage

### Admin Interface

1.  Access the Admin Dashboard through its URL.
2.  Use the "Optimize" feature to calculate the optimal delivery sequences for the day's orders.
3.  Assign the generated routes to available drivers via the "Assignment" section.
4.  Monitor ongoing deliveries using the "Tracking" feature.
5.  Manage "Customers" and "Carriers" information.
6.  Review past deliveries in "Order History".

### Driver App

1.  Open the Expo app on your mobile device.
2.  Log in with your driver credentials.
3.  View your assigned deliveries on the dashboard.
4.  Select a delivery to see detailed route information and customer details.
5.  Use the navigation feature to reach the destination.
6.  Mark the delivery status (complete/incomplete) upon arrival.

## Models

The project utilizes different models for route optimization:

### Model 1: Deep Q Learning

Details about the Deep Q Learning model implementation. (Further information to be added)

### Model 2: Google OR-Tools with ML Layer

This model uses Google's OR-Tools for route optimization, enhanced with a Machine Learning layer. This layer modifies the cost matrix based on several features such as:
    -   Day of the week
    -   Month
    -   Is it a weekend?
    -   Is it rush hour?
    -   Is it night time?
    -   Temperature
    -   Humidity
    -   Weather condition
    -   Wind speed
    -   Visibility
    -   Package weight

This allows the model to learn from custom data and adapt to changing conditions.

### Model 3: To be decided

(Details for a third model will be added here if developed.)

## Admin View Images from the Project

![Dashboard](./frontend/public/images/dashboard.png)
![Tracking](./frontend/public/images/tracking.png)
![Assignment](./frontend/public/images/assign.png)
![OrderHistory](./frontend/public/images/order_history.png)
![Customers](./frontend/public/images/customer.png)
![Optimize](./frontend/public/images/optimize.png)
![Carriers](./frontend/public/images/carriers.png)

## Driver View Images from the Project

![Driver Dashboard](./frontend/public/images/driver_app/dashboard.png)
![Active Delivery 1](./frontend/public/images/driver_app/active1.png)
![Active Delivery 2](./frontend/public/images/driver_app/active2.png)
![Driver Route](./frontend/public/images/driver_app/route.png)
![Driver Navigation](./frontend/public/images/driver_app/navigation.png)
![Driver Profile](./frontend/public/images/driver_app/profile.png)

## Contributing

We welcome contributions to improve and expand this project. If you have new features, bug fixes, or improvements, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Make your changes, ensuring clear comments and documentation.
4.  Add relevant tests if applicable.
5.  Submit a pull request for review.

(More specific contribution guidelines can be added, e.g., coding standards, testing procedures.)

## License

This project is released under the [Specify License - e.g., MIT License]. (To be confirmed and updated)

(If a `LICENSE` file exists, refer to it. Otherwise, a standard license like MIT is common for open-source projects.)
