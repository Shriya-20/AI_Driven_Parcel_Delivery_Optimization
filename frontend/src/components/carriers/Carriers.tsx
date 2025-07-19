"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
// import {Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllDrivers } from "@/lib/types";
import { getDriversData } from "@/lib/fetchDataService";
import { toast } from "sonner";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import AddDriverDialog from "./AddDriverDialog";

export function Carriers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [driversData, setDriversData] = useState<getAllDrivers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<getAllDrivers | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      const drivers = await getDriversData();
      setDriversData(drivers);
      if (drivers.length === 0) toast.info("No drivers found");
      else toast.success(`Loaded ${drivers.length} drivers`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch drivers";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const filteredDrivers = driversData.filter((d) =>
    d.first_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carriers</h1>
          <p className="text-muted-foreground">
            Manage your drivers and vehicles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search carriers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Filter by availability</DropdownMenuItem>
              <DropdownMenuItem>Filter by vehicle type</DropdownMenuItem>
              <DropdownMenuItem>Filter by rating</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="icon" className="w-fit px-2 hover:bg-primary/90 cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog> */}
          <AddDriverDialog/>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Drivers</TabsTrigger>
          {/* <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="busy">Busy</TabsTrigger> */}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DriverGrid
            drivers={filteredDrivers}
            isLoading={isLoading}
            onProfileClick={setSelectedDriver}
          />
        </TabsContent>
        {/* <TabsContent value="available" className="mt-6">
          <DriverGrid
            drivers={filteredDrivers.filter((d) => d.status === "active")}
            isLoading={isLoading}
            onProfileClick={setSelectedDriver}
          />
        </TabsContent>
        <TabsContent value="busy" className="mt-6">
          <DriverGrid
            drivers={filteredDrivers.filter((d) => d.status === "inactive")}
            isLoading={isLoading}
            onProfileClick={setSelectedDriver}
          />
        </TabsContent> */}
      </Tabs>

      <Dialog
        open={!!selectedDriver}
        onOpenChange={() => setSelectedDriver(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Driver Profile</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <Image
                  // src={selectedDriver.avatar}
                  src="./placeholder.svg"
                  alt={
                    selectedDriver.first_name + " " + selectedDriver.last_name
                  }
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedDriver.first_name} {selectedDriver.last_name}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedDriver.vehicles[0].type} -{" "}
                    {selectedDriver.vehicles[0].model}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p>{selectedDriver.phone_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p>{selectedDriver.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">License Plate</p>
                  <p>CDL-{selectedDriver.vehicles[0].license_plate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <p>{selectedDriver.rating}/5</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p>{selectedDriver.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Location</p>
                  <p>{selectedDriver.start_location}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DriverGrid({
  drivers,
  isLoading,
  onProfileClick,
}: {
  drivers: getAllDrivers[];
  isLoading: boolean;
  onProfileClick: (driver: getAllDrivers) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading
        ? Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
        : drivers.map((driver) => (
            <DriverCard
              key={driver.driver_id}
              driver={driver}
              onProfileClick={() => onProfileClick(driver)}
            />
          ))}
    </div>
  );
}

function DriverCard({
  driver,
  onProfileClick,
}: {
  driver: getAllDrivers;
  onProfileClick: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image
              // src={driver.avatar}
              src="./placeholder.svg"
              alt={driver.first_name + " " + driver.last_name}
              className="h-12 w-12 rounded-full object-cover"
              width={48}
              height={48}
            />
            <div>
              <h3 className="font-medium">{driver.first_name} {driver.last_name}</h3>
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(driver.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {driver.rating} of 5
                </span>
              </div>
            </div>
          </div>
          {/* <span
            className={`text-xs px-2 py-1 rounded-full ${
              driver.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {driver.status === "active" ? "Available" : "Busy"}
          </span> */}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-muted-foreground">Vehicle Type</p>
            <p className="font-medium capitalize">{driver.vehicles[0].type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vehicle Model</p>
            <p className="font-medium capitalize">
              {driver.vehicles[0].model}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">License Plate</p>
            <p className="font-medium">CDL-{driver.vehicles[0].license_plate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Completed Deliveries</p>
            <p className="font-medium">
              {driver.completed_deliveries || 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Join Date</p>
            <p className="font-medium">
              {new Date(
                Date.now() - Math.floor(Math.random() * 10000000000)
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onProfileClick}
          >
            Profile
          </Button>
          <Button size="sm" className="flex-1">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
