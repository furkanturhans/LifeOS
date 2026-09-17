'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Sparkles, Check, X } from 'lucide-react';
import type { LocationPlace, LocationAutocompleteResponse } from '@/types/location';
import { cn } from '@/lib/utils';

// Client-side cache to avoid repeated network calls for identical queries
const clientQueryCache = new Map<string, LocationAutocompleteResponse>();

interface LocationAutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, selectedPlace?: LocationPlace) => void;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  countryCode?: string;
  onClear?: () => void;
}

export function LocationAutocompleteInput({
  label,
  placeholder = 'İl, ilçe veya bölge adı yazın...',
  value,
  onChange,
  icon,
  required = false,
  disabled = false,
  className,
  inputClassName,
  countryCode = 'tr',
  onClear,
}: LocationAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationPlace[]>([]);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when query changes with debounce (>= 3 chars)
  useEffect(() => {
    const query = (value || '').trim();

    if (query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Check client cache first
    const cacheKey = `${countryCode}:${query.toLowerCase()}`;
    if (clientQueryCache.has(cacheKey)) {
      const cached = clientQueryCache.get(cacheKey)!;
      setSuggestions(cached.results);
      setIsConfigured(cached.isConfigured);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/location/autocomplete?text=${encodeURIComponent(query)}&country=${countryCode}`
        );
        if (res.ok) {
          const data: LocationAutocompleteResponse = await res.json();
          clientQueryCache.set(cacheKey, data);
          setSuggestions(data.results || []);
          setIsConfigured(data.isConfigured);
        }
      } catch {
        // Gracefully keep manual typing
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, countryCode]);

  const handleSelectPlace = (place: LocationPlace) => {
    const formatted = place.formattedAddress || place.name;
    onChange(formatted, place);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectPlace(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value.trim().length >= 3 || isConfigured === false) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            'w-full rounded-2xl border border-border bg-muted/30 p-3.5 pl-10 pr-9 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all',
            inputClassName
          )}
        />

        {/* Leading Icon */}
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon || <MapPin className="h-4 w-4 text-blue-500" />}
        </div>

        {/* Trailing Loader / Clear Button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : value.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                if (onClear) onClear();
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && (value.trim().length >= 3 || isConfigured === false) && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-border/80 bg-card p-1.5 shadow-xl backdrop-blur-xl no-scrollbar"
          >
            {/* If API key is not configured on server: show graceful informative message */}
            {isConfigured === false && (
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  <span>Konum önerileri yakında kullanılabilir olacak.</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                  Adresinizi veya bölgenizi doğrudan yazarak devam edebilirsiniz.
                </p>
              </div>
            )}

            {/* If configured and results exist */}
            {isConfigured !== false && suggestions.length > 0 && (
              <div className="space-y-0.5">
                {suggestions.map((place, idx) => {
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <button
                      key={place.id || idx}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-xs transition-colors',
                        isHighlighted
                          ? 'bg-blue-500/10 text-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      )}
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground text-[11px] truncate">
                          {place.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {place.formattedAddress}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* If configured but no results found */}
            {isConfigured !== false && !isLoading && suggestions.length === 0 && (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Eşleşen konum önerisi bulunamadı.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
