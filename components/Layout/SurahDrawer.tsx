"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "../AllIcons/Icons";
import { X, Search, ChevronDown } from "lucide-react";

import { SurahIndexItem } from "../../types";
import { FeedQuery } from "../Layout/MainApp";

type TabKey = "surah" | "juz" | "page";

interface SurahDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFeedQuery?: FeedQuery | null;
  onSurahSelect?: (surah: SurahIndexItem) => void;
  onJuzSelect?: (juzId: number) => void;
  onPageSelect?: (pageId: number) => void;
}

export const SurahDrawer = ({
  isOpen,
  onClose,
  activeFeedQuery,
  onSurahSelect,
  onJuzSelect,
  onPageSelect,
}: SurahDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("surah");
  const [surahs, setSurahs] = useState<SurahIndexItem[]>([]);
  const [juzs, setJuzs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [juzQuery, setJuzQuery] = useState("");
  const [pageQuery, setPageQuery] = useState("");
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "surah", label: "Surah" },
    { key: "juz", label: "Juz" },
    { key: "page", label: "Page" },
  ];

  const handleTabChange = (newTab: TabKey) => {
    if (newTab === activeTab) return;
    const currentIndex = tabs.findIndex((t) => t.key === activeTab);
    const newIndex = tabs.findIndex((t) => t.key === newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  useEffect(() => {
    let isMounted = true;

    async function loadSurahs() {
      try {
        const response = await fetch("/api/surah");
        const data = (await response.json()) as SurahIndexItem[];
        if (isMounted) {
          setSurahs(data);
        }
      } catch {
        if (isMounted) {
          setSurahs([]);
        }
      }
    }

    async function loadJuzs() {
      try {
        const response = await fetch("https://api.quran.com/api/v4/juzs");
        const data = await response.json();
        if (isMounted) {
          const uniqueJuzs = [];
          const seen = new Set();
          for (const j of data.juzs) {
            if (!seen.has(j.juz_number)) {
              seen.add(j.juz_number);
              uniqueJuzs.push(j);
            }
          }
          setJuzs(uniqueJuzs);
        }
      } catch (e) {
        console.error("Failed to load juzs", e);
      }
    }

    loadSurahs();
    loadJuzs();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeFeedQuery?.type === "juz") {
      setExpandedJuz(activeFeedQuery.id);
    }
  }, [activeFeedQuery]);

  const filteredSurahs = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return surahs;
    return surahs.filter(
      (surah) =>
        surah.transliteration.toLowerCase().includes(trimmed) ||
        surah.translation.toLowerCase().includes(trimmed) ||
        surah.name.toLowerCase().includes(trimmed) ||
        surah.id.toString().includes(trimmed),
    );
  }, [query, surahs]);

  const filteredJuzs = useMemo(() => {
    const trimmed = juzQuery.trim().toLowerCase();
    if (!trimmed) return juzs;
    return juzs.filter(
      (j) =>
        j.juz_number.toString().includes(trimmed) ||
        surahs
          .find((s) => Object.keys(j.verse_mapping).map(Number)[0] === s.id)
          ?.transliteration.toLowerCase()
          .includes(trimmed),
    );
  }, [juzQuery, juzs, surahs]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-60 flex h-full w-[320px] flex-col border-r border-(--border)/10 bg-[var(--background)] shadow-xl transition-transform lg:static lg:z-10 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0 max-lg:w-full" : "-translate-x-full"
        } lg:flex`}
      >
        <div className="lg:hidden flex items-start justify-between gap-3 p-4">
          <div className="flex gap-3">
            <img src="/logo.svg" alt="Logo" className="size-7 mt-2" />
            <div className="leading-tight">
              <p className="text-xl font-extrabold text-[var(--text-primary)]">
                Quran Mazid
              </p>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Read, Study, and Learn The Quran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 flex items-center justify-center rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close surah drawer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex rounded-full bg-[var(--surface-secondary)] p-1 text-sm font-medium text-[var(--text-secondary)]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={` cursor-pointer relative flex-1 py-1.5 px-4 text-sm font-medium transition-colors z-10 ${
                  activeTab === tab.key
                    ? "text-[var(--text-secondary)] font-bold"
                    : "text-[var(--text-secondary)]/60"
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab-drawer"
                    className="absolute inset-0 rounded-full bg-[var(--background)] shadow-sm z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {/* Surah List */}
            {activeTab === "surah" && (
              <motion.div
                key="surah"
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-1 flex-col gap-4 px-4 overflow-hidden h-full"
              >
                <label className="relative shrink-0">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search Surah"
                    className="w-full rounded-full bg-[var(--surface-secondary)] py-3 pl-10 pr-4 text-sm text-[var(--text-secondary)] outline-none transition focus:border-emerald-600"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Search size={18} />
                  </span>
                </label>

                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                    <div className="space-y-3 pb-4">
                      {filteredSurahs.map((surah) => {
                        const isActive =
                          activeFeedQuery?.type === "surah" &&
                          activeFeedQuery.id === surah.id;
                        return (
                          <button
                            key={surah.id}
                            type="button"
                            onClick={() => {
                              if (onSurahSelect) onSurahSelect(surah);
                              onClose();
                            }}
                            className={`cursor-pointer group flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-5 text-left transition hover:bg-[var(--bg-dark-green)]/6 hover:border-[var(--primary-green)]/40 transition-all duration-200  ${
                              isActive
                                ? "border-[var(--primary-green)]/40 bg-[var(--bg-dark-green)]/6 text-[var(--text-primary)]"
                                : "border-[var(--border)]/10 hover:border-[var(--primary-green)]/20"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-8 w-8 rotate-45 items-center justify-center rounded-lg text-xs font-semibold text-[var(--text-secondary)] group-hover:text-white group-hover:bg-[var(--bg-dark-green)] transition-colors duration-200 ${isActive ? "bg-[var(--bg-dark-green)] text-white" : "bg-[var(--surface-secondary)]"}`}
                              >
                                <span className="-rotate-45">{surah.id}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)] pb-2">
                                  {surah.transliteration}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {surah.translation}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-base text-[var(--text-primary)] font-[var(--font-calligraphy)]">
                              {surah.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "juz" && (
              <motion.div
                key="juz"
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-1 flex-col gap-4 px-4 overflow-hidden h-full"
              >
                <label className="relative shrink-0">
                  <input
                    value={juzQuery}
                    onChange={(event) => setJuzQuery(event.target.value)}
                    placeholder="Search Juz"
                    className="w-full rounded-full bg-[var(--surface-secondary)] py-3 pl-10 pr-4 text-sm text-[var(--text-secondary)] outline-none transition focus:border-emerald-600"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Search size={18} />
                  </span>
                </label>
                <div className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                  <div className="space-y-3 pb-4">
                    {filteredJuzs.map((juz) => {
                      const isExpanded = expandedJuz === juz.juz_number;
                      const surahIds = Object.keys(juz.verse_mapping).map(
                        Number,
                      );
                      const firstSurah = surahs.find(
                        (s) => s.id === surahIds[0],
                      );
                      const isActive =
                        activeFeedQuery?.type === "juz" &&
                        activeFeedQuery.id === juz.juz_number;

                      return (
                        <div key={juz.id} className="flex flex-col gap-2">
                          <button
                            onClick={() =>
                              setExpandedJuz(isExpanded ? null : juz.juz_number)
                            }
                            className={`cursor-pointer group flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-5 text-left transition hover:bg-[var(--bg-dark-green)]/6 hover:border-[var(--primary-green)]/40 transition-all duration-200 ${
                              isExpanded || isActive
                                ? "border-[var(--primary-green)]/40 bg-[var(--bg-dark-green)]/6 text-[var(--text-primary)]"
                                : "border-[var(--border)]/10 hover:border-[var(--primary-green)]/20 text-[var(--text-primary)]"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-8 w-8 rotate-45 items-center justify-center rounded-lg text-xs font-semibold text-[var(--text-secondary)] group-hover:text-white group-hover:bg-[var(--bg-dark-green)] transition-colors duration-200 ${isActive || isExpanded ? "bg-[var(--bg-dark-green)] text-white" : "bg-[var(--surface-secondary)]"}`}
                              >
                                <span className="-rotate-45">
                                  {juz.juz_number}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold pb-1">
                                  Juz {juz.juz_number}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {firstSurah?.transliteration} & More
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--text-secondary)] font-medium">
                                الجزء
                              </span>
                              <ChevronDown
                                size={16}
                                className={`text-[var(--text-secondary)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden flex flex-col gap-2"
                              >
                                <div className="pl-6 flex flex-col gap-2 pb-2">
                                  <button
                                    onClick={() => {
                                      if (onJuzSelect)
                                        onJuzSelect(juz.juz_number);
                                      onClose();
                                    }}
                                    className="text-left py-2 px-4 rounded-xl bg-[var(--primary-green)]/10 text-[var(--primary-green)] text-xs font-bold hover:bg-[var(--primary-green)]/20 transition-colors"
                                  >
                                    Read Full Juz {juz.juz_number}
                                  </button>
                                  <div className="space-y-2">
                                    {surahIds.map((surahId) => {
                                      const s = surahs.find(
                                        (x) => x.id === surahId,
                                      );
                                      if (!s) return null;
                                      return (
                                        <button
                                          key={surahId}
                                          onClick={() => {
                                            if (onSurahSelect) onSurahSelect(s);
                                            onClose();
                                          }}
                                          className="flex w-full items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-secondary)] transition-colors text-left cursor-pointer"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div
                                              className={`h-6 w-6 rotate-45 border border-[var(--border)]/10 flex items-center justify-center rounded-md text-[8px] font-bold text-[var(--text-secondary)] group-hover:bg-[var(--bg-dark-green)] group-hover:text-white transition-colors duration-200 bg-[var(--surface-secondary)]`}
                                            >
                                              <span className="-rotate-45">
                                                {s.id}
                                              </span>
                                            </div>
                                            <span className="text-xs font-medium text-[var(--text-primary)]">
                                              {s.transliteration}
                                            </span>
                                          </div>
                                          <span className="text-xs text-[var(--text-secondary)] font-[var(--font-calligraphy)]">
                                            {s.name}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "page" && (
              <motion.div
                key="page"
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-1 flex-col gap-4 px-4 overflow-hidden h-full"
              >
                <label className="relative shrink-0">
                  <input
                    value={pageQuery}
                    onChange={(event) => setPageQuery(event.target.value)}
                    placeholder="Search Page"
                    className="w-full rounded-full bg-[var(--surface-secondary)] py-3 pl-10 pr-4 text-sm text-[var(--text-secondary)] outline-none transition focus:border-emerald-600"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Search size={18} />
                  </span>
                </label>
                <div className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                  <div className="space-y-3 pb-4">
                    {Array.from({ length: 604 }, (_, i) => i + 1)
                      .filter(
                        (p) => !pageQuery || p.toString().includes(pageQuery),
                      )
                      .map((page) => {
                        const isActive =
                          activeFeedQuery?.type === "page" &&
                          activeFeedQuery.id === page;
                        return (
                          <button
                            key={page}
                            onClick={() => {
                              if (onPageSelect) onPageSelect(page);
                              onClose();
                            }}
                            className={`cursor-pointer group flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-5 text-left transition hover:bg-[var(--bg-dark-green)]/6 hover:border-[var(--primary-green)]/40 transition-all duration-200  ${
                              isActive
                                ? "border-[var(--primary-green)]/40 bg-[var(--bg-dark-green)]/6 text-[var(--text-primary)]"
                                : "border-[var(--border)]/10 hover:border-[var(--primary-green)]/20"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-8 w-8 rotate-45 items-center justify-center rounded-lg text-xs font-semibold text-[var(--text-secondary)] group-hover:text-white group-hover:bg-[var(--bg-dark-green)] transition-colors duration-200 ${isActive ? "bg-[var(--bg-dark-green)] text-white" : "bg-[var(--surface-secondary)]"}`}
                              >
                                <span className="-rotate-45">{page}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold pb-1">
                                  Page {page}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  Reading Page
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-[var(--text-secondary)] font-medium">
                              صفحة
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
};
