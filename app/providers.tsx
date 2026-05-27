"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode } from "react";
import NotificationListener from "./components/NotificationListener";
import { ModalProvider } from "./components/ModalProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <ModalProvider>
        {children}
        <NotificationListener />
      </ModalProvider>
    </ConvexAuthNextjsProvider>
  );
}
