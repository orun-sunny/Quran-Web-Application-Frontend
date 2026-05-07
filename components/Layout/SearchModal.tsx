import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { SurahIndexItem } from "../../types";

export const SearchModal = ({
  isOpen,
  onClose,
  surahs,
  onSurahSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  surahs: SurahIndexItem[];
  onSurahSelect: (surah: SurahIndexItem) => void;
}) => {
  const [query, setQuery] = useState("");

  const filteredSurahs =
    query.trim() === ""
      ? []
      : surahs
          .filter((surah) => {
            const lower = query.toLowerCase();
            return (
              surah.transliteration.toLowerCase().includes(lower) ||
              surah.translation.toLowerCase().includes(lower) ||
              surah.name.toLowerCase().includes(lower) ||
              surah.id.toString().includes(lower)
            );
          })
          .slice(0, 3); // top 3 for pills

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header / Input */}
            <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
              <BookOpen
                className="text-[var(--primary-green)] shrink-0"
                size={24}
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredSurahs.length > 0) {
                    onSurahSelect(filteredSurahs[0]);
                    onClose();
                  }
                }}
                placeholder="Search Surah, Ayat, Translation..."
                className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 text-lg placeholder:text-zinc-400"
              />
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  Quran
                </button>
                <button className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <SlidersHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Try to navigate */}
              {query && filteredSurahs.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-zinc-500 mb-3 font-medium">
                    Try to navigate
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSurahs.map((surah) => (
                      <button
                        key={surah.id}
                        onClick={() => {
                          onSurahSelect(surah);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#171717] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {surah.transliteration}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {query && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-zinc-500 mb-1 font-medium">
                    Search Suggestions
                  </p>

                  <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-zinc-50 dark:bg-[#111510] hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left group cursor-pointer">
                    <ArrowRight
                      size={16}
                      className="text-zinc-400 group-hover:text-[var(--primary-green)] transition-colors"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      Search In Translation{" "}
                      <span className="text-[var(--primary-green)] ml-1">
                        {query}
                      </span>
                    </span>
                  </button>

                  <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-zinc-50 dark:bg-[#111510] hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left group cursor-pointer">
                    <ArrowRight
                      size={16}
                      className="text-zinc-400 group-hover:text-[var(--primary-green)] transition-colors"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      Search In Tafsir{" "}
                      <span className="text-[var(--primary-green)] ml-1">
                        {query}
                      </span>
                    </span>
                  </button>

                  <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-zinc-50 dark:bg-[#111510] hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left group cursor-pointer">
                    <ArrowRight
                      size={16}
                      className="text-zinc-400 group-hover:text-[var(--primary-green)] transition-colors"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      Search In Arabic{" "}
                      <span className="text-[var(--primary-green)] ml-1">
                        {query}
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {!query && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Search
                    className="text-zinc-200 dark:text-zinc-800 mb-4"
                    size={48}
                  />
                  <p className="text-zinc-500">Type something to search...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
