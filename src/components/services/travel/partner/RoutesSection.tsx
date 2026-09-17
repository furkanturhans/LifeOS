'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Clock, ArrowRight } from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { CreateRouteModal } from './CreateRouteModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function RoutesSection() {
  const { getMyRoutes, deleteDraftRoute } = useTravelPartnerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const routes = getMyRoutes();

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Tanımlı Güzergahlar</h3>
          <p className="text-xs text-muted-foreground">
            Firmanızın sefer düzenlediği hatlar ve duraklar
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Yeni Rota Ekle
        </Button>
      </div>

      {/* Routes List */}
      {routes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <MapPin className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Henüz Kayıtlı Bir Güzergah Yok
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Sefer planlayabilmek için kalkış ve varış noktalarınızı tanımlayın.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {routes.map((rt) => (
            <motion.div
              key={rt.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 mt-0.5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">
                      {rt.originCity} ({rt.originTerminal})
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-bold text-xs text-foreground">
                      {rt.destinationCity} ({rt.destinationTerminal})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{rt.estimatedDurationHours} Saat
                    </span>
                    {rt.intermediateStops && rt.intermediateStops.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Ara Duraklar: {rt.intermediateStops.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => deleteDraftRoute(rt.id)}
                variant="ghost"
                size="sm"
                className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 h-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateRouteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
