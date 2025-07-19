"use client";
import { useState, useCallback, useEffect } from "react";
import {
  // Search,
  Filter,
  // Download,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderHistory } from "@/lib/clientSideDataServices";
import { Customer, DriverWithRelations, OrderData } from "@/lib/types";
import CompletedOrders from "./completedOrders";
import OngoingOrders from "./ongoingOrders";
import PendingOrders from "./pendingOrders";

export function Orders() {
  const [completedOrders, setCompletedOrders] = useState<OrderData[]>([]);
  const [ongoingOrders, setOngoingOrders] = useState<OrderData[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderData[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);
  const [totalOngoing, setTotalOngoing] = useState<number>(0);
  const [totalPending, setTotalPending] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  // const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedDriver, setSelectedDriver] =
    useState<DriverWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getOrderHistory();

      setCompletedOrders(result.completed);
      setOngoingOrders(result.ongoing);
      setPendingOrders(result.pending);
      setTotalCompleted(result.summary.total_completed);
      setTotalOngoing(result.summary.total_ongoing);
      setTotalPending(result.summary.total_pending);
      setTotalOrders(result.summary.total_orders);
    } catch (err) {
      console.error("Error fetching order history:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Orders
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchOrderHistory}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">
            View and manage all orders across all statuses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("ongoing")}>
                Ongoing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <Button variant="outline" disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : totalOrders}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Skeleton className="h-8 w-16" /> : totalCompleted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? <Skeleton className="h-8 w-16" /> : totalOngoing}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {loading ? <Skeleton className="h-8 w-16" /> : totalPending}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tables */}
      <div className="space-y-6">
        {/* Ongoing Orders */}
        {(statusFilter === "ongoing" || statusFilter === "all") && (
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                Ongoing Orders
                <Badge variant="secondary" className="ml-2">
                  {totalOngoing}
                </Badge>
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <OngoingOrders
                ongoingOrders={ongoingOrders}
                loading={loading}
                setSelectedCustomer={setSelectedCustomer}
                setSelectedDriver={setSelectedDriver}
              />
            </div>
          </div>
        )}
        {/* Pending Orders */}
        {(statusFilter === "pending" || statusFilter === "all") && (
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                Pending Orders
                <Badge variant="secondary" className="ml-2">
                  {totalPending}
                </Badge>
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <PendingOrders
                pendingOrders={pendingOrders}
                loading={loading}
                setSelectedCustomer={setSelectedCustomer}
                setSelectedDriver={setSelectedDriver}
              />
            </div>
          </div>
        )}
        {/* Completed Orders */}
        {(statusFilter === "completed" || statusFilter === "all") && (
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Completed Orders
                <Badge variant="secondary" className="ml-2">
                  {totalCompleted}
                </Badge>
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <CompletedOrders
                completedOrders={completedOrders}
                loading={loading}
                setSelectedCustomer={setSelectedCustomer}
                setSelectedDriver={setSelectedDriver}
              />
            </div>
          </div>
        )}
      </div>

      {/* No Orders Message */}
      {/* Customer Dialog */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Info</DialogTitle>
            <DialogDescription>
              Details of the selected customer
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {selectedCustomer.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {selectedCustomer.phone_number}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {selectedCustomer.address || "No address provided"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Dialog */}
      <Dialog
        open={!!selectedDriver}
        onOpenChange={() => setSelectedDriver(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Driver Info</DialogTitle>
            <DialogDescription>
              Details of the selected driver
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {selectedDriver.first_name} {selectedDriver.last_name}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {selectedDriver.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {selectedDriver.phone_number}
              </div>
              <div>
                <p className="font-medium">Vehicles:</p>
                {selectedDriver.vehicles.map((v, idx) => (
                  <div key={idx} className="ml-4 text-muted-foreground">
                    {v.year} {v.company} {v.model} ({v.license_plate})
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
