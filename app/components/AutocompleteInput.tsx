"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

export type MedicineNameSuggestion = {
  name: string;
  genericName: string;
  category: string;
};

type AutocompleteInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  field: "name" | "genericName" | "category";
  placeholder?: string;
  required?: boolean;
  minChars?: number;
  onSelectMedicine?: (item: MedicineNameSuggestion) => void;
};

export function AutocompleteInput({
  label,
  value,
  onChange,
  field,
  placeholder,
  required,
  minChars = 0,
  onSelectMedicine,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<
    string[] | MedicineNameSuggestion[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < minChars) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({ field, q: query });
        const res = await fetch(
          `/api/pharmacy/inventory/suggestions?${params}`,
        );
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [field, minChars],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setOpen(true);
    fetchSuggestions(value);
  };

  const handleSelect = (item: string | MedicineNameSuggestion) => {
    if (typeof item === "string") {
      onChange(item);
    } else {
      onChange(item.name);
      onSelectMedicine?.(item);
    }
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown =
    open && (loading || suggestions.length > 0 || value.length >= minChars);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showDropdown && (
        <ul className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {loading && suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">Searching...</li>
          ) : suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">
              No matches — you can enter a new value
            </li>
          ) : (
            suggestions.map((item, index) => {
              const isObject = typeof item !== "string";
              const display = isObject ? item.name : item;
              const subtext = isObject
                ? `${item.genericName} · ${item.category}`
                : null;

              return (
                <li key={`${display}-${index}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      index === activeIndex
                        ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="font-medium">{display}</span>
                    {subtext && (
                      <span className="block text-xs text-gray-400 mt-0.5 truncate">
                        {subtext}
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
