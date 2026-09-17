'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, ArrowRight, History } from 'lucide-react';
import { useTravelStore } from '@/stores/useTravelStore';
import type { TravelSearchQuery } from '@/types/travel';

export function RecentSearchesSection() {
  const { searchQuery, setSearchQuery, executeSearch } = useTravelStore();
  const recentSearches: TravelSearchQuery[] = [];

  function handleSelectRecent(search: TravelSearchQuery) {
    setSearchQuery(search);
    executeSearch();
  }

  return (
    <div className="mx-4 mt-6">
      <div className="mb-3 px-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" />
          <span>Son Aramalarınız</span>
        </h3>
        {recentSearches.length > 0 && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {recentSearches.length} Arama
          </span>
        )}
      </div>

      {recentSearches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">
            Henüz geçmiş bir seyahat aramanız bulunmuyor
          </h4>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Yaptığınız otobüs seferi aramaları hızlı erişim için burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentSearches.map((item, idx) => (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectRecent(item)}
              className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors">
                    {item.fromLocation} → {item.toLocation}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.departureDate ? `${item.departureDate} • ` : ''}
                    {item.passengerCount} Yolcu
                  </div>
                </div>
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
