import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ProviderUserStatus,
  ServiceCategoryKey,
  ServiceSpecificProviderProfile,
} from '@/types/providerAuth';
import { SERVICE_DOCUMENT_REQUIREMENTS } from '@/types/providerAuth';

const INITIAL_PROFILES: Record<ServiceCategoryKey, ServiceSpecificProviderProfile> = {
  moving: {
    serviceType: 'moving',
    status: 'customer',
    documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS.moving,
  },
  taxi: {
    serviceType: 'taxi',
    status: 'customer',
    documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS.taxi,
  },
  travel: {
    serviceType: 'travel',
    status: 'customer',
    documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS.travel,
  },
  craftsman: {
    serviceType: 'craftsman',
    status: 'customer',
    documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS.craftsman,
  },
};

interface ProviderAuthState {
  profiles: Record<ServiceCategoryKey, ServiceSpecificProviderProfile>;

  // Actions
  getProfile: (serviceType: ServiceCategoryKey) => ServiceSpecificProviderProfile;
  isVerifiedFor: (serviceType: ServiceCategoryKey) => boolean;
  submitApplication: (
    serviceType: ServiceCategoryKey,
    data: {
      fullName: string;
      businessTitle?: string;
      vehicleOrEquipmentInfo?: string;
      notes?: string;
    }
  ) => void;
  approveDemoApplication: (serviceType: ServiceCategoryKey) => void;
  resetServiceProfile: (serviceType: ServiceCategoryKey) => void;
  setStatus: (serviceType: ServiceCategoryKey, status: ProviderUserStatus) => void;
}

export const useProviderAuthStore = create<ProviderAuthState>()(
  persist(
    (set, get) => ({
      profiles: INITIAL_PROFILES,

      getProfile: (serviceType) => {
        const { profiles } = get();
        return (
          profiles[serviceType] || {
            serviceType,
            status: 'customer',
            documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS[serviceType] || [],
          }
        );
      },

      isVerifiedFor: (serviceType) => {
        const profile = get().getProfile(serviceType);
        return profile.status === 'provider_verified';
      },

      submitApplication: (serviceType, data) => {
        const currentProfiles = get().profiles;
        const defaultDocs = SERVICE_DOCUMENT_REQUIREMENTS[serviceType] || [];

        const updatedProfile: ServiceSpecificProviderProfile = {
          serviceType,
          status: 'provider_applicant',
          fullName: data.fullName.trim(),
          businessTitle: data.businessTitle?.trim() || '',
          vehicleOrEquipmentInfo: data.vehicleOrEquipmentInfo?.trim() || '',
          submittedAt: new Date().toISOString(),
          documentChecklist: defaultDocs,
          notes: data.notes?.trim() || '',
        };

        set({
          profiles: {
            ...currentProfiles,
            [serviceType]: updatedProfile,
          },
        });
      },

      approveDemoApplication: (serviceType) => {
        const currentProfiles = get().profiles;
        const existing = currentProfiles[serviceType] || {
          serviceType,
          status: 'customer',
          documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS[serviceType] || [],
        };

        const updatedProfile: ServiceSpecificProviderProfile = {
          ...existing,
          serviceType,
          status: 'provider_verified',
          fullName: existing.fullName || 'Doğrulanmış Hizmet Veren',
          reviewedAt: new Date().toISOString(),
          documentChecklist: (existing.documentChecklist || []).map((doc) => ({
            ...doc,
            status: 'verified',
          })),
        };

        set({
          profiles: {
            ...currentProfiles,
            [serviceType]: updatedProfile,
          },
        });
      },

      resetServiceProfile: (serviceType) => {
        const currentProfiles = get().profiles;
        const resetProfile: ServiceSpecificProviderProfile = {
          serviceType,
          status: 'customer',
          documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS[serviceType] || [],
        };

        set({
          profiles: {
            ...currentProfiles,
            [serviceType]: resetProfile,
          },
        });
      },

      setStatus: (serviceType, status) => {
        const currentProfiles = get().profiles;
        const existing = currentProfiles[serviceType] || {
          serviceType,
          status: 'customer',
          documentChecklist: SERVICE_DOCUMENT_REQUIREMENTS[serviceType] || [],
        };

        set({
          profiles: {
            ...currentProfiles,
            [serviceType]: {
              ...existing,
              status,
            },
          },
        });
      },
    }),
    {
      name: 'lifeos-service-provider-auth-v2',
    }
  )
);
