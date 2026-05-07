"use client";

import React from "react";
import Image from "next/image";
import { AyatCard } from "./AyatCard";
import { Loader } from "../AllIcons/Loader";

import { FeedData } from "../../types";
import { useSettings } from "../Context/SettingsContext";

interface AyatFeedProps {
  feedData: FeedData | null;
  onNextFeed?: () => void;
  onPrevFeed?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const AyatFeed = ({
  feedData,
  onNextFeed,
  onPrevFeed,
  hasNext,
  hasPrev,
}: AyatFeedProps) => {
  const { isDarkMode } = useSettings();

  if (!feedData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-[var(--text-secondary)] gap-4 bg-[var(--background)]">
        <Loader size="lg" color="green" />
        <p>Loading Feed...</p>
      </div>
    );
  }

  const isSurah = feedData.type === "surah";

  return (
    <div className="flex-1 h-full overflow-y-auto pb-[50px] bg-[var(--background)]">
      {/* Feed Header */}
      <div className="flex flex-col px-4 md:px-10  md:flex-row items-center md:items-start justify-between py-10 md:py-8 md:gap-20 bg-[var(--bg-primary)]">
        {/* Mobile view */}
        <div className="flex flex-col  items-center gap-4 md:hidden w-full">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]/60">
            {feedData.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {feedData.subtitle}
          </p>
          <div className="mt-6 w-48 h-12 relative opacity-90 transition-opacity">
            <Image
              src={isDarkMode ? "/bismillah.svg" : "/bismillah-white-bg.svg"}
              alt="Bismillah"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block w-20 h-20 relative rounded-xl overflow-hidden opacity-100 flex items-center justify-center flex-1">
          {feedData.revelation_place ? (
            <Image
              src={
                isDarkMode
                  ? `/${feedData.revelation_place}-black.png`
                  : `/${feedData.revelation_place}.png`
              }
              alt={feedData.revelation_place}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <Image
              src="/makkah.webp"
              alt="Mosque"
              fill
              sizes="80px"
              className="object-cover"
            />
          )}
        </div>
        <div className="hidden md:flex items-center justify-center gap-6 flex-1">
          <div className="flex flex-col items-center justify-center md:gap-[10px]">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]/80">
              {feedData.title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {feedData.subtitle}
            </p>
          </div>
        </div>

        <div
          className={`
            hidden md:block w-48 h-16 relative flex-1
            opacity-80 dark:opacity-60
            ${feedData.id === 1 && isSurah ? "md:invisible" : ""}
          `}
        >
          {isSurah && (
            <div className="mt-6 w-48 h-12 relative opacity-90 transition-opacity">
              <Image
                src={isDarkMode ? "/bismillah.svg" : "/bismillah-white-bg.svg"}
                alt="Bismillah"
                fill
                className="object-contain object-right"
              />
            </div>
          )}
        </div>
      </div>

      {/* Ayat List */}
      <div className="flex flex-col">
        {feedData.verses.map((verse, index) => {
          const prevVerse = index > 0 ? feedData.verses[index - 1] : null;
          const isNewSurah =
            !isSurah && (!prevVerse || prevVerse.surah_id !== verse.surah_id);
          const verseNumber = Number(
            (verse as any).id ?? (verse as any).ayah_number ?? index + 1,
          );

          return (
            <React.Fragment key={`${verse.surah_id}-${verseNumber}`}>
              {isNewSurah && (
                <div className="flex flex-col items-center justify-center py-8 my-4 border-y border-[var(--border)]/10 bg-[var(--bg-secondary)] shadow-sm">
                  <h2 className="text-lg md:text-xl font-bold text-[var(--primary-green)] mb-3">
                    {verse.surah_transliteration ||
                      verse.surah_name ||
                      `Surah ${verse.surah_id}`}
                  </h2>
                  <div className="w-48 h-10 relative opacity-90 transition-opacity">
                    <Image
                      src={
                        isDarkMode
                          ? "/bismillah.svg"
                          : "/bismillah-white-bg.svg"
                      }
                      alt="Bismillah"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <AyatCard
                surahId={verse.surah_id || parseInt(feedData.id as string)}
                verse={verse}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center rounded-full max-w-[230px] m-auto bg-[var(--surface-secondary)] justify-center gap-8 mt-14 py-2 px-2 shadow-sm">
        <button
          onClick={onPrevFeed}
          disabled={!hasPrev}
          className={`flex items-center text-sm gap-1 font-medium transition-all ${
            hasPrev
              ? "cursor-pointer text-[var(--text-primary)]/70"
              : "text-[var(--text-secondary)] cursor-default"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        <button
          onClick={onNextFeed}
          disabled={!hasNext}
          className={`flex items-center gap-1 text-sm font-medium transition-all ${
            hasNext
              ? "cursor-pointer text-[var(--text-primary)]/70 hover:text-[var(--primary-green)]"
              : "text-[var(--text-secondary)] cursor-not-allowed"
          }`}
        >
          Next
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
