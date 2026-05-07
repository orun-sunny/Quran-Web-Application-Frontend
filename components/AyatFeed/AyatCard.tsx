"use client";

import React, { useRef, useEffect } from "react";
import { Play, Pause, BookOpen, Bookmark, MoreVertical } from "lucide-react";
import { useSettings } from "../Context/SettingsContext";
import { useAudio } from "../AudioPlayer/AudioContext";

import { Verse } from "../../types";

interface AyatCardProps {
  surahId: number;
  verse: Verse;
}

const toArabicNumber = (num: number) => 
  num.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d as any]);

export const AyatCard = ({ surahId, verse }: AyatCardProps) => {
  const { arabicFontSize, translationFontSize, arabicFontFace } = useSettings();
  const { currentVerseId, isPlaying, playVerse, pause, resume } = useAudio();
  const verseNumber = Number((verse as any).id ?? (verse as any).ayah_number ?? 0);
  
  const isCurrentPlaying = currentVerseId === verseNumber;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCurrentPlaying && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isCurrentPlaying]);

  const handlePlayClick = () => {
    if (isCurrentPlaying) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      playVerse(surahId, verseNumber);
    }
  };

  const getFontFamily = () => {
    if (arabicFontFace.startsWith("var(")) {
      return arabicFontFace;
    }
    return `"${arabicFontFace}", serif, var(--font-amiri-quran)`;
  };

  const IconButton = ({ icon: Icon, tooltip, onClick }: any) => (
    <div className="relative group flex items-center justify-center">
      <button
        onClick={onClick}
        className="cursor-pointer p-2 text-[var(--text-secondary)] transition-colors rounded-full bg-[var(--surface-secondary)]"
      >
        <Icon size={20} />
      </button>
      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-[var(--surface-secondary)] text-[var(--text-primary)] text-[12px] px-2 py-1 opacity-0 scale-95 transition-all group-hover:opacity-100 group-hover:scale-100 z-10 hidden md:block">
        {tooltip}
      </span>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col md:flex-row gap-3 md:gap-4 px-4 md:px-5 p-3 md:py-4 border-b border-[var(--border)]/10 transition-colors scroll-mt-24 ${
        isCurrentPlaying ? "bg-(--primary-green)/15 rounded-xl" : ""
      }`}
    >
      {/* Mobile Top */}
      <div className="flex md:hidden items-center justify-between w-full">
        <span className="font-semibold text-[var(--primary-green)]">
          {surahId}:{verseNumber}
        </span>
        <button className="p-2 text-zinc-500 hover:text-[var(--primary-green)] cursor-pointer">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Desktop Left Column */}
      <div className="hidden md:flex flex-col items-center gap-4 w-[50px] shrink-0">
        <span className="font-semibold text-[var(--primary-green)]">
          {surahId}:{verseNumber}
        </span>
        <div className="flex flex-col gap-2">
          <IconButton
            icon={isCurrentPlaying && isPlaying ? Pause : Play}
            tooltip="Play"
            onClick={handlePlayClick}
          />
          <IconButton icon={BookOpen} tooltip="Tafsir" />
          <IconButton icon={Bookmark} tooltip="Bookmark" />
          <IconButton icon={MoreVertical} tooltip="More" />
        </div>
      </div>

      {/* Right Column - Arabic & Translation */}
      <div className="flex-1 flex flex-col gap-4 pt-4 md:pt-6">
        <div
          dir="rtl"
          style={{
            fontSize: `${arabicFontSize}px`,
            fontFamily: getFontFamily(),
            lineHeight: "1.8",
          }}
          className={`text-right pt-10 lg:pt-16 ${
            isCurrentPlaying ? "text-[var(--primary-green)]" : "text-[var(--text-primary)]/70"
          } transition-colors duration-300`}
        >
          {verse.text}
          <span className="inline-flex items-center justify-center relative mx-1 translate-y-[4px]">
             <span className="text-[1.2em] leading-none opacity-90 font-islamic">۝</span>
             <span className="absolute inset-0 flex items-center justify-center text-[0.4em] font-sans font-bold translate-y-[-1px]">
               {toArabicNumber(verseNumber)}
             </span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] md:text-xs font-semibold text-[var(--text-secondary)]/80 uppercase tracking-wider">
            SAHEEH INTERNATIONAL
          </span>
          <div
            style={{ fontSize: `${translationFontSize}px`, lineHeight: "1.6" }}
            className="text-[var(--text-primary)]/80"
          >
            {verse.translation}
          </div>
        </div>
        
        <div className="flex md:hidden gap-4 mt-2">
            <button onClick={handlePlayClick} className="flex items-center gap-2 text-sm text-[var(--primary-green)] font-medium cursor-pointer">
               {isCurrentPlaying && isPlaying ? <Pause size={16}/> : <Play size={16}/>} 
               {isCurrentPlaying && isPlaying ? "Pause" : "Play"}
            </button>
        </div>
      </div>
    </div>
  );
};
