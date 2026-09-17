'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TravelHeader, type TravelViewRole } from './TravelHeader';
import { TravelSearchCard } from './TravelSearchCard';
import { TravelSearchResults } from './TravelSearchResults';
import { RecentSearchesSection } from './RecentSearchesSection';
import { TravelPartnerBanner } from './TravelPartnerBanner';
import { TravelPartnerDashboard } from './partner/TravelPartnerDashboard';
import { FlightPartnerDashboard } from './partner/FlightPartnerDashboard';
import { HotelPartnerDashboard } from './partner/HotelPartnerDashboard';
import { CarRentalPartnerDashboard } from './partner/CarRentalPartnerDashboard';
import { TravelPartnerGuardView } from './partner/TravelPartnerGuardView';
import { LockedServicesModal } from '@/components/services/LockedServicesModal';
import { Dock } from '@/components/os/Dock';
import { useTravelStore } from '@/stores/useTravelStore';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { PRODUCT_LABELS, type TravelProductCategory } from '@/types/travelPartner';
import { cn } from '@/lib/utils';

import { Bus, Plane, Building, Car, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

const TRAVEL_PRODUCTS = [
  {
    id: 'bus' as const,
    title: 'Şehirlerarası Otobüs',
    subtitle: 'Sefer ara, bilet ve güzergah karşılaştır',
    icon: Bus,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    status: 'Aktif',
    isActive: true,
  },
  {
    id: 'flight' as const,
    title: 'Uçak Bileti',
    subtitle: 'Yurtiçi ve yurtdışı uçuş arama',
    icon: Plane,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    status: 'Yakında',
    isActive: false,
    iconEmoji: '✈️',
  },
  {
    id: 'hotel' as const,
    title: 'Otel & Konaklama',
    subtitle: 'Otel, tatil köyü ve pansiyon rezervasyonu',
    icon: Building,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    status: 'Yakında',
    isActive: false,
    iconEmoji: '🏨',
  },
  {
    id: 'car_rental' as const,
    title: 'Araç Kiralama',
    subtitle: 'Günlük ve haftalık kiralık araç seçenekleri',
    icon: Car,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    status: 'Yakında',
    isActive: false,
    iconEmoji: '🚗',
  },
];

export function TravelScreen() {
  const { activeTab, setActiveTab } = useTravelStore();
  const {
    activePartnerProduct,
    setActivePartnerProduct,
    statusByProduct,
  } = useTravelPartnerStore();

  const [currentRole, setCurrentRole] = useState<TravelViewRole>('passenger');
  const [selectedProduct, setSelectedProduct] = useState<TravelProductCategory | null>(null);
  const [lockedFeatureModal, setLockedFeatureModal] = useState<{
    isOpen: boolean;
    title: string;
    iconEmoji?: string;
  }>({
    isOpen: false,
    title: '',
  });

  const isCurrentProductVerified =
    statusByProduct[activePartnerProduct] === 'partner_verified';

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header with Tabs & Role Switch */}
      <TravelHeader
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeTab={activeTab}
        onTabSelect={(tab) => {
          setActiveTab(tab);
          setSelectedProduct(tab);
          setActivePartnerProduct(tab);
        }}
        onLockedTabClick={(tab) =>
          setLockedFeatureModal({
            isOpen: true,
            title: `${tab.labelTr} Rezervasyonu`,
            iconEmoji: tab.iconEmoji,
          })
        }
      />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        <AnimatePresence mode="wait">
          {currentRole === 'passenger' ? (
            <motion.div
              key="passenger-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {selectedProduct === null ? (
                /* Closed Options Grid */
                <div className="px-4 mt-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {TRAVEL_PRODUCTS.map((prod) => {
                      const Icon = prod.icon;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            if (prod.isActive) {
                              setSelectedProduct(prod.id);
                              setActiveTab(prod.id);
                            } else {
                              setLockedFeatureModal({
                                isOpen: true,
                                title: `${prod.title} Rezervasyonu`,
                                iconEmoji: prod.iconEmoji,
                              });
                            }
                          }}
                          className="group text-left block w-full"
                        >
                          <Card className="flex items-center justify-between p-4 border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all duration-150 shadow-2xs group-active:scale-[0.99]">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${prod.color} shadow-xs transition-transform group-hover:scale-105`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                    {prod.title}
                                  </h3>
                                  <StatusBadge
                                    status={prod.isActive ? 'active' : 'open'}
                                    label={prod.status}
                                    size="sm"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {prod.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="pl-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </Card>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Expanded Product Search Form & Results */
                <div>
                  <div className="px-4 mt-3 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Tüm Seyahat Seçenekleri</span>
                    </button>
                  </div>

                  {/* Search Card (Bus, Flight, Hotel, or Car Rental based on activeTab) */}
                  <TravelSearchCard
                    onLockedFeatureClick={(featureName) =>
                      setLockedFeatureModal({
                        isOpen: true,
                        title: featureName,
                        iconEmoji: '🔄',
                      })
                    }
                  />

                  {/* Search Results (Shows professional empty state with 0 fake data) */}
                  <TravelSearchResults />

                  {/* Recent Searches */}
                  <RecentSearchesSection />

                  {/* Partner Banner */}
                  <TravelPartnerBanner
                    onOpenPartner={() => {
                      setActivePartnerProduct(activeTab);
                      setCurrentRole('partner');
                    }}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="partner-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {/* Top Category Switcher for Verified Partners */}
              {isCurrentProductVerified && (
                <div className="mx-4 mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar rounded-2xl bg-muted/40 p-1.5 border border-border/50">
                  {(['bus', 'flight', 'hotel', 'car_rental'] as TravelProductCategory[]).map((prod) => {
                    const isSelected = activePartnerProduct === prod;
                    const info = PRODUCT_LABELS[prod];
                    const prodStatus = statusByProduct[prod];
                    return (
                      <button
                        key={prod}
                        onClick={() => setActivePartnerProduct(prod)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                          isSelected
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        )}
                      >
                        <span>{info.emoji}</span>
                        <span>{info.labelTr.split(' ')[0]} Paneli</span>
                        {prodStatus === 'partner_verified' && (
                          <span className="text-[10px] opacity-80">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Render either the verified product dashboard or the guard view */}
              {isCurrentProductVerified ? (
                <>
                  {activePartnerProduct === 'bus' && <TravelPartnerDashboard />}
                  {activePartnerProduct === 'flight' && <FlightPartnerDashboard />}
                  {activePartnerProduct === 'hotel' && <HotelPartnerDashboard />}
                  {activePartnerProduct === 'car_rental' && <CarRentalPartnerDashboard />}
                </>
              ) : (
                <TravelPartnerGuardView
                  onReturnToPassenger={() => setCurrentRole('passenger')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />

      {/* Locked Feature Modal */}
      <LockedServicesModal
        isOpen={lockedFeatureModal.isOpen}
        onClose={() => setLockedFeatureModal({ isOpen: false, title: '' })}
        serviceTitle={lockedFeatureModal.title}
        serviceIcon={
          lockedFeatureModal.iconEmoji ? (
            <span className="text-4xl">{lockedFeatureModal.iconEmoji}</span>
          ) : undefined
        }
      />
    </div>
  );
}

