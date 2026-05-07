"use client";

import React, { ReactNode } from "react";
import { SettingsProvider } from "./SettingsContext";
import { AudioProvider } from "../AudioPlayer/AudioContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <AudioProvider>{children}</AudioProvider>
    </SettingsProvider>
  );
}
