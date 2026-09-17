'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Trash2, Clock, Bus, MapPin, FileEdit } from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { CreateTripModal } from './CreateTripModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function TripsSection() {
  const { getMyDraftTrips, getMyRoutes, getMyVehicles, deleteDraftTrip } =
    useTravelPartnerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const draftTrips = getMyDraftTrips();
  const routes = getMyRoutes();
  const vehicles = getMyVehicles();

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Planlanan Sefer Taslakları</h3>
          <p className="text-xs text-muted-foreground">
            Firmanızın tanımladığı ve henüz yayına alınmamış seferler
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Yeni Sefer Taslağı
        </Button>
      </div>

      {/* Trips List */}
      {draftTrips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Calendar className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Henüz Kayıtlı Bir Sefer Taslağı Yok
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Araç ve rotanızı seçerek sefer taslağınızı oluşturabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {draftTrips.map((trp) => {
            const route = routes.find((r) => r.id === trp.routeId);
            const vehicle = vehicles.find((v) => v.id === trp.vehicleId);

            return (
              <motion.div
                key={trp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <FileEdit className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {route ? `${route.originCity} → ${route.destinationCity}` : 'Sefer'}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400">
                        Taslak (Yayında Değil)
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {trp.departureDateTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Bus className="h-3 w-3" />
                        {vehicle ? `${vehicle.vehicleCode} (${vehicle.plateNumber})` : 'Otobüs'}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-foreground">
                        {trp.baseTicketPrice} {trp.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => deleteDraftTrip(trp.id)}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 h-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
