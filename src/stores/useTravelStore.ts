import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TravelProductCategory,
  TravelSearchQuery,
  FlightSearchQuery,
  HotelSearchQuery,
  CarRentalSearchQuery,
  TravelTripSchedule,
  FlightSchedule,
  HotelListing,
  CarRentalListing,
} from '@/types/travel';

interface TravelStoreState {
  activeTab: TravelProductCategory;
  
  // Search queries per product
  busQuery: TravelSearchQuery;
  flightQuery: FlightSearchQuery;
  hotelQuery: HotelSearchQuery;
  carRentalQuery: CarRentalSearchQuery;

  // Search execution flags per product
  hasSearched: Record<TravelProductCategory, boolean>;

  // Public listings (Zero fake data; purely from published sources in future)
  registeredTrips: TravelTripSchedule[];
  registeredFlights: FlightSchedule[];
  registeredHotels: HotelListing[];
  registeredCars: CarRentalListing[];

  // Actions
  setActiveTab: (tab: TravelProductCategory) => void;
  setBusQuery: (query: Partial<TravelSearchQuery>) => void;
  setFlightQuery: (query: Partial<FlightSearchQuery>) => void;
  setHotelQuery: (query: Partial<HotelSearchQuery>) => void;
  setCarRentalQuery: (query: Partial<CarRentalSearchQuery>) => void;
  
  swapBusLocations: () => void;
  swapFlightAirports: () => void;
  
  executeSearch: (product?: TravelProductCategory) => void;
  clearSearch: (product?: TravelProductCategory) => void;

  // Legacy compat aliases
  searchQuery: TravelSearchQuery;
  setSearchQuery: (query: Partial<TravelSearchQuery>) => void;
  swapLocations: () => void;
}

const DEFAULT_BUS_QUERY: TravelSearchQuery = {
  fromLocation: '',
  toLocation: '',
  departureDate: '',
  passengerCount: 1,
  tripType: 'one_way',
};

const DEFAULT_FLIGHT_QUERY: FlightSearchQuery = {
  fromAirport: '',
  toAirport: '',
  departureDate: '',
  passengerCount: 1,
  tripType: 'one_way',
  cabinClass: 'economy',
};

const DEFAULT_HOTEL_QUERY: HotelSearchQuery = {
  location: '',
  checkInDate: '',
  checkOutDate: '',
  guestCount: 2,
  roomCount: 1,
};

const DEFAULT_CAR_QUERY: CarRentalSearchQuery = {
  pickupLocation: '',
  pickupDate: '',
  pickupTime: '10:00',
  dropoffLocation: '',
  dropoffDate: '',
  dropoffTime: '10:00',
  differentDropoffLocation: false,
  driverAgeCategory: '25+',
};

export const useTravelStore = create<TravelStoreState>()(
  persist(
    (set, get) => ({
      activeTab: 'bus',
      busQuery: DEFAULT_BUS_QUERY,
      flightQuery: DEFAULT_FLIGHT_QUERY,
      hotelQuery: DEFAULT_HOTEL_QUERY,
      carRentalQuery: DEFAULT_CAR_QUERY,

      hasSearched: {
        bus: false,
        flight: false,
        hotel: false,
        car_rental: false,
      },

      registeredTrips: [],
      registeredFlights: [],
      registeredHotels: [],
      registeredCars: [],

      // Legacy searchQuery mirror
      searchQuery: DEFAULT_BUS_QUERY,

      setActiveTab: (activeTab) => set({ activeTab }),

      setBusQuery: (updated) =>
        set((state) => {
          const newBus = { ...state.busQuery, ...updated };
          return {
            busQuery: newBus,
            searchQuery: newBus,
          };
        }),

      setFlightQuery: (updated) =>
        set((state) => ({
          flightQuery: { ...state.flightQuery, ...updated },
        })),

      setHotelQuery: (updated) =>
        set((state) => ({
          hotelQuery: { ...state.hotelQuery, ...updated },
        })),

      setCarRentalQuery: (updated) =>
        set((state) => ({
          carRentalQuery: { ...state.carRentalQuery, ...updated },
        })),

      swapBusLocations: () =>
        set((state) => {
          const swapped = {
            ...state.busQuery,
            fromLocation: state.busQuery.toLocation,
            toLocation: state.busQuery.fromLocation,
          };
          return {
            busQuery: swapped,
            searchQuery: swapped,
          };
        }),

      swapFlightAirports: () =>
        set((state) => ({
          flightQuery: {
            ...state.flightQuery,
            fromAirport: state.flightQuery.toAirport,
            toAirport: state.flightQuery.fromAirport,
          },
        })),

      executeSearch: (product) => {
        const target = product || get().activeTab;
        set((state) => ({
          hasSearched: {
            ...state.hasSearched,
            [target]: true,
          },
        }));
      },

      clearSearch: (product) => {
        const target = product || get().activeTab;
        set((state) => ({
          hasSearched: {
            ...state.hasSearched,
            [target]: false,
          },
        }));
      },

      // Legacy aliases
      setSearchQuery: (updated) => get().setBusQuery(updated),
      swapLocations: () => get().swapBusLocations(),
    }),
    {
      name: 'lifeos-travel-hub',
    }
  )
);

