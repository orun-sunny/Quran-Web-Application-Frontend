"use client";

import { Activity, useEffect, useState } from "react";
import { Sidebar } from "../Layout/Sidebar";
import { Navbar } from "../Layout/Navbar";

import { FeedData, Surah, SurahIndexItem } from "../../types";
import { SearchModal } from "./SearchModal";
import { RightPanel } from "./RightPanel";
import { SurahDrawer } from "./SurahDrawer";

export type FeedQuery = { type: "surah" | "juz" | "page"; id: number };

export const MainApp = ({ children }: { children: React.ReactNode }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [surahsList, setSurahsList] = useState<SurahIndexItem[]>([]);
  const [activeFeedQuery, setActiveFeedQuery] = useState<FeedQuery | null>(
    null,
  );
  const [feedData, setFeedData] = useState<FeedData | null>(null);

  useEffect(() => {
    if (!activeFeedQuery) {
      setFeedData(null);
      return;
    }

    let isMounted = true;

    async function loadFeed() {
      setFeedData(null);
      try {
        let endpoint = "";
        if (activeFeedQuery?.type === "surah")
          endpoint = `/api/surah?id=${activeFeedQuery.id}`;
        else if (activeFeedQuery?.type === "juz")
          endpoint = `/api/juz?id=${activeFeedQuery.id}`;
        else if (activeFeedQuery?.type === "page")
          endpoint = `/api/page?id=${activeFeedQuery.id}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (isMounted && data) {
          if (activeFeedQuery?.type === "surah") {
            const surahInfo = surahsList.find(
              (s) => s.id === activeFeedQuery.id,
            );
            const medinanSurahs = [
              2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61,
              62, 63, 64, 65, 66, 76, 98, 99, 110,
            ];
            const isMedinan = medinanSurahs.includes(data.id);

            setFeedData({
              id: data.id,
              type: "surah",
              title:
                surahInfo?.transliteration || data.transliteration || data.name,
              subtitle: `Ayah-${data.total_verses}, ${isMedinan ? "Madinah" : "Makkah"}`,
              verses: data.verses.map((v: any) => ({
                ...v,
                surah_id: data.id,
              })),
              revelation_place: isMedinan ? "madina" : "makkah",
            });
          } else {
            setFeedData(data as FeedData);
          }
        }
      } catch {
        if (isMounted) setFeedData(null);
      }
    }

    loadFeed();
    return () => {
      isMounted = false;
    };
  }, [activeFeedQuery, surahsList]);

  useEffect(() => {
    if (activeFeedQuery) {
      return;
    }

    let isMounted = true;

    async function loadInitialSurah() {
      try {
        const response = await fetch(`/api/surah`);
        const data = (await response.json()) as SurahIndexItem[];
        if (isMounted && data.length > 0) {
          setSurahsList(data);
          setActiveFeedQuery({ type: "surah", id: data[0].id });
        }
      } catch {
        if (isMounted) {
          setActiveFeedQuery(null);
        }
      }
    }

    loadInitialSurah();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNextFeed = () => {
    if (
      !activeFeedQuery ||
      activeFeedQuery.type !== "surah" ||
      surahsList.length === 0
    )
      return;
    const currentIndex = surahsList.findIndex(
      (s) => s.id === activeFeedQuery.id,
    );
    if (currentIndex >= 0 && currentIndex < surahsList.length - 1) {
      stop();
      setActiveFeedQuery({
        type: "surah",
        id: surahsList[currentIndex + 1].id,
      });
    }
  };

  const handlePrevFeed = () => {
    if (
      !activeFeedQuery ||
      activeFeedQuery.type !== "surah" ||
      surahsList.length === 0
    )
      return;
    const currentIndex = surahsList.findIndex(
      (s) => s.id === activeFeedQuery.id,
    );
    if (currentIndex > 0) {
      stop();
      setActiveFeedQuery({
        type: "surah",
        id: surahsList[currentIndex - 1].id,
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col pb-16 lg:pb-0 lg:pl-15">
        <Navbar
          onMenuClick={() => setIsDrawerOpen((prev) => !prev)}
          isDrawerOpen={isDrawerOpen}
          onSearchClick={() => setIsSearchOpen(true)}
        />
        <div className="flex flex-1 overflow-hidden relative">
          <SurahDrawer
            activeFeedQuery={activeFeedQuery}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSurahSelect={(surahInfo) => {
              stop();
              setActiveFeedQuery({ type: "surah", id: surahInfo.id });
            }}
            onJuzSelect={(juzId) => {
              stop();
              setActiveFeedQuery({ type: "juz", id: juzId });
            }}
            onPageSelect={(pageId) => {
              stop();
              setActiveFeedQuery({ type: "page", id: pageId });
            }}
          />

          <RightPanel />
        </div>
      </div>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        surahs={surahsList}
        onSurahSelect={(surahInfo) => {
          stop();
          setActiveFeedQuery({ type: "surah", id: surahInfo.id });
        }}
      />
    </div>
  );
};
