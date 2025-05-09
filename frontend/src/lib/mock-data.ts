import { Parcel, Driver } from "./types";

// Mock parcels data
export const mockParcels: Parcel[] = [
  {
    id: "PRC-2345",
    type: "Standard",
    pickupAddress: "123 Main St, New York, NY 10001",
    deliveryAddress: "456 Park Ave, New York, NY 10022",
    status: "waiting",
  },
  {
    id: "PRC-6789",
    type: "Express",
    pickupAddress: "789 Broadway, New York, NY 10003",
    deliveryAddress: "321 5th Ave, New York, NY 10016",
    status: "on-route",
  },
  {
    id: "PRC-1357",
    type: "Heavy",
    pickupAddress: "555 Madison Ave, New York, NY 10022",
    deliveryAddress: "777 Lexington Ave, New York, NY 10021",
    status: "on-route",
  },
  {
    id: "PRC-2468",
    type: "Express",
    pickupAddress: "888 6th Ave, New York, NY 10001",
    deliveryAddress: "999 7th Ave, New York, NY 10019",
    status: "canceled",
  },
  {
    id: "PRC-9876",
    type: "Standard",
    pickupAddress: "111 East 72nd St, New York, NY 10021",
    deliveryAddress: "222 West 45th St, New York, NY 10036",
    status: "waiting",
  },
  {
    id: "PRC-5432",
    type: "Fragile",
    pickupAddress: "333 Canal St, New York, NY 10013",
    deliveryAddress: "444 Spring St, New York, NY 10013",
    status: "on-route",
  },
  {
    id: "PRC-8765",
    type: "Heavy",
    pickupAddress: "555 Water St, New York, NY 10002",
    deliveryAddress: "666 Pearl St, New York, NY 10004",
    status: "waiting",
  },
  {
    id: "PRC-4321",
    type: "Express",
    pickupAddress: "777 Fulton St, Brooklyn, NY 11217",
    deliveryAddress: "888 Atlantic Ave, Brooklyn, NY 11238",
    status: "canceled",
  },
];

// Mock drivers data
export const mockDrivers : Driver[] = [
  {
    id: "d1",
    name: "Keerthan Kumar C",
    status: "active",
    location: { lat: 13.346573, lng: 74.794143 },
    vehicle: "van",
    currentDelivery: "P-4398",
    avatar: "/placeholder.svg",
    rating: 4.8,
    deliveriesCompleted: 342,
    phone: "+1 (555) 123-4567",
  },
  {
    id: "d2",
    name: "Shriya Bhat",
    status: "active",
    location: { lat: 13.369604, lng: 74.805201 },
    vehicle: "truck",
    currentDelivery: "P-8721",
    avatar: "/placeholder.svg",
    rating: 4.9,
    deliveriesCompleted: 512,
    phone: "+1 (555) 234-5678",
  },
  {
    id: "d3",
    name: "Bhanu Shashank",
    status: "inactive",
    location: { lat: 13.301463, lng: 74.735969 },
    vehicle: "car",
    currentDelivery: null,
    avatar: "/placeholder.svg",
    rating: 4.6,
    deliveriesCompleted: 198,
    phone: "+1 (555) 345-6789",
  },
  {
    id: "d4",
    name: "Santhosh",
    status: "break",
    location: { lat: 13.549314, lng: 74.702506 },
    vehicle: "minivan",
    currentDelivery: "P-2341",
    avatar: "/placeholder.svg",
    rating: 4.7,
    deliveriesCompleted: 287,
    phone: "+1 (555) 456-7890",
  },
];
