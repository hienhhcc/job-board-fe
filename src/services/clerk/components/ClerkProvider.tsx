"use client";

import { ReactNode, Suspense } from "react";
import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import useIsDarkMode from "@/hooks/useIsDarkMode";
import { dark } from "@clerk/themes";

export default function ClerkProvider({ children }: { children: ReactNode }) {
  const isDarkMode = useIsDarkMode();

  return (
    <Suspense>
      <OriginalClerkProvider
        appearance={isDarkMode ? { theme: dark } : undefined}
      >
        {children}
      </OriginalClerkProvider>
    </Suspense>
  );
}
