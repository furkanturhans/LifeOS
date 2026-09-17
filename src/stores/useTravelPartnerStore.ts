import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TravelProductCategory,
  TravelPartnerStatus,
  PartnerAuthorizedRole,
  // 1. Bus
  TravelCompanyProfile,
  TravelDraftVehicle,
  TravelDraftRoute,
  TravelDraftTrip,
  TravelSeatPlanTemplate,
  // 2. Flight
  FlightPartnerProfile,
  FlightDraftAircraft,
  FlightDraftAirport,
  FlightDraftRoute,
  FlightDraftFlight,
  FlightSeatPlanTemplate,
  // 3. Hotel
  HotelPartnerProfile,
  HotelDraftProperty,
  HotelDraftRoomType,
  HotelDraftRoom,
  HotelDraftRatePlan,
  HotelDraftAvailability,
  // 4. Car Rental
  CarRentalPartnerProfile,
  CarRentalDraftBranch,
  CarRentalDraftVehicleClass,
  CarRentalDraftVehicle,
  CarRentalDraftRatePlan,
  CarRentalDraftAvailability,
} from '@/types/travelPartner';

interface TravelPartnerStoreState {
  // Active selected panel product
  activePartnerProduct: TravelProductCategory;
  setActivePartnerProduct: (product: TravelProductCategory) => void;

  // Independent Partner Statuses per product
  statusByProduct: Record<TravelProductCategory, TravelPartnerStatus>;

  // Independent Partner Profiles per product
  busProfile: TravelCompanyProfile | null;
  flightProfile: FlightPartnerProfile | null;
  hotelProfile: HotelPartnerProfile | null;
  carRentalProfile: CarRentalPartnerProfile | null;

  // 1. Bus Drafts
  vehicles: TravelDraftVehicle[];
  routes: TravelDraftRoute[];
  draftTrips: TravelDraftTrip[];
  seatPlanTemplates: TravelSeatPlanTemplate[];

  // 2. Flight Drafts
  aircrafts: FlightDraftAircraft[];
  airports: FlightDraftAirport[];
  flightRoutes: FlightDraftRoute[];
  draftFlights: FlightDraftFlight[];
  flightSeatPlans: FlightSeatPlanTemplate[];

  // 3. Hotel Drafts
  properties: HotelDraftProperty[];
  roomTypes: HotelDraftRoomType[];
  rooms: HotelDraftRoom[];
  ratePlans: HotelDraftRatePlan[];
  hotelAvailabilities: HotelDraftAvailability[];

  // 4. Car Rental Drafts
  branches: CarRentalDraftBranch[];
  vehicleClasses: CarRentalDraftVehicleClass[];
  fleetVehicles: CarRentalDraftVehicle[];
  carRatePlans: CarRentalDraftRatePlan[];
  carAvailabilities: CarRentalDraftAvailability[];

  // Applications
  applyForBusPartnership: (data: {
    companyName: string;
    authorizedPersonName: string;
    authorizedRole: PartnerAuthorizedRole;
    d2LicenseNumber?: string;
    taxNumber?: string;
    contactEmail?: string;
  }) => void;

  applyForFlightPartnership: (data: {
    companyName: string;
    authorizedPersonName: string;
    authorizedRole: PartnerAuthorizedRole;
    shgmLicenseNumber?: string;
    iataCode?: string;
    icaoCode?: string;
    taxNumber?: string;
    contactEmail?: string;
  }) => void;

  applyForHotelPartnership: (data: {
    companyName: string;
    propertyName: string;
    authorizedPersonName: string;
    authorizedRole: PartnerAuthorizedRole;
    tourismLicenseNumber?: string;
    propertyType: 'hotel' | 'resort' | 'boutique' | 'apartment' | 'pension';
    starRating: number;
    city: string;
    district: string;
    taxNumber?: string;
    contactEmail?: string;
  }) => void;

  applyForCarRentalPartnership: (data: {
    companyName: string;
    authorizedPersonName: string;
    authorizedRole: PartnerAuthorizedRole;
    kabisNumber?: string;
    fleetSize?: number;
    taxNumber?: string;
    contactEmail?: string;
  }) => void;

  approveDemoPartnership: (product?: TravelProductCategory) => void;
  resetPartnerProfile: (product?: TravelProductCategory) => void;

  // 1. Bus CRUD
  addDraftVehicle: (data: {
    vehicleCode: string;
    plateNumber: string;
    vehicleType: '2+1_comfort' | '2+2_standard' | 'vip_minibus';
    seatCapacity: number;
    features: string[];
  }) => TravelDraftVehicle;
  deleteDraftVehicle: (vehicleId: string) => void;

  addDraftRoute: (data: {
    originCity: string;
    originTerminal: string;
    destinationCity: string;
    destinationTerminal: string;
    intermediateStops?: string[];
    estimatedDurationHours: number;
  }) => TravelDraftRoute;
  deleteDraftRoute: (routeId: string) => void;

  addDraftTrip: (data: {
    routeId: string;
    vehicleId: string;
    departureDateTime: string;
    baseTicketPrice: number;
    notes?: string;
  }) => TravelDraftTrip;
  deleteDraftTrip: (tripId: string) => void;

  // 2. Flight CRUD
  addDraftAircraft: (data: {
    tailNumber: string;
    model: string;
    totalSeats: number;
    economySeats: number;
    businessSeats: number;
    features: string[];
  }) => FlightDraftAircraft;
  deleteDraftAircraft: (id: string) => void;

  addDraftAirport: (data: {
    name: string;
    city: string;
    iataCode: string;
    country: string;
  }) => FlightDraftAirport;

  addDraftFlightRoute: (data: {
    originAirportCode: string;
    destinationAirportCode: string;
    flightDurationMinutes: number;
  }) => FlightDraftRoute;
  deleteDraftFlightRoute: (id: string) => void;

  addDraftFlight: (data: {
    flightNumber: string;
    routeId: string;
    aircraftId: string;
    departureDateTime: string;
    arrivalDateTime: string;
    economyBasePrice: number;
    businessBasePrice: number;
  }) => FlightDraftFlight;
  deleteDraftFlight: (id: string) => void;

  // 3. Hotel CRUD
  addDraftProperty: (data: {
    name: string;
    propertyType: 'hotel' | 'resort' | 'boutique' | 'apartment' | 'pension';
    starRating: number;
    city: string;
    district: string;
    address: string;
    amenities: string[];
    checkInTime?: string;
    checkOutTime?: string;
  }) => HotelDraftProperty;
  deleteDraftProperty: (id: string) => void;

  addDraftRoomType: (data: {
    propertyId: string;
    title: string;
    bedConfig: string;
    maxGuests: number;
    sizeSqMeters: number;
    amenities: string[];
  }) => HotelDraftRoomType;
  deleteDraftRoomType: (id: string) => void;

  addDraftRoom: (data: {
    propertyId: string;
    roomTypeId: string;
    roomNumber: string;
    floor: number;
  }) => HotelDraftRoom;
  deleteDraftRoom: (id: string) => void;

  addDraftRatePlan: (data: {
    propertyId: string;
    roomTypeId: string;
    planName: string;
    mealBoard: 'room_only' | 'bed_and_breakfast' | 'half_board' | 'all_inclusive';
    basePricePerNight: number;
    cancellationPolicy: 'free_cancellation' | 'non_refundable';
  }) => HotelDraftRatePlan;
  deleteDraftRatePlan: (id: string) => void;

  // 4. Car Rental CRUD
  addDraftBranch: (data: {
    name: string;
    city: string;
    district: string;
    address: string;
    phone: string;
    isAirportBranch: boolean;
  }) => CarRentalDraftBranch;
  deleteDraftBranch: (id: string) => void;

  addDraftVehicleClass: (data: {
    classCode: 'economy' | 'compact' | 'suv' | 'luxury' | 'van';
    className: string;
    transmission: 'manual' | 'automatic';
    fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
    seatCapacity: number;
    minDriverAge: number;
    minDrivingLicenseYears: number;
  }) => CarRentalDraftVehicleClass;
  deleteDraftVehicleClass: (id: string) => void;

  addDraftFleetVehicle: (data: {
    branchId: string;
    classId: string;
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    mileage: number;
  }) => CarRentalDraftVehicle;
  deleteDraftFleetVehicle: (id: string) => void;

  addDraftCarRatePlan: (data: {
    classId: string;
    planName: string;
    dailyRate: number;
    weeklyDiscountPercent?: number;
    depositAmount?: number;
    mileageLimitPerDay?: number;
  }) => CarRentalDraftRatePlan;
  deleteDraftCarRatePlan: (id: string) => void;

  // Backward compatibility helpers
  status: TravelPartnerStatus;
  partnerProfile: TravelCompanyProfile | null;
  applyForPartnership: (data: any) => void;
  getMyVehicles: () => TravelDraftVehicle[];
  getMyRoutes: () => TravelDraftRoute[];
  getMyDraftTrips: () => TravelDraftTrip[];
}

function generateUniqueId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${ts}-${rand}`;
}

export const useTravelPartnerStore = create<TravelPartnerStoreState>()(
  persist(
    (set, get) => ({
      activePartnerProduct: 'bus',
      setActivePartnerProduct: (product) => set({ activePartnerProduct: product }),

      statusByProduct: {
        bus: 'partner_guest',
        flight: 'partner_guest',
        hotel: 'partner_guest',
        car_rental: 'partner_guest',
      },

      busProfile: null,
      flightProfile: null,
      hotelProfile: null,
      carRentalProfile: null,

      // Bus Drafts
      vehicles: [],
      routes: [],
      draftTrips: [],
      seatPlanTemplates: [],

      // Flight Drafts
      aircrafts: [],
      airports: [
        { id: 'apt-1', name: 'İstanbul Havalimanı', city: 'İstanbul', iataCode: 'IST', country: 'Türkiye', createdAt: new Date().toISOString() },
        { id: 'apt-2', name: 'Sabiha Gökçen Havalimanı', city: 'İstanbul', iataCode: 'SAW', country: 'Türkiye', createdAt: new Date().toISOString() },
        { id: 'apt-3', name: 'Ankara Esenboğa Havalimanı', city: 'Ankara', iataCode: 'ESB', country: 'Türkiye', createdAt: new Date().toISOString() },
        { id: 'apt-4', name: 'İzmir Adnan Menderes Havalimanı', city: 'İzmir', iataCode: 'ADB', country: 'Türkiye', createdAt: new Date().toISOString() },
        { id: 'apt-5', name: 'Antalya Havalimanı', city: 'Antalya', iataCode: 'AYT', country: 'Türkiye', createdAt: new Date().toISOString() },
      ],
      flightRoutes: [],
      draftFlights: [],
      flightSeatPlans: [],

      // Hotel Drafts
      properties: [],
      roomTypes: [],
      rooms: [],
      ratePlans: [],
      hotelAvailabilities: [],

      // Car Rental Drafts
      branches: [],
      vehicleClasses: [],
      fleetVehicles: [],
      carRatePlans: [],
      carAvailabilities: [],

      // Backward compatibility mirrors
      get status() {
        return get().statusByProduct[get().activePartnerProduct || 'bus'] || 'partner_guest';
      },
      get partnerProfile() {
        return get().busProfile;
      },

      // ---------------------------------------------------------------------
      // APPLICATIONS
      // ---------------------------------------------------------------------
      applyForBusPartnership: (data) => {
        const companyId = generateUniqueId('BUS');
        const newProfile: TravelCompanyProfile = {
          id: companyId,
          userId: 'current_user_me',
          companyName: data.companyName.trim(),
          authorizedPersonName: data.authorizedPersonName.trim(),
          authorizedRole: data.authorizedRole,
          serviceType: 'intercity_bus',
          d2LicenseNumber: data.d2LicenseNumber?.trim() || '',
          taxNumber: data.taxNumber?.trim() || '',
          contactEmail: data.contactEmail?.trim() || '',
          status: 'partner_applicant',
          appliedAt: new Date().toISOString(),
        };

        set((state) => ({
          busProfile: newProfile,
          statusByProduct: {
            ...state.statusByProduct,
            bus: 'partner_applicant',
          },
        }));
      },

      applyForFlightPartnership: (data) => {
        const companyId = generateUniqueId('AIR');
        const newProfile: FlightPartnerProfile = {
          id: companyId,
          userId: 'current_user_me',
          companyName: data.companyName.trim(),
          authorizedPersonName: data.authorizedPersonName.trim(),
          authorizedRole: data.authorizedRole,
          serviceType: 'airline',
          shgmLicenseNumber: data.shgmLicenseNumber?.trim() || '',
          iataCode: data.iataCode?.trim().toUpperCase() || '',
          icaoCode: data.icaoCode?.trim().toUpperCase() || '',
          taxNumber: data.taxNumber?.trim() || '',
          contactEmail: data.contactEmail?.trim() || '',
          status: 'partner_applicant',
          appliedAt: new Date().toISOString(),
        };

        set((state) => ({
          flightProfile: newProfile,
          statusByProduct: {
            ...state.statusByProduct,
            flight: 'partner_applicant',
          },
        }));
      },

      applyForHotelPartnership: (data) => {
        const companyId = generateUniqueId('HTL');
        const newProfile: HotelPartnerProfile = {
          id: companyId,
          userId: 'current_user_me',
          companyName: data.companyName.trim(),
          propertyName: data.propertyName.trim(),
          authorizedPersonName: data.authorizedPersonName.trim(),
          authorizedRole: data.authorizedRole,
          serviceType: 'hotel',
          tourismLicenseNumber: data.tourismLicenseNumber?.trim() || '',
          propertyType: data.propertyType,
          starRating: data.starRating,
          city: data.city.trim(),
          district: data.district.trim(),
          taxNumber: data.taxNumber?.trim() || '',
          contactEmail: data.contactEmail?.trim() || '',
          status: 'partner_applicant',
          appliedAt: new Date().toISOString(),
        };

        set((state) => ({
          hotelProfile: newProfile,
          statusByProduct: {
            ...state.statusByProduct,
            hotel: 'partner_applicant',
          },
        }));
      },

      applyForCarRentalPartnership: (data) => {
        const companyId = generateUniqueId('CAR');
        const newProfile: CarRentalPartnerProfile = {
          id: companyId,
          userId: 'current_user_me',
          companyName: data.companyName.trim(),
          authorizedPersonName: data.authorizedPersonName.trim(),
          authorizedRole: data.authorizedRole,
          serviceType: 'car_rental',
          kabisNumber: data.kabisNumber?.trim() || '',
          fleetSize: data.fleetSize || 0,
          taxNumber: data.taxNumber?.trim() || '',
          contactEmail: data.contactEmail?.trim() || '',
          status: 'partner_applicant',
          appliedAt: new Date().toISOString(),
        };

        set((state) => ({
          carRentalProfile: newProfile,
          statusByProduct: {
            ...state.statusByProduct,
            car_rental: 'partner_applicant',
          },
        }));
      },

      applyForPartnership: (data) => {
        get().applyForBusPartnership(data);
      },

      approveDemoPartnership: (product) => {
        const target = product || get().activePartnerProduct || 'bus';

        if (target === 'bus') {
          const profile = get().busProfile || {
            id: generateUniqueId('BUS'),
            userId: 'current_user_me',
            companyName: 'Öz Life Turizm & Seyahat A.Ş.',
            authorizedPersonName: 'Firma Yetkilisi',
            authorizedRole: 'company_owner',
            serviceType: 'intercity_bus',
            d2LicenseNumber: 'D2.34.19827',
            status: 'partner_verified',
            appliedAt: new Date().toISOString(),
          };
          set((state) => ({
            busProfile: { ...profile, status: 'partner_verified', verifiedAt: new Date().toISOString() },
            statusByProduct: { ...state.statusByProduct, bus: 'partner_verified' },
          }));
        } else if (target === 'flight') {
          const profile = get().flightProfile || {
            id: generateUniqueId('AIR'),
            userId: 'current_user_me',
            companyName: 'LifeAir Havacılık ve Taşımacılık A.Ş.',
            authorizedPersonName: 'Uçuş Operasyon Müdürü',
            authorizedRole: 'operations_manager',
            serviceType: 'airline',
            shgmLicenseNumber: 'SHGM.TR.AOC-092',
            iataCode: 'LF',
            icaoCode: 'LFA',
            status: 'partner_verified',
            appliedAt: new Date().toISOString(),
          };
          set((state) => ({
            flightProfile: { ...profile, status: 'partner_verified', verifiedAt: new Date().toISOString() },
            statusByProduct: { ...state.statusByProduct, flight: 'partner_verified' },
          }));
        } else if (target === 'hotel') {
          const profile = get().hotelProfile || {
            id: generateUniqueId('HTL'),
            userId: 'current_user_me',
            companyName: 'Grand Life Turizm Otelcilik A.Ş.',
            propertyName: 'Grand Life Resort & Spa',
            authorizedPersonName: 'Genel Müdür',
            authorizedRole: 'company_owner',
            serviceType: 'hotel',
            tourismLicenseNumber: 'KTB-TR-2024-88',
            propertyType: 'resort',
            starRating: 5,
            city: 'Antalya',
            district: 'Kemer',
            status: 'partner_verified',
            appliedAt: new Date().toISOString(),
          };
          set((state) => ({
            hotelProfile: { ...profile, status: 'partner_verified', verifiedAt: new Date().toISOString() },
            statusByProduct: { ...state.statusByProduct, hotel: 'partner_verified' },
          }));
        } else if (target === 'car_rental') {
          const profile = get().carRentalProfile || {
            id: generateUniqueId('CAR'),
            userId: 'current_user_me',
            companyName: 'LifeCar Filo ve Araç Kiralama A.Ş.',
            authorizedPersonName: 'Filo Direktörü',
            authorizedRole: 'company_owner',
            serviceType: 'car_rental',
            kabisNumber: 'KABIS-34-2024-419',
            fleetSize: 150,
            status: 'partner_verified',
            appliedAt: new Date().toISOString(),
          };
          set((state) => ({
            carRentalProfile: { ...profile, status: 'partner_verified', verifiedAt: new Date().toISOString() },
            statusByProduct: { ...state.statusByProduct, car_rental: 'partner_verified' },
          }));
        }
      },

      resetPartnerProfile: (product) => {
        const target = product || get().activePartnerProduct || 'bus';
        if (target === 'bus') {
          set((state) => ({
            busProfile: null,
            statusByProduct: { ...state.statusByProduct, bus: 'partner_guest' },
            vehicles: [],
            routes: [],
            draftTrips: [],
          }));
        } else if (target === 'flight') {
          set((state) => ({
            flightProfile: null,
            statusByProduct: { ...state.statusByProduct, flight: 'partner_guest' },
            aircrafts: [],
            flightRoutes: [],
            draftFlights: [],
          }));
        } else if (target === 'hotel') {
          set((state) => ({
            hotelProfile: null,
            statusByProduct: { ...state.statusByProduct, hotel: 'partner_guest' },
            properties: [],
            roomTypes: [],
            rooms: [],
            ratePlans: [],
          }));
        } else if (target === 'car_rental') {
          set((state) => ({
            carRentalProfile: null,
            statusByProduct: { ...state.statusByProduct, car_rental: 'partner_guest' },
            branches: [],
            vehicleClasses: [],
            fleetVehicles: [],
            carRatePlans: [],
          }));
        }
      },

      // ---------------------------------------------------------------------
      // 1. BUS CRUD
      // ---------------------------------------------------------------------
      addDraftVehicle: (data) => {
        const { busProfile, vehicles } = get();
        const companyId = busProfile?.id || 'BUS-default';
        const newVehicle: TravelDraftVehicle = {
          id: generateUniqueId('VHC'),
          companyId,
          vehicleCode: data.vehicleCode.trim(),
          plateNumber: data.plateNumber.trim(),
          vehicleType: data.vehicleType,
          seatCapacity: data.seatCapacity || 38,
          features: data.features || [],
          createdAt: new Date().toISOString(),
        };
        set({ vehicles: [newVehicle, ...vehicles] });
        return newVehicle;
      },

      deleteDraftVehicle: (vehicleId) => {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== vehicleId),
        }));
      },

      addDraftRoute: (data) => {
        const { busProfile, routes } = get();
        const companyId = busProfile?.id || 'BUS-default';
        const newRoute: TravelDraftRoute = {
          id: generateUniqueId('ROT'),
          companyId,
          originCity: data.originCity.trim(),
          originTerminal: data.originTerminal.trim(),
          destinationCity: data.destinationCity.trim(),
          destinationTerminal: data.destinationTerminal.trim(),
          intermediateStops: data.intermediateStops || [],
          estimatedDurationHours: data.estimatedDurationHours || 6,
          createdAt: new Date().toISOString(),
        };
        set({ routes: [newRoute, ...routes] });
        return newRoute;
      },

      deleteDraftRoute: (routeId) => {
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== routeId),
        }));
      },

      addDraftTrip: (data) => {
        const { busProfile, draftTrips } = get();
        const companyId = busProfile?.id || 'BUS-default';
        const newTrip: TravelDraftTrip = {
          id: generateUniqueId('TRP'),
          companyId,
          routeId: data.routeId,
          vehicleId: data.vehicleId,
          departureDateTime: data.departureDateTime,
          baseTicketPrice: data.baseTicketPrice,
          currency: 'TL',
          isDraft: true,
          status: 'draft',
          notes: data.notes?.trim() || '',
          createdAt: new Date().toISOString(),
        };
        set({ draftTrips: [newTrip, ...draftTrips] });
        return newTrip;
      },

      deleteDraftTrip: (tripId) => {
        set((state) => ({
          draftTrips: state.draftTrips.filter((t) => t.id !== tripId),
        }));
      },

      // ---------------------------------------------------------------------
      // 2. FLIGHT CRUD
      // ---------------------------------------------------------------------
      addDraftAircraft: (data) => {
        const { flightProfile, aircrafts } = get();
        const companyId = flightProfile?.id || 'AIR-default';
        const newAircraft: FlightDraftAircraft = {
          id: generateUniqueId('ACF'),
          companyId,
          tailNumber: data.tailNumber.trim(),
          model: data.model.trim(),
          totalSeats: data.totalSeats,
          economySeats: data.economySeats,
          businessSeats: data.businessSeats,
          features: data.features || [],
          createdAt: new Date().toISOString(),
        };
        set({ aircrafts: [newAircraft, ...aircrafts] });
        return newAircraft;
      },

      deleteDraftAircraft: (id) => {
        set((state) => ({
          aircrafts: state.aircrafts.filter((a) => a.id !== id),
        }));
      },

      addDraftAirport: (data) => {
        const newApt: FlightDraftAirport = {
          id: generateUniqueId('APT'),
          name: data.name.trim(),
          city: data.city.trim(),
          iataCode: data.iataCode.trim().toUpperCase(),
          country: data.country.trim(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ airports: [...state.airports, newApt] }));
        return newApt;
      },

      addDraftFlightRoute: (data) => {
        const { flightProfile, flightRoutes } = get();
        const companyId = flightProfile?.id || 'AIR-default';
        const newRoute: FlightDraftRoute = {
          id: generateUniqueId('FL-ROT'),
          companyId,
          originAirportCode: data.originAirportCode.trim().toUpperCase(),
          destinationAirportCode: data.destinationAirportCode.trim().toUpperCase(),
          flightDurationMinutes: data.flightDurationMinutes,
          createdAt: new Date().toISOString(),
        };
        set({ flightRoutes: [newRoute, ...flightRoutes] });
        return newRoute;
      },

      deleteDraftFlightRoute: (id) => {
        set((state) => ({
          flightRoutes: state.flightRoutes.filter((r) => r.id !== id),
        }));
      },

      addDraftFlight: (data) => {
        const { flightProfile, draftFlights } = get();
        const companyId = flightProfile?.id || 'AIR-default';
        const newFlight: FlightDraftFlight = {
          id: generateUniqueId('FLT'),
          companyId,
          flightNumber: data.flightNumber.trim().toUpperCase(),
          routeId: data.routeId,
          aircraftId: data.aircraftId,
          departureDateTime: data.departureDateTime,
          arrivalDateTime: data.arrivalDateTime,
          economyBasePrice: data.economyBasePrice,
          businessBasePrice: data.businessBasePrice,
          currency: 'TL',
          isDraft: true,
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
        set({ draftFlights: [newFlight, ...draftFlights] });
        return newFlight;
      },

      deleteDraftFlight: (id) => {
        set((state) => ({
          draftFlights: state.draftFlights.filter((f) => f.id !== id),
        }));
      },

      // ---------------------------------------------------------------------
      // 3. HOTEL CRUD
      // ---------------------------------------------------------------------
      addDraftProperty: (data) => {
        const { hotelProfile, properties } = get();
        const companyId = hotelProfile?.id || 'HTL-default';
        const newProp: HotelDraftProperty = {
          id: generateUniqueId('PRP'),
          companyId,
          name: data.name.trim(),
          propertyType: data.propertyType,
          starRating: data.starRating,
          city: data.city.trim(),
          district: data.district.trim(),
          address: data.address.trim(),
          amenities: data.amenities || [],
          checkInTime: data.checkInTime || '14:00',
          checkOutTime: data.checkOutTime || '12:00',
          createdAt: new Date().toISOString(),
        };
        set({ properties: [newProp, ...properties] });
        return newProp;
      },

      deleteDraftProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
        }));
      },

      addDraftRoomType: (data) => {
        const { hotelProfile, roomTypes } = get();
        const companyId = hotelProfile?.id || 'HTL-default';
        const newRoomType: HotelDraftRoomType = {
          id: generateUniqueId('RMT'),
          companyId,
          propertyId: data.propertyId,
          title: data.title.trim(),
          bedConfig: data.bedConfig.trim(),
          maxGuests: data.maxGuests,
          sizeSqMeters: data.sizeSqMeters,
          amenities: data.amenities || [],
          createdAt: new Date().toISOString(),
        };
        set({ roomTypes: [newRoomType, ...roomTypes] });
        return newRoomType;
      },

      deleteDraftRoomType: (id) => {
        set((state) => ({
          roomTypes: state.roomTypes.filter((rt) => rt.id !== id),
        }));
      },

      addDraftRoom: (data) => {
        const { hotelProfile, rooms } = get();
        const companyId = hotelProfile?.id || 'HTL-default';
        const newRoom: HotelDraftRoom = {
          id: generateUniqueId('ROM'),
          companyId,
          propertyId: data.propertyId,
          roomTypeId: data.roomTypeId,
          roomNumber: data.roomNumber.trim(),
          floor: data.floor,
          createdAt: new Date().toISOString(),
        };
        set({ rooms: [newRoom, ...rooms] });
        return newRoom;
      },

      deleteDraftRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
        }));
      },

      addDraftRatePlan: (data) => {
        const { hotelProfile, ratePlans } = get();
        const companyId = hotelProfile?.id || 'HTL-default';
        const newPlan: HotelDraftRatePlan = {
          id: generateUniqueId('RPL'),
          companyId,
          propertyId: data.propertyId,
          roomTypeId: data.roomTypeId,
          planName: data.planName.trim(),
          mealBoard: data.mealBoard,
          basePricePerNight: data.basePricePerNight,
          currency: 'TL',
          cancellationPolicy: data.cancellationPolicy,
          createdAt: new Date().toISOString(),
        };
        set({ ratePlans: [newPlan, ...ratePlans] });
        return newPlan;
      },

      deleteDraftRatePlan: (id) => {
        set((state) => ({
          ratePlans: state.ratePlans.filter((rp) => rp.id !== id),
        }));
      },

      // ---------------------------------------------------------------------
      // 4. CAR RENTAL CRUD
      // ---------------------------------------------------------------------
      addDraftBranch: (data) => {
        const { carRentalProfile, branches } = get();
        const companyId = carRentalProfile?.id || 'CAR-default';
        const newBranch: CarRentalDraftBranch = {
          id: generateUniqueId('BRN'),
          companyId,
          name: data.name.trim(),
          city: data.city.trim(),
          district: data.district.trim(),
          address: data.address.trim(),
          phone: data.phone.trim(),
          isAirportBranch: data.isAirportBranch,
          createdAt: new Date().toISOString(),
        };
        set({ branches: [newBranch, ...branches] });
        return newBranch;
      },

      deleteDraftBranch: (id) => {
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        }));
      },

      addDraftVehicleClass: (data) => {
        const { carRentalProfile, vehicleClasses } = get();
        const companyId = carRentalProfile?.id || 'CAR-default';
        const newClass: CarRentalDraftVehicleClass = {
          id: generateUniqueId('CLS'),
          companyId,
          classCode: data.classCode,
          className: data.className.trim(),
          transmission: data.transmission,
          fuelType: data.fuelType,
          seatCapacity: data.seatCapacity,
          minDriverAge: data.minDriverAge,
          minDrivingLicenseYears: data.minDrivingLicenseYears,
          createdAt: new Date().toISOString(),
        };
        set({ vehicleClasses: [newClass, ...vehicleClasses] });
        return newClass;
      },

      deleteDraftVehicleClass: (id) => {
        set((state) => ({
          vehicleClasses: state.vehicleClasses.filter((c) => c.id !== id),
        }));
      },

      addDraftFleetVehicle: (data) => {
        const { carRentalProfile, fleetVehicles } = get();
        const companyId = carRentalProfile?.id || 'CAR-default';
        const newVehicle: CarRentalDraftVehicle = {
          id: generateUniqueId('FLV'),
          companyId,
          branchId: data.branchId,
          classId: data.classId,
          brand: data.brand.trim(),
          model: data.model.trim(),
          year: data.year,
          plateNumber: data.plateNumber.trim(),
          mileage: data.mileage || 0,
          status: 'available',
          createdAt: new Date().toISOString(),
        };
        set({ fleetVehicles: [newVehicle, ...fleetVehicles] });
        return newVehicle;
      },

      deleteDraftFleetVehicle: (id) => {
        set((state) => ({
          fleetVehicles: state.fleetVehicles.filter((v) => v.id !== id),
        }));
      },

      addDraftCarRatePlan: (data) => {
        const { carRentalProfile, carRatePlans } = get();
        const companyId = carRentalProfile?.id || 'CAR-default';
        const newPlan: CarRentalDraftRatePlan = {
          id: generateUniqueId('CRP'),
          companyId,
          classId: data.classId,
          planName: data.planName.trim(),
          dailyRate: data.dailyRate,
          weeklyDiscountPercent: data.weeklyDiscountPercent || 0,
          depositAmount: data.depositAmount || 2000,
          mileageLimitPerDay: data.mileageLimitPerDay || 300,
          currency: 'TL',
          createdAt: new Date().toISOString(),
        };
        set({ carRatePlans: [newPlan, ...carRatePlans] });
        return newPlan;
      },

      deleteDraftCarRatePlan: (id) => {
        set((state) => ({
          carRatePlans: state.carRatePlans.filter((p) => p.id !== id),
        }));
      },

      // Getters
      getMyVehicles: () => {
        const { busProfile, vehicles } = get();
        if (!busProfile) return [];
        return vehicles.filter((v) => v.companyId === busProfile.id);
      },

      getMyRoutes: () => {
        const { busProfile, routes } = get();
        if (!busProfile) return [];
        return routes.filter((r) => r.companyId === busProfile.id);
      },

      getMyDraftTrips: () => {
        const { busProfile, draftTrips } = get();
        if (!busProfile) return [];
        return draftTrips.filter((t) => t.companyId === busProfile.id);
      },
    }),
    {
      name: 'lifeos-travel-partner-management',
    }
  )
);

