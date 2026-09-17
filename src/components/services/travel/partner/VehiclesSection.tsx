'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, Plus, Trash2, ShieldCheck, Users } from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { VEHICLE_TYPE_LABELS } from '@/types/travelPartner';
import { CreateVehicleModal } from './CreateVehicleModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function VehiclesSection() {
  const { getMyVehicles, deleteDraftVehicle } = useTravelPartnerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vehicles = getMyVehicles();

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Kayıtlı Araç Filom</h3>
          <p className="text-xs text-muted-foreground">
            Seferlerde kullanılacak otobüs tanımları
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Yeni Araç Ekle
        </Button>
      </div>

      {/* Vehicles List */}
      {vehicles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Bus className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Henüz Kayıtlı Bir Araç Yok
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Yukarıdaki "Yeni Araç Ekle" butonuyla filonuzdaki otobüsleri tanımlayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {vehicles.map((vhc) => {
            const typeInfo = VEHICLE_TYPE_LABELS[vhc.vehicleType] || {
              labelTr: vhc.vehicleType,
              emoji: '🚌',
            };

            return (
              <motion.div
                key={vhc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                    {typeInfo.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">{vhc.vehicleCode}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">({vhc.plateNumber})</span>
                      <Badge variant="secondary" className="text-[9px] py-0 px-1.5">
                        {vhc.seatCapacity} Koltuk
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {typeInfo.labelTr} • {vhc.features.join(', ')}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => deleteDraftVehicle(vhc.id)}
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
      <CreateVehicleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
