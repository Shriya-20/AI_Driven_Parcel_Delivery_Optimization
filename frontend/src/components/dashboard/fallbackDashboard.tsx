import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Truck,
  Package,
  Clock,
  Users,
  Star,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Mock data based on your schema structure
const mockData = {
  stats: {
    activeDeliveries: 6,
    pendingDeliveries: 3,
    onRouteDeliveries: 3,
    canceledDeliveries: 2,
    availableDrivers: 12,
    todayCompleted: 28,
  },
  dailyDeliveries: [
    { day: "Mon", completed: 65, failed: 8 },
    { day: "Tue", completed: 59, failed: 12 },
    { day: "Wed", completed: 80, failed: 6 },
    { day: "Thu", completed: 81, failed: 9 },
    { day: "Fri", completed: 56, failed: 15 },
    { day: "Sat", completed: 55, failed: 11 },
    { day: "Sun", completed: 40, failed: 7 },
  ],
  deliveryStatus: [
    { name: "Completed", value: 156, color: "#10B981" },
    { name: "In Progress", value: 6, color: "#3B82F6" },
    { name: "Pending", value: 3, color: "#F59E0B" },
    { name: "Canceled", value: 2, color: "#EF4444" },
  ],
  topDrivers: [
    { name: "John Smith", deliveries: 42, rating: 4.8, status: "active" },
    { name: "Sarah Johnson", deliveries: 38, rating: 4.9, status: "active" },
    { name: "Mike Wilson", deliveries: 35, rating: 4.7, status: "busy" },
    { name: "Emily Davis", deliveries: 32, rating: 4.6, status: "active" },
    { name: "David Brown", deliveries: 29, rating: 4.5, status: "offline" },
  ],
  recentActivity: [
    {
      id: 1,
      type: "delivery",
      message: "Parcel #814726 out for delivery",
      driver: "John Smith",
      time: "15 minutes ago",
      status: "in_progress",
    },
    {
      id: 2,
      type: "assignment",
      message: "Driver Max Roberts assigned to parcel #358536",
      time: "42 minutes ago",
      status: "assigned",
    },
    {
      id: 3,
      type: "cancel",
      message: "Parcel #369485 canceled by customer",
      time: "1 hour ago",
      status: "canceled",
    },
    {
      id: 4,
      type: "new",
      message: "New parcel #354337 created",
      time: "2 hours ago",
      status: "created",
    },
    {
      id: 5,
      type: "completed",
      message: "Parcel #123456 delivered successfully",
      time: "3 hours ago",
      status: "completed",
    },
  ],
  peakHours: [
    { hour: "6 AM", deliveries: 5 },
    { hour: "8 AM", deliveries: 15 },
    { hour: "10 AM", deliveries: 28 },
    { hour: "12 PM", deliveries: 35 },
    { hour: "2 PM", deliveries: 42 },
    { hour: "4 PM", deliveries: 38 },
    { hour: "6 PM", deliveries: 25 },
    { hour: "8 PM", deliveries: 12 },
  ],
  vehicleTypes: [
    { type: "Motorcycle", count: 8, active: 6 },
    { type: "Sedan", count: 5, active: 4 },
    { type: "Van", count: 3, active: 2 },
    { type: "Truck", count: 2, active: 1 },
  ],
};

function StatCard({ title, value, change, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p
              className={`text-sm mt-2 ${
                change.includes("+") ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const getIcon = (type) => {
    switch (type) {
      case "delivery":
        return <Truck className="text-blue-500" size={16} />;
      case "assignment":
        return <Users className="text-green-500" size={16} />;
      case "cancel":
        return <AlertCircle className="text-red-500" size={16} />;
      case "new":
        return <Package className="text-purple-500" size={16} />;
      case "completed":
        return <Star className="text-yellow-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "created":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0">{getIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
          activity.status
        )}`}
      >
        {activity.status.replace("_", " ")}
      </span>
    </div>
  );
}

function DriverRow({ driver }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {driver.name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{driver.deliveries}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <div className="flex items-center">
          <Star className="text-yellow-400 mr-1" size={14} />
          {driver.rating}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            driver.status
          )}`}
        >
          {driver.status}
        </span>
      </td>
    </tr>
  );
}

export default function DeliveryDashboard() {
  // const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const { admin } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome {admin?.first_name || "Admin"} {admin?.last_name || ""}!
            </h1>
            <h1 className="text-xl font-bold text-gray-900">
              Delivery Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of your delivery operations
            </p>
          </div>
          {/* <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
              Refresh Data
            </button>
          </div> */}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Deliveries"
            value={mockData.stats.activeDeliveries}
            change="+2% from last month"
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={mockData.stats.pendingDeliveries}
            change="-5% from last month"
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="On Route"
            value={mockData.stats.onRouteDeliveries}
            change="+12% from last month"
            icon={Truck}
            color="green"
          />
          <StatCard
            title="Available Drivers"
            value={mockData.stats.availableDrivers}
            change="+3 from yesterday"
            icon={Users}
            color="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Performance Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Delivery Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.dailyDeliveries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Delivery Status Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.deliveryStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {mockData.deliveryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Peak Delivery Hours
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockData.peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="deliveries"
                stroke="#3B82F6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row - Tables and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Drivers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Drivers
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deliveries
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockData.topDrivers.map((driver, index) => (
                    <DriverRow key={index} driver={driver} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-1">
              {mockData.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Fleet Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fleet Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockData.vehicleTypes.map((vehicle, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {vehicle.type}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {vehicle.active}/{vehicle.count}
                    </p>
                    <p className="text-xs text-gray-500">Active/Total</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="text-blue-600" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
