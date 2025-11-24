"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: number;
  name: string;
  price: string;
  images: Array<{ src: string; alt: string }>;
  slug: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length > 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="جستجوی محصولات..."
          className="w-full md:w-80 px-4 py-2.5 pr-12 pl-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:bg-white hover:border-gray-300"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        {isLoading && (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" size={20} />
        )}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={handleResultClick}
                  className="flex items-center space-x-3 space-x-reverse p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images[0]?.src ? (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {product.name}
                    </h4>
                    <p className="text-blue-600 font-bold text-sm">
                      {parseFloat(product.price).toLocaleString("fa-IR")} تومان
                    </p>
                  </div>
                </Link>
              ))}
              {results.length >= 10 && (
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="block text-center py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-colors"
                >
                  مشاهده همه نتایج
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


