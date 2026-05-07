"use client";

import React, { ReactNode } from "react";
import { SettingsProvider } from "./SettingsContext";

export function Providers({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
